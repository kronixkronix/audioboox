import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { Play, Pause, ArrowLeft, Volume2, FastForward, Rewind, DownloadCloud } from 'lucide-react';
import { saveAudioChunk, getAudioChunk } from '../utils/db';
import classNames from 'classnames';

const EDGE_VOICES = [
  { id: 'en-US-AriaNeural', label: 'US Aria (Female)' },
  { id: 'en-US-GuyNeural', label: 'US Guy (Male)' },
  { id: 'en-GB-SoniaNeural', label: 'UK Sonia (Female)' },
  { id: 'en-GB-RyanNeural', label: 'UK Ryan (Male)' },
  { id: 'en-AU-WilliamNeural', label: 'AU William (Male)' },
];

const Listen = () => {
  const { id } = useParams();
  const [book, setBook] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeParagraphIndex, setActiveParagraphIndex] = useState(0);
  const [voice, setVoice] = useState(EDGE_VOICES[0].id);
  const [generating, setGenerating] = useState(false);
  
  const audioRef = useRef(null);
  const currentBlobUrl = useRef(null);
  const blockRefs = useRef({});
  const preloadingRef = useRef(new Set()); // tracks in-flight preloads

  useEffect(() => {
    fetchBook();
    return () => {
        if(currentBlobUrl.current) URL.revokeObjectURL(currentBlobUrl.current);
    }
  }, [id]);

  useEffect(() => {
    if (activeParagraphIndex !== null && blockRefs.current[activeParagraphIndex]) {
      blockRefs.current[activeParagraphIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeParagraphIndex]);

  const fetchBook = async () => {
    try {
      const response = await api.get(`books/${id}/`);
      setBook(response.data);
    } catch (error) {
      console.error('Error fetching book:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOrFetchAudio = async (index) => {
    // 1. Check offline DB
    let blob = await getAudioChunk(id, `${index}_${voice}`);
    if (blob) return blob;

    // 2. Fetch from backend
    try {
        const response = await api.post(`books/${id}/tts/`, { index, voice }, { responseType: 'blob' });
        blob = response.data;
        await saveAudioChunk(id, `${index}_${voice}`, blob);
        return blob;
    } catch (error) {
        console.error("Failed to fetch audio", error);
        return null;
    }
  };

  const playParagraph = async (index) => {
    if (index >= book.extracted_text.length) {
       setIsPlaying(false);
       setActiveParagraphIndex(0); // Finished book
       return;
    }

    setGenerating(true);
    setActiveParagraphIndex(index);
    const blob = await getOrFetchAudio(index);
    setGenerating(false);

    if (blob && audioRef.current) {
        if (currentBlobUrl.current) URL.revokeObjectURL(currentBlobUrl.current);
        const url = URL.createObjectURL(blob);
        currentBlobUrl.current = url;
        audioRef.current.src = url;
        audioRef.current.play();
        setIsPlaying(true);

        // Preload next paragraph in the background
        const nextIndex = index + 1;
        if (nextIndex < book.extracted_text.length && !preloadingRef.current.has(nextIndex)) {
          preloadingRef.current.add(nextIndex);
          getOrFetchAudio(nextIndex).finally(() => {
            preloadingRef.current.delete(nextIndex);
          });
        }
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current?.src || audioRef.current.src.endsWith('undefined')) {
          playParagraph(activeParagraphIndex);
      } else {
          audioRef.current.play();
          setIsPlaying(true);
      }
    }
  };

  const downloadAllOffline = async () => {
      alert("Downloading all audio offline in background... You can listen smoothly now.");
      // Fire and forget caching loop
      for(let i=0; i < book.extracted_text.length; i++) {
          await getOrFetchAudio(i);
      }
      alert("Offline Download Complete!");
  };

  const nextParagraph = () => playParagraph(activeParagraphIndex + 1);
  const prevParagraph = () => playParagraph(Math.max(0, activeParagraphIndex - 1));

  if (loading) return <div className="text-center py-20 text-green-600 animate-pulse font-medium">Loading Player...</div>;
  if (!book) return <div className="text-center py-20 text-gray-500">Book not found.</div>;

  const textBlocks = Array.isArray(book.extracted_text) ? book.extracted_text : [];

  return (
    <div className="flex flex-col min-h-screen bg-primary transition-colors duration-300 pb-32 pt-16">
      
      {/* Top Header */}
      <div className="fixed top-16 left-0 w-full glass-panel border-b z-40 px-4 py-3">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to={`/book/${id}`} className="text-secondary hover:text-green-600 transition flex items-center bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full text-sm font-medium">
            <ArrowLeft className="mr-1.5" size={16} /> details
          </Link>
          <div className="font-semibold text-primary tracking-wide text-center flex-1 mx-4 truncate">{book.title}</div>
          <div className="flex items-center space-x-2">
             <select 
                title="Select Voice"
                value={voice} 
                onChange={(e) => { setVoice(e.target.value); if(isPlaying) playParagraph(activeParagraphIndex); }}
                className="bg-transparent border border-gray-300 dark:border-gray-700 text-sm rounded-lg px-2 py-1 text-primary focus:ring-green-500 focus:border-green-500"
             >
                {EDGE_VOICES.map(v => <option key={v.id} value={v.id}>{v.label}</option>)}
             </select>
          </div>
        </div>
      </div>

      {/* Structured Text Reader */}
      <div className="flex-1 max-w-3xl mx-auto px-6 py-6 w-full">
        <div className="flex justify-end mb-8">
            <button onClick={downloadAllOffline} className="flex items-center text-xs font-semibold px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-full hover:bg-blue-100 transition">
                <DownloadCloud size={14} className="mr-1.5" /> Save Offline
            </button>
        </div>

        {textBlocks.length > 0 ? textBlocks.map((block, idx) => (
            <div 
                key={idx} 
                ref={el => blockRefs.current[idx] = el}
                onClick={() => playParagraph(idx)}
                className={classNames(
                    "mb-6 p-4 rounded-xl cursor-pointer transition-all duration-300 transform",
                    "text-lg leading-relaxed font-serif",
                    activeParagraphIndex === idx 
                        ? "bg-green-100 dark:bg-green-900/40 text-green-900 dark:text-green-100 scale-100 shadow-sm border border-green-200 dark:border-green-800/50" 
                        : "text-secondary hover:bg-gray-50 dark:hover:bg-gray-800/50 border border-transparent scale-[0.99] hover:scale-100"
                )}
            >
                {block.text}
            </div>
          )) : (
            <p className="italic text-gray-500 text-center py-20 bg-gray-100 dark:bg-gray-800 rounded-lg">No text was structured for this book. Please re-upload PDF.</p>
        )}
      </div>

      {/* Floating Audio Controller */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-lg glass-panel rounded-full shadow-2xl p-2 z-50">
        <div className="flex items-center justify-between px-6 py-1">
          <button onClick={prevParagraph} disabled={activeParagraphIndex === 0} className="text-secondary hover:text-primary transition disabled:opacity-30"><Rewind size={24} /></button>
          
          <button 
            onClick={togglePlay} 
            disabled={generating}
            className="w-16 h-16 bg-gradient-to-tr from-green-600 to-green-500 hover:scale-105 rounded-full flex items-center justify-center text-white shadow-xl shadow-green-600/40 transition transform disabled:opacity-50 disabled:hover:scale-100"
          >
            {generating ? (
              <div className="animate-spin rounded-full w-6 h-6 border-2 border-white/30 border-t-white" />
            ) : isPlaying ? <Pause size={28} /> : <Play size={28} className="translate-x-0.5" />}
          </button>
          
          <button onClick={nextParagraph} disabled={activeParagraphIndex >= textBlocks.length - 1} className="text-secondary hover:text-primary transition disabled:opacity-30"><FastForward size={24} /></button>
        </div>
        {/* Progress Bar visual indicator (optional) */}
        <div className="absolute -top-1 left-0 w-full h-1 bg-gray-200 dark:bg-gray-800 rounded-t-full overflow-hidden">
            <div className="h-full bg-green-500 transition-all duration-300" style={{ width: `${(activeParagraphIndex / Math.max(1, textBlocks.length - 1)) * 100}%` }}></div>
        </div>
        <audio 
          ref={audioRef} 
          onEnded={nextParagraph} 
        />
      </div>
    </div>
  );
};

export default Listen;
