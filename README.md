# NEON//FORGE — Cyberpunk PC Builder · India

A fully 3D, cyberpunk-styled gaming-PC builder that runs in the browser.
Drag real parts into the scene, drop them on glowing slots, and get live
compatibility checking the whole way — sockets, RAM generations, form
factors, GPU/cooler clearances, and power budgets. Every part carries an
indicative **Indian street price in ₹** and links out to live searches on
**Amazon.in, MD Computers and PrimeABGB**.

Based on the BENCH·PC workshop from
[mythos-fable-vm](https://github.com/shivamhwp/mythos-fable-vm), rebuilt
with a neon cyberpunk skin, RGB-animated 3D models, bloom postprocessing,
a mirror floor, and a real Indian-market catalog.

## Run it

```sh
npm install
npm run dev      # dev server
npm run build    # production build → dist/
```

## How it works

- **Showcase on first load** — the bench opens with a preloaded flagship
  rig (Lian Li O11 EVO · Ryzen 7 9800X3D · RTX 5080 · 32GB Trident Z5
  RGB). Hit Reset to start from an empty bench.
- **Drag to slot** — press a part card and drag into the scene; free slots
  glow green and the part installs only when released over a valid slot.
  Click an installed part to inspect or remove it.
- **Cyberpunk scene** — hue-cycling RGB strips/fan rings on RGB parts,
  neon underglow, interior case lighting, holographic grid + reflective
  floor, and bloom via `@react-three/postprocessing`. CRT scanline and
  vignette overlays sit on top of the UI.
- **Compatibility engine** (`src/compat.js`) — CPU↔socket, RAM↔DDR
  generation, board↔case form factor, GPU length and cooler height vs case
  clearance, cooler TDP rating vs CPU, PSU wattage vs estimated draw, PSU
  form factor, M.2/SATA/RAM slot counts.
- **Indian pricing** (`src/data/catalog.js`) — ~50 real parts with
  indicative GST-inclusive street prices (researched mid-2026). The Buy
  tab links every installed part to live retailer searches so the user
  always sees today's price.
- **Auto-routed cables, exploded view, X-ray shell, Sketch/Real model
  toggle** — carried over from the original workshop.
- **Persistence** — build and view settings survive reloads
  (localStorage key `neonforge-build-v1`).

## Deploy

Static site — `npm run build` then push `dist/` to any static host
(deployed on Cloudflare Pages via `wrangler pages deploy dist`).

## Model credits (CC-BY 4.0 via Sketchfab / Objaverse)

Real-mode models, used with attribution per CC-BY:

- Motherboard — "ASUS MAXIMUS VI Formula" by blue-odym
- CPU — "AMD Ryzen 5 3600" by Temooor
- CPU cooler — "Tower CPU Air Cooler" by bazyaev08
- RAM — "HyperX Fury DDR4" by poll1980v
- GPU — "GeForce RTX 3080 FE" by Arthur_mf
- M.2 SSD — "NVMe M.2 SSD 2280" by gmedranotic
- SATA SSD — "SSD NoName Sata" by hlupich
- PSU — "ATX Power Supply – Basic" by alexlh2003
- Case — "Corsair 200R" by jeromy
