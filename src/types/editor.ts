export type TrackType = 'video' | 'overlay' | 'caption' | 'audio';

export interface Track {
  id: string;
  name: string;
  type: TrackType;
  isMuted: boolean;
  isLocked: boolean;
  color: string;
}

export interface Clip {
  id: string;
  trackId: string;
  name: string;
  start: number; // in seconds on timeline
  duration: number; // in seconds
  trimStart: number; // in seconds from source start
  type: TrackType;
  sourceUrl?: string;
  properties?: {
    text?: string;
    style?: Record<string, any>;
    hyperframeCode?: string; // HTML + CSS + JS template
    volume?: number; // 0 to 1
    speed?: number;
    opacity?: number;
    color?: string;
    fontSize?: number;
    fontFamily?: string;
    position?: { x: number; y: number }; // percentage 0-100
  };
}

export interface CanvasAnnotation {
  id: string;
  type: 'circle' | 'rect';
  x: number; // percentage (0-100)
  y: number; // percentage (0-100)
  width: number; // percentage (0-100)
  height: number; // percentage (0-100)
  label?: string;
}

export interface EditorState {
  currentTime: number;
  duration: number; // total duration
  isPlaying: boolean;
  zoom: number; // pixels per second
  tracks: Track[];
  clips: Clip[];
  selectedClipId: string | null;
  fps: number;
  aspectRatio: '16:9' | '9:16' | '1:1';
  activeAnnotation?: CanvasAnnotation | null;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: string;
  appliedActions?: string[];
  hyperframePreview?: string;
  clipIdCreated?: string;
}
