# HyperCut AI (`hyper-cut-ai`) - Project Status & Development Progress

## 1. Overview & Architecture
* **Name**: HyperCut AI (`ai-video-editor`)
* **Repository**: [`doper-coder/hyper-cut-ai`](https://github.com/doper-coder/hyper-cut-ai) (Public)
* **Description**: AI-driven web-based video editor tailored for short-form creators. Features automated silence removal, viral clip detection, Hyperframes template rendering, and multi-track timeline editing.
* **Stack**: React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Hyperframes.

---

## 2. Key Components & Implementation
* **Timeline Engine (`src/components/Timeline.tsx`)**:
  * Multi-track visual timeline with draggable playhead, scrubbing, zoom controls, and cut markers.
* **Video Player (`src/components/Player.tsx`)**:
  * Precision HTML5 video playback synced directly with timeline state and playback controls.
* **AI Action Engine (`src/services/aiActionEngine.ts`)**:
  * Automates clip generation, highlight detection, and smart caption overlays.
* **Hyperframes Integration (`src/components/HyperframesEditorModal.tsx`, `src/services/hyperframesTemplates.ts`)**:
  * Interactive template editor modal allowing programmatic motion graphics, title cards, and animated overlays.
* **Export Engine (`src/components/ExportModal.tsx`)**:
  * Modal handling rendering resolution selection (9:16 vertical, 16:9 horizontal), export presets, and final video generation.

---

## 3. Development Progress & Antigravity Context
* **Phase 1: Core Timeline & Video Sync**: Built the canvas/DOM timeline, playhead state machine, and video element sync.
* **Phase 2: AI Action Panels & Hyperframes**:
  * Integrated `AIPanel.tsx` to accept natural language prompts for automated video cuts.
  * Added HeyGen Hyperframes templates for title transitions and lower thirds.
* **Phase 3: YouTube Video Ingestion & Summarization**:
  * Built video link intake and summarization workflow for pulling remote video clips directly into the editor.

---

## 4. Next Steps & Roadmap
- [ ] Connect client-side FFmpeg (Wasm) or remote rendering worker for zero-backend video stitching.
- [ ] Integrate automatic speech-to-text (Whisper API) for dynamic word-by-word karaoke subtitles.
- [ ] Direct export/publishing pipeline to TikTok and YouTube Shorts.

---

## 5. Local Development
```bash
npm install
npm run dev        # Starts Vite local dev server at http://localhost:5173
npm run build      # Production bundle
```
