import React, { useState, useCallback } from 'react';
import DropZone from './components/DropZone';
import FrameDisplay from './components/FrameDisplay';
import { extractFramesFromVideo, formatBytes, formatDuration } from './utils/videoUtils';
import { FrameData, ProcessStatus, VideoMetadata } from './types';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessStatus>(ProcessStatus.IDLE);
  const [frames, setFrames] = useState<FrameData | null>(null);
  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setStatus(ProcessStatus.PROCESSING);
    setError(null);
    setFrames(null);
    setMetadata(null);

    try {
      const result = await extractFramesFromVideo(file);
      setFrames(result.frames);
      setMetadata(result.metadata);
      setStatus(ProcessStatus.SUCCESS);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to process video. Please try another file.');
      setStatus(ProcessStatus.ERROR);
    }
  }, []);

  const handleReset = () => {
    setStatus(ProcessStatus.IDLE);
    setFrames(null);
    setMetadata(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Video Frame Extractor
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Extract the first and last frames from your video instantly. All processing happens locally in your browser.
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 overflow-hidden border border-slate-100">
          <div className="p-6 sm:p-10">
            
            {/* Initial State: Upload */}
            {status === ProcessStatus.IDLE && (
              <div className="space-y-6">
                <DropZone onFileSelect={handleFileSelect} />
              </div>
            )}

            {/* Processing State */}
            {status === ProcessStatus.PROCESSING && (
              <div className="flex flex-col items-center justify-center py-16 space-y-4 animate-pulse">
                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-lg font-medium text-slate-600">Processing video...</p>
                <p className="text-sm text-slate-400">Extracting frames usually takes a few seconds.</p>
              </div>
            )}

            {/* Error State */}
            {status === ProcessStatus.ERROR && (
              <div className="text-center py-10 space-y-4">
                <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-slate-900">Something went wrong</h3>
                <p className="text-slate-500">{error}</p>
                <button
                  onClick={handleReset}
                  className="mt-4 px-6 py-2 bg-slate-100 text-slate-700 font-medium rounded-full hover:bg-slate-200 transition-colors"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Success State: Results */}
            {status === ProcessStatus.SUCCESS && frames && metadata && (
              <div className="space-y-8">
                {/* Metadata Bar */}
                <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-900 truncate max-w-[200px] sm:max-w-xs" title={metadata.name}>
                        {metadata.name}
                      </p>
                      <p className="text-xs text-slate-500">
                        {formatDuration(metadata.duration)} • {formatBytes(metadata.size)} • {metadata.width}x{metadata.height}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 bg-white border border-indigo-100 rounded-lg hover:bg-indigo-50 transition-colors shadow-sm"
                  >
                    Process Another
                  </button>
                </div>

                {/* Frames Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FrameDisplay label="First Frame" imageSrc={frames.firstFrame} />
                  <FrameDisplay label="Last Frame" imageSrc={frames.lastFrame} />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-slate-400">
          <p>© {new Date().getFullYear()} Video Frame Extractor</p>
        </div>
      </div>
    </div>
  );
};

export default App;