// Headless smoke test for the drag-only workshop build:
// real cursor drags for case + motherboard, a negative drop test,
// store-driven installs for the rest, lamp toggles, both render modes.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

const server = spawn('bunx', ['vite', 'preview', '--port', '4823', '--strictPort'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: 'pipe',
})
await new Promise((r) => setTimeout(r, 1500))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => {
  if (m.type() === 'error') errors.push(`console: ${m.text()}`)
})

await page.goto('http://localhost:4823')
await page.waitForTimeout(2500)

const state = () => page.evaluate(() => window.__pcStore.getState())

async function dragCard(catLabel, partName, sweepY, expectInstall = true) {
  await page.click(`.cat-tab:has-text("${catLabel}")`)
  await page.waitForTimeout(200)
  const card = page.locator(`.part-card:has-text("${partName}")`)
  const cb = await card.boundingBox()
  await page.mouse.move(cb.x + 40, cb.y + 20)
  await card.dispatchEvent('pointerdown', { button: 0, clientX: cb.x + 40, clientY: cb.y + 20 })
  await page.waitForTimeout(300) // DragLayer mounts listeners
  const view = await page.locator('.viewport').boundingBox()
  for (let i = 0; i <= 20; i++) {
    await page.mouse.move(view.x + view.width * (0.2 + 0.03 * i), view.y + view.height * sweepY, { steps: 2 })
    await page.waitForTimeout(60)
    if (await page.evaluate(() => window.__pcStore.getState().hoverSlot)) break
  }
  await page.mouse.up()
  await page.waitForTimeout(700)
}

// 1. drag the case onto the bench
await dragCard('Case', 'Vortex Flow ATX', 0.5)
console.log('case via drag:', (await state()).build.case === 'case-vortex-atx')

// 2. drag the motherboard into the tray
await dragCard('Motherboard', 'B650 Tomahawk', 0.45)
console.log('mobo via drag:', (await state()).build.motherboard === 'mobo-b650-atx')

// 3. NEGATIVE: drag a CPU but release over empty space → must NOT install
await page.click('.cat-tab:has-text("CPU")')
await page.waitForTimeout(200)
const cpuCard = page.locator('.part-card:has-text("Ryzen 7 7800X3D")')
const cb = await cpuCard.boundingBox()
await cpuCard.dispatchEvent('pointerdown', { button: 0, clientX: cb.x + 40, clientY: cb.y + 20 })
await page.waitForTimeout(300)
const view = await page.locator('.viewport').boundingBox()
await page.mouse.move(view.x + view.width * 0.9, view.y + view.height * 0.9, { steps: 5 })
await page.waitForTimeout(150)
await page.mouse.up()
await page.waitForTimeout(400)
const s3 = await state()
console.log('cpu NOT installed on bad drop:', s3.build.cpu === null && s3.dragging === null)

// 4. finish the build through the store (engine path)
await page.evaluate(() => {
  const st = window.__pcStore.getState()
  st.install('cpu-7800x3d', null)
  st.install('cool-ak400', null)
  st.install('ram-ddr5-32', null)
  st.install('ram-ddr5-32', null)
  st.install('gpu-4070s', null)
  st.install('m2-990-2tb', null)
  st.install('psu-rm750', null)
})
await page.waitForTimeout(1200)
console.log('completed steps:', `${await page.locator('.step.ok').count()}/8`)

// 5. incompatible part flagged in the bin
await page.click('.cat-tab:has-text("CPU")')
await page.waitForTimeout(200)
const badCpu = await page.locator('.part-card:has-text("Core i9-13900K")').getAttribute('class')
console.log('i9 on AM5 board marked incompat:', badCpu.includes('incompat'))

// 6. persistence: reload → build survives via localStorage
await page.reload()
await page.waitForTimeout(2500)
const persisted = (await state()).build
console.log('build persisted across reload:', persisted.case === 'case-vortex-atx' && persisted.gpu === 'gpu-4070s')

// 7. Buy tab
await page.click('.summary-tabs button:has-text("Buy")')
await page.waitForTimeout(300)
const buyRows = await page.locator('.buy-row').count()
const firstLink = await page.locator('.buy-actions a >> nth=0').getAttribute('href')
console.log('buy tab rows:', buyRows, '| first link ok:', firstLink.includes('pcpartpicker.com'))
await page.screenshot({ path: '/tmp/pcb-buy.png' })
await page.click('.summary-tabs button:has-text("Build")')
await page.waitForTimeout(200)

// 8. occupied single slot → other cases are disabled, drag can't start
await page.click('.cat-tab:has-text("Case")')
await page.waitForTimeout(200)
const otherCase = page.locator('.part-card:has-text("Micro Mesa")')
const occCls = await otherCase.getAttribute('class')
const ocb = await otherCase.boundingBox()
await otherCase.dispatchEvent('pointerdown', { button: 0, clientX: ocb.x + 40, clientY: ocb.y + 20 })
await page.waitForTimeout(300)
const dragStarted = (await state()).dragging
await page.mouse.up()
console.log('occupied case card disabled:', occCls.includes('occupied') && dragStarted === null)

// 9. screenshots
await page.screenshot({ path: '/tmp/pcb-built.png' })
await page.click('button:has-text("X-Ray")')
await page.waitForTimeout(600)
await page.screenshot({ path: '/tmp/pcb-xray.png' })
await page.click('button:has-text("X-Ray")')
await page.waitForTimeout(400)
await page.click('button:has-text("Exploded")')
await page.waitForTimeout(1400)
await page.screenshot({ path: '/tmp/pcb-exploded.png' })
await page.click('button:has-text("Exploded")')
await page.waitForTimeout(1200)
await page.click('.seg button:has-text("Real")')
await page.waitForTimeout(6000)
await page.screenshot({ path: '/tmp/pcb-real.png' })

console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'NO RUNTIME ERRORS')
await browser.close()
server.kill()
process.exit(errors.length ? 1 : 0)
