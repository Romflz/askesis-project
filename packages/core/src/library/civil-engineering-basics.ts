import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Branches
  {
    front: 'Structural engineering',
    back: 'Designing buildings, bridges, towers and other structures to carry their loads safely and stay fit for use',
  },
  {
    front: 'Geotechnical engineering',
    back: 'Applying the behavior of soil and rock to foundations, slopes, retaining walls, tunnels and earthworks',
  },
  {
    front: 'Transportation engineering',
    back: 'Planning, designing and operating roads, railways, airports and transit so people and goods move safely and efficiently',
  },
  {
    front: 'Water resources engineering',
    back: 'Managing water: dams, canals, pipelines, flood control and irrigation',
    extra: 'Its core sciences are hydraulics (how water flows) and hydrology (where water comes from and how much).',
  },
  {
    front: 'Environmental engineering',
    back: 'Protecting health and the environment: drinking water treatment, wastewater, solid waste and air quality',
  },
  // Loads
  {
    front: 'Dead load',
    back: 'The permanent weight of the structure and everything fixed to it: beams, slabs, walls, finishes and fixed equipment',
    extra: r`It can be estimated well from member sizes and densities. Reinforced concrete, for example, weighs about 24 to \(25\ \mathrm{kN/m^3}\).`,
  },
  {
    front: 'Live load',
    back: 'Variable gravity load from use and occupancy: people, furniture, movable equipment and stored goods',
    extra: 'Building codes set minimum values for each type of occupancy, usually as a uniform floor pressure.',
  },
  {
    front: 'Wind load',
    back: 'Pressure and suction from wind on a structure’s surfaces, acting mainly sideways, plus uplift on roofs',
    extra: r`Pressure grows with the square of the wind speed: \(q = \tfrac{1}{2}\rho v^2\).`,
  },
  {
    front: 'Snow load',
    back: 'The weight of snow on a roof, based on the site’s ground snow load and adjusted for roof slope, exposure and drifting',
  },
  {
    front: 'Seismic load',
    back: 'Inertial forces from earthquake ground shaking, acting mainly horizontally',
    extra: 'They grow with the building’s mass, so heavier structures attract larger seismic forces.',
  },
  {
    front: 'Point load vs uniformly distributed load',
    back: r`A point load acts at one spot (\(\mathrm{kN}\)); a uniformly distributed load is spread evenly along a length (\(\mathrm{kN/m}\)) or over an area (\(\mathrm{kN/m^2}\))`,
  },
  // Forces in members
  {
    front: 'Tension',
    back: 'Forces that pull a member apart and lengthen it',
    extra: 'Cables, hangers and ties work in tension.',
  },
  {
    front: 'Compression',
    back: 'Forces that push on a member and shorten it',
    extra: 'Columns and struts work in compression; long, slender ones can fail by buckling sideways.',
  },
  {
    front: 'Shear',
    back: 'Forces acting parallel to a cross-section that tend to slide one part of a member past the next',
  },
  {
    front: 'Bending',
    back: 'Loads across a member’s length make it curve, putting one face in compression and the other in tension',
    extra: 'In a simply supported beam under gravity load, the top is in compression and the bottom in tension.',
  },
  {
    front: 'Normal stress',
    back: r`\(\sigma = \dfrac{F}{A}\)`,
    extra: r`Force per unit area of cross-section. \(1\ \mathrm{MPa} = 1\ \mathrm{N/mm^2}\).`,
  },
  {
    front: 'Young’s modulus',
    back: r`\(E = \dfrac{\sigma}{\varepsilon}\), the ratio of stress to strain in the elastic range`,
    extra: r`Strain \(\varepsilon = \Delta L / L\) has no units. For steel, \(E \approx 200\ \mathrm{GPa}\).`,
  },
  // Structural members and supports
  {
    front: 'Beam',
    back: 'A member, usually horizontal, that carries loads across its length mainly by bending and shear',
  },
  { front: 'Column', back: 'A vertical member that carries load mainly in axial compression' },
  {
    front: 'Truss',
    back: 'A framework of straight members joined at their ends into triangles; with loads applied at the joints, each member carries only tension or compression',
    extra: 'Triangles keep it rigid: a triangle can’t change shape unless one of its sides changes length.',
  },
  {
    front: 'Pin support',
    back: 'Prevents movement in both directions but allows rotation: two reaction forces, no moment',
  },
  {
    front: 'Roller support',
    back: 'Prevents movement perpendicular to the surface only: one reaction force, normal to the surface',
    extra:
      'It lets the member expand and contract freely. A beam on a pin at one end and a roller at the other is simply supported.',
  },
  {
    front: 'Fixed support',
    back: 'Prevents movement and rotation: two reaction forces and a reaction moment',
    extra: 'A cantilever is a beam fixed at one end and free at the other.',
  },
  {
    front: 'Equations of static equilibrium in 2D',
    back: r`\(\sum F_x = 0,\quad \sum F_y = 0,\quad \sum M = 0\)`,
    extra: 'Three equations, so statics alone can find up to three unknown reactions on a single rigid body.',
  },
  // Concrete
  {
    front: 'Ingredients of concrete',
    back: 'Cement, water, fine aggregate (sand) and coarse aggregate (gravel or crushed stone), often with admixtures',
    extra: 'Aggregates fill about 60–75% of the volume; the cement paste binds them together.',
  },
  {
    front: 'Portland cement',
    back: 'A hydraulic cement: it sets and hardens by reacting chemically with water (hydration), even under water',
    extra: 'It is made by heating limestone and clay in a kiln to form clinker, which is ground with a little gypsum.',
  },
  {
    front: 'Water–cement ratio',
    back: 'The mass of water divided by the mass of cement in a mix',
    extra:
      'Lower ratios give stronger, more durable concrete; extra water makes it easier to place but leaves pores. Typical structural mixes are about 0.4 to 0.6.',
  },
  {
    front: 'Curing concrete',
    back: 'Keeping fresh concrete moist and warm enough after placing so hydration continues',
    extra: 'Good curing raises strength and durability and reduces shrinkage cracking; it typically lasts at least 7 days.',
  },
  {
    front: 'Slump test',
    back: 'A workability test for fresh concrete: fill a standard cone, lift it off and measure how far the concrete sinks',
    extra: 'A higher slump means a more fluid mix.',
  },
  {
    front: 'Age at which concrete strength is usually specified',
    back: '28 days',
    extra: r`Measured by crushing standard cylinders or cubes. Typical structural concrete is about 20 to \(40\ \mathrm{MPa}\).`,
  },
  {
    front: 'Tensile strength of concrete',
    back: 'Low: roughly 10% of its compressive strength',
    extra: 'Concrete cracks easily in tension, which is why steel is added to carry it.',
  },
  {
    front: 'Reinforced concrete',
    back: 'Concrete with embedded steel bars (rebar) that carry the tension, while the concrete carries the compression',
    extra:
      'In a simply supported beam the main bars go near the bottom, where bending causes tension. Ribs on the bars help them bond to the concrete.',
  },
  {
    front: 'Concrete cover',
    back: 'The layer of concrete between the reinforcement and the surface',
    extra: r`It protects the steel from corrosion and fire and lets the bars bond. Typically about 20 to \(75\ \mathrm{mm}\), more for harsher exposure.`,
  },
  // Steel
  {
    front: 'Why an I-beam is shaped like an I',
    back: 'Most of the steel sits in the flanges, far from the middle of the section, where it resists bending best; the thin web carries the shear',
  },
  {
    front: 'Common structural steel shapes',
    back: 'Wide-flange (I or H) sections, channels, angles, tees and hollow structural sections (tubes)',
  },
  {
    front: 'Yield strength of steel',
    back: 'The stress at which steel starts to deform permanently',
    extra: r`Common structural grades yield at about 250 to \(355\ \mathrm{MPa}\).`,
  },
  // Soils and foundations
  {
    front: 'Soil types from coarsest to finest',
    back: 'Gravel, sand, silt, clay',
    extra: r`Gravel and sand are coarse-grained; silt and clay are fine-grained. Size limits differ between classification systems, but clay particles are typically under \(0.002\ \mathrm{mm}\).`,
  },
  {
    front: 'Cohesive vs granular soils',
    back: 'Cohesive soils (clays) stick together and are plastic when moist; granular soils (sands and gravels) get their strength from friction between grains and drain freely',
  },
  {
    front: 'Shallow foundation',
    back: 'Spreads the load into soil near the surface: strip footings under walls, pad footings under columns, or a raft under the whole building',
    extra: 'Its depth is typically no greater than its width.',
  },
  {
    front: 'Deep foundation',
    back: 'Piles or drilled shafts that carry load down through weak soil to stronger soil or rock',
  },
  {
    front: 'End-bearing vs friction piles',
    back: 'An end-bearing pile carries load mainly through its tip into a firm layer; a friction pile carries it mainly by friction along its shaft',
  },
  {
    front: 'Differential settlement',
    back: 'Uneven settlement between parts of a structure',
    extra: 'It distorts and cracks a building far more than the same amount of uniform settlement.',
  },
  // Surveying
  {
    front: 'Leveling',
    back: 'Finding differences in height between points with a level and a graduated staff',
    extra: 'The staff is also called a rod.',
  },
  { front: 'Benchmark', back: 'A permanent point of known elevation used as the reference for leveling' },
  {
    front: 'Height of instrument method',
    back: r`\(\mathrm{HI} = \text{known elevation} + \text{backsight}\), then \(\text{new elevation} = \mathrm{HI} - \text{foresight}\)`,
    extra:
      'A backsight is a staff reading on a point of known height; a foresight is a reading on a point whose height you want.',
  },
  {
    front: 'Contour line',
    back: 'A line on a map joining points of equal elevation',
    extra: 'Closely spaced contours mean a steep slope; widely spaced ones mean a gentle slope.',
  },
  // Drainage and roads
  {
    front: 'Road crown',
    back: 'The cross slope from the center of a road down to its edges, so rain drains off the surface',
    extra: 'Typically about 2% on paved roads.',
  },
  { front: 'Culvert', back: 'A pipe or box that carries a stream or drainage water under a road, railway or embankment' },
  {
    front: 'Storm sewer vs sanitary sewer',
    back: 'A storm sewer carries rainwater runoff; a sanitary sewer carries wastewater from buildings to a treatment plant',
    extra: 'A combined sewer carries both, and can overflow in heavy rain.',
  },
  {
    front: 'Layers of an asphalt road, from the top down',
    back: 'Surface course, base course, subbase, subgrade',
    extra: 'The subgrade is the prepared soil underneath; each layer spreads the wheel load before it reaches the one below.',
  },
]

export const CIVIL_ENGINEERING_BASICS: PublicDeck = {
  slug: 'civil-engineering-basics',
  title: 'Civil engineering basics: 50 core concepts',
  shortTitle: 'Civil engineering basics',
  category: 'engineering',
  level: 'beginner',
  icon: 'globe',
  description:
    'Learn the core ideas of civil engineering: loads, tension and compression, beams and trusses, concrete and steel, soils, foundations, surveying and roads.',
  intro:
    'Civil engineers design and build what a society runs on: buildings, bridges, roads, water supply and drainage. This deck covers the vocabulary of a first course, from load types and the forces inside members to concrete, steel, soils, foundations, surveying and roads, with one idea per card.',
  faq: [
    {
      q: 'Do I need a math background for this deck?',
      a: 'Very little. A few cards use simple formulas, such as stress equals force over area; the rest are definitions and concepts from a first civil engineering course.',
    },
    {
      q: 'Why is concrete reinforced with steel?',
      a: 'Concrete is strong in compression but cracks under modest tension. Steel bars placed where bending causes tension carry that force, and the two materials bond well and expand by similar amounts with temperature.',
    },
    {
      q: 'What should I study after this deck?',
      a: 'Intermediate civil engineering, which builds on these terms with structural analysis, soil mechanics, hydraulics, transportation and water treatment.',
    },
  ],
  cards: CARDS,
}
