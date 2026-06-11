import React, { useEffect } from 'react'
import { Scene } from './components/three/Scene'
import { Sidebar } from './components/ui/Sidebar'
import { TopBar, SummaryPanel, InspectPanel } from './components/ui/Panels'
import { useStore } from './store'
import { playSfx } from './sfx'

export default function App() {
  const dragging = useStore((s) => s.dragging)

  // hover blip on every interactive element — buttons, links, tabs.
  // (part cards have their own handler; the sfx rate-limiter dedupes)
  useEffect(() => {
    let last = null
    const onOver = (e) => {
      const el = e.target.closest?.('button, a')
      if (el && el !== last) playSfx('hover')
      last = el
    }
    document.addEventListener('pointerover', onOver)
    return () => document.removeEventListener('pointerover', onOver)
  }, [])
  return (
    <>
      <div className={`app ${dragging ? 'is-dragging' : ''}`}>
        <TopBar />
        <Sidebar />
        <main className="viewport">
          <Scene />
          <InspectPanel />
        </main>
        <SummaryPanel />
      </div>
      <div className="crt-vignette" />
      <div className="scanlines" />
    </>
  )
}
