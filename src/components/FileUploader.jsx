import React, { useRef, useState } from 'react';
import { Upload, Music, X } from 'lucide-react';

const FileUploader = ({ onFileSelect, currentFile, onClearFile }) => {
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = (files) => {
    const file = files[0];
    if (file && file.type.startsWith('audio/')) {
      onFileSelect(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {!currentFile ? (
        <div
          className={`relative overflow-hidden rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 ${
            dragActive
              ? 'bg-white/30 border-white/50 scale-105'
              : 'bg-white/10 border-white/20 hover:bg-white/20'
          } backdrop-blur-md border-2 border-dashed`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={handleClick}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="audio/*"
            onChange={handleInputChange}
            className="hidden"
          />
          
          <div className="flex flex-col items-center space-y-4">
            <div className={`p-4 rounded-full transition-all duration-300 ${
              dragActive ? 'bg-white/30 scale-110' : 'bg-white/20'
            }`}>
              <Upload className="h-8 w-8 text-white" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white">
                {dragActive ? 'Drop your file here' : 'Upload MP3 File'}
              </h3>
              <p className="text-sm text-white/70">
                Drag and drop or click to select
              </p>
              <p className="text-xs text-white/50">
                Supports MP3, WAV, OGG, M4A
              </p>
            </div>
          </div>
          
          {/* Animated background effect */}
          <div className={`absolute inset-0 bg-gradient-to-r from-purple-500/10 to-pink-500/10 transition-opacity duration-300 ${
            dragActive ? 'opacity-100' : 'opacity-0'
          }`} />
        </div>
      ) : (
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-white/20 rounded-full">
              <Music className="h-6 w-6 text-white" />
            </div>
            
            <div className="flex-1 min-w-0">
              <h4 className="text-white font-medium truncate">
                {currentFile.name}
              </h4>
              <p className="text-white/60 text-sm">
                {formatFileSize(currentFile.size)}
              </p>
            </div>
            
            <button
              onClick={onClearFile}
              className="p-2 hover:bg-white/20 rounded-full transition-colors duration-200 group"
              title="Remove file"
            >
              <X className="h-5 w-5 text-white/60 group-hover:text-white transition-colors" />
            </button>
          </div>
          
          <button
            onClick={handleClick}
            className="w-full mt-4 py-2 px-4 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-white text-sm transition-all duration-200 hover:scale-[1.02]"
          >
            Choose Different File
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUploader;
