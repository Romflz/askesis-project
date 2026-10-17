import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Quantities and units
  {
    front: 'Electric charge: symbol and unit',
    back: r`\(Q\), measured in coulombs (C)`,
    extra: r`An electron carries \(-1.602 \times 10^{-19}\ \mathrm{C}\), so one coulomb is about \(6.24 \times 10^{18}\) electrons.`,
  },
  {
    front: 'Electric current',
    back: r`The rate of flow of charge: \(I = \dfrac{Q}{t}\), measured in amperes (A)`,
    extra: r`\(1\ \mathrm{A} = 1\ \mathrm{C/s}\)`,
  },
  {
    front: 'Voltage (potential difference)',
    back: r`The work done per unit charge in moving charge between two points: \(V = \dfrac{W}{Q}\), measured in volts (V)`,
    extra: r`\(1\ \mathrm{V} = 1\ \mathrm{J/C}\)`,
  },
  {
    front: 'Resistance',
    back: r`Opposition to current: \(R = \dfrac{V}{I}\), measured in ohms (\(\Omega\))`,
    extra: r`Its reciprocal is conductance, \(G = 1/R\), measured in siemens (S).`,
  },
  {
    front: 'Conventional current vs electron flow',
    back: 'Conventional current flows from positive to negative through the external circuit; electrons drift the opposite way',
    extra: 'Circuit diagrams and the arrows in component symbols use conventional current.',
  },
  {
    front: 'SI prefixes k, M and G',
    back: r`Kilo \(10^3\), mega \(10^6\), giga \(10^9\)`,
    extra: r`Capital M is mega and lowercase m is milli: \(4.7\ \mathrm{M\Omega} = 4\,700\,000\ \Omega\).`,
  },
  {
    front: 'SI prefixes m, µ, n and p',
    back: r`Milli \(10^{-3}\), micro \(10^{-6}\), nano \(10^{-9}\), pico \(10^{-12}\)`,
    extra: r`Example: \(100\ \mathrm{nF} = 0.1\ \mathrm{\mu F} = 100\,000\ \mathrm{pF}\).`,
  },
  {
    front: 'Kilowatt-hour (kWh)',
    back: r`The energy used by \(1\ \mathrm{kW}\) for one hour: \(3.6\ \mathrm{MJ}\)`,
    extra: r`Energy is power times time, \(E = Pt\): a \(2\ \mathrm{kW}\) heater running for 3 hours uses \(6\ \mathrm{kWh}\).`,
  },
  // Circuit laws
  {
    front: 'Ohm’s law',
    back: r`\(V = IR\)`,
    extra: 'It holds for ohmic conductors such as resistors at a constant temperature. Diodes and filament lamps are non-ohmic.',
  },
  {
    front: 'Electric power',
    back: r`\(P = VI = I^2R = \dfrac{V^2}{R}\)`,
    extra: r`Measured in watts: \(1\ \mathrm{W} = 1\ \mathrm{J/s}\).`,
  },
  {
    front: 'Kirchhoff’s current law (KCL)',
    back: 'The total current flowing into a node equals the total current flowing out',
    extra: 'It follows from conservation of charge.',
  },
  {
    front: 'Kirchhoff’s voltage law (KVL)',
    back: 'The voltages around any closed loop sum to zero',
    extra: 'It follows from conservation of energy.',
  },
  {
    front: 'Resistance of a wire',
    back: r`\(R = \dfrac{\rho L}{A}\)`,
    extra: r`\(\rho\) is the resistivity, \(L\) the length and \(A\) the cross-sectional area. Copper’s resistivity is about \(1.7 \times 10^{-8}\ \Omega\,\mathrm{m}\) at 20 °C.`,
  },
  {
    front: 'Terminal voltage of a battery',
    back: r`\(V = \mathcal{E} - Ir\)`,
    extra: r`\(\mathcal{E}\) is the EMF and \(r\) the internal resistance, so the voltage sags as the current \(I\) rises.`,
  },
  // Series and parallel
  {
    front: 'Resistors in series',
    back: r`\(R_{\text{eq}} = R_1 + R_2 + \cdots\)`,
    extra: 'The same current flows through each one, and their voltages add up.',
  },
  {
    front: 'Resistors in parallel',
    back: r`\(\dfrac{1}{R_{\text{eq}}} = \dfrac{1}{R_1} + \dfrac{1}{R_2} + \cdots\)`,
    extra: 'Each has the same voltage across it, and the total is less than the smallest resistance.',
  },
  {
    front: 'Two resistors in parallel (shortcut)',
    back: r`\(R_{\text{eq}} = \dfrac{R_1 R_2}{R_1 + R_2}\)`,
    extra: r`Product over sum. Two equal resistors give half the value: \(10\ \mathrm{k\Omega} \parallel 10\ \mathrm{k\Omega} = 5\ \mathrm{k\Omega}\).`,
  },
  {
    front: 'Voltage divider',
    back: r`\(V_{\text{out}} = V_{\text{in}}\,\dfrac{R_2}{R_1 + R_2}\)`,
    extra: r`\(V_{\text{out}}\) is taken across \(R_2\). It holds only while the load draws negligible current.`,
  },
  {
    front: 'Current divider (two resistors)',
    back: r`\(I_1 = I\,\dfrac{R_2}{R_1 + R_2}\)`,
    extra: 'The larger share of the current flows through the smaller resistance.',
  },
  // Colour codes and markings
  {
    front: 'Resistor colour code: digits 0 to 9',
    back: 'Black 0, brown 1, red 2, orange 3, yellow 4, green 5, blue 6, violet 7, grey 8, white 9',
    extra: 'The colours from red to violet follow the order of the rainbow.',
  },
  {
    front: 'Resistor tolerance bands: gold and silver',
    back: 'Gold ±5%, silver ±10%',
    extra: 'Precision resistors use brown (±1%) or red (±2%).',
  },
  {
    front: 'Value of a resistor banded brown, black, red, gold',
    back: r`\(1\ \mathrm{k\Omega}\) ±5%`,
    extra: r`Brown 1 and black 0 give 10, and the red multiplier band means \(\times 10^2\): \(10 \times 100 = 1000\ \Omega\).`,
  },
  {
    front: 'Ceramic capacitor marked 104',
    back: r`\(100\ \mathrm{nF}\) (\(0.1\ \mathrm{\mu F}\))`,
    extra: r`The first two digits are the value and the third is the number of zeros, in picofarads: \(10 \times 10^4\ \mathrm{pF}\).`,
  },
  // Capacitors and inductors
  {
    front: 'Capacitance',
    back: r`\(C = \dfrac{Q}{V}\), measured in farads (F)`,
    extra: 'A capacitor stores energy in the electric field between two conductors separated by an insulator.',
  },
  { front: 'Energy stored in a capacitor', back: r`\(E = \tfrac{1}{2}CV^2\)` },
  {
    front: 'Capacitors in series and in parallel',
    back: r`Parallel: \(C_{\text{eq}} = C_1 + C_2 + \cdots\). Series: \(\dfrac{1}{C_{\text{eq}}} = \dfrac{1}{C_1} + \dfrac{1}{C_2} + \cdots\)`,
    extra: 'The opposite of the rules for resistors.',
  },
  {
    front: 'Current through a capacitor',
    back: r`\(i = C\,\dfrac{dv}{dt}\)`,
    extra: 'A capacitor passes current only while the voltage across it is changing.',
  },
  {
    front: 'Voltage across an inductor',
    back: r`\(v = L\,\dfrac{di}{dt}\)`,
    extra: 'Inductance is measured in henries (H). An inductor stores energy in its magnetic field.',
  },
  { front: 'Energy stored in an inductor', back: r`\(E = \tfrac{1}{2}LI^2\)` },
  {
    front: 'Capacitors and inductors in a DC circuit at steady state',
    back: 'A capacitor acts as an open circuit; an inductor acts as a short circuit',
    extra: 'Nothing is changing, so no current flows into the capacitor and no voltage appears across the inductor.',
  },
  {
    front: 'Electrolytic capacitors',
    back: 'They are polarized: the lead marked negative must be at the lower voltage',
    extra: 'Connected in reverse or over their rated voltage, they can overheat, vent or burst.',
  },
  // AC
  {
    front: 'AC vs DC',
    back: 'Direct current flows in one direction only; alternating current reverses direction periodically, usually as a sine wave',
    extra: 'Batteries supply DC; the mains supply is AC.',
  },
  {
    front: 'Frequency and period',
    back: r`\(f = \dfrac{1}{T}\)`,
    extra: r`Frequency is measured in hertz (cycles per second): a \(50\ \mathrm{Hz}\) wave has a period of \(20\ \mathrm{ms}\).`,
  },
  {
    front: 'Mains frequency',
    back: r`\(50\ \mathrm{Hz}\) in most of the world; \(60\ \mathrm{Hz}\) in North America and some other countries`,
    extra: 'Japan uses both: 50 Hz in the east and 60 Hz in the west.',
  },
  {
    front: 'RMS value of a sine wave',
    back: r`\(V_{\text{rms}} = \dfrac{V_{\text{peak}}}{\sqrt{2}} \approx 0.707\,V_{\text{peak}}\)`,
    extra: 'The RMS value is the DC voltage that would heat a resistor at the same average rate.',
  },
  {
    front: 'Peak voltage of 230 V mains',
    back: r`About \(325\ \mathrm{V}\) (\(230\sqrt{2}\))`,
    extra: 'Mains voltages are quoted as RMS values. For 120 V mains the peak is about 170 V.',
  },
  // Components
  {
    front: 'Diode',
    back: 'Lets current flow from anode to cathode and blocks it in the reverse direction',
    extra: 'In the symbol the arrow points the way conventional current flows, and the bar marks the cathode.',
  },
  {
    front: 'Forward voltage of a silicon diode',
    back: r`About \(0.6\) to \(0.7\ \mathrm{V}\)`,
    extra: 'Schottky diodes drop less, typically about 0.2 to 0.4 V.',
  },
  {
    front: 'Series resistor for an LED',
    back: r`\(R = \dfrac{V_s - V_F}{I_F}\)`,
    extra: r`\(V_s\) is the supply, \(V_F\) the LED’s forward voltage (about \(2\ \mathrm{V}\) for red, \(3\ \mathrm{V}\) for blue or white) and \(I_F\) the current, often \(10\) to \(20\ \mathrm{mA}\).`,
  },
  {
    front: 'Terminals of a BJT and a MOSFET',
    back: 'BJT: base, collector, emitter. MOSFET: gate, drain, source',
    extra: 'The base and the gate are the control terminals.',
  },
  {
    front: 'Transistor used as a switch',
    back: 'A small signal at the base or gate turns a much larger current between the other two terminals fully on or fully off',
    extra: 'A BJT is driven by base current; a MOSFET by gate voltage, with almost no steady gate current.',
  },
  {
    front: 'Relay',
    back: 'An electrically operated switch: current through a coil moves a set of contacts',
    extra: 'It lets a small circuit control a separate, isolated circuit at a higher voltage or current.',
  },
  {
    front: 'Flyback diode across a relay coil',
    back: 'It gives the coil’s current a path when the coil is switched off, preventing a voltage spike that could destroy the driving transistor',
    extra: 'It is fitted reverse-biased, so it carries no current while the coil is energized.',
  },
  {
    front: 'Fuse',
    back: 'A thin conductor that melts and breaks the circuit when the current exceeds its rating',
    extra: 'It protects the wiring from overheating. A circuit breaker does the same job and can be reset.',
  },
  // Measurement and safety
  {
    front: 'How to connect an ammeter and a voltmeter',
    back: 'An ammeter goes in series with the component; a voltmeter goes in parallel across it',
    extra: 'An ideal ammeter has zero resistance and an ideal voltmeter infinite resistance, so neither disturbs the circuit.',
  },
  {
    front: 'Short circuit vs open circuit',
    back: 'A short circuit is a path of almost zero resistance (no voltage across it); an open circuit is a break (no current through it)',
  },
  {
    front: 'Ground in a circuit diagram',
    back: 'The reference node, defined as 0 V, that other node voltages are measured from',
    extra: 'It need not be connected to the earth; protective earth is a separate safety connection.',
  },
  {
    front: 'Protective earth',
    back: 'A conductor connecting exposed metal parts of equipment to earth, so a fault makes a large current flow and blows the fuse or trips the breaker instead of leaving the case live',
  },
  {
    front: 'Residual-current device (RCD or GFCI)',
    back: 'Cuts the supply when the currents in the live and neutral conductors differ, meaning current is leaking to earth, possibly through a person',
    extra: 'Typical trip thresholds are 30 mA for an RCD and about 5 mA for a GFCI.',
  },
  {
    front: 'Mains wire colours (IEC)',
    back: 'Brown: live. Blue: neutral. Green and yellow: protective earth',
    extra: 'In North America, black (or red) is hot, white is neutral and green or bare copper is ground.',
  },
]

export const ELECTRICAL_ENGINEERING_BASICS: PublicDeck = {
  slug: 'electrical-engineering-basics',
  title: 'Electrical engineering basics: 50 core concepts',
  shortTitle: 'Electrical engineering basics',
  category: 'engineering',
  level: 'beginner',
  icon: 'spark',
  description:
    'The basics of electrical engineering: Ohm’s and Kirchhoff’s laws, series and parallel circuits, capacitors, inductors, AC, components and safety.',
  intro:
    'Electrical engineering starts with a handful of quantities and the laws that tie them together. This deck covers charge, current, voltage and resistance, Ohm’s and Kirchhoff’s laws, series and parallel circuits, colour codes, capacitors and inductors, AC and RMS values, everyday components such as diodes, LEDs, transistors and relays, and the basics of electrical safety.',
  faq: [
    {
      q: 'Do I need calculus for this deck?',
      a: 'Hardly. Nearly every card uses algebra; only the capacitor and inductor equations use derivatives, which you will meet in any first circuits course.',
    },
    {
      q: 'Why do capacitors combine the opposite way to resistors?',
      a: 'Capacitors in parallel act like one capacitor with a larger plate area, so their capacitances add. In series, each one holds the same charge while their voltages add, so the reciprocals add.',
    },
    {
      q: 'What should I learn after this deck?',
      a: 'The intermediate deck moves on to circuit analysis: Thevenin and Norton equivalents, transients, phasors, AC and three-phase power, op-amps, transistors and digital logic.',
    },
  ],
  cards: CARDS,
}
