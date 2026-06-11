import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../../store'
import { byId } from '../../data/catalog'
import { boardAnchor, boardLayout, caseDims, drivePos, explodeOffset, psuPos } from '../../layout'
import { PartModel } from './PartModel'

// Resting world position for an installed part.
export function restTransform(build, type, index, part) {
  const { d } = caseDims(build)
  const a = build.case ? boardAnchor(build) : { x: 0, y: 2, z: 0 }
  const L = boardLayout(build.motherboard ? byId[build.motherboard].specs.formFactor : 'ATX')
  switch (type) {
    case 'case':
      return [0, 0, 0]
    case 'motherboard':
      return [a.x, a.y, a.z]
    case 'cpu':
      return [a.x + 0.045, a.y + L.cpuY, a.z + L.cpuZ]
    case 'cooler':
      return [a.x + 0.08, a.y + L.cpuY, a.z + L.cpuZ]
    case 'ram':
      return [a.x + 0.02, a.y + L.ramY, a.z + L.ramBase + index * L.ramPitch]
    case 'gpu': {
      const len = part.specs.length / 100
      const thick = part.specs.tdp > 300 ? 0.62 : 0.42
      return [a.x + 0.58, a.y + L.pcieY - 0.04 - thick / 2, -d / 2 + 0.12 + len / 2]
    }
    case 'm2':
      return [a.x + 0.03, a.y + L.m2Y, a.z + L.m2Base + index * L.m2Pitch]
    case 'drive':
      return drivePos(build, index)
    case 'psu':
      return psuPos(build, part.specs.form === 'SFX' ? 0.64 : 0.86)
    default:
      return [0, 0, 0]
  }
}

function AnimatedPart({ type, index, partId, build }) {
  const part = byId[partId]
  const exploded = useStore((s) => s.exploded)
  const select = useStore((s) => s.select)
  const dragging = useStore((s) => s.dragging)
  const ref = useRef()

  const rest = useMemo(() => restTransform(build, type, index, part), [build, type, index, part])
  const target = useMemo(() => {
    if (!exploded || type === 'case') return rest
    const off = explodeOffset(type)
    return [rest[0] + off[0], rest[1] + off[1], rest[2] + off[2]]
  }, [rest, exploded, type])

  // Parts attach instantly where dropped; damping only eases the
  // exploded-view transition.
  useFrame((_, dt) => {
    const g = ref.current
    if (!g) return
    const k = 8
    g.position.x = THREE.MathUtils.damp(g.position.x, target[0], k, dt)
    g.position.y = THREE.MathUtils.damp(g.position.y, target[1], k, dt)
    g.position.z = THREE.MathUtils.damp(g.position.z, target[2], k, dt)
  })

  return (
    <group
      ref={ref}
      position={rest}
      onClick={(e) => {
        if (dragging) return
        e.stopPropagation()
        select({ category: type, index, partId, screen: { x: e.clientX, y: e.clientY } })
      }}
      onPointerOver={(e) => {
        e.stopPropagation()
        document.body.style.cursor = 'pointer'
      }}
      onPointerOut={() => (document.body.style.cursor = 'default')}
    >
      <PartModel part={part} build={build} />
    </group>
  )
}

export function PCAssembly() {
  const build = useStore((s) => s.build)
  const items = []
  if (build.case) items.push({ type: 'case', index: null, partId: build.case })
  if (build.motherboard) items.push({ type: 'motherboard', index: null, partId: build.motherboard })
  if (build.cpu) items.push({ type: 'cpu', index: null, partId: build.cpu })
  if (build.cooler) items.push({ type: 'cooler', index: null, partId: build.cooler })
  if (build.gpu) items.push({ type: 'gpu', index: null, partId: build.gpu })
  if (build.psu) items.push({ type: 'psu', index: null, partId: build.psu })
  build.ram.forEach((id, i) => id && items.push({ type: 'ram', index: i, partId: id }))
  build.m2.forEach((id, i) => id && items.push({ type: 'm2', index: i, partId: id }))
  build.drive.forEach((id, i) => id && items.push({ type: 'drive', index: i, partId: id }))

  return (
    <group>
      {items.map((it) => (
        <AnimatedPart key={`${it.type}-${it.index}-${it.partId}`} {...it} build={build} />
      ))}
    </group>
  )
}
