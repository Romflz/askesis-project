import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Statics
  {
    front: 'Moment of a force about a point',
    back: r`\(M = Fd\)`,
    extra: r`\(d\) is the perpendicular distance from the point to the force’s line of action. Measured in \(\mathrm{N\,m}\).`,
  },
  {
    front: 'Couple',
    back: 'Two equal, opposite, parallel forces whose lines of action don’t coincide; they produce a pure moment with no net force',
    extra: r`Its moment \(M = Fd\) is the same about every point, where \(d\) is the distance between the forces.`,
  },
  {
    front: 'Free-body diagram',
    back: 'A sketch of a body isolated from its surroundings, showing every external force and moment acting on it',
    extra: 'Supports are replaced by the reactions they exert.',
  },
  {
    front: 'Equations of static equilibrium in 2D',
    back: r`\(\sum F_x = 0,\ \sum F_y = 0,\ \sum M = 0\)`,
    extra: 'Three independent equations, so a planar rigid body can be solved for at most three unknown reactions.',
  },
  {
    front: 'Two-force member',
    back: 'A member loaded at only two points, with no applied moments; in equilibrium the two forces are equal, opposite and act along the line joining the points',
    extra: 'Ideal truss members are two-force members, in pure tension or compression.',
  },
  {
    front: 'Reactions at a pin, a roller and a fixed support (2D)',
    back: 'Pin: two force components. Roller: one force perpendicular to the surface. Fixed: two force components and a moment',
  },
  {
    front: 'Truss',
    back: 'A structure of straight, slender members joined at their ends and loaded at the joints, so each member carries only axial tension or compression',
    extra: 'Solved by the method of joints or the method of sections.',
  },
  {
    front: 'Centroid of an area',
    back: r`\(\bar{x} = \dfrac{\int x\,dA}{A}\), \(\bar{y} = \dfrac{\int y\,dA}{A}\)`,
    extra: 'Its geometric center. For a uniform plate it coincides with the center of gravity.',
  },
  // Stress, strain and materials
  {
    front: 'Normal stress',
    back: r`\(\sigma = \dfrac{F}{A}\)`,
    extra: r`\(A\) is the cross-sectional area perpendicular to the force. \(1\ \mathrm{MPa} = 1\ \mathrm{N/mm^2}\).`,
  },
  {
    front: 'Engineering strain',
    back: r`\(\varepsilon = \dfrac{\Delta L}{L_0}\)`,
    extra: r`Dimensionless, often given in percent or in microstrain (\(10^{-6}\)).`,
  },
  {
    front: 'Average shear stress',
    back: r`\(\tau = \dfrac{V}{A}\)`,
    extra: r`\(V\) is the shear force and \(A\) the area parallel to it, such as the cross-section of a bolt in single shear.`,
  },
  {
    front: 'Young’s modulus',
    back: r`\(E = \dfrac{\sigma}{\varepsilon}\) in the linear-elastic region`,
    extra: r`About \(200\ \mathrm{GPa}\) for steel and \(70\ \mathrm{GPa}\) for aluminium.`,
  },
  {
    front: 'Change in length of a bar under an axial load',
    back: r`\(\delta = \dfrac{FL}{AE}\)`,
    extra: 'For a uniform bar in the linear-elastic range.',
  },
  {
    front: 'Poisson’s ratio',
    back: r`\(\nu = -\dfrac{\varepsilon_{\text{lateral}}}{\varepsilon_{\text{axial}}}\)`,
    extra: 'About 0.3 for most metals; rubber is close to 0.5.',
  },
  {
    front: 'Shear modulus',
    back: r`\(G = \dfrac{\tau}{\gamma}\)`,
    extra: r`\(\gamma\) is the shear strain in radians. For an isotropic material \(G = \dfrac{E}{2(1 + \nu)}\), about \(80\ \mathrm{GPa}\) for steel.`,
  },
  {
    front: 'Elastic vs plastic deformation',
    back: 'Elastic deformation disappears when the load is removed; plastic deformation is permanent',
  },
  {
    front: 'Yield strength',
    back: 'The stress at which a material starts to deform plastically',
    extra: 'For metals without a sharp yield point it is found with the 0.2% offset method.',
  },
  {
    front: 'Ultimate tensile strength',
    back: 'The maximum engineering stress on the stress–strain curve',
    extra: 'After it, a ductile specimen necks and the engineering stress falls until fracture.',
  },
  {
    front: 'Ductile vs brittle materials',
    back: 'Ductile materials deform plastically a lot before they fracture (mild steel, copper); brittle ones fracture with little plastic deformation (glass, ceramics, gray cast iron)',
  },
  {
    front: 'Hardness',
    back: 'Resistance to localized plastic deformation, such as indentation or scratching',
    extra: 'Measured with the Brinell, Rockwell and Vickers indentation tests.',
  },
  {
    front: 'Toughness',
    back: 'The energy a material can absorb before it fractures',
    extra: 'The area under the stress–strain curve up to fracture; impact toughness is measured with the Charpy test.',
  },
  {
    front: 'Stiffness vs strength',
    back: 'Stiffness is resistance to elastic deformation; strength is the stress a material can carry before it yields or breaks',
    extra: 'All steels have about the same Young’s modulus, however strong they are.',
  },
  {
    front: 'Linear thermal expansion',
    back: r`\(\Delta L = \alpha L_0\,\Delta T\)`,
    extra: r`\(\alpha\) is about \(12 \times 10^{-6}\ \mathrm{K^{-1}}\) for steel and \(23 \times 10^{-6}\ \mathrm{K^{-1}}\) for aluminium.`,
  },
  {
    front: 'Steel vs cast iron',
    back: 'Steel is iron with up to about 2% carbon; cast iron has roughly 2 to 4%',
    extra: 'The extra carbon lowers the melting point and makes cast iron easy to cast, but gray cast iron is brittle.',
  },
  // Energy, power and machines
  {
    front: 'Efficiency',
    back: r`\(\eta = \dfrac{\text{useful output}}{\text{input}}\)`,
    extra: r`Of power or energy. Real machines always have \(\eta < 1\) because of friction and other losses.`,
  },
  {
    front: 'Power transmitted by a rotating shaft',
    back: r`\(P = T\omega\)`,
    extra: r`\(T\) is the torque and \(\omega\) the speed in rad/s; from \(n\) in rpm, \(\omega = \dfrac{2\pi n}{60}\).`,
  },
  {
    front: 'Kinetic energy stored in a flywheel',
    back: r`\(E = \tfrac{1}{2}I\omega^2\)`,
    extra: r`\(I\) is the mass moment of inertia about the axis of rotation and \(\omega\) the speed in rad/s.`,
  },
  {
    front: 'One mechanical horsepower in watts',
    back: r`About \(746\ \mathrm{W}\)`,
    extra: r`Defined as \(550\ \mathrm{ft\,lbf/s}\). Metric horsepower is about \(735.5\ \mathrm{W}\).`,
  },
  {
    front: 'Mechanical advantage',
    back: r`\(\mathrm{MA} = \dfrac{\text{load}}{\text{effort}}\)`,
    extra: 'A ratio of forces. A machine with an MA above 1 trades distance for force.',
  },
  {
    front: 'Velocity ratio of a machine',
    back: r`\(\mathrm{VR} = \dfrac{\text{distance moved by effort}}{\text{distance moved by load}}\)`,
    extra: r`Also called the ideal mechanical advantage. The efficiency is \(\eta = \dfrac{\mathrm{MA}}{\mathrm{VR}}\).`,
  },
  {
    front: 'Law of the lever',
    back: r`\(F_1 d_1 = F_2 d_2\)`,
    extra: r`The moments about the fulcrum balance; each \(d\) is a force’s perpendicular distance from the fulcrum.`,
  },
  {
    front: 'Three classes of lever',
    back: 'First class: fulcrum between effort and load (seesaw, scissors). Second class: load in the middle (wheelbarrow). Third class: effort in the middle (tweezers, the forearm)',
  },
  {
    front: 'Ideal mechanical advantage of a pulley system',
    back: 'The number of rope segments supporting the moving block',
    extra: 'Assuming frictionless pulleys and a weightless rope.',
  },
  {
    front: 'Gear ratio of a gear pair',
    back: r`\(\dfrac{N_{\text{driven}}}{N_{\text{driver}}} = \dfrac{\omega_{\text{driver}}}{\omega_{\text{driven}}}\)`,
    extra: r`\(N\) is the number of teeth. Output torque rises by the same ratio, less friction losses.`,
  },
  {
    front: 'Spur vs helical gears',
    back: 'Both commonly connect parallel shafts. Spur gears have straight teeth; helical gears have angled teeth that engage gradually, so they run more quietly but produce an axial thrust load',
  },
  {
    front: 'Worm gear',
    back: 'A screw-like worm driving a worm wheel on a perpendicular, non-intersecting shaft, giving a large speed reduction in one stage',
    extra: 'With a small lead angle the drive is self-locking: the wheel can’t turn the worm.',
  },
  {
    front: 'Lead vs pitch of a screw thread',
    back: 'Pitch is the distance between adjacent threads; lead is the distance the screw advances in one turn',
    extra: r`\(\text{lead} = \text{pitch} \times \text{number of starts}\), so they are equal for a single-start thread.`,
  },
  // Thermodynamics
  {
    front: 'Closed, open and isolated systems',
    back: 'Closed: energy crosses the boundary but mass doesn’t. Open (a control volume): both mass and energy cross. Isolated: neither crosses',
  },
  {
    front: 'Gauge vs absolute pressure',
    back: r`\(p_{\text{abs}} = p_{\text{gauge}} + p_{\text{atm}}\)`,
    extra: r`Standard atmospheric pressure is \(101.325\ \mathrm{kPa}\), about \(1\ \mathrm{bar}\).`,
  },
  {
    front: 'Ideal gas law with the specific gas constant',
    back: r`\(pV = mRT\)`,
    extra: r`For air \(R \approx 287\ \mathrm{J\,kg^{-1}\,K^{-1}}\). \(T\) must be an absolute temperature, in kelvin.`,
  },
  {
    front: 'Enthalpy',
    back: r`\(H = U + pV\)`,
    extra: 'Handy for flowing fluids, because it includes the flow work needed to push fluid across a boundary.',
  },
  {
    front: 'Three modes of heat transfer',
    back: 'Conduction (through a material, without bulk motion), convection (carried by a moving fluid) and radiation (electromagnetic waves, needing no medium)',
  },
  // Manufacturing
  {
    front: 'Casting',
    back: 'Pouring molten metal into a mold and letting it solidify in the mold’s shape',
    extra: 'Sand casting, die casting and investment casting are common types.',
  },
  {
    front: 'Forging',
    back: 'Shaping metal with compressive forces, by hammering or pressing, often while it is hot',
    extra: 'The grain flow follows the part’s shape, which makes forgings strong and tough.',
  },
  {
    front: 'Turning vs milling',
    back: 'Turning: the workpiece rotates against a stationary single-point tool on a lathe. Milling: a rotating multi-point cutter removes material as the workpiece is fed past it',
  },
  {
    front: 'Welding vs brazing vs soldering',
    back: 'Welding melts the base metals to fuse them. Brazing and soldering melt only a filler metal: above 450 °C for brazing, below it for soldering',
  },
  {
    front: 'Additive manufacturing',
    back: 'Building a part layer by layer from a digital model',
    extra: 'Also called 3D printing; common processes include material extrusion and laser powder bed fusion.',
  },
  {
    front: 'Annealing',
    back: 'Heating a metal and cooling it slowly to soften it, relieve internal stresses and restore ductility',
  },
  {
    front: 'Quenching and tempering',
    back: 'Quenching cools steel rapidly from a high temperature to harden it; tempering then reheats it to a lower temperature to reduce brittleness',
    extra: 'Quenching forms hard, brittle martensite; tempering trades some hardness for toughness.',
  },
  {
    front: 'Tolerance',
    back: 'The permitted variation in a dimension: the difference between its upper and lower limits',
    extra: 'Tighter tolerances cost more to make and to inspect.',
  },
]

export const MECHANICAL_ENGINEERING_BASICS: PublicDeck = {
  slug: 'mechanical-engineering-basics',
  title: 'Mechanical engineering basics: 50 core concepts',
  shortTitle: 'Mechanical engineering basics',
  category: 'engineering',
  level: 'beginner',
  icon: 'spark',
  description:
    'First-year mechanical engineering: statics, stress and strain, material properties, simple machines and gears, thermodynamics terms and manufacturing.',
  intro:
    'Every mechanical engineering course builds on the same vocabulary: forces and moments, stress and strain, how materials behave, how machines trade force for distance, and how parts are made. This deck covers those first-year ideas, with formulas typeset in LaTeX and a note on typical values where it helps.',
  faq: [
    {
      q: 'Who is this deck for?',
      a: 'First-year engineering students, apprentices and anyone starting out in mechanical design. It assumes high school physics and algebra.',
    },
    {
      q: 'Why do engineers quote stress in MPa?',
      a: 'One megapascal equals one newton per square millimetre, which fits the millimetre dimensions on most drawings. Common structural steels yield at a few hundred MPa.',
    },
    {
      q: 'What comes after this deck?',
      a: 'The intermediate deck covers strength of materials, thermodynamic cycles, fluid mechanics, heat transfer, machine design and vibrations. The advanced deck moves on to fracture, fatigue, FEA, CFD and control.',
    },
  ],
  cards: CARDS,
}
