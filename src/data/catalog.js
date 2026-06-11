// Real-world parts catalog for the Indian market. Prices are indicative
// street prices in INR (GST inclusive) as of mid-2026 — every part links
// out to live retailer searches. Every spec field here is consumed by the
// compatibility engine in src/compat.js — keep the shapes in sync.

export const CATEGORIES = [
  { id: 'case', label: 'Case', icon: '🖥', single: true },
  { id: 'motherboard', label: 'Mainboard', icon: '🟩', single: true },
  { id: 'cpu', label: 'CPU', icon: '⬛', single: true },
  { id: 'cooler', label: 'Cooling', icon: '🌀', single: true },
  { id: 'ram', label: 'Memory', icon: '📏', single: false },
  { id: 'gpu', label: 'GPU', icon: '🎮', single: true },
  { id: 'm2', label: 'NVMe', icon: '💾', single: false },
  { id: 'drive', label: 'SATA', icon: '🗄', single: false },
  { id: 'psu', label: 'PSU', icon: '🔌', single: true },
]

export const PARTS = [
  // ───────────────────────── Cases ─────────────────────────
  {
    id: 'case-o11-evo', category: 'case', name: 'O11 Dynamic EVO', brand: 'Lian Li',
    price: 13999, watts: 0, color: '#15171f', rgb: true,
    specs: { formFactors: ['ATX', 'mATX', 'ITX'], maxGpuLength: 420, maxCoolerHeight: 167, psuForm: ['ATX'], driveBays: 2 },
    blurb: 'Dual-chamber glass showcase. The RGB cathedral.',
  },
  {
    id: 'case-h5-flow', category: 'case', name: 'H5 Flow', brand: 'NZXT',
    price: 6999, watts: 0, color: '#1a1c24', rgb: true,
    specs: { formFactors: ['ATX', 'mATX', 'ITX'], maxGpuLength: 365, maxCoolerHeight: 165, psuForm: ['ATX'], driveBays: 2 },
    blurb: 'Clean mesh mid-tower · 2 fans included',
  },
  {
    id: 'case-4000d', category: 'case', name: '4000D Airflow', brand: 'Corsair',
    price: 7450, watts: 0, color: '#191b22', rgb: true,
    specs: { formFactors: ['ATX', 'mATX', 'ITX'], maxGpuLength: 360, maxCoolerHeight: 170, psuForm: ['ATX'], driveBays: 2 },
    blurb: 'The default good case. Mesh front, easy build.',
  },
  {
    id: 'case-ch510', category: 'case', name: 'CH510 Mesh Digital', brand: 'Deepcool',
    price: 5499, watts: 0, color: '#171a21', rgb: true,
    specs: { formFactors: ['ATX', 'mATX', 'ITX'], maxGpuLength: 380, maxCoolerHeight: 175, psuForm: ['ATX'], driveBays: 2 },
    blurb: 'Mesh front with live status display',
  },
  {
    id: 'case-ice280', category: 'case', name: 'ICE-280TG ARGB', brand: 'Ant Esports',
    price: 2999, watts: 0, color: '#14161d', rgb: true,
    specs: { formFactors: ['ATX', 'mATX', 'ITX'], maxGpuLength: 320, maxCoolerHeight: 160, psuForm: ['ATX'], driveBays: 2 },
    blurb: 'Budget RGB glass tower · 3 ARGB fans in the box',
  },
  {
    id: 'case-nr200p', category: 'case', name: 'NR200P SFF', brand: 'Cooler Master',
    price: 9499, watts: 0, color: '#1d1f27', rgb: false,
    specs: { formFactors: ['ITX'], maxGpuLength: 330, maxCoolerHeight: 155, psuForm: ['SFX'], driveBays: 1 },
    blurb: '18L shoebox · ITX board + SFX PSU only',
  },

  // ─────────────────────── Motherboards ───────────────────────
  {
    id: 'mobo-b650-gp', category: 'motherboard', name: 'B650 Gaming Plus WiFi', brand: 'MSI',
    price: 16200, watts: 30, color: '#161c2a',
    specs: { socket: 'AM5', formFactor: 'ATX', memType: 'DDR5', ramSlots: 4, m2Slots: 2, sataPorts: 4, pcieSlots: 1 },
    blurb: 'AM5 · DDR5 · ATX · the sane default',
  },
  {
    id: 'mobo-x870-tuf', category: 'motherboard', name: 'TUF Gaming X870-Plus', brand: 'ASUS',
    price: 29500, watts: 40, color: '#141a28',
    specs: { socket: 'AM5', formFactor: 'ATX', memType: 'DDR5', ramSlots: 4, m2Slots: 2, sataPorts: 4, pcieSlots: 1 },
    blurb: 'AM5 flagship-lite · PCIe 5.0 · WiFi 7 · USB4',
  },
  {
    id: 'mobo-b650m-ds3h', category: 'motherboard', name: 'B650M DS3H', brand: 'Gigabyte',
    price: 11500, watts: 25, color: '#182030',
    specs: { socket: 'AM5', formFactor: 'mATX', memType: 'DDR5', ramSlots: 4, m2Slots: 2, sataPorts: 4, pcieSlots: 1 },
    blurb: 'AM5 · DDR5 · budget micro-ATX',
  },
  {
    id: 'mobo-b550m', category: 'motherboard', name: 'B550M DS3H', brand: 'Gigabyte',
    price: 8999, watts: 22, color: '#1a2233',
    specs: { socket: 'AM4', formFactor: 'mATX', memType: 'DDR4', ramSlots: 4, m2Slots: 2, sataPorts: 4, pcieSlots: 1 },
    blurb: 'AM4 · DDR4 · the value path',
  },
  {
    id: 'mobo-b860-tomahawk', category: 'motherboard', name: 'MAG B860 Tomahawk', brand: 'MSI',
    price: 21500, watts: 35, color: '#151b29',
    specs: { socket: 'LGA1851', formFactor: 'ATX', memType: 'DDR5', ramSlots: 4, m2Slots: 2, sataPorts: 4, pcieSlots: 1 },
    blurb: 'LGA1851 · DDR5 · WiFi 7 · 2.5G LAN',
  },
  {
    id: 'mobo-z890-tomahawk', category: 'motherboard', name: 'MAG Z890 Tomahawk', brand: 'MSI',
    price: 31500, watts: 40, color: '#131927',
    specs: { socket: 'LGA1851', formFactor: 'ATX', memType: 'DDR5', ramSlots: 4, m2Slots: 2, sataPorts: 6, pcieSlots: 1 },
    blurb: 'LGA1851 · overclock-ready · USB4',
  },
  {
    id: 'mobo-b650e-i', category: 'motherboard', name: 'ROG Strix B650E-I', brand: 'ASUS',
    price: 26500, watts: 28, color: '#161c2c',
    specs: { socket: 'AM5', formFactor: 'ITX', memType: 'DDR5', ramSlots: 2, m2Slots: 2, sataPorts: 2, pcieSlots: 1 },
    blurb: 'AM5 mini-ITX · PCIe 5.0 · 2 RAM slots',
  },

  // ───────────────────────── CPUs ─────────────────────────
  {
    id: 'cpu-7600', category: 'cpu', name: 'Ryzen 5 7600', brand: 'AMD',
    price: 16999, watts: 65, color: '#8c8f98',
    specs: { socket: 'AM5', tdp: 65, cores: 6 },
    blurb: '6C/12T · AM5 · 65W · cooler in the box',
  },
  {
    id: 'cpu-9600x', category: 'cpu', name: 'Ryzen 5 9600X', brand: 'AMD',
    price: 22499, watts: 105, color: '#8c8f98',
    specs: { socket: 'AM5', tdp: 105, cores: 6 },
    blurb: 'Zen 5 · 6C/12T · AM5',
  },
  {
    id: 'cpu-7800x3d', category: 'cpu', name: 'Ryzen 7 7800X3D', brand: 'AMD',
    price: 38500, watts: 120, color: '#8c8f98',
    specs: { socket: 'AM5', tdp: 120, cores: 8 },
    blurb: '96MB 3D V-Cache · the gaming legend',
  },
  {
    id: 'cpu-9800x3d', category: 'cpu', name: 'Ryzen 7 9800X3D', brand: 'AMD',
    price: 48999, watts: 120, color: '#9a9da6',
    specs: { socket: 'AM5', tdp: 120, cores: 8 },
    blurb: 'Gaming king · Zen 5 + 3D V-Cache',
  },
  {
    id: 'cpu-9950x3d', category: 'cpu', name: 'Ryzen 9 9950X3D', brand: 'AMD',
    price: 74500, watts: 170, color: '#9a9da6',
    specs: { socket: 'AM5', tdp: 170, cores: 16 },
    blurb: '16C/32T monster · game + create',
  },
  {
    id: 'cpu-5600', category: 'cpu', name: 'Ryzen 5 5600', brand: 'AMD',
    price: 11499, watts: 65, color: '#90939c',
    specs: { socket: 'AM4', tdp: 65, cores: 6 },
    blurb: 'Budget AM4 hero · 65W',
  },
  {
    id: 'cpu-245k', category: 'cpu', name: 'Core Ultra 5 245K', brand: 'Intel',
    price: 26500, watts: 159, color: '#9a9da6',
    specs: { socket: 'LGA1851', tdp: 159, cores: 14 },
    blurb: '14C Arrow Lake · LGA1851',
  },
  {
    id: 'cpu-265k', category: 'cpu', name: 'Core Ultra 7 265K', brand: 'Intel',
    price: 34500, watts: 250, color: '#9a9da6',
    specs: { socket: 'LGA1851', tdp: 250, cores: 20 },
    blurb: '20C · LGA1851 · 250W boost',
  },
  {
    id: 'cpu-285k', category: 'cpu', name: 'Core Ultra 9 285K', brand: 'Intel',
    price: 57999, watts: 250, color: '#9a9da6',
    specs: { socket: 'LGA1851', tdp: 250, cores: 24 },
    blurb: '24C flagship · LGA1851 · 250W',
  },

  // ─────────────────────── CPU Coolers ───────────────────────
  {
    id: 'cool-stock', category: 'cooler', name: 'Wraith Stealth', brand: 'AMD',
    price: 0, watts: 3, color: '#3a3d45',
    specs: { sockets: ['AM5', 'AM4'], height: 54, coolingW: 95 },
    blurb: 'Bundled stock cooler · up to 95W',
  },
  {
    id: 'cool-ak400', category: 'cooler', name: 'AK400', brand: 'Deepcool',
    price: 2799, watts: 4, color: '#5b5f6a',
    specs: { sockets: ['AM5', 'AM4', 'LGA1851', 'LGA1700'], height: 155, coolingW: 220 },
    blurb: 'Single tower · 155mm · 220W',
  },
  {
    id: 'cool-pa120', category: 'cooler', name: 'Peerless Assassin 120 SE', brand: 'Thermalright',
    price: 3599, watts: 5, color: '#4a4e58',
    specs: { sockets: ['AM5', 'AM4', 'LGA1851', 'LGA1700'], height: 155, coolingW: 245 },
    blurb: 'Dual tower · absurd value · 245W',
  },
  {
    id: 'cool-d15', category: 'cooler', name: 'NH-D15 chromax.black', brand: 'Noctua',
    price: 10999, watts: 5, color: '#43464e',
    specs: { sockets: ['AM5', 'AM4', 'LGA1851', 'LGA1700'], height: 165, coolingW: 280 },
    blurb: 'Dual tower royalty · 165mm · 280W',
  },
  {
    id: 'cool-le520', category: 'cooler', name: 'LE520 240 ARGB', brand: 'Deepcool',
    price: 5999, watts: 6, color: '#2a2d38', rgb: true,
    specs: { sockets: ['AM5', 'AM4', 'LGA1851', 'LGA1700'], height: 55, coolingW: 250 },
    blurb: '240mm AIO · infinity-mirror pump · 250W',
  },
  {
    id: 'cool-lf3-360', category: 'cooler', name: 'Liquid Freezer III 360', brand: 'Arctic',
    price: 9999, watts: 7, color: '#262934', rgb: true,
    specs: { sockets: ['AM5', 'AM4', 'LGA1851', 'LGA1700'], height: 55, coolingW: 320 },
    blurb: '360mm AIO · thicc radiator · 320W',
  },
  {
    id: 'cool-gal2-360', category: 'cooler', name: 'Galahad II Trinity 360', brand: 'Lian Li',
    price: 12999, watts: 7, color: '#242732', rgb: true,
    specs: { sockets: ['AM5', 'AM4', 'LGA1851', 'LGA1700'], height: 55, coolingW: 350 },
    blurb: '360mm ARGB AIO · handles anything',
  },

  // ───────────────────────── Memory ─────────────────────────
  {
    id: 'ram-crucial-16', category: 'ram', name: 'Crucial Pro 16GB DDR5-5600', brand: 'Crucial',
    price: 7500, watts: 5, color: '#23252c',
    specs: { memType: 'DDR5', sizeGB: 16 },
    blurb: '16GB stick · DDR5-5600 · no frills',
  },
  {
    id: 'ram-z5-16', category: 'ram', name: 'Trident Z5 Neo RGB 16GB-6000', brand: 'G.Skill',
    price: 10750, watts: 6, color: '#c0c3cc', rgb: true,
    specs: { memType: 'DDR5', sizeGB: 16 },
    blurb: '16GB stick · CL30 EXPO · RGB lightbar',
  },
  {
    id: 'ram-veng-32', category: 'ram', name: 'Vengeance 32GB DDR5-6000', brand: 'Corsair',
    price: 19000, watts: 6, color: '#2a2c33',
    specs: { memType: 'DDR5', sizeGB: 32 },
    blurb: '32GB stick · CL30 · capacity play',
  },
  {
    id: 'ram-fury-8', category: 'ram', name: 'Fury Beast 8GB DDR5-5200', brand: 'Kingston',
    price: 3999, watts: 4, color: '#31333a',
    specs: { memType: 'DDR5', sizeGB: 8 },
    blurb: '8GB stick · entry DDR5',
  },
  {
    id: 'ram-lpx-16', category: 'ram', name: 'Vengeance LPX 16GB DDR4-3600', brand: 'Corsair',
    price: 4299, watts: 4, color: '#2a2c33',
    specs: { memType: 'DDR4', sizeGB: 16 },
    blurb: '16GB stick · DDR4 · budget AM4 builds',
  },

  // ──────────────────────── Graphics ────────────────────────
  {
    id: 'gpu-5060', category: 'gpu', name: 'RTX 5060 Twin Edge 8GB', brand: 'Zotac',
    price: 30500, watts: 145, color: '#1c1e26',
    specs: { length: 225, tdp: 145, vramGB: 8 },
    blurb: '1080p cruiser · 225mm · 8GB GDDR7',
  },
  {
    id: 'gpu-5060ti', category: 'gpu', name: 'RTX 5060 Ti 16GB Twin Edge', brand: 'Zotac',
    price: 46500, watts: 180, color: '#1b1d25',
    specs: { length: 234, tdp: 180, vramGB: 16 },
    blurb: '1440p value · 234mm · 16GB GDDR7',
  },
  {
    id: 'gpu-9060xt', category: 'gpu', name: 'RX 9060 XT Pulse 16GB', brand: 'Sapphire',
    price: 40500, watts: 180, color: '#231a1e',
    specs: { length: 240, tdp: 180, vramGB: 16 },
    blurb: 'RDNA 4 · 240mm · 16GB',
  },
  {
    id: 'gpu-5070', category: 'gpu', name: 'RTX 5070 Ventus 2X 12GB', brand: 'MSI',
    price: 58500, watts: 250, color: '#191b23',
    specs: { length: 232, tdp: 250, vramGB: 12 },
    blurb: '1440p sweet spot · DLSS 4 · 12GB',
  },
  {
    id: 'gpu-9070xt', category: 'gpu', name: 'RX 9070 XT Pulse 16GB', brand: 'Sapphire',
    price: 74000, watts: 304, color: '#221a1e',
    specs: { length: 320, tdp: 304, vramGB: 16 },
    blurb: 'RDNA 4 flagship · 320mm · 16GB',
  },
  {
    id: 'gpu-5070ti', category: 'gpu', name: 'RTX 5070 Ti Ventus 3X 16GB', brand: 'MSI',
    price: 84000, watts: 300, color: '#181a22',
    specs: { length: 300, tdp: 300, vramGB: 16 },
    blurb: '4K-capable · 300mm · 16GB GDDR7',
  },
  {
    id: 'gpu-5080-tuf', category: 'gpu', name: 'RTX 5080 TUF Gaming OC', brand: 'ASUS',
    price: 118000, watts: 360, color: '#161820',
    specs: { length: 348, tdp: 360, vramGB: 16 },
    blurb: '4K bruiser · 348mm · 360W · 16GB',
  },
  {
    id: 'gpu-5090', category: 'gpu', name: 'RTX 5090 Solid OC 32GB', brand: 'Zotac',
    price: 260000, watts: 575, color: '#14161e',
    specs: { length: 330, tdp: 575, vramGB: 32 },
    blurb: 'The final boss · 575W · 32GB GDDR7',
  },

  // ──────────────────────── M.2 Storage ────────────────────────
  {
    id: 'm2-sn580-500', category: 'm2', name: 'WD Blue SN580 500GB', brand: 'WD',
    price: 3900, watts: 4, color: '#22242b',
    specs: { sizeGB: 500 },
    blurb: 'Cheap Gen4 boot drive',
  },
  {
    id: 'm2-t500-1tb', category: 'm2', name: 'T500 1TB Gen4', brand: 'Crucial',
    price: 9200, watts: 5, color: '#1e2026',
    specs: { sizeGB: 1000 },
    blurb: '1TB · 7300MB/s · DRAM cache',
  },
  {
    id: 'm2-sn850x-1tb', category: 'm2', name: 'Black SN850X 1TB', brand: 'WD',
    price: 11500, watts: 6, color: '#16181d',
    specs: { sizeGB: 1000 },
    blurb: 'Gaming favourite · 7300MB/s',
  },
  {
    id: 'm2-990pro-1tb', category: 'm2', name: '990 Pro 1TB', brand: 'Samsung',
    price: 12800, watts: 6, color: '#16181d',
    specs: { sizeGB: 1000 },
    blurb: 'Gen4 flagship · 7450MB/s',
  },
  {
    id: 'm2-sn850x-2tb', category: 'm2', name: 'Black SN850X 2TB', brand: 'WD',
    price: 21500, watts: 7, color: '#14161b',
    specs: { sizeGB: 2000 },
    blurb: '2TB · the whole Steam library',
  },

  // ──────────────────────── SATA Drives ────────────────────────
  {
    id: 'drive-870evo-1tb', category: 'drive', name: '870 EVO 1TB SSD', brand: 'Samsung',
    price: 7499, watts: 4, color: '#2e3037',
    specs: { sizeGB: 1000, kind: 'SSD' },
    blurb: '2.5" SATA SSD · reliable secondary',
  },
  {
    id: 'drive-barra-2tb', category: 'drive', name: 'Barracuda 2TB HDD', brand: 'Seagate',
    price: 5200, watts: 8, color: '#35373e',
    specs: { sizeGB: 2000, kind: 'HDD' },
    blurb: '3.5" 7200RPM · bulk storage',
  },

  // ──────────────────────── Power Supplies ────────────────────────
  {
    id: 'psu-a650bn', category: 'psu', name: 'MAG A650BN 650W', brand: 'MSI',
    price: 4200, watts: 0, color: '#222428',
    specs: { wattage: 650, form: 'ATX', rating: '80+ Bronze' },
    blurb: '650W · Bronze · budget builds',
  },
  {
    id: 'psu-pq750m', category: 'psu', name: 'PQ750M 750W Gold', brand: 'Deepcool',
    price: 7300, watts: 0, color: '#1e2024',
    specs: { wattage: 750, form: 'ATX', rating: '80+ Gold' },
    blurb: '750W · Gold · fully modular',
  },
  {
    id: 'psu-rm850e', category: 'psu', name: 'RM850e ATX 3.1', brand: 'Corsair',
    price: 11000, watts: 0, color: '#1c1e22',
    specs: { wattage: 850, form: 'ATX', rating: '80+ Gold' },
    blurb: '850W · Gold · 12V-2x6 native',
  },
  {
    id: 'psu-rm1000e', category: 'psu', name: 'RM1000e ATX 3.1', brand: 'Corsair',
    price: 15500, watts: 0, color: '#191b1f',
    specs: { wattage: 1000, form: 'ATX', rating: '80+ Gold' },
    blurb: '1000W · Gold · big-GPU headroom',
  },
  {
    id: 'psu-sf750', category: 'psu', name: 'SF750 SFX Platinum', brand: 'Corsair',
    price: 16500, watts: 0, color: '#1c1e22',
    specs: { wattage: 750, form: 'SFX', rating: '80+ Platinum' },
    blurb: '750W · SFX · the SFF king',
  },
]

export const byId = Object.fromEntries(PARTS.map((p) => [p.id, p]))
export const byCategory = (cat) => PARTS.filter((p) => p.category === cat)

export const fmtINR = (n) =>
  n === 0 ? 'FREE' : `₹${n.toLocaleString('en-IN')}`

// Live retailer searches — prices in the catalog are indicative; these
// always show today's real Indian price.
export const buyLinks = (partId) => {
  const p = byId[partId]
  const q = encodeURIComponent(`${p.brand} ${p.name}`)
  return {
    real: `${p.brand} ${p.name}`,
    amazon: `https://www.amazon.in/s?k=${q}`,
    md: `https://mdcomputers.in/index.php?route=product/search&search=${q}`,
    pabgb: `https://www.primeabgb.com/?s=${q}&post_type=product`,
  }
}
