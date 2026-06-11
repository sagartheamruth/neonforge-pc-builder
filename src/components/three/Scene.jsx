import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, ContactShadows, Html, Grid, Sparkles, MeshReflectorMaterial } from '@react-three/drei'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'
import { useStore } from '../../store'
import { PCAssembly } from './PCAssembly'
import { DragLayer } from './DragLayer'
import { Cables } from './Cables'

function EmptyHint() {
  const build = useStore((s) => s.build)
  const dragging = useStore((s) => s.dragging)
  if (build.case || dragging) return null
  return (
    <Html position={[0, 2.2, 0]} center wrapperClass="slot-tip-wrap">
      <div className="empty-hint">
        Drag a <b>case</b> from the arsenal to start the build
      </div>
    </Html>
  )
}

export function Scene() {
  const dragging = useStore((s) => s.dragging)
  const select = useStore((s) => s.select)
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [8.6, 4.1, 3.4], fov: 38 }}
      onPointerMissed={() => select(null)}
    >
      <color attach="background" args={['#05060e']} />
      <fog attach="fog" args={['#05060e', 16, 38]} />

      {/* moody key light + neon rim lights from both flanks */}
      <ambientLight intensity={0.78} color="#cfe6ff" />
      <hemisphereLight intensity={0.55} color="#b8d4ff" groundColor="#1a1030" />
      <directionalLight
        position={[7, 9, 5]}
        intensity={1.9}
        color="#eaf2ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
      />
      <directionalLight position={[-8, 6, 4]} intensity={0.7} color="#7df9ff" />
      <directionalLight position={[3, 5, -8]} intensity={0.8} color="#d8e4ff" />
      <directionalLight position={[0, -3, 2]} intensity={0.3} color="#8fa8d8" />
      {/* neon washes — cyan from camera-left, magenta from the rear */}
      <pointLight position={[6, 2.5, 6]} intensity={26} color="#00f0ff" distance={18} decay={2} />
      <pointLight position={[-5, 3, -6]} intensity={30} color="#ff2bd6" distance={18} decay={2} />
      <pointLight position={[0, 7, 0]} intensity={12} color="#7df9ff" distance={14} decay={2} />

      <Suspense fallback={null}>
        <group position={[0, 0.02, 0]}>
          <PCAssembly />
          <Cables />
          <DragLayer />
          <EmptyHint />
          <ContactShadows position={[0, -0.005, 0]} opacity={0.6} scale={14} blur={2.4} far={5} resolution={512} />
        </group>
        {/* wet-asphalt mirror floor — catches every neon strip */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.03, 0]}>
          <planeGeometry args={[70, 70]} />
          <MeshReflectorMaterial
            blur={[300, 80]}
            resolution={1024}
            mixBlur={0.9}
            mixStrength={10}
            roughness={0.8}
            depthScale={1.1}
            minDepthThreshold={0.4}
            maxDepthThreshold={1.4}
            color="#080a14"
            metalness={0.5}
            mirror={0.55}
          />
        </mesh>
        {/* holographic floor grid */}
        <Grid
          position={[0, -0.01, 0]}
          args={[60, 60]}
          cellSize={0.55}
          cellThickness={0.6}
          cellColor="#123a4e"
          sectionSize={2.75}
          sectionThickness={1.1}
          sectionColor="#1d6f86"
          fadeDistance={30}
          fadeStrength={2.2}
          infiniteGrid
        />
        {/* drifting neon dust */}
        <Sparkles count={90} scale={[14, 7, 14]} position={[0, 3.2, 0]} size={2.2} speed={0.28} color="#7df9ff" opacity={0.5} />
        <Sparkles count={45} scale={[14, 7, 14]} position={[0, 3.2, 0]} size={2.6} speed={0.2} color="#ff2bd6" opacity={0.4} />
      </Suspense>

      <EffectComposer disableNormalPass>
        <Bloom mipmapBlur intensity={0.85} luminanceThreshold={0.85} luminanceSmoothing={0.18} radius={0.7} />
        <Vignette eskil={false} offset={0.18} darkness={0.78} />
      </EffectComposer>

      {/* Figma-style navigation: left-drag orbits, right-drag / two-finger
          drag pans the canvas anywhere, scroll zooms */}
      <OrbitControls
        enabled={!dragging}
        makeDefault
        target={[0, 2.0, 0]}
        minDistance={3}
        maxDistance={20}
        enablePan
        panSpeed={1.1}
        screenSpacePanning
        enableDamping
      />
    </Canvas>
  )
}
