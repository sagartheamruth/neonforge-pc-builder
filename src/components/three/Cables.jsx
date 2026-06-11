import React, { useMemo } from 'react'
import * as THREE from 'three'
import { useStore } from '../../store'
import { byId } from '../../data/catalog'
import { boardAnchor, boardLayout, caseDims, drivePos, isCompact, psuPos, BOARD_SIZE } from '../../layout'

const sleeve = new THREE.MeshStandardMaterial({ color: '#0a0a0c', roughness: 1, metalness: 0 })
const sleeveWarm = new THREE.MeshStandardMaterial({ color: '#100d08', roughness: 1, metalness: 0 })
const sleeveRed = new THREE.MeshStandardMaterial({ color: '#120909', roughness: 1, metalness: 0 })

function Cable({ points, radius = 0.05, material = sleeve }) {
  const geo = useMemo(() => {
    const curve = new THREE.CatmullRomCurve3(points.map((p) => new THREE.Vector3(...p)), false, 'catmullrom', 0.6)
    return new THREE.TubeGeometry(curve, 32, radius, 7, false)
  }, [points, radius]) // eslint-disable-line
  return <mesh geometry={geo} material={material} />
}

// Auto-routed power/data cables. A run renders only when both of its
// endpoints are installed. All routes hug the case the way a tidy build
// would: down the front edge of the tray, along the floor, into the PSU.
export function Cables() {
  const build = useStore((s) => s.build)
  const exploded = useStore((s) => s.exploded)
  if (exploded || !build.case || !build.psu) return null
  return <CableRuns build={build} />
}

function CableRuns({ build }) {
  const { w, h, d } = caseDims(build)
  const a = boardAnchor(build)
  const compact = isCompact(build)
  const psu = byId[build.psu]
  const psuH = psu.specs.form === 'SFX' ? 0.64 : 0.86
  // PSU cable-side face center: +z face in towers, -z (interior) face
  // when the PSU rides at the front of a compact case
  const [px, py, pzc] = psuPos(build, psuH)
  const pz = pzc + (compact ? -0.55 : psu.specs.form === 'SFX' ? 0.5 : 0.7)

  const runs = []
  const L = boardLayout(build.motherboard ? byId[build.motherboard].specs.formFactor : 'ATX')

  if (build.motherboard) {
    const bw = BOARD_SIZE[byId[build.motherboard].specs.formFactor].w
    // 24-pin ATX: PSU → front edge of the board
    const c24 = [a.x + 0.08, a.y + L.atx24Y, a.z + bw - 0.06]
    runs.push({
      key: 'atx24', radius: 0.075, material: sleeve,
      points: [
        [px, py + 0.05, pz],
        compact ? [px + 0.2, py - 0.3, pz - 0.4] : [px + 0.2, py + 0.3, pz + 0.5],
        [a.x + 0.35, 0.75, c24[2] + 0.35],
        [a.x + 0.25, Math.max(a.y - 1.7, 0.5), c24[2] + 0.22],
        c24,
      ],
    })
    // 8-pin EPS: PSU → up the rear wall → top edge of the board
    const eps = [a.x + 0.07, a.y - 0.1, a.z + 0.3]
    runs.push({
      key: 'eps8', radius: 0.05, material: sleeveWarm,
      points: [
        [px - 0.3, py + 0.05, pz - 0.3],
        [a.x + 0.12, 0.9, -d / 2 + 0.35],
        [a.x + 0.1, a.y - 0.9, -d / 2 + 0.3],
        [a.x + 0.12, a.y + 0.12, a.z + 0.1],
        eps,
      ],
    })
  }

  if (build.gpu) {
    const g = byId[build.gpu]
    const len = g.specs.length / 100
    // PCIe power: PSU → top of the card, mid-length
    const plug = [a.x + 1.0, a.y + L.pcieY + 0.02, -d / 2 + 0.12 + len * 0.6]
    runs.push({
      key: 'pcie', radius: 0.055, material: sleeveRed,
      points: [
        [px + 0.3, py + 0.05, pz],
        compact ? [px + 0.5, py - 0.2, pz - 0.4] : [px + 0.7, py + 0.5, pz + 0.6],
        [Math.min(a.x + 1.45, w / 2 - 0.15), Math.max(a.y + L.pcieY - 0.85, 0.25), plug[2] + 0.25],
        [plug[0] + 0.18, plug[1] + 0.3, plug[2] + 0.1],
        plug,
      ],
    })
  }

  build.drive.forEach((id, i) => {
    if (!id) return
    const [dx, dy, dz] = drivePos(build, i)
    // SATA power from PSU
    runs.push({
      key: `sata-pwr-${i}`, radius: 0.035, material: sleeve,
      points: compact
        ? [
            [px + 0.2, py, pz],
            [px + 0.15, dy - 0.3, pz - 0.7],
            [dx + 0.15, dy, dz + 0.7],
            [dx, dy, dz - 0.62],
          ]
        : [
            [px + 0.2, py, pz + 0.2],
            [px + 0.1, 0.25, pz + 1.2],
            [dx + 0.2, dy - 0.1, dz - 0.9],
            [dx, dy, dz - 0.62],
          ],
    })
    if (build.motherboard) {
      // SATA data from the board's port block
      runs.push({
        key: `sata-dat-${i}`, radius: 0.025, material: sleeveRed,
        points: [
          [a.x + 0.06, a.y + L.sataY - 0.05, a.z + L.sataZ],
          [a.x + 0.2, compact ? h - 0.6 : 1.2 + i * 0.1, d / 2 - 1.9],
          [dx - 0.1, dy + 0.05, dz - 0.75],
          [dx + 0.1, dy, dz - 0.62],
        ],
      })
    }
  })

  return (
    <group>
      {runs.map((r) => (
        <Cable key={r.key} points={r.points} radius={r.radius} material={r.material} />
      ))}
    </group>
  )
}
