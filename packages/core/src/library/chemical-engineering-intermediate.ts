import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Energy balances
  {
    front: 'Steady-state energy balance on an open system',
    back: r`\(\dot{Q} - \dot{W}_s = \Delta\dot{H} + \Delta\dot{E}_k + \Delta\dot{E}_p\)`,
    extra: r`\(\dot{Q}\) is heat added to the system, \(\dot{W}_s\) shaft work done by it, and \(\Delta\) means outlet minus inlet. The kinetic and potential energy terms are often negligible.`,
  },
  {
    front: 'Enthalpy change for heating without a phase change',
    back: r`\(\Delta\hat{H} = \displaystyle\int_{T_1}^{T_2} C_p(T)\,dT\)`,
    extra: r`Exact for ideal gases and close for liquids and solids. With constant \(C_p\), \(\Delta\hat{H} = C_p\,\Delta T\).`,
  },
  {
    front: 'Heat of vaporization of water at 100 °C',
    back: r`About \(2257\ \mathrm{kJ/kg}\), or \(40.7\ \mathrm{kJ/mol}\)`,
    extra: 'A latent heat: it is absorbed at constant temperature and pressure while the phase changes.',
  },
  {
    front: 'Standard heat of reaction from heats of formation',
    back: r`\(\Delta H_r^\circ = \displaystyle\sum_i \nu_i\,\Delta H_{f,i}^\circ\)`,
    extra: r`\(\nu_i\) is positive for products and negative for reactants. The heat of formation of an element in its standard state is zero.`,
  },
  {
    front: 'Mechanical energy balance',
    back: r`\(\dfrac{\Delta P}{\rho} + \dfrac{\Delta v^2}{2} + g\,\Delta z + \hat{F} = -\dfrac{\dot{W}_s}{\dot{m}}\)`,
    extra: r`For an incompressible fluid at steady state; \(\hat{F}\) is the friction loss per unit mass. With no friction or shaft work it becomes Bernoulli’s equation.`,
  },
  // Recycle, purge and bypass
  {
    front: 'Why use recycle?',
    back: 'To send unreacted feed back to the reactor, raising overall conversion and cutting raw material use and waste',
    extra: 'Recycle also recovers solvents and catalysts.',
  },
  {
    front: 'Single-pass vs overall conversion',
    back: 'Single-pass: the fraction of reactant entering the reactor that reacts in it. Overall: the fraction of reactant fed to the whole process that reacts',
    extra: 'With unreacted feed recycled, overall conversion can be far higher than single-pass conversion.',
  },
  {
    front: 'Purge stream',
    back: 'A small stream drawn off a recycle loop to stop inert gases or impurities from building up',
    extra: 'Example: argon and methane purged from the ammonia synthesis loop. Some reactant is lost with them.',
  },
  {
    front: 'Bypass stream',
    back: 'Part of a feed that skips a process unit and rejoins its outlet, used to control the final composition or temperature',
  },
  // Phase equilibrium
  {
    front: 'Raoult’s law',
    back: r`\(y_i P = x_i P_i^{\text{sat}}(T)\)`,
    extra: r`For ideal liquid solutions with an ideal vapor; most accurate when a component is nearly pure (\(x_i\) close to 1).`,
  },
  {
    front: 'Henry’s law',
    back: r`\(y_i P = x_i H_i(T)\)`,
    extra: r`For a dilute solute (\(x_i\) close to 0), such as a sparingly soluble gas. \(H_i\) is the Henry’s law constant, in pressure units in this form.`,
  },
  {
    front: 'Antoine equation',
    back: r`\(\log_{10} P^{\text{sat}} = A - \dfrac{B}{T + C}\)`,
    extra: r`An empirical vapor pressure fit. \(A\), \(B\) and \(C\) are tabulated for each substance, for specific units and a temperature range.`,
  },
  {
    front: 'Relative volatility',
    back: r`\(\alpha_{ij} = \dfrac{y_i/x_i}{y_j/x_j}\)`,
    extra: r`Under Raoult’s law, \(\alpha_{ij} = P_i^{\text{sat}}/P_j^{\text{sat}}\). The closer it is to 1, the harder the separation by distillation.`,
  },
  {
    front: 'Bubble-point temperature',
    back: 'The temperature at which a liquid heated at constant pressure forms its first bubble of vapor',
    extra: r`For an ideal solution, solve \(\sum_i x_i P_i^{\text{sat}}(T) = P\) for \(T\).`,
  },
  {
    front: 'Dew-point temperature',
    back: 'The temperature at which a vapor cooled at constant pressure forms its first drop of liquid',
    extra: r`For an ideal solution, solve \(\sum_i \dfrac{y_i P}{P_i^{\text{sat}}(T)} = 1\) for \(T\).`,
  },
  {
    front: 'Azeotrope',
    back: 'A mixture whose equilibrium vapor has the same composition as the liquid, so ordinary distillation can’t separate it further',
    extra: 'Ethanol and water form one at about 95.6 wt% ethanol at 1 atm.',
  },
  // Distillation
  {
    front: 'Reflux ratio',
    back: r`\(R = \dfrac{L}{D}\): the liquid returned to the column per unit of distillate withdrawn`,
  },
  {
    front: 'Effect of raising the reflux ratio',
    back: 'Fewer stages are needed for the same separation, but reboiler and condenser duties, and so energy costs, rise',
    extra: 'The optimum balances the column’s capital cost against its energy cost.',
  },
  {
    front: 'Constant molar overflow',
    back: 'The McCabe–Thiele assumption that the liquid and vapor molar flows are constant within each section of the column',
    extra: 'It holds when the components have similar molar heats of vaporization and heat losses are small.',
  },
  {
    front: 'Rectifying-section operating line',
    back: r`\(y_{n+1} = \dfrac{R}{R + 1}\,x_n + \dfrac{x_D}{R + 1}\)`,
    extra: r`It crosses the diagonal \(y = x\) at \(x_D\), the distillate composition.`,
  },
  {
    front: 'Feed line (q-line)',
    back: r`\(y = \dfrac{q}{q - 1}\,x - \dfrac{z_F}{q - 1}\)`,
    extra: r`For a two-phase feed, \(q\) is its liquid fraction. A saturated liquid feed (\(q = 1\)) gives a vertical line; a saturated vapor (\(q = 0\)), a horizontal one.`,
  },
  {
    front: 'Counting stages in a McCabe–Thiele diagram',
    back: 'Step between the equilibrium curve and the operating lines from one end of the column to the other; each step is one equilibrium stage',
    extra: 'A partial reboiler counts as one equilibrium stage.',
  },
  // Absorption and extraction
  {
    front: 'Gas absorption vs stripping',
    back: 'Absorption transfers a component from a gas into a liquid solvent; stripping (desorption) transfers it from a liquid into a gas',
    extra: r`Example: removing \(\mathrm{CO_2}\) from natural gas with an amine solution.`,
  },
  {
    front: 'Absorption factor',
    back: r`\(A = \dfrac{L}{mV}\)`,
    extra: r`\(L\) and \(V\) are the liquid and gas molar flows, \(m\) the slope of the equilibrium line. With \(A > 1\), enough stages can absorb nearly all of the solute.`,
  },
  {
    front: 'Liquid–liquid extraction',
    back: 'Moves a solute from one liquid into an immiscible solvent in which it is more soluble',
    extra: 'The solvent-rich product is the extract; the treated feed left behind is the raffinate.',
  },
  {
    front: 'Distribution coefficient in extraction',
    back: r`\(K_D = \dfrac{y}{x}\) at equilibrium`,
    extra: r`\(y\) is the solute concentration in the extract phase and \(x\) in the raffinate phase. A larger \(K_D\) means less solvent is needed.`,
  },
  // Fluid flow
  {
    front: 'Reynolds number for pipe flow',
    back: r`\(Re = \dfrac{\rho v D}{\mu}\)`,
    extra: 'Flow is laminar below about 2100, turbulent above about 4000, and transitional in between.',
  },
  {
    front: 'Darcy–Weisbach equation',
    back: r`\(h_f = f_D\,\dfrac{L}{D}\,\dfrac{v^2}{2g}\)`,
    extra: r`\(f_D\) is the Darcy friction factor, read from the Moody chart or the Colebrook equation. The Fanning factor is \(f_F = f_D/4\).`,
  },
  {
    front: 'Friction factor in laminar pipe flow',
    back: r`\(f_D = \dfrac{64}{Re}\), or in Fanning form \(f_F = \dfrac{16}{Re}\)`,
    extra: 'In laminar flow it doesn’t depend on pipe roughness.',
  },
  {
    front: 'Pump operating point',
    back: 'Where the pump curve (head delivered vs flow) crosses the system curve (head the piping needs vs flow)',
    extra: 'Closing a valve steepens the system curve and moves the operating point to a lower flow.',
  },
  {
    front: 'Net positive suction head (NPSH)',
    back: 'The NPSH available at the pump suction must exceed the NPSH the pump requires, or the liquid boils and the pump cavitates',
    extra: 'NPSH available is the absolute suction head above the liquid’s vapor pressure head. Cavitation erodes the impeller.',
  },
  {
    front: 'Pump affinity laws for a change in speed',
    back: r`\(Q \propto N\), \(\;H \propto N^2\), \(\;P \propto N^3\)`,
    extra: r`Flow, head and power against rotational speed \(N\), for the same impeller.`,
  },
  {
    front: 'Minor loss through a valve or fitting',
    back: r`\(h_L = K\,\dfrac{v^2}{2g}\)`,
    extra: r`\(K\) is the fitting’s loss coefficient. Losses can also be given as an equivalent length of straight pipe.`,
  },
  // Heat transfer
  {
    front: 'Log mean temperature difference (LMTD)',
    back: r`\(\Delta T_{\text{lm}} = \dfrac{\Delta T_1 - \Delta T_2}{\ln(\Delta T_1/\Delta T_2)}\)`,
    extra: r`\(\Delta T_1\) and \(\Delta T_2\) are the hot-to-cold temperature differences at the two ends of the exchanger.`,
  },
  {
    front: 'Heat exchanger design equation',
    back: r`\(Q = UA\,\Delta T_{\text{lm}}\)`,
    extra: r`For multipass or crossflow exchangers, multiply \(\Delta T_{\text{lm}}\) by a correction factor \(F \le 1\).`,
  },
  {
    front: 'Overall heat transfer coefficient for a thin flat wall',
    back: r`\(\dfrac{1}{U} = \dfrac{1}{h_i} + \dfrac{\Delta x}{k_w} + \dfrac{1}{h_o}\)`,
    extra: r`Resistances in series: inside film, wall (thickness \(\Delta x\), conductivity \(k_w\)) and outside film. For tubes, each term is scaled by its area.`,
  },
  {
    front: 'Fouling',
    back: 'Deposits such as scale, corrosion products or biological growth on heat transfer surfaces, which add thermal resistance and lower U',
    extra: r`Designers add fouling resistances \(R_f\) to \(1/U\), which makes the exchanger larger.`,
  },
  // Reaction kinetics
  {
    front: 'Power-law rate law and reaction order',
    back: r`\(-r_A = k\,C_A^{\alpha} C_B^{\beta}\); the overall order is \(\alpha + \beta\)`,
    extra: 'Orders are found by experiment; for an elementary reaction they equal the stoichiometric coefficients.',
  },
  {
    front: 'Arrhenius equation',
    back: r`\(k = A\,e^{-E_a/RT}\)`,
    extra: r`\(A\) is the pre-exponential factor and \(E_a\) the activation energy. A plot of \(\ln k\) against \(1/T\) has slope \(-E_a/R\).`,
  },
  {
    front: 'Integrated first-order rate law at constant volume',
    back: r`\(\ln\dfrac{C_{A0}}{C_A} = kt\)`,
    extra: r`The half-life, \(t_{1/2} = \dfrac{\ln 2}{k}\), doesn’t depend on the starting concentration.`,
  },
  {
    front: 'Units of the rate constant for an nth-order reaction',
    back: r`\((\text{concentration})^{1-n}\,(\text{time})^{-1}\)`,
    extra: r`First order: \(\mathrm{s^{-1}}\). Second order: \(\mathrm{L\,mol^{-1}\,s^{-1}}\).`,
  },
  // Ideal reactors
  {
    front: 'Batch reactor design equation',
    back: r`\(N_{A0}\,\dfrac{dX}{dt} = -r_A V\)`,
    extra: r`\(N_{A0}\) is the initial moles of A and \(X\) its conversion. Integrating gives the time to reach a given conversion.`,
  },
  {
    front: 'CSTR design equation',
    back: r`\(V = \dfrac{F_{A0}\,X}{-r_A}\)`,
    extra: 'The rate is evaluated at the exit conditions, since a perfectly mixed tank has the exit composition throughout.',
  },
  {
    front: 'PFR design equation',
    back: r`\(V = F_{A0}\displaystyle\int_0^X \dfrac{dX}{-r_A}\)`,
    extra: r`From the differential form \(F_{A0}\,\dfrac{dX}{dV} = -r_A\).`,
  },
  {
    front: 'Space time',
    back: r`\(\tau = \dfrac{V}{v_0}\)`,
    extra: r`Reactor volume divided by the entering volumetric flow rate \(v_0\). It equals the mean residence time when the volumetric flow is constant.`,
  },
  {
    front: 'CSTR vs PFR volume for a positive-order reaction',
    back: 'A PFR needs less volume for the same conversion, because a CSTR runs entirely at the low exit concentration',
    extra: 'Several CSTRs in series approach the volume of a PFR.',
  },
  // Process control
  {
    front: 'Feedback control',
    back: 'Measure the controlled variable, compare it with the set point, and adjust a manipulated variable to reduce the error',
    extra: 'It can only correct a disturbance after it has affected the process.',
  },
  {
    front: 'PID control law',
    back: r`\[u(t) = \bar{u} + K_c\left[e(t) + \frac{1}{\tau_I}\int_0^t e(t')\,dt' + \tau_D\,\frac{de}{dt}\right]\]`,
    extra: r`\(e\) is the error (set point minus measurement), \(K_c\) the controller gain, \(\tau_I\) the integral (reset) time, \(\tau_D\) the derivative time and \(\bar{u}\) the bias.`,
  },
  {
    front: 'Offset in proportional-only control',
    back: 'A steady-state error that remains after a set-point change or sustained disturbance; integral action removes it',
    extra: 'A higher proportional gain shrinks the offset but can make the loop oscillate.',
  },
  {
    front: 'Controlled, manipulated and disturbance variables',
    back: 'Controlled: what is held at a set point. Manipulated: what the controller adjusts. Disturbance: an input that is not adjusted but upsets the process',
    extra: 'Example: a tank’s temperature is controlled by adjusting steam flow, while the feed temperature is a disturbance.',
  },
]

export const CHEMICAL_ENGINEERING_INTERMEDIATE: PublicDeck = {
  slug: 'chemical-engineering-intermediate',
  title: 'Intermediate chemical engineering: 50 equations and principles',
  shortTitle: 'Intermediate chemical engineering',
  category: 'engineering',
  level: 'intermediate',
  icon: 'flask',
  description:
    'The core chemical engineering courses: energy balances, phase equilibrium, distillation, fluid flow, heat transfer, kinetics, reactor design and control.',
  intro:
    'The middle years of a chemical engineering degree build the toolkit for process design. This deck drills the equations and ideas from those core courses: energy balances and recycle loops, vapor–liquid equilibrium and McCabe–Thiele distillation, pipe flow and pumps, heat exchangers, rate laws, ideal reactor design and feedback control.',
  faq: [
    {
      q: 'Which courses does this deck cover?',
      a: 'Material and energy balances, thermodynamics, separations, fluid mechanics, heat transfer, reaction engineering and an introduction to process control, as in a typical second- and third-year curriculum.',
    },
    {
      q: 'Does it use the Darcy or the Fanning friction factor?',
      a: 'The Darcy factor, which is four times the Fanning factor. The cards give both where it matters, so check which one your textbook and charts use.',
    },
    {
      q: 'Why are the reactor design equations written in terms of conversion?',
      a: 'The conversion of one reactant describes the progress of the reaction with a single variable, which makes it easy to compare reactor types and to chain reactors in series.',
    },
  ],
  cards: CARDS,
}
