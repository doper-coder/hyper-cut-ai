import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Code2, 
  Wand2, 
  Crosshair,
  X,
  ArrowDownRight,
  EyeOff,
  Target
} from 'lucide-react';
import { ChatMessage, Clip, EditorState } from '../types/editor';
import { executePromptCommand } from '../services/aiActionEngine';

interface AIPanelProps {
  state: EditorState;
  onUpdateState: (partial: Partial<EditorState>) => void;
  onOpenClipCode: (clip: Clip) => void;
  promptToExecute?: string | null;
  onClearPromptTrigger?: () => void;
}

export const AIPanel: React.FC<AIPanelProps> = ({
  state,
  onUpdateState,
  onOpenClipCode,
  promptToExecute,
  onClearPromptTrigger,
}) => {
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      sender: 'ai',
      text: "👋 Welcome to your AI Video Agent! You can direct me in plain English to edit the timeline, cut silence, generate captions, or craft animated graphics via Hyperframes. You can also circle any area on the preview canvas to target it!",
      timestamp: 'Just now',
      appliedActions: [
        'Initialized NLE timeline engine',
        'Connected Hyperframes deterministic graphics renderer',
        'Enabled Spatial Canvas Circling / Annotation tracker',
      ],
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle external trigger (e.g. from canvas popup)
  useEffect(() => {
    if (promptToExecute) {
      handleSendPrompt(promptToExecute);
      onClearPromptTrigger?.();
    }
  }, [promptToExecute]);

  const handleSendPrompt = (promptText?: string) => {
    const text = promptText || input;
    if (!text.trim() || isProcessing) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsProcessing(true);

    // Simulate agentic chain of thought & execution
    setTimeout(() => {
      const result = executePromptCommand(text, state);

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: result.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        appliedActions: result.appliedActions,
        hyperframePreview: result.hyperframePreview,
        clipIdCreated: result.selectedClipId || undefined,
      };

      setMessages(prev => [...prev, aiMsg]);
      setIsProcessing(false);

      if (result.success) {
        onUpdateState({
          clips: result.newClips || state.clips,
          tracks: result.newTracks || state.tracks,
          selectedClipId: result.selectedClipId !== undefined ? result.selectedClipId : state.selectedClipId,
          activeAnnotation: null, // Clear active annotation once handled
        });
      }
    }, 450);
  };

  const quickPrompts = [
    { label: '✂️ Cut Silence (03s - 07s)', prompt: 'Cut silence between 3 and 7' },
    { label: '✨ Kinetic Title (Hyperframes)', prompt: 'Add kinetic title "THE FUTURE OF AI" with Hyperframes' },
    { label: '🏷️ Lower Third Presenter', prompt: 'Add lower third "Alex Rivera" "AI Systems Lead"' },
    { label: '💬 Auto-Generate Subtitles', prompt: 'Auto-generate captions and sync to speech' },
    { label: '🔔 Subscribe & Bell CTA', prompt: 'Add animated subscribe and bell CTA badge' },
    { label: '🎵 Add BGM & Auto-Duck', prompt: 'Add background music with 25% vocal ducking' },
    { label: '⚡ Split at Playhead', prompt: 'Split clip at playhead' },
  ];

  return (
    <div className="w-80 md:w-96 bg-[#10141d] border-l border-[#222837] flex flex-col h-full z-10 shadow-xl">
      {/* Header */}
      <div className="p-3.5 border-b border-[#202636] bg-[#121622] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-blue-500 to-purple-600 flex items-center justify-center shadow-sm">
            <Wand2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-white tracking-wide flex items-center gap-1.5">
              AI PROMPTING PANEL
            </h2>
            <p className="text-[10px] text-slate-400">Natural Language Video Directing</p>
          </div>
        </div>
        <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Agent Ready
        </span>
      </div>

      {/* Quick Prompts Carousel / Chips */}
      <div className="p-2.5 bg-[#0d1017] border-b border-[#1b202c]">
        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
          <span>Quick Commands</span>
          <span className="text-[9px] text-slate-500">1-Click</span>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-none">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSendPrompt(qp.prompt)}
              className="text-[10.5px] px-2.5 py-1 rounded-md bg-[#191e2b] hover:bg-[#252d40] text-slate-300 hover:text-white border border-[#273042] transition-all hover:scale-[1.02] active:scale-95 text-left"
            >
              {qp.label}
            </button>
          ))}
        </div>
      </div>

      {/* Messages Stream */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[90%] rounded-xl p-3 text-xs leading-relaxed ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-br-sm shadow-md'
                  : 'bg-[#181d29] text-slate-200 border border-[#272f42] rounded-bl-sm'
              }`}
            >
              <div className="flex items-center justify-between gap-3 mb-1">
                <span className="font-semibold text-[10px] text-slate-400">
                  {msg.sender === 'user' ? 'You' : 'AI Editor Agent'}
                </span>
                <span className="text-[9px] text-slate-500">{msg.timestamp}</span>
              </div>
              <p className="whitespace-pre-wrap">{msg.text}</p>

              {/* Action Execution Pills */}
              {msg.appliedActions && msg.appliedActions.length > 0 && (
                <div className="mt-2.5 pt-2 border-t border-[#2d364b] space-y-1">
                  <div className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-semibold">
                    Executed Actions:
                  </div>
                  {msg.appliedActions.map((action, i) => (
                    <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Hyperframes Live Preview Card if generated */}
              {msg.hyperframePreview && (
                <div className="mt-2.5 rounded-lg overflow-hidden border border-purple-500/40 bg-black/60 p-2">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono text-purple-300 flex items-center gap-1 font-semibold">
                      <Sparkles className="w-3 h-3 text-purple-400" />
                      Hyperframes Render Preview
                    </span>
                    {msg.clipIdCreated && (
                      <button
                        onClick={() => {
                          const clip = state.clips.find(c => c.id === msg.clipIdCreated);
                          if (clip) onOpenClipCode(clip);
                        }}
                        className="text-[10px] px-2 py-0.5 rounded bg-purple-700/60 hover:bg-purple-600 text-white flex items-center gap-1"
                      >
                        <Code2 className="w-3 h-3" />
                        Inspect Code
                      </button>
                    )}
                  </div>
                  <div className="h-28 rounded bg-black/80 relative overflow-hidden border border-slate-800">
                    <iframe
                      title="HF Mini Preview"
                      srcDoc={msg.hyperframePreview}
                      className="w-full h-full border-0 pointer-events-none transform scale-75 origin-top-left"
                      style={{ width: '133%', height: '133%' }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isProcessing && (
          <div className="flex items-center gap-2 text-xs text-blue-400 bg-[#161a25] p-2.5 rounded-lg border border-blue-500/20 animate-pulse">
            <Sparkles className="w-4 h-4 animate-spin text-blue-400" />
            <span>Analyzing prompt & mutating timeline schema...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Circled Area Spatial Context Badge */}
      {state.activeAnnotation && (
        <div className="mx-3 mb-2 p-2 rounded-lg bg-cyan-950/60 border border-cyan-500/40 flex flex-col gap-1.5 animate-fadeIn">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-cyan-300 flex items-center gap-1.5">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              Circled Area ({state.activeAnnotation.x}%, {state.activeAnnotation.y}%)
            </span>
            <button
              onClick={() => onUpdateState({ activeAnnotation: null })}
              className="p-1 rounded hover:bg-cyan-900/40 text-cyan-400 hover:text-white"
              title="Clear annotation"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => handleSendPrompt('Add arrow pointing here')}
              className="text-[10px] px-2 py-0.5 rounded bg-rose-600 hover:bg-rose-500 text-white flex items-center gap-1"
            >
              <ArrowDownRight className="w-3 h-3" />
              Arrow Here
            </button>
            <button
              onClick={() => handleSendPrompt('Blur this region')}
              className="text-[10px] px-2 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-white flex items-center gap-1"
            >
              <EyeOff className="w-3 h-3" />
              Blur Region
            </button>
            <button
              onClick={() => handleSendPrompt('Add spotlight callout here')}
              className="text-[10px] px-2 py-0.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white flex items-center gap-1"
            >
              <Target className="w-3 h-3" />
              Spotlight Area
            </button>
          </div>
        </div>
      )}

      {/* Input Prompt Box */}
      <div className="p-3 bg-[#11151f] border-t border-[#202636]">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendPrompt();
          }}
          className="relative flex items-center"
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={
              state.activeAnnotation
                ? `Prompt for circled area (e.g. Add arrow, blur this)...`
                : 'e.g. Cut silence from 3s to 7s, add lower third...'
            }
            className={`w-full bg-[#181d2a] border rounded-xl py-2.5 pl-3 pr-10 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 transition-all ${
              state.activeAnnotation
                ? 'border-cyan-500/60 focus:border-cyan-400 focus:ring-cyan-500'
                : 'border-[#2c3449] focus:border-blue-500 focus:ring-blue-500'
            }`}
          />
          <button
            type="submit"
            disabled={!input.trim() || isProcessing}
            className={`absolute right-1.5 p-1.5 rounded-lg text-white transition-all disabled:opacity-40 ${
              state.activeAnnotation
                ? 'bg-cyan-600 hover:bg-cyan-500 disabled:hover:bg-cyan-600'
                : 'bg-blue-600 hover:bg-blue-500 disabled:hover:bg-blue-600'
            }`}
            title="Execute Prompt"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
        <div className="flex items-center justify-between mt-2 px-1 text-[10px] text-slate-500">
          <span>Spatial Prompt & Agent Engine</span>
          <span className="font-mono">v1.1</span>
        </div>
      </div>
    </div>
  );
};
