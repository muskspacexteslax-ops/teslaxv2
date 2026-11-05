import type { CarModel } from '../lib/db'

export const BODY_LABEL: Record<string, string> = {
  sedan: 'Sedan',
  suv: 'SUV',
  truck: 'Pickup',
  roadster: 'Roadster',
  semi: 'Commercial',
}

export const MODELS: CarModel[] = [
  {
    slug: 'model-3',
    name: 'Model 3',
    era: '2017 — present',
    body: 'sedan',
    bodyLabel: 'Sedan',
    tagline: 'The daily driver built for electric scale.',
    blurb: 'Designed for electric mass adoption. Over 500,000 produced per year, a rigid steel-aluminium hybrid chassis, minimalist glass cabin and unmatched efficiency per mile.',
    swap_value: 2900000,
    list_price: 3899000,
    color: '#9aa0a6',
    photo: '/images/cars/model-3.jpg',
    badge: 'POPULAR',
    specs: [
      { label: 'Range', value: '341 mi' },
      { label: '0—60', value: '4.2 s' },
      { label: 'Drive', value: 'Dual Motor AWD' },
      { label: 'Efficiency', value: '132 MPGe' },
    ],
    specs_json: JSON.stringify([
      { label: 'Range', value: '341 mi' },
      { label: '0—60', value: '4.2 s' },
      { label: 'Drive', value: 'Dual Motor AWD' },
      { label: 'Efficiency', value: '132 MPGe' },
    ]),
  },
  {
    slug: 'model-y',
    name: 'Model Y',
    era: '2020 — present',
    body: 'suv',
    bodyLabel: 'SUV',
    tagline: 'The best-selling vehicle in the world.',
    blurb: 'The global benchmark electric compact crossover. Single-piece megacasting architecture, 76 cu ft cargo capacity and top safety marks across all tested crash categories.',
    swap_value: 3600000,
    list_price: 4499000,
    color: '#e82127',
    photo: '/images/cars/model-y.jpg',
    badge: 'BESTSELLER',
    specs: [
      { label: 'Range', value: '310 mi' },
      { label: '0—60', value: '3.5 s' },
      { label: 'Cargo', value: '76 cu ft' },
      { label: 'Drive', value: 'Dual Motor AWD' },
    ],
    specs_json: JSON.stringify([
      { label: 'Range', value: '310 mi' },
      { label: '0—60', value: '3.5 s' },
      { label: 'Cargo', value: '76 cu ft' },
      { label: 'Drive', value: 'Dual Motor AWD' },
    ]),
  },
  {
    slug: 'cybertruck',
    name: 'Cybertruck',
    era: '2023 — present',
    body: 'truck',
    bodyLabel: 'Pickup',
    tagline: 'Stainless exoskeleton. Armoured glass. 11,000 lbs towing.',
    blurb: 'Cold-rolled 30X stainless steel exoskeleton with steer-by-wire 48V electrical architecture. Shatter-resistant armour glass and shatterproof exterior panels.',
    swap_value: 7900000,
    list_price: 9999000,
    color: '#b0b5bc',
    photo: '/images/cars/cybertruck.jpg',
    badge: 'ICONIC',
    specs: [
      { label: 'Range', value: '340 mi' },
      { label: '0—60', value: '2.6 s' },
      { label: 'Towing', value: '11,000 lbs' },
      { label: 'Payload', value: '2,500 lbs' },
    ],
    specs_json: JSON.stringify([
      { label: 'Range', value: '340 mi' },
      { label: '0—60', value: '2.6 s' },
      { label: 'Towing', value: '11,000 lbs' },
      { label: 'Payload', value: '2,500 lbs' },
    ]),
  },
  {
    slug: 'model-s',
    name: 'Model S',
    era: '2012 — present',
    body: 'sedan',
    bodyLabel: 'Sedan',
    tagline: 'The sedan that redefined the luxury saloon.',
    blurb: 'The flagship electric saloon. Dual motor all-wheel drive, adaptive air suspension and an aerodynamic drag coefficient of just 0.208 Cd.',
    swap_value: 4900000,
    list_price: 8999000,
    color: '#3d444d',
    photo: '/images/cars/model-s.jpg',
    badge: 'FLAGSHIP',
    specs: [
      { label: 'Range', value: '402 mi' },
      { label: '0—60', value: '3.1 s' },
      { label: 'Top speed', value: '130 mph' },
      { label: 'Peak power', value: '670 hp' },
    ],
    specs_json: JSON.stringify([
      { label: 'Range', value: '402 mi' },
      { label: '0—60', value: '3.1 s' },
      { label: 'Top speed', value: '130 mph' },
      { label: 'Peak power', value: '670 hp' },
    ]),
  },
  {
    slug: 'model-s-plaid',
    name: 'Model S Plaid',
    era: '2021 — present',
    body: 'sedan',
    bodyLabel: 'Sedan',
    tagline: '1,020 horsepower. 0—60 in 1.99 seconds.',
    blurb: 'Tri-motor torque vectoring with carbon-sleeved rotors. Sub-2-second acceleration that outperforms multimillion-dollar hypercars with four seats and full luggage space.',
    swap_value: 6500000,
    list_price: 10999000,
    color: '#1a1b1e',
    photo: '/images/cars/model-s-plaid.jpg',
    badge: 'TRI-MOTOR',
    specs: [
      { label: 'Range', value: '359 mi' },
      { label: '0—60', value: '1.99 s' },
      { label: 'Top speed', value: '200 mph' },
      { label: 'Peak power', value: '1,020 hp' },
    ],
    specs_json: JSON.stringify([
      { label: 'Range', value: '359 mi' },
      { label: '0—60', value: '1.99 s' },
      { label: 'Top speed', value: '200 mph' },
      { label: 'Peak power', value: '1,020 hp' },
    ]),
  },
  {
    slug: 'model-x',
    name: 'Model X',
    era: '2015 — present',
    body: 'suv',
    bodyLabel: 'SUV',
    tagline: 'Falcon Wing doors. Three rows. 5,000 lbs towing.',
    blurb: 'Double-hinged Falcon Wing doors with ultrasonic sensing, expansive panoramic windshield and available seating for up to seven adults.',
    swap_value: 5800000,
    list_price: 9499000,
    color: '#0d1117',
    photo: '/images/cars/model-x.jpg',
    specs: [
      { label: 'Range', value: '335 mi' },
      { label: '0—60', value: '3.8 s' },
      { label: 'Towing', value: '5,000 lbs' },
      { label: 'Seating', value: 'Up to 7' },
    ],
    specs_json: JSON.stringify([
      { label: 'Range', value: '335 mi' },
      { label: '0—60', value: '3.8 s' },
      { label: 'Towing', value: '5,000 lbs' },
      { label: 'Seating', value: 'Up to 7' },
    ]),
  },
  {
    slug: 'roadster-2',
    name: 'Tesla Roadster',
    era: 'Pre-Order · Volume Production Slated Further Out',
    body: 'roadster',
    bodyLabel: 'Roadster',
    tagline: 'Redesigned next-generation Roadster with optional SpaceX cold-gas thrusters.',
    blurb: 'A redesigned next-generation Roadster with optional SpaceX cold-gas thruster technology and ultra-fast acceleration was unveiled, though volume production is slated further out. Features deep sub-second 0–60 capability with cold-gas thrusters, over 620 miles of electric range, and a removable glass roof.',
    swap_value: 14500000,
    list_price: 20000000,
    color: '#e82127',
    photo: '/images/cars/roadster-2.jpg',
    badge: 'PRE-ORDER · SPACEX THRUSTERS',
    specs: [
      { label: '0—60 mph', value: '< 1.0 s (SpaceX Thruster)' },
      { label: 'Range', value: '620+ mi' },
      { label: 'Top speed', value: '> 250 mph' },
      { label: 'Thrusters', value: 'SpaceX Cold-Gas' },
    ],
    specs_json: JSON.stringify([
      { label: '0—60 mph', value: '< 1.0 s (SpaceX Thruster)' },
      { label: 'Range', value: '620+ mi' },
      { label: 'Top speed', value: '> 250 mph' },
      { label: 'Thrusters', value: 'SpaceX Cold-Gas' },
    ]),
  },
  {
    slug: 'tesla-semi',
    name: 'Tesla Semi',
    era: '2022 — present',
    body: 'semi',
    bodyLabel: 'Commercial',
    tagline: 'Class 8 heavy electric hauler. 82,000 lbs gross.',
    blurb: 'Three independent drive motors powering the rear axles, central seating position for maximum situational awareness and sub-2 kWh per mile operating efficiency.',
    swap_value: 12500000,
    list_price: 18000000,
    color: '#ffffff',
    photo: '/images/cars/tesla-semi.jpg',
    badge: 'COMMERCIAL',
    specs: [
      { label: 'Range', value: '500 mi' },
      { label: 'GCW', value: '82,000 lbs' },
      { label: '0—60 loaded', value: '20 s' },
      { label: 'Efficiency', value: '< 2 kWh/mi' },
    ],
    specs_json: JSON.stringify([
      { label: 'Range', value: '500 mi' },
      { label: 'GCW', value: '82,000 lbs' },
      { label: '0—60 loaded', value: '20 s' },
      { label: 'Efficiency', value: '< 2 kWh/mi' },
    ]),
  },
  {
    slug: 'original-roadster',
    name: 'Original Roadster',
    era: '2008 — 2012',
    body: 'roadster',
    bodyLabel: 'Roadster',
    tagline: 'The historic pioneer that launched the revolution.',
    blurb: 'The first production automobile to use lithium-ion battery cells and the first production all-electric car to travel more than 200 miles on a single charge.',
    swap_value: 4200000,
    list_price: 10900000,
    color: '#b9bec6',
    photo: '/images/cars/original-roadster.jpg',
    badge: 'GENESIS',
    specs: [
      { label: 'Range', value: '244 mi' },
      { label: '0—60', value: '3.7 s' },
      { label: 'Chassis', value: 'Bonded aluminium' },
      { label: 'Production', value: '2,450 units' },
    ],
    specs_json: JSON.stringify([
      { label: 'Range', value: '244 mi' },
      { label: '0—60', value: '3.7 s' },
      { label: 'Chassis', value: 'Bonded aluminium' },
      { label: 'Production', value: '2,450 units' },
    ]),
  },
]

export function marketOf(m: CarModel): number {
  return m.list_price || Math.round(m.swap_value * 1.18)
}

export function carSVG(
  bodyOrSlug: string,
  color: string = '#c0c5cc',
  options: { glow?: boolean } = {}
): string {
  const glow = options.glow
  const body = (bodyOrSlug || 'sedan').toLowerCase()

  if (body.includes('truck') || body.includes('cybertruck')) {
    return `<svg class="car-art" viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g-truck" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="${color}" stop-opacity="0.35" />
        </linearGradient>
        ${glow ? `<filter id="glow-tr"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : ''}
      </defs>
      <ellipse cx="200" cy="148" rx="170" ry="4" fill="rgba(255,255,255,0.12)" />
      <g ${glow ? 'filter="url(#glow-tr)"' : ''}>
        <path d="M18 116 L18 92 L112 44 L268 44 L330 70 L382 100 L382 116 Z" fill="url(#g-truck)" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linejoin="round" />
        <path d="M124 52 L258 52 L308 70 L124 70 Z" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.25)" stroke-width="0.8" />
      </g>
      <circle cx="96" cy="116" r="24" fill="#0d0e12" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
      <circle cx="96" cy="116" r="10" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" />
      <circle cx="312" cy="116" r="24" fill="#0d0e12" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
      <circle cx="312" cy="116" r="10" fill="none" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" />
      <line x1="20" y1="120" x2="380" y2="120" stroke="rgba(255,255,255,0.06)" />
    </svg>`
  }

  if (body.includes('semi')) {
    return `<svg class="car-art" viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g-semi" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="${color}" stop-opacity="0.95" />
          <stop offset="100%" stop-color="${color}" stop-opacity="0.3" />
        </linearGradient>
      </defs>
      <ellipse cx="200" cy="148" rx="170" ry="4" fill="rgba(255,255,255,0.12)" />
      <path d="M18 116 L18 74 C18 56 30 44 48 40 L108 30 C126 26 140 34 142 52 L146 74 L182 74 L182 116 Z" fill="url(#g-semi)" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linejoin="round" />
      <path d="M32 66 L32 46 C32 38 38 34 46 32 L126 22 L134 44 L134 66 Z" fill="rgba(255,255,255,0.18)" stroke="rgba(255,255,255,0.2)" stroke-width="0.8" />
      <circle cx="64" cy="116" r="22" fill="#0d0e12" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
      <circle cx="152" cy="116" r="22" fill="#0d0e12" stroke="rgba(255,255,255,0.3)" stroke-width="1.5" />
    </svg>`
  }

  // Sleek Sedan / SUV / Roadster default
  return `<svg class="car-art" viewBox="0 0 400 160" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="g-car" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.95" />
        <stop offset="100%" stop-color="${color}" stop-opacity="0.25" />
      </linearGradient>
      ${glow ? `<filter id="glow-c"><feGaussianBlur stdDeviation="8" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>` : ''}
    </defs>
    <ellipse cx="200" cy="148" rx="175" ry="4" fill="rgba(255,255,255,0.12)" />
    <g ${glow ? 'filter="url(#glow-c)"' : ''}>
      <path d="M24 112 C28 92 64 86 112 82 C146 66 186 52 232 52 C286 52 322 72 344 86 C368 92 376 102 378 112 Z" fill="url(#g-car)" stroke="rgba(255,255,255,0.4)" stroke-width="1.2" stroke-linejoin="round" />
      <path d="M148 78 C174 62 208 58 244 58 C276 58 304 68 316 78 Z" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.22)" stroke-width="0.8" />
    </g>
    <circle cx="94" cy="116" r="23" fill="#0a0a0c" stroke="rgba(255,255,255,0.3)" stroke-width="1.4" />
    <circle cx="94" cy="116" r="11" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.2" />
    <circle cx="308" cy="116" r="23" fill="#0a0a0c" stroke="rgba(255,255,255,0.3)" stroke-width="1.4" />
    <circle cx="308" cy="116" r="11" fill="none" stroke="rgba(255,255,255,0.22)" stroke-width="1.2" />
    <line x1="20" y1="120" x2="380" y2="120" stroke="rgba(255,255,255,0.06)" />
  </svg>`
}

