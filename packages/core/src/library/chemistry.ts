import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  {
    front: 'What is a mole?',
    back: r`The amount of substance that contains \(6.022 \times 10^{23}\) particles`,
    extra: 'Since 2019 the mole is defined by fixing the Avogadro constant exactly.',
  },
  { front: 'Avogadro constant', back: r`\(N_A = 6.022 \times 10^{23}\,\mathrm{mol^{-1}}\)` },
  {
    front: 'Ideal gas law',
    back: r`\(PV = nRT\)`,
    extra: 'P pressure, V volume, n amount in moles, R gas constant, T absolute temperature.',
  },
  { front: 'Value of the gas constant R', back: r`\(R \approx 8.314\ \mathrm{J\,mol^{-1}\,K^{-1}}\)` },
  { front: 'Definition of pH', back: r`\(\mathrm{pH} = -\log_{10}[\mathrm{H^+}]\)` },
  { front: 'pH of pure water at 25 °C', back: '7 (neutral)' },
  { front: 'Brønsted–Lowry acid', back: r`A proton (\(\mathrm{H^+}\)) donor` },
  { front: 'Brønsted–Lowry base', back: 'A proton acceptor' },
  { front: 'Lewis acid', back: 'An electron-pair acceptor', extra: 'A Lewis base is an electron-pair donor.' },
  { front: 'Oxidation (OIL RIG)', back: 'Loss of electrons', extra: 'Oxidation Is Loss, Reduction Is Gain.' },
  { front: 'Reduction (OIL RIG)', back: 'Gain of electrons' },
  {
    front: 'Ionic bond',
    back: r`Electrostatic attraction between oppositely charged ions, formed by electron transfer`,
    extra: r`Example: \(\mathrm{NaCl}\).`,
  },
  { front: 'Covalent bond', back: 'A pair of electrons shared between two atoms' },
  { front: 'Metallic bond', back: 'Metal cations held together by a “sea” of delocalized electrons' },
  { front: 'Hydrogen bond', back: 'An attraction between H bonded to N, O or F and a lone pair on another N, O or F' },
  {
    front: 'Electronegativity',
    back: 'How strongly an atom attracts the electrons in a bond',
    extra: 'Fluorine is the most electronegative element.',
  },
  { front: 'Isotopes', back: 'Atoms of the same element with different numbers of neutrons' },
  { front: 'Atomic number', back: 'The number of protons in the nucleus' },
  { front: 'Mass number', back: 'Protons + neutrons in the nucleus' },
  {
    front: 'Le Chatelier’s principle',
    back: 'A system at equilibrium shifts to counteract a change in concentration, pressure or temperature',
  },
  { front: 'Catalyst', back: 'Speeds up a reaction by lowering its activation energy, without being consumed' },
  { front: 'Exothermic reaction', back: r`Releases heat to the surroundings; \(\Delta H < 0\)` },
  { front: 'Endothermic reaction', back: r`Absorbs heat from the surroundings; \(\Delta H > 0\)` },
  {
    front: 'Gibbs free energy',
    back: r`\(\Delta G = \Delta H - T\Delta S\)`,
    extra: r`A reaction is spontaneous when \(\Delta G < 0\).`,
  },
  { front: 'Molarity', back: r`Moles of solute per litre of solution: \(c = \dfrac{n}{V}\)` },
  { front: 'Moles from mass', back: r`\(n = \dfrac{m}{M}\)`, extra: 'm mass in grams, M molar mass in g/mol.' },
  { front: 'Molar mass of water', back: r`About \(18.02\ \mathrm{g/mol}\)`, extra: r`\(2 \times 1.008 + 16.00\)` },
  { front: 'Chemical formula of table salt', back: r`\(\mathrm{NaCl}\) (sodium chloride)` },
  { front: 'Noble gases', back: 'Group 18: full valence shells, so they are very unreactive', extra: 'He, Ne, Ar, Kr, Xe, Rn.' },
  { front: 'Alkali metals', back: 'Group 1 (Li, Na, K, …): soft metals that react vigorously with water' },
  { front: 'Halogens', back: 'Group 17: F, Cl, Br, I, At' },
  { front: 'Valence electrons', back: 'Electrons in the outermost shell, the ones that take part in bonding' },
  { front: 'Octet rule', back: 'Atoms tend to gain, lose or share electrons to reach eight valence electrons' },
  { front: 'Functional group of alcohols', back: r`Hydroxyl, \(\mathrm{-OH}\)` },
  { front: 'Functional group of carboxylic acids', back: r`Carboxyl, \(\mathrm{-COOH}\)` },
  { front: 'Ketone', back: r`A carbonyl group (\(\mathrm{C{=}O}\)) bonded to two carbon groups`, extra: 'Example: acetone.' },
  { front: 'Aldehyde', back: r`A carbonyl group at the end of a chain: \(\mathrm{-CHO}\)` },
  { front: 'Amine', back: r`Nitrogen bonded to carbon groups and/or hydrogen, e.g. \(\mathrm{-NH_2}\)` },
  { front: 'Ester', back: r`\(\mathrm{-COO-}\) linking two carbon groups; formed from a carboxylic acid and an alcohol` },
  { front: 'General formula of alkanes', back: r`\(\mathrm{C_nH_{2n+2}}\)` },
  { front: 'General formula of alkenes', back: r`\(\mathrm{C_nH_{2n}}\)`, extra: 'Alkenes contain a C=C double bond.' },
  { front: 'Structural isomers', back: 'Compounds with the same molecular formula but different structures' },
  { front: 'Complete combustion of methane', back: r`\(\mathrm{CH_4 + 2O_2 \rightarrow CO_2 + 2H_2O}\)` },
  { front: 'Neutralization', back: 'Acid + base → salt + water' },
  {
    front: 'Three common strong acids',
    back: r`\(\mathrm{HCl}\), \(\mathrm{H_2SO_4}\), \(\mathrm{HNO_3}\)`,
    extra: 'Strong acids dissociate fully in water.',
  },
  { front: 'Buffer solution', back: 'A solution that resists changes in pH, usually a weak acid and its conjugate base' },
  { front: 'Half-life', back: 'The time it takes for half of a reactant, or of radioactive nuclei, to be used up or decay' },
  {
    front: 'What does a titration measure?',
    back: 'The concentration of a solution, by reacting it with a solution of known concentration',
  },
  {
    front: 'Standard temperature and pressure (IUPAC)',
    back: r`\(273.15\ \mathrm{K}\) (0 °C) and \(100\ \mathrm{kPa}\) (1 bar)`,
  },
  { front: 'Electron configuration of carbon', back: r`\(1s^2\,2s^2\,2p^2\)` },
]

export const CHEMISTRY: PublicDeck = {
  slug: 'chemistry-essentials',
  title: 'Chemistry essentials: 50 core concepts',
  shortTitle: 'Chemistry essentials',
  category: 'chemistry',
  level: 'beginner',
  icon: 'flask',
  description:
    'The core ideas of general chemistry: the mole, pH, bonding, redox, equilibrium, thermodynamics and organic functional groups.',
  intro:
    'A compact review of the concepts that show up in every introductory chemistry course and exam. Definitions are short enough to recall in a few seconds, and key equations like the ideal gas law and Gibbs free energy are written out in full.',
  faq: [
    {
      q: 'Is this deck enough for an exam?',
      a: 'It covers the core definitions and equations. Pair it with practice problems; spaced repetition makes sure the basics stay fresh while you do.',
    },
    { q: 'What does OIL RIG mean?', a: 'Oxidation Is Loss, Reduction Is Gain, of electrons.' },
    {
      q: 'Can I add my own chemistry cards?',
      a: 'Yes. Add the deck to your collection and create cards with LaTeX formulas such as the ideal gas law.',
    },
  ],
  cards: CARDS,
}
