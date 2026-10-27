import React, { useState } from 'react';
import { X, Play, Code2, Sparkles, Copy, Check, Eye } from 'lucide-react';
import { Clip } from '../types/editor';
import { HYPERFRAME_TEMPLATES } from '../services/hyperframesTemplates';

interface HyperframesEditorModalProps {
  clip: Clip | null;
  isOpen: boolean;
  onClose: () => void;
  onSaveCode: (clipId: string, updatedHtml: string) => void;
}

export const HyperframesEditorModal: React.FC<HyperframesEditorModalProps> = ({
  clip,
  isOpen,
  onClose,
  onSaveCode,
}) => {
  if (!isOpen || !clip) return null;

  const [code, setCode] = useState(clip.properties?.hyperframeCode || '');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'templates'>('editor');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyTemplate = (templateKey: string) => {
    const tmpl = HYPERFRAME_TEMPLATES[templateKey];
    if (tmpl) {
      const generated = tmpl.generateHtml({
        title: 'REVOLUTIONARY AGENT ENGINE',
        subtitle: 'DETERMINISTIC VIDEO COMPUTING',
      });
      setCode(generated);
      setActiveTab('editor');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fadeIn">
      <div className="w-full max-w-5xl h-[80vh] bg-[#10141d] border border-[#2b3345] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="h-14 bg-[#141824] border-b border-[#242b3b] px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-600/20 border border-purple-500/40 text-purple-300 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Hyperframes Studio & Code Inspector
                <span className="text-[10px] bg-purple-500/10 border border-purple-500/30 text-purple-300 px-2 py-0.5 rounded-full font-mono">
                  {clip.name}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                HTML, CSS, GSAP, and Canvas deterministic video rendering
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Tab switch */}
            <div className="flex bg-[#1a1f2b] p-1 rounded-lg border border-[#2c3447]">
              <button
                onClick={() => setActiveTab('editor')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'editor'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Code & Live Preview
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                  activeTab === 'templates'
                    ? 'bg-purple-600 text-white'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Templates
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        {activeTab === 'editor' ? (
          <div className="flex-1 flex overflow-hidden">
            {/* Left: Code Editor */}
            <div className="w-1/2 border-r border-[#242b3b] flex flex-col bg-[#0b0e14]">
              <div className="p-3 bg-[#11151f] border-b border-[#212736] flex items-center justify-between text-xs text-slate-400">
                <span className="font-mono flex items-center gap-1.5 text-purple-300">
                  <Code2 className="w-3.5 h-3.5" />
                  hyperframe-source.html
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 hover:text-white transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy Code'}
                </button>
              </div>

              <textarea
                value={code}
                onChange={e => setCode(e.target.value)}
                spellCheck={false}
                className="flex-1 p-4 bg-transparent font-mono text-xs text-emerald-300 resize-none focus:outline-none leading-relaxed selection:bg-purple-900 selection:text-white"
              />
            </div>

            {/* Right: Real-time Live Sandbox Preview */}
            <div className="w-1/2 flex flex-col bg-[#090b10]">
              <div className="p-3 bg-[#11151f] border-b border-[#212736] flex items-center justify-between text-xs text-slate-400">
                <span className="font-medium flex items-center gap-1.5 text-slate-300">
                  <Eye className="w-3.5 h-3.5 text-blue-400" />
                  Deterministic Live Preview
                </span>
                <span className="text-[10px] text-slate-500 font-mono">1080p Viewport</span>
              </div>

              <div className="flex-1 p-6 flex items-center justify-center">
                <div className="w-full aspect-video bg-black/90 rounded-xl overflow-hidden border border-[#2d3547] shadow-2xl relative">
                  <iframe
                    title="Hyperframe Sandbox"
                    srcDoc={code}
                    className="w-full h-full border-0 bg-transparent"
                    sandbox="allow-scripts"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Templates Gallery */
          <div className="flex-1 p-6 overflow-y-auto grid grid-cols-2 gap-4">
            {Object.values(HYPERFRAME_TEMPLATES).map(tmpl => (
              <div
                key={tmpl.id}
                className="bg-[#141824] border border-[#283144] hover:border-purple-500/60 rounded-xl p-4 flex flex-col justify-between transition-all group"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <h4 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                      {tmpl.name}
                    </h4>
                    <span className="text-[10px] font-mono bg-purple-500/10 text-purple-300 px-2 py-0.5 rounded uppercase">
                      {tmpl.category}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">{tmpl.description}</p>
                </div>

                <button
                  onClick={() => handleApplyTemplate(tmpl.id)}
                  className="w-full py-2 rounded-lg bg-[#1f2537] hover:bg-purple-600 text-slate-200 hover:text-white text-xs font-semibold transition-colors"
                >
                  Use Template in Current Clip
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="h-14 bg-[#141824] border-t border-[#242b3b] px-6 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Changes in Hyperframes code update the timeline overlay instantly.
          </span>
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-medium text-slate-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSaveCode(clip.id, code);
                onClose();
              }}
              className="px-5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/30 transition-transform active:scale-95"
            >
              Save & Apply
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
