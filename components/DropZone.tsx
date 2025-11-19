import React, { useState, useRef } from 'react';

interface DropZoneProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
}

const DropZone: React.FC<DropZoneProps> = ({ onFileSelect, disabled = false }) => {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      validateAndPassFile(files[0]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      validateAndPassFile(files[0]);
    }
  };

  const validateAndPassFile = (file: File) => {
    if (!file.type.startsWith('video/')) {
      alert('Please upload a valid video file.');
      return;
    }
    // Soft limit warning (e.g., 500MB)
    const LIMIT_MB = 500;
    if (file.size > LIMIT_MB * 1024 * 1024) {
       if (!window.confirm(`This file is larger than ${LIMIT_MB}MB. Processing might be slow or crash the browser. Continue?`)) {
         return;
       }
    }
    onFileSelect(file);
  };

  const triggerFileSelect = () => {
    if (inputRef.current && !disabled) {
      inputRef.current.click();
    }
  };

  return (
    <div
      onClick={triggerFileSelect}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`
        relative group cursor-pointer
        flex flex-col items-center justify-center
        w-full h-64 rounded-2xl border-2 border-dashed transition-all duration-300
        ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50 scale-[1.01]'
            : 'border-slate-300 bg-white hover:border-indigo-400 hover:bg-slate-50'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleInputChange}
        disabled={disabled}
      />
      
      <div className="flex flex-col items-center space-y-4 text-center p-6">
        <div className={`p-4 rounded-full ${isDragging ? 'bg-indigo-100' : 'bg-slate-100 group-hover:bg-indigo-50'} transition-colors`}>
          <svg
            className={`w-10 h-10 ${isDragging ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-500'}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <div>
          <p className="text-lg font-semibold text-slate-700">
            {isDragging ? 'Drop video now' : 'Click or drag video here'}
          </p>
          <p className="text-sm text-slate-500 mt-1">
            Supported formats: MP4, WEBM, MOV
          </p>
          <p className="text-xs text-slate-400 mt-2">
            Max recommended size: 500MB
          </p>
        </div>
      </div>
    </div>
  );
};

export default DropZone;