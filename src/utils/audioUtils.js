```javascript
/**
 * Audio utility functions for the glassmorphism MP3 player
 */

/**
 * Format time in seconds to MM:SS format
 * @param {number} seconds - Time in seconds
 * @returns {string} Formatted time string
 */
export const formatTime = (seconds) => {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

/**
 * Create audio context for visualizer
 * @returns {AudioContext|null} Audio context or null if not supported
 */
export const createAudioContext = () => {
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    return new AudioContextClass();
  } catch (error) {
    console.warn('Web Audio API not supported:', error);
    return null;
  }
};

/**
 * Setup audio analyzer for visualizer
 * @param {AudioContext} audioContext - Audio context
 * @param {HTMLAudioElement} audioElement - Audio element
 * @returns {Object} Analyzer node and data array
 */
export const setupAudioAnalyzer = (audioContext, audioElement) => {
  try {
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaElementSource(audioElement);
    
    analyser.fftSize = 256;
    analyser.smoothingTimeConstant = 0.8;
    
    source.connect(analyser);
    analyser.connect(audioContext.destination);
    
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    return { analyser, dataArray, bufferLength };
  } catch (error) {
    console.error('Failed to setup audio analyzer:', error);
    return null;
  }
};

/**
 * Get frequency data for visualizer
 * @param {AnalyserNode} analyser - Audio analyzer node
 * @param {Uint8Array} dataArray - Data array for frequency data
 * @returns {Uint8Array} Frequency data
 */
export const getFrequencyData = (analyser, dataArray) => {
  if (!analyser || !dataArray) return new Uint8Array(0);
  
  analyser.getByteFrequencyData(dataArray);
  return dataArray;
};

/**
 * Extract metadata from audio file
 * @param {File} file - Audio file
 * @returns {Promise<Object>} Promise resolving to metadata object
 */
export const extractMetadata = (file) => {
  return new Promise((resolve) => {
    const audio = new Audio();
    const url = URL.createObjectURL(file);
    
    audio.addEventListener('loadedmetadata', () => {
      const metadata = {
        title: file.name.replace(/\.[^/.]+$/, ""),
        duration: audio.duration,
        size: file.size,
        type: file.type,
        fileName: file.name
      };
      
      URL.revokeObjectURL(url);
      resolve(metadata);
    });
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      resolve({
        title: file.name.replace(/\.[^/.]+$/, ""),
        duration: 0,
        size: file.size,
        type: file.type,
        fileName: file.name
      });
    });
    
    audio.src = url;
  });
};

/**
 * Validate if file is a supported audio format
 * @param {File} file - File to validate
 * @returns {boolean} True if file is supported audio format
 */
export const isValidAudioFile = (file) => {
  const supportedTypes = [
    'audio/mpeg',
    'audio/mp3',
    'audio/wav',
    'audio/ogg',
    'audio/aac',
    'audio/m4a',
    'audio/webm'
  ];
  
  return supportedTypes.includes(file.type) || 
         file.name.match(/\.(mp3|wav|ogg|aac|m4a|webm)$/i);
};

/**
 * Calculate audio progress percentage
 * @param {number} currentTime - Current playback time
 * @param {number} duration - Total duration
 * @returns {number} Progress percentage (0-100)
 */
export const calculateProgress = (currentTime, duration) => {
  if (!duration || duration === 0) return 0;
  return Math.min((currentTime / duration) * 100, 100);
};

/**
 * Convert progress percentage to time
 * @param {number} percentage - Progress percentage (0-100)
 * @param {number} duration - Total duration in seconds
 * @returns {number} Time in seconds
 */
export const progressToTime = (percentage, duration) => {
  if (!duration) return 0;
  return (percentage / 100) * duration;
};

/**
 * Generate visualizer bars data from frequency data
 * @param {Uint8Array} frequencyData - Frequency data array
 * @param {number} barCount - Number of bars to generate
 * @returns {Array<number>} Array of normalized bar heights (0-1)
 */
export const generateVisualizerBars = (frequencyData, barCount = 32) => {
  if (!frequencyData || frequencyData.length === 0) {
    return new Array(barCount).fill(0);
  }
  
  const bars = [];
  const dataLength = frequencyData.length;
  const groupSize = Math.floor(dataLength / barCount);
  
  for (let i = 0; i < barCount; i++) {
    let sum = 0;
    const start = i * groupSize;
    const end = Math.min(start + groupSize, dataLength);
    
    for (let j = start; j < end; j++) {
      sum += frequencyData[j];
    }
    
    const average = sum / (end - start);
    bars.push(average / 255); // Normalize to 0-1
  }
  
  return bars;
};

/**
 * Resume audio context (required for some browsers)
 * @param {AudioContext} audioContext - Audio context to resume
 */
export const resumeAudioContext = async (audioContext) => {
  if (audioContext && audioContext.state === 'suspended') {
    try {
      await audioContext.resume();
    } catch (error) {
      console.warn('Failed to resume audio context:', error);
    }
  }
};

/**
 * Format file size to human readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Debounce function for performance optimization
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
```