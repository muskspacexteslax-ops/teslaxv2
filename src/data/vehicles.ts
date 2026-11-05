export interface VehicleSpec {
  label: string;
  value: string;
}

export interface Vehicle {
  slug: string;
  name: string;
  era: string;
  body: "sedan" | "suv" | "truck" | "roadster" | "semi";
  bodyLabel: string;
  memberPrice: number;
  listPrice: number;
  leaseMonthly: number;
  hireDaily: number;
  badge?: string;
  tagline: string;
  description: string;
  specs: VehicleSpec[];
  color: string;
}

export const VEHICLES: Vehicle[] = [
  {
    slug: "original-roadster",
    name: "Original Roadster",
    era: "2008 — 2012",
    body: "roadster",
    bodyLabel: "Roadster",
    memberPrice: 2500,
    listPrice: 109000,
    leaseMonthly: 225,
    hireDaily: 89,
    badge: "GEN 1",
    tagline: "The one that started it all.",
    description:
      "The first production Tesla. A Lotus-derived chassis, an electric heart, and the proof that an EV could be fast. Every car since exists because of this one.",
    specs: [
      { label: "Range", value: "245 mi" },
      { label: "0—60", value: "3.7 s" },
      { label: "Top speed", value: "125 mph" },
      { label: "Seats", value: "2" },
    ],
    color: "#b9bec6",
  },
  {
    slug: "model-s",
    name: "Model S",
    era: "2012 — present",
    body: "sedan",
    bodyLabel: "Sedan",
    memberPrice: 4900,
    listPrice: 89990,
    leaseMonthly: 441,
    hireDaily: 119,
    tagline: "The sedan that redefined the sedan.",
    description:
      "The benchmark electric saloon. Dual motor all-wheel drive, air suspension and a battery architecture that will outlast two petrol engines.",
    specs: [
      { label: "Range", value: "402 mi" },
      { label: "0—60", value: "3.1 s" },
      { label: "Top speed", value: "130 mph" },
      { label: "Seats", value: "5" },
    ],
    color: "#e9ecef",
  },
  {
    slug: "model-s-plaid",
    name: "Model S Plaid",
    era: "2021 — present",
    body: "sedan",
    bodyLabel: "Sedan",
    memberPrice: 6900,
    listPrice: 109990,
    leaseMonthly: 621,
    hireDaily: 179,
    badge: "TRI-MOTOR",
    tagline: "Beyond ludicrous.",
    description:
      "Tri-motor all-wheel drive, carbon-sleeved rotors and 1,020 horsepower. The fastest accelerating production sedan in existence.",
    specs: [
      { label: "Range", value: "359 mi" },
      { label: "0—60", value: "1.99 s" },
      { label: "Top speed", value: "200 mph" },
      { label: "Seats", value: "5" },
    ],
    color: "#1b1d21",
  },
  {
    slug: "model-x",
    name: "Model X",
    era: "2015 — present",
    body: "suv",
    bodyLabel: "SUV",
    memberPrice: 5400,
    listPrice: 99990,
    leaseMonthly: 486,
    hireDaily: 139,
    tagline: "Falcon wing doors. Seven seats. Electric power.",
    description:
      "The largest and most capable utility vehicle Tesla builds. Falcon wing doors allow effortless loading in the tightest bays, with room for seven adults.",
    specs: [
      { label: "Range", value: "335 mi" },
      { label: "0—60", value: "3.8 s" },
      { label: "Top speed", value: "155 mph" },
      { label: "Seats", value: "7" },
    ],
    color: "#f2f4f7",
  },
  {
    slug: "model-3",
    name: "Model 3",
    era: "2017 — present",
    body: "sedan",
    bodyLabel: "Sedan",
    memberPrice: 2900,
    listPrice: 42990,
    leaseMonthly: 261,
    hireDaily: 89,
    badge: "MOST LEASED",
    tagline: "The car that made electric normal.",
    description:
      "Compact, ruthlessly efficient, and the single best-selling EV on earth. This is the model that turns a petrol household electric.",
    specs: [
      { label: "Range", value: "363 mi" },
      { label: "0—60", value: "4.1 s" },
      { label: "Top speed", value: "145 mph" },
      { label: "Seats", value: "5" },
    ],
    color: "#c0392b",
  },
  {
    slug: "model-y",
    name: "Model Y",
    era: "2020 — present",
    body: "suv",
    bodyLabel: "SUV",
    memberPrice: 3100,
    listPrice: 46990,
    leaseMonthly: 279,
    hireDaily: 95,
    tagline: "The most practical Tesla ever built.",
    description:
      "The world's best-selling car in 2023. Higher ride height, cavernous boot space and identical efficiency to the Model 3.",
    specs: [
      { label: "Range", value: "310 mi" },
      { label: "0—60", value: "4.8 s" },
      { label: "Top speed", value: "135 mph" },
      { label: "Seats", value: "5" },
    ],
    color: "#4a5568",
  },
  {
    slug: "cybertruck",
    name: "Cybertruck",
    era: "2023 — present",
    body: "truck",
    bodyLabel: "Pickup",
    memberPrice: 750,
    listPrice: 99990,
    leaseMonthly: 199,
    hireDaily: 149,
    badge: "MEMBER PICK",
    tagline: "Stainless steel. No compromises.",
    description:
      "Cold-rolled 30X stainless steel exoskeleton, shatter-resistant armour glass and adaptive air suspension. Built for anything.",
    specs: [
      { label: "Range", value: "340 mi" },
      { label: "0—60", value: "2.6 s" },
      { label: "Top speed", value: "130 mph" },
      { label: "Seats", value: "5" },
    ],
    color: "#a9b0b8",
  },
  {
    slug: "tesla-semi",
    name: "Tesla Semi",
    era: "2024 — present",
    body: "semi",
    bodyLabel: "Commercial",
    memberPrice: 9000,
    listPrice: 250000,
    leaseMonthly: 810,
    hireDaily: 299,
    tagline: "Heavy haulage. Zero emissions.",
    description:
      "Three independent electric motors powering the rear axles. Unladen 0-60 in 5 seconds; 20 seconds with a full 82,000 lb load. Changes the economics of freight.",
    specs: [
      { label: "Range", value: "500 mi" },
      { label: "0—60", value: "20 s (82k lbs)" },
      { label: "Top speed", value: "65 mph" },
      { label: "Seats", value: "1" },
    ],
    color: "#dfe3e8",
  },
  {
    slug: "roadster-2",
    name: "Tesla Roadster",
    era: "Pre-Order · Volume Production Slated Further Out",
    body: "roadster",
    bodyLabel: "Roadster",
    memberPrice: 5000,
    listPrice: 200000,
    leaseMonthly: 450,
    hireDaily: 249,
    badge: "PRE-ORDER · SPACEX THRUSTERS",
    tagline: "Redesigned next-generation Roadster with optional SpaceX cold-gas thrusters.",
    description:
      "A redesigned next-generation Roadster with optional SpaceX cold-gas thruster technology and ultra-fast acceleration was unveiled, though volume production is slated further out. Features deep sub-second 0–60 capability with cold-gas thrusters, over 620 miles of electric range, and a removable glass roof.",
    specs: [
      { label: "Range", value: "620+ mi" },
      { label: "0—60", value: "< 1.0 s (SpaceX Thruster)" },
      { label: "Top speed", value: "> 250 mph" },
      { label: "Propulsion", value: "Tri-Motor AWD + Thrusters" },
    ],
    color: "#e82127",
  },
  {
    slug: "roadster-flying",
    name: "Roadster SpaceX (Flying Model)",
    era: "2028 — taking pre-orders",
    body: "roadster",
    bodyLabel: "Flying Supercar",
    memberPrice: 7500,
    listPrice: 250000,
    leaseMonthly: 620,
    hireDaily: 350,
    badge: "SPACEX FLIGHT",
    tagline: "10 cold-gas thrusters. 0—60 in 0.8s. Yes, it flies.",
    description:
      "Developed in collaboration with SpaceX. Ten directional cold-gas rocket thrusters fed by high-pressure composite tanks (COPV) deliver mid-air hops, pitch/yaw rotation control, hover capability, and a sub-1 second launch.",
    specs: [
      { label: "Flight Mode", value: "10 SpaceX Thrusters" },
      { label: "0—60", value: "0.8 s (Thruster-assisted)" },
      { label: "Top speed", value: "250+ mph" },
      { label: "Air System", value: "600L COPV @ 10,000 PSI" },
      { label: "Range", value: "620 mi" },
      { label: "Seats", value: "2" },
    ],
    color: "#e82127",
  },
  {
    slug: "cybercab",
    name: "Cybercab Robotaxi",
    era: "2026 — taking pre-orders",
    body: "sedan",
    bodyLabel: "Autonomous Robotaxi",
    memberPrice: 1500,
    listPrice: 29990,
    leaseMonthly: 189,
    hireDaily: 49,
    badge: "AUTONOMOUS",
    tagline: "No pedals. No steering wheel. Pure autonomy.",
    description:
      "Two-seat dedicated cyber-styled robotaxi featuring motorized butterfly doors, contactless inductive wireless fast charging, expansive luggage bay, and full unsupervised autonomous intelligence.",
    specs: [
      { label: "Autonomy", value: "Unsupervised FSD" },
      { label: "Charging", value: "Wireless Inductive" },
      { label: "Range", value: "300 mi" },
      { label: "Doors", value: "Butterfly Wing" },
      { label: "Seats", value: "2" },
    ],
    color: "#d4af37",
  },
];

export function getVehicleBySlug(slug: string): Vehicle | undefined {
  return VEHICLES.find((v) => v.slug === slug);
}

export function formatCurrency(amount: number): string {
  return "$" + amount.toLocaleString("en-US");
}
