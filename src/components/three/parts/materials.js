import * as THREE from 'three'

// Shared materials — procedural parts reuse these instead of allocating
// one material per mesh.
export const mats = {
  pcbDark: new THREE.MeshStandardMaterial({ color: '#11161f', roughness: 0.6, metalness: 0.2 }),
  pcbGreen: new THREE.MeshStandardMaterial({ color: '#14301f', roughness: 0.65, metalness: 0.1 }),
  metal: new THREE.MeshStandardMaterial({ color: '#9aa0ab', roughness: 0.35, metalness: 0.9 }),
  darkMetal: new THREE.MeshStandardMaterial({ color: '#2a2d34', roughness: 0.5, metalness: 0.7 }),
  black: new THREE.MeshStandardMaterial({ color: '#16181d', roughness: 0.7, metalness: 0.3 }),
  gold: new THREE.MeshStandardMaterial({ color: '#c8a23c', roughness: 0.4, metalness: 0.9 }),
  copper: new THREE.MeshStandardMaterial({ color: '#b87333', roughness: 0.35, metalness: 0.9 }),
  fan: new THREE.MeshStandardMaterial({ color: '#1c1e24', roughness: 0.8, metalness: 0.1 }),
  // basic material: unlit, so the panel never catches sheen/glow blobs
  glass: new THREE.MeshBasicMaterial({
    color: '#aac4e0', transparent: true, opacity: 0.05,
    side: THREE.DoubleSide, depthWrite: false,
  }),
  // X-ray shell for the transparent-case toggle
  caseGhost: new THREE.MeshBasicMaterial({
    color: '#8fa6bf', transparent: true, opacity: 0.07,
    side: THREE.DoubleSide, depthWrite: false,
  }),
}

export function plastic(color, roughness = 0.6) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.25 })
}

// Fixed neon accents (bright enough to trip the bloom pass)
export const neon = {
  cyan: new THREE.MeshStandardMaterial({ color: '#072a30', emissive: '#00f0ff', emissiveIntensity: 2.4, roughness: 0.4 }),
  magenta: new THREE.MeshStandardMaterial({ color: '#2a0724', emissive: '#ff2bd6', emissiveIntensity: 2.2, roughness: 0.4 }),
  yellow: new THREE.MeshStandardMaterial({ color: '#2a2702', emissive: '#fcee0a', emissiveIntensity: 1.8, roughness: 0.4 }),
}

// Per-instance RGB material for hue-cycling strips/rings. Each call returns
// a fresh material the caller animates via stepRGB(mat, t, offset).
export function rgbMaterial() {
  return new THREE.MeshStandardMaterial({
    color: '#101018', emissive: '#ff0000', emissiveIntensity: 1.9, roughness: 0.35,
  })
}

export function stepRGB(mat, t, offset = 0) {
  mat.emissive.setHSL(((t * 0.07 + offset) % 1 + 1) % 1, 1, 0.55)
}
