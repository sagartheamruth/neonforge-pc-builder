import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { byId } from './data/catalog'
import { emptyBuild, checkPart } from './compat'
import { playSfx } from './sfx'

// Removing a part can orphan others (pull the motherboard and the CPU has
// nowhere to live). cascade() strips dependents in dependency order.
function cascade(build) {
  const b = { ...build, ram: [...build.ram], m2: [...build.m2], drive: [...build.drive] }
  if (!b.case) {
    b.motherboard = null
    b.psu = null
    b.drive = []
  }
  if (!b.motherboard) {
    b.cpu = null
    b.gpu = null
    b.ram = []
    b.m2 = []
  }
  if (!b.cpu) b.cooler = null
  return b
}

// First visit lands on a fully-loaded flagship rig so the scene opens with
// something worth staring at. Reset clears to an empty bench.
export function showcaseBuild() {
  return {
    case: 'case-o11-evo',
    motherboard: 'mobo-x870-tuf',
    cpu: 'cpu-9800x3d',
    cooler: 'cool-lf3-360',
    gpu: 'gpu-5080-tuf',
    psu: 'psu-rm1000e',
    ram: ['ram-z5-16', 'ram-z5-16'],
    m2: ['m2-sn850x-2tb'],
    drive: [],
  }
}

export const useStore = create(
  persist(
    (set, get) => ({
  build: showcaseBuild(),
  // { partId, category } while a sidebar card is being dragged over the scene
  dragging: null,
  // slot id currently highlighted as the drop target
  hoverSlot: null,
  // installed part the user clicked (shows the inspect/remove panel)
  selected: null,
  exploded: false,
  caseTransparent: false,
  modelMode: 'procedural', // 'procedural' | 'real'
  activeCategory: 'case',

  setActiveCategory: (c) => {
    if (get().activeCategory !== c) playSfx('tab')
    set({ activeCategory: c })
  },
  setExploded: (v) => {
    playSfx('explode')
    set({ exploded: v })
  },
  setCaseTransparent: (v) => {
    playSfx('xray')
    set({ caseTransparent: v })
  },
  setModelMode: (m) => {
    if (get().modelMode !== m) playSfx('click')
    set({ modelMode: m })
  },
  startDrag: (partId) => {
    playSfx('grab')
    set({ dragging: { partId, category: byId[partId].category }, selected: null })
  },
  endDrag: () => {
    if (get().dragging) playSfx('cancel')
    set({ dragging: null, hoverSlot: null })
  },
  setHoverSlot: (s) => {
    if (s && s !== get().hoverSlot) playSfx('hover')
    set({ hoverSlot: s })
  },
  select: (sel) => {
    if (sel) playSfx('click')
    set({ selected: sel })
  },

  canInstall: (partId) => checkPart(get().build, byId[partId]),

  // slot: { type: 'cpu'|'motherboard'|..., index? } — index for ram/m2/drive arrays
  install: (partId, slot) => {
    const part = byId[partId]
    const { ok } = checkPart(get().build, part)
    if (!ok) {
      playSfx('error')
      return false
    }
    playSfx('install')
    set((s) => {
      const b = { ...s.build, ram: [...s.build.ram], m2: [...s.build.m2], drive: [...s.build.drive] }
      if (['ram', 'm2', 'drive'].includes(part.category)) {
        const arr = b[part.category]
        let i = slot?.index ?? arr.findIndex((x) => x == null)
        if (i < 0) i = arr.length
        while (arr.length <= i) arr.push(null)
        arr[i] = partId
      } else {
        b[part.category] = partId
      }
      return { build: b, dragging: null, hoverSlot: null }
    })
    return true
  },

  remove: (category, index = null) => {
    playSfx('remove')
    set((s) => {
      const b = { ...s.build, ram: [...s.build.ram], m2: [...s.build.m2], drive: [...s.build.drive] }
      if (index != null) b[category][index] = null
      else b[category] = null
      return { build: cascade(b), selected: null }
    })
  },

      reset: () => {
        playSfx('reset')
        set({ build: emptyBuild(), selected: null, dragging: null, hoverSlot: null })
      },
    }),
    {
      name: 'neonforge-build-v1',
      // persist the build and view settings, never transient drag/selection
      partialize: (s) => ({
        build: s.build,
        modelMode: s.modelMode,
        caseTransparent: s.caseTransparent,
        activeCategory: s.activeCategory,
      }),
    },
  ),
)

// handle for headless tests (scripts/smoke.mjs)
if (typeof window !== 'undefined') window.__pcStore = useStore
