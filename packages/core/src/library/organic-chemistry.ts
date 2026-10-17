import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Functional groups and naming
  { front: 'General formula of alkynes', back: r`\(\mathrm{C_nH_{2n-2}}\)`, extra: 'Alkynes contain a C≡C triple bond.' },
  { front: 'Ether functional group', back: 'An oxygen bonded to two carbon groups: R–O–R′', extra: 'Example: diethyl ether.' },
  {
    front: 'Amide functional group',
    back: r`A carbonyl bonded to nitrogen: \(\mathrm{R{-}CO{-}NR'_2}\)`,
    extra: r`The simplest form is \(\mathrm{R{-}CONH_2}\).`,
  },
  { front: 'Acid chloride (acyl chloride)', back: r`\(\mathrm{R{-}COCl}\): a carbonyl bonded to chlorine` },
  {
    front: 'Reactivity of carboxylic acid derivatives (most to least)',
    back: 'Acid chloride > anhydride > ester > amide',
    extra: 'Toward nucleophilic acyl substitution. Better leaving groups mean more reactive derivatives.',
  },
  {
    front: 'IUPAC suffixes for alcohols, aldehydes and ketones',
    back: '-ol, -al and -one',
    extra: 'Ethanol, ethanal, propanone.',
  },
  {
    front: 'Which has naming priority in IUPAC: a carboxylic acid or an alcohol?',
    back: 'The carboxylic acid; the alcohol becomes a “hydroxy-” prefix',
  },
  // Structure and bonding
  {
    front: 'Hybridization and geometry of a carbon with four single bonds',
    back: r`\(sp^3\), tetrahedral, about \(109.5^\circ\)`,
  },
  { front: 'Hybridization and geometry of an alkene carbon', back: r`\(sp^2\), trigonal planar, about \(120^\circ\)` },
  { front: 'Hybridization and geometry of an alkyne carbon', back: r`\(sp\), linear, \(180^\circ\)` },
  {
    front: 'Sigma vs pi bonds',
    back: 'σ: head-on overlap along the bond axis; π: side-by-side overlap of p orbitals',
    extra: 'A double bond is one σ + one π; a triple bond is one σ + two π.',
  },
  {
    front: 'Resonance structures',
    back: 'Structures with the same atom positions but different electron placement; the real molecule is a hybrid of them',
  },
  // Stereochemistry
  { front: 'Stereoisomers', back: 'Isomers with the same connectivity but a different 3D arrangement' },
  { front: 'Enantiomers', back: 'Stereoisomers that are non-superimposable mirror images' },
  { front: 'Diastereomers', back: 'Stereoisomers that are not mirror images of each other' },
  {
    front: 'Meso compound',
    back: 'A compound with stereocenters that is achiral because of an internal mirror plane',
    extra: 'Example: meso-tartaric acid.',
  },
  { front: 'Chiral center (stereocenter)', back: 'Typically a carbon bonded to four different groups' },
  {
    front: r`Maximum number of stereoisomers with \(n\) stereocenters`,
    back: r`\(2^n\)`,
    extra: 'Fewer when meso compounds are possible.',
  },
  {
    front: 'Cahn–Ingold–Prelog priority rule',
    back: 'Higher atomic number at the first point of difference gets higher priority',
  },
  {
    front: 'How do you assign R or S?',
    back: 'Point the lowest-priority group away; if 1 → 2 → 3 runs clockwise it is R, counterclockwise S',
  },
  { front: 'Racemic mixture', back: 'A 50:50 mixture of two enantiomers; it is optically inactive' },
  {
    front: 'E/Z isomerism in alkenes',
    back: 'Z: the higher-priority groups are on the same side of the C=C; E: on opposite sides',
    extra: 'It exists because rotation about a C=C bond is restricted.',
  },
  // Substitution and elimination
  {
    front: 'SN2 mechanism',
    back: r`One concerted step with backside attack; rate \(= k[\text{substrate}][\text{Nu}]\)`,
    extra: 'Inverts the configuration at the carbon.',
  },
  {
    front: 'Best substrates for SN2',
    back: 'Methyl > primary > secondary; tertiary substrates don’t react by SN2',
    extra: 'Steric hindrance blocks backside attack.',
  },
  { front: 'Solvent that favors SN2', back: 'Polar aprotic, e.g. DMSO, DMF or acetone' },
  {
    front: 'SN1 mechanism',
    back: r`Two steps through a carbocation; rate \(= k[\text{substrate}]\)`,
    extra: 'Gives a mostly racemic product at a stereocenter.',
  },
  {
    front: 'Conditions that favor SN1',
    back: 'Tertiary or resonance-stabilized substrates, weak nucleophiles, polar protic solvents',
  },
  {
    front: 'E2 mechanism',
    back: r`One concerted step with a strong base; H and the leaving group must be anti-periplanar; rate \(= k[\text{substrate}][\text{base}]\)`,
  },
  {
    front: 'E1 mechanism',
    back: r`Two steps through a carbocation, favored by weak bases and heat; rate \(= k[\text{substrate}]\)`,
  },
  {
    front: 'Zaitsev’s rule',
    back: 'Eliminations usually give the more substituted, more stable alkene',
    extra: 'Bulky bases such as tert-butoxide favor the less substituted (Hofmann) product.',
  },
  {
    front: 'Carbocation stability order',
    back: 'Tertiary > secondary > primary > methyl',
    extra: 'Hyperconjugation and inductive effects; allylic and benzylic cations are also stabilized by resonance.',
  },
  { front: 'Carbocation rearrangement', back: 'A 1,2-hydride or alkyl shift that turns a carbocation into a more stable one' },
  // Alkene additions
  {
    front: 'Product of HBr + propene (no peroxides)',
    back: '2-Bromopropane (Markovnikov)',
    extra: 'H adds to the carbon with more hydrogens; Br ends up on the more substituted carbon.',
  },
  {
    front: 'Product of HBr + propene with peroxides',
    back: '1-Bromopropane (anti-Markovnikov)',
    extra: 'A radical mechanism puts Br on the less substituted carbon.',
  },
  {
    front: 'Hydroboration–oxidation of an alkene',
    back: r`Anti-Markovnikov alcohol with syn addition (\(\mathrm{BH_3}\); then \(\mathrm{H_2O_2}\), \(\mathrm{NaOH}\))`,
    extra: 'No carbocation, so no rearrangements.',
  },
  {
    front: 'Acid-catalyzed hydration of an alkene',
    back: r`Markovnikov alcohol (\(\mathrm{H_2O}\), \(\mathrm{H_2SO_4}\)), through a carbocation`,
    extra: 'Rearrangements are possible.',
  },
  // Acids and aromatic chemistry
  {
    front: 'What makes an organic acid stronger?',
    back: 'A more stable conjugate base: negative charge spread by resonance or held by electronegative atoms',
  },
  {
    front: r`Typical \(\mathrm{p}K_a\) of a carboxylic acid, a phenol and an alcohol`,
    back: r`About \(4\text{–}5\), \(10\) and \(16\text{–}18\)`,
  },
  {
    front: 'Hückel’s rule',
    back: r`A cyclic, planar, fully conjugated ring is aromatic with \(4n + 2\) π electrons`,
    extra: 'Benzene has 6 π electrons (n = 1).',
  },
  {
    front: 'Electrophilic aromatic substitution',
    back: 'An electrophile replaces a hydrogen on an aromatic ring through a sigma complex (arenium ion), keeping the ring aromatic',
  },
  {
    front: 'Ortho/para-directing groups',
    back: r`Activating groups such as \(\mathrm{-OH}\), \(\mathrm{-NH_2}\), \(\mathrm{-OCH_3}\) and alkyls, plus the halogens`,
    extra: 'Halogens deactivate the ring but still direct ortho/para.',
  },
  {
    front: 'Meta-directing groups',
    back: r`Strongly deactivating groups: \(\mathrm{-NO_2}\), \(\mathrm{-CN}\), \(\mathrm{-SO_3H}\), \(\mathrm{-CF_3}\) and carbonyl groups`,
  },
  {
    front: 'Reagents for nitrating benzene',
    back: r`\(\mathrm{HNO_3}\) with \(\mathrm{H_2SO_4}\), which generate the nitronium ion \(\mathrm{NO_2^+}\)`,
  },
  // Carbonyl chemistry, oxidation and reduction
  {
    front: 'Nucleophilic addition to a carbonyl',
    back: 'A nucleophile attacks the electrophilic carbonyl carbon, forming a tetrahedral intermediate',
  },
  {
    front: 'Grignard reagent + ketone, then aqueous workup',
    back: 'A tertiary alcohol',
    extra: 'With an aldehyde: a secondary alcohol; with formaldehyde: a primary alcohol.',
  },
  {
    front: r`\(\mathrm{NaBH_4}\) vs \(\mathrm{LiAlH_4}\)`,
    back: r`Both reduce aldehydes and ketones to alcohols; only \(\mathrm{LiAlH_4}\) also reduces esters and carboxylic acids (to primary alcohols)`,
  },
  {
    front: 'PCC oxidation of a primary alcohol',
    back: 'An aldehyde (PCC stops there)',
    extra: 'Stronger oxidants such as chromic acid or KMnO₄ go on to the carboxylic acid; secondary alcohols give ketones.',
  },
  {
    front: 'Fischer esterification',
    back: r`Carboxylic acid + alcohol \(\rightleftharpoons\) ester + water, with an acid catalyst`,
    extra: 'It is an equilibrium; excess alcohol or removing water drives it forward.',
  },
  {
    front: 'Aldol reaction',
    back: 'An enolate adds to another aldehyde or ketone, giving a β-hydroxy carbonyl compound',
    extra: 'Losing water (aldol condensation) gives an α,β-unsaturated carbonyl.',
  },
  {
    front: 'Diels–Alder reaction',
    back: 'A [4+2] cycloaddition of a conjugated diene with a dienophile, forming a cyclohexene ring',
    extra: 'The diene must adopt the s-cis conformation; the reaction is concerted.',
  },
]

export const ORGANIC_CHEMISTRY: PublicDeck = {
  slug: 'organic-chemistry',
  title: 'Organic chemistry flashcards: 50 mechanisms, reactions and rules',
  shortTitle: 'Organic chemistry',
  category: 'chemistry',
  level: 'intermediate',
  icon: 'flask',
  description:
    'SN1, SN2, E1 and E2, stereochemistry, Markovnikov additions, aromatic substitution and carbonyl reactions: the organic chemistry you need for exams, in 50 flashcards.',
  intro:
    'Organic chemistry rewards knowing a set of patterns cold: which mechanism a substrate follows, where a group adds, how to name and assign stereocenters, and what common reagents do. This deck covers those patterns, from hybridization and R/S to Grignard additions and the Diels–Alder reaction.',
  faq: [
    {
      q: 'What course does this deck cover?',
      a: 'A first-year organic chemistry sequence: structure, stereochemistry, substitution and elimination, alkene additions, aromatic substitution and carbonyl chemistry.',
    },
    {
      q: 'How do I tell SN1 from SN2?',
      a: 'Look at the substrate, nucleophile and solvent: methyl or primary substrates with strong nucleophiles in polar aprotic solvents go SN2; tertiary substrates with weak nucleophiles in polar protic solvents go SN1.',
    },
    {
      q: 'Does it include reaction mechanisms with arrows?',
      a: 'Cards describe mechanisms and outcomes in words and formulas; drawing arrow-pushing mechanisms on paper is a great companion exercise.',
    },
  ],
  cards: CARDS,
}
