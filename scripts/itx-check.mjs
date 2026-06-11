// Visual check: full ITX build, screenshots from several orbits so any
// part poking outside the case is visible.
import { chromium } from 'playwright'
import { spawn } from 'node:child_process'

const server = spawn('bunx', ['vite', 'preview', '--port', '4824', '--strictPort'], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: 'pipe',
})
await new Promise((r) => setTimeout(r, 1500))

const browser = await chromium.launch()
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`))
page.on('console', (m) => m.type() === 'error' && errors.push(`console: ${m.text()}`))

await page.goto('http://localhost:4824')
await page.waitForTimeout(2000)

await page.evaluate(() => {
  localStorage.clear()
  const st = window.__pcStore.getState()
  st.reset()
  st.install('case-ion-itx', null)
  st.install('mobo-b650i-itx', null)
  st.install('cpu-7600', null)
  st.install('cool-l9a', null)
  st.install('ram-ddr5-32', null)
  st.install('ram-ddr5-32', null)
  st.install('gpu-4070s', null)
  st.install('m2-990-2tb', null)
  st.install('drive-870-1tb', null)
  st.install('psu-sf600', null)
})
await page.waitForTimeout(1500)

const ok = await page.evaluate(() => {
  const b = window.__pcStore.getState().build
  return { case: b.case, gpu: b.gpu, psu: b.psu, drive: b.drive, ram: b.ram }
})
console.log('itx build state:', JSON.stringify(ok))

await page.click('button:has-text("X-Ray")')
await page.waitForTimeout(600)

const view = await page.locator('.viewport').boundingBox()
const cx = view.x + view.width / 2
const cy = view.y + view.height / 2
async function orbit(dx, dy) {
  await page.mouse.move(cx, cy)
  await page.mouse.down()
  await page.mouse.move(cx + dx, cy + dy, { steps: 12 })
  await page.mouse.up()
  await page.waitForTimeout(500)
}

await page.screenshot({ path: '/tmp/itx-front.png' })
await orbit(-350, -120) // swing toward the rear, slightly above
await page.screenshot({ path: '/tmp/itx-rear-top.png' })
await orbit(0, 260) // look from below
await page.screenshot({ path: '/tmp/itx-low.png' })
await orbit(-300, -120)
await page.screenshot({ path: '/tmp/itx-back.png' })

console.log(errors.length ? `ERRORS:\n${errors.join('\n')}` : 'NO RUNTIME ERRORS')
await browser.close()
server.kill()
process.exit(errors.length ? 1 : 0)
