import React, { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Player } from './components/Player';
import { Timeline } from './components/Timeline';
import { AIPanel } from './components/AIPanel';
import { HyperframesEditorModal } from './components/HyperframesEditorModal';
import { ExportModal } from './components/ExportModal';
import { EditorState, Clip, Track } from './types/editor';
import { HYPERFRAME_TEMPLATES } from './services/hyperframesTemplates';

const INITIAL_TRACKS: Track[] = [
  { id: 'track-v1', name: 'Main Video V1', type: 'video', isMuted: false, isLocked: false, color: '#3b82f6' },
  { id: 'track-o1', name: 'Hyperframes Overlay V2', type: 'overlay', isMuted: false, isLocked: false, color: '#a855f7' },
  { id: 'track-c1', name: 'AI Subtitles & Captions', type: 'caption', isMuted: false, isLocked: false, color: '#eab308' },
  { id: 'track-a1', name: 'Soundtrack & SFX A1', type: 'audio', isMuted: false, isLocked: false, color: '#10b981' },
];

const createDefaultClips = (): Clip[] => [
  {
    id: 'clip-video-1',
    trackId: 'track-v1',
    name: 'Raw Studio Footage.mp4',
    start: 0,
    duration: 16,
    trimStart: 0,
    type: 'video',
    sourceUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
  },
  {
    id: 'clip-hf-1',
    trackId: 'track-o1',
    name: 'HF: Neon Intro Title',
    start: 0.5,
    duration: 3.5,
    trimStart: 0,
    type: 'overlay',
    properties: {
      hyperframeCode: HYPERFRAME_TEMPLATES['kinetic-title'].generateHtml({
        title: 'AGENTIC VIDEO REVOLUTION',
        subtitle: 'AI EDITOR & HYPERFRAMES ENGINE',
      }),
      opacity: 1,
    },
  },
  {
    id: 'clip-hf-2',
    trackId: 'track-o1',
    name: 'HF: Lower Third Speaker',
    start: 5.5,
    duration: 4.0,
    trimStart: 0,
    type: 'overlay',
    properties: {
      hyperframeCode: HYPERFRAME_TEMPLATES['glass-lower-third'].generateHtml({
        title: 'Dr. Sarah Connor',
        subtitle: 'Autonomous Systems Director',
      }),
      opacity: 1,
    },
  },
  {
    id: 'clip-sub-1',
    trackId: 'track-c1',
    name: 'Sub: "Welcome back..."',
    start: 1.0,
    duration: 2.8,
    trimStart: 0,
    type: 'caption',
    properties: {
      text: 'Welcome back to our zero-cost AI editing suite.',
      color: '#facc15',
    },
  },
  {
    id: 'clip-sub-2',
    trackId: 'track-c1',
    name: 'Sub: "Notice how..."',
    start: 4.0,
    duration: 3.2,
    trimStart: 0,
    type: 'caption',
    properties: {
      text: 'Notice how Hyperframes seamlessly renders deterministic graphics!',
      color: '#facc15',
    },
  },
  {
    id: 'clip-sub-3',
    trackId: 'track-c1',
    name: 'Sub: "No subscription..."',
    start: 7.5,
    duration: 3.5,
    trimStart: 0,
    type: 'caption',
    properties: {
      text: 'No subscription required, full multi-track power.',
      color: '#facc15',
    },
  },
  {
    id: 'clip-audio-1',
    trackId: 'track-a1',
    name: 'Cyberpunk Lo-Fi Chill.mp3',
    start: 0,
    duration: 16,
    trimStart: 0,
    type: 'audio',
    properties: {
      volume: 0.25, // Auto-ducked
    },
  },
];

export function App() {
  const [editorState, setEditorState] = useState<EditorState>({
    currentTime: 0,
    duration: 16,
    isPlaying: false,
    zoom: 50,
    tracks: INITIAL_TRACKS,
    clips: createDefaultClips(),
    selectedClipId: null,
    fps: 30,
    aspectRatio: '16:9',
  });

  const [activeModalClip, setActiveModalClip] = useState<Clip | null>(null);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [promptToTrigger, setPromptToTrigger] = useState<string | null>(null);
  const playbackTimerRef = useRef<number | null>(null);

  const updateState = (partial: Partial<EditorState>) => {
    setEditorState(prev => ({ ...prev, ...partial }));
  };

  // Playback timer ticker
  useEffect(() => {
    if (editorState.isPlaying) {
      playbackTimerRef.current = window.setInterval(() => {
        setEditorState(prev => {
          if (prev.currentTime >= prev.duration) {
            return { ...prev, isPlaying: false, currentTime: 0 };
          }
          return { ...prev, currentTime: prev.currentTime + 0.05 };
        });
      }, 50);
    } else {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    }
    return () => {
      if (playbackTimerRef.current) clearInterval(playbackTimerRef.current);
    };
  }, [editorState.isPlaying]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when typing in inputs/textareas
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space') {
        e.preventDefault();
        setEditorState(prev => ({ ...prev, isPlaying: !prev.isPlaying }));
      } else if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        handleSplitAtPlayhead();
      } else if (e.key === 'Delete' || e.key === 'Backspace') {
        if (editorState.selectedClipId) {
          e.preventDefault();
          handleDeleteClip(editorState.selectedClipId);
        }
      } else if (e.key === 'Escape') {
        if (editorState.activeAnnotation) {
          e.preventDefault();
          setEditorState(prev => ({ ...prev, activeAnnotation: null }));
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        setEditorState(prev => ({ ...prev, currentTime: Math.max(0, prev.currentTime - 1) }));
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        setEditorState(prev => ({ ...prev, currentTime: Math.min(prev.duration, prev.currentTime + 1) }));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [editorState.selectedClipId, editorState.currentTime, editorState.clips]);

  const handleSplitAtPlayhead = () => {
    const playhead = editorState.currentTime;
    const targetClip = editorState.clips.find(
      c => c.id === editorState.selectedClipId || (c.start <= playhead && c.start + c.duration > playhead)
    );

    if (!targetClip) return;
    const firstDuration = playhead - targetClip.start;
    const secondDuration = targetClip.duration - firstDuration;

    if (firstDuration < 0.1 || secondDuration < 0.1) return;

    const part1: Clip = {
      ...targetClip,
      duration: firstDuration,
    };

    const part2: Clip = {
      ...targetClip,
      id: `clip-${Date.now()}`,
      name: `${targetClip.name} (Cut)`,
      start: playhead,
      duration: secondDuration,
      trimStart: targetClip.trimStart + firstDuration,
    };

    const otherClips = editorState.clips.filter(c => c.id !== targetClip.id);
    setEditorState(prev => ({
      ...prev,
      clips: [...otherClips, part1, part2],
      selectedClipId: part2.id,
    }));
  };

  const handleDeleteClip = (clipId: string) => {
    setEditorState(prev => ({
      ...prev,
      clips: prev.clips.filter(c => c.id !== clipId),
      selectedClipId: prev.selectedClipId === clipId ? null : prev.selectedClipId,
    }));
  };

  const handleSaveHyperframeCode = (clipId: string, updatedHtml: string) => {
    setEditorState(prev => ({
      ...prev,
      clips: prev.clips.map(c =>
        c.id === clipId
          ? { ...c, properties: { ...c.properties, hyperframeCode: updatedHtml } }
          : c
      ),
    }));
  };

  const handleLoadSample = () => {
    setEditorState(prev => ({
      ...prev,
      currentTime: 0,
      isPlaying: false,
      clips: createDefaultClips(),
      selectedClipId: null,
    }));
  };

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#0b0d12]">
      {/* Top Navigation */}
      <Navbar
        state={editorState}
        onUpdateState={updateState}
        onExportClick={() => setIsExportOpen(true)}
        onLoadSample={handleLoadSample}
        onOpenHyperframesStudio={() => {
          // Open modal with the first overlay clip or a placeholder
          const hfClip = editorState.clips.find(c => c.type === 'overlay');
          if (hfClip) setActiveModalClip(hfClip);
        }}
      />

      {/* Main Workspace (Stage + AI Panel) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left / Center: Preview Player */}
        <Player
          state={editorState}
          onUpdateState={updateState}
          onSplitAtPlayhead={handleSplitAtPlayhead}
          onDeleteSelected={() => editorState.selectedClipId && handleDeleteClip(editorState.selectedClipId)}
          onOpenClipCode={clip => setActiveModalClip(clip)}
          onTriggerPrompt={prompt => setPromptToTrigger(prompt)}
        />

        {/* Right: AI Prompting Panel */}
        <AIPanel
          state={editorState}
          onUpdateState={updateState}
          onOpenClipCode={clip => setActiveModalClip(clip)}
          promptToExecute={promptToTrigger}
          onClearPromptTrigger={() => setPromptToTrigger(null)}
        />
      </div>

      {/* Bottom: Multi-Track Timeline */}
      <Timeline
        state={editorState}
        onUpdateState={updateState}
        onDeleteClip={handleDeleteClip}
        onOpenClipCode={clip => setActiveModalClip(clip)}
      />

      {/* Hyperframes Live Code Inspector Modal */}
      <HyperframesEditorModal
        clip={activeModalClip}
        isOpen={Boolean(activeModalClip)}
        onClose={() => setActiveModalClip(null)}
        onSaveCode={handleSaveHyperframeCode}
      />

      {/* Export Composition Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        state={editorState}
      />
    </div>
  );
}

export default App;
