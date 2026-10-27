export function formatTimecode(seconds: number, fps: number = 30): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const frames = Math.floor((seconds % 1) * fps);

  const mm = String(mins).padStart(2, '0');
  const ss = String(secs).padStart(2, '0');
  const ff = String(frames).padStart(2, '0');

  return `${mm}:${ss}:${ff}`;
}

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) seconds = 0;
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const ms = Math.floor((seconds % 1) * 10);
  return `${mins}:${String(secs).padStart(2, '0')}.${ms}s`;
}
