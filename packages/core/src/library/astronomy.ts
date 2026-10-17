import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const r = String.raw

const CARDS: CardContent[] = [
  // The solar system
  {
    front: 'The planets in order from the Sun',
    back: 'Mercury, Venus, Earth, Mars, Jupiter, Saturn, Uranus, Neptune',
    extra: 'Pluto was reclassified as a dwarf planet in 2006.',
  },
  {
    front: 'The IAU definition of a planet',
    back: 'A body that orbits the Sun, is massive enough for its gravity to make it nearly round, and has cleared the neighborhood around its orbit',
    extra: 'Pluto meets the first two conditions but not the third.',
  },
  {
    front: 'The five dwarf planets recognized by the IAU',
    back: 'Ceres, Pluto, Haumea, Makemake and Eris',
    extra: 'Ceres is the largest object in the asteroid belt between Mars and Jupiter; the others lie beyond Neptune.',
  },
  {
    front: 'Rocky planets, gas giants and ice giants',
    back: 'Rocky: Mercury, Venus, Earth and Mars. Gas giants: Jupiter and Saturn, mostly hydrogen and helium. Ice giants: Uranus and Neptune, rich in water, ammonia and methane',
  },
  {
    front: 'Smallest planet, and the closest to the Sun',
    back: 'Mercury',
    extra: 'It has no moons and almost no atmosphere, so its surface swings from about 430 °C by day to about −180 °C at night.',
  },
  {
    front: 'Hottest planet, and why',
    back: 'Venus: its thick carbon dioxide atmosphere traps heat in a runaway greenhouse effect, keeping the surface above 450 °C',
    extra: 'It is hotter than Mercury despite being almost twice as far from the Sun.',
  },
  {
    front: 'Planet that takes longer to spin once than to orbit the Sun',
    back: 'Venus: one rotation takes about 243 Earth days, one orbit about 225',
    extra: 'It also spins backward compared with most planets, so the Sun rises in the west.',
  },
  {
    front: 'Why is Mars red?',
    back: 'Iron oxide (rust) in its dust and rocks',
    extra: 'Mars has the largest volcano in the solar system, Olympus Mons, and two small moons, Phobos and Deimos.',
  },
  {
    front: 'Largest planet',
    back: 'Jupiter, more than twice as massive as all the other planets combined',
    extra: 'Its Great Red Spot is a giant storm that has raged for well over a century.',
  },
  {
    front: 'Jupiter’s four largest moons',
    back: 'Io, Europa, Ganymede and Callisto, the Galilean moons',
    extra:
      'Galileo discovered them in 1610. Ganymede is the largest moon in the solar system, bigger than Mercury, and Io is the most volcanically active world.',
  },
  {
    front: 'Planet less dense than water',
    back: 'Saturn',
    extra: 'Its rings are made mostly of water ice, in pieces from dust grains to house-sized chunks.',
  },
  {
    front: 'Saturn’s largest moon, and what makes it unique',
    back: 'Titan: the only moon with a thick atmosphere, and the only world besides Earth known to have lakes and seas on its surface',
    extra: 'Its lakes and seas are liquid methane and ethane.',
  },
  {
    front: 'Planet that spins on its side',
    back: 'Uranus, with an axial tilt of about 98°',
    extra: 'A giant collision early in its history is the leading explanation.',
  },
  {
    front: 'Farthest planet from the Sun',
    back: 'Neptune, about 30 AU away',
    extra:
      'It was found in 1846 close to where mathematicians had predicted from irregularities in Uranus’s orbit. Its winds are the fastest in the solar system, above 2,000 km/h.',
  },
  {
    front: 'Kuiper belt',
    back: 'A broad ring of icy bodies beyond Neptune, from about 30 to 50 AU from the Sun, home to Pluto and other dwarf planets',
  },
  // The Sun and the lives of stars
  {
    front: 'What kind of star is the Sun?',
    back: 'A yellow dwarf (a G-type main-sequence star), about 4.6 billion years old',
    extra: 'It holds about 99.8% of the solar system’s mass.',
  },
  {
    front: 'How does the Sun produce energy?',
    back: 'Nuclear fusion in its core turns hydrogen into helium, mostly through the proton–proton chain',
    extra: 'The core is about 15 million °C.',
  },
  {
    front: 'Life cycle of a Sun-like star',
    back: 'Nebula, protostar, main-sequence star, red giant, planetary nebula, white dwarf',
    extra: 'The Sun is about halfway through its roughly 10-billion-year life on the main sequence.',
  },
  {
    front: 'Life cycle of a massive star',
    back: 'Nebula, protostar, main-sequence star, red supergiant, supernova, then a neutron star or a black hole',
  },
  {
    front: 'Star colors from hottest to coolest',
    back: 'Blue, white, yellow, orange, red',
    extra: 'The spectral classes in the same order are O, B, A, F, G, K and M.',
  },
  {
    front: 'Hertzsprung–Russell diagram',
    back: 'A plot of stars’ luminosity against surface temperature; most stars, including the Sun, lie on a diagonal band called the main sequence',
    extra: 'Temperature increases to the left. Giants sit above the main sequence and white dwarfs below it.',
  },
  {
    front: 'White dwarf',
    back: 'The hot, dense core left behind by a Sun-like star: about the size of Earth, with a mass comparable to the Sun’s',
    extra: 'A white dwarf can’t be heavier than about 1.4 solar masses, the Chandrasekhar limit.',
  },
  {
    front: 'Neutron star',
    back: 'The collapsed core of a massive star after a supernova, typically about 1.4 solar masses packed into a sphere about 20 km across',
    extra: 'A pulsar is a spinning neutron star whose beams of radiation sweep past Earth.',
  },
  {
    front: 'Black hole',
    back: 'A region where gravity is so strong that nothing, not even light, can escape; its boundary is the event horizon',
    extra: 'Stellar black holes form when the cores of very massive stars collapse.',
  },
  {
    front: 'Supermassive black hole at the center of the Milky Way',
    back: 'Sagittarius A* (“A-star”), about 4 million times the mass of the Sun',
    extra:
      'The Event Horizon Telescope imaged it in 2022. Its first black hole image, released in 2019, showed the one in galaxy M87.',
  },
  // Stars and constellations
  {
    front: 'Brightest star in the night sky',
    back: 'Sirius, in Canis Major, about 8.6 light-years away',
    extra: 'It has a faint white dwarf companion, Sirius B.',
  },
  {
    front: 'Nearest star to the Sun',
    back: 'Proxima Centauri, about 4.2 light-years away',
    extra: 'It belongs to the Alpha Centauri system and has at least one known planet, Proxima b.',
  },
  {
    front: 'Polaris',
    back: 'The North Star: it sits almost directly above Earth’s North Pole, so it stays nearly still while the other stars circle around it',
    extra:
      'Follow the two pointer stars at the end of the Big Dipper’s bowl to find it. It isn’t especially bright: dozens of stars outshine it.',
  },
  {
    front: 'Betelgeuse',
    back: 'A red supergiant at Orion’s shoulder, expected to explode as a supernova within the next 100,000 years or so',
    extra: 'Its sharp dimming in 2019–2020, the “Great Dimming”, was caused mainly by a cloud of dust it had thrown off.',
  },
  {
    front: 'Constellation with Betelgeuse, Rigel and a belt of three stars',
    back: 'Orion',
    extra: 'The Orion Nebula, a nearby star-forming region, lies in the sword that hangs below the belt.',
  },
  {
    front: 'How many constellations are officially recognized?',
    back: '88, with boundaries set by the International Astronomical Union',
    extra: 'Together they cover the whole sky, like countries on a map.',
  },
  {
    front: 'Is the Big Dipper a constellation?',
    back: 'No. It is an asterism, a pattern of seven bright stars within the constellation Ursa Major',
  },
  // Galaxies and the universe
  {
    front: 'What kind of galaxy is the Milky Way?',
    back: 'A barred spiral galaxy about 100,000 light-years across, with a few hundred billion stars',
    extra: 'The Sun lies about 26,000 light-years from the center, in a minor spiral arm called the Orion Spur.',
  },
  {
    front: 'Nearest large spiral galaxy to the Milky Way',
    back: 'The Andromeda Galaxy (M31), about 2.5 million light-years away',
    extra: 'From a dark site it is visible to the naked eye as a faint smudge.',
  },
  {
    front: 'Main types of galaxy',
    back: 'Spiral, elliptical and irregular',
    extra: 'Edwin Hubble’s classification also includes barred spirals and lenticular galaxies.',
  },
  {
    front: 'Hubble’s law',
    back: r`Galaxies recede from us at a speed proportional to their distance: \(v = H_0 d\)`,
    extra:
      'It shows the universe is expanding. Measurements of the Hubble constant range from about 67 to 73 km/s per megaparsec; the disagreement is called the Hubble tension.',
  },
  { front: 'Age of the universe', back: 'About 13.8 billion years' },
  // Distances
  {
    front: 'Astronomical unit (AU)',
    back: 'The average distance between Earth and the Sun, about 150 million km',
    extra: 'Since 2012 it has been defined as exactly 149,597,870,700 m. Sunlight crosses it in about 8 minutes 20 seconds.',
  },
  {
    front: 'Light-year',
    back: 'The distance light travels in one year, about 9.46 trillion km',
    extra: 'It is a unit of distance, not of time.',
  },
  {
    front: 'Parsec',
    back: 'The distance at which a star shows a parallax of one arcsecond, about 3.26 light-years',
    extra: r`Distance in parsecs is \(d = 1/p\), with the parallax \(p\) in arcseconds.`,
  },
  // Earth, Moon and sky
  {
    front: 'What causes the seasons?',
    back: 'Earth’s axis is tilted about 23.4°, so each hemisphere gets more direct sunlight for half the year; the distance from the Sun has little to do with it',
    extra: 'Earth is actually closest to the Sun in early January.',
  },
  {
    front: 'Solstice vs equinox',
    back: 'At a solstice the Sun reaches its farthest north or south, giving the longest or shortest day (around 21 June and 21 December). At an equinox day and night are nearly equal everywhere (around 20 March and 22 September)',
  },
  {
    front: 'Phases of the Moon, in order',
    back: 'New moon, waxing crescent, first quarter, waxing gibbous, full moon, waning gibbous, last quarter, waning crescent',
    extra: 'A full cycle takes about 29.5 days.',
  },
  {
    front: 'Why do we always see the same side of the Moon?',
    back: 'It is tidally locked: it spins exactly once per orbit, about every 27.3 days',
  },
  {
    front: 'Solar eclipse',
    back: 'The Moon passes between the Sun and Earth and its shadow falls on Earth; it can only happen at new moon',
  },
  {
    front: 'Lunar eclipse',
    back: 'Earth passes between the Sun and the Moon, and the Moon moves into Earth’s shadow; it can only happen at full moon',
    extra: 'The Moon turns red because Earth’s atmosphere bends reddened sunlight into the shadow.',
  },
  {
    front: 'Why isn’t there an eclipse every month?',
    back: 'The Moon’s orbit is tilted about 5° to Earth’s, so at most new and full moons the shadows miss',
  },
  // Exoplanets
  {
    front: 'Exoplanet',
    back: 'A planet orbiting a star other than the Sun; more than 6,000 have been confirmed',
    extra: 'The first one found around a Sun-like star was 51 Pegasi b, in 1995.',
  },
  {
    front: 'Transit method',
    back: 'Finds a planet from the small, regular dip in a star’s brightness each time the planet passes in front of it',
    extra: 'The Kepler and TESS space telescopes found thousands of planets this way.',
  },
  {
    front: 'Habitable zone',
    back: 'The range of distances from a star at which a planet could have liquid water on its surface',
  },
]

export const ASTRONOMY: PublicDeck = {
  slug: 'astronomy',
  title: 'Astronomy basics: 50 cards on planets, stars and galaxies',
  shortTitle: 'Astronomy',
  category: 'physics',
  level: 'beginner',
  icon: 'spark',
  description:
    'Astronomy basics: the planets, the Sun and how stars live and die, famous stars and constellations, galaxies, cosmic distances, eclipses and exoplanets.',
  intro:
    'A tour of the night sky and what lies beyond it. This deck covers the eight planets and their standout facts, how stars like the Sun are born and die, stars and constellations you can find yourself, galaxies and black holes, the units astronomers use for distance, and why we have seasons, moon phases and eclipses.',
  faq: [
    {
      q: 'Do I need math or physics for this deck?',
      a: 'No. The cards are about facts and ideas; the only formulas are Hubble’s law and the link between parallax and distance.',
    },
    {
      q: 'Why isn’t Pluto a planet?',
      a: 'In 2006 the International Astronomical Union defined a planet as a body that orbits the Sun, is round and has cleared its orbit of other objects. Pluto shares its region with many Kuiper belt objects, so it is classed as a dwarf planet.',
    },
    {
      q: 'Are the numbers up to date?',
      a: 'Yes. Where a figure keeps growing, such as the number of known exoplanets, the card gives a lower bound rather than an exact count.',
    },
  ],
  cards: CARDS,
}
