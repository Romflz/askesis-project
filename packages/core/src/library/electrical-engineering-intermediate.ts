import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Network theorems and analysis
  {
    front: 'Thevenin’s theorem',
    back: r`Any linear two-terminal network can be replaced by a voltage source \(V_{\text{Th}}\) in series with a resistance \(R_{\text{Th}}\)`,
    extra: r`\(V_{\text{Th}}\) is the open-circuit voltage across the terminals.`,
  },
  {
    front: 'Norton’s theorem',
    back: r`Any linear two-terminal network can be replaced by a current source \(I_N\) in parallel with a resistance \(R_N\)`,
    extra: r`\(I_N\) is the short-circuit current. \(R_N = R_{\text{Th}}\) and \(I_N = V_{\text{Th}}/R_{\text{Th}}\).`,
  },
  {
    front: 'Finding the Thevenin resistance',
    back: 'Turn off every independent source (short voltage sources, open current sources) and find the resistance seen from the terminals',
    extra: r`With dependent sources, use \(R_{\text{Th}} = V_{\text{oc}}/I_{\text{sc}}\) or apply a test source.`,
  },
  {
    front: 'Maximum power transfer theorem',
    back: r`A load receives the most power when \(R_L = R_{\text{Th}}\), and then \(P_{\max} = \dfrac{V_{\text{Th}}^2}{4R_{\text{Th}}}\)`,
    extra: 'Efficiency at that point is only 50%: the source resistance dissipates as much power as the load.',
  },
  {
    front: 'Superposition principle',
    back: 'In a linear circuit, any voltage or current is the sum of the contributions from each independent source acting alone, with the others turned off',
    extra: 'It doesn’t apply to power, which depends on the square of current or voltage.',
  },
  {
    front: 'Nodal analysis',
    back: 'Pick a reference node, write KCL at every other node with the node voltages as unknowns, and solve the equations',
    extra: 'A voltage source between two non-reference nodes makes them a supernode.',
  },
  {
    front: 'Mesh analysis',
    back: 'Assign a current to each mesh (a loop with no other loop inside it), write KVL around each one, and solve for the mesh currents',
    extra: 'It works for planar circuits. A current source shared by two meshes makes them a supermesh.',
  },
  // Transients
  {
    front: 'Time constant of an RC circuit',
    back: r`\(\tau = RC\)`,
    extra: r`With \(R\) in ohms and \(C\) in farads, \(\tau\) is in seconds: \(10\ \mathrm{k\Omega}\) and \(100\ \mathrm{\mu F}\) give \(1\ \mathrm{s}\).`,
  },
  { front: 'Time constant of an RL circuit', back: r`\(\tau = \dfrac{L}{R}\)` },
  {
    front: 'Step response of a first-order circuit',
    back: r`\(x(t) = x(\infty) + \big[x(0^+) - x(\infty)\big]\,e^{-t/\tau}\)`,
    extra: r`\(\tau\) is \(RC\) or \(L/R\), using the Thevenin resistance seen by the capacitor or inductor.`,
  },
  {
    front: 'How far a first-order response gets after one and five time constants',
    back: r`About 63% of the way to its final value after \(\tau\), and over 99% after \(5\tau\)`,
    extra: r`\(1 - e^{-1} \approx 0.632\) and \(1 - e^{-5} \approx 0.993\)`,
  },
  {
    front: 'Quantities that can’t change instantly',
    back: 'The voltage across a capacitor and the current through an inductor',
    extra: r`A jump would need infinite current (\(i = C\,dv/dt\)) or infinite voltage (\(v = L\,di/dt\)).`,
  },
  {
    front: 'Damping cases of a series RLC circuit',
    back: r`Overdamped if \(\alpha > \omega_0\), critically damped if \(\alpha = \omega_0\), underdamped (oscillating) if \(\alpha < \omega_0\)`,
    extra: r`For a series RLC, \(\alpha = \dfrac{R}{2L}\) and \(\omega_0 = \dfrac{1}{\sqrt{LC}}\).`,
  },
  // Phasors and impedance
  {
    front: 'Phasor',
    back: r`A complex number giving the amplitude and phase of a sinusoid at a known frequency: \(V_m\cos(\omega t + \phi) \to V_m\angle\phi\)`,
    extra: 'Phasors turn the differential equations of AC circuits into algebra with complex numbers.',
  },
  {
    front: 'Impedance of a resistor, an inductor and a capacitor',
    back: r`\(Z_R = R\), \(Z_L = j\omega L\), \(Z_C = \dfrac{1}{j\omega C}\)`,
    extra: r`\(\omega = 2\pi f\) is the angular frequency and \(j = \sqrt{-1}\). The magnitudes \(\omega L\) and \(1/(\omega C)\) are the reactances.`,
  },
  {
    front: 'Phase of the current in an inductor and a capacitor',
    back: 'In an inductor the current lags the voltage by 90°; in a capacitor it leads by 90°',
    extra: 'Mnemonic: ELI the ICE man (voltage E before current I in an inductor L; I before E in a capacitor C).',
  },
  // Resonance
  {
    front: 'Resonant frequency of an LC or RLC circuit',
    back: r`\(f_0 = \dfrac{1}{2\pi\sqrt{LC}}\)`,
    extra: r`At \(f_0\) the inductive and capacitive reactances are equal and cancel.`,
  },
  {
    front: 'Series vs parallel RLC at resonance',
    back: 'Series: the impedance is at its minimum (just R) and the current peaks. Parallel: the impedance is at its maximum and the current drawn is smallest',
  },
  {
    front: 'Quality factor of a series RLC circuit',
    back: r`\(Q = \dfrac{\omega_0 L}{R} = \dfrac{1}{R}\sqrt{\dfrac{L}{C}}\)`,
    extra: r`The bandwidth is \(f_0/Q\), so a higher \(Q\) means a sharper, narrower peak.`,
  },
  // AC power
  {
    front: 'Real (average) power in an AC circuit',
    back: r`\(P = V_{\text{rms}} I_{\text{rms}} \cos\theta\), in watts`,
    extra: r`\(\theta\) is the phase angle between voltage and current. Only resistance consumes real power.`,
  },
  {
    front: 'Reactive power',
    back: r`\(Q = V_{\text{rms}} I_{\text{rms}} \sin\theta\), in volt-amperes reactive (var)`,
    extra: 'It flows back and forth between the source and the inductors and capacitors, doing no net work.',
  },
  {
    front: 'Apparent power and the power triangle',
    back: r`\(S = V_{\text{rms}} I_{\text{rms}}\), in volt-amperes (VA), with \(S^2 = P^2 + Q^2\)`,
    extra: r`As complex power, \(\mathbf{S} = \mathbf{V}\mathbf{I}^* = P + jQ\) using RMS phasors.`,
  },
  {
    front: 'Power factor',
    back: r`\(\mathrm{PF} = \dfrac{P}{S} = \cos\theta\)`,
    extra: 'It is lagging for inductive loads such as motors (current lags voltage) and leading for capacitive loads.',
  },
  {
    front: 'Power factor correction',
    back: 'Adding capacitors in parallel with an inductive load so they supply its reactive power locally',
    extra: 'The real power is unchanged, but the line current and its losses fall.',
  },
  // Three-phase
  {
    front: 'Line and phase voltage in a balanced wye (star) connection',
    back: r`\(V_L = \sqrt{3}\,V_{\phi}\), and the line current equals the phase current`,
    extra: r`The three phases are \(120^\circ\) apart; a \(230\ \mathrm{V}\) phase voltage gives about \(400\ \mathrm{V}\) between lines.`,
  },
  {
    front: 'Line and phase current in a balanced delta connection',
    back: r`\(I_L = \sqrt{3}\,I_{\phi}\), and the line voltage equals the phase voltage`,
  },
  {
    front: 'Total power in a balanced three-phase load',
    back: r`\(P = \sqrt{3}\,V_L I_L \cos\theta\)`,
    extra: r`\(V_L\) and \(I_L\) are line values and \(\theta\) is the phase angle of each phase’s load. It equals \(3V_{\phi}I_{\phi}\cos\theta\).`,
  },
  // Transformers
  {
    front: 'Ideal transformer: voltage and current ratios',
    back: r`\(\dfrac{V_1}{V_2} = \dfrac{N_1}{N_2}\) and \(\dfrac{I_1}{I_2} = \dfrac{N_2}{N_1}\)`,
    extra: 'Power in equals power out, so stepping the voltage up steps the current down.',
  },
  {
    front: 'Impedance seen through an ideal transformer',
    back: r`\(Z_{\text{in}} = \left(\dfrac{N_1}{N_2}\right)^2 Z_L\)`,
    extra: 'This is how a transformer matches a load to a source, as an audio output transformer does for a loudspeaker.',
  },
  {
    front: 'Why power is transmitted at high voltage',
    back: r`For the same power, a higher voltage needs less current, and line losses scale with \(I^2R\)`,
    extra: 'Transformers make stepping the voltage up and down efficient, one reason the grid uses AC.',
  },
  // Op-amps
  {
    front: 'Ideal op-amp rules with negative feedback',
    back: 'No current flows into either input, and the output adjusts so the two input voltages are equal (a virtual short)',
  },
  {
    front: 'Gain of an inverting amplifier',
    back: r`\(\dfrac{V_{\text{out}}}{V_{\text{in}}} = -\dfrac{R_f}{R_{\text{in}}}\)`,
    extra: r`The inverting input sits at virtual ground, so the input impedance is \(R_{\text{in}}\).`,
  },
  {
    front: 'Gain of a non-inverting amplifier',
    back: r`\(\dfrac{V_{\text{out}}}{V_{\text{in}}} = 1 + \dfrac{R_f}{R_g}\)`,
    extra: r`\(R_f\) runs from the output to the inverting input and \(R_g\) from the inverting input to ground.`,
  },
  {
    front: 'Voltage follower (unity-gain buffer)',
    back: 'An op-amp with its output tied to the inverting input and the signal on the non-inverting input; its gain is 1',
    extra: 'Its very high input impedance and low output impedance let a weak source drive a heavy load.',
  },
  // Transistors
  {
    front: 'BJT currents in the active region',
    back: r`\(I_C = \beta I_B\) and \(I_E = I_B + I_C\)`,
    extra: r`\(\beta\) (also written \(h_{FE}\)) is the current gain, often around 100.`,
  },
  {
    front: 'BJT regions of operation',
    back: 'Cut-off: both junctions reverse-biased. Active: base–emitter forward, base–collector reverse. Saturation: both forward-biased',
    extra: 'Amplifiers use the active region; switches toggle between cut-off and saturation.',
  },
  {
    front: 'n-channel MOSFET regions of operation',
    back: r`Cut-off: \(V_{GS} < V_{th}\). Triode: \(V_{GS} > V_{th}\) and \(V_{DS} < V_{GS} - V_{th}\). Saturation: \(V_{GS} > V_{th}\) and \(V_{DS} \ge V_{GS} - V_{th}\)`,
    extra: 'Beware the name clash: MOSFET amplifiers work in saturation, unlike BJT amplifiers.',
  },
  {
    front: 'MOSFET drain current in saturation',
    back: r`\(I_D = \tfrac{1}{2}\mu_n C_{ox}\dfrac{W}{L}(V_{GS} - V_{th})^2\)`,
    extra: r`The square law, ignoring channel-length modulation. \(W/L\) is the channel’s width-to-length ratio.`,
  },
  // Digital logic
  {
    front: 'Universal logic gates',
    back: 'NAND and NOR: either one alone can build any Boolean function',
  },
  {
    front: 'De Morgan’s laws',
    back: r`\(\overline{A \cdot B} = \overline{A} + \overline{B}\) and \(\overline{A + B} = \overline{A} \cdot \overline{B}\)`,
  },
  {
    front: 'XOR gate',
    back: r`Outputs 1 when its inputs differ: \(A \oplus B = A\overline{B} + \overline{A}B\)`,
    extra: 'It adds two bits without the carry, so it gives the sum output of a half adder.',
  },
  {
    front: 'Two’s complement',
    back: 'To negate a binary number, invert every bit and add 1',
    extra: r`An \(n\)-bit two’s complement number ranges from \(-2^{n-1}\) to \(2^{n-1} - 1\), so 8 bits cover −128 to 127.`,
  },
  {
    front: 'D flip-flop',
    back: 'On each active clock edge the output Q takes the value of the input D, and holds it until the next edge',
  },
  {
    front: 'Combinational vs sequential logic',
    back: 'Combinational outputs depend only on the present inputs; sequential outputs also depend on stored state',
    extra: 'Adders and multiplexers are combinational; registers and counters are sequential.',
  },
  // Filters and decibels
  {
    front: 'Cutoff frequency of a first-order RC filter',
    back: r`\(f_c = \dfrac{1}{2\pi RC}\)`,
    extra: r`At \(f_c\) the output is \(1/\sqrt{2}\) of the passband level, which is \(-3\ \mathrm{dB}\).`,
  },
  {
    front: 'Decibels for voltage and for power',
    back: r`\(20\log_{10}\dfrac{V_2}{V_1}\) for voltage, \(10\log_{10}\dfrac{P_2}{P_1}\) for power`,
    extra: r`Doubling the voltage is about \(+6\ \mathrm{dB}\); doubling the power is about \(+3\ \mathrm{dB}\).`,
  },
  {
    front: 'Roll-off of a first-order filter',
    back: r`\(20\ \mathrm{dB}\) per decade (about \(6\ \mathrm{dB}\) per octave)`,
    extra: r`Each extra order adds another \(20\ \mathrm{dB}\) per decade.`,
  },
  // Fourier series
  {
    front: 'Fourier series',
    back: 'A periodic signal written as the sum of a DC term and sinusoids at the fundamental frequency and its integer multiples (harmonics)',
  },
  {
    front: 'Fourier series of a square wave',
    back: r`Only odd harmonics, with amplitudes falling as \(1/n\): \(x(t) = \dfrac{4A}{\pi}\displaystyle\sum_{n\ \text{odd}} \dfrac{\sin(n\omega_0 t)}{n}\)`,
    extra: r`For a square wave switching between \(+A\) and \(-A\), rising at \(t = 0\).`,
  },
  {
    front: 'Fourier series of even and odd signals',
    back: 'An even signal has only cosine terms (plus DC); an odd signal has only sine terms',
  },
]

export const ELECTRICAL_ENGINEERING_INTERMEDIATE: PublicDeck = {
  slug: 'electrical-engineering-intermediate',
  title: 'Intermediate electrical engineering: 50 circuits and electronics concepts',
  shortTitle: 'Intermediate electrical engineering',
  category: 'engineering',
  level: 'intermediate',
  icon: 'spark',
  description:
    'Core undergraduate circuits and electronics: Thevenin and Norton, transients, phasors, AC and three-phase power, op-amps, transistors, logic and filters.',
  intro:
    'This deck follows the core of an undergraduate electrical engineering degree: the theorems and methods used to solve circuits, first- and second-order transients, phasors and impedance, resonance, AC and three-phase power, transformers, op-amps, BJT and MOSFET operation, digital logic, filters and Fourier series. It assumes you know the material in the basics deck.',
  faq: [
    {
      q: 'Which courses does this deck cover?',
      a: 'DC and AC circuit analysis, introductory analog electronics, digital logic and the start of signals and systems, as typically taught in the first two years of an electrical engineering degree.',
    },
    {
      q: 'Why is BJT saturation different from MOSFET saturation?',
      a: 'The word means different things. A saturated BJT is fully on and acts like a closed switch; a MOSFET in saturation has a drain current set by its gate voltage, which is the region used for amplification.',
    },
    {
      q: 'Why do electrical engineers write j instead of i?',
      a: 'Because i already stands for current. The imaginary unit is written j, so an inductor’s impedance is jωL.',
    },
  ],
  cards: CARDS,
}
