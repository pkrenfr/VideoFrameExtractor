import React from 'react';

interface FrameDisplayProps {
  label: string;
  imageSrc: string | null;
}

const FrameDisplay: React.FC<FrameDisplayProps> = ({ label, imageSrc }) => {
  if (!imageSrc) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `${label.replace(/\s+/g, '_').toLowerCase()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-col space-y-3 bg-white p-4 rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-700 uppercase tracking-wider">{label}</h3>
        <button
          onClick={handleDownload}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          Save
        </button>
      </div>
      <div className="relative aspect-video w-full bg-slate-100 rounded-lg overflow-hidden border border-slate-100 group">
        <img
          src={imageSrc}
          alt={label}
          className="w-full h-full object-contain"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300 pointer-events-none" />
      </div>
    </div>
  );
};

export default FrameDisplay;