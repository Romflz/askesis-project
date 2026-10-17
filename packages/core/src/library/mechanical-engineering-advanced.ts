import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Fracture mechanics
  {
    front: 'Mode I stress intensity factor',
    back: r`\(K_I = Y\sigma\sqrt{\pi a}\)`,
    extra: r`\(Y\) is a geometry factor: 1 for a central crack of length \(2a\) in a wide plate. \(K\) is in \(\mathrm{MPa\sqrt{m}}\).`,
  },
  {
    front: 'Plane-strain fracture toughness',
    back: r`The critical value \(K_{Ic}\) of the mode I stress intensity factor: a crack grows unstably once \(K_I \ge K_{Ic}\)`,
    extra: r`A valid ASTM E399 test needs a thickness and crack length of at least \(2.5\left(\dfrac{K_{Ic}}{\sigma_y}\right)^2\).`,
  },
  {
    front: 'The three crack loading modes',
    back: 'Mode I: opening, with tension normal to the crack. Mode II: in-plane shear (sliding). Mode III: out-of-plane shear (tearing)',
  },
  {
    front: 'J-integral',
    back: 'A path-independent contour integral around a crack tip that gives the energy release rate, extending fracture mechanics to elastic–plastic materials',
    extra: r`For linear-elastic behavior \(J = G = K^2/E'\), with \(E' = E\) in plane stress and \(E/(1 - \nu^2)\) in plane strain.`,
  },
  {
    front: 'Paris law',
    back: r`\(\dfrac{da}{dN} = C\,(\Delta K)^m\)`,
    extra: r`Fatigue crack growth per cycle in the stable middle region; \(\Delta K = K_{\max} - K_{\min}\), and \(m\) is typically 2 to 4 for metals.`,
  },
  // Fatigue
  {
    front: 'S–N curve',
    back: 'A plot of stress amplitude against the number of cycles to failure, usually on log axes',
    extra: r`Steels often level off at an endurance limit after about \(10^6\) to \(10^7\) cycles; aluminium alloys have no true endurance limit.`,
  },
  {
    front: 'Alternating and mean stress',
    back: r`\(\sigma_a = \dfrac{\sigma_{\max} - \sigma_{\min}}{2}\), \(\sigma_m = \dfrac{\sigma_{\max} + \sigma_{\min}}{2}\)`,
    extra: r`The stress ratio is \(R = \sigma_{\min}/\sigma_{\max}\): \(-1\) for fully reversed loading, 0 for zero-to-maximum.`,
  },
  {
    front: 'Goodman criterion for fatigue with a mean stress',
    back: r`\(\dfrac{\sigma_a}{S_e} + \dfrac{\sigma_m}{S_{ut}} = \dfrac{1}{n}\)`,
    extra: r`For tensile mean stress. Soderberg uses \(S_y\) in place of \(S_{ut}\) and is more conservative; the Gerber parabola is less conservative.`,
  },
  {
    front: 'Miner’s rule',
    back: r`Failure is predicted when \(\displaystyle\sum \dfrac{n_i}{N_i} = 1\)`,
    extra: r`\(n_i\) is the number of cycles applied at stress level \(i\) and \(N_i\) the life at that level. It ignores the order of the loads.`,
  },
  {
    front: 'Fatigue stress concentration factor',
    back: r`\(K_f = 1 + q\,(K_t - 1)\)`,
    extra: r`\(q\) is the notch sensitivity, from 0 (the notch has no effect) to 1 (\(K_f = K_t\)).`,
  },
  // Finite element analysis
  {
    front: 'Stiffness matrix of a two-node bar element',
    back: r`\(\dfrac{AE}{L}\begin{bmatrix} 1 & -1 \\ -1 & 1 \end{bmatrix}\)`,
    extra:
      'It relates nodal forces to nodal displacements. The assembled global matrix is singular until supports stop rigid-body motion.',
  },
  {
    front: 'h- vs p-refinement',
    back: 'h-refinement uses smaller elements; p-refinement raises the polynomial order of the elements’ shape functions',
    extra: 'A mesh convergence study refines until the results of interest stop changing.',
  },
  {
    front: 'Shear locking',
    back: 'Excessive bending stiffness in fully integrated linear elements, which can’t bend without spurious shear strain',
    extra: 'Cures include reduced integration, incompatible-mode elements and quadratic elements.',
  },
  {
    front: 'Stress at a sharp re-entrant corner in a linear-elastic FE model',
    back: 'A singularity: the computed peak stress keeps rising as the mesh is refined, so it has no meaning',
    extra: 'Model the real fillet radius, or judge the stress away from the corner.',
  },
  {
    front: 'Explicit vs implicit time integration',
    back: 'Explicit methods are only conditionally stable, so the time step is limited by the smallest element; implicit methods can be unconditionally stable but solve a system of equations every step',
    extra: 'Explicit suits short, violent events like crashes and impacts; implicit suits slower dynamics.',
  },
  // CFD and turbulence
  {
    front: 'Reynolds-averaged Navier–Stokes (RANS)',
    back: 'The flow equations averaged after splitting each flow variable into a mean and a fluctuation; the leftover Reynolds stresses need a turbulence model',
    extra: r`The Reynolds stress tensor is \(-\rho\,\overline{u_i' u_j'}\). Having to model it is the closure problem.`,
  },
  {
    front: 'Boussinesq eddy-viscosity hypothesis',
    back: 'Reynolds stresses are modeled as proportional to the mean strain rate, through a turbulent (eddy) viscosity',
    extra: r`\(-\rho\,\overline{u_i' u_j'} = \mu_t\left(\dfrac{\partial \bar{u}_i}{\partial x_j} + \dfrac{\partial \bar{u}_j}{\partial x_i}\right) - \tfrac{2}{3}\rho k\,\delta_{ij}\), where \(k\) is the turbulent kinetic energy.`,
  },
  {
    front: 'k–ε vs k–ω SST turbulence models',
    back: 'Standard k–ε is robust in free shear flows but poor near walls and in adverse pressure gradients; SST uses k–ω near walls and blends to k–ε away from them',
    extra: 'SST generally predicts flow separation better.',
  },
  {
    front: r`Dimensionless wall distance \(y^+\)`,
    back: r`\(y^+ = \dfrac{y\,u_\tau}{\nu}\), with friction velocity \(u_\tau = \sqrt{\tau_w/\rho}\)`,
    extra: r`Resolving the viscous sublayer needs the first cell at \(y^+ \approx 1\); wall functions expect roughly \(30 < y^+ < 300\).`,
  },
  {
    front: 'DNS vs LES',
    back: 'DNS resolves every turbulent scale down to the Kolmogorov scale; LES resolves the large eddies and models only the small, subgrid scales',
    extra: r`DNS cost grows roughly as \(\mathrm{Re}^3\), which limits it to low Reynolds numbers.`,
  },
  // Turbomachinery
  {
    front: 'Euler turbomachinery equation',
    back: r`\(w = U_2 V_{\theta 2} - U_1 V_{\theta 1}\)`,
    extra: r`Work per unit mass done on the fluid by a pump or compressor rotor. \(U\) is the blade speed and \(V_\theta\) the swirl component of absolute velocity. For a turbine the sign reverses.`,
  },
  {
    front: 'Pump affinity laws for a fixed impeller diameter',
    back: r`\(Q \propto N\), \(H \propto N^2\), \(P \propto N^3\)`,
    extra: r`\(N\) is the rotational speed, so cutting speed by 20% roughly halves the power.`,
  },
  {
    front: 'Pump specific speed',
    back: r`\(N_s = \dfrac{N\sqrt{Q}}{H^{3/4}}\)`,
    extra:
      'Taken at the best efficiency point. Low values suit radial (centrifugal) impellers; high values suit mixed-flow and axial ones.',
  },
  {
    front: 'Condition for avoiding pump cavitation',
    back: 'The net positive suction head available (NPSHa) must exceed the NPSH required by the pump',
    extra: r`\(\mathrm{NPSH_a} = \dfrac{p_{\text{in}} - p_v}{\rho g} + \dfrac{V^2}{2g}\), with the absolute inlet pressure \(p_{\text{in}}\) and the liquid’s vapor pressure \(p_v\).`,
  },
  // Compressible flow
  {
    front: 'Stagnation temperature of an ideal gas',
    back: r`\(\dfrac{T_0}{T} = 1 + \dfrac{\gamma - 1}{2}M^2\)`,
    extra: r`\(M = V/a\), with the speed of sound \(a = \sqrt{\gamma R T}\).`,
  },
  {
    front: 'Area–velocity relation for isentropic flow',
    back: r`\(\dfrac{dA}{A} = (M^2 - 1)\dfrac{dV}{V}\)`,
    extra:
      'Subsonic flow speeds up in a converging duct, supersonic flow in a diverging one, hence the converging–diverging nozzle.',
  },
  {
    front: 'Choked flow',
    back: 'Once a nozzle’s throat reaches Mach 1, lowering the back pressure no longer increases the mass flow rate',
    extra: r`The critical pressure ratio is \(\dfrac{p^*}{p_0} = \left(\dfrac{2}{\gamma + 1}\right)^{\gamma/(\gamma - 1)} \approx 0.528\) for air.`,
  },
  {
    front: 'What changes across a normal shock',
    back: 'The flow goes from supersonic to subsonic; static pressure, temperature and density rise, stagnation pressure falls, and stagnation temperature stays the same',
    extra: 'The process is adiabatic but irreversible, so entropy increases.',
  },
  // Vibration of multi-degree-of-freedom systems
  {
    front: 'Natural frequencies of a multi-degree-of-freedom system',
    back: r`The roots of \(\det\left([K] - \omega^2[M]\right) = 0\)`,
    extra: r`Each \(\omega_i\) has a mode shape \(\{\phi_i\}\) with \(\left([K] - \omega_i^2[M]\right)\{\phi_i\} = \{0\}\).`,
  },
  {
    front: 'Orthogonality of mode shapes',
    back: r`\(\{\phi_i\}^T[M]\{\phi_j\} = 0\) and \(\{\phi_i\}^T[K]\{\phi_j\} = 0\) for \(i \ne j\)`,
    extra: 'It lets modal analysis turn the coupled equations of motion into independent single-degree-of-freedom ones.',
  },
  {
    front: 'Rayleigh (proportional) damping',
    back: r`\([C] = \alpha[M] + \beta[K]\)`,
    extra: r`It keeps the modal equations uncoupled; the damping ratio of mode \(i\) is \(\zeta_i = \dfrac{\alpha}{2\omega_i} + \dfrac{\beta\omega_i}{2}\).`,
  },
  {
    front: 'Undamped dynamic vibration absorber',
    back: r`A small spring–mass attached to a machine and tuned so \(\sqrt{k_a/m_a}\) equals the forcing frequency, which stops the machine vibrating at that frequency`,
    extra: 'It splits the original resonance into two new ones on either side, so it only works near the tuned frequency.',
  },
  // Control
  {
    front: 'PID control law',
    back: r`\(u(t) = K_p e(t) + K_i\displaystyle\int_0^t e(\tau)\,d\tau + K_d\dfrac{de}{dt}\)`,
    extra:
      'The integral term removes steady-state error; the derivative term adds damping by reacting to how fast the error changes.',
  },
  {
    front: 'Transfer function',
    back: 'The Laplace transform of a linear time-invariant system’s output divided by that of its input, with zero initial conditions',
    extra: r`For \(m\ddot{x} + c\dot{x} + kx = f(t)\): \(\dfrac{X(s)}{F(s)} = \dfrac{1}{ms^2 + cs + k}\).`,
  },
  {
    front: 'Stability condition for a continuous-time LTI system',
    back: 'Every pole of the closed-loop transfer function has a negative real part, in the left half of the s-plane',
    extra: 'The Routh–Hurwitz criterion checks this from the characteristic polynomial without finding the roots.',
  },
  {
    front: 'Gain margin and phase margin',
    back: 'Gain margin: how much the loop gain can rise before instability, read where the phase is −180°. Phase margin: how much extra phase lag is tolerable, read where the gain is 1 (0 dB)',
    extra: 'Rules of thumb ask for at least 6 dB of gain margin and 30° to 60° of phase margin.',
  },
  {
    front: 'Percent overshoot of an underdamped second-order system',
    back: r`\(\%\mathrm{OS} = 100\,e^{-\zeta\pi/\sqrt{1 - \zeta^2}}\)`,
    extra: r`For a step input to \(\dfrac{\omega_n^2}{s^2 + 2\zeta\omega_n s + \omega_n^2}\). A damping ratio of 0.7 gives about 5%.`,
  },
  // Tribology
  {
    front: 'Archard wear equation',
    back: r`\(V = K\,\dfrac{F_N\,s}{H}\)`,
    extra: r`Worn volume \(V\) grows with the normal load \(F_N\) and sliding distance \(s\) and falls with the hardness \(H\); \(K\) is a dimensionless wear coefficient.`,
  },
  {
    front: 'Stribeck curve',
    back: r`The friction coefficient plotted against the Hersey number \(\eta N/P\), showing boundary, mixed and hydrodynamic lubrication`,
    extra: r`\(\eta\) is the viscosity, \(N\) the speed and \(P\) the load per unit area. Friction is lowest around the start of full-film lubrication.`,
  },
  {
    front: 'Specific film thickness (lambda ratio)',
    back: r`\(\lambda = \dfrac{h_{\min}}{\sqrt{R_{q1}^2 + R_{q2}^2}}\)`,
    extra: r`Roughly: \(\lambda < 1\) means boundary lubrication, 1 to 3 mixed, above 3 a full film. \(R_q\) is each surface’s RMS roughness.`,
  },
  // Creep
  {
    front: 'Three stages of creep',
    back: 'Primary: the strain rate falls. Secondary: a steady, minimum strain rate. Tertiary: the rate accelerates until rupture',
    extra: r`Creep matters in metals above about \(0.4\,T_m\), where \(T_m\) is the absolute melting temperature.`,
  },
  {
    front: 'Norton power law for steady-state creep',
    back: r`\(\dot{\varepsilon} = A\sigma^n e^{-Q/RT}\)`,
    extra: r`\(Q\) is the activation energy for creep and \(n\) the stress exponent, typically 3 to 8 for dislocation creep in metals.`,
  },
  {
    front: 'Larson–Miller parameter',
    back: r`\(\mathrm{LMP} = T\,(C + \log_{10} t_r)\)`,
    extra: r`\(T\) is the absolute temperature, \(t_r\) the rupture time in hours and \(C \approx 20\). It trades time against temperature to extrapolate creep-rupture data.`,
  },
  // Composites
  {
    front: 'Longitudinal modulus of a unidirectional composite',
    back: r`\(E_1 = V_f E_f + V_m E_m\)`,
    extra: 'The rule of mixtures, assuming fiber and matrix strain equally (iso-strain).',
  },
  {
    front: 'Transverse modulus of a unidirectional composite',
    back: r`\(\dfrac{1}{E_2} = \dfrac{V_f}{E_f} + \dfrac{V_m}{E_m}\)`,
    extra:
      'The inverse rule of mixtures, assuming equal stress (iso-stress). It is only a rough estimate; Halpin–Tsai is more accurate.',
  },
  {
    front: 'Why laminates are usually made symmetric',
    back: r`The coupling matrix \([B]\) is zero, so in-plane loads don’t cause bending or twisting`,
    extra: 'A symmetric laminate also doesn’t warp as it cools after curing.',
  },
  // Geometric dimensioning and tolerancing
  {
    front: 'Datum reference frame (3-2-1 principle)',
    back: 'Three mutually perpendicular planes set up from datum features: the primary datum touches at least three points, the secondary two and the tertiary one',
    extra: 'Together they constrain all six degrees of freedom of the part.',
  },
  {
    front: 'Maximum material condition (MMC)',
    back: 'The size at which a feature contains the most material: the smallest hole or the largest shaft',
    extra: 'A geometric tolerance applied at MMC gains a bonus equal to the feature’s departure from MMC.',
  },
  {
    front: 'Position tolerance zone for a hole',
    back: 'A cylinder of the stated diameter, centered on the true position set by basic dimensions from the datums, that must contain the hole’s axis',
    extra: 'A round zone gives about 57% more area than the square zone of an equivalent ± tolerance.',
  },
  {
    front: 'Rule #1 (envelope principle) in ASME Y14.5',
    back: 'When only a size tolerance is given, a feature’s surface may not go beyond a boundary of perfect form at MMC',
    extra:
      'So the size tolerance also limits form errors such as bow and out-of-roundness. ISO standards default to the independency principle instead.',
  },
]

export const MECHANICAL_ENGINEERING_ADVANCED: PublicDeck = {
  slug: 'mechanical-engineering-advanced',
  title: 'Advanced mechanical engineering: 50 key concepts',
  shortTitle: 'Advanced mechanical engineering',
  category: 'engineering',
  level: 'advanced',
  icon: 'spark',
  description:
    'Upper-level mechanical engineering: fracture, fatigue, FEA, turbulence, turbomachinery, compressible flow, vibration, control, creep, composites and GD&T.',
  intro:
    'Past the core courses, mechanical engineering splits into specialties, each with a few results every practitioner is expected to know. This deck collects them: stress intensity and crack growth, mean-stress fatigue criteria, finite element pitfalls, RANS turbulence models, pump scaling laws, nozzle flow, modal analysis, feedback stability, wear, creep, laminates and geometric tolerancing.',
  faq: [
    {
      q: 'What background does this deck assume?',
      a: 'The core undergraduate courses, as in the intermediate deck: strength of materials, dynamics and vibrations, thermodynamics, fluid mechanics and heat transfer, plus linear algebra and Laplace transforms.',
    },
    {
      q: 'When is linear-elastic fracture mechanics valid?',
      a: 'When the plastic zone at the crack tip is small compared with the crack and the part. For tough, ductile materials, elastic–plastic methods such as the J-integral or crack tip opening displacement are used instead.',
    },
    {
      q: 'Which GD&T standard do the cards follow?',
      a: 'ASME Y14.5, common in North America. ISO standards share most of the symbols but differ in some defaults, such as the independency principle in place of Rule #1.',
    },
  ],
  cards: CARDS,
}
