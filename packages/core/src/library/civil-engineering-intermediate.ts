import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Structural analysis
  {
    front: 'Static determinacy of a beam',
    back: r`Determinate if \(r = 3 + c\); indeterminate if \(r > 3 + c\)`,
    extra: r`\(r\) is the number of reaction components and \(c\) the number of extra condition equations, such as one per internal hinge. With \(r < 3 + c\) the beam is unstable, and it is also unstable if all its reactions are parallel or concurrent.`,
  },
  {
    front: 'Static determinacy of a plane truss',
    back: r`Determinate if \(b + r = 2j\); indeterminate if \(b + r > 2j\); unstable if \(b + r < 2j\)`,
    extra: r`\(b\) members, \(r\) reaction components, \(j\) joints. The degree of indeterminacy is \(b + r - 2j\).`,
  },
  {
    front: 'Method of joints',
    back: r`Isolate each joint and solve \(\sum F_x = 0\) and \(\sum F_y = 0\), starting at a joint with no more than two unknown member forces`,
  },
  {
    front: 'Method of sections',
    back: 'Cut the truss through the members of interest, usually no more than three unknowns, and apply the three equilibrium equations to one side',
    extra: 'Taking moments about the point where two of the cut members meet gives the third force directly.',
  },
  {
    front: 'Zero-force members in a truss',
    back: 'At an unloaded, unsupported joint with two non-collinear members, both carry zero force; at one with three members, two of them collinear, the third carries zero force',
  },
  {
    front: 'Relationship between shear force and bending moment',
    back: r`\(\dfrac{dM}{dx} = V\)`,
    extra:
      'So the change in moment between two points equals the area under the shear diagram, and the moment peaks where the shear passes through zero.',
  },
  {
    front: 'Maximum moment in a simply supported beam under a uniform load',
    back: r`\(M_{\max} = \dfrac{wL^2}{8}\), at midspan`,
  },
  {
    front: 'Maximum moment in a simply supported beam with a central point load',
    back: r`\(M_{\max} = \dfrac{PL}{4}\), at midspan`,
  },
  {
    front: 'Midspan deflection of a simply supported beam under a uniform load',
    back: r`\(\delta = \dfrac{5wL^4}{384EI}\)`,
    extra: r`\(EI\) is the flexural rigidity: Young’s modulus times the second moment of area.`,
  },
  {
    front: 'Midspan deflection of a simply supported beam with a central point load',
    back: r`\(\delta = \dfrac{PL^3}{48EI}\)`,
  },
  {
    front: 'Elastic curve equation',
    back: r`\(EI\dfrac{d^2v}{dx^2} = M(x)\)`,
    extra:
      'Integrate twice and apply the support conditions to get slopes and deflections. Valid for small deflections of linear elastic beams.',
  },
  // Section properties
  {
    front: 'Second moment of area of a rectangle about its centroid',
    back: r`\(I = \dfrac{bh^3}{12}\)`,
    extra: r`\(b\) is the width and \(h\) the depth in the direction of bending, so doubling the depth makes a beam eight times stiffer.`,
  },
  {
    front: 'Parallel axis theorem',
    back: r`\(I = I_c + Ad^2\)`,
    extra: r`\(I_c\) is the second moment about the centroidal axis, \(A\) the area and \(d\) the distance between the two parallel axes.`,
  },
  {
    front: 'Flexure formula',
    back: r`\(\sigma = \dfrac{My}{I}\)`,
    extra: r`\(y\) is the distance from the neutral axis, where bending stress is zero. In a homogeneous, linear elastic section the neutral axis passes through the centroid.`,
  },
  {
    front: 'Elastic section modulus',
    back: r`\(S = \dfrac{I}{c}\), so \(\sigma_{\max} = \dfrac{M}{S}\)`,
    extra: r`\(c\) is the distance from the neutral axis to the extreme fiber. For a rectangle, \(S = \dfrac{bh^2}{6}\).`,
  },
  {
    front: 'Shear stress in a beam',
    back: r`\(\tau = \dfrac{VQ}{Ib}\)`,
    extra: r`\(Q\) is the first moment, about the neutral axis, of the area beyond the point, and \(b\) the width there. In a rectangle the peak is \(1.5\,V/A\), at the neutral axis.`,
  },
  // Buckling
  {
    front: 'Euler buckling load',
    back: r`\(P_{cr} = \dfrac{\pi^2 EI}{(KL)^2}\)`,
    extra: r`\(KL\) is the effective length. With equal effective lengths, use the smaller \(I\): the column buckles about its weaker axis.`,
  },
  {
    front: r`Effective length factor \(K\)`,
    back: 'Pinned–pinned 1.0, fixed–free 2.0, fixed–pinned 0.7, fixed–fixed 0.5',
    extra:
      'These are theoretical values. Design guides recommend higher ones for the fixed cases, since real connections aren’t perfectly rigid.',
  },
  {
    front: 'Slenderness ratio of a column',
    back: r`\(\dfrac{KL}{r}\), where \(r = \sqrt{I/A}\) is the radius of gyration`,
    extra: r`Euler’s critical stress is \(\sigma_{cr} = \dfrac{\pi^2 E}{(KL/r)^2}\). It applies only while that stays below the proportional limit; stocky columns yield or buckle inelastically first.`,
  },
  // Reinforced concrete
  {
    front: 'Balanced section in reinforced concrete',
    back: 'The tension steel starts to yield just as the extreme compression fiber of the concrete reaches its crushing strain',
    extra: 'The crushing strain is taken as 0.003 in ACI 318 and 0.0035 in Eurocode 2 for normal-strength concrete.',
  },
  {
    front: 'Under-reinforced section',
    back: 'Less steel than balanced, so the steel yields before the concrete crushes: a ductile failure, with wide cracks and large deflections as warning',
    extra: 'An over-reinforced section fails by sudden crushing of the concrete, so codes limit the amount of tension steel.',
  },
  {
    front: 'Equivalent rectangular stress block (ACI)',
    back: r`A uniform stress of \(0.85f'_c\) over a depth \(a = \beta_1 c\) from the compression face`,
    extra: r`\(c\) is the neutral axis depth. \(\beta_1 = 0.85\) for concrete up to \(28\ \mathrm{MPa}\) (\(4000\ \mathrm{psi}\)), and decreases for stronger concrete.`,
  },
  {
    front: 'Nominal moment strength of a singly reinforced rectangular beam',
    back: r`\(M_n = A_s f_y\left(d - \dfrac{a}{2}\right)\), with \(a = \dfrac{A_s f_y}{0.85 f'_c b}\)`,
    extra: r`\(d\) is the effective depth, from the compression face to the centroid of the tension steel. It assumes the steel has yielded.`,
  },
  // Steel design
  {
    front: 'Limit states of a steel tension member',
    back: 'Yielding of the gross section and fracture of the net section through the bolt holes',
    extra: 'Block shear rupture at the connection is checked too.',
  },
  {
    front: 'Lateral-torsional buckling',
    back: 'A beam bent about its strong axis deflects sideways and twists, because its compression flange isn’t braced enough',
    extra: r`Moment capacity falls as the unbraced length \(L_b\) grows; bracing the compression flange prevents it.`,
  },
  {
    front: 'Plastic moment of a steel section',
    back: r`\(M_p = F_y Z\)`,
    extra: r`\(Z\) is the plastic section modulus: \(bh^2/4\) for a rectangle, 1.5 times its elastic \(S\). For wide-flange beams \(Z/S\) is typically about 1.1 to 1.2.`,
  },
  {
    front: 'Compact steel section',
    back: 'A section whose flanges and web are stocky enough to reach the plastic moment before local buckling',
    extra: 'Compactness is judged from the width-to-thickness ratios of the flanges and web.',
  },
  // Soil mechanics
  {
    front: 'Effective stress',
    back: r`\(\sigma' = \sigma - u\)`,
    extra: r`Total stress minus pore water pressure (Terzaghi); it controls soil strength and compressibility. Below the water table, \(u = \gamma_w z_w\), where \(z_w\) is the depth below it and \(\gamma_w \approx 9.81\ \mathrm{kN/m^3}\).`,
  },
  {
    front: 'Atterberg limits',
    back: 'The water contents at which a fine-grained soil changes state: shrinkage limit (solid to semisolid), plastic limit (semisolid to plastic) and liquid limit (plastic to liquid)',
  },
  {
    front: 'Plasticity index',
    back: r`\(PI = LL - PL\)`,
    extra: r`The range of water content over which the soil is plastic. With \(LL\), it places a fine soil on the plasticity chart.`,
  },
  {
    front: 'Darcy’s law',
    back: r`\(Q = kiA\)`,
    extra: r`\(k\) is the hydraulic conductivity and \(i = \Delta h / L\) the hydraulic gradient. Water in the pores moves faster, at the seepage velocity \(ki/n\), where \(n\) is the porosity.`,
  },
  {
    front: 'Critical hydraulic gradient',
    back: r`\(i_c = \dfrac{\gamma'}{\gamma_w} \approx 1\)`,
    extra: r`\(\gamma'\) is the submerged unit weight. At this upward gradient the effective stress in a cohesionless soil falls to zero and it boils (the quick condition).`,
  },
  {
    front: 'Proctor compaction test',
    back: 'Compacting soil at several water contents with a set energy to find the maximum dry density and the optimum water content',
    extra:
      'Compaction mainly expels air. The modified test uses more energy, giving a higher maximum dry density at a lower optimum water content.',
  },
  {
    front: 'Terzaghi’s bearing capacity equation for a strip footing',
    back: r`\(q_u = cN_c + qN_q + \tfrac{1}{2}\gamma BN_\gamma\)`,
    extra: r`\(c\) is the cohesion, \(q\) the overburden pressure at footing level and \(B\) the width; the \(N\) factors depend on the friction angle. The allowable pressure is \(q_u\) divided by a factor of safety, typically 3.`,
  },
  // Hydraulics
  {
    front: 'Manning’s equation',
    back: r`\(V = \dfrac{1}{n} R^{2/3} S^{1/2}\)`,
    extra: r`SI units; in US units the \(1\) becomes \(1.49\). \(n\) is the roughness coefficient, \(R\) the hydraulic radius and \(S\) the energy slope, equal to the bed slope in uniform flow.`,
  },
  {
    front: 'Hydraulic radius',
    back: r`\(R = \dfrac{A}{P}\)`,
    extra: r`Flow area over wetted perimeter. In a wide rectangular channel, \(R \approx y\), the depth.`,
  },
  {
    front: 'Froude number in open-channel flow',
    back: r`\(Fr = \dfrac{V}{\sqrt{gD}}\)`,
    extra: r`\(D = A/T\) is the hydraulic depth, with \(T\) the top width (\(D = y\) in a rectangular channel). \(Fr < 1\) is subcritical, \(Fr = 1\) critical and \(Fr > 1\) supercritical.`,
  },
  {
    front: 'Critical depth in a rectangular channel',
    back: r`\(y_c = \left(\dfrac{q^2}{g}\right)^{1/3}\)`,
    extra: r`\(q\) is the discharge per unit width. Specific energy \(E = y + \dfrac{V^2}{2g}\) is at its minimum here: \(E_{\min} = 1.5\,y_c\).`,
  },
  {
    front: 'Hydraulic jump',
    back: 'An abrupt rise in the water surface where supercritical flow changes to subcritical, dissipating energy in turbulence',
    extra: 'Stilling basins below spillways are designed to hold a jump.',
  },
  {
    front: 'Sequent depths of a hydraulic jump in a rectangular channel',
    back: r`\(\dfrac{y_2}{y_1} = \dfrac{1}{2}\left(\sqrt{1 + 8Fr_1^2} - 1\right)\)`,
    extra: r`\(y_1\) and \(Fr_1\) are the depth and Froude number just upstream of the jump.`,
  },
  // Hydrology
  {
    front: 'Rational method for peak runoff',
    back: r`\(Q = CiA\)`,
    extra: r`\(C\) is the runoff coefficient, \(i\) the rainfall intensity for a duration equal to the time of concentration and \(A\) the area. In SI, \(Q = 0.278\,CiA\) gives \(\mathrm{m^3/s}\) from \(\mathrm{mm/h}\) and \(\mathrm{km^2}\). Meant for small catchments.`,
  },
  {
    front: 'Runoff coefficient',
    back: 'The fraction of rainfall that becomes direct runoff',
    extra: 'Typically about 0.7 to 0.95 for pavement and roofs, and much lower for lawns and woodland.',
  },
  {
    front: 'Time of concentration',
    back: 'The time runoff takes to travel from the hydraulically most distant point of a catchment to the outlet',
    extra: 'Once rain has lasted this long, the whole catchment contributes to the flow at the outlet.',
  },
  // Transportation
  {
    front: 'Stopping sight distance',
    back: r`\(d = vt + \dfrac{v^2}{2a}\)`,
    extra: r`Reaction distance plus braking distance. AASHTO typically assumes \(t = 2.5\ \mathrm{s}\) and a deceleration \(a = 3.4\ \mathrm{m/s^2}\).`,
  },
  {
    front: 'Superelevation',
    back: 'Tilting a curve’s cross section toward the inside, so part of the centripetal force comes from the bank rather than tire friction',
    extra: r`For design, \(e + f = \dfrac{v^2}{gR}\), where \(e\) is the superelevation rate, \(f\) the side friction factor and \(R\) the curve radius.`,
  },
  {
    front: 'Fundamental equation of traffic flow',
    back: r`\(q = kv\)`,
    extra: r`Flow \(q\) (vehicles per hour) equals density \(k\) (vehicles per kilometer) times space-mean speed \(v\).`,
  },
  {
    front: 'Maximum flow in the Greenshields model',
    back: r`\(q_{\max} = \dfrac{v_f k_j}{4}\)`,
    extra: r`Speed falls linearly with density, \(v = v_f\left(1 - k/k_j\right)\), so flow peaks at half the jam density \(k_j\) and half the free-flow speed \(v_f\).`,
  },
  // Water and wastewater
  {
    front: 'Steps of conventional drinking water treatment',
    back: 'Coagulation, flocculation, sedimentation, filtration, disinfection',
    extra:
      'Coagulants such as alum neutralize the charge on fine particles; gentle mixing during flocculation then grows them into flocs heavy enough to settle.',
  },
  {
    front: 'Surface overflow rate of a settling tank',
    back: r`\(v_o = \dfrac{Q}{A_s}\)`,
    extra: r`\(A_s\) is the tank’s surface area. In an ideal tank, every particle that settles faster than \(v_o\) is removed, whatever the depth.`,
  },
  {
    front: 'Activated sludge process',
    back: 'Aerating wastewater with a suspended culture of microorganisms that consume organic matter, then settling the biomass in a clarifier and returning part of it to the aeration tank',
    extra: 'A common form of secondary treatment, after screening, grit removal and primary settling.',
  },
]

export const CIVIL_ENGINEERING_INTERMEDIATE: PublicDeck = {
  slug: 'civil-engineering-intermediate',
  title: 'Intermediate civil engineering: 50 formulas and methods',
  shortTitle: 'Intermediate civil engineering',
  category: 'engineering',
  level: 'intermediate',
  icon: 'globe',
  description:
    'Undergraduate civil engineering in 50 cards: beam formulas, buckling, concrete and steel design, soils, open channels, hydrology, traffic and water treatment.',
  intro:
    'The core of an undergraduate civil engineering degree: determinacy and truss analysis, shear and moment, deflection and buckling, concrete and steel design concepts, soil mechanics, open-channel hydraulics, hydrology, traffic flow and water treatment. Formulas are typeset in LaTeX, with a note on what each symbol means.',
  faq: [
    {
      q: 'Should I start with this deck?',
      a: 'If you know the basics of loads, supports, stress and soil types, yes. Otherwise start with Civil engineering basics.',
    },
    {
      q: 'Do the cards follow a particular design code?',
      a: 'They teach principles shared by most codes. Where a card quotes a code value, such as the ACI stress block, it names the code; for real design, check the code and edition that apply to you.',
    },
    {
      q: 'Which units are used?',
      a: 'SI units, with the US customary version noted where an equation’s constant changes, as in Manning’s equation.',
    },
  ],
  cards: CARDS,
}
