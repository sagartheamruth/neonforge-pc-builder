import { byId } from './data/catalog'

// A build is { case, motherboard, cpu, cooler, gpu, psu: id|null,
//              ram: (id|null)[], m2: (id|null)[], drive: (id|null)[] }

const get = (id) => (id ? byId[id] : null)

export function emptyBuild() {
  return { case: null, motherboard: null, cpu: null, cooler: null, gpu: null, psu: null, ram: [], m2: [], drive: [] }
}

// Estimated DC draw of everything except the PSU itself.
export function totalWatts(build) {
  let w = 0
  for (const key of ['case', 'motherboard', 'cpu', 'cooler', 'gpu']) w += get(build[key])?.watts ?? 0
  for (const key of ['ram', 'm2', 'drive']) for (const id of build[key]) w += get(id)?.watts ?? 0
  // CPUs and GPUs list boost/TDP in watts already via part.watts
  return w
}

export function recommendedPsuWatts(build) {
  return Math.ceil((totalWatts(build) * 1.3) / 50) * 50
}

const SINGLE_LABEL = {
  case: 'case', motherboard: 'motherboard', cpu: 'CPU',
  cooler: 'cooler', gpu: 'GPU', psu: 'PSU',
}

// Can `part` join `build` right now? Returns { ok, reasons: string[] }.
// `reasons` lists every violated rule, phrased for the user.
// `occupied` is true when the part's one-per-build slot is already taken —
// the sidebar disables those cards entirely (remove the old part first).
export function checkPart(build, part) {
  if (SINGLE_LABEL[part.category] && build[part.category]) {
    return {
      ok: false,
      occupied: true,
      reasons: [`A ${SINGLE_LABEL[part.category]} is already installed — remove it first`],
    }
  }
  const reasons = []
  const cs = get(build.case)?.specs
  const mb = get(build.motherboard)?.specs
  const cpu = get(build.cpu)

  switch (part.category) {
    case 'case': {
      // Swapping the case: everything currently installed must still fit.
      if (mb && !part.specs.formFactors.includes(mb.formFactor))
        reasons.push(`Doesn't fit the installed ${mb.formFactor} motherboard`)
      const gpu = get(build.gpu)
      if (gpu && gpu.specs.length > part.specs.maxGpuLength)
        reasons.push(`Installed GPU is ${gpu.specs.length}mm, case max is ${part.specs.maxGpuLength}mm`)
      const cooler = get(build.cooler)
      if (cooler && cooler.specs.height > part.specs.maxCoolerHeight)
        reasons.push(`Installed cooler is ${cooler.specs.height}mm tall, case clearance is ${part.specs.maxCoolerHeight}mm`)
      const psu = get(build.psu)
      if (psu && !part.specs.psuForm.includes(psu.specs.form))
        reasons.push(`Installed ${psu.specs.form} PSU doesn't fit (needs ${part.specs.psuForm.join('/')})`)
      if (build.drive.filter(Boolean).length > part.specs.driveBays)
        reasons.push(`Only ${part.specs.driveBays} drive bay(s), you have ${build.drive.filter(Boolean).length} drives`)
      break
    }

    case 'motherboard': {
      if (!build.case) reasons.push('Install a case first')
      if (cs && !cs.formFactors.includes(part.specs.formFactor))
        reasons.push(`${part.specs.formFactor} board doesn't fit this case (supports ${cs.formFactors.join('/')})`)
      // Swapping the board: installed parts must remain compatible.
      if (cpu && cpu.specs.socket !== part.specs.socket)
        reasons.push(`Installed CPU is ${cpu.specs.socket}, board is ${part.specs.socket}`)
      const ram0 = get(build.ram.find(Boolean))
      if (ram0 && ram0.specs.memType !== part.specs.memType)
        reasons.push(`Installed RAM is ${ram0.specs.memType}, board takes ${part.specs.memType}`)
      if (build.ram.filter(Boolean).length > part.specs.ramSlots)
        reasons.push(`Board has ${part.specs.ramSlots} RAM slots, you have ${build.ram.filter(Boolean).length} sticks`)
      if (build.m2.filter(Boolean).length > part.specs.m2Slots)
        reasons.push(`Board has ${part.specs.m2Slots} M.2 slot(s), you have ${build.m2.filter(Boolean).length} drives`)
      break
    }

    case 'cpu': {
      if (!mb) reasons.push('Install a motherboard first')
      if (mb && mb.socket !== part.specs.socket)
        reasons.push(`${part.specs.socket} CPU won't fit the ${mb.socket} socket`)
      const cooler = get(build.cooler)
      if (cooler && cooler.specs.coolingW < part.specs.tdp)
        reasons.push(`Installed cooler handles ${cooler.specs.coolingW}W, this CPU needs ${part.specs.tdp}W`)
      if (cooler && !cooler.specs.sockets.includes(part.specs.socket))
        reasons.push(`Installed cooler doesn't support ${part.specs.socket}`)
      break
    }

    case 'cooler': {
      if (!build.cpu) reasons.push('Install a CPU first')
      if (cpu && !part.specs.sockets.includes(cpu.specs.socket))
        reasons.push(`No ${cpu.specs.socket} mounting kit (supports ${part.specs.sockets.join('/')})`)
      if (cpu && part.specs.coolingW < cpu.specs.tdp)
        reasons.push(`Rated for ${part.specs.coolingW}W, CPU is ${cpu.specs.tdp}W — it will throttle`)
      if (cs && part.specs.height > cs.maxCoolerHeight)
        reasons.push(`${part.specs.height}mm tall, case clearance is ${cs.maxCoolerHeight}mm`)
      break
    }

    case 'ram': {
      if (!mb) reasons.push('Install a motherboard first')
      if (mb && mb.memType !== part.specs.memType)
        reasons.push(`${part.specs.memType} stick, board takes ${mb.memType}`)
      if (mb && build.ram.filter(Boolean).length >= mb.ramSlots)
        reasons.push(`All ${mb.ramSlots} RAM slots are full`)
      break
    }

    case 'gpu': {
      if (!mb) reasons.push('Install a motherboard first')
      if (build.gpu) reasons.push('PCIe x16 slot already occupied')
      if (cs && part.specs.length > cs.maxGpuLength)
        reasons.push(`${part.specs.length}mm card, case fits up to ${cs.maxGpuLength}mm`)
      break
    }

    case 'm2': {
      if (!mb) reasons.push('Install a motherboard first')
      if (mb && build.m2.filter(Boolean).length >= mb.m2Slots)
        reasons.push(`All ${mb.m2Slots} M.2 slot(s) are full`)
      break
    }

    case 'drive': {
      if (!build.case) reasons.push('Install a case first')
      if (cs && build.drive.filter(Boolean).length >= cs.driveBays)
        reasons.push(`All ${cs.driveBays} drive bay(s) are full`)
      if (mb && build.drive.filter(Boolean).length >= mb.sataPorts)
        reasons.push(`Board only has ${mb.sataPorts} SATA ports`)
      break
    }

    case 'psu': {
      if (!build.case) reasons.push('Install a case first')
      if (cs && !cs.psuForm.includes(part.specs.form))
        reasons.push(`${part.specs.form} unit, case takes ${cs.psuForm.join('/')}`)
      const need = totalWatts(build)
      if (part.specs.wattage < need)
        reasons.push(`${part.specs.wattage}W is below the build's ${need}W draw`)
      break
    }
  }

  return { ok: reasons.length === 0, reasons }
}

// Issues with the build as it stands (used by the summary panel).
export function buildIssues(build) {
  const issues = []
  const psu = get(build.psu)
  const need = totalWatts(build)
  if (psu && psu.specs.wattage < need * 1.2)
    issues.push({
      level: psu.specs.wattage < need ? 'error' : 'warn',
      text: psu.specs.wattage < need
        ? `PSU is ${psu.specs.wattage}W but the build draws ~${need}W — it won't boot under load`
        : `PSU headroom is thin: ~${need}W draw on a ${psu.specs.wattage}W unit (aim for 30%+)`,
    })
  const cpu = get(build.cpu)
  const cooler = get(build.cooler)
  if (cpu && cooler && cooler.specs.coolingW < cpu.specs.tdp)
    issues.push({ level: 'error', text: `Cooler rated ${cooler.specs.coolingW}W vs CPU ${cpu.specs.tdp}W TDP` })
  if (cpu && !cooler) issues.push({ level: 'warn', text: 'CPU has no cooler' })
  if (build.motherboard && build.ram.filter(Boolean).length === 0)
    issues.push({ level: 'warn', text: 'No memory installed' })
  if (build.motherboard && build.m2.filter(Boolean).length === 0 && build.drive.filter(Boolean).length === 0)
    issues.push({ level: 'warn', text: 'No storage installed' })
  if (build.motherboard && !build.psu) issues.push({ level: 'warn', text: 'No power supply' })
  if (!build.gpu && build.cpu) issues.push({ level: 'info', text: 'No GPU (fine if the CPU has graphics)' })
  return issues
}

// Required slots present → build is "complete".
export function completion(build) {
  const steps = [
    ['Case', !!build.case],
    ['Motherboard', !!build.motherboard],
    ['CPU', !!build.cpu],
    ['Cooler', !!build.cooler],
    ['Memory', build.ram.filter(Boolean).length > 0],
    ['Storage', build.m2.filter(Boolean).length > 0 || build.drive.filter(Boolean).length > 0],
    ['GPU', !!build.gpu],
    ['PSU', !!build.psu],
  ]
  return { steps, done: steps.filter(([, v]) => v).length, total: steps.length }
}
