import { Clip, EditorState, Track } from '../types/editor';
import { HYPERFRAME_TEMPLATES } from './hyperframesTemplates';

export interface ActionResult {
  success: boolean;
  message: string;
  appliedActions: string[];
  newClips?: Clip[];
  newTracks?: Track[];
  selectedClipId?: string | null;
  hyperframePreview?: string;
}

export function executePromptCommand(
  prompt: string,
  currentState: EditorState
): ActionResult {
  const lower = prompt.toLowerCase().trim();
  const applied: string[] = [];
  const annot = currentState.activeAnnotation;

  // 0. SPATIAL CANVAS ANNOTATION COMMANDS (Circle / Highlight / Bounding Box)
  if (annot || lower.includes('arrow') || lower.includes('blur') || lower.includes('spotlight') || lower.includes('here') || lower.includes('circle') || lower.includes('highlight area')) {
    const targetX = annot ? annot.x : 50;
    const targetY = annot ? annot.y : 45;
    const targetW = annot ? annot.width : 25;
    const targetH = annot ? annot.height : 25;

    // A. SPATIAL ARROW
    if (lower.includes('arrow') || lower.includes('point') || lower.includes('look here')) {
      const template = HYPERFRAME_TEMPLATES['spatial-arrow'];
      const html = template.generateHtml({
        title: 'LOOK HERE',
        color: '#ef4444',
        x: targetX,
        y: targetY,
      });

      const overlayTrack = currentState.tracks.find(t => t.type === 'overlay') || currentState.tracks[1];
      const newClip: Clip = {
        id: `hf-arrow-${Date.now()}`,
        trackId: overlayTrack.id,
        name: `HF: Arrow at (${Math.round(targetX)}%, ${Math.round(targetY)}%)`,
        start: currentState.currentTime,
        duration: template.defaultDuration,
        trimStart: 0,
        type: 'overlay',
        properties: {
          hyperframeCode: html,
          opacity: 1,
        },
      };

      applied.push(`Extracted circled canvas coordinates: (${Math.round(targetX)}%, ${Math.round(targetY)}%)`);
      applied.push(`Generated dynamic vector pointing arrow anchored to target area`);
      applied.push(`Placed on Overlay Track at playhead ${currentState.currentTime.toFixed(1)}s`);

      return {
        success: true,
        message: `Placed an animated neon pointing arrow directly targeted at the circled area (${Math.round(targetX)}%, ${Math.round(targetY)}%).`,
        appliedActions: applied,
        newClips: [...currentState.clips, newClip],
        selectedClipId: newClip.id,
        hyperframePreview: html,
      };
    }

    // B. SPATIAL BLUR / PRIVACY MASK
    if (lower.includes('blur') || lower.includes('censor') || lower.includes('hide') || lower.includes('mask') || lower.includes('pixelate')) {
      const template = HYPERFRAME_TEMPLATES['blur-mask'];
      const html = template.generateHtml({
        x: targetX,
        y: targetY,
        width: Math.max(15, targetW),
        height: Math.max(15, targetH),
      });

      const overlayTrack = currentState.tracks.find(t => t.type === 'overlay') || currentState.tracks[1];
      const newClip: Clip = {
        id: `hf-blur-${Date.now()}`,
        trackId: overlayTrack.id,
        name: `HF: Blur (${Math.round(targetX)}%, ${Math.round(targetY)}%)`,
        start: currentState.currentTime,
        duration: template.defaultDuration,
        trimStart: 0,
        type: 'overlay',
        properties: {
          hyperframeCode: html,
          opacity: 1,
        },
      };

      applied.push(`Detected target bounding box: ${Math.round(targetW)}% x ${Math.round(targetH)}% at (${Math.round(targetX)}%, ${Math.round(targetY)}%)`);
      applied.push(`Applied GPU backdrop-filter blur mask`);
      applied.push(`Placed on Overlay Track at playhead ${currentState.currentTime.toFixed(1)}s`);

      return {
        success: true,
        message: `Generated privacy blur mask over the circled canvas region (${Math.round(targetX)}%, ${Math.round(targetY)}%).`,
        appliedActions: applied,
        newClips: [...currentState.clips, newClip],
        selectedClipId: newClip.id,
        hyperframePreview: html,
      };
    }

    // C. SPOTLIGHT / RADAR CALLOUT
    if (lower.includes('spotlight') || lower.includes('radar') || lower.includes('callout') || lower.includes('highlight area') || lower.includes('focus')) {
      const template = HYPERFRAME_TEMPLATES['spotlight-callout'];
      const html = template.generateHtml({
        title: 'TARGET REGION',
        color: '#06b6d4',
        x: targetX,
        y: targetY,
        width: Math.max(20, targetW),
        height: Math.max(20, targetH),
      });

      const overlayTrack = currentState.tracks.find(t => t.type === 'overlay') || currentState.tracks[1];
      const newClip: Clip = {
        id: `hf-spotlight-${Date.now()}`,
        trackId: overlayTrack.id,
        name: `HF: Spotlight (${Math.round(targetX)}%, ${Math.round(targetY)}%)`,
        start: currentState.currentTime,
        duration: template.defaultDuration,
        trimStart: 0,
        type: 'overlay',
        properties: {
          hyperframeCode: html,
          opacity: 1,
        },
      };

      applied.push(`Anchored animated radar spotlight to selected canvas coordinate`);
      applied.push(`Placed on Overlay Track at playhead ${currentState.currentTime.toFixed(1)}s`);

      return {
        success: true,
        message: `Created an animated radar spotlight highlighting the circled area.`,
        appliedActions: applied,
        newClips: [...currentState.clips, newClip],
        selectedClipId: newClip.id,
        hyperframePreview: html,
      };
    }
  }

  // 1. CUT SILENCE OR RANGE: e.g. "cut silence between 3 and 7" or "cut from 00:03 to 00:07"
  const cutMatch = lower.match(/(?:cut|trim|remove|delete)\s+(?:silence|dead air|segment|part)?\s*(?:between|from)?\s*(\d+[:.]?\d*)\s*(?:and|to|-)\s*(\d+[:.]?\d*)/i);
  if (cutMatch) {
    const rawStart = cutMatch[1];
    const rawEnd = cutMatch[2];
    const parseTime = (t: string) => {
      if (t.includes(':')) {
        const parts = t.split(':').map(Number);
        return parts.length === 2 ? parts[0] * 60 + parts[1] : parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
      return parseFloat(t);
    };

    const cutStart = parseTime(rawStart);
    const cutEnd = parseTime(rawEnd);

    if (cutEnd > cutStart) {
      const cutDuration = cutEnd - cutStart;
      let newClips: Clip[] = [];

      currentState.clips.forEach(clip => {
        const clipEnd = clip.start + clip.duration;

        // Clip entirely before cut
        if (clipEnd <= cutStart) {
          newClips.push(clip);
        }
        // Clip entirely after cut -> ripple left
        else if (clip.start >= cutEnd) {
          newClips.push({
            ...clip,
            start: clip.start - cutDuration,
          });
        }
        // Clip spans across the cut range -> split it into two!
        else if (clip.start < cutStart && clipEnd > cutEnd) {
          // Part 1
          newClips.push({
            ...clip,
            id: `${clip.id}-p1`,
            duration: cutStart - clip.start,
          });
          // Part 2
          newClips.push({
            ...clip,
            id: `${clip.id}-p2`,
            start: cutStart,
            duration: clipEnd - cutEnd,
            trimStart: clip.trimStart + (cutEnd - clip.start),
          });
        }
        // Clip starts before cut and ends during cut
        else if (clip.start < cutStart && clipEnd <= cutEnd) {
          newClips.push({
            ...clip,
            duration: cutStart - clip.start,
          });
        }
        // Clip starts during cut and ends after cut
        else if (clip.start >= cutStart && clipEnd > cutEnd) {
          newClips.push({
            ...clip,
            start: cutStart,
            duration: clipEnd - cutEnd,
            trimStart: clip.trimStart + (cutEnd - clip.start),
          });
        }
      });

      applied.push(`Identified silent window: ${cutStart}s to ${cutEnd}s`);
      applied.push(`Performed ripple deletion (removed ${cutDuration.toFixed(1)}s dead air)`);
      applied.push(`Auto-realigned all downstream clips to prevent gap`);

      return {
        success: true,
        message: `Successfully cut silence between ${cutStart}s and ${cutEnd}s and rippled downstream clips.`,
        appliedActions: applied,
        newClips,
      };
    }
  }

  // 2. INSERT HYPERFRAMES KINETIC TITLE
  if (lower.includes('kinetic') || lower.includes('title') || lower.includes('intro')) {
    // Extract title if quoted or default
    const quotedMatch = prompt.match(/["']([^"']+)["']/);
    const titleText = quotedMatch ? quotedMatch[1] : 'NEXT-GEN AI WORKFLOW';
    const template = HYPERFRAME_TEMPLATES['kinetic-title'];
    const html = template.generateHtml({
      title: titleText,
      subtitle: 'BUILT WITH HYPERFRAMES & AGENT ENGINE',
      color: '#3b82f6',
    });

    const overlayTrack = currentState.tracks.find(t => t.type === 'overlay') || currentState.tracks[1];
    const newClip: Clip = {
      id: `hyperframe-${Date.now()}`,
      trackId: overlayTrack.id,
      name: `HF: ${titleText.slice(0, 15)}...`,
      start: currentState.currentTime,
      duration: template.defaultDuration,
      trimStart: 0,
      type: 'overlay',
      properties: {
        hyperframeCode: html,
        opacity: 1,
      },
    };

    applied.push(`Compiled Hyperframes responsive HTML5/CSS vector template`);
    applied.push(`Injected kinetic typography layer at ${currentState.currentTime.toFixed(1)}s`);
    applied.push(`Set overlay duration to ${template.defaultDuration}s`);

    return {
      success: true,
      message: `Generated and placed animated Kinetic Title "${titleText}" onto the Overlay track.`,
      appliedActions: applied,
      newClips: [...currentState.clips, newClip],
      selectedClipId: newClip.id,
      hyperframePreview: html,
    };
  }

  // 3. INSERT LOWER THIRD
  if (lower.includes('lower third') || lower.includes('presenter') || lower.includes('name tag')) {
    const quotedMatch = prompt.match(/["']([^"']+)["']/);
    const nameText = quotedMatch ? quotedMatch[1] : 'Dr. Elena Vance';
    const template = HYPERFRAME_TEMPLATES['glass-lower-third'];
    const html = template.generateHtml({
      title: nameText,
      subtitle: 'Senior AI Research Engineer',
      color: '#8b5cf6',
    });

    const overlayTrack = currentState.tracks.find(t => t.type === 'overlay') || currentState.tracks[1];
    const newClip: Clip = {
      id: `hyperframe-${Date.now()}`,
      trackId: overlayTrack.id,
      name: `HF: Lower Third - ${nameText}`,
      start: currentState.currentTime,
      duration: template.defaultDuration,
      trimStart: 0,
      type: 'overlay',
      properties: {
        hyperframeCode: html,
        opacity: 1,
      },
    };

    applied.push(`Generated glassmorphic backdrop filter with animated border`);
    applied.push(`Placed presenter lower third at playhead ${currentState.currentTime.toFixed(1)}s`);

    return {
      success: true,
      message: `Added Glassmorphic Lower-Third for "${nameText}" to the Overlay track.`,
      appliedActions: applied,
      newClips: [...currentState.clips, newClip],
      selectedClipId: newClip.id,
      hyperframePreview: html,
    };
  }

  // 4. INSERT SUBSCRIBE / BELL ANIMATION
  if (lower.includes('subscribe') || lower.includes('bell') || lower.includes('cta')) {
    const template = HYPERFRAME_TEMPLATES['subscribe-badge'];
    const html = template.generateHtml({
      title: 'SUBSCRIBE',
      subtitle: 'Get notified for weekly drops',
    });

    const overlayTrack = currentState.tracks.find(t => t.type === 'overlay') || currentState.tracks[1];
    const newClip: Clip = {
      id: `hyperframe-${Date.now()}`,
      trackId: overlayTrack.id,
      name: `HF: Subscribe CTA`,
      start: currentState.currentTime,
      duration: template.defaultDuration,
      trimStart: 0,
      type: 'overlay',
      properties: {
        hyperframeCode: html,
        opacity: 1,
      },
    };

    applied.push(`Generated pulsing subscribe CTA with ringing bell animation`);
    applied.push(`Placed overlay at ${currentState.currentTime.toFixed(1)}s`);

    return {
      success: true,
      message: `Added animated Subscribe & Bell CTA badge via Hyperframes.`,
      appliedActions: applied,
      newClips: [...currentState.clips, newClip],
      selectedClipId: newClip.id,
      hyperframePreview: html,
    };
  }

  // 5. AUTO-GENERATE CAPTIONS
  if (lower.includes('caption') || lower.includes('subtitle') || lower.includes('transcript')) {
    const captionTrack = currentState.tracks.find(t => t.type === 'caption') || currentState.tracks[2];
    
    // Sample synchronized punchy captions
    const sampleCaptions = [
      { text: "Welcome to the future of AI video editing.", start: 0.5, dur: 2.8 },
      { text: "No subscriptions, zero render lag,", start: 3.5, dur: 2.4 },
      { text: "and complete multi-track compositing.", start: 6.2, dur: 2.6 },
      { text: "Powered by deterministic Hyperframes graphics!", start: 9.0, dur: 3.2 },
    ];

    const generatedCaptionClips: Clip[] = sampleCaptions.map((c, i) => ({
      id: `caption-${Date.now()}-${i}`,
      trackId: captionTrack.id,
      name: `Sub: "${c.text.slice(0, 15)}..."`,
      start: c.start,
      duration: c.dur,
      trimStart: 0,
      type: 'caption',
      properties: {
        text: c.text,
        color: '#facc15', // punchy yellow
        fontSize: 22,
      },
    }));

    // Filter out existing captions on that track or append
    const otherClips = currentState.clips.filter(c => c.trackId !== captionTrack.id);

    applied.push(`Simulated neural audio speech transcription (Whisper pipeline)`);
    applied.push(`Generated 4 word-synced animated subtitle cards`);
    applied.push(`Applied viral highlight styling (bold sans, punchy yellow accent, drop-shadow)`);

    return {
      success: true,
      message: `Generated and synced 4 auto-caption blocks across the timeline!`,
      appliedActions: applied,
      newClips: [...otherClips, ...generatedCaptionClips],
    };
  }

  // 6. ADD BACKGROUND MUSIC & AUTO-DUCK
  if (lower.includes('music') || lower.includes('bgm') || lower.includes('audio') || lower.includes('duck')) {
    const audioTrack = currentState.tracks.find(t => t.type === 'audio') || currentState.tracks[3];
    const newClip: Clip = {
      id: `audio-${Date.now()}`,
      trackId: audioTrack.id,
      name: `BGM: Cyber Lo-Fi Chill`,
      start: 0,
      duration: 18,
      trimStart: 0,
      type: 'audio',
      properties: {
        volume: 0.25, // Auto-ducked to 25%
      },
    };

    applied.push(`Loaded ambient electronic background score`);
    applied.push(`Auto-ducked volume to 25% (-12dB) to ensure crystal clear vocal intelligibility`);
    applied.push(`Placed on dedicated Audio track`);

    return {
      success: true,
      message: `Added background soundtrack with 25% vocal auto-ducking.`,
      appliedActions: applied,
      newClips: [...currentState.clips, newClip],
      selectedClipId: newClip.id,
    };
  }

  // 7. SPLIT CLIP AT PLAYHEAD
  if (lower.includes('split') || lower.includes('slice')) {
    const playhead = currentState.currentTime;
    const targetClip = currentState.clips.find(
      c => c.id === currentState.selectedClipId || (c.start <= playhead && c.start + c.duration > playhead)
    );

    if (!targetClip) {
      return {
        success: false,
        message: `No clip found at current playhead (${playhead.toFixed(2)}s) to split.`,
        appliedActions: [],
      };
    }

    const firstDuration = playhead - targetClip.start;
    const secondDuration = targetClip.duration - firstDuration;

    if (firstDuration < 0.1 || secondDuration < 0.1) {
      return {
        success: false,
        message: `Split position is too close to clip boundary.`,
        appliedActions: [],
      };
    }

    const part1: Clip = {
      ...targetClip,
      duration: firstDuration,
    };

    const part2: Clip = {
      ...targetClip,
      id: `clip-${Date.now()}`,
      name: `${targetClip.name} (Part 2)`,
      start: playhead,
      duration: secondDuration,
      trimStart: targetClip.trimStart + firstDuration,
    };

    const otherClips = currentState.clips.filter(c => c.id !== targetClip.id);

    applied.push(`Calculated keyframe cut position at ${playhead.toFixed(2)}s`);
    applied.push(`Split "${targetClip.name}" into two independent clips`);

    return {
      success: true,
      message: `Split clip "${targetClip.name}" at ${playhead.toFixed(2)}s.`,
      appliedActions: applied,
      newClips: [...otherClips, part1, part2],
      selectedClipId: part2.id,
    };
  }

  // 8. GENERAL AI ASSISTANT / FALLBACK
  return {
    success: true,
    message: `Processed instruction: "${prompt}". Try asking for:
- "Cut silence between 3 and 7"
- "Add kinetic title 'My Video' with Hyperframes"
- "Add lower third 'Alex Smith' 'Host'"
- "Add subscribe animation"
- "Auto-generate captions"
- "Add background music with ducking"
- "Split clip at playhead"`,
    appliedActions: ['Analyzed natural language intent', 'Suggested context-aware editing workflows'],
  };
}
