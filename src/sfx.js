// Tiny SFX engine. All clips are pre-generated with the ElevenLabs
// sound-generation API (see public/sfx/) and shipped as static assets —
// no API key ever reaches the client. Each play() clones a pooled
// <audio> element so rapid-fire UI sounds can overlap.

const VOLUMES = {
  hover: 0.18,
  click: 0.4,
  tab: 0.35,
  grab: 0.45,
  cancel: 0.35,
  install: 0.6,
  error: 0.45,
  remove: 0.5,
  complete: 0.65,
  explode: 0.5,
  xray: 0.45,
  reset: 0.5,
}

const base = {}
for (const name of Object.keys(VOLUMES)) {
  base[name] = typeof Audio !== 'undefined' ? new Audio(`/sfx/${name}.mp3`) : null
  if (base[name]) base[name].preload = 'auto'
}

let muted = false
try {
  muted = JSON.parse(localStorage.getItem('neonforge-muted') ?? 'false')
} catch {}

const ambient = typeof Audio !== 'undefined' ? new Audio('/sfx/ambient.mp3') : null
if (ambient) {
  ambient.loop = true
  ambient.volume = 0.10
  ambient.preload = 'auto'
}

// Browsers block audio until the first user gesture — unlock everything
// (and fade the room tone in) on the first pointer/key interaction.
let unlocked = false
function unlock() {
  if (unlocked) return
  unlocked = true
  if (ambient && !muted) ambient.play().catch(() => {})
}
if (typeof window !== 'undefined') {
  window.addEventListener('pointerdown', unlock, { once: true })
  window.addEventListener('keydown', unlock, { once: true })
}

let lastHover = 0

export function playSfx(name) {
  if (muted) return
  const src = base[name]
  if (!src) return
  // hovers fire on every card the cursor crosses — rate-limit the tick
  if (name === 'hover') {
    const now = performance.now()
    if (now - lastHover < 70) return
    lastHover = now
  }
  const clip = src.cloneNode()
  clip.volume = VOLUMES[name] ?? 0.4
  clip.play().catch(() => {})
}

export function isMuted() {
  return muted
}

export function setMuted(v) {
  muted = v
  try {
    localStorage.setItem('neonforge-muted', JSON.stringify(v))
  } catch {}
  if (!ambient) return
  if (muted) ambient.pause()
  else if (unlocked) ambient.play().catch(() => {})
}
