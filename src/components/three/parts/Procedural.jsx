import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { mats, plastic, neon, rgbMaterial, stepRGB } from './materials'
import { BOARD_SIZE, BOARD_T, boardLayout } from '../../../layout'
import { useStore } from '../../../store'

// All models are procedural three.js primitives, oriented for the scene:
// the motherboard plane faces +x, "up" is +y, the case front is +z.

// Hue-cycling neon strip — each instance owns its material so strips can
// run phase-shifted rainbows without fighting over a shared color.
function RGBStrip({ args, position, rotation, offset = 0 }) {
  const mat = useMemo(() => rgbMaterial(), [])
  useFrame(({ clock }) => stepRGB(mat, clock.elapsedTime, offset))
  return (
    <mesh position={position} rotation={rotation} material={mat}>
      <boxGeometry args={args} />
    </mesh>
  )
}

// Glowing ARGB ring sitting on a fan frame (faces ±x like the fan).
function RGBRing({ r, offset = 0 }) {
  const mat = useMemo(() => rgbMaterial(), [])
  useFrame(({ clock }) => stepRGB(mat, clock.elapsedTime, offset))
  return (
    <mesh rotation={[0, Math.PI / 2, 0]} material={mat}>
      <torusGeometry args={[r * 0.92, 0.022, 8, 36]} />
    </mesh>
  )
}

// A square axial fan facing ±x (spin axis = x).
function Fan({ size = 0.9, spin = 6, material = mats.fan, rgb = false, rgbOffset = 0 }) {
  const spinner = useRef()
  useFrame((_, dt) => {
    if (spinner.current) spinner.current.rotation.y += dt * spin
  })
  const r = size / 2
  return (
    <group>
      <mesh material={material}>
        <boxGeometry args={[0.06, size, size]} />
      </mesh>
      {rgb && <RGBRing r={r} offset={rgbOffset} />}
      <mesh rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[r * 0.92, r * 0.92, 0.055, 24]} />
        <meshStandardMaterial color="#0c0e12" roughness={0.9} />
      </mesh>
      {/* local y of this group = world x, so spinner.rotation.y is the hub axis */}
      <group rotation={[0, 0, -Math.PI / 2]}>
        <group ref={spinner}>
          <mesh material={mats.darkMetal}>
            <cylinderGeometry args={[r * 0.25, r * 0.25, 0.1, 16]} />
          </mesh>
          {[...Array(7)].map((_, i) => (
            <group key={i} rotation={[0, (i / 7) * Math.PI * 2, 0]}>
              <mesh position={[r * 0.55, 0, 0]} rotation={[0.5, 0, 0]} material={material}>
                <boxGeometry args={[r * 0.62, 0.015, r * 0.34]} />
              </mesh>
            </group>
          ))}
        </group>
      </group>
    </group>
  )
}

// ─────────────────────────── Case ───────────────────────────
export function CaseModel({ part, dims }) {
  const { w, h, d } = dims
  const solidBody = useMemo(() => plastic(part.color, 0.55), [part.color])
  const t = 0.04
  const exploded = useStore((s) => s.exploded)
  const dragging = useStore((s) => s.dragging)
  const xray = useStore((s) => s.caseTransparent)
  const body = xray ? mats.caseGhost : solidBody
  const showGlass = !exploded && !dragging && !xray
  return (
    <group>
      {/* floor / top / back / far side / front */}
      <mesh position={[0, t / 2, 0]} material={body}>
        <boxGeometry args={[w, t, d]} />
      </mesh>
      <mesh position={[0, h - t / 2, 0]} material={body}>
        <boxGeometry args={[w, t, d]} />
      </mesh>
      <mesh position={[-w / 2 + t / 2, h / 2, 0]} material={body}>
        <boxGeometry args={[t, h, d]} />
      </mesh>
      <mesh position={[0, h / 2, -d / 2 + t / 2]} material={body}>
        <boxGeometry args={[w, h, t]} />
      </mesh>
      <mesh position={[0, h / 2, d / 2 - t / 2]} material={body}>
        <boxGeometry args={[w, h - 0.0, t]} />
      </mesh>
      {/* front intake fans */}
      {!xray &&
        [0.32, 0.62].map((f, i) => (
          <group key={i} position={[0, h * f, d / 2 - 0.12]} rotation={[0, Math.PI / 2, 0]}>
            <Fan size={Math.min(w * 0.6, 1.2)} spin={4 + i} rgb={!!part.rgb} rgbOffset={i * 0.18} />
          </group>
        ))}
      {/* interior glow so the build reads through the glass */}
      <pointLight position={[w * 0.3, h * 0.6, 0.4]} intensity={9} distance={7} decay={2} color="#cfeaff" />
      {part.rgb && (
        <pointLight position={[0, h * 0.28, d * 0.28]} intensity={4} distance={4.5} decay={2} color="#ff2bd6" />
      )}
      {/* neon edge strips + underglow on RGB cases */}
      {!xray && part.rgb && (
        <>
          <RGBStrip args={[0.03, h * 0.86, 0.014]} position={[w / 2 - 0.05, h / 2, d / 2 + 0.008]} offset={0.05} />
          <RGBStrip args={[0.03, h * 0.86, 0.014]} position={[-w / 2 + 0.05, h / 2, d / 2 + 0.008]} offset={0.55} />
          <RGBStrip args={[w * 0.8, 0.025, 0.014]} position={[0, h - 0.08, d / 2 + 0.008]} offset={0.3} />
          <RGBStrip args={[w + 0.26, 0.018, d + 0.26]} position={[0, 0.025, 0]} offset={0.0} />
        </>
      )}
      {/* tempered glass side panel — removed while dragging, exploded or x-ray */}
      {showGlass && (
        <mesh position={[w / 2 + 0.02, h / 2, 0]} material={mats.glass}>
          <boxGeometry args={[0.02, h - 0.1, d - 0.1]} />
        </mesh>
      )}
      {/* feet */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={i} position={[sx * (w / 2 - 0.2), -0.05, sz * (d / 2 - 0.3)]} material={mats.black}>
          <cylinderGeometry args={[0.09, 0.11, 0.1, 12]} />
        </mesh>
      ))}
      {/* PSU shroud — only in towers; compact cases have no bottom bay */}
      {h >= 3 && (
        <mesh position={[0, 1.0, -d / 4 + 0.2]} material={body}>
          <boxGeometry args={[w - 0.1, 0.03, d / 2]} />
        </mesh>
      )}
      {/* power button glow + front I/O */}
      {!xray && (
        <>
          <mesh position={[0.3, h - 0.02, d / 2 - 0.3]}>
            <cylinderGeometry args={[0.05, 0.05, 0.05, 16]} />
            <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={2} />
          </mesh>
          {[0, 1].map((i) => (
            <mesh key={i} position={[0.05 - i * 0.18, h + 0.005, d / 2 - 0.3]} material={mats.black}>
              <boxGeometry args={[0.12, 0.015, 0.05]} />
            </mesh>
          ))}
          {/* top exhaust vent slits */}
          {[...Array(6)].map((_, i) => (
            <mesh key={`tv${i}`} position={[0, h + 0.005, -d / 2 + 0.5 + i * 0.22]} material={mats.black}>
              <boxGeometry args={[w * 0.55, 0.012, 0.07]} />
            </mesh>
          ))}
          {/* rear exhaust fan + PCI slot covers */}
          <group position={[0, h - 1.1, -d / 2 + 0.12]} rotation={[0, Math.PI / 2, 0]}>
            <Fan size={Math.min(w * 0.55, 1.1)} spin={5} rgb={!!part.rgb} rgbOffset={0.4} />
          </group>
          {[...Array(7)].map((_, i) => (
            <mesh
              key={`pci${i}`}
              position={[-w / 2 + 0.5 + i * 0.13, Math.max(h - 2.6, 0.55), -d / 2 - 0.005]}
              material={mats.metal}
            >
              <boxGeometry args={[0.1, Math.min(1.0, h - 1.5), 0.02]} />
            </mesh>
          ))}
          {/* front mesh strip texture */}
          {[...Array(8)].map((_, i) => (
            <mesh key={`fs${i}`} position={[0, h * 0.15 + i * h * 0.09, d / 2 + 0.005]} material={mats.black}>
              <boxGeometry args={[w * 0.8, 0.02, 0.01]} />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

// ──────────────────────── Motherboard ────────────────────────
// Origin = top-rear corner of the PCB face; extends -y (down) and +z (forward).
export function MotherboardModel({ part }) {
  const { h, w } = BOARD_SIZE[part.specs.formFactor]
  const s = part.specs
  const L = boardLayout(s.formFactor)
  const itx = s.formFactor === 'ITX'
  // decorative details shrink with the board so they stay on the PCB
  const sy = h / BOARD_SIZE.ATX.h
  const sz = w / BOARD_SIZE.ATX.w
  const pcb = useMemo(() => plastic(part.color, 0.6), [part.color])
  return (
    <group>
      <mesh position={[-BOARD_T / 2, -h / 2, w / 2]} material={pcb}>
        <boxGeometry args={[BOARD_T, h, w]} />
      </mesh>
      {/* CPU socket frame */}
      <mesh position={[0.015, L.cpuY, L.cpuZ]} material={mats.metal}>
        <boxGeometry args={[0.03, 0.52, 0.52]} />
      </mesh>
      <mesh position={[0.025, L.cpuY, L.cpuZ]} material={mats.gold}>
        <boxGeometry args={[0.012, 0.4, 0.4]} />
      </mesh>
      {/* VRM heatsinks around the socket */}
      <mesh position={[0.07, L.cpuY + (itx ? 0.38 : 0.43), L.cpuZ]} material={mats.darkMetal}>
        <boxGeometry args={[0.14, itx ? 0.18 : 0.28, itx ? 0.7 : 1.0]} />
      </mesh>
      <mesh position={[0.07, L.cpuY - 0.03, L.cpuZ - (itx ? 0.5 : 0.63)]} material={mats.darkMetal}>
        <boxGeometry args={[0.14, itx ? 0.7 : 1.1, itx ? 0.22 : 0.3]} />
      </mesh>
      {/* rear I/O block */}
      <mesh position={[0.11, -0.65, 0.0]} material={mats.black}>
        <boxGeometry args={[0.22, 0.9, 0.18]} />
      </mesh>
      {/* RAM slots */}
      {[...Array(s.ramSlots)].map((_, i) => (
        <mesh key={i} position={[0.025, L.ramY, L.ramBase + i * L.ramPitch]} material={mats.black}>
          <boxGeometry args={[0.05, 1.4, 0.07]} />
        </mesh>
      ))}
      {/* PCIe x16 slot */}
      <mesh position={[0.03, L.pcieY, 0.9]} material={plastic('#3a3f4a')}>
        <boxGeometry args={[0.06, 0.06, 1.1]} />
      </mesh>
      {/* M.2 slots */}
      {[...Array(s.m2Slots)].map((_, i) => (
        <mesh key={i} position={[0.012, L.m2Y, L.m2Base + i * L.m2Pitch]} material={mats.darkMetal}>
          <boxGeometry args={[0.02, 0.26, 0.82]} />
        </mesh>
      ))}
      {/* chipset heatsink */}
      {itx ? (
        <mesh position={[0.04, -0.45, 0.25]} material={mats.darkMetal}>
          <boxGeometry args={[0.08, 0.35, 0.35]} />
        </mesh>
      ) : (
        <mesh position={[0.04, L.pcieY - 0.28, 1.9]} material={mats.darkMetal}>
          <boxGeometry args={[0.08, 0.45, 0.45]} />
        </mesh>
      )}
      {/* 24-pin ATX connector */}
      <mesh position={[0.05, L.atx24Y, w - 0.08]} material={mats.black}>
        <boxGeometry args={[0.1, 0.55, 0.12]} />
      </mesh>
      {/* 8-pin EPS connector (top edge) */}
      <mesh position={[0.04, -0.08, 0.3]} material={mats.black}>
        <boxGeometry args={[0.08, 0.1, 0.24]} />
      </mesh>
      {/* electrolytic capacitors around the socket */}
      {[[-0.35, 1.45], [-0.45, 1.38], [-1.15, 0.5], [-1.25, 0.42], [-0.3, 0.38]].map(([dy, dz], i) => (
        <mesh key={`cap${i}`} position={[0.035, dy * sy, dz * sz]} rotation={[0, 0, Math.PI / 2]} material={mats.metal}>
          <cylinderGeometry args={[0.025, 0.025, 0.05, 8]} />
        </mesh>
      ))}
      {/* SATA port block */}
      <mesh position={[0.05, L.sataY, L.sataZ]} material={mats.black}>
        <boxGeometry args={[0.09, 0.22, 0.3]} />
      </mesh>
      {/* assorted ICs */}
      {[[-1.5, 1.9, 0.18], [-2.2, 1.3, 0.12], [-1.35, 0.3, 0.1], [-2.6, 0.6, 0.14]].map(([dy, dz, s], i) => (
        <mesh key={`ic${i}`} position={[0.022, dy * sy, dz * sz]} material={mats.black}>
          <boxGeometry args={[0.012, s, s]} />
        </mesh>
      ))}
      {/* CMOS battery + PCIe x1 — full-size boards only, ITX has no room */}
      {!itx && (
        <>
          <mesh position={[0.025, -2.1 * sy, 1.25 * sz]} rotation={[0, 0, Math.PI / 2]} material={mats.metal}>
            <cylinderGeometry args={[0.09, 0.09, 0.02, 14]} />
          </mesh>
          <mesh position={[0.03, -1.5 * sy, 0.65 * sz]} material={plastic('#3a3f4a')}>
            <boxGeometry args={[0.05, 0.05, 0.4]} />
          </mesh>
        </>
      )}
      {/* front-panel header pins */}
      <mesh position={[0.03, -h + 0.08, w - 0.25]} material={mats.gold}>
        <boxGeometry args={[0.04, 0.05, 0.22]} />
      </mesh>
    </group>
  )
}

// ─────────────────────────── CPU ───────────────────────────
export function CpuModel({ part }) {
  return (
    <group>
      <mesh material={mats.pcbGreen}>
        <boxGeometry args={[0.03, 0.4, 0.4]} />
      </mesh>
      <mesh position={[0.02, 0, 0]} material={mats.metal}>
        <boxGeometry args={[0.025, 0.32, 0.32]} />
      </mesh>
      <mesh position={[0.034, 0.1, -0.08]}>
        <boxGeometry args={[0.002, 0.06, 0.14]} />
        <meshStandardMaterial color="#444a55" roughness={0.3} metalness={0.8} />
      </mesh>
      {/* corner pin-1 marker */}
      <mesh position={[0.017, -0.16, -0.16]} material={mats.gold}>
        <boxGeometry args={[0.004, 0.04, 0.04]} />
      </mesh>
      {/* substrate caps */}
      {[...Array(3)].map((_, i) => (
        <mesh key={i} position={[0.017, 0.17, -0.06 + i * 0.06]} material={mats.black}>
          <boxGeometry args={[0.006, 0.025, 0.04]} />
        </mesh>
      ))}
    </group>
  )
}

// ────────────────────────── Cooler ──────────────────────────
// Origin at the mount face (board surface); extends +x by height.
export function CoolerModel({ part }) {
  const hx = part.specs.height / 100
  const tower = hx > 0.8
  const body = useMemo(() => plastic(part.color, 0.5), [part.color])
  if (!tower) {
    // low-profile: heatsink puck + top-down fan
    return (
      <group>
        <mesh position={[hx * 0.35, 0, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.metal}>
          <cylinderGeometry args={[0.42, 0.46, hx * 0.6, 20]} />
        </mesh>
        <group position={[hx * 0.8, 0, 0]} rotation={[0, 0, 0]}>
          <Fan size={0.85} spin={8} rgb={!!part.rgb} rgbOffset={0.25} />
        </group>
        {[...Array(5)].map((_, i) => (
          <mesh key={i} position={[hx * 0.35, 0, 0]} rotation={[(i / 5) * Math.PI, 0, 0]} material={mats.metal}>
            <boxGeometry args={[hx * 0.55, 0.02, 0.9]} />
          </mesh>
        ))}
      </group>
    )
  }
  const dual = part.specs.coolingW > 240
  return (
    <group>
      {/* cold plate + heatpipes */}
      <mesh position={[0.04, 0, 0]} material={mats.copper}>
        <boxGeometry args={[0.08, 0.42, 0.42]} />
      </mesh>
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[hx * 0.45, -0.14 + i * 0.1, 0]} rotation={[0, 0, Math.PI / 2]} material={mats.copper}>
          <cylinderGeometry args={[0.025, 0.025, hx * 0.85, 8]} />
        </mesh>
      ))}
      {/* fin stacks — individual plates so it reads as a heatsink */}
      {(dual ? [-0.5, 0.5] : [0]).map((zc) => (
        <group key={zc}>
          {[...Array(10)].map((_, i) => (
            <mesh
              key={i}
              position={[hx * 0.55 - (hx * 0.75) / 2 + (i + 0.5) * ((hx * 0.75) / 10), 0, zc]}
              material={body}
            >
              <boxGeometry args={[(hx * 0.75) / 10 - 0.025, 1.2, 0.55]} />
            </mesh>
          ))}
          {/* top cap */}
          <mesh position={[hx * 0.55 + (hx * 0.75) / 2, 0, zc]} material={mats.darkMetal}>
            <boxGeometry args={[0.035, 1.22, 0.57]} />
          </mesh>
        </group>
      ))}
      {/* fan(s) flush against the fin stack, blowing front→rear */}
      <group position={[hx * 0.55, 0, dual ? -0.85 : -0.34]} rotation={[0, Math.PI / 2, 0]}>
        <Fan size={Math.min(1.2, hx * 0.8)} spin={7} />
      </group>
      {dual && (
        <group position={[hx * 0.55, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
          <Fan size={Math.min(1.2, hx * 0.8)} spin={7.5} />
        </group>
      )}
    </group>
  )
}

// ─────────────────────────── RAM ───────────────────────────
// Origin at the slot; stick extends +x (out of the board), runs along y.
export function RamModel({ part }) {
  const body = useMemo(() => plastic(part.color, 0.45), [part.color])
  const rgb = !!part.rgb
  return (
    <group>
      <mesh position={[0.16, 0, 0]} material={mats.pcbDark}>
        <boxGeometry args={[0.31, 1.33, 0.03]} />
      </mesh>
      <mesh position={[0.18, 0, 0.025]} material={body}>
        <boxGeometry args={[0.3, 1.33, 0.02]} />
      </mesh>
      <mesh position={[0.18, 0, -0.025]} material={body}>
        <boxGeometry args={[0.3, 1.33, 0.02]} />
      </mesh>
      {rgb && <RGBStrip args={[0.04, 1.3, 0.05]} position={[0.33, 0, 0]} offset={0.7} />}
      <mesh position={[0.015, 0, 0]} material={mats.gold}>
        <boxGeometry args={[0.03, 1.3, 0.025]} />
      </mesh>
      {/* memory ICs under the spreader edge */}
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[0.1, -0.5 + i * 0.33, 0.037]} material={mats.black}>
          <boxGeometry args={[0.12, 0.18, 0.006]} />
        </mesh>
      ))}
      {/* heatspreader notch */}
      <mesh position={[0.33, 0.45, 0]} rotation={[0, 0, -0.5]} material={mats.darkMetal}>
        <boxGeometry args={[0.05, 0.3, 0.052]} />
      </mesh>
    </group>
  )
}

// ─────────────────────────── GPU ───────────────────────────
// Origin at card center. Length along z, width (slot→front) along x,
// thickness along y. PCB on top, fans facing down.
export function GpuModel({ part }) {
  const len = part.specs.length / 100
  const fans = len > 3.2 ? 3 : len > 2.6 ? 2 : 2
  const shroud = useMemo(() => plastic(part.color, 0.45), [part.color])
  const thick = part.specs.tdp > 300 ? 0.62 : 0.42
  return (
    <group>
      {/* PCB */}
      <mesh position={[-0.06, thick / 2 - 0.02, 0]} material={mats.pcbDark}>
        <boxGeometry args={[1.05, 0.035, len * 0.96]} />
      </mesh>
      {/* shroud + heatsink body */}
      <mesh position={[0, -0.04, 0]} material={shroud}>
        <boxGeometry args={[1.12, thick - 0.12, len]} />
      </mesh>
      {/* fans on the underside */}
      {[...Array(fans)].map((_, i) => (
        <group
          key={i}
          position={[0, -thick / 2 + 0.04, -len / 2 + (len / (fans + 1)) * (i + 1)]}
          rotation={[0, 0, Math.PI / 2]}
        >
          <Fan size={Math.min(0.95, len / (fans + 0.6))} spin={9 + i} />
        </group>
      ))}
      {/* rear bracket + display ports */}
      <mesh position={[0, 0.05, -len / 2 - 0.02]} material={mats.metal}>
        <boxGeometry args={[1.1, thick + 0.25, 0.03]} />
      </mesh>
      {[-0.3, -0.05, 0.2].map((ox, i) => (
        <mesh key={`dp${i}`} position={[ox, 0.02, -len / 2 - 0.045]} material={mats.black}>
          <boxGeometry args={[0.16, 0.06, 0.025]} />
        </mesh>
      ))}
      {/* backplate vent slits */}
      {[...Array(5)].map((_, i) => (
        <mesh key={`slit${i}`} position={[-0.1 + i * 0.16, thick / 2 + 0.005, len / 2 - 0.35]} material={mats.black}>
          <boxGeometry args={[0.07, 0.012, 0.5]} />
        </mesh>
      ))}
      {/* 8-pin power plug on top, mid-length */}
      <mesh position={[0.42, thick / 2 - 0.02, len * 0.1]} material={mats.black}>
        <boxGeometry args={[0.24, 0.12, 0.18]} />
      </mesh>
      {/* heatpipes peeking out the inner side */}
      {[...Array(3)].map((_, i) => (
        <mesh
          key={`hp${i}`}
          position={[-0.52, -0.02, -len / 4 + i * (len / 4)]}
          rotation={[Math.PI / 2, 0, 0]}
          material={mats.copper}
        >
          <cylinderGeometry args={[0.028, 0.028, 0.3, 8]} />
        </mesh>
      ))}
      {/* PCIe edge connector */}
      <mesh position={[-0.35, thick / 2 + 0.03, -len / 2 + 0.75]} material={mats.gold}>
        <boxGeometry args={[0.02, 0.06, 0.9]} />
      </mesh>
      {/* side accent — neon brand bar */}
      <mesh position={[0.45, 0, len * 0.1]} material={part.specs.tdp > 250 ? neon.magenta : neon.cyan}>
        <boxGeometry args={[0.2, 0.06, len * 0.5]} />
      </mesh>
    </group>
  )
}

// ─────────────────────────── M.2 ───────────────────────────
export function M2Model({ part }) {
  const body = useMemo(() => plastic(part.color, 0.5), [part.color])
  return (
    <group>
      <mesh material={mats.pcbDark}>
        <boxGeometry args={[0.025, 0.22, 0.8]} />
      </mesh>
      <mesh position={[0.02, 0, 0.05]} material={body}>
        <boxGeometry args={[0.02, 0.2, 0.55]} />
      </mesh>
      <mesh position={[0.005, 0, -0.39]} material={mats.gold}>
        <boxGeometry args={[0.02, 0.18, 0.04]} />
      </mesh>
    </group>
  )
}

// ────────────────────────── Drive ──────────────────────────
export function DriveModel({ part }) {
  const hdd = part.specs.kind === 'HDD'
  const body = useMemo(() => plastic(part.color, hdd ? 0.4 : 0.55), [part.color, hdd])
  return hdd ? (
    <group>
      <mesh material={body}>
        <boxGeometry args={[1.02, 0.26, 1.47]} />
      </mesh>
      <mesh position={[0.1, 0.135, -0.1]} material={mats.metal}>
        <cylinderGeometry args={[0.4, 0.4, 0.01, 24]} />
      </mesh>
      {/* actuator + label + SATA connector */}
      <mesh position={[-0.32, 0.135, 0.45]} rotation={[0, 0.5, 0]} material={mats.darkMetal}>
        <boxGeometry args={[0.1, 0.008, 0.5]} />
      </mesh>
      <mesh position={[0, 0.137, -0.45]} material={mats.metal}>
        <boxGeometry args={[0.85, 0.004, 0.4]} />
      </mesh>
      <mesh position={[0.25, -0.06, -0.74]} material={mats.black}>
        <boxGeometry args={[0.45, 0.07, 0.04]} />
      </mesh>
    </group>
  ) : (
    <group>
      <mesh material={body}>
        <boxGeometry args={[0.7, 0.07, 1.0]} />
      </mesh>
      <mesh position={[0, 0.04, 0]} material={mats.darkMetal}>
        <boxGeometry args={[0.5, 0.005, 0.7]} />
      </mesh>
      <mesh position={[0.15, 0, -0.51]} material={mats.black}>
        <boxGeometry args={[0.35, 0.05, 0.03]} />
      </mesh>
    </group>
  )
}

// ─────────────────────────── PSU ───────────────────────────
export function PsuModel({ part }) {
  const sfx = part.specs.form === 'SFX'
  const w = sfx ? 1.25 : 1.5 // along x
  const h = sfx ? 0.64 : 0.86
  const d = sfx ? 1.0 : 1.4 // along z
  const body = useMemo(() => plastic(part.color, 0.5), [part.color])
  const rocker = useMemo(() => plastic('#8a3326', 0.5), [])
  return (
    <group>
      <mesh material={body}>
        <boxGeometry args={[w, h, d]} />
      </mesh>
      <group position={[0, h / 2 - 0.02, 0]} rotation={[0, 0, Math.PI / 2]}>
        <Fan size={Math.min(w, d) * 0.8} spin={3} />
      </group>
      {/* modular cable sockets */}
      {[...Array(4)].map((_, i) => (
        <mesh key={i} position={[-w / 2 + 0.2 + i * 0.28, 0.1, d / 2 + 0.005]} material={mats.black}>
          <boxGeometry args={[0.18, 0.12, 0.03]} />
        </mesh>
      ))}
      <mesh position={[0, -0.1, d / 2 + 0.004]}>
        <planeGeometry args={[w * 0.5, 0.18]} />
        <meshStandardMaterial color="#e8b73a" emissive="#a06a10" emissiveIntensity={0.3} />
      </mesh>
      {/* rear: AC inlet + rocker switch + hex grill hint */}
      <mesh position={[-w / 4, 0, -d / 2 - 0.005]} material={mats.black}>
        <boxGeometry args={[0.22, 0.16, 0.03]} />
      </mesh>
      <mesh position={[-w / 4 + 0.25, 0, -d / 2 - 0.005]} material={rocker}>
        <boxGeometry args={[0.1, 0.14, 0.03]} />
      </mesh>
      {[...Array(3)].map((_, i) => (
        <mesh key={i} position={[w / 4, -0.18 + i * 0.18, -d / 2 - 0.003]} material={mats.darkMetal}>
          <boxGeometry args={[0.45, 0.025, 0.01]} />
        </mesh>
      ))}
      {/* side brand plate */}
      <mesh position={[w / 2 + 0.004, 0, 0]} material={mats.darkMetal}>
        <boxGeometry args={[0.01, h * 0.6, d * 0.6]} />
      </mesh>
    </group>
  )
}

export const MODELS = {
  case: CaseModel,
  motherboard: MotherboardModel,
  cpu: CpuModel,
  cooler: CoolerModel,
  ram: RamModel,
  gpu: GpuModel,
  m2: M2Model,
  drive: DriveModel,
  psu: PsuModel,
}
