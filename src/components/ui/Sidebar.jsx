import React from 'react'
import {
  DesktopTower, Circuitry, Cpu, Fan, Memory, GraphicsCard,
  HardDrive, HardDrives, Plug, XCircle, HandGrabbing,
} from '@phosphor-icons/react'
import { CATEGORIES, byCategory, fmtINR } from '../../data/catalog'
import { useStore } from '../../store'
import { checkPart } from '../../compat'
import { playSfx } from '../../sfx'

export const CAT_ICONS = {
  case: DesktopTower,
  motherboard: Circuitry,
  cpu: Cpu,
  cooler: Fan,
  ram: Memory,
  gpu: GraphicsCard,
  m2: HardDrive,
  drive: HardDrives,
  psu: Plug,
}

function PartCard({ part }) {
  const build = useStore((s) => s.build)
  const startDrag = useStore((s) => s.startDrag)
  const compat = checkPart(build, part)

  // Drag-only: a part installs ONLY when dropped on its slot in the scene.
  // DragLayer owns the pointerup; a release anywhere else just cancels.
  // Occupied single slots (case already in, etc.) can't even start a drag.
  const onPointerDown = (e) => {
    if (e.button !== 0) return
    if (compat.occupied) {
      playSfx('error')
      return
    }
    e.preventDefault()
    startDrag(part.id)
  }

  const installedIds = [
    build.case, build.motherboard, build.cpu, build.cooler, build.gpu, build.psu,
    ...build.ram, ...build.m2, ...build.drive,
  ]
  const count = installedIds.filter((id) => id === part.id).length

  return (
    <div
      className={`part-card ${compat.ok ? '' : 'incompat'} ${compat.occupied ? 'occupied' : ''}`}
      onPointerDown={onPointerDown}
      onPointerEnter={() => playSfx('hover')}
      title={compat.ok ? 'Drag onto the bench' : compat.reasons.join('\n')}
    >
      <div className="part-swatch" style={{ background: part.color }}>
        <HandGrabbing size={15} weight="bold" />
      </div>
      <div className="part-info">
        <div className="part-name">
          {part.name}
          {count > 0 && <span className="part-count">×{count}</span>}
        </div>
        <div className="part-blurb">{part.brand} · {part.blurb}</div>
        {!compat.ok && (
          <div className="part-reason">
            <XCircle size={12} weight="bold" /> {compat.reasons[0]}
          </div>
        )}
      </div>
      <div className="part-price">{fmtINR(part.price)}</div>
    </div>
  )
}

export function Sidebar() {
  const active = useStore((s) => s.activeCategory)
  const setActive = useStore((s) => s.setActiveCategory)
  return (
    <aside className="sidebar">
      <div className="panel-label">Arsenal // Parts</div>
      <div className="cat-tabs">
        {CATEGORIES.map((c) => {
          const Icon = CAT_ICONS[c.id]
          return (
            <button
              key={c.id}
              className={`cat-tab ${active === c.id ? 'on' : ''}`}
              onClick={() => setActive(c.id)}
            >
              <Icon size={17} weight={active === c.id ? 'fill' : 'regular'} />
              {c.label}
            </button>
          )
        })}
      </div>
      <div className="part-list">
        {byCategory(active).map((p) => (
          <PartCard key={p.id} part={p} />
        ))}
      </div>
    </aside>
  )
}
