import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // The field and its diagrams
  {
    front: 'What do chemical engineers do?',
    back: 'Design, build, run and improve processes that turn raw materials into useful products on an industrial scale, safely and economically',
    extra: 'Fuels, plastics, medicines, fertilizers, food and clean water all come from such processes.',
  },
  {
    front: 'Unit operation',
    back: 'A basic physical step that appears in many processes, such as distillation, filtration, heat exchange, drying or mixing',
    extra: 'The idea lets engineers study each step once and reuse it across very different industries.',
  },
  {
    front: 'Block flow diagram',
    back: 'The simplest process diagram: boxes for the main process steps, joined by arrows for the main streams',
  },
  {
    front: 'Process flow diagram (PFD)',
    back: 'Shows the major equipment and main process streams, usually with flow rates, compositions, temperatures and pressures',
    extra: 'It leaves out most piping details, small valves and instruments.',
  },
  {
    front: 'Piping and instrumentation diagram (P&ID)',
    back: 'A detailed drawing of all the equipment, piping, valves, instruments and control loops in a plant section',
    extra: 'Used for construction, operation, maintenance and safety reviews.',
  },
  {
    front: 'Pilot plant',
    back: 'A small-scale version of a process, built to test it and collect design data before a full-size plant is built',
  },
  {
    front: 'Batch process',
    back: 'The feed is charged into a vessel, processed, and removed some time later; nothing flows in or out in between',
    extra: 'Suits small volumes and many products, such as pharmaceuticals and specialty chemicals.',
  },
  {
    front: 'Continuous process',
    back: 'Feed and product streams flow in and out the whole time the process runs',
    extra: 'Suits large volumes, such as oil refining and ammonia production. Usually run at steady state.',
  },
  {
    front: 'Semibatch process',
    back: 'Neither batch nor continuous: material enters or leaves while the process runs, such as a tank slowly fed a reactant with nothing withdrawn',
  },
  {
    front: 'Steady state',
    back: 'No process variable (flow, temperature, pressure, composition) changes with time, so nothing accumulates',
    extra: 'Startup, shutdown and upsets are transient, or unsteady-state, operation.',
  },
  // Material balances
  {
    front: 'General balance equation',
    back: r`\[\text{input} - \text{output} + \text{generation} - \text{consumption} = \text{accumulation}\]`,
    extra:
      'Generation and consumption apply only to species formed or used up by reactions; total mass is neither generated nor consumed.',
  },
  { front: 'Mass balance at steady state with no reaction', back: 'Input = output, for total mass and for each component' },
  {
    front: 'Are total mass and total moles conserved in a chemical reaction?',
    back: 'Total mass is; total moles are not necessarily',
    extra: r`\(\mathrm{N_2 + 3H_2 \rightarrow 2NH_3}\) turns 4 mol into 2 mol, but the mass is unchanged.`,
  },
  {
    front: 'Basis of calculation',
    back: 'An amount or flow rate of one stream, such as 100 mol of feed, chosen so the balance can be solved; results are scaled afterwards',
    extra: 'With a feed composition in mole fractions, 100 mol is convenient; with mass fractions, 100 kg.',
  },
  {
    front: 'Degrees of freedom of a balance problem',
    back: 'Unknowns minus independent equations; the problem can be solved only when this is zero',
    extra: 'A positive number means more information is needed; a negative number means the problem is overspecified.',
  },
  // Stoichiometry and reactions
  {
    front: 'Stoichiometric coefficients',
    back: 'The numbers in a balanced equation that give the mole ratios in which species react and form',
    extra: r`In \(\mathrm{2SO_2 + O_2 \rightarrow 2SO_3}\), 2 mol of \(\mathrm{SO_2}\) react with 1 mol of \(\mathrm{O_2}\).`,
  },
  {
    front: 'Limiting reactant',
    back: 'The reactant present in less than its stoichiometric proportion; it would run out first, so it sets the maximum amount of product',
  },
  {
    front: 'Percent excess of a reactant',
    back: r`\(\dfrac{n_{\text{fed}} - n_{\text{stoich}}}{n_{\text{stoich}}} \times 100\%\)`,
    extra: r`\(n_{\text{stoich}}\) is the amount needed to react completely with the limiting reactant.`,
  },
  {
    front: 'Fractional conversion',
    back: r`\(X = \dfrac{\text{moles of reactant that react}}{\text{moles of reactant fed}}\)`,
    extra: 'Usually based on the limiting reactant; it runs from 0 to 1.',
  },
  {
    front: 'Extent of reaction',
    back: r`\(\xi\) in \(n_i = n_{i0} + \nu_i \xi\): one number that tracks the progress of a reaction for every species`,
    extra: r`\(\nu_i\) is the stoichiometric coefficient, negative for reactants and positive for products.`,
  },
  {
    front: 'Yield of a reaction',
    back: 'Moles of desired product formed divided by the moles that would form if the limiting reactant reacted completely with no side reactions',
    extra: 'Definitions vary: some books divide by the moles of reactant fed or consumed instead.',
  },
  {
    front: 'Selectivity',
    back: 'Moles of desired product formed per mole of undesired product formed',
    extra: 'Side reactions lower it. Some books define it per mole of reactant consumed instead.',
  },
  {
    front: 'Composition of dry air',
    back: r`About 21 mol% \(\mathrm{O_2}\) and 79 mol% \(\mathrm{N_2}\)`,
    extra: r`So each mole of \(\mathrm{O_2}\) brings about \(3.76\ \mathrm{mol}\) of \(\mathrm{N_2}\) \((79/21)\).`,
  },
  {
    front: 'Theoretical air',
    back: r`Air containing just enough oxygen to burn all the fuel completely, with all carbon going to \(\mathrm{CO_2}\) and all hydrogen to \(\mathrm{H_2O}\)`,
    extra: 'Air fed beyond this is excess air: 20% excess air means 1.2 times the theoretical amount.',
  },
  {
    front: 'Wet basis vs dry basis',
    back: 'A gas composition on a wet basis includes water vapor; on a dry basis it leaves the water out',
    extra: 'Flue gas analyzers such as the Orsat report a dry-basis composition.',
  },
  // Composition and flow
  {
    front: 'Mole fraction',
    back: r`\(x_i = \dfrac{n_i}{n_{\text{total}}}\)`,
    extra: r`Mole fractions in a mixture sum to 1. By convention \(x\) is used for liquids and \(y\) for gases.`,
  },
  {
    front: 'Mass fraction',
    back: r`\(w_i = \dfrac{m_i}{m_{\text{total}}}\)`,
    extra: 'Mass and mole fractions differ unless all the components have the same molar mass.',
  },
  {
    front: 'Average molar mass of a gas mixture',
    back: r`\(\bar{M} = \displaystyle\sum_i y_i M_i\)`,
    extra: r`For air, about \(29\ \mathrm{g/mol}\).`,
  },
  {
    front: 'Molar flow rate from mass flow rate',
    back: r`\(\dot{n} = \dfrac{\dot{m}}{M}\)`,
    extra: r`\(M\) is the molar mass, so \(36\ \mathrm{kg/h}\) of water is about \(2\ \mathrm{kmol/h}\).`,
  },
  {
    front: 'Density of liquid water',
    back: r`About \(1000\ \mathrm{kg/m^3}\), or \(1\ \mathrm{g/cm^3}\), or \(62.4\ \mathrm{lb_m/ft^3}\)`,
    extra: r`Density links mass and volumetric flow: \(\dot{m} = \rho\dot{V}\).`,
  },
  {
    front: 'Specific gravity',
    back: r`\(SG = \dfrac{\rho}{\rho_{\text{ref}}}\), usually with liquid water at 4 °C as the reference`,
    extra: 'It is dimensionless, so a liquid with SG 0.8 has a density of about 800 kg/m³.',
  },
  {
    front: 'Parts per million (ppm)',
    back: r`A fraction multiplied by \(10^6\), used for trace amounts`,
    extra: 'For gases it is normally by moles (volume); for liquids, by mass.',
  },
  // Gases, pressure and units
  {
    front: 'Ideal gas law for a flowing stream',
    back: r`\(P\dot{V} = \dot{n}RT\)`,
    extra: 'Use absolute pressure and absolute temperature. It works best at low pressure and high temperature.',
  },
  {
    front: 'Gas constant R in L·atm units',
    back: r`\(R = 0.08206\ \mathrm{L\,atm\,mol^{-1}\,K^{-1}}\)`,
    extra: r`The same as \(8.314\ \mathrm{J\,mol^{-1}\,K^{-1}}\).`,
  },
  {
    front: 'Molar volume of an ideal gas at 0 °C and 1 atm',
    back: r`\(22.4\ \mathrm{L/mol}\), or \(22.4\ \mathrm{m^3/kmol}\)`,
    extra: 'Also 359 ft³ per lb-mol. At 0 °C and 1 bar it is 22.7 L/mol.',
  },
  {
    front: 'Gauge vs absolute pressure',
    back: r`\(P_{\text{abs}} = P_{\text{gauge}} + P_{\text{atm}}\)`,
    extra:
      'Gauges read relative to the atmosphere, but gas laws need absolute pressure. Units such as psig and psia say which is meant.',
  },
  {
    front: 'One standard atmosphere in other units',
    back: r`\(101.325\ \mathrm{kPa} = 1.01325\ \mathrm{bar} = 14.696\ \mathrm{psi} = 760\ \mathrm{mmHg}\)`,
  },
  {
    front: 'Absolute temperature scales',
    back: r`\(T(\mathrm{K}) = T({}^\circ\mathrm{C}) + 273.15\) and \(T({}^\circ\mathrm{R}) = T({}^\circ\mathrm{F}) + 459.67\)`,
    extra: 'A temperature change of 1 K (or 1 °C) equals 1.8 °F (or 1.8 °R).',
  },
  {
    front: 'Pound-mole',
    back: r`The amount of a substance whose mass in pounds equals its molar mass: about \(453.6\ \mathrm{mol}\)`,
    extra: r`So 1 lb-mol of water has a mass of about \(18\ \mathrm{lb_m}\).`,
  },
  {
    front: 'Pound-force in terms of pound-mass',
    back: r`\(1\ \mathrm{lb_f} = 32.174\ \mathrm{lb_m\,ft/s^2}\)`,
    extra: r`The factor \(g_c = 32.174\ \mathrm{lb_m\,ft\,lb_f^{-1}\,s^{-2}}\) appears in equations written in US customary units.`,
  },
  {
    front: 'Dimensional homogeneity',
    back: 'Every term added or subtracted in a valid equation must have the same dimensions',
    extra: 'A quick check for errors in derived formulas and unit conversions.',
  },
  // Equipment
  {
    front: 'Pump vs compressor',
    back: 'A pump raises the pressure of a liquid; a compressor raises the pressure of a gas',
    extra: 'Fans and blowers move gases with only a small pressure rise.',
  },
  {
    front: 'Shell-and-tube heat exchanger',
    back: 'One fluid flows through a bundle of tubes and the other around them inside a shell; heat passes through the tube walls',
  },
  {
    front: 'Countercurrent vs cocurrent flow in a heat exchanger',
    back: 'Countercurrent: the fluids flow in opposite directions. Cocurrent (parallel): the same direction. Countercurrent transfers more heat for the same area',
    extra: 'Only countercurrent flow lets the cold fluid leave hotter than the hot fluid leaves.',
  },
  {
    front: 'Distillation column',
    back: 'Separates a liquid mixture by differences in volatility: the more volatile components concentrate in the vapor rising to the top',
    extra: 'The top product is the distillate; the bottom product is the bottoms.',
  },
  {
    front: 'Reboiler and condenser',
    back: 'The reboiler boils liquid at the bottom of a distillation column to make the rising vapor; the condenser liquefies the vapor at the top, and part of it returns as reflux',
  },
  {
    front: 'Flash drum',
    back: 'A vessel where a feed partly vaporizes, often after a pressure drop, and the vapor and liquid are separated',
    extra: 'With the two phases at equilibrium, it acts as a single equilibrium stage.',
  },
  {
    front: 'Decanter',
    back: 'A vessel that separates two immiscible liquids, such as oil and water, by letting them settle into layers by density',
  },
  {
    front: 'Three ideal reactor types',
    back: 'Batch reactor, continuous stirred-tank reactor (CSTR) and plug flow reactor (PFR)',
    extra: 'A CSTR is perfectly mixed, so its outlet matches its contents; a PFR has no mixing along the flow direction.',
  },
  {
    front: 'Utilities',
    back: 'Services a plant needs to run, such as steam, cooling water, electricity, fuel, compressed air and refrigeration',
  },
]

export const CHEMICAL_ENGINEERING_BASICS: PublicDeck = {
  slug: 'chemical-engineering-basics',
  title: 'Chemical engineering basics: 50 core concepts',
  shortTitle: 'Chemical engineering basics',
  category: 'engineering',
  level: 'beginner',
  icon: 'flask',
  description:
    'The first ideas in chemical engineering: mass balances, stoichiometry, conversion and yield, gas laws, pressure and units, and the main process equipment.',
  intro:
    'Chemical engineering starts with bookkeeping: what goes into a process, what comes out, and what reacts along the way. This deck covers the vocabulary and core calculations of a first course, from process diagrams and the general balance equation to stoichiometry, gases, units, and the equipment you’ll meet in every plant.',
  faq: [
    {
      q: 'What background do I need for this deck?',
      a: 'High school chemistry and algebra are enough. It matches an introduction to chemical engineering or the first half of a material and energy balances course.',
    },
    {
      q: 'What is the difference between a PFD and a P&ID?',
      a: 'A process flow diagram shows the main equipment and streams with their operating conditions. A piping and instrumentation diagram adds every pipe, valve, instrument and control loop, and is used to build and run the plant.',
    },
    {
      q: 'What comes after this deck?',
      a: 'The intermediate deck covers energy balances, recycle, phase equilibrium, distillation, fluid flow, heat transfer, kinetics, reactor design and process control.',
    },
  ],
  cards: CARDS,
}
