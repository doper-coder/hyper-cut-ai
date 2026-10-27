import React, { useRef, useEffect, useState } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Scissors, 
  Trash2, 
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Target,
  X,
  ArrowDownRight,
  EyeOff,
  Crosshair
} from 'lucide-react';
import { EditorState, Clip, CanvasAnnotation } from '../types/editor';
import { formatTimecode } from '../utils/time';

interface PlayerProps {
  state: EditorState;
  onUpdateState: (partial: Partial<EditorState>) => void;
  onSplitAtPlayhead: () => void;
  onDeleteSelected: () => void;
  onOpenClipCode: (clip: Clip) => void;
  onTriggerPrompt?: (prompt: string) => void;
}

export const Player: React.FC<PlayerProps> = ({
  state,
  onUpdateState,
  onSplitAtPlayhead,
  onDeleteSelected,
  onOpenClipCode,
  onTriggerPrompt,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);

  const [isAnnotating, setIsAnnotating] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [currentBox, setCurrentBox] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  // Find active video clip
  const activeVideoClip = state.clips.find(
    c => c.type === 'video' && state.currentTime >= c.start && state.currentTime < c.start + c.duration
  );

  // Find active Hyperframe overlay clip
  const activeOverlayClip = state.clips.find(
    c => c.type === 'overlay' && state.currentTime >= c.start && state.currentTime < c.start + c.duration
  );

  // Find active caption clip
  const activeCaptionClip = state.clips.find(
    c => c.type === 'caption' && state.currentTime >= c.start && state.currentTime < c.start + c.duration
  );

  // Sync HTML video element with editor currentTime
  useEffect(() => {
    if (!videoRef.current) return;
    if (activeVideoClip) {
      const clipOffset = state.currentTime - activeVideoClip.start + activeVideoClip.trimStart;
      if (Math.abs(videoRef.current.currentTime - clipOffset) > 0.25) {
        videoRef.current.currentTime = clipOffset;
      }
      if (state.isPlaying && videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
      } else if (!state.isPlaying && !videoRef.current.paused) {
        videoRef.current.pause();
      }
    } else {
      if (!videoRef.current.paused) videoRef.current.pause();
    }
  }, [state.currentTime, state.isPlaying, activeVideoClip]);

  const togglePlay = () => {
    onUpdateState({ isPlaying: !state.isPlaying });
  };

  const seekBy = (seconds: number) => {
    const nextTime = Math.max(0, Math.min(state.duration, state.currentTime + seconds));
    onUpdateState({ currentTime: nextTime });
  };

  // Canvas Circling / Annotating Drag Handlers
  const handleStageMouseDown = (e: React.MouseEvent) => {
    if (!isAnnotating || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setDragStart({ x, y });
    setCurrentBox({ x, y, w: 0, h: 0 });
  };

  const handleStageMouseMove = (e: React.MouseEvent) => {
    if (!dragStart || !stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const currX = ((e.clientX - rect.left) / rect.width) * 100;
    const currY = ((e.clientY - rect.top) / rect.height) * 100;

    const minX = Math.min(dragStart.x, currX);
    const minY = Math.min(dragStart.y, currY);
    const w = Math.abs(currX - dragStart.x);
    const h = Math.abs(currY - dragStart.y);

    setCurrentBox({
      x: minX + w / 2,
      y: minY + h / 2,
      w: Math.max(4, w),
      h: Math.max(4, h),
    });
  };

  const handleStageMouseUp = () => {
    if (dragStart && currentBox && currentBox.w > 2 && currentBox.h > 2) {
      const annotation: CanvasAnnotation = {
        id: `annot-${Date.now()}`,
        type: 'circle',
        x: Math.round(currentBox.x),
        y: Math.round(currentBox.y),
        width: Math.round(currentBox.w),
        height: Math.round(currentBox.h),
        label: `Region (${Math.round(currentBox.x)}%, ${Math.round(currentBox.y)}%)`,
      };
      onUpdateState({ activeAnnotation: annotation });
    }
    setDragStart(null);
  };

  const clearAnnotation = () => {
    onUpdateState({ activeAnnotation: null });
    setCurrentBox(null);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#0d0f14] relative overflow-hidden">
      {/* Viewport Canvas Stage */}
      <div className="flex-1 flex items-center justify-center p-4 relative select-none">
        <div
          ref={stageRef}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          className={`relative bg-black rounded-xl overflow-hidden shadow-2xl border border-[#232938] transition-all duration-300 flex items-center justify-center ${
            isAnnotating ? 'cursor-crosshair ring-2 ring-cyan-500/50' : 'cursor-default'
          } ${
            state.aspectRatio === '16:9'
              ? 'aspect-video w-full max-w-[850px] max-h-[480px]'
              : 'aspect-[9/16] h-full max-h-[500px]'
          }`}
        >
          {/* Base Video Layer */}
          {activeVideoClip && activeVideoClip.sourceUrl ? (
            <video
              ref={videoRef}
              src={activeVideoClip.sourceUrl}
              className="w-full h-full object-cover pointer-events-none"
              playsInline
              muted={state.tracks.find(t => t.id === activeVideoClip.trackId)?.isMuted}
            />
          ) : (
            /* Fallback Ambient Canvas Background */
            <div className="w-full h-full bg-gradient-to-br from-[#121622] via-[#090b10] to-[#181124] flex flex-col items-center justify-center relative overflow-hidden pointer-events-none">
              <div 
                className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: `radial-gradient(circle at 1px 1px, #3b82f6 1px, transparent 0)`,
                  backgroundSize: '32px 32px'
                }}
              />
              <div className="z-10 text-center px-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2">
                  <Sparkles className="w-6 h-6 animate-pulse" />
                </div>
                <h3 className="text-sm font-semibold text-slate-300">
                  {activeVideoClip ? activeVideoClip.name : 'No Clip at Current Playhead'}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Time: {formatTimecode(state.currentTime, state.fps)}
                </p>
              </div>
            </div>
          )}

          {/* Active Hyperframes Render Layer */}
          {activeOverlayClip && activeOverlayClip.properties?.hyperframeCode && (
            <div className="absolute inset-0 z-20 pointer-events-none">
              <iframe
                title="Hyperframes Overlay"
                srcDoc={activeOverlayClip.properties.hyperframeCode}
                className="w-full h-full border-0 pointer-events-none bg-transparent"
                sandbox="allow-scripts"
              />
            </div>
          )}

          {/* Active Subtitle / Captions Layer */}
          {activeCaptionClip && (
            <div className="absolute bottom-10 left-0 right-0 z-30 flex justify-center px-6 pointer-events-none">
              <div className="bg-black/85 backdrop-blur-md px-4 py-2 rounded-lg border border-yellow-500/30 shadow-2xl text-center transform scale-105 transition-all">
                <span 
                  className="font-black tracking-wide text-lg sm:text-xl drop-shadow-md"
                  style={{ color: activeCaptionClip.properties?.color || '#facc15' }}
                >
                  {activeCaptionClip.properties?.text}
                </span>
              </div>
            </div>
          )}

          {/* Active Annotation Live Circle or Completed Circle */}
          {(currentBox || state.activeAnnotation) && (
            <div className="absolute inset-0 z-40 pointer-events-none">
              {(() => {
                const box = currentBox || (state.activeAnnotation ? {
                  x: state.activeAnnotation.x,
                  y: state.activeAnnotation.y,
                  w: state.activeAnnotation.width,
                  h: state.activeAnnotation.height,
                } : null);

                if (!box) return null;

                return (
                  <div
                    style={{
                      left: `${box.x}%`,
                      top: `${box.y}%`,
                      width: `${box.w}%`,
                      height: `${box.h}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className="absolute border-2 border-cyan-400 border-dashed rounded-full bg-cyan-500/15 shadow-[0_0_20px_rgba(6,182,212,0.5)] transition-all pointer-events-auto group"
                  >
                    {/* Circle Label & Quick Action Menu */}
                    <div className="absolute -top-11 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-[#10141d]/90 backdrop-blur-md border border-cyan-500/50 p-1 rounded-lg shadow-xl text-white whitespace-nowrap text-[10px]">
                      <span className="font-mono text-cyan-300 font-bold px-1 flex items-center gap-1">
                        <Crosshair className="w-3 h-3 text-cyan-400" />
                        Target ({Math.round(box.x)}%, {Math.round(box.y)}%)
                      </span>
                      <button
                        onClick={() => onTriggerPrompt?.('Add arrow pointing here')}
                        className="px-1.5 py-0.5 rounded bg-rose-600/80 hover:bg-rose-500 text-white font-medium flex items-center gap-1 transition-colors"
                        title="Add bouncing arrow here"
                      >
                        <ArrowDownRight className="w-3 h-3" />
                        Arrow
                      </button>
                      <button
                        onClick={() => onTriggerPrompt?.('Blur this region')}
                        className="px-1.5 py-0.5 rounded bg-slate-700 hover:bg-slate-600 text-white font-medium flex items-center gap-1 transition-colors"
                        title="Apply privacy blur mask"
                      >
                        <EyeOff className="w-3 h-3" />
                        Blur
                      </button>
                      <button
                        onClick={() => onTriggerPrompt?.('Add spotlight callout here')}
                        className="px-1.5 py-0.5 rounded bg-cyan-700 hover:bg-cyan-600 text-white font-medium flex items-center gap-1 transition-colors"
                        title="Add animated spotlight callout"
                      >
                        <Target className="w-3 h-3" />
                        Spotlight
                      </button>
                      <button
                        onClick={clearAnnotation}
                        className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white"
                        title="Clear circled region"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}

          {/* Active Hyperframes Pill Badge */}
          {activeOverlayClip && (
            <button
              onClick={() => onOpenClipCode(activeOverlayClip)}
              className="absolute top-3 right-3 z-40 bg-purple-900/80 hover:bg-purple-800 text-purple-200 border border-purple-500/40 text-[11px] font-mono px-2.5 py-1 rounded-full backdrop-blur-md flex items-center gap-1.5 shadow-lg transition-transform hover:scale-105 pointer-events-auto"
            >
              <Sparkles className="w-3 h-3 text-purple-300" />
              Edit Hyperframes Code
            </button>
          )}

          {/* Annotation Mode Helper Banner */}
          {isAnnotating && !state.activeAnnotation && (
            <div className="absolute top-3 left-3 z-40 bg-cyan-950/90 border border-cyan-500/40 text-cyan-200 text-xs px-3 py-1.5 rounded-lg backdrop-blur-md flex items-center gap-2 shadow-lg animate-pulse pointer-events-none">
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>Click and drag on the canvas to circle an area</span>
            </div>
          )}
        </div>
      </div>

      {/* Player Controls Bar */}
      <div className="h-14 bg-[#11141b] border-t border-[#212634] px-6 flex items-center justify-between">
        {/* Left: Quick Editing Shortcuts + Circle Area Tool */}
        <div className="flex items-center gap-2">
          {/* Circle / Highlight Canvas Tool Toggle */}
          <button
            onClick={() => {
              setIsAnnotating(!isAnnotating);
              if (isAnnotating) clearAnnotation();
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              isAnnotating
                ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-500/30 ring-1 ring-cyan-400'
                : 'bg-[#1a1f2b] hover:bg-[#252c3c] text-cyan-300 hover:text-white border border-cyan-500/30'
            }`}
            title="Circle / highlight an area on the canvas to prompt AI (Hotkey: C)"
          >
            <Crosshair className="w-3.5 h-3.5" />
            {isAnnotating ? 'Circling Mode Active' : 'Circle Canvas Area'}
          </button>

          <button
            onClick={onSplitAtPlayhead}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#1a1f2b] hover:bg-[#252c3c] text-slate-300 hover:text-white border border-[#2b3345] transition-colors"
            title="Split clip at playhead (Hotkey: S)"
          >
            <Scissors className="w-3.5 h-3.5 text-blue-400" />
            Split (S)
          </button>

          <button
            onClick={onDeleteSelected}
            disabled={!state.selectedClipId}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              state.selectedClipId
                ? 'bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40'
                : 'opacity-40 cursor-not-allowed bg-[#181c26] text-slate-500 border border-transparent'
            }`}
            title="Delete selected clip (Hotkey: Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete
          </button>
        </div>

        {/* Center: Playback Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => seekBy(-5)}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#1f2533] rounded-lg transition-colors"
            title="Rewind 5s (Left Arrow)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/30 transition-transform active:scale-95"
            title="Play / Pause (Space)"
          >
            {state.isPlaying ? (
              <Pause className="w-4 h-4 fill-current" />
            ) : (
              <Play className="w-4 h-4 fill-current ml-0.5" />
            )}
          </button>

          <button
            onClick={() => seekBy(5)}
            className="p-2 text-slate-400 hover:text-white hover:bg-[#1f2533] rounded-lg transition-colors"
            title="Forward 5s (Right Arrow)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Timeline Zoom slider */}
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-slate-500 font-mono">Zoom</span>
          <input
            type="range"
            min="20"
            max="120"
            value={state.zoom}
            onChange={e => onUpdateState({ zoom: Number(e.target.value) })}
            className="w-24 h-1.5 bg-[#232938] rounded-lg appearance-none cursor-pointer accent-blue-500"
          />
        </div>
      </div>
    </div>
  );
};
