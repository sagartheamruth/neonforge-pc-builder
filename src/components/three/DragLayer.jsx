import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'
import { byId } from '../../data/catalog'
import { checkPart } from '../../compat'
import { getSlots } from '../../layout'
import { restTransform } from './PCAssembly'
import { PartModel } from './PartModel'

const ghostOk = new THREE.Color('#34d399')
const ghostBad = new THREE.Color('#f87171')

// While a sidebar card is dragged: renders target boxes for every free slot
// of that category, raycasts the cursor against them, snaps a translucent
// ghost of the part to the hovered slot, and installs on release.
export function DragLayer() {
  const dragging = useStore((s) => s.dragging)
  if (!dragging) return null
  return <ActiveDrag key={dragging.partId} dragging={dragging} />
}

function ActiveDrag({ dragging }) {
  const { camera, gl } = useThree()
  const build = useStore((s) => s.build)
  const hoverSlot = useStore((s) => s.hoverSlot)
  const part = byId[dragging.partId]
  const compat = useMemo(() => checkPart(build, part), [build, part])

  const slots = useMemo(
    () => getSlots(build).filter((s) => s.type === dragging.category && !s.occupied),
    [build, dragging.category],
  )

  const meshRefs = useRef({})
  const ghostRef = useRef()
  const [cursorPos, setCursorPos] = useState(null)
  const raycaster = useMemo(() => new THREE.Raycaster(), [])
  const plane = useMemo(() => new THREE.Plane(), [])

  useEffect(() => {
    const onMove = (e) => {
      const rect = gl.domElement.getBoundingClientRect()
      const ndc = new THREE.Vector2(
        ((e.clientX - rect.left) / rect.width) * 2 - 1,
        -((e.clientY - rect.top) / rect.height) * 2 + 1,
      )
      raycaster.setFromCamera(ndc, camera)
      const meshes = Object.values(meshRefs.current).filter(Boolean)
      const hits = raycaster.intersectObjects(meshes, false)
      const st = useStore.getState()
      if (hits.length) {
        st.setHoverSlot(hits[0].object.userData.slotId)
      } else {
        st.setHoverSlot(null)
        // ghost floats on a camera-facing plane through the staging point
        plane.setFromNormalAndCoplanarPoint(
          camera.getWorldDirection(new THREE.Vector3()).negate(),
          new THREE.Vector3(1.8, 2.2, 1.2),
        )
        const p = new THREE.Vector3()
        if (raycaster.ray.intersectPlane(plane, p)) setCursorPos([p.x, p.y, p.z])
      }
    }
    const onUp = () => {
      const st = useStore.getState()
      const slot = slots.find((s) => s.id === st.hoverSlot)
      if (slot && compat.ok) st.install(part.id, slot)
      else st.endDrag()
    }
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp, { once: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
    }
  }, [camera, gl, raycaster, plane, slots, compat.ok, part.id])

  // ghost glides toward the hovered slot's rest position
  useFrame((_, dt) => {
    const g = ghostRef.current
    if (!g) return
    const slot = slots.find((s) => s.id === hoverSlot)
    const target = slot
      ? restTransform(build, slot.type, slot.index, part)
      : cursorPos ?? [1.8, 2.2, 1.2]
    const k = 14
    g.position.x = THREE.MathUtils.damp(g.position.x, target[0], k, dt)
    g.position.y = THREE.MathUtils.damp(g.position.y, target[1], k, dt)
    g.position.z = THREE.MathUtils.damp(g.position.z, target[2], k, dt)
  })

  return (
    <group>
      {slots.map((slot) => (
        <SlotBox
          key={slot.id}
          slot={slot}
          ok={compat.ok}
          hovered={hoverSlot === slot.id}
          reasons={compat.reasons}
          register={(m) => (meshRefs.current[slot.id] = m)}
        />
      ))}
      {/* no slot of this category exists yet (e.g. RAM before a motherboard) */}
      {slots.length === 0 && (
        <Html position={[0, 4.2, 0]} center wrapperClass="slot-tip-wrap">
          <div className="slot-tip bad">
            {compat.reasons[0] ?? 'No free slot for this part'}
          </div>
        </Html>
      )}
      <group ref={ghostRef} position={cursorPos ?? [1.8, 2.2, 1.2]}>
        <group scale={hoverSlot && compat.ok ? 1 : 0.9}>
          <PartModel part={part} build={build} ghost />
        </group>
      </group>
    </group>
  )
}

function SlotBox({ slot, ok, hovered, reasons, register }) {
  const matRef = useRef()
  useFrame(({ clock }) => {
    if (matRef.current) {
      const pulse = 0.5 + Math.sin(clock.elapsedTime * 4) * 0.25
      matRef.current.opacity = hovered ? 0.55 : 0.16 * pulse + 0.08
    }
  })
  const color = ok ? ghostOk : ghostBad
  return (
    <group position={slot.pos}>
      <mesh ref={register} userData={{ slotId: slot.id }}>
        <boxGeometry args={slot.size} />
        <meshBasicMaterial ref={matRef} color={color} transparent depthWrite={false} />
      </mesh>
      <lineSegments>
        <edgesGeometry args={[new THREE.BoxGeometry(...slot.size)]} />
        <lineBasicMaterial color={color} transparent opacity={0.9} />
      </lineSegments>
      {hovered && !ok && (
        <Html position={[0, slot.size[1] / 2 + 0.3, 0]} center wrapperClass="slot-tip-wrap">
          <div className="slot-tip bad">
            {reasons.map((r, i) => (
              <div key={i}>✕ {r}</div>
            ))}
          </div>
        </Html>
      )}
    </group>
  )
}
