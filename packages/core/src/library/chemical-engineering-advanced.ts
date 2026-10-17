import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Reactor design
  {
    front: 'Levenspiel plot',
    back: r`A plot of \(\dfrac{F_{A0}}{-r_A}\) against conversion \(X\)`,
    extra:
      'A PFR’s volume is the area under the curve; a CSTR’s is the rectangle whose height is the curve’s value at the exit conversion.',
  },
  {
    front: 'Residence time distribution function E(t)',
    back: r`\(E(t)\,dt\) is the fraction of the fluid leaving a reactor that spent between \(t\) and \(t + dt\) inside it`,
    extra: r`\(\displaystyle\int_0^\infty E(t)\,dt = 1\). It is measured with a pulse or step tracer test.`,
  },
  {
    front: 'E(t) for an ideal CSTR and an ideal PFR',
    back: r`CSTR: \(E(t) = \dfrac{1}{\tau}e^{-t/\tau}\). PFR: \(E(t) = \delta(t - \tau)\)`,
    extra: r`Every fluid element spends exactly \(\tau\) in a PFR, while a CSTR has a broad exponential spread.`,
  },
  {
    front: 'Damköhler number',
    back: r`The ratio of reaction rate to convective transport rate; for a first-order reaction, \(Da = k\tau\)`,
    extra: r`For order \(n\), \(Da = k\,C_{A0}^{\,n-1}\tau\). In a first-order CSTR, \(X = \dfrac{Da}{1 + Da}\).`,
  },
  {
    front: 'Parallel reactions: choosing the reactant concentration',
    back: r`If the desired reaction has the higher order in A, keep \(C_A\) high; if it has the lower order, keep \(C_A\) low`,
    extra: r`Instantaneous selectivity \(S_{D/U} = \dfrac{k_D}{k_U}\,C_A^{\alpha_D - \alpha_U}\). High \(C_A\): batch reactor or PFR. Low \(C_A\): CSTR or diluted feed.`,
  },
  {
    front: r`Series reactions \(A \rightarrow B \rightarrow C\): time for maximum \(B\)`,
    back: r`\(\tau_{\text{opt}} = \dfrac{\ln(k_2/k_1)}{k_2 - k_1}\)`,
    extra: 'For first-order steps in a batch reactor or PFR. After this time, B is consumed faster than it forms.',
  },
  {
    front: 'Adiabatic reactor: conversion from the energy balance',
    back: r`\(X = \dfrac{\sum_i \Theta_i C_{p,i}\,(T - T_0)}{-\Delta H_{\text{Rx}}}\)`,
    extra: r`\(\Theta_i = F_{i0}/F_{A0}\), assuming \(\Delta C_p \approx 0\). For an exothermic reaction, temperature rises linearly with conversion.`,
  },
  {
    front: 'Multiple steady states in a CSTR',
    back: 'The S-shaped heat-generation curve can cross the straight heat-removal line up to three times; the middle steady state is unstable',
    extra: 'The upper and lower states are stable, so the reactor can ignite or extinguish as the feed temperature changes.',
  },
  {
    front: 'Thiele modulus',
    back: r`\(\phi = L\sqrt{\dfrac{k}{D_e}}\) for a first-order reaction in a catalyst pellet`,
    extra: r`Its square compares the reaction rate to the diffusion rate. \(L\) is a characteristic length (the half-thickness of a slab), \(k\) a volume-based rate constant, \(D_e\) the effective diffusivity.`,
  },
  {
    front: 'Internal effectiveness factor',
    back: 'The actual reaction rate in a catalyst pellet divided by the rate if the whole interior were at the surface concentration and temperature',
    extra: r`For a first-order reaction in a slab, \(\eta = \dfrac{\tanh\phi}{\phi}\): near 1 for small \(\phi\), about \(1/\phi\) for large \(\phi\).`,
  },
  // Transport phenomena
  {
    front: 'Fick’s first law',
    back: r`\(J_A = -D_{AB}\,\dfrac{dC_A}{dz}\)`,
    extra: r`\(J_A\) is the molar diffusion flux and \(D_{AB}\) the binary diffusivity, in \(\mathrm{m^2/s}\).`,
  },
  {
    front: 'Prandtl number',
    back: r`\(Pr = \dfrac{c_p\mu}{k} = \dfrac{\nu}{\alpha}\)`,
    extra: r`Momentum diffusivity over thermal diffusivity. About \(0.7\) for air and \(7\) for water at room temperature.`,
  },
  {
    front: 'Schmidt number',
    back: r`\(Sc = \dfrac{\mu}{\rho D_{AB}} = \dfrac{\nu}{D_{AB}}\)`,
    extra: r`Momentum diffusivity over mass diffusivity. Of order 1 for gases and around \(10^3\) for liquids.`,
  },
  {
    front: 'Nusselt number',
    back: r`\(Nu = \dfrac{hL}{k}\)`,
    extra: r`Convective over conductive heat transfer; \(k\) is the fluid’s thermal conductivity, not the wall’s.`,
  },
  {
    front: 'Sherwood number',
    back: r`\(Sh = \dfrac{k_c L}{D_{AB}}\)`,
    extra: r`The mass transfer counterpart of the Nusselt number; \(k_c\) is the mass transfer coefficient.`,
  },
  {
    front: 'Dittus–Boelter equation',
    back: r`\(Nu = 0.023\,Re^{0.8}\,Pr^{n}\)`,
    extra: r`\(n = 0.4\) when the fluid is heated and \(0.3\) when it is cooled. For fully developed turbulent pipe flow with \(Re > 10^4\) and \(0.6 < Pr < 160\).`,
  },
  {
    front: 'Chilton–Colburn analogy',
    back: r`\(j_H = j_D = \dfrac{f_F}{2}\), with \(j_H = \dfrac{Nu}{Re\,Pr^{1/3}}\) and \(j_D = \dfrac{Sh}{Re\,Sc^{1/3}}\)`,
    extra: r`So a heat transfer correlation gives a mass transfer one by swapping \(Nu\) for \(Sh\) and \(Pr\) for \(Sc\). The link to the Fanning friction factor \(f_F\) holds only without form drag.`,
  },
  {
    front: 'Two-film theory: overall gas-phase coefficient',
    back: r`\(\dfrac{1}{K_y} = \dfrac{1}{k_y} + \dfrac{m}{k_x}\)`,
    extra: r`Gas- and liquid-film resistances add in series; \(m\) is the slope of the equilibrium line. For a very soluble gas (small \(m\)), the gas film controls.`,
  },
  // Thermodynamics
  {
    front: 'Fugacity coefficient',
    back: r`\(\phi = \dfrac{f}{P}\)`,
    extra: r`Fugacity \(f\) is an effective pressure for a real fluid; \(\phi = 1\) for an ideal gas and \(\phi \to 1\) as \(P \to 0\).`,
  },
  {
    front: 'Criterion for phase equilibrium',
    back: r`At the same \(T\) and \(P\), each component’s fugacity is equal in every phase: \(\hat{f}_i^{\,\alpha} = \hat{f}_i^{\,\beta}\)`,
    extra: 'Equivalent to equal chemical potentials.',
  },
  {
    front: 'Activity coefficient',
    back: r`\(\gamma_i = \dfrac{\hat{f}_i}{x_i f_i}\)`,
    extra: r`It measures the departure from an ideal solution, where \(\gamma_i = 1\). \(f_i\) is the pure-component fugacity at the same \(T\) and \(P\).`,
  },
  {
    front: 'Modified Raoult’s law',
    back: r`\(y_i P = x_i \gamma_i P_i^{\text{sat}}\)`,
    extra: 'For nonideal liquids with an ideal vapor phase, at low to moderate pressure.',
  },
  {
    front: 'Equilibrium constant from the standard Gibbs energy',
    back: r`\(\Delta G^\circ = -RT\ln K\)`,
    extra: r`\(\Delta G^\circ\) is the standard Gibbs energy change of reaction at temperature \(T\).`,
  },
  {
    front: 'Van ’t Hoff equation',
    back: r`\(\dfrac{d\ln K}{dT} = \dfrac{\Delta H^\circ}{RT^2}\)`,
    extra: r`So \(K\) falls with temperature for an exothermic reaction (\(\Delta H^\circ < 0\)) and rises for an endothermic one.`,
  },
  {
    front: 'Gibbs energy minimization',
    back: 'At fixed temperature and pressure, the equilibrium composition minimizes the total Gibbs energy, subject to element balances',
    extra: 'Solved with Lagrange multipliers; it needs the list of species present, not a set of independent reactions.',
  },
  // Separations
  {
    front: 'Fenske equation',
    back: r`\[N_{\min} = \frac{\ln\left[\dfrac{x_D}{1 - x_D}\cdot\dfrac{1 - x_B}{x_B}\right]}{\ln\alpha}\]`,
    extra: r`The minimum number of equilibrium stages, at total reflux, for a binary with constant relative volatility \(\alpha\). For multicomponent mixtures, apply it to the key components.`,
  },
  {
    front: 'Minimum reflux ratio',
    back: 'The lowest reflux ratio that can achieve the separation: an operating line touches the equilibrium curve (a pinch), so infinitely many stages are needed',
    extra: r`Columns typically run at about 1.1 to 1.5 times \(R_{\min}\).`,
  },
  {
    front: 'Underwood equations',
    back: r`\[\sum_i \frac{\alpha_i z_i}{\alpha_i - \theta} = 1 - q, \qquad R_{\min} + 1 = \sum_i \frac{\alpha_i x_{i,D}}{\alpha_i - \theta}\]`,
    extra: r`They give the minimum reflux ratio for multicomponent distillation. \(\theta\) is the root that lies between the relative volatilities of the two keys.`,
  },
  {
    front: 'Gilliland correlation',
    back: r`An empirical link between the actual number of stages \(N\) and the reflux ratio \(R\), given \(N_{\min}\) and \(R_{\min}\)`,
    extra: r`It plots \(\dfrac{N - N_{\min}}{N + 1}\) against \(\dfrac{R - R_{\min}}{R + 1}\). It is the last step of the Fenske–Underwood–Gilliland shortcut method.`,
  },
  {
    front: 'Light key and heavy key',
    back: 'In multicomponent distillation, the two components whose split is specified: the light key goes mostly to the distillate, the heavy key mostly to the bottoms',
    extra:
      'Components lighter than the light key usually end up almost entirely in the distillate, and heavier ones in the bottoms.',
  },
  {
    front: 'HETP',
    back: 'Height equivalent to a theoretical plate: the height of packing that gives the same separation as one equilibrium stage',
    extra: r`The packed height is \(Z = N \times \mathrm{HETP}\).`,
  },
  {
    front: 'Height of a packed absorber from transfer units',
    back: r`\(Z = H_{OG}\,N_{OG}\)`,
    extra: r`\(H_{OG}\) is the height of a transfer unit (how effective the packing is) and \(N_{OG}\) the number of transfer units (how hard the separation is), both on an overall gas basis.`,
  },
  {
    front: 'Ideal selectivity of a gas separation membrane',
    back: r`\(\alpha_{AB} = \dfrac{P_A}{P_B}\), the ratio of the two gases’ permeabilities`,
    extra:
      'In the solution–diffusion model, each permeability is the gas’s solubility in the membrane times its diffusivity through it.',
  },
  // Process control
  {
    front: 'Transfer function',
    back: r`\(G(s) = \dfrac{Y(s)}{U(s)}\): the Laplace transform of the output over that of the input, in deviation variables with zero initial conditions`,
  },
  {
    front: 'First-order transfer function',
    back: r`\(G(s) = \dfrac{K}{\tau s + 1}\)`,
    extra: r`\(K\) is the steady-state gain and \(\tau\) the time constant. After a step input, the output reaches 63.2% of its final change at \(t = \tau\).`,
  },
  {
    front: 'First-order plus dead time (FOPDT) model',
    back: r`\(G(s) = \dfrac{K e^{-\theta s}}{\tau s + 1}\)`,
    extra: r`Dead time \(\theta\) is a pure delay before the output starts to respond. It adds phase lag and limits how tightly a loop can be tuned.`,
  },
  {
    front: 'Stability of a closed-loop system',
    back: r`Stable if every root of the characteristic equation \(1 + G_{OL}(s) = 0\) has a negative real part`,
    extra: r`A root in the right half of the \(s\)-plane gives a response that grows without bound. The Routh array tests this without finding the roots.`,
  },
  {
    front: 'Cascade control',
    back: 'A primary (master) controller sets the set point of a secondary (slave) controller on a faster inner loop',
    extra: 'The inner loop corrects disturbances, such as swings in steam pressure, before they reach the primary variable.',
  },
  {
    front: 'Feedforward control',
    back: 'Measures a disturbance and adjusts the manipulated variable before the disturbance affects the controlled variable',
    extra: r`Ideally \(G_f = -\dfrac{G_d}{G_p}\), ignoring sensor and valve dynamics. It is usually combined with feedback to correct for model errors.`,
  },
  // Process safety
  {
    front: 'HAZOP',
    back: 'Hazard and operability study: a team works through the P&IDs node by node, applying guide words such as no, more, less and reverse to parameters like flow and pressure to find hazardous deviations',
    extra: 'For each deviation the team records causes, consequences, safeguards and actions.',
  },
  {
    front: 'LOPA',
    back: 'Layer of protection analysis: multiplies the frequency of an initiating event by the failure probability of each independent protection layer, then compares the result with a tolerable risk',
    extra: r`\(f_{\text{mitigated}} = f_{\text{initiating}} \times \prod_j \mathrm{PFD}_j\), where PFD is the probability of failure on demand.`,
  },
  {
    front: 'Relief valve vs rupture disc',
    back: 'A spring-loaded relief valve opens at its set pressure and recloses when the pressure falls; a rupture disc bursts once and stays open',
    extra: 'A rupture disc is sometimes fitted upstream of a relief valve to protect it from a corrosive process fluid.',
  },
  {
    front: 'Maximum accumulation for a single relief valve (ASME Section VIII)',
    back: '10% above the maximum allowable working pressure (MAWP)',
    extra: '16% when several relief devices protect the vessel, and 21% for fire exposure.',
  },
  {
    front: 'Flammability limits (LFL and UFL)',
    back: 'The lowest and highest concentrations of a fuel in air that can propagate a flame; outside them the mixture is too lean or too rich to burn',
    extra: 'Methane: about 5 to 15 vol% in air.',
  },
  {
    front: 'Limiting oxygen concentration (LOC)',
    back: 'The oxygen concentration below which combustion is impossible, whatever the fuel concentration',
    extra: 'Inerting with nitrogen or carbon dioxide keeps the oxygen below it, with a safety margin.',
  },
  {
    front: 'Inherently safer design',
    back: 'Removing or reducing hazards instead of controlling them: minimize (intensify), substitute, moderate (attenuate) and simplify',
    extra: 'Example: storing less of a toxic intermediate, or making it only as it is needed.',
  },
  // Economics
  {
    front: 'CAPEX vs OPEX',
    back: 'CAPEX: the one-time capital spent to build or buy a plant. OPEX: the recurring cost of running it, such as raw materials, utilities, labor and maintenance',
  },
  {
    front: 'Net present value (NPV)',
    back: r`\(\mathrm{NPV} = \displaystyle\sum_{t=0}^{n} \frac{CF_t}{(1 + i)^t}\)`,
    extra: r`\(CF_t\) is the cash flow in year \(t\) (negative for investment) and \(i\) the discount rate. A project adds value if \(\mathrm{NPV} > 0\).`,
  },
  {
    front: 'Internal rate of return (IRR)',
    back: 'The discount rate at which a project’s NPV is zero',
    extra: 'A project is attractive if its IRR exceeds the company’s minimum acceptable rate of return.',
  },
  {
    front: 'Six-tenths rule',
    back: r`\(C_2 = C_1\left(\dfrac{S_2}{S_1}\right)^{0.6}\)`,
    extra: r`Scales the cost \(C\) of equipment or a plant to a different capacity \(S\). The exponent varies by equipment type; 0.6 is a typical average.`,
  },
]

export const CHEMICAL_ENGINEERING_ADVANCED: PublicDeck = {
  slug: 'chemical-engineering-advanced',
  title: 'Advanced chemical engineering: 50 concepts for design and practice',
  shortTitle: 'Advanced chemical engineering',
  category: 'engineering',
  level: 'advanced',
  icon: 'flask',
  description:
    'Upper-level chemical engineering: reactor design, transport analogies, phase and reaction equilibrium, shortcut distillation, control, safety and economics.',
  intro:
    'This deck picks up where the core courses stop. It covers nonideal and catalytic reactors, dimensionless groups and transport analogies, fugacity and activity coefficients, shortcut methods for multicomponent distillation, process dynamics in the Laplace domain, and the safety and economic tools of professional practice.',
  faq: [
    {
      q: 'Who is this deck for?',
      a: 'Senior undergraduates, graduate students and practicing engineers who want the key results of reactor design, transport phenomena, thermodynamics, separations, control, safety and economics at their fingertips.',
    },
    {
      q: 'What is the Fenske–Underwood–Gilliland method?',
      a: 'A shortcut for sizing a distillation column: the Fenske equation gives the minimum number of stages, the Underwood equations the minimum reflux ratio, and the Gilliland correlation the actual number of stages at a chosen reflux ratio.',
    },
    {
      q: 'Are the safety cards enough for process safety work?',
      a: 'No. They cover the core vocabulary and numbers, but real hazard studies and relief sizing follow codes and standards such as ASME and API, and need trained, experienced teams.',
    },
  ],
  cards: CARDS,
}
