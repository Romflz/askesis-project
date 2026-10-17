import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Cells and organelles
  {
    front: 'Cell theory',
    back: 'All living things are made of cells, the cell is the basic unit of life, and cells arise only from existing cells',
  },
  {
    front: 'Prokaryotic vs eukaryotic cells',
    back: 'Prokaryotes (bacteria and archaea) have no nucleus or membrane-bound organelles; eukaryotes (animals, plants, fungi and protists) have both',
  },
  {
    front: 'Nucleus',
    back: 'Holds the cell’s DNA and is where DNA is replicated and transcribed; enclosed by a double-membrane nuclear envelope with pores',
  },
  {
    front: 'Ribosome',
    back: 'Builds proteins by translating mRNA; made of rRNA and protein, found free in the cytosol or bound to the rough ER',
    extra: 'Prokaryotic ribosomes are 70S; eukaryotic cytoplasmic ribosomes are 80S.',
  },
  {
    front: 'Rough endoplasmic reticulum',
    back: 'Membranes studded with ribosomes that make and fold proteins bound for secretion, membranes or lysosomes',
  },
  {
    front: 'Smooth endoplasmic reticulum',
    back: 'Makes lipids and steroids, detoxifies drugs and stores calcium ions; it has no ribosomes',
  },
  {
    front: 'Golgi apparatus',
    back: 'Modifies, sorts and packages proteins and lipids from the ER into vesicles bound for their destinations',
  },
  {
    front: 'Lysosome',
    back: 'A vesicle of digestive enzymes, active at acidic pH (about 4.5–5), that breaks down macromolecules, worn-out organelles and engulfed material',
  },
  {
    front: 'Mitochondrion',
    back: 'The site of aerobic respiration (Krebs cycle and oxidative phosphorylation), where most of the cell’s ATP is made',
    extra: 'It has a double membrane with folded cristae, its own circular DNA and bacteria-like ribosomes.',
  },
  {
    front: 'Chloroplast',
    back: 'The site of photosynthesis in plants and algae: light reactions in the thylakoid membranes, the Calvin cycle in the stroma',
    extra: r`Overall: \(\mathrm{6CO_2 + 6H_2O \rightarrow C_6H_{12}O_6 + 6O_2}\), powered by light.`,
  },
  {
    front: 'Endosymbiotic theory',
    back: 'Mitochondria and chloroplasts descend from free-living bacteria that were engulfed by an ancestral cell',
    extra: 'Evidence: their own circular DNA, bacteria-like ribosomes, double membranes, and division by binary fission.',
  },
  {
    front: 'The three kinds of cytoskeleton filament',
    back: 'Microfilaments (actin, about 7 nm), intermediate filaments (about 10 nm) and microtubules (tubulin, about 25 nm)',
    extra: 'Microtubules form the mitotic spindle, cilia and flagella.',
  },
  {
    front: 'What are cell walls made of in plants, fungi and bacteria?',
    back: 'Cellulose in plants, chitin in fungi, peptidoglycan in bacteria',
  },
  {
    front: 'Structures plant cells have that animal cells lack',
    back: 'A cellulose cell wall, chloroplasts and a large central vacuole that keeps the cell turgid',
    extra: 'Animal cells have centrioles, which most plant cells lack.',
  },
  // Membranes and transport
  {
    front: 'Fluid mosaic model',
    back: 'The membrane is a fluid phospholipid bilayer with proteins embedded in or attached to it, free to move sideways',
    extra:
      'Phospholipid heads are hydrophilic and face the water; the fatty-acid tails are hydrophobic and face inward. Cholesterol moderates fluidity in animal cells.',
  },
  {
    front: 'Simple diffusion',
    back: r`Net movement of particles from high to low concentration with no energy input; small nonpolar molecules like \(\mathrm{O_2}\) and \(\mathrm{CO_2}\) cross the bilayer directly`,
  },
  {
    front: 'Facilitated diffusion',
    back: 'Passive movement down a concentration gradient through channel or carrier proteins',
    extra: 'Examples: glucose through GLUT transporters, water through aquaporins, ions through ion channels.',
  },
  {
    front: 'Osmosis',
    back: 'Diffusion of water across a selectively permeable membrane, toward the side with the higher solute concentration',
  },
  {
    front: 'An animal cell in a hypotonic vs a hypertonic solution',
    back: 'Hypotonic: water flows in, and the cell swells and may burst (lysis). Hypertonic: water flows out, and the cell shrivels (crenation)',
    extra: 'Plant cells in a hypotonic solution become turgid instead of bursting; in a hypertonic one they plasmolyze.',
  },
  {
    front: 'Active transport',
    back: 'Moving a substance against its concentration gradient using energy, usually from ATP, through a pump protein',
  },
  {
    front: 'Sodium–potassium pump',
    back: r`Pumps \(3\,\mathrm{Na^+}\) out of the cell and \(2\,\mathrm{K^+}\) in for each ATP used`,
    extra: 'It maintains the resting membrane potential of neurons and other cells.',
  },
  {
    front: 'Secondary active transport',
    back: 'Uses the gradient built by a pump to drive another substance against its own gradient, through a symporter or antiporter',
    extra: r`Example: the \(\mathrm{Na^+}\)–glucose symporter (SGLT) in the small intestine.`,
  },
  {
    front: 'Endocytosis vs exocytosis',
    back: 'Endocytosis takes material in by wrapping it in membrane vesicles (phagocytosis, pinocytosis, receptor-mediated); exocytosis releases vesicle contents outside the cell',
  },
  // The cell cycle and division
  {
    front: 'Phases of the cell cycle',
    back: 'G1 (growth), S (DNA replication), G2 (preparation for division) and M (mitosis and cytokinesis)',
    extra: 'G1, S and G2 together are interphase. Cells that stop dividing, like most neurons, enter G0.',
  },
  {
    front: 'Stages of mitosis, in order',
    back: 'Prophase, prometaphase, metaphase, anaphase, telophase',
    extra: 'Cytokinesis usually overlaps telophase. The classic mnemonic for the main four is PMAT.',
  },
  {
    front: 'Prophase',
    back: 'Chromatin condenses into visible chromosomes, the spindle starts to form and the nucleolus disappears',
  },
  {
    front: 'Metaphase',
    back: 'Chromosomes line up along the middle of the cell (the metaphase plate), attached to spindle fibers from both poles',
  },
  { front: 'Anaphase', back: 'Sister chromatids separate and are pulled to opposite poles of the cell' },
  {
    front: 'Result of mitosis',
    back: 'Two daughter cells genetically identical to the parent cell, with the same chromosome number',
  },
  { front: 'Result of meiosis', back: 'Four genetically different haploid cells, such as sperm or egg cells in animals' },
  {
    front: 'Meiosis I vs meiosis II',
    back: 'Meiosis I separates homologous chromosomes, halving the chromosome number; meiosis II separates sister chromatids, much like mitosis',
  },
  {
    front: 'Crossing over',
    back: 'Exchange of DNA segments between homologous chromosomes during prophase I, producing new combinations of alleles',
  },
  {
    front: 'Independent assortment',
    back: r`Each homologous pair lines up independently at metaphase I, so one person can make \(2^{23} \approx 8.4\) million chromosome combinations in their gametes`,
  },
  {
    front: 'Cytokinesis in animal vs plant cells',
    back: 'Animal cells pinch in two with a cleavage furrow (a ring of actin and myosin); plant cells build a cell plate from Golgi vesicles',
  },
  {
    front: 'Cell cycle checkpoints',
    back: 'G1/S, G2/M and the spindle checkpoint in metaphase; they pause the cycle if DNA is damaged or chromosomes aren’t properly attached',
    extra:
      'The p53 protein halts damaged cells and can trigger apoptosis (programmed cell death); it is mutated in about half of human cancers.',
  },
  { front: 'Human diploid and haploid chromosome numbers', back: r`\(2n = 46\) in body cells, \(n = 23\) in gametes` },
  // DNA, RNA and protein synthesis
  {
    front: 'Structure of DNA',
    back: 'A double helix of two antiparallel strands, with a sugar–phosphate backbone outside and paired bases inside, held together by hydrogen bonds',
  },
  { front: 'Base-pairing rules', back: 'A pairs with T (two hydrogen bonds) and G with C (three); in RNA, A pairs with U' },
  {
    front: 'DNA vs RNA',
    back: 'DNA has deoxyribose and thymine and is usually double-stranded; RNA has ribose and uracil and is usually single-stranded',
  },
  {
    front: 'Semiconservative replication',
    back: 'Each new DNA molecule keeps one original strand and gains one newly built strand',
    extra: 'Shown by the Meselson–Stahl experiment in 1958.',
  },
  {
    front: 'In which direction does DNA polymerase build DNA?',
    back: 'Only 5′ → 3′, adding nucleotides to the 3′ end, so the lagging strand is made in short Okazaki fragments joined by DNA ligase',
    extra: 'Helicase unwinds the helix first, and primase lays down short RNA primers.',
  },
  {
    front: 'Central dogma of molecular biology',
    back: 'DNA → RNA → protein: DNA is transcribed into RNA, and messenger RNA is translated into protein',
  },
  {
    front: 'Transcription',
    back: 'RNA polymerase reads the DNA template strand and builds a complementary RNA; in eukaryotes this happens in the nucleus',
  },
  {
    front: 'mRNA processing in eukaryotes',
    back: 'A 5′ cap and a 3′ poly-A tail are added, and introns are spliced out so only exons remain',
  },
  {
    front: 'Codon',
    back: 'Three mRNA bases that code for one amino acid or a stop signal',
    extra: 'There are 64 codons. AUG (methionine) is the start codon; UAA, UAG and UGA are stop codons.',
  },
  {
    front: 'Role of tRNA',
    back: 'Carries a specific amino acid to the ribosome; its anticodon pairs with the matching codon on the mRNA',
  },
  {
    front: 'Silent, missense and nonsense mutations',
    back: 'Silent: the same amino acid. Missense: a different amino acid. Nonsense: an early stop codon',
  },
  {
    front: 'Frameshift mutation',
    back: 'An insertion or deletion of a number of bases not divisible by three, which shifts the reading frame and changes every codon after it',
  },
  // Energy
  {
    front: 'ATP',
    back: 'Adenosine triphosphate, the cell’s energy currency: hydrolysis to ADP and phosphate releases energy for cellular work',
  },
  {
    front: 'Overall equation of aerobic respiration',
    back: r`\(\mathrm{C_6H_{12}O_6 + 6O_2 \rightarrow 6CO_2 + 6H_2O}\)`,
    extra: 'It yields about 30–32 ATP per glucose molecule.',
  },
]

export const CELL_BIOLOGY: PublicDeck = {
  slug: 'cell-biology',
  title: 'Cell biology: 50 essentials from organelles to DNA',
  shortTitle: 'Cell biology',
  category: 'biology',
  level: 'beginner',
  icon: 'flask',
  description:
    'Cell biology essentials: organelles and their jobs, membrane transport, the cell cycle, mitosis and meiosis, DNA replication, transcription and translation.',
  intro:
    'Whether you are studying for a biology exam, the MCAT or a first university course, cell biology comes first. This deck covers what each organelle does, how substances cross the membrane, how cells divide, and how DNA is copied and turned into protein, with answers short enough to recall in seconds.',
  faq: [
    {
      q: 'What is the difference between mitosis and meiosis?',
      a: 'Mitosis makes two genetically identical cells for growth and repair. Meiosis makes four genetically different haploid cells, the gametes, with crossing over and independent assortment creating variation.',
    },
    {
      q: 'Is this deck for high school or university?',
      a: 'Both. It covers the cell biology in high school courses such as AP and A-level Biology and in introductory university biology.',
    },
    {
      q: 'Why is the mitochondrion called the powerhouse of the cell?',
      a: 'Because it makes most of the cell’s ATP through aerobic respiration.',
    },
  ],
  cards: CARDS,
}
