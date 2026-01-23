import React, { useEffect, useRef } from 'react';

interface DebugConsoleProps {
  logs: string[];
  isOpen: boolean;
  onToggle: () => void;
}

export const DebugConsole: React.FC<DebugConsoleProps> = ({ logs, isOpen, onToggle }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current && isOpen) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, isOpen]);

  if (logs.length === 0) return null;

  return (
    <div className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-y-0' : 'translate-y-[calc(100%-2.5rem)]'}`}>
      {/* Header / Toggle Handle */}
      <div 
        onClick={onToggle}
        className="bg-slate-800 text-slate-300 px-4 py-2 cursor-pointer flex justify-between items-center border-t border-slate-700 hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-2">
            <span className={`transform transition-transform ${isOpen ? 'rotate-180' : ''}`}>
                ▼
            </span>
            <span className="font-mono text-sm font-semibold">Debug Console</span>
            <span className="text-xs bg-slate-900 px-2 py-0.5 rounded-full text-slate-400">{logs.length}</span>
        </div>
        <div className="text-xs text-slate-500">
            {isOpen ? 'Click to collapse' : 'Click to expand'}
        </div>
      </div>

      {/* Log Content */}
      <div 
        ref={scrollRef}
        className="bg-slate-950 text-green-500 font-mono text-xs p-4 h-64 overflow-y-auto shadow-inner"
      >
        <div className="space-y-1">
          {logs.map((log, i) => (
            <div key={i} className="break-words border-l-2 border-slate-800 pl-2 hover:bg-slate-900/50">
              <span className="text-slate-600 select-none mr-2">
                {String(i + 1).padStart(3, '0')}
              </span>
              {log}
            </div>
          ))}
          {logs.length === 0 && <span className="text-slate-700 italic">Waiting for logs...</span>}
        </div>
      </div>
    </div>
  );
};
