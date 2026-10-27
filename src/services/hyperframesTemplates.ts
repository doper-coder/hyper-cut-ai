export interface HyperframeTemplate {
  id: string;
  name: string;
  description: string;
  category: 'titles' | 'lower-thirds' | 'social' | 'graphics' | 'spatial';
  defaultDuration: number;
  generateHtml: (props: { title?: string; subtitle?: string; color?: string; x?: number; y?: number; width?: number; height?: number }) => string;
}

export const HYPERFRAME_TEMPLATES: Record<string, HyperframeTemplate> = {
  'kinetic-title': {
    id: 'kinetic-title',
    name: 'Kinetic Neon Title',
    description: 'High-energy typography with glowing neon gradient and entrance zoom',
    category: 'titles',
    defaultDuration: 3.5,
    generateHtml: ({ title = 'THE NEXT GENERATION', subtitle = 'AI POWERED VIDEO ENGINE', color = '#3b82f6' }) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 100vw; height: 100vh;
    display: flex; flex-direction: column;
    align-items: center; justify-content: center;
    background: transparent;
    font-family: 'Inter', system-ui, -apple-system, sans-serif;
    overflow: hidden;
  }
  .container {
    text-align: center;
    animation: zoomIntro 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .badge {
    display: inline-block;
    padding: 6px 16px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 9999px;
    color: #93c5fd;
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 3px;
    text-transform: uppercase;
    margin-bottom: 14px;
    animation: fadeSlideDown 0.8s ease-out forwards;
  }
  .title {
    font-size: clamp(32px, 6vw, 64px);
    font-weight: 900;
    letter-spacing: -1px;
    text-transform: uppercase;
    background: linear-gradient(135deg, #ffffff 0%, #a5b4fc 50%, #38bdf8 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    text-shadow: 0 0 40px rgba(56, 189, 248, 0.4);
    line-height: 1.1;
    filter: drop-shadow(0 10px 20px rgba(0,0,0,0.5));
  }
  .subtitle {
    margin-top: 12px;
    font-size: clamp(14px, 2.5vw, 20px);
    font-weight: 600;
    color: #e2e8f0;
    letter-spacing: 4px;
    opacity: 0.9;
    text-shadow: 0 2px 10px rgba(0,0,0,0.8);
  }
  .glow-bar {
    width: 140px;
    height: 4px;
    background: linear-gradient(90deg, transparent, ${color}, transparent);
    margin: 16px auto 0;
    border-radius: 2px;
    box-shadow: 0 0 16px ${color};
    animation: barExpand 1.4s ease-out forwards;
  }
  @keyframes zoomIntro {
    0% { transform: scale(0.7) translateY(30px); opacity: 0; filter: blur(12px); }
    100% { transform: scale(1) translateY(0); opacity: 1; filter: blur(0); }
  }
  @keyframes fadeSlideDown {
    0% { transform: translateY(-20px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes barExpand {
    0% { width: 0; opacity: 0; }
    100% { width: 180px; opacity: 1; }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="badge">PRODUCED WITH HYPERFRAMES</div>
    <h1 class="title">${title}</h1>
    <p class="subtitle">${subtitle}</p>
    <div class="glow-bar"></div>
  </div>
</body>
</html>`
  },

  'glass-lower-third': {
    id: 'glass-lower-third',
    name: 'Glassmorphic Lower Third',
    description: 'Clean presenter tag with frosted glass and glowing neon border',
    category: 'lower-thirds',
    defaultDuration: 4.0,
    generateHtml: ({ title = 'Alex Rivera', subtitle = 'Lead AI Architect & Director', color = '#8b5cf6' }) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 100vw; height: 100vh;
    display: flex; align-items: flex-end;
    padding: 60px 80px;
    background: transparent;
    font-family: 'Inter', system-ui, sans-serif;
    overflow: hidden;
  }
  .card {
    display: flex;
    align-items: center;
    gap: 18px;
    background: rgba(15, 23, 42, 0.75);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-left: 4px solid ${color};
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5), 0 0 25px rgba(139, 92, 246, 0.25);
    border-radius: 12px;
    padding: 14px 28px 14px 20px;
    animation: slideInLeft 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  .avatar {
    width: 44px; height: 44px;
    border-radius: 50%;
    background: linear-gradient(135deg, ${color}, #3b82f6);
    display: flex; align-items: center; justify-content: center;
    font-weight: 800; color: white; font-size: 18px;
    box-shadow: 0 0 15px rgba(139, 92, 246, 0.5);
  }
  .info { display: flex; flex-direction: column; }
  .name {
    font-size: 20px;
    font-weight: 800;
    color: #ffffff;
    letter-spacing: -0.3px;
    text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  }
  .role {
    font-size: 13px;
    font-weight: 500;
    color: #cbd5e1;
    margin-top: 2px;
  }
  @keyframes slideInLeft {
    0% { transform: translateX(-80px); opacity: 0; filter: blur(8px); }
    100% { transform: translateX(0); opacity: 1; filter: blur(0); }
  }
</style>
</head>
<body>
  <div class="card">
    <div class="avatar">${title.charAt(0)}</div>
    <div class="info">
      <div class="name">${title}</div>
      <div class="role">${subtitle}</div>
    </div>
  </div>
</body>
</html>`
  },

  'subscribe-badge': {
    id: 'subscribe-badge',
    name: 'Animated Subscribe & Bell',
    description: 'Pulsing subscribe call to action with bell ring animation',
    category: 'social',
    defaultDuration: 3.5,
    generateHtml: ({ title = 'Subscribe Now', subtitle = 'Don\'t miss future episodes' }) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 100vw; height: 100vh;
    display: flex; align-items: center; justify-content: center;
    background: transparent;
    font-family: 'Inter', system-ui, sans-serif;
    overflow: hidden;
  }
  .container {
    display: flex; align-items: center; gap: 16px;
    background: rgba(17, 24, 39, 0.9);
    border: 1px solid rgba(255, 255, 255, 0.15);
    padding: 12px 24px;
    border-radius: 9999px;
    box-shadow: 0 15px 35px rgba(0,0,0,0.6), 0 0 30px rgba(239, 68, 68, 0.3);
    animation: popBounce 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
  }
  .sub-btn {
    background: #ef4444;
    color: white;
    font-weight: 700;
    font-size: 15px;
    padding: 8px 18px;
    border-radius: 9999px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    box-shadow: 0 4px 12px rgba(239, 68, 68, 0.4);
    animation: pulseButton 1.5s infinite alternate ease-in-out;
  }
  .bell {
    font-size: 22px;
    animation: ringBell 1.2s 0.6s infinite ease-in-out;
    transform-origin: top center;
  }
  .label {
    color: #f3f4f6;
    font-size: 13px;
    font-weight: 500;
  }
  @keyframes popBounce {
    0% { transform: scale(0.4) translateY(40px); opacity: 0; }
    100% { transform: scale(1) translateY(0); opacity: 1; }
  }
  @keyframes pulseButton {
    0% { transform: scale(1); }
    100% { transform: scale(1.05); box-shadow: 0 0 20px rgba(239, 68, 68, 0.7); }
  }
  @keyframes ringBell {
    0%, 100% { transform: rotate(0); }
    20% { transform: rotate(18deg); }
    40% { transform: rotate(-18deg); }
    60% { transform: rotate(10deg); }
    80% { transform: rotate(-10deg); }
  }
</style>
</head>
<body>
  <div class="container">
    <div class="bell">🔔</div>
    <div class="sub-btn">${title}</div>
    <div class="label">${subtitle}</div>
  </div>
</body>
</html>`
  },

  'stat-counter': {
    id: 'stat-counter',
    name: 'Tech Stat & Metric Counter',
    description: 'Animated key metric box with progress bar for educational or review clips',
    category: 'graphics',
    defaultDuration: 4.0,
    generateHtml: ({ title = '+340% FASTER', subtitle = 'Zero Latency Rendering' }) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 100vw; height: 100vh;
    display: flex; align-items: flex-end; justify-content: flex-end;
    padding: 60px 80px;
    background: transparent;
    font-family: 'JetBrains Mono', monospace;
    overflow: hidden;
  }
  .box {
    background: rgba(10, 15, 29, 0.85);
    border: 1px solid #10b981;
    box-shadow: 0 10px 30px rgba(0,0,0,0.6), 0 0 25px rgba(16, 185, 129, 0.25);
    padding: 18px 24px;
    border-radius: 8px;
    text-align: right;
    animation: fadeInSlide 0.7s ease-out forwards;
  }
  .num {
    font-size: 32px;
    font-weight: 800;
    color: #10b981;
    text-shadow: 0 0 12px rgba(16, 185, 129, 0.6);
  }
  .desc {
    color: #94a3b8;
    font-size: 12px;
    margin-top: 4px;
    letter-spacing: 1px;
    text-transform: uppercase;
  }
  .progress {
    height: 3px;
    background: rgba(255,255,255,0.1);
    margin-top: 12px;
    border-radius: 2px;
    overflow: hidden;
  }
  .progress-fill {
    height: 100%;
    width: 0%;
    background: #10b981;
    animation: fillBar 1.2s 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }
  @keyframes fadeInSlide {
    0% { transform: translateY(30px); opacity: 0; }
    100% { transform: translateY(0); opacity: 1; }
  }
  @keyframes fillBar {
    0% { width: 0%; }
    100% { width: 85%; }
  }
</style>
</head>
<body>
  <div class="box">
    <div class="num">${title}</div>
    <div class="desc">${subtitle}</div>
    <div class="progress"><div class="progress-fill"></div></div>
  </div>
</body>
</html>`
  },

  'spatial-arrow': {
    id: 'spatial-arrow',
    name: 'Spatial Pointing Arrow',
    description: 'Animated glowing neon callout arrow pointing at a circled canvas coordinate',
    category: 'spatial',
    defaultDuration: 3.5,
    generateHtml: ({ title = 'LOOK HERE', color = '#ef4444', x = 50, y = 50 }) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 100vw; height: 100vh;
    background: transparent;
    overflow: hidden;
    font-family: 'Inter', system-ui, sans-serif;
  }
  .anchor {
    position: absolute;
    left: ${x}%;
    top: ${y}%;
    transform: translate(-50%, -100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;
    animation: bounceDown 1.1s cubic-bezier(0.36, 0, 0.66, -0.56) infinite alternate;
  }
  .tag {
    background: ${color};
    color: white;
    font-size: 11px;
    font-weight: 800;
    padding: 4px 10px;
    border-radius: 6px;
    letter-spacing: 1px;
    text-transform: uppercase;
    box-shadow: 0 4px 14px rgba(0,0,0,0.6), 0 0 15px ${color};
    margin-bottom: 6px;
    white-space: nowrap;
  }
  .arrow {
    width: 0; height: 0;
    border-left: 12px solid transparent;
    border-right: 12px solid transparent;
    border-top: 20px solid ${color};
    filter: drop-shadow(0 0 10px ${color});
  }
  .target-ring {
    position: absolute;
    left: ${x}%;
    top: ${y}%;
    transform: translate(-50%, -50%);
    width: 38px; height: 38px;
    border: 3px solid ${color};
    border-radius: 50%;
    animation: ringPulse 1.4s infinite ease-out;
  }
  @keyframes bounceDown {
    0% { transform: translate(-50%, -125%); }
    100% { transform: translate(-50%, -95%); }
  }
  @keyframes ringPulse {
    0% { transform: translate(-50%, -50%) scale(0.6); opacity: 1; }
    100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
  }
</style>
</head>
<body>
  <div class="target-ring"></div>
  <div class="anchor">
    <div class="tag">${title}</div>
    <div class="arrow"></div>
  </div>
</body>
</html>`
  },

  'blur-mask': {
    id: 'blur-mask',
    name: 'Canvas Blur / Privacy Mask',
    description: 'Backdrop-filter blur mask directly over selected region',
    category: 'spatial',
    defaultDuration: 5.0,
    generateHtml: ({ x = 50, y = 50, width = 25, height = 25 }) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 100vw; height: 100vh;
    background: transparent;
    overflow: hidden;
  }
  .blur-box {
    position: absolute;
    left: ${Math.max(0, x - width / 2)}%;
    top: ${Math.max(0, y - height / 2)}%;
    width: ${width}%;
    height: ${height}%;
    backdrop-filter: blur(28px) brightness(0.85);
    background: rgba(0, 0, 0, 0.35);
    border: 1px dashed rgba(255, 255, 255, 0.4);
    border-radius: 12px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
    animation: fadeScale 0.4s ease-out forwards;
  }
  @keyframes fadeScale {
    0% { opacity: 0; transform: scale(0.95); }
    100% { opacity: 1; transform: scale(1); }
  }
</style>
</head>
<body>
  <div class="blur-box"></div>
</body>
</html>`
  },

  'spotlight-callout': {
    id: 'spotlight-callout',
    name: 'Spotlight & Area Highlight',
    description: 'High-tech radar ring and darkened perimeter drawing attention to the circled area',
    category: 'spatial',
    defaultDuration: 4.0,
    generateHtml: ({ title = 'FOCUS AREA', color = '#06b6d4', x = 50, y = 50, width = 30, height = 30 }) => `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    width: 100vw; height: 100vh;
    background: transparent;
    overflow: hidden;
    font-family: 'JetBrains Mono', monospace;
  }
  .spotlight-ring {
    position: absolute;
    left: ${x}%;
    top: ${y}%;
    transform: translate(-50%, -50%);
    width: ${Math.max(60, width * 8)}px;
    height: ${Math.max(60, height * 8)}px;
    border: 2px solid ${color};
    border-radius: 50%;
    box-shadow: 0 0 25px ${color}, inset 0 0 25px ${color};
    animation: radarSpin 3s linear infinite;
  }
  .tag {
    position: absolute;
    left: ${x}%;
    top: ${Math.min(95, y + height / 2 + 6)}%;
    transform: translateX(-50%);
    background: rgba(8, 12, 20, 0.9);
    border: 1px solid ${color};
    color: ${color};
    font-size: 11px;
    font-weight: 700;
    padding: 3px 10px;
    border-radius: 4px;
    letter-spacing: 1.5px;
    text-transform: uppercase;
    box-shadow: 0 0 12px ${color};
    white-space: nowrap;
  }
  @keyframes radarSpin {
    0% { transform: translate(-50%, -50%) rotate(0deg); }
    100% { transform: translate(-50%, -50%) rotate(360deg); }
  }
</style>
</head>
<body>
  <div class="spotlight-ring"></div>
  <div class="tag">${title}</div>
</body>
</html>`
  }
};
