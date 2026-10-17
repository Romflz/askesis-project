import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Strength of materials
  {
    front: 'Bending stress in a beam (flexure formula)',
    back: r`\(\sigma = \dfrac{My}{I}\)`,
    extra: r`\(y\) is the distance from the neutral axis and \(I\) the second moment of area; the stress is largest at the outer fibers.`,
  },
  {
    front: 'Second moment of area of a rectangle about its centroidal axis',
    back: r`\(I = \dfrac{bh^3}{12}\)`,
    extra: r`\(h\) is the depth in the direction of bending, so doubling the depth makes a beam eight times stiffer.`,
  },
  {
    front: 'Second moment of area of a solid circular section',
    back: r`\(I = \dfrac{\pi d^4}{64}\)`,
    extra: r`The polar second moment, used in torsion, is twice this: \(J = \dfrac{\pi d^4}{32}\).`,
  },
  {
    front: 'Parallel axis theorem for areas',
    back: r`\(I = I_c + Ad^2\)`,
    extra: r`\(I_c\) is about the parallel axis through the centroid and \(d\) is the distance between the two axes.`,
  },
  {
    front: 'Shear stress in a circular shaft under torsion',
    back: r`\(\tau = \dfrac{Tr}{J}\)`,
    extra: 'Zero at the center and largest at the outer surface.',
  },
  {
    front: 'Angle of twist of a circular shaft',
    back: r`\(\phi = \dfrac{TL}{GJ}\)`,
    extra: r`In radians; \(GJ\) is the torsional rigidity.`,
  },
  {
    front: 'Relationship between shear force and bending moment',
    back: r`\(\dfrac{dM}{dx} = V\)`,
    extra:
      'The change in moment between two sections equals the area under the shear force diagram, so the moment reaches a maximum or minimum where the shear force crosses zero.',
  },
  {
    front: 'Maximum bending moment in a simply supported beam with a uniform load',
    back: r`\(M_{\max} = \dfrac{wL^2}{8}\)`,
    extra: r`At midspan; \(w\) is the load per unit length. For a central point load \(P\) it is \(\dfrac{PL}{4}\).`,
  },
  {
    front: 'Tip deflection of a cantilever with an end load',
    back: r`\(\delta = \dfrac{PL^3}{3EI}\)`,
    extra: r`For a simply supported beam with a uniform load, the midspan deflection is \(\dfrac{5wL^4}{384EI}\).`,
  },
  {
    front: 'Euler critical buckling load',
    back: r`\(P_{cr} = \dfrac{\pi^2 EI}{(KL)^2}\)`,
    extra: r`\(K\) is the effective length factor: 1 pinned–pinned, 0.5 fixed–fixed, 0.7 fixed–pinned, 2 fixed–free. Use the smallest \(I\).`,
  },
  {
    front: 'Mohr’s circle for plane stress: center and radius',
    back: r`Center \(\sigma_{\text{avg}} = \dfrac{\sigma_x + \sigma_y}{2}\), radius \(R = \sqrt{\left(\dfrac{\sigma_x - \sigma_y}{2}\right)^2 + \tau_{xy}^2}\)`,
    extra: r`The principal stresses are \(\sigma_{\text{avg}} \pm R\), and \(R\) is the maximum in-plane shear stress.`,
  },
  {
    front: 'Hoop stress in a thin-walled cylinder',
    back: r`\(\sigma_h = \dfrac{pr}{t}\)`,
    extra: r`The axial stress is half as much, \(\dfrac{pr}{2t}\). Valid for thin walls, roughly \(r/t \ge 10\).`,
  },
  // Dynamics
  {
    front: 'Rotational equation of motion of a rigid body',
    back: r`\(\sum M = I\alpha\)`,
    extra: 'Taken about the center of mass or a fixed axis of rotation.',
  },
  {
    front: 'Mass moment of inertia of a solid cylinder about its axis',
    back: r`\(I = \tfrac{1}{2}mr^2\)`,
    extra: r`A thin ring has \(mr^2\); a slender rod about its center has \(\tfrac{1}{12}mL^2\).`,
  },
  {
    front: 'Instantaneous center of zero velocity',
    back: 'The point that has zero velocity at a given instant, so a body in plane motion is momentarily rotating about it',
    extra: 'For a wheel rolling without slipping, it is the contact point with the ground.',
  },
  // Thermodynamics
  {
    front: 'Kelvin–Planck statement of the second law',
    back: 'No device operating in a cycle can take heat from a single reservoir and turn all of it into work',
    extra: 'So every heat engine must reject some heat to a colder reservoir.',
  },
  {
    front: 'Entropy change in a reversible process',
    back: r`\(dS = \dfrac{\delta Q_{\text{rev}}}{T}\)`,
    extra: 'The entropy of an isolated system never decreases.',
  },
  {
    front: 'Carnot efficiency',
    back: r`\(\eta = 1 - \dfrac{T_C}{T_H}\)`,
    extra: 'The highest efficiency any heat engine can reach between two reservoirs; temperatures are absolute, in kelvin.',
  },
  {
    front: 'The four processes of the ideal Rankine cycle',
    back: 'Isentropic pumping of liquid, heat addition at constant pressure in the boiler, isentropic expansion in the turbine, and heat rejection at constant pressure in the condenser',
    extra: 'The basic cycle of steam power plants.',
  },
  {
    front: 'Otto cycle efficiency',
    back: r`\(\eta = 1 - \dfrac{1}{r^{\gamma - 1}}\)`,
    extra: r`\(r\) is the compression ratio and \(\gamma = c_p/c_v\), about 1.4 for air. It models spark-ignition engines.`,
  },
  {
    front: 'Otto vs Diesel cycle',
    back: 'The Otto cycle adds heat at constant volume; the Diesel cycle adds it at constant pressure',
    extra:
      'At the same compression ratio the Otto cycle is more efficient, but diesel engines run at much higher compression ratios.',
  },
  {
    front: 'Ideal Brayton cycle efficiency',
    back: r`\(\eta = 1 - \dfrac{1}{r_p^{(\gamma - 1)/\gamma}}\)`,
    extra: r`\(r_p\) is the compressor pressure ratio. It models gas turbines: isentropic compression and expansion, with heat added and rejected at constant pressure.`,
  },
  {
    front: 'Isentropic temperature–pressure relation for an ideal gas',
    back: r`\(\dfrac{T_2}{T_1} = \left(\dfrac{p_2}{p_1}\right)^{(\gamma - 1)/\gamma}\)`,
    extra: r`With constant specific heats; equivalently \(pv^{\gamma} = \text{constant}\).`,
  },
  {
    front: 'Coefficient of performance of a refrigerator',
    back: r`\(\mathrm{COP}_R = \dfrac{Q_L}{W_{\text{in}}}\)`,
    extra: r`For a heat pump \(\mathrm{COP}_{HP} = \dfrac{Q_H}{W_{\text{in}}} = \mathrm{COP}_R + 1\). Both can exceed 1.`,
  },
  {
    front: 'Steady-flow energy equation',
    back: r`\(\dot{Q} - \dot{W} = \dot{m}\left[h_2 - h_1 + \dfrac{V_2^2 - V_1^2}{2} + g(z_2 - z_1)\right]\)`,
    extra: r`For one inlet and one outlet; \(\dot{Q}\) is the heat added to the fluid and \(\dot{W}\) the work it does, such as turbine shaft work.`,
  },
  {
    front: 'Quality (dryness fraction) of a saturated liquid–vapor mixture',
    back: r`\(x = \dfrac{m_{\text{vapor}}}{m_{\text{total}}}\)`,
    extra: r`Mixture properties follow from it, e.g. \(h = h_f + x\,h_{fg}\).`,
  },
  // Fluid mechanics
  {
    front: 'Continuity equation for incompressible flow in a pipe',
    back: r`\(A_1 V_1 = A_2 V_2\)`,
    extra: r`It comes from conservation of mass, with mass flow rate \(\dot{m} = \rho A V\).`,
  },
  {
    front: 'Bernoulli’s equation',
    back: r`\(p + \tfrac{1}{2}\rho V^2 + \rho g z = \text{constant}\)`,
    extra: 'Along a streamline, in steady, incompressible flow with no friction.',
  },
  {
    front: 'Reynolds number',
    back: r`\(\mathrm{Re} = \dfrac{\rho V D}{\mu} = \dfrac{VD}{\nu}\)`,
    extra:
      'The ratio of inertial to viscous forces. Pipe flow is laminar below about 2300 and usually turbulent above about 4000.',
  },
  {
    front: 'Darcy–Weisbach head loss',
    back: r`\(h_f = f\,\dfrac{L}{D}\,\dfrac{V^2}{2g}\)`,
    extra: r`\(f\) is the Darcy friction factor; for turbulent flow it comes from the Moody chart or the Colebrook equation.`,
  },
  {
    front: 'Darcy friction factor for laminar pipe flow',
    back: r`\(f = \dfrac{64}{\mathrm{Re}}\)`,
    extra: 'It doesn’t depend on the wall roughness.',
  },
  {
    front: 'Kinematic viscosity',
    back: r`\(\nu = \dfrac{\mu}{\rho}\)`,
    extra: r`Water at 20 °C has \(\mu \approx 1.0 \times 10^{-3}\ \mathrm{Pa\,s}\) and \(\nu \approx 1.0 \times 10^{-6}\ \mathrm{m^2/s}\).`,
  },
  {
    front: 'Drag force',
    back: r`\(F_D = \tfrac{1}{2} C_D \rho V^2 A\)`,
    extra: r`\(C_D\) is the drag coefficient and \(A\) a reference area, usually the frontal area.`,
  },
  // Heat transfer
  {
    front: 'Fourier’s law of heat conduction',
    back: r`\(\dot{Q} = -kA\,\dfrac{dT}{dx}\)`,
    extra: r`\(k\) is the thermal conductivity in \(\mathrm{W\,m^{-1}\,K^{-1}}\): about 400 for copper, 50 for carbon steel and 0.026 for air.`,
  },
  {
    front: 'Conduction thermal resistance of a plane wall',
    back: r`\(R = \dfrac{L}{kA}\)`,
    extra: r`Resistances in series add, so \(\dot{Q} = \dfrac{\Delta T}{\sum R}\), like current through resistors.`,
  },
  {
    front: 'Newton’s law of cooling',
    back: r`\(\dot{Q} = hA\,(T_s - T_\infty)\)`,
    extra: r`\(h\) is the convection heat transfer coefficient, in \(\mathrm{W\,m^{-2}\,K^{-1}}\).`,
  },
  {
    front: 'Radiation emitted by a surface (Stefan–Boltzmann law)',
    back: r`\(\dot{Q} = \varepsilon\sigma A T^4\)`,
    extra: r`\(\sigma \approx 5.67 \times 10^{-8}\ \mathrm{W\,m^{-2}\,K^{-4}}\), \(T\) is absolute and the emissivity \(\varepsilon\) is between 0 and 1.`,
  },
  {
    front: 'Nusselt number',
    back: r`\(\mathrm{Nu} = \dfrac{hL}{k}\)`,
    extra: r`\(k\) is the fluid’s conductivity. It compares convection with pure conduction across the fluid layer.`,
  },
  {
    front: 'Biot number',
    back: r`\(\mathrm{Bi} = \dfrac{hL_c}{k}\)`,
    extra: r`\(k\) is the solid’s conductivity and \(L_c = V/A_s\). If \(\mathrm{Bi} < 0.1\), the lumped capacitance method applies: the body’s temperature is nearly uniform.`,
  },
  // Machine design
  {
    front: 'Factor of safety',
    back: r`\(n = \dfrac{\text{strength}}{\text{stress}}\)`,
    extra: 'Equivalently, failure load over working load. It covers uncertainty in loads, materials and analysis.',
  },
  {
    front: 'Endurance limit',
    back: r`The stress amplitude below which a steel survives an essentially unlimited number of cycles; roughly \(0.5\,S_{ut}\)`,
    extra: r`Shigley’s estimate for a polished rotating-beam specimen with \(S_{ut} \le 1400\ \mathrm{MPa}\). Real parts need correction factors.`,
  },
  {
    front: 'Von Mises stress in plane stress',
    back: r`\(\sigma' = \sqrt{\sigma_1^2 - \sigma_1\sigma_2 + \sigma_2^2}\)`,
    extra: r`Distortion-energy theory: a ductile part yields when \(\sigma' \ge S_y\). Tresca’s maximum-shear-stress theory is slightly more conservative.`,
  },
  {
    front: 'Stress concentration factor',
    back: r`\(K_t = \dfrac{\sigma_{\max}}{\sigma_{\text{nom}}}\)`,
    extra: r`Caused by holes, notches and sharp fillets. A small circular hole in a wide plate under tension gives \(K_t = 3\).`,
  },
  {
    front: 'Clearance, transition and interference fits',
    back: 'Clearance: the shaft is always smaller than the hole. Interference: always larger. Transition: either, depending on the actual sizes',
    extra: 'In ISO notation, H7/g6 is a clearance fit, H7/k6 a transition fit and H7/p6 an interference fit.',
  },
  {
    front: 'Rated life of a rolling-element bearing',
    back: r`\(L_{10} = \left(\dfrac{C}{P}\right)^{a}\) million revolutions`,
    extra: r`\(C\) is the dynamic load rating, \(P\) the equivalent load, and \(a = 3\) for ball bearings or \(10/3\) for roller bearings. 90% of bearings reach \(L_{10}\).`,
  },
  // Vibrations
  {
    front: 'Natural frequency of an undamped spring–mass system',
    back: r`\(\omega_n = \sqrt{\dfrac{k}{m}}\)`,
    extra: r`In rad/s; in hertz, \(f_n = \dfrac{\omega_n}{2\pi}\).`,
  },
  {
    front: 'Natural frequency from static deflection',
    back: r`\(\omega_n = \sqrt{\dfrac{g}{\delta_{st}}}\)`,
    extra: r`Because \(k\delta_{st} = mg\). A static deflection of \(1\ \mathrm{mm}\) gives about \(15.8\ \mathrm{Hz}\).`,
  },
  {
    front: 'Damping ratio',
    back: r`\(\zeta = \dfrac{c}{c_c} = \dfrac{c}{2\sqrt{km}}\)`,
    extra: r`Underdamped if \(\zeta < 1\) (it oscillates), critically damped at \(\zeta = 1\), overdamped if \(\zeta > 1\).`,
  },
  {
    front: 'Damped natural frequency',
    back: r`\(\omega_d = \omega_n\sqrt{1 - \zeta^2}\)`,
    extra: r`Only defined for underdamped systems, \(\zeta < 1\).`,
  },
  {
    front: 'Resonance',
    back: 'Large-amplitude vibration when a forcing frequency is close to a natural frequency',
    extra: 'At resonance the amplitude is limited only by damping.',
  },
]

export const MECHANICAL_ENGINEERING_INTERMEDIATE: PublicDeck = {
  slug: 'mechanical-engineering-intermediate',
  title: 'Intermediate mechanical engineering: 50 formulas and principles',
  shortTitle: 'Intermediate mechanical engineering',
  category: 'engineering',
  level: 'intermediate',
  icon: 'spark',
  description:
    'Core undergraduate mechanical engineering: bending and torsion, thermodynamic cycles, fluid flow, heat transfer, machine design and vibrations.',
  intro:
    'The middle years of a mechanical engineering degree are full of formulas you need to recall quickly: flexure and torsion, Euler buckling, Carnot and Otto efficiencies, Bernoulli and Reynolds, Fourier’s law, bearing life and natural frequency. Each card asks for one of them, with a note on what the symbols mean and when it applies.',
  faq: [
    {
      q: 'What should I know before this deck?',
      a: 'Statics, stress and strain, basic material properties and thermodynamics vocabulary, as in the Mechanical engineering basics deck, plus first-year calculus.',
    },
    {
      q: 'Does this deck help with the FE Mechanical exam?',
      a: 'It covers many of the core topics in mechanics of materials, thermodynamics, fluids, heat transfer, machine design and vibrations, but the exam is broader. Use it alongside the official reference handbook and practice problems.',
    },
    {
      q: 'Why do sign conventions differ from my textbook?',
      a: 'Beam shear and moment, the first law of thermodynamics and stress transformation all have more than one convention in use. The cards give magnitudes or say which convention they use; pick one and apply it consistently.',
    },
  ],
  cards: CARDS,
}
