import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'

const CARDS: CardContent[] = [
  // The skeleton as a whole
  {
    front: 'How many bones are in the adult human skeleton?',
    back: '206',
    extra: 'Babies are born with more separate bones, around 270, many of which fuse during childhood.',
  },
  {
    front: 'Axial vs appendicular skeleton',
    back: 'Axial (80 bones): the skull, ear ossicles, hyoid, vertebral column, ribs and sternum. Appendicular (126 bones): the limbs plus the shoulder and pelvic girdles',
  },
  {
    front: 'Functions of the skeleton',
    back: 'Support, protection of organs, movement together with muscles, blood cell production in red marrow, and storage of minerals such as calcium and phosphate',
    extra: 'Yellow marrow also stores fat.',
  },
  {
    front: 'The five bone shapes, with an example of each',
    back: 'Long (femur), short (carpals), flat (sternum), irregular (vertebrae) and sesamoid (patella)',
  },
  {
    front: 'Longest and strongest bone in the body',
    back: 'The femur (thighbone)',
    extra: 'Its length is roughly a quarter of a person’s height.',
  },
  {
    front: 'Hands and feet: how many bones together?',
    back: '106, more than half of the 206 in the body',
    extra: '27 in each hand and 26 in each foot.',
  },
  // Skull
  {
    front: 'How many bones are in the skull?',
    back: '22: 8 cranial bones and 14 facial bones',
    extra: 'This count leaves out the six ear ossicles and the hyoid.',
  },
  {
    front: 'The eight cranial bones',
    back: 'Frontal, occipital, sphenoid and ethmoid, plus two parietal and two temporal bones',
  },
  {
    front: 'The fourteen facial bones',
    back: 'Two each of the maxilla, zygomatic, nasal, lacrimal, palatine and inferior nasal concha, plus the vomer and the mandible',
  },
  {
    front: 'The only skull bone that moves',
    back: 'The mandible (lower jaw), which moves at the temporomandibular joint',
    extra: 'It is also the largest and strongest bone of the face.',
  },
  {
    front: 'Upper jaw bone',
    back: 'The maxilla, a pair of bones fused at the midline',
    extra: 'It holds the upper teeth and forms part of the eye sockets, the nasal cavity and the hard palate.',
  },
  { front: 'Cheekbone', back: 'The zygomatic bone' },
  {
    front: 'Foramen magnum',
    back: 'The large opening in the occipital bone where the brainstem continues into the spinal cord',
  },
  {
    front: 'Skull sutures',
    back: 'Immovable fibrous joints between skull bones: the coronal (frontal and parietals), sagittal (between the parietals) and lambdoid (parietals and occipital) sutures',
  },
  {
    front: 'Fontanelles',
    back: 'Soft, membrane-covered gaps between a baby’s skull bones that let the skull flex during birth and grow afterward',
    extra: 'The largest, the anterior fontanelle, usually closes by about age 2.',
  },
  {
    front: 'The three ear ossicles',
    back: 'Malleus (hammer), incus (anvil) and stapes (stirrup), which pass sound vibrations from the eardrum to the inner ear',
  },
  { front: 'Smallest bone in the body', back: 'The stapes (stirrup) in the middle ear, about 3 mm long' },
  {
    front: 'Hyoid bone',
    back: 'A U-shaped bone in the neck that anchors the tongue; it is the only bone that doesn’t form a joint with any other bone',
  },
  // Vertebral column
  {
    front: 'Number of vertebrae in each region of the spine',
    back: 'Cervical 7, thoracic 12, lumbar 5, then the sacrum (5 fused) and the coccyx (usually 4 fused)',
    extra: 'A mnemonic: breakfast at 7, lunch at 12, dinner at 5.',
  },
  {
    front: 'How many bones make up the adult vertebral column?',
    back: '26: 24 separate vertebrae plus the sacrum and the coccyx',
    extra: 'Counting the fused pieces separately gives 33.',
  },
  {
    front: 'Atlas (C1)',
    back: 'The first cervical vertebra, a ring that holds up the skull; it has no body, and nodding happens at its joint with the skull',
  },
  {
    front: 'Axis (C2)',
    back: 'The second cervical vertebra; the atlas and skull rotate around its peg-like dens, as when you shake your head',
  },
  {
    front: 'Natural curves of the spine',
    back: 'The cervical and lumbar curves bulge toward the front (lordosis); the thoracic and sacral curves bulge toward the back (kyphosis)',
  },
  {
    front: 'Intervertebral disc',
    back: 'A pad of fibrocartilage between two vertebrae: a tough outer ring (annulus fibrosus) around a gel-like core (nucleus pulposus) that absorbs shock',
    extra: 'In a herniated (slipped) disc, the core pushes out through a tear in the ring.',
  },
  {
    front: 'Sacrum',
    back: 'A triangular bone of five fused vertebrae that joins the hip bones at the sacroiliac joints',
  },
  // Thorax
  { front: 'How many ribs do humans have?', back: '12 pairs (24 ribs)', extra: 'Men and women have the same number.' },
  {
    front: 'True, false and floating ribs',
    back: 'True ribs (pairs 1–7) attach to the sternum by their own cartilage; false ribs (pairs 8–12) don’t; floating ribs (pairs 11–12) don’t reach the sternum at all',
  },
  { front: 'The three parts of the sternum', back: 'Manubrium, body and xiphoid process' },
  // Upper limb
  {
    front: 'Bones of the shoulder (pectoral) girdle',
    back: 'The clavicle (collarbone) and the scapula (shoulder blade) on each side',
    extra: 'The joint between the clavicle and the sternum is the arm’s only bony connection to the axial skeleton.',
  },
  {
    front: 'Upper arm bone',
    back: 'The humerus',
    extra: 'The “funny bone” is really the ulnar nerve, which runs behind the inner bump of the humerus at the elbow.',
  },
  {
    front: 'Radius vs ulna',
    back: 'Both are forearm bones: the radius is on the thumb side, the ulna on the little-finger side',
    extra: 'The point of the elbow is the olecranon, part of the ulna.',
  },
  { front: 'Bones of the hand', back: '27: 8 carpals, 5 metacarpals and 14 phalanges' },
  {
    front: 'The eight carpal bones',
    back: 'Scaphoid, lunate, triquetrum, pisiform, trapezium, trapezoid, capitate and hamate',
    extra:
      'Listed from the thumb side, the row nearer the forearm first. Mnemonic: Some Lovers Try Positions That They Can’t Handle.',
  },
  {
    front: 'Most commonly broken carpal bone',
    back: 'The scaphoid, usually from a fall onto an outstretched hand',
  },
  {
    front: 'Phalanges in the thumb vs the other fingers',
    back: 'The thumb has two (proximal and distal); each other finger has three (proximal, middle and distal)',
    extra: 'The toes follow the same pattern: two in the big toe, three in each of the others.',
  },
  // Lower limb
  {
    front: 'The three bones that fuse to form each hip bone',
    back: 'Ilium, ischium and pubis',
    extra: 'They meet in the acetabulum, the socket for the head of the femur.',
  },
  { front: 'The hip bone you sit on', back: 'The ischium, at its ischial tuberosities' },
  {
    front: 'Kneecap',
    back: 'The patella, the largest sesamoid bone (a bone that develops inside a tendon)',
    extra: 'It sits in the tendon of the quadriceps muscle.',
  },
  {
    front: 'Tibia vs fibula',
    back: 'The tibia (shinbone) is the thick inner bone that carries most of the body’s weight; the fibula is the thin outer bone',
  },
  {
    front: 'The two bony bumps of the ankle',
    back: 'The medial malleolus (inner ankle) is part of the tibia; the lateral malleolus (outer ankle) is part of the fibula',
  },
  { front: 'Bones of the foot', back: '26: 7 tarsals, 5 metatarsals and 14 phalanges' },
  {
    front: 'The seven tarsal bones',
    back: 'Calcaneus, talus, navicular, cuboid, and the medial, intermediate and lateral cuneiforms',
  },
  { front: 'Heel bone', back: 'The calcaneus, the largest bone of the foot' },
  {
    front: 'Talus',
    back: 'The ankle bone that links the leg to the foot, fitting under the tibia and between the malleoli',
    extra: 'No muscles attach to it.',
  },
  // Joints
  {
    front: 'Three structural types of joint',
    back: 'Fibrous (skull sutures), cartilaginous (intervertebral discs, pubic symphysis) and synovial (knee, shoulder)',
    extra: 'Synovial joints move freely; their bone ends are capped with cartilage and lubricated by synovial fluid.',
  },
  {
    front: 'Ball-and-socket joints',
    back: 'The shoulder and the hip; they allow movement in every direction, including rotation',
  },
  {
    front: 'Hinge joints',
    back: 'The elbow, the knee and the joints between finger bones; they bend and straighten in one plane',
  },
  {
    front: 'Pivot joints',
    back: 'Between the atlas and the axis, which turns the head, and between the radius and ulna near the elbow, which turns the forearm',
  },
  {
    front: 'Saddle joint',
    back: 'The joint at the base of the thumb (the first carpometacarpal joint), which lets the thumb move across the palm to touch the fingertips',
  },
  { front: 'Ligament vs tendon', back: 'Ligaments connect bone to bone; tendons connect muscle to bone' },
]

export const HUMAN_SKELETON: PublicDeck = {
  slug: 'human-skeleton',
  title: 'Human skeleton: 50 cards on bones and joints',
  shortTitle: 'Human skeleton',
  category: 'biology',
  level: 'beginner',
  icon: 'flask',
  description:
    'Learn the bones of the human skeleton: skull, spine, ribs, arms, hands, legs and feet, with bone counts, joint types and key facts.',
  intro:
    'The adult skeleton has 206 bones, and anatomy courses expect you to name most of them. This deck works from the skull and spine through the ribs, arms, hands, legs and feet, with the counts that come up again and again and a few cards on how joints move.',
  faq: [
    {
      q: 'Who is this deck for?',
      a: 'Students of biology, anatomy and physiology, nursing, physical therapy or sports science, and anyone curious about how the body is built.',
    },
    {
      q: 'Does it cover all 206 bones?',
      a: 'It covers every region and names the individual cranial, facial, carpal and tarsal bones. Repeated bones such as ribs, vertebrae and phalanges are learned as groups with their counts.',
    },
    {
      q: 'Why does a baby have more bones than an adult?',
      a: 'Many bones start out as several separate pieces, for example in the skull, the sacrum and the hip bones, and fuse during childhood and adolescence.',
    },
  ],
  cards: CARDS,
}
