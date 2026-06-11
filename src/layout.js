import { byId } from './data/catalog'

// World units: 1 = 100mm. The case sits on y=0, centered on x/z.
// The motherboard mounts on the tray plane at x = TRAY_X facing +x
// (the open side faces the camera). All slot positions derive from the
// board anchor: its top-rear corner.

export const CASE_DIMS = {
  'case-vortex-atx': { w: 2.2, h: 4.6, d: 4.7 },
  'case-micro-m': { w: 2.1, h: 4.0, d: 4.0 },
  'case-ion-itx': { w: 1.6, h: 2.45, d: 3.45 },
}

export const TRAY_GAP = 0.25 // tray inset from the -x wall
export const BOARD_T = 0.04 // PCB thickness

export const BOARD_SIZE = {
  ATX: { h: 3.05, w: 2.44 },
  mATX: { h: 2.44, w: 2.44 },
  ITX: { h: 1.7, w: 1.7 },
}

export function caseDims(build) {
  return CASE_DIMS[build.case] ?? { w: 2.2, h: 4.6, d: 4.7 }
}

export function trayX(build) {
  return -caseDims(build).w / 2 + TRAY_GAP
}

// Board anchor = top-rear corner of the PCB face, in world space.
export function boardAnchor(build) {
  const { h, d } = caseDims(build)
  return { x: trayX(build) + BOARD_T, y: h - 0.35, z: -d / 2 + 0.25 }
}

// Board-relative offsets (from the anchor: dy down, dz forward) for every
// on-board slot, per form factor. ITX boards are 1.7 units square, so the
// ATX offsets would land below the PCB — each size gets its own map.
export const BOARD_LAYOUT = {
  ATX:  { cpuY: -0.75, cpuZ: 0.85, ramY: -0.72, ramBase: 1.55, ramPitch: 0.16, pcieY: -1.72, m2Y: -2.45, m2Base: 0.55, m2Pitch: 1.0, sataY: -2.25, sataZ: 2.1, atx24Y: -1.1 },
  mATX: { cpuY: -0.70, cpuZ: 0.85, ramY: -0.72, ramBase: 1.55, ramPitch: 0.16, pcieY: -1.58, m2Y: -2.18, m2Base: 0.55, m2Pitch: 1.0, sataY: -2.1, sataZ: 2.1, atx24Y: -1.1 },
  ITX:  { cpuY: -0.55, cpuZ: 0.72, ramY: -0.85, ramBase: 1.18, ramPitch: 0.16, pcieY: -1.52, m2Y: -1.4, m2Base: 0.45, m2Pitch: 0.5, sataY: -1.0, sataZ: 0.2, atx24Y: -0.8 },
}

export function boardLayout(formFactor) {
  return BOARD_LAYOUT[formFactor] ?? BOARD_LAYOUT.ATX
}

function buildBoardLayout(build) {
  return boardLayout(build.motherboard ? byId[build.motherboard].specs.formFactor : 'ATX')
}

// Compact (SFF) cases have no room for the PSU under the GPU: the PSU
// rides above the GPU behind the front panel and drives hang from a
// top-rear bracket instead of sitting in floor bays.
export function isCompact(build) {
  return caseDims(build).h < 3
}

export function psuPos(build, psuH = 0.86) {
  const { d } = caseDims(build)
  return isCompact(build)
    ? [0, 0.56 + psuH / 2, d / 2 - 0.68]
    : [0, 0.06 + psuH / 2, -d / 2 + 0.95]
}

export function drivePos(build, index) {
  const { h, d } = caseDims(build)
  const cx = trayX(build)
  return isCompact(build)
    ? [cx + 0.6, h - 0.22 - index * 0.42, -d / 2 + 0.9]
    : [cx + 0.6, 0.38 + index * 0.42, d / 2 - 0.85]
}

// Slot descriptors for the current build. Each: { id, type, index, pos,
// size (hitbox), occupied }. pos is the part's resting position.
export function getSlots(build) {
  const slots = []
  const { w, h, d } = caseDims(build)

  // Empty bench: the case drop zone is the center of the table
  if (!build.case) {
    slots.push({
      id: 'case', type: 'case', index: null,
      pos: [0, 2.2, 0],
      size: [2.6, 4.4, 4.8],
      occupied: false,
    })
  }

  // Motherboard tray
  if (build.case) {
    const a = boardAnchor(build)
    const trayH = Math.min(3.1, h - 0.5)
    slots.push({
      id: 'motherboard', type: 'motherboard', index: null,
      pos: [a.x, a.y - trayH / 2 + 0.05, a.z + 1.25],
      size: [0.15, trayH, Math.min(2.6, d - 0.6)],
      occupied: !!build.motherboard,
    })
    // PSU bay (bottom rear, or front shelf in compact cases)
    slots.push({
      id: 'psu', type: 'psu', index: null,
      pos: psuPos(build, isCompact(build) ? 0.64 : 0.86),
      size: isCompact(build) ? [1.4, 0.8, 1.2] : [w - 0.3, 0.9, 1.6],
      occupied: !!build.psu,
    })
    // Drive bays
    const cs = byId[build.case].specs
    for (let i = 0; i < cs.driveBays; i++) {
      slots.push({
        id: `drive-${i}`, type: 'drive', index: i,
        pos: drivePos(build, i),
        size: [1.1, 0.36, 1.3],
        occupied: !!build.drive[i],
      })
    }
  }

  if (build.motherboard) {
    const a = boardAnchor(build)
    const mb = byId[build.motherboard].specs
    const L = buildBoardLayout(build)

    // CPU socket
    slots.push({
      id: 'cpu', type: 'cpu', index: null,
      pos: [a.x + 0.02, a.y + L.cpuY, a.z + L.cpuZ],
      size: [0.18, 0.55, 0.55],
      occupied: !!build.cpu,
    })
    // Cooler mounts over the CPU
    if (build.cpu) {
      slots.push({
        id: 'cooler', type: 'cooler', index: null,
        pos: [a.x + 0.1, a.y + L.cpuY, a.z + L.cpuZ],
        size: [1.2, 0.9, 0.9],
        occupied: !!build.cooler,
      })
    }
    // RAM slots
    for (let i = 0; i < mb.ramSlots; i++) {
      slots.push({
        id: `ram-${i}`, type: 'ram', index: i,
        pos: [a.x + 0.17, a.y + L.ramY, a.z + L.ramBase + i * L.ramPitch],
        size: [0.42, 1.45, 0.13],
        occupied: !!build.ram[i],
      })
    }
    // PCIe / GPU — card hangs below the slot line, extends forward from rear
    const gpuD = Math.min(2.6, d - 0.4)
    slots.push({
      id: 'gpu', type: 'gpu', index: null,
      pos: [a.x + 0.6, a.y + L.pcieY - 0.25, -d / 2 + 0.15 + gpuD / 2],
      size: [1.2, 0.5, gpuD],
      occupied: !!build.gpu,
    })
    // M.2 slots (flat on the board, below the PCIe slot)
    for (let i = 0; i < mb.m2Slots; i++) {
      slots.push({
        id: `m2-${i}`, type: 'm2', index: i,
        pos: [a.x + 0.03, a.y + L.m2Y, a.z + L.m2Base + i * L.m2Pitch],
        size: [0.12, 0.3, 0.85],
        occupied: !!build.m2[i],
      })
    }
  }

  return slots
}

export function freeSlotsFor(build, category) {
  return getSlots(build).filter((s) => s.type === category && !s.occupied)
}

// Exploded-view offset per slot type — parts slide out of the open side.
export function explodeOffset(type) {
  switch (type) {
    case 'motherboard': return [1.3, 0, 0]
    case 'cpu': return [2.1, 0.35, 0]
    case 'cooler': return [3.0, 0.35, 0]
    case 'ram': return [2.1, 0.7, 0]
    case 'gpu': return [2.4, -0.4, 0.3]
    case 'm2': return [2.0, -0.5, 0]
    case 'drive': return [1.3, 0, 0.9]
    case 'psu': return [1.5, 0, -0.7]
    default: return [0, 0, 0]
  }
}
