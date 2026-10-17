import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Indeterminate analysis
  {
    front: 'Force method (consistent deformations)',
    back: 'Remove redundant restraints to get a determinate primary structure, then solve compatibility equations at those points for the redundant forces',
    extra: 'Also called the flexibility method: the unknowns are forces.',
  },
  {
    front: 'Slope-deflection equation',
    back: r`\(M_{AB} = \dfrac{2EI}{L}\left(2\theta_A + \theta_B - 3\psi\right) + \mathrm{FEM}_{AB}\)`,
    extra: r`\(\theta_A\) and \(\theta_B\) are the end rotations, \(\psi = \Delta/L\) the chord rotation from relative end displacement, and \(\mathrm{FEM}_{AB}\) the fixed-end moment. Clockwise is positive.`,
  },
  {
    front: 'Fixed-end moments for a uniform load',
    back: r`\(\dfrac{wL^2}{12}\) at each end`,
    extra: r`For a point load at midspan, \(\dfrac{PL}{8}\) at each end.`,
  },
  {
    front: 'Moment distribution method',
    back: 'Lock every joint and apply the fixed-end moments, then repeatedly release each joint, share its unbalanced moment among the members and carry part of it to the far ends, until the changes are negligible',
    extra: 'Published by Hardy Cross in 1930; in effect, it solves the slope-deflection equations by successive approximation.',
  },
  {
    front: 'Distribution factor in moment distribution',
    back: r`\(\mathrm{DF} = \dfrac{K}{\sum K}\)`,
    extra: r`The member’s share of the joint stiffness. \(K = \dfrac{4EI}{L}\) with the far end fixed, or \(\dfrac{3EI}{L}\) with it pinned.`,
  },
  {
    front: 'Carry-over factor for a prismatic member',
    back: r`\(\tfrac{1}{2}\) when the far end is fixed; \(0\) when it is pinned`,
  },
  {
    front: 'Direct stiffness method',
    back: r`Assemble the global stiffness matrix from the member matrices, solve \(\{F\} = [K]\{d\}\) for the joint displacements, then find the member forces`,
    extra: 'The unknowns are displacements, which makes it easy to automate; it underlies structural analysis software.',
  },
  // Plastic analysis
  {
    front: 'Plastic hinge',
    back: r`A section that has yielded through its depth at the plastic moment \(M_p\) and rotates freely while carrying it`,
  },
  {
    front: 'Plastic hinges needed for collapse',
    back: r`Typically \(n + 1\), where \(n\) is the degree of static indeterminacy`,
    extra: 'Enough hinges turn the structure into a mechanism. A partial mechanism, in one span or story, can need fewer.',
  },
  {
    front: 'Upper-bound theorem of plastic analysis',
    back: 'A collapse load calculated from any assumed mechanism is greater than or equal to the true collapse load',
    extra:
      'The lower-bound theorem: a load for which some equilibrium moment distribution nowhere exceeds the plastic moment is less than or equal to it.',
  },
  // Prestressed concrete
  {
    front: 'Pre-tensioning vs post-tensioning',
    back: 'Pre-tensioning stresses strands before the concrete is cast and transfers the force by bond once it hardens; post-tensioning stresses tendons in ducts after the concrete hardens and anchors them at the ends',
  },
  {
    front: 'Immediate prestress losses',
    back: 'Elastic shortening of the concrete, anchorage seating (slip) and, in post-tensioning, friction along the tendon',
    extra: r`Friction loss: \(P_x = P_0\,e^{-(\mu\alpha + Kx)}\), with \(\mu\) the curvature friction coefficient, \(\alpha\) the total angle change over length \(x\) and \(K\) the wobble coefficient.`,
  },
  {
    front: 'Time-dependent prestress losses',
    back: 'Creep and shrinkage of the concrete and relaxation of the prestressing steel',
    extra:
      'They are why prestressing needs high-strength steel: in ordinary steel, these losses would remove most of the prestress.',
  },
  {
    front: 'Load balancing with a parabolic tendon',
    back: r`\(w_b = \dfrac{8Pe}{L^2}\)`,
    extra: r`A tendon with force \(P\) and sag \(e\) over span \(L\) pushes up on the concrete with this uniform load, which can be chosen to cancel part of the gravity load.`,
  },
  // Structural dynamics and seismic design
  {
    front: 'Natural period of a single-degree-of-freedom system',
    back: r`\(T_n = 2\pi\sqrt{\dfrac{m}{k}}\)`,
    extra: r`The natural circular frequency is \(\omega_n = \sqrt{k/m}\). Stiffer structures have shorter periods; heavier ones, longer.`,
  },
  {
    front: 'Response spectrum',
    back: 'A plot of the peak response of single-degree-of-freedom oscillators against their natural period, for a given ground motion and damping',
    extra: r`Design spectra usually assume 5% damping. Pseudo-acceleration and displacement are related by \(S_a = \omega_n^2 S_d\).`,
  },
  {
    front: 'Displacement ductility factor',
    back: r`\(\mu = \dfrac{\Delta_{\max}}{\Delta_y}\)`,
    extra: 'Peak displacement over yield displacement: how far a structure deforms beyond yield.',
  },
  {
    front: 'Response modification factor',
    back: r`A factor \(R\) that reduces the elastic seismic force to a design force, relying on ductility and overstrength`,
    extra: r`Eurocode 8 calls it the behavior factor \(q\). For long periods the equal displacement rule gives \(R \approx \mu\); for shorter periods, equal energy gives \(R \approx \sqrt{2\mu - 1}\).`,
  },
  {
    front: 'Base isolation',
    back: 'Flexible bearings between a building and its foundation lengthen its natural period, cutting the accelerations and drifts transmitted to the structure',
    extra:
      'Movement concentrates at the isolators, which often add damping. Laminated rubber bearings and friction pendulums are common types.',
  },
  {
    front: 'Strong-column, weak-beam design',
    back: 'Making columns stronger than the beams framing into them, so plastic hinges form in the beams rather than the columns',
    extra:
      'Part of capacity design: it avoids a soft-story mechanism, in which the columns of one story hinge at top and bottom and all the drift concentrates there.',
  },
  // Consolidation
  {
    front: 'Terzaghi’s one-dimensional consolidation equation',
    back: r`\(\dfrac{\partial u}{\partial t} = c_v \dfrac{\partial^2 u}{\partial z^2}\)`,
    extra: r`\(u\) is the excess pore pressure. The coefficient of consolidation is \(c_v = \dfrac{k}{m_v \gamma_w}\), with \(m_v\) the coefficient of volume compressibility.`,
  },
  {
    front: 'Time factor for consolidation',
    back: r`\(T_v = \dfrac{c_v t}{H_{dr}^2}\)`,
    extra: r`\(H_{dr}\) is the longest drainage path: half the layer thickness if it drains at top and bottom. Average consolidation reaches 50% at \(T_v \approx 0.197\) and 90% at \(T_v \approx 0.848\).`,
  },
  {
    front: 'Consolidation settlement of a normally consolidated clay',
    back: r`\(S_c = \dfrac{C_c H}{1 + e_0}\log_{10}\dfrac{\sigma'_0 + \Delta\sigma'}{\sigma'_0}\)`,
    extra: r`\(C_c\) is the compression index, \(H\) the layer thickness, \(e_0\) the initial void ratio and \(\sigma'_0\) the initial vertical effective stress.`,
  },
  {
    front: 'Preconsolidation pressure',
    back: 'The largest vertical effective stress a soil has carried in the past',
    extra: r`Found from the void ratio vs \(\log\sigma'\) curve of an oedometer test, for example with Casagrande’s construction. Below it the soil follows a much flatter recompression line, with slope \(C_r\).`,
  },
  {
    front: 'Overconsolidation ratio',
    back: r`\(\mathrm{OCR} = \dfrac{\sigma'_p}{\sigma'_0}\)`,
    extra: r`Preconsolidation pressure over current vertical effective stress. \(\mathrm{OCR} = 1\): normally consolidated. \(\mathrm{OCR} > 1\): overconsolidated, so the clay settles much less until loading exceeds \(\sigma'_p\).`,
  },
  {
    front: 'Secondary compression',
    back: 'Slow compression under constant effective stress after primary consolidation ends, from creep of the soil skeleton',
    extra: r`Its rate is the secondary compression index \(C_\alpha\), the change in void ratio per log cycle of time. It matters most in organic soils and peat.`,
  },
  // Shear strength and slopes
  {
    front: 'Mohr–Coulomb failure criterion',
    back: r`\(\tau_f = c' + \sigma'\tan\phi'\)`,
    extra: r`\(c'\) is the effective cohesion and \(\phi'\) the effective friction angle. The failure plane is inclined at \(45^\circ + \phi'/2\) to the major principal plane.`,
  },
  {
    front: 'Drained vs undrained loading',
    back: r`Drained: slow enough for excess pore pressure to dissipate, analyzed with effective stress parameters. Undrained: no drainage during loading, as in clay in the short term, often analyzed with the undrained strength \(s_u\) and \(\phi = 0\)`,
  },
  {
    front: 'Dilatancy of dense sand',
    back: 'Dense sand expands as it shears, because grains must ride up over each other, giving a peak strength above its critical state strength; loose sand contracts',
    extra: 'Under undrained conditions, dilation lowers the pore pressure and contraction raises it.',
  },
  {
    front: 'Soil liquefaction',
    back: 'Loss of strength in saturated loose sand when cyclic loading, such as earthquake shaking, raises the pore pressure until the effective stress approaches zero',
  },
  {
    front: 'Factor of safety of a slope',
    back: 'The available shear strength along a slip surface divided by the shear stress needed for equilibrium',
    extra: 'Targets of about 1.3 to 1.5 are typical for the long-term stability of permanent slopes.',
  },
  {
    front: 'Factor of safety of an infinite slope in dry sand',
    back: r`\(F = \dfrac{\tan\phi'}{\tan\beta}\)`,
    extra: r`\(\beta\) is the slope angle, so dry sand can stand up to its friction angle. With seepage parallel to the slope and the water table at the surface, \(F = \dfrac{\gamma'}{\gamma_{sat}}\dfrac{\tan\phi'}{\tan\beta}\), roughly half.`,
  },
  {
    front: 'Method of slices',
    back: 'Divide the soil above a trial slip surface into vertical slices, check equilibrium of the slices, and search for the surface with the lowest factor of safety',
    extra:
      'The ordinary (Fellenius) method ignores interslice forces; Bishop’s simplified method includes the horizontal interslice forces and satisfies moment equilibrium.',
  },
  // Deep foundations
  {
    front: 'Ultimate capacity of a single pile',
    back: r`\(Q_u = Q_s + Q_b\)`,
    extra: r`Shaft friction plus base resistance. In clay the unit base resistance is typically \(q_b = 9\,s_u\).`,
  },
  {
    front: 'Alpha method for pile shaft friction',
    back: r`\(f_s = \alpha\, s_u\)`,
    extra: r`A total stress method for clays. The adhesion factor \(\alpha\) falls as the undrained strength \(s_u\) rises.`,
  },
  {
    front: 'Beta method for pile shaft friction',
    back: r`\(f_s = \beta\,\sigma'_v\), with \(\beta = K\tan\delta\)`,
    extra: r`An effective stress method: \(K\) is the lateral earth pressure coefficient and \(\delta\) the pile–soil friction angle.`,
  },
  {
    front: 'Negative skin friction',
    back: 'Downward drag on a pile when the surrounding soil settles more than the pile, for example soft clay consolidating under new fill',
    extra: 'Also called downdrag. It adds load to the pile instead of resisting it.',
  },
  // Pavements
  {
    front: 'Flexible vs rigid pavement',
    back: 'A flexible (asphalt) pavement spreads load through layers of decreasing stiffness down to the subgrade; a rigid (concrete) pavement carries it by slab bending over a wide area',
    extra:
      'Flexible design limits stresses and strains in the layers and subgrade; rigid design is based on slab stresses, following Westergaard’s analysis.',
  },
  {
    front: 'Fourth power law',
    back: 'Pavement damage rises roughly with the fourth power of axle load',
    extra: r`From the AASHO Road Test. Mixed traffic is converted to equivalent single axle loads (ESALs) of \(80\ \mathrm{kN}\) (18,000 lb).`,
  },
  {
    front: 'AASHTO structural number',
    back: r`\(SN = a_1D_1 + a_2D_2m_2 + a_3D_3m_3\)`,
    extra: r`\(a_i\) are layer coefficients, \(D_i\) layer thicknesses and \(m_i\) drainage coefficients for the base and subbase. Used in flexible pavement design.`,
  },
  // Limit state design
  {
    front: 'Ultimate limit state (ULS)',
    back: 'A state of collapse or failure that threatens safety: rupture, buckling, loss of equilibrium or a mechanism',
    extra: 'Checked with factored loads and reduced resistances.',
  },
  {
    front: 'Serviceability limit state (SLS)',
    back: 'A state where the structure is still safe but no longer fit for use: excessive deflection, cracking or vibration',
    extra: 'Usually checked with unfactored service loads.',
  },
  {
    front: 'Partial safety factors in limit state design',
    back: 'Factors that increase loads and reduce strengths or resistances, so that the design resistance exceeds the design load effect with a margin for uncertainty',
    extra: r`Typical gravity combinations: \(1.35G + 1.5Q\) in Eurocode and \(1.2D + 1.6L\) in ASCE 7.`,
  },
  // Water quality
  {
    front: 'Biochemical oxygen demand (BOD)',
    back: 'The dissolved oxygen consumed by microorganisms as they break down organic matter aerobically',
    extra: r`The standard test, \(\mathrm{BOD}_5\), measures it over 5 days at \(20\,^\circ\mathrm{C}\) in the dark.`,
  },
  {
    front: 'First-order BOD model',
    back: r`\(\mathrm{BOD}_t = L_0\left(1 - e^{-kt}\right)\)`,
    extra: r`\(L_0\) is the ultimate carbonaceous BOD and \(k\) the rate constant. Temperature correction: \(k_T = k_{20}\,\theta^{T - 20}\), with \(\theta\) typically about 1.047.`,
  },
  {
    front: 'Nitrification',
    back: r`Two-step aerobic oxidation of ammonium to nitrite and then nitrate by autotrophic bacteria: \(\mathrm{NH_4^+} \to \mathrm{NO_2^-} \to \mathrm{NO_3^-}\)`,
    extra: r`It uses about \(4.57\ \mathrm{g}\) of oxygen and \(7.14\ \mathrm{g}\) of alkalinity (as \(\mathrm{CaCO_3}\)) per gram of ammonium nitrogen oxidized.`,
  },
  {
    front: 'Nitrogenous BOD',
    back: 'The oxygen demand from nitrifying bacteria oxidizing ammonia, separate from the carbonaceous demand of organic matter',
    extra: r`It can inflate \(\mathrm{BOD}_5\) results, especially for treated effluents, so a nitrification inhibitor is added when only carbonaceous BOD is wanted.`,
  },
  // Construction management
  {
    front: 'Critical path',
    back: 'The longest chain of dependent activities through a project network; it sets the shortest possible project duration',
    extra: 'Its activities have zero total float, so any delay to them delays the project.',
  },
  {
    front: 'Total float',
    back: r`\(TF = LS - ES = LF - EF\)`,
    extra:
      'How long an activity can slip without delaying the project. Early dates come from a forward pass through the network, late dates from a backward pass.',
  },
  {
    front: 'Crashing a schedule',
    back: 'Shortening critical activities by adding resources, starting with the lowest cost per unit of time saved',
    extra: 'Only critical activities shorten the project, and the critical path can change as you crash.',
  },
]

export const CIVIL_ENGINEERING_ADVANCED: PublicDeck = {
  slug: 'civil-engineering-advanced',
  title: 'Advanced civil engineering: 50 analysis and design concepts',
  shortTitle: 'Advanced civil engineering',
  category: 'engineering',
  level: 'advanced',
  icon: 'globe',
  description:
    'Advanced civil engineering: indeterminate analysis, prestressing, seismic design, consolidation, slope stability, pile capacity, pavements and limit states.',
  intro:
    'Upper-level and professional topics: indeterminate and plastic analysis, prestressed concrete, structural dynamics and seismic design, consolidation, shear strength and slope stability, pile capacity, pavement design, limit state design, BOD and nitrification, and the critical path method. It suits graduate courses and review for professional engineering exams.',
  faq: [
    {
      q: 'What should I know before this deck?',
      a: 'The intermediate deck: beam formulas, determinacy, the flexure formula, effective stress and the basics of concrete and steel design.',
    },
    {
      q: 'Is this deck enough for a professional engineering exam?',
      a: 'No single deck is. It helps you recall methods and formulas quickly, but exams also test problem solving with the codes and references they allow.',
    },
    {
      q: 'Why do load factors differ between codes?',
      a: 'Each code calibrates its load factors, resistance factors and load combinations together against a target reliability, so a factor only makes sense alongside the rest of the same code.',
    },
  ],
  cards: CARDS,
}
