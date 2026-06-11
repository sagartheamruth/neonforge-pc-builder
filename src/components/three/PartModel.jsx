import React, { Suspense, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { useStore } from '../../store'
import { realModelFor } from '../../data/realModels'
import { MODELS } from './parts/Procedural'
import { caseDims, BOARD_SIZE } from '../../layout'

// Envelope a part occupies in part-local space: { size, center }.
// Must mirror the procedural models' footprints so real GLBs land in the
// same place and slot math keeps working.
function envelopeFor(part, build) {
  switch (part.category) {
    case 'case': {
      const { w, h, d } = caseDims(build ?? { case: part.id })
      return { size: [w, h, d], center: [0, h / 2, 0] }
    }
    case 'motherboard': {
      const { h, w } = BOARD_SIZE[part.specs.formFactor]
      return { size: [0.45, h, w], center: [0.16, -h / 2, w / 2] }
    }
    case 'cpu':
      return { size: [0.09, 0.42, 0.42], center: [0.03, 0, 0] }
    case 'cooler': {
      const hx = part.specs.height / 100
      return { size: [hx, 1.35, 1.15], center: [hx / 2, 0, 0] }
    }
    case 'ram':
      return { size: [0.36, 1.35, 0.09], center: [0.18, 0, 0] }
    case 'gpu': {
      const len = part.specs.length / 100
      const thick = part.specs.tdp > 300 ? 0.62 : 0.42
      return { size: [1.12, thick + 0.1, len], center: [0, 0, 0] }
    }
    case 'm2':
      return { size: [0.07, 0.23, 0.82], center: [0.02, 0, 0] }
    case 'drive':
      return part.specs.kind === 'HDD'
        ? { size: [1.02, 0.28, 1.47], center: [0, 0, 0] }
        : { size: [0.72, 0.1, 1.0], center: [0, 0, 0] }
    case 'psu': {
      const sfx = part.specs.form === 'SFX'
      return sfx
        ? { size: [1.25, 0.64, 1.0], center: [0, 0, 0] }
        : { size: [1.5, 0.86, 1.4], center: [0, 0, 0] }
    }
    default:
      return { size: [1, 1, 1], center: [0, 0, 0] }
  }
}

const UNITS = [new THREE.Vector3(1, 0, 0), new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1)]
const byDesc = (sizes) =>
  sizes.map((v, i) => [v, i]).sort((a, b) => b[0] - a[0]).map((p) => p[1])

function FittedGLB({ entry, envelope }) {
  const { scene } = useGLTF(entry.url)
  const fitted = useMemo(() => {
    const obj = scene.clone(true)
    obj.traverse((o) => {
      if (!o.isMesh) return
      o.castShadow = true
      // translucent shell (e.g. the case) so the interior shows
      if (entry.shellOpacity != null) {
        o.material = o.material.clone()
        o.material.transparent = true
        o.material.opacity = entry.shellOpacity
        o.material.depthWrite = false
        o.material.side = THREE.DoubleSide
      }
    })
    const box0 = new THREE.Box3().setFromObject(obj)
    const size0 = box0.getSize(new THREE.Vector3())
    const center0 = box0.getCenter(new THREE.Vector3())

    // Rotate so the model's sorted bbox axes line up with the envelope's
    // sorted axes (pure axis permutation, so the rotated bbox is exact).
    const mo = byDesc(size0.toArray())
    const eo = byDesc(envelope.size)
    const cols = [null, null, null]
    for (let k = 0; k < 3; k++) cols[mo[k]] = UNITS[eo[k]].clone()
    const m = new THREE.Matrix4().makeBasis(cols[0], cols[1], cols[2])
    if (m.determinant() < 0) {
      cols[mo[2]].negate()
      m.makeBasis(cols[0], cols[1], cols[2])
    }
    const qPerm = new THREE.Quaternion().setFromRotationMatrix(m)
    const qExtra = new THREE.Quaternion().setFromEuler(
      new THREE.Euler(...(entry.rotation ?? [0, 0, 0])),
    )
    const q = qExtra.multiply(qPerm)

    const rot = new THREE.Matrix4().makeRotationFromQuaternion(q)
    const sizeR = size0.clone().applyMatrix4(new THREE.Matrix4().extractRotation(rot))
    sizeR.set(Math.abs(sizeR.x), Math.abs(sizeR.y), Math.abs(sizeR.z))
    const s = Math.min(
      envelope.size[0] / sizeR.x,
      envelope.size[1] / sizeR.y,
      envelope.size[2] / sizeR.z,
    )

    const centerR = center0.clone().applyQuaternion(q).multiplyScalar(s)
    const pos = new THREE.Vector3(...envelope.center).sub(centerR)
    return { obj, q, s, pos }
  }, [scene, entry, envelope.size[0], envelope.size[1], envelope.size[2]]) // eslint-disable-line

  return (
    <group position={fitted.pos} scale={fitted.s} quaternion={fitted.q}>
      <primitive object={fitted.obj} />
    </group>
  )
}

// Renders one part: real GLB when the toggle is on and a model exists,
// procedural otherwise (also the Suspense fallback while a GLB streams in).
export function PartModel({ part, build, ghost = false }) {
  const modelMode = useStore((s) => s.modelMode)
  const xray = useStore((s) => s.caseTransparent)
  const Procedural = MODELS[part.category]
  const dims = part.category === 'case' && build ? caseDims(build) : undefined
  const proc = <Procedural part={part} dims={dims} />
  // X-ray always uses the procedural ghost shell for a consistent look
  const real = modelMode === 'real' && !(xray && part.category === 'case') ? realModelFor(part) : null
  if (!real) return proc
  return (
    <Suspense fallback={proc}>
      <FittedGLB entry={real} envelope={envelopeFor(part, build)} />
    </Suspense>
  )
}
