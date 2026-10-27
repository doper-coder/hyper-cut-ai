import React from 'react';
import { 
  Sparkles, 
  Download, 
  Monitor, 
  Smartphone, 
  FolderPlus, 
  RotateCcw,
  Code2
} from 'lucide-react';
import { EditorState } from '../types/editor';
import { formatTimecode } from '../utils/time';

interface NavbarProps {
  state: EditorState;
  onUpdateState: (partial: Partial<EditorState>) => void;
  onExportClick: () => void;
  onLoadSample: () => void;
  onOpenHyperframesStudio: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  state,
  onUpdateState,
  onExportClick,
  onLoadSample,
  onOpenHyperframesStudio,
}) => {
  return (
    <header className="h-14 bg-[#11141a] border-b border-[#232834] px-4 flex items-center justify-between z-20">
      {/* Brand & Project */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Sparkles className="w-4 h-4 text-white" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm tracking-wide bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              HYPER-CUT AI
            </span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 font-semibold">
              Hyperframes Engine
            </span>
          </div>
          <p className="text-[11px] text-slate-400">Minimal Agentic Video Editor</p>
        </div>
      </div>

      {/* Middle: Aspect Ratio & Timecode Status */}
      <div className="flex items-center gap-4">
        {/* Aspect Ratio Selector */}
        <div className="flex items-center bg-[#1a1d26] p-1 rounded-lg border border-[#2a3040]">
          <button
            onClick={() => onUpdateState({ aspectRatio: '16:9' })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              state.aspectRatio === '16:9'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="16:9 Landscape (YouTube, Desktop)"
          >
            <Monitor className="w-3.5 h-3.5" />
            16:9
          </button>
          <button
            onClick={() => onUpdateState({ aspectRatio: '9:16' })}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
              state.aspectRatio === '9:16'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
            title="9:16 Portrait (TikTok, Shorts, Reels)"
          >
            <Smartphone className="w-3.5 h-3.5" />
            9:16
          </button>
        </div>

        {/* Global Timecode Display */}
        <div className="font-mono text-xs px-3 py-1.5 bg-[#171b24] rounded-lg border border-[#262c3b] flex items-center gap-2">
          <span className="text-blue-400 font-bold">
            {formatTimecode(state.currentTime, state.fps)}
          </span>
          <span className="text-slate-600">/</span>
          <span className="text-slate-400">
            {formatTimecode(state.duration, state.fps)}
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenHyperframesStudio}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1d222e] hover:bg-[#252c3c] text-slate-300 hover:text-white border border-[#2e3648] transition-colors"
          title="Open Hyperframes Visual & Code Templates"
        >
          <Code2 className="w-3.5 h-3.5 text-purple-400" />
          Hyperframes Studio
        </button>

        <button
          onClick={onLoadSample}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a1e28] hover:bg-[#222836] text-slate-300 hover:text-white border border-[#2a3142] transition-colors"
          title="Reset or load sample project demo"
        >
          <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
          Load Demo
        </button>

        <button
          onClick={onExportClick}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/25 transition-all active:scale-95"
        >
          <Download className="w-3.5 h-3.5" />
          Export Video
        </button>
      </div>
    </header>
  );
};
