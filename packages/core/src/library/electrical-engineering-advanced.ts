import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // Laplace and Z transforms
  {
    front: 'Laplace transform (unilateral)',
    back: r`\(F(s) = \displaystyle\int_{0^-}^{\infty} f(t)\,e^{-st}\,dt\)`,
    extra: r`\(s = \sigma + j\omega\) is the complex frequency. Differentiation becomes multiplication by \(s\): \(\mathcal{L}\{f'\} = sF(s) - f(0^-)\).`,
  },
  {
    front: 'Final value theorem',
    back: r`\(\displaystyle\lim_{t \to \infty} f(t) = \lim_{s \to 0} sF(s)\)`,
    extra: r`Valid only if every pole of \(sF(s)\) lies in the open left half-plane, so that \(f(t)\) actually settles.`,
  },
  {
    front: 'Z-transform',
    back: r`\(X(z) = \displaystyle\sum_{n=-\infty}^{\infty} x[n]\,z^{-n}\)`,
    extra: r`A delay of one sample multiplies the transform by \(z^{-1}\).`,
  },
  // Transfer functions and frequency response
  {
    front: 'Transfer function',
    back: r`\(H(s) = \dfrac{Y(s)}{X(s)}\), the ratio of the output and input transforms with all initial conditions zero`,
    extra: 'It is also the Laplace transform of the impulse response.',
  },
  {
    front: 'Poles and zeros of a transfer function',
    back: r`Zeros are the roots of the numerator of \(H(s)\); poles are the roots of the denominator`,
    extra: 'On a pole-zero plot, poles are drawn as crosses and zeros as circles.',
  },
  {
    front: 'Stability condition for a continuous-time LTI system',
    back: 'Every pole of the transfer function lies in the open left half of the s-plane',
    extra:
      'A pole in the right half-plane makes the response grow without bound; simple poles on the imaginary axis give sustained oscillation.',
  },
  {
    front: 'Stability condition for a discrete-time LTI system',
    back: r`Every pole of \(H(z)\) lies strictly inside the unit circle, \(|z| < 1\)`,
    extra: r`The mapping \(z = e^{sT}\) sends the left half of the s-plane inside the unit circle.`,
  },
  {
    front: 'Bode phase of a real left-half-plane pole',
    back: r`It falls from \(0^\circ\) to \(-90^\circ\), passing \(-45^\circ\) at the corner frequency`,
    extra: r`Most of the change happens within a decade either side of the corner, from \(0.1\,\omega_c\) to \(10\,\omega_c\).`,
  },
  {
    front: 'Right-half-plane zero on a Bode plot',
    back: r`Its magnitude rises at \(20\ \mathrm{dB}\) per decade like a normal zero, but its phase falls by \(90^\circ\) like a pole`,
    extra: 'Systems with one are called non-minimum phase; the step response often starts in the wrong direction.',
  },
  {
    front: 'Standard second-order transfer function',
    back: r`\(H(s) = \dfrac{\omega_n^2}{s^2 + 2\zeta\omega_n s + \omega_n^2}\)`,
    extra: r`\(\omega_n\) is the natural frequency and \(\zeta\) the damping ratio; \(0 < \zeta < 1\) is underdamped.`,
  },
  {
    front: 'Percent overshoot of an underdamped second-order step response',
    back: r`\(\%\mathrm{OS} = 100\,e^{-\zeta\pi/\sqrt{1 - \zeta^2}}\)`,
    extra: r`It depends only on \(\zeta\): about 16% at \(\zeta = 0.5\) and 4.3% at \(\zeta = 0.707\).`,
  },
  // Stability
  {
    front: 'Routh–Hurwitz criterion',
    back: 'The number of sign changes in the first column of the Routh array equals the number of roots in the right half-plane',
    extra: 'It tests the stability of a characteristic polynomial without solving for its roots.',
  },
  {
    front: 'Nyquist stability criterion',
    back: r`\(Z = N + P\): closed-loop right-half-plane poles equal the clockwise encirclements of \(-1\) by \(L(s)\) plus the open-loop right-half-plane poles`,
    extra: r`Stability needs \(Z = 0\), so the plot must encircle \(-1\) counterclockwise once for each unstable open-loop pole.`,
  },
  {
    front: 'Gain margin',
    back: r`How much the loop gain can rise before instability: \(\mathrm{GM} = \dfrac{1}{|L(j\omega_{pc})|}\), where the phase of \(L\) is \(-180^\circ\)`,
    extra: r`\(\omega_{pc}\) is the phase-crossover frequency. In decibels, \(\mathrm{GM} = -20\log_{10}|L(j\omega_{pc})|\).`,
  },
  {
    front: 'Phase margin',
    back: r`\(\mathrm{PM} = 180^\circ + \angle L(j\omega_{gc})\), where \(|L(j\omega_{gc})| = 1\)`,
    extra: r`\(\omega_{gc}\) is the gain-crossover frequency. A common design target is \(45^\circ\) to \(60^\circ\).`,
  },
  // Sampling and DSP
  {
    front: 'Nyquist–Shannon sampling theorem',
    back: r`A signal band-limited to \(B\) hertz can be reconstructed exactly from samples taken at a rate \(f_s > 2B\)`,
    extra: r`Half the sampling rate, \(f_s/2\), is called the Nyquist frequency.`,
  },
  {
    front: 'Aliasing',
    back: r`After sampling, frequencies above \(f_s/2\) fold back and appear as lower frequencies`,
    extra: r`An anti-aliasing low-pass filter before the sampler prevents it. A \(7\ \mathrm{kHz}\) tone sampled at \(10\ \mathrm{kHz}\) appears at \(3\ \mathrm{kHz}\).`,
  },
  {
    front: 'FIR vs IIR filters',
    back: 'FIR filters have no feedback, are always stable and can have exactly linear phase; IIR filters use feedback and need fewer coefficients for a sharp response, but can be unstable',
    extra: 'An FIR filter with symmetric coefficients has linear phase, so it delays all frequencies equally.',
  },
  {
    front: 'Discrete Fourier transform (DFT)',
    back: r`\(X[k] = \displaystyle\sum_{n=0}^{N-1} x[n]\,e^{-j2\pi kn/N}\)`,
  },
  {
    front: 'Cost of the FFT vs a direct DFT',
    back: r`\(O(N\log N)\) operations instead of \(O(N^2)\)`,
    extra: r`The common radix-2 Cooley–Tukey algorithm needs \(N\) to be a power of 2.`,
  },
  {
    front: 'Frequency resolution of an N-point DFT',
    back: r`\(\Delta f = \dfrac{f_s}{N}\)`,
    extra: r`Bin \(k\) sits at \(k f_s/N\). Zero-padding interpolates the spectrum but doesn’t add resolution.`,
  },
  // Transmission lines
  {
    front: 'Characteristic impedance of a lossless transmission line',
    back: r`\(Z_0 = \sqrt{\dfrac{L'}{C'}}\)`,
    extra: r`\(L'\) and \(C'\) are the inductance and capacitance per unit length. Coaxial cables are usually \(50\) or \(75\ \Omega\).`,
  },
  {
    front: 'Reflection coefficient at a load',
    back: r`\(\Gamma = \dfrac{Z_L - Z_0}{Z_L + Z_0}\)`,
    extra: r`A matched load gives \(\Gamma = 0\), a short circuit \(-1\) and an open circuit \(+1\).`,
  },
  {
    front: 'Voltage standing wave ratio (VSWR)',
    back: r`\(\mathrm{VSWR} = \dfrac{1 + |\Gamma|}{1 - |\Gamma|}\)`,
    extra: 'It runs from 1 for a perfect match to infinity for total reflection.',
  },
  {
    front: 'Quarter-wave transformer',
    back: r`A \(\lambda/4\) line of impedance \(Z_0 = \sqrt{Z_{\text{in}} Z_L}\) matches a real load \(Z_L\) to \(Z_{\text{in}}\)`,
    extra: r`A quarter-wave line transforms any load to \(Z_{\text{in}} = Z_0^2/Z_L\).`,
  },
  {
    front: 'Smith chart',
    back: 'A plot of the reflection coefficient in the complex plane, overlaid with circles of constant normalized resistance and arcs of constant normalized reactance',
    extra: 'Moving along a lossless line rotates the point around the centre; one full turn is half a wavelength.',
  },
  // Electromagnetics
  {
    front: 'Gauss’s law in differential form',
    back: r`\(\nabla \cdot \mathbf{D} = \rho_v\)`,
    extra: r`The electric flux out of a region equals the free charge inside. In free space \(\mathbf{D} = \varepsilon_0\mathbf{E}\).`,
  },
  {
    front: 'Gauss’s law for magnetism',
    back: r`\(\nabla \cdot \mathbf{B} = 0\)`,
    extra: 'There are no magnetic monopoles, so magnetic field lines always close on themselves.',
  },
  {
    front: 'Faraday’s law in differential form',
    back: r`\(\nabla \times \mathbf{E} = -\dfrac{\partial \mathbf{B}}{\partial t}\)`,
    extra: 'A time-varying magnetic field produces a circulating electric field.',
  },
  {
    front: 'Ampère–Maxwell law',
    back: r`\(\nabla \times \mathbf{H} = \mathbf{J} + \dfrac{\partial \mathbf{D}}{\partial t}\)`,
    extra: r`Maxwell’s displacement current term, \(\partial\mathbf{D}/\partial t\), is what makes electromagnetic waves possible.`,
  },
  {
    front: 'Intrinsic impedance of free space',
    back: r`\(\eta_0 = \sqrt{\dfrac{\mu_0}{\varepsilon_0}} \approx 377\ \Omega\)`,
    extra: 'The ratio of the electric to the magnetic field strength in a plane wave travelling through a vacuum.',
  },
  {
    front: 'Skin depth',
    back: r`\(\delta = \sqrt{\dfrac{2}{\omega\mu\sigma}} = \dfrac{1}{\sqrt{\pi f \mu \sigma}}\)`,
    extra: r`The depth at which current density falls to \(1/e\) of its surface value. In copper it is about \(9\ \mathrm{mm}\) at \(50\ \mathrm{Hz}\) and \(65\ \mathrm{\mu m}\) at \(1\ \mathrm{MHz}\).`,
  },
  // Power electronics
  {
    front: 'Output voltage of an ideal buck converter',
    back: r`\(V_{\text{out}} = D\,V_{\text{in}}\)`,
    extra: r`\(D\) is the duty cycle, between 0 and 1, in continuous conduction mode.`,
  },
  {
    front: 'Output voltage of an ideal boost converter',
    back: r`\(V_{\text{out}} = \dfrac{V_{\text{in}}}{1 - D}\)`,
    extra: 'In continuous conduction mode; a duty cycle of 0.5 doubles the input voltage.',
  },
  {
    front: 'Pulse-width modulation (PWM)',
    back: r`Switching at a fixed frequency and varying the duty cycle \(D = t_{\text{on}}/T\) to control the average output`,
    extra: 'Because the switch is either fully on or fully off, it dissipates little power.',
  },
  {
    front: 'Inductor volt-second balance',
    back: 'In periodic steady state, the average voltage across an inductor over one switching period is zero',
    extra: 'Applying it to the on and off intervals gives the conversion ratios of the buck and boost converters.',
  },
  // Power systems
  {
    front: 'Base impedance in a per-unit system',
    back: r`\(Z_{\text{base}} = \dfrac{V_{\text{base}}^2}{S_{\text{base}}}\)`,
    extra: r`In three-phase systems, use the line-to-line base voltage and the three-phase base power. Then \(Z_{\text{pu}} = Z/Z_{\text{base}}\).`,
  },
  {
    front: 'Converting a per-unit impedance to a new base',
    back: r`\(Z_{\text{pu,new}} = Z_{\text{pu,old}} \left(\dfrac{V_{\text{base,old}}}{V_{\text{base,new}}}\right)^2 \dfrac{S_{\text{base,new}}}{S_{\text{base,old}}}\)`,
    extra: 'Needed because nameplates give impedances on each machine’s own rating.',
  },
  {
    front: 'Synchronous speed',
    back: r`\(n_s = \dfrac{120 f}{p}\) revolutions per minute`,
    extra: r`\(p\) is the number of poles: a four-pole machine on \(50\ \mathrm{Hz}\) turns at \(1500\ \mathrm{rpm}\).`,
  },
  {
    front: 'Power–angle equation of a synchronous generator',
    back: r`\(P = \dfrac{E\,V}{X_s}\sin\delta\)`,
    extra: r`Per phase, for a round-rotor machine with resistance neglected. \(E\) is the internal EMF, \(X_s\) the synchronous reactance and \(\delta\) the power angle.`,
  },
  {
    front: 'Symmetrical components',
    back: 'Any set of three unbalanced phasors can be written as the sum of balanced positive-sequence, negative-sequence and zero-sequence sets',
    extra: r`They use the operator \(a = 1\angle 120^\circ\), and turn an unbalanced fault into three decoupled sequence networks.`,
  },
  {
    front: 'Fault current for a single line-to-ground fault',
    back: r`\(I_f = \dfrac{3V_f}{Z_1 + Z_2 + Z_0 + 3Z_f}\)`,
    extra: r`\(Z_1\), \(Z_2\) and \(Z_0\) are the positive-, negative- and zero-sequence impedances at the fault, \(Z_f\) the fault impedance and \(V_f\) the pre-fault voltage.`,
  },
  // Communications
  {
    front: 'Shannon–Hartley channel capacity',
    back: r`\(C = B\log_2\!\left(1 + \dfrac{S}{N}\right)\) bits per second`,
    extra: r`\(B\) is the bandwidth in hertz and \(S/N\) the signal-to-noise power ratio as a plain ratio, not in decibels.`,
  },
  {
    front: 'Amplitude-modulated (AM) signal',
    back: r`\(s(t) = A_c\,[1 + m\cos(\omega_m t)]\cos(\omega_c t)\)`,
    extra: r`\(m\) is the modulation index, kept at or below 1 to avoid overmodulation. The bandwidth is twice the highest message frequency.`,
  },
  {
    front: 'Total power of an AM signal',
    back: r`\(P_t = P_c\left(1 + \dfrac{m^2}{2}\right)\)`,
    extra: r`\(P_c\) is the carrier power. Even at \(m = 1\), only a third of the power is in the sidebands that carry the message.`,
  },
  {
    front: 'Carson’s rule for FM bandwidth',
    back: r`\(B \approx 2(\Delta f + f_m)\)`,
    extra: r`\(\Delta f\) is the peak frequency deviation and \(f_m\) the highest modulating frequency; their ratio \(\beta = \Delta f/f_m\) is the modulation index.`,
  },
  // Noise
  {
    front: 'Thermal (Johnson–Nyquist) noise voltage',
    back: r`\(v_{n,\text{rms}} = \sqrt{4kTRB}\)`,
    extra: r`\(k\) is Boltzmann’s constant, \(T\) the temperature in kelvin and \(B\) the bandwidth. A \(1\ \mathrm{k\Omega}\) resistor at room temperature gives about \(4\ \mathrm{nV/\sqrt{Hz}}\).`,
  },
  {
    front: 'Thermal noise floor at room temperature',
    back: r`About \(-174\ \mathrm{dBm/Hz}\)`,
    extra: r`The available noise power is \(kTB\): at \(290\ \mathrm{K}\) that is \(4 \times 10^{-21}\ \mathrm{W}\) per hertz of bandwidth.`,
  },
  {
    front: 'Noise figure',
    back: r`\(\mathrm{NF} = 10\log_{10}\dfrac{\mathrm{SNR}_{\text{in}}}{\mathrm{SNR}_{\text{out}}}\), in decibels`,
    extra: r`How much a stage degrades the signal-to-noise ratio, defined with the source at \(290\ \mathrm{K}\). The linear ratio is the noise factor \(F\).`,
  },
  {
    front: 'Friis formula for cascaded noise factor',
    back: r`\(F = F_1 + \dfrac{F_2 - 1}{G_1} + \dfrac{F_3 - 1}{G_1 G_2} + \cdots\)`,
    extra: r`\(F_i\) and \(G_i\) are each stage’s noise factor and gain as linear ratios. The first stage dominates, which is why receivers start with a low-noise amplifier.`,
  },
]

export const ELECTRICAL_ENGINEERING_ADVANCED: PublicDeck = {
  slug: 'electrical-engineering-advanced',
  title: 'Advanced electrical engineering: 50 upper-level concepts',
  shortTitle: 'Advanced electrical engineering',
  category: 'engineering',
  level: 'advanced',
  icon: 'spark',
  description:
    'Upper-level electrical engineering: Laplace and Z transforms, Bode and Nyquist stability, DSP, transmission lines, Maxwell’s equations, power systems and noise.',
  intro:
    'Upper-level electrical engineering ties circuits to systems, fields and power. This deck covers Laplace and Z transforms, transfer functions and Bode plots, stability tests from Routh to Nyquist, sampling and digital signal processing, transmission lines and the Smith chart, Maxwell’s equations, switching converters, per-unit power system analysis and faults, modulation and channel capacity, and noise.',
  faq: [
    {
      q: 'Who is this deck for?',
      a: 'Third- and fourth-year students, graduate students, and working engineers reviewing for professional exams or interviews. It assumes the material in the basics and intermediate decks.',
    },
    {
      q: 'Which sign conventions do the cards use?',
      a: 'Common engineering ones: j for the imaginary unit, the unilateral Laplace transform from 0−, and the Nyquist criterion as Z = N + P with clockwise encirclements. Textbooks vary, so check yours before an exam.',
    },
    {
      q: 'Why do power engineers use per-unit values?',
      a: 'Expressing quantities as fractions of chosen base values removes the turns ratios of ideal transformers from the analysis, keeps numbers close to 1 and makes errors easy to spot.',
    },
  ],
  cards: CARDS,
}
