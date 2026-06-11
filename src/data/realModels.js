// "Real" mode GLB manifest, keyed by category. Each model is auto-fitted
// (rotated/scaled/centered) into the same envelope its procedural twin
// occupies — see envelopeFor() in PartModel.jsx.
//
// All models are CC-BY — attribution in README.md "Model credits".
// `rotation` is an optional extra orientation tweak in multiples of 90°,
// applied after the automatic bounding-box alignment.
export const REAL_MODELS = {
  // shellOpacity: the outer shell mesh turns translucent so the build stays
  // visible (the GLB has no removable side panel); 'internal' meshes stay solid
  case: { url: '/models/case.glb', shellOpacity: 0.38, rotation: [0, Math.PI, 0], author: 'jeromy — "Corsair 200R" (CC-BY 4.0)' },
  motherboard: { url: '/models/motherboard.glb', author: 'blue-odym — "ASUS MAXIMUS VI Formula" (CC-BY 4.0)' },
  cpu: { url: '/models/cpu.glb', author: 'Temooor — "AMD Ryzen 5 3600" (CC-BY 4.0)' },
  cooler: { url: '/models/cooler.glb', author: 'bazyaev08 — "Tower CPU Air Cooler" (CC-BY 4.0)' },
  ram: { url: '/models/ram.glb', author: 'poll1980v — "HyperX Fury DDR4" (CC-BY 4.0)' },
  gpu: { url: '/models/gpu.glb', author: 'Arthur_mf — "GeForce RTX 3080 FE" (CC-BY 4.0)' },
  m2: { url: '/models/m2.glb', author: 'gmedranotic — "NVMe M.2 SSD 2280" (CC-BY 4.0)' },
  drive: { url: '/models/drive.glb', author: 'hlupich — "SSD NoName Sata" (CC-BY 4.0)' },
  psu: { url: '/models/psu.glb', author: 'alexlh2003 — "ATX Power Supply" (CC-BY 4.0)' },
}

export function realModelFor(part) {
  return REAL_MODELS[part.id] ?? REAL_MODELS[part.category] ?? null
}
