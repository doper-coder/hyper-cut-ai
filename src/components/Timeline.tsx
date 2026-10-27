import React, { useRef, useState, useEffect } from 'react';
import { 
  Video, 
  Layers, 
  Subtitles, 
  Music, 
  Volume2, 
  VolumeX, 
  Lock, 
  Unlock,
  Sparkles,
  X
} from 'lucide-react';
import { EditorState, Clip, Track } from '../types/editor';
import { formatTimecode } from '../utils/time';

interface TimelineProps {
  state: EditorState;
  onUpdateState: (partial: Partial<EditorState>) => void;
  onDeleteClip: (id: string) => void;
  onOpenClipCode: (clip: Clip) => void;
}

export const Timeline: React.FC<TimelineProps> = ({
  state,
  onUpdateState,
  onDeleteClip,
  onOpenClipCode,
}) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [draggingClip, setDraggingClip] = useState<{
    clipId: string;
    mode: 'move' | 'trim-start' | 'trim-end';
    initialMouseX: number;
    initialStart: number;
    initialDuration: number;
  } | null>(null);

  // Calculate timeline pixel width based on duration & zoom
  const timelineWidth = Math.max(1200, state.duration * state.zoom + 200);

  // Ruler ticks
  const tickInterval = state.zoom > 60 ? 1 : 5;
  const totalTicks = Math.ceil(state.duration / tickInterval) + 2;
  const ticks = Array.from({ length: totalTicks }, (_, i) => i * tickInterval);

  // Playhead scrubber handler
  const handleRulerMouseDown = (e: React.MouseEvent) => {
    setIsScrubbing(true);
    updatePlayheadFromMouse(e);
  };

  const updatePlayheadFromMouse = (e: MouseEvent | React.MouseEvent) => {
    if (!scrollRef.current) return;
    const rect = scrollRef.current.getBoundingClientRect();
    const scrollLeft = scrollRef.current.scrollLeft;
    const clickX = e.clientX - rect.left + scrollLeft;
    const newTime = Math.max(0, Math.min(state.duration, clickX / state.zoom));
    onUpdateState({ currentTime: newTime });
  };

  // Window mouse events for scrubbing & dragging clips
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isScrubbing) {
        updatePlayheadFromMouse(e);
      } else if (draggingClip) {
        const deltaX = e.clientX - draggingClip.initialMouseX;
        const deltaSeconds = deltaX / state.zoom;

        const updatedClips = state.clips.map(c => {
          if (c.id !== draggingClip.clipId) return c;

          if (draggingClip.mode === 'move') {
            const nextStart = Math.max(0, draggingClip.initialStart + deltaSeconds);
            return { ...c, start: nextStart };
          } else if (draggingClip.mode === 'trim-start') {
            const maxTrim = draggingClip.initialDuration - 0.2;
            const trimDelta = Math.min(maxTrim, Math.max(-draggingClip.initialStart, deltaSeconds));
            return {
              ...c,
              start: draggingClip.initialStart + trimDelta,
              duration: draggingClip.initialDuration - trimDelta,
              trimStart: Math.max(0, c.trimStart + trimDelta),
            };
          } else if (draggingClip.mode === 'trim-end') {
            const nextDur = Math.max(0.2, draggingClip.initialDuration + deltaSeconds);
            return { ...c, duration: nextDur };
          }
          return c;
        });

        onUpdateState({ clips: updatedClips });
      }
    };

    const handleMouseUp = () => {
      setIsScrubbing(false);
      setDraggingClip(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isScrubbing, draggingClip, state.zoom, state.duration, state.clips]);

  const getTrackIcon = (type: Track['type']) => {
    switch (type) {
      case 'video': return <Video className="w-3.5 h-3.5 text-blue-400" />;
      case 'overlay': return <Layers className="w-3.5 h-3.5 text-purple-400" />;
      case 'caption': return <Subtitles className="w-3.5 h-3.5 text-yellow-400" />;
      case 'audio': return <Music className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  const getClipStyle = (clip: Clip) => {
    const isSelected = state.selectedClipId === clip.id;
    let bg = 'bg-blue-600/30 border-blue-500/50 text-blue-200';
    if (clip.type === 'overlay') bg = 'bg-purple-600/30 border-purple-500/50 text-purple-200';
    if (clip.type === 'caption') bg = 'bg-amber-600/30 border-yellow-500/50 text-yellow-200';
    if (clip.type === 'audio') bg = 'bg-emerald-600/30 border-emerald-500/50 text-emerald-200';

    return {
      bg,
      selected: isSelected ? 'ring-2 ring-white border-white shadow-lg' : '',
    };
  };

  return (
    <div className="h-64 bg-[#0e1117] border-t border-[#1f2430] flex flex-col select-none relative z-10">
      {/* Timeline Controls & Rulers Top Bar */}
      <div className="flex border-b border-[#1f2430] bg-[#121620]">
        {/* Track Headers Column Label */}
        <div className="w-52 px-4 py-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center justify-between border-r border-[#1f2430]">
          <span>Tracks</span>
          <span className="text-[10px] font-mono text-slate-500">{state.clips.length} Clips</span>
        </div>

        {/* Ruler Area */}
        <div
          ref={scrollRef}
          onMouseDown={handleRulerMouseDown}
          className="flex-1 overflow-x-auto relative h-8 cursor-pointer scrollbar-none"
        >
          <div style={{ width: `${timelineWidth}px` }} className="h-full relative">
            {ticks.map(sec => (
              <div
                key={sec}
                style={{ left: `${sec * state.zoom}px` }}
                className="absolute top-0 bottom-0 flex flex-col justify-between pointer-events-none"
              >
                <span className="text-[9px] font-mono text-slate-500 pl-1">
                  {formatTimecode(sec, state.fps).slice(3)}
                </span>
                <div className="w-px h-2 bg-slate-700" />
              </div>
            ))}

            {/* Playhead Head (Red Arrow) */}
            <div
              style={{ left: `${state.currentTime * state.zoom}px` }}
              className="absolute top-0 z-30 transform -translate-x-1/2 pointer-events-none"
            >
              <div className="w-3 h-3.5 bg-red-500 clip-path-polygon shadow-md" style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }} />
            </div>
          </div>
        </div>
      </div>

      {/* Tracks Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Track Headers */}
        <div className="w-52 bg-[#10141d] border-r border-[#1f2430] flex flex-col divide-y divide-[#1b202c]">
          {state.tracks.map(track => (
            <div
              key={track.id}
              className="h-12 px-3 flex items-center justify-between text-xs text-slate-300"
            >
              <div className="flex items-center gap-2">
                {getTrackIcon(track.type)}
                <span className="font-medium text-[11px] truncate">{track.name}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-500">
                <button
                  onClick={() => {
                    const updated = state.tracks.map(t =>
                      t.id === track.id ? { ...t, isMuted: !t.isMuted } : t
                    );
                    onUpdateState({ tracks: updated });
                  }}
                  className={`p-1 rounded hover:bg-slate-800 ${track.isMuted ? 'text-rose-400' : 'text-slate-500'}`}
                  title={track.isMuted ? 'Unmute' : 'Mute'}
                >
                  {track.isMuted ? <VolumeX className="w-3 h-3" /> : <Volume2 className="w-3 h-3" />}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Right Tracks Workspace (Tracks + Clips + Playhead line) */}
        <div className="flex-1 overflow-x-auto relative scrollbar-thin scrollbar-thumb-slate-800 bg-[#0a0d13]">
          <div style={{ width: `${timelineWidth}px` }} className="h-full relative flex flex-col divide-y divide-[#171b26]">
            {/* Playhead vertical red line spanning all tracks */}
            <div
              style={{ left: `${state.currentTime * state.zoom}px` }}
              className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-30 pointer-events-none shadow-[0_0_8px_rgba(239,68,68,0.8)]"
            />

            {/* Individual Tracks */}
            {state.tracks.map(track => {
              const trackClips = state.clips.filter(c => c.trackId === track.id);

              return (
                <div
                  key={track.id}
                  className="h-12 relative flex items-center bg-[#0d1017]/60"
                >
                  {trackClips.map(clip => {
                    const style = getClipStyle(clip);
                    const left = clip.start * state.zoom;
                    const width = clip.duration * state.zoom;

                    return (
                      <div
                        key={clip.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateState({ selectedClipId: clip.id });
                        }}
                        style={{
                          left: `${left}px`,
                          width: `${width}px`,
                        }}
                        className={`absolute h-9 rounded-md border flex items-center justify-between px-2 cursor-grab active:cursor-grabbing backdrop-blur-sm transition-shadow group ${style.bg} ${style.selected}`}
                        onMouseDown={(e) => {
                          // Start moving clip
                          if ((e.target as HTMLElement).dataset.handle) return;
                          setDraggingClip({
                            clipId: clip.id,
                            mode: 'move',
                            initialMouseX: e.clientX,
                            initialStart: clip.start,
                            initialDuration: clip.duration,
                          });
                          onUpdateState({ selectedClipId: clip.id });
                        }}
                      >
                        {/* Left Trim Handle */}
                        <div
                          data-handle="trim-start"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setDraggingClip({
                              clipId: clip.id,
                              mode: 'trim-start',
                              initialMouseX: e.clientX,
                              initialStart: clip.start,
                              initialDuration: clip.duration,
                            });
                          }}
                          className="absolute left-0 top-0 bottom-0 w-2 hover:w-3 bg-white/20 hover:bg-white/60 cursor-ew-resize rounded-l-md transition-all z-10"
                          title="Drag to trim start"
                        />

                        {/* Clip Content Label */}
                        <div className="flex items-center gap-1.5 overflow-hidden pointer-events-none select-none pl-1">
                          {clip.type === 'overlay' && (
                            <Sparkles className="w-3 h-3 text-purple-300 flex-shrink-0" />
                          )}
                          <span className="text-[11px] font-medium truncate">
                            {clip.name}
                          </span>
                        </div>

                        {/* Right Trim Handle */}
                        <div
                          data-handle="trim-end"
                          onMouseDown={(e) => {
                            e.stopPropagation();
                            setDraggingClip({
                              clipId: clip.id,
                              mode: 'trim-end',
                              initialMouseX: e.clientX,
                              initialStart: clip.start,
                              initialDuration: clip.duration,
                            });
                          }}
                          className="absolute right-0 top-0 bottom-0 w-2 hover:w-3 bg-white/20 hover:bg-white/60 cursor-ew-resize rounded-r-md transition-all z-10"
                          title="Drag to trim end"
                        />

                        {/* Hover Actions */}
                        <div className="hidden group-hover:flex items-center gap-1 z-20">
                          {clip.type === 'overlay' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenClipCode(clip);
                              }}
                              className="p-1 rounded bg-purple-900/80 hover:bg-purple-700 text-purple-200 text-[9px] font-mono px-1.5"
                              title="Edit Hyperframes Code"
                            >
                              Code
                            </button>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteClip(clip.id);
                            }}
                            className="p-1 rounded bg-black/50 hover:bg-rose-900/80 text-rose-300 transition-colors"
                            title="Delete clip"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
