import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { UploadCloud, FileText, Image as ImageIcon, Type, User } from 'lucide-react';

const Upload = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    description: '',
  });
  const [pdfFile, setPdfFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile || !formData.title || !formData.author) {
      alert("Title, Author, and PDF File are required.");
      return;
    }
    
    setLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('author', formData.author);
    data.append('description', formData.description);
    data.append('pdf_file', pdfFile);
    if (coverImage) {
      data.append('cover_image', coverImage);
    }

    try {
      await api.post('books/', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      navigate('/');
    } catch (error) {
      console.error(error);
      alert('Upload failed. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white text-center">
          <UploadCloud size={48} className="mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-bold">Upload a Book</h2>
          <p className="mt-2 text-green-100">Share knowledge with the community</p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><Type size={16} className="mr-2" /> Title</label>
                <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" placeholder="e.g. Sapiens" />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><User size={16} className="mr-2" /> Author</label>
                <input type="text" required value={formData.author} onChange={e => setFormData({...formData, author: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" placeholder="e.g. Yuval Noah Harari" />
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><FileText size={16} className="mr-2" /> PDF File</label>
                <input type="file" accept=".pdf" required onChange={e => setPdfFile(e.target.files[0])} className="w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100 cursor-pointer" />
              </div>
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-1"><ImageIcon size={16} className="mr-2" /> Cover Image (Optional)</label>
                <input type="file" accept="image/*" onChange={e => setCoverImage(e.target.files[0])} className="w-full px-4 py-2 border rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gray-50 file:text-gray-700 hover:file:bg-gray-100 cursor-pointer" />
              </div>
            </div>
          </div>
          
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">Description / Synthesis</label>
            <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-green-500 focus:border-green-500" placeholder="What is this book about? Why should people read/listen to it?"></textarea>
          </div>

          <button type="submit" disabled={loading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition transform hover:-translate-y-0.5 disabled:opacity-70 disabled:hover:translate-y-0">
            {loading ? 'Uploading & Processing...' : 'Upload Book'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Upload;
