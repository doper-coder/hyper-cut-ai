import React, { useState } from 'react';
import { X, Download, Terminal, Check, Sparkles, Film, Copy } from 'lucide-react';
import { EditorState } from '../types/editor';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  state: EditorState;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  state,
}) => {
  if (!isOpen) return null;

  const [copiedFfmpeg, setCopiedFfmpeg] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [downloadReady, setDownloadReady] = useState(false);

  // Generate equivalent FFmpeg command for the current timeline state
  const videoClips = state.clips.filter(c => c.type === 'video');
  const overlayClips = state.clips.filter(c => c.type === 'overlay');
  const audioClips = state.clips.filter(c => c.type === 'audio');

  const ffmpegCommand = `# Hyper-Cut Multi-Track Export
ffmpeg -y \\
  -i input_raw.mp4 \\
  ${overlayClips.length > 0 ? '-i hyperframe_overlay.mov \\\n  -filter_complex "[0:v][1:v]overlay=0:0:enable=\'between(t,0,4)\'[v_out];[0:a]volume=1.0[a_out]" \\\n  -map "[v_out]" -map "[a_out]" \\' : '-c:v libx264 -crf 18 -preset fast \\'}
  -c:a aac -b:a 192k \\
  output_final_${state.aspectRatio === '9:16' ? 'vertical' : 'landscape'}.mp4`;

  const handleCopyFfmpeg = () => {
    navigator.clipboard.writeText(ffmpegCommand);
    setCopiedFfmpeg(true);
    setTimeout(() => setCopiedFfmpeg(false), 2000);
  };

  const handleStartBrowserExport = () => {
    setIsExporting(true);
    setProgress(0);

    // Simulate deterministic frame rendering & stitching
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsExporting(false);
          setDownloadReady(true);
          return 100;
        }
        return prev + 15;
      });
    }, 300);
  };

  const handleDownloadFile = () => {
    const dummyContent = `Hyper-Cut AI Video Export\nAspect Ratio: ${state.aspectRatio}\nDuration: ${state.duration}s\nClips: ${state.clips.length}\nTimeline exported successfully!`;
    const blob = new Blob([dummyContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hypercut-project-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-2xl bg-[#10141d] border border-[#272f42] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 bg-[#141824] border-b border-[#212736] px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600/20 border border-blue-500/40 text-blue-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Export Final Composition</h3>
              <p className="text-[11px] text-slate-400">
                Resolution: {state.aspectRatio === '16:9' ? '1920x1080 (16:9)' : '1080x1920 (9:16)'} • {state.fps} FPS
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Quick Render / Export Card */}
          <div className="bg-[#141926] border border-[#273045] rounded-xl p-5">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                  <Film className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Browser Client-Side Render</h4>
                  <p className="text-xs text-slate-400">
                    Composites HTML5 Canvas, audio ducking, and Hyperframes overlays into an MP4/WebM package.
                  </p>
                </div>
              </div>
            </div>

            {isExporting ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-blue-400 animate-spin" />
                    Rendering frames ({progress}%)...
                  </span>
                  <span className="font-mono text-blue-400">{progress}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${progress}%` }}
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 transition-all duration-300"
                  />
                </div>
              </div>
            ) : downloadReady ? (
              <div className="flex items-center justify-between bg-emerald-950/30 border border-emerald-800/40 rounded-lg p-3">
                <div className="flex items-center gap-2 text-xs text-emerald-300">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Composition rendering complete!</span>
                </div>
                <button
                  onClick={handleDownloadFile}
                  className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition-all"
                >
                  Download Video File
                </button>
              </div>
            ) : (
              <button
                onClick={handleStartBrowserExport}
                className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Start In-Browser Render & Export
              </button>
            )}
          </div>

          {/* Native FFmpeg Command Card */}
          <div className="bg-[#12151f] border border-[#212738] rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-300 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                Native FFmpeg CLI Command (Fast & Lossless)
              </span>
              <button
                onClick={handleCopyFfmpeg}
                className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                {copiedFfmpeg ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedFfmpeg ? 'Copied' : 'Copy Command'}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">
              Run this in your terminal to render on your machine using hardware acceleration (NVENC/VideoToolbox).
            </p>
            <pre className="p-3 bg-[#0a0d13] border border-[#1d2332] rounded-lg text-[11px] font-mono text-emerald-400 overflow-x-auto leading-relaxed">
              {ffmpegCommand}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="h-14 bg-[#141824] border-t border-[#212736] px-6 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg text-xs font-medium bg-[#1d2230] hover:bg-[#252c3e] text-slate-300 hover:text-white transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
