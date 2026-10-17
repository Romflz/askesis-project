import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Mechanics
  {
    front: 'Newton’s first law',
    back: 'An object stays at rest or keeps moving at constant velocity unless a net external force acts on it',
    extra: 'Also called the law of inertia.',
  },
  {
    front: 'Newton’s second law',
    back: r`\(\vec{F}_{\text{net}} = m\vec{a}\)`,
    extra: r`Force is measured in newtons: \(1\ \mathrm{N} = 1\ \mathrm{kg\,m/s^2}\).`,
  },
  {
    front: 'Newton’s third law',
    back: 'When A exerts a force on B, B exerts an equal and opposite force on A',
    extra: 'The two forces act on different objects, so they don’t cancel.',
  },
  { front: 'Velocity under constant acceleration', back: r`\(v = v_0 + at\)` },
  { front: 'Displacement under constant acceleration', back: r`\(s = v_0 t + \tfrac{1}{2}at^2\)` },
  { front: 'Constant-acceleration equation without time', back: r`\(v^2 = v_0^2 + 2as\)` },
  { front: 'Gravitational acceleration at Earth’s surface', back: r`\(g \approx 9.81\ \mathrm{m/s^2}\)` },
  {
    front: 'Weight',
    back: r`\(W = mg\)`,
    extra: 'Mass is the same everywhere; weight depends on the local gravitational field.',
  },
  {
    front: 'Momentum',
    back: r`\(\vec{p} = m\vec{v}\)`,
    extra: 'The total momentum of a system is conserved when no external force acts on it.',
  },
  {
    front: 'Impulse',
    back: r`\(J = F\,\Delta t = \Delta p\)`,
    extra: 'Why airbags help: a longer stopping time means a smaller force for the same change in momentum.',
  },
  {
    front: 'Kinetic friction force',
    back: r`\(f_k = \mu_k N\)`,
    extra: r`\(N\) is the normal force. Static friction can rise up to \(\mu_s N\) before an object slips.`,
  },
  {
    front: 'Centripetal acceleration and force',
    back: r`\(a_c = \dfrac{v^2}{r}\), so \(F_c = \dfrac{mv^2}{r}\)`,
    extra: 'Both point toward the center of the circle.',
  },
  {
    front: 'Newton’s law of universal gravitation',
    back: r`\(F = G\dfrac{m_1 m_2}{r^2}\)`,
    extra: r`\(G \approx 6.674 \times 10^{-11}\ \mathrm{N\,m^2/kg^2}\)`,
  },
  { front: 'Torque', back: r`\(\tau = rF\sin\theta\)`, extra: r`\(\theta\) is the angle between the lever arm and the force.` },
  {
    front: 'Hooke’s law',
    back: r`\(F = -kx\)`,
    extra: r`\(k\) is the spring constant; the minus sign means the force opposes the displacement.`,
  },
  { front: 'Pressure', back: r`\(P = \dfrac{F}{A}\)`, extra: r`Measured in pascals: \(1\ \mathrm{Pa} = 1\ \mathrm{N/m^2}\).` },
  {
    front: 'Pressure at a depth in a fluid',
    back: r`\(P = P_0 + \rho g h\)`,
    extra: r`\(P_0\) is the pressure at the surface and \(\rho\) the fluid’s density.`,
  },
  {
    front: 'Archimedes’ principle',
    back: r`The buoyant force equals the weight of the fluid displaced: \(F_b = \rho_{\text{fluid}} V g\)`,
  },
  // Energy
  { front: 'Kinetic energy', back: r`\(E_k = \tfrac{1}{2}mv^2\)` },
  { front: 'Gravitational potential energy near Earth’s surface', back: r`\(E_p = mgh\)` },
  { front: 'Elastic potential energy of a spring', back: r`\(E = \tfrac{1}{2}kx^2\)` },
  {
    front: 'Work done by a constant force',
    back: r`\(W = Fd\cos\theta\)`,
    extra: r`Measured in joules: \(1\ \mathrm{J} = 1\ \mathrm{N\,m}\).`,
  },
  {
    front: 'Work–energy theorem',
    back: r`The net work done on an object equals its change in kinetic energy: \(W_{\text{net}} = \Delta E_k\)`,
  },
  {
    front: 'Power',
    back: r`\(P = \dfrac{W}{t}\)`,
    extra: r`Measured in watts: \(1\ \mathrm{W} = 1\ \mathrm{J/s}\). For a constant force, also \(P = Fv\).`,
  },
  {
    front: 'Conservation of energy',
    back: 'Energy is never created or destroyed, only converted from one form to another; the total energy of an isolated system is constant',
  },
  {
    front: 'Elastic vs inelastic collisions',
    back: 'Both conserve momentum; only elastic collisions also conserve kinetic energy',
    extra: 'In a perfectly inelastic collision the objects stick together.',
  },
  { front: 'Mass–energy equivalence', back: r`\(E = mc^2\)` },
  {
    front: 'First law of thermodynamics',
    back: r`\(\Delta U = Q - W\)`,
    extra: r`\(Q\) is the heat added to the system and \(W\) the work done by it. Some textbooks write \(\Delta U = Q + W\), with \(W\) the work done on the system.`,
  },
  {
    front: 'Heat needed to change an object’s temperature',
    back: r`\(Q = mc\,\Delta T\)`,
    extra: r`\(c\) is the specific heat capacity; for water it is about \(4.18\ \mathrm{kJ\,kg^{-1}\,K^{-1}}\).`,
  },
  // Electricity and magnetism
  { front: 'Ohm’s law', back: r`\(V = IR\)` },
  { front: 'Electric power', back: r`\(P = IV = I^2R = \dfrac{V^2}{R}\)` },
  {
    front: 'Resistors in series',
    back: r`\(R_{\text{total}} = R_1 + R_2 + \cdots\)`,
    extra: 'The same current flows through each resistor.',
  },
  {
    front: 'Resistors in parallel',
    back: r`\(\dfrac{1}{R_{\text{total}}} = \dfrac{1}{R_1} + \dfrac{1}{R_2} + \cdots\)`,
    extra: 'Each has the same voltage across it, and the total is less than the smallest resistance.',
  },
  {
    front: 'Coulomb’s law',
    back: r`\(F = k\dfrac{q_1 q_2}{r^2}\)`,
    extra: r`\(k = \dfrac{1}{4\pi\varepsilon_0} \approx 8.99 \times 10^9\ \mathrm{N\,m^2/C^2}\)`,
  },
  {
    front: 'Electric current',
    back: r`\(I = \dfrac{Q}{t}\)`,
    extra: r`Measured in amperes: \(1\ \mathrm{A} = 1\ \mathrm{C/s}\).`,
  },
  {
    front: 'Elementary charge',
    back: r`\(e \approx 1.602 \times 10^{-19}\ \mathrm{C}\)`,
    extra: r`The charge of a proton; an electron carries \(-e\).`,
  },
  {
    front: 'Capacitance',
    back: r`\(C = \dfrac{Q}{V}\)`,
    extra: r`Measured in farads. A capacitor stores energy \(E = \tfrac{1}{2}CV^2\).`,
  },
  {
    front: 'Kirchhoff’s circuit laws',
    back: 'Current law: the current into a junction equals the current out (charge is conserved). Voltage law: the voltages around any closed loop sum to zero (energy is conserved)',
  },
  {
    front: 'Resistance of a wire',
    back: r`\(R = \rho\dfrac{L}{A}\)`,
    extra: r`\(\rho\) is the material’s resistivity, \(L\) the length and \(A\) the cross-sectional area.`,
  },
  {
    front: 'Faraday’s law of induction',
    back: r`\(\mathcal{E} = -\dfrac{d\Phi_B}{dt}\)`,
    extra:
      'A changing magnetic flux induces an EMF. The minus sign is Lenz’s law: the induced current opposes the change that caused it.',
  },
  {
    front: 'Magnetic force on a moving charge',
    back: r`\(\vec{F} = q\vec{v} \times \vec{B}\)`,
    extra: r`Its magnitude is \(qvB\sin\theta\). It is perpendicular to the velocity, so it does no work.`,
  },
  // Waves and light
  {
    front: 'Wave speed, frequency and wavelength',
    back: r`\(v = f\lambda\)`,
    extra: r`Period and frequency are reciprocals: \(T = \dfrac{1}{f}\).`,
  },
  {
    front: 'Transverse vs longitudinal waves',
    back: 'Transverse: the medium oscillates perpendicular to the direction of travel (waves on a string, light). Longitudinal: it oscillates along it (sound)',
  },
  {
    front: 'Speed of light in a vacuum',
    back: r`\(c = 299\,792\,458\ \mathrm{m/s} \approx 3.00 \times 10^8\ \mathrm{m/s}\)`,
    extra: 'Exact by definition: the metre is defined from it.',
  },
  { front: 'Speed of sound in air at 20 °C', back: r`About \(343\ \mathrm{m/s}\)` },
  {
    front: 'Energy of a photon',
    back: r`\(E = hf = \dfrac{hc}{\lambda}\)`,
    extra: r`Planck constant \(h \approx 6.626 \times 10^{-34}\ \mathrm{J\,s}\)`,
  },
  {
    front: 'Snell’s law',
    back: r`\(n_1 \sin\theta_1 = n_2 \sin\theta_2\)`,
    extra: 'Angles are measured from the normal to the surface.',
  },
  {
    front: 'Doppler effect',
    back: 'The observed frequency rises when source and observer move toward each other and falls when they move apart',
    extra: 'It is why a passing siren drops in pitch.',
  },
  {
    front: 'Period of a simple pendulum',
    back: r`\(T = 2\pi\sqrt{\dfrac{L}{g}}\)`,
    extra: 'Valid for small swings; it doesn’t depend on the mass.',
  },
  { front: 'Period of a mass on a spring', back: r`\(T = 2\pi\sqrt{\dfrac{m}{k}}\)` },
]

export const PHYSICS: PublicDeck = {
  slug: 'physics-essentials',
  title: 'Physics essentials: 50 laws and formulas',
  shortTitle: 'Physics essentials',
  category: 'physics',
  level: 'beginner',
  icon: 'spark',
  description:
    'The core laws and equations of introductory physics: Newton’s laws and kinematics, work, energy and momentum, circuits and electromagnetism, waves and light.',
  intro:
    'Introductory physics comes down to a few dozen relationships you need on demand. This deck covers mechanics, energy, a little thermodynamics, electricity and magnetism, and waves, with every formula typeset in LaTeX and a note on what the symbols mean.',
  faq: [
    {
      q: 'Is this deck for high school or university physics?',
      a: 'Both. It covers algebra-based introductory physics, as in AP Physics 1 and 2 or a first university course, plus a few calculus-based results such as Faraday’s law.',
    },
    {
      q: 'Why do some symbols differ from my textbook?',
      a: 'Notation varies: kinetic energy is written KE, K or E_k, and the first law of thermodynamics has two sign conventions. The cards note the common alternatives where it matters.',
    },
    {
      q: 'Should I memorize formulas or derive them?',
      a: 'Both. Knowing the core equations by heart frees your attention for the physics of a problem; knowing where they come from tells you when they apply.',
    },
  ],
  cards: CARDS,
}
