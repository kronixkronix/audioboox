import localforage from 'localforage';

localforage.config({ name: 'AudioBlinkDB' });

export const saveAudioChunk = async (bookId, index, blob) => {
  try {
    await localforage.setItem(`audio_${bookId}_${index}`, blob);
  } catch (e) {
    console.error("Error saving audio chunk", e);
  }
};

export const getAudioChunk = async (bookId, index) => {
  try {
    return await localforage.getItem(`audio_${bookId}_${index}`);
  } catch (e) {
    console.error("Error reading audio chunk", e);
    return null;
  }
};

export const saveBookMeta = async (bookId, meta) => {
  await localforage.setItem(`bookmeta_${bookId}`, meta);
};

export const getBookMeta = async (bookId) => {
  return await localforage.getItem(`bookmeta_${bookId}`);
};

/**
 * Download ALL audio chunks for a book into IndexedDB.
 * @param {string|number} bookId
 * @param {number} totalBlocks - total number of paragraphs
 * @param {string} voice - edge-tts voice id
 * @param {Function} onProgress - (downloaded, total) => void
 * @param {Function} fetchChunk - async (index) => Blob   (calls backend)
 */
export const downloadEntireBook = async (bookId, totalBlocks, voice, onProgress, fetchChunk) => {
  for (let i = 0; i < totalBlocks; i++) {
    const existing = await getAudioChunk(bookId, `${i}_${voice}`);
    if (!existing) {
      try {
        const blob = await fetchChunk(i);
        if (blob) await saveAudioChunk(bookId, `${i}_${voice}`, blob);
      } catch (e) {
        console.warn(`Failed chunk ${i}`, e);
      }
    }
    if (onProgress) onProgress(i + 1, totalBlocks);
  }
};

export const isBookFullyDownloaded = async (bookId, totalBlocks, voice) => {
  for (let i = 0; i < totalBlocks; i++) {
    const chunk = await localforage.getItem(`audio_${bookId}_${i}_${voice}`);
    if (!chunk) return false;
  }
  return true;
};
