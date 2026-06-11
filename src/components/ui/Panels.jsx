import React, { useEffect, useRef, useState } from 'react'
import {
  Toolbox, Cube, Sparkle, ArrowsOutSimple, ArrowsInSimple,
  ArrowCounterClockwise, Lightning, Warning, Eye,
  WarningCircle, Info, CheckCircle, X, Trash, Plug,
  ShoppingCart, ArrowSquareOut, Storefront, ClipboardText,
  SpeakerHigh, SpeakerSlash,
} from '@phosphor-icons/react'
import { useStore } from '../../store'
import { byId, CATEGORIES, buyLinks, fmtINR } from '../../data/catalog'
import { buildIssues, completion, totalWatts, recommendedPsuWatts } from '../../compat'
import { playSfx, isMuted, setMuted } from '../../sfx'

export function TopBar() {
  const exploded = useStore((s) => s.exploded)
  const setExploded = useStore((s) => s.setExploded)
  const modelMode = useStore((s) => s.modelMode)
  const setModelMode = useStore((s) => s.setModelMode)
  const caseTransparent = useStore((s) => s.caseTransparent)
  const setCaseTransparent = useStore((s) => s.setCaseTransparent)
  const reset = useStore((s) => s.reset)
  const [muted, setMutedState] = useState(isMuted())
  const toggleMute = () => {
    const next = !muted
    setMuted(next)
    setMutedState(next)
    if (!next) playSfx('click')
  }
  return (
    <header className="topbar">
      <div className="brand">
        <Lightning size={22} weight="duotone" />
        <span className="brand-name">NEON<em>//</em>FORGE</span>
        <span className="brand-sub">cyberpunk rig builder · india</span>
      </div>
      <div className="topbar-actions">
        <button
          className={`btn ${muted ? '' : 'btn-on'}`}
          onClick={toggleMute}
          title={muted ? 'Unmute SFX' : 'Mute SFX'}
        >
          {muted ? <SpeakerSlash size={14} weight="bold" /> : <SpeakerHigh size={14} weight="bold" />}
          SFX
        </button>
        <button
          className={`btn ${caseTransparent ? 'btn-on' : ''}`}
          onClick={() => setCaseTransparent(!caseTransparent)}
          title="See through the case shell"
        >
          <Eye size={14} weight="bold" />
          X-Ray
        </button>
        <div className="seg">
          <button className={modelMode === 'procedural' ? 'on' : ''} onClick={() => setModelMode('procedural')}>
            <Cube size={14} weight="bold" /> Sketch
          </button>
          <button
            className={modelMode === 'real' ? 'on' : ''}
            onClick={() => setModelMode('real')}
            title="Streams real 3D models where available"
          >
            <Sparkle size={14} weight="bold" /> Real
          </button>
        </div>
        <button className={`btn ${exploded ? 'btn-on' : ''}`} onClick={() => setExploded(!exploded)}>
          {exploded ? <ArrowsInSimple size={14} weight="bold" /> : <ArrowsOutSimple size={14} weight="bold" />}
          Exploded
        </button>
        <button className="btn btn-danger" onClick={reset}>
          <ArrowCounterClockwise size={14} weight="bold" />
          Reset
        </button>
      </div>
    </header>
  )
}

function BuyTab({ ids }) {
  if (ids.length === 0) {
    return <div className="buy-empty">Install parts to get live Indian retailer links for every component.</div>
  }
  return (
    <div className="buy-list">
      <div className="price-note">▸ catalog prices are indicative street prices — hit a retailer for today's quote</div>
      {ids.map((id, i) => {
        const part = byId[id]
        const links = buyLinks(id)
        return (
          <div key={`${id}-${i}`} className="buy-row">
            <div className="buy-info">
              <div className="buy-fictional">{part.brand}</div>
              <div className="buy-real">{part.name}</div>
              <div className="buy-price">{fmtINR(part.price)}</div>
            </div>
            <div className="buy-actions" onClick={() => playSfx('click')}>
              <a href={links.amazon} target="_blank" rel="noreferrer" title="Amazon.in">
                <Storefront size={14} weight="bold" /> AMZN
              </a>
              <a href={links.md} target="_blank" rel="noreferrer" title="MD Computers">
                <ArrowSquareOut size={14} weight="bold" /> MDC
              </a>
              <a href={links.pabgb} target="_blank" rel="noreferrer" title="PrimeABGB">
                <ArrowSquareOut size={14} weight="bold" /> PABGB
              </a>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function SummaryPanel() {
  const build = useStore((s) => s.build)
  const [tab, setTab] = useState('build')
  const issues = buildIssues(build)
  const { steps, done, total } = completion(build)

  // fanfare the moment the last required slot fills (not on initial mount)
  const wasComplete = useRef(null)
  useEffect(() => {
    const complete = done === total
    if (wasComplete.current === false && complete) playSfx('complete')
    wasComplete.current = complete
  }, [done, total])

  const switchTab = (t) => {
    if (t !== tab) playSfx('tab')
    setTab(t)
  }
  const watts = totalWatts(build)
  const psu = build.psu ? byId[build.psu] : null

  const ids = [
    build.case, build.motherboard, build.cpu, build.cooler, build.gpu, build.psu,
    ...build.ram, ...build.m2, ...build.drive,
  ].filter(Boolean)
  const price = ids.reduce((sum, id) => sum + byId[id].price, 0)

  return (
    <aside className="summary">
      <div className="panel-label">Build // Log</div>
      <div className="summary-tabs">
        <button className={tab === 'build' ? 'on' : ''} onClick={() => switchTab('build')}>
          <ClipboardText size={14} weight="bold" /> Build
        </button>
        <button className={tab === 'buy' ? 'on' : ''} onClick={() => switchTab('buy')}>
          <ShoppingCart size={14} weight="bold" /> Buy
        </button>
      </div>
      {tab === 'buy' ? (
        <BuyTab ids={ids} />
      ) : (
        <>
      <div className="summary-head">
        <div className="summary-title">Rig Manifest</div>
        <div className="summary-price">{fmtINR(price)}</div>
      </div>
      <div className="price-note">indicative indian street prices · incl. GST</div>

      <div className="progress">
        <div className="progress-bar" style={{ width: `${(done / total) * 100}%` }} />
      </div>
      <div className="steps">
        {steps.map(([label, ok]) => (
          <span key={label} className={`step ${ok ? 'ok' : ''}`}>
            {ok ? '✓' : '·'} {label}
          </span>
        ))}
      </div>

      <div className="watt-block">
        <div className="watt-row">
          <span><Lightning size={13} weight="fill" /> Est. draw</span>
          <b>{watts} W</b>
        </div>
        <div className="watt-row dim">
          <span>Recommended PSU</span>
          <b>{watts ? `${recommendedPsuWatts(build)} W+` : '—'}</b>
        </div>
        {psu && (
          <div className="watt-row dim">
            <span><Plug size={13} weight="bold" /> Installed PSU</span>
            <b>{psu.specs.wattage} W</b>
          </div>
        )}
      </div>

      {issues.length > 0 && (
        <div className="issues">
          {issues.map((it, i) => (
            <div key={i} className={`issue ${it.level}`}>
              {it.level === 'error' ? (
                <Warning size={14} weight="fill" />
              ) : it.level === 'warn' ? (
                <WarningCircle size={14} weight="fill" />
              ) : (
                <Info size={14} weight="bold" />
              )}
              <span>{it.text}</span>
            </div>
          ))}
        </div>
      )}
      {done === total && issues.every((i) => i.level === 'info') && (
        <div className="issue done">
          <CheckCircle size={14} weight="fill" />
          <span>Rig complete and compatible. Jack in. ⚡</span>
        </div>
      )}
        </>
      )}
    </aside>
  )
}

export function InspectPanel() {
  const selected = useStore((s) => s.selected)
  const select = useStore((s) => s.select)
  const remove = useStore((s) => s.remove)
  if (!selected) return null
  const part = byId[selected.partId]
  const cat = CATEGORIES.find((c) => c.id === part.category)
  return (
    <div className="inspect">
      <div className="inspect-head">
        <span className="inspect-cat">{cat?.label}</span>
        <button className="inspect-x" onClick={() => select(null)}>
          <X size={14} weight="bold" />
        </button>
      </div>
      <div className="inspect-name">{part.name}</div>
      <div className="inspect-brand">{part.brand} · <b>{fmtINR(part.price)}</b></div>
      <div className="inspect-blurb">{part.blurb}</div>
      <div className="inspect-specs">
        {Object.entries(part.specs).map(([k, v]) => (
          <div key={k} className="spec-row">
            <span>{k}</span>
            <b>{Array.isArray(v) ? v.join(', ') : String(v)}</b>
          </div>
        ))}
      </div>
      <button className="btn btn-danger wide" onClick={() => remove(selected.category, selected.index)}>
        <Trash size={14} weight="bold" />
        Remove from build
      </button>
    </div>
  )
}
