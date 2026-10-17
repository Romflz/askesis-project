import { ANGULAR } from './angular.ts'
import { API_DESIGN } from './api-design.ts'
import { ARABIC_ALPHABET } from './arabic-alphabet.ts'
import { ASTRONOMY } from './astronomy.ts'
import { AWS_ESSENTIALS } from './aws-essentials.ts'
import { BASH_SCRIPTING } from './bash-scripting.ts'
import { CALCULUS } from './calculus.ts'
import { CELL_BIOLOGY } from './cell-biology.ts'
import { CHEMISTRY } from './chemistry.ts'
import { COMPUTER_SCIENCE } from './computer-science.ts'
import { CPP } from './cpp.ts'
import { CRYPTOGRAPHY } from './cryptography.ts'
import { CSHARP } from './csharp.ts'
import { CYBER_SECURITY } from './cyber-security.ts'
import { DATA_ANALYSIS } from './data-analysis.ts'
import { DESIGN_PATTERNS } from './design-patterns.ts'
import { DOCKER } from './docker.ts'
import { DSA } from './dsa.ts'
import { ELIXIR } from './elixir.ts'
import { ESPERANTO } from './esperanto.ts'
import { FLUTTER } from './flutter.ts'
import { FRENCH } from './french.ts'
import { GERMAN } from './german.ts'
import { GIT } from './git.ts'
import { GO } from './go.ts'
import { GRAPHQL } from './graphql.ts'
import { GREEK_ALPHABET } from './greek-alphabet.ts'
import { HASKELL } from './haskell.ts'
import { HIRAGANA } from './hiragana.ts'
import { HTML_CSS } from './html-css.ts'
import { HUMAN_SKELETON } from './human-skeleton.ts'
import { ITALIAN } from './italian.ts'
import { JAVA } from './java.ts'
import { JAVASCRIPT_ADVANCED } from './javascript-advanced.ts'
import { JAVASCRIPT } from './javascript.ts'
import { JLPT_N1_KANJI } from './jlpt-n1-kanji.ts'
import { JLPT_N1_VOCABULARY } from './jlpt-n1-vocabulary.ts'
import { JLPT_N2_KANJI } from './jlpt-n2-kanji.ts'
import { JLPT_N2_VOCABULARY } from './jlpt-n2-vocabulary.ts'
import { JLPT_N3_KANJI } from './jlpt-n3-kanji.ts'
import { JLPT_N3_VOCABULARY } from './jlpt-n3-vocabulary.ts'
import { JLPT_N4_KANJI } from './jlpt-n4-kanji.ts'
import { JLPT_N4_VOCABULARY } from './jlpt-n4-vocabulary.ts'
import { JLPT_N5_VOCABULARY } from './jlpt-n5-vocabulary.ts'
import { JLPT_N5_KANJI } from './kanji.ts'
import { KATAKANA } from './katakana.ts'
import { KOREAN_HANGUL } from './korean-hangul.ts'
import { KOTLIN } from './kotlin.ts'
import { KUBERNETES } from './kubernetes.ts'
import { LINEAR_ALGEBRA } from './linear-algebra.ts'
import { LINUX } from './linux.ts'
import { MACHINE_LEARNING } from './machine-learning.ts'
import { MANDARIN_HSK1 } from './mandarin-hsk1.ts'
import { MONGODB } from './mongodb.ts'
import { MORSE_CODE } from './morse-code.ts'
import { NETWORKING } from './networking.ts'
import { NEXTJS } from './nextjs.ts'
import { NODEJS } from './nodejs.ts'
import { NUMBER_THEORY } from './number-theory.ts'
import { ORGANIC_CHEMISTRY } from './organic-chemistry.ts'
import { PERIODIC_TABLE } from './periodic-table.ts'
import { PHP } from './php.ts'
import { PHYSICS } from './physics.ts'
import { PORTUGUESE } from './portuguese.ts'
import { POSTGRESQL } from './postgresql.ts'
import { PROMPT_ENGINEERING } from './prompt-engineering.ts'
import { PYTHON } from './python.ts'
import { REACT } from './react.ts'
import { REDIS } from './redis.ts'
import { REGEX } from './regex.ts'
import { RUBY } from './ruby.ts'
import { RUSSIAN_CYRILLIC } from './russian-cyrillic.ts'
import { RUST } from './rust.ts'
import { SOFTWARE_TESTING } from './software-testing.ts'
import { SPANISH } from './spanish.ts'
import { SQL } from './sql.ts'
import { STATISTICS } from './statistics.ts'
import { SWIFT } from './swift.ts'
import { SYSTEM_DESIGN } from './system-design.ts'
import { TERRAFORM_ESSENTIALS } from './terraform-essentials.ts'
import { TYPESCRIPT } from './typescript.ts'
import { VIM } from './vim.ts'
import { VUE } from './vue.ts'
import { X86_ASSEMBLY } from './x86-assembly.ts'
import type { PublicCategory, PublicCategorySlug, PublicDeck } from './types.ts'

export type { PublicCategory, PublicCategorySlug, PublicDeck } from './types.ts'
export { plainText } from './util.ts'

/** Every public deck, grouped by topic and easiest first within each: the order /practice shows. */
export const PUBLIC_DECKS: PublicDeck[] = [
  // Japanese: scripts, then JLPT kanji and vocabulary from N5 (easiest) to N1
  HIRAGANA,
  KATAKANA,
  JLPT_N5_KANJI,
  JLPT_N5_VOCABULARY,
  JLPT_N4_KANJI,
  JLPT_N4_VOCABULARY,
  JLPT_N3_KANJI,
  JLPT_N3_VOCABULARY,
  JLPT_N2_KANJI,
  JLPT_N2_VOCABULARY,
  JLPT_N1_KANJI,
  JLPT_N1_VOCABULARY,
  // Other languages: everyday words first, then new scripts
  SPANISH,
  FRENCH,
  GERMAN,
  ITALIAN,
  PORTUGUESE,
  ESPERANTO,
  KOREAN_HANGUL,
  RUSSIAN_CYRILLIC,
  GREEK_ALPHABET,
  ARABIC_ALPHABET,
  MANDARIN_HSK1,
  // Programming
  JAVASCRIPT,
  JAVASCRIPT_ADVANCED,
  TYPESCRIPT,
  PYTHON,
  GIT,
  JAVA,
  CSHARP,
  KOTLIN,
  SWIFT,
  FLUTTER,
  PHP,
  RUBY,
  GO,
  RUST,
  CPP,
  HASKELL,
  ELIXIR,
  X86_ASSEMBLY,
  REGEX,
  // Web development
  HTML_CSS,
  REACT,
  VUE,
  ANGULAR,
  NEXTJS,
  NODEJS,
  GRAPHQL,
  // Databases
  SQL,
  POSTGRESQL,
  MONGODB,
  REDIS,
  // Computer science
  COMPUTER_SCIENCE,
  MORSE_CODE,
  DSA,
  DESIGN_PATTERNS,
  SOFTWARE_TESTING,
  API_DESIGN,
  SYSTEM_DESIGN,
  CRYPTOGRAPHY,
  // Data & AI
  DATA_ANALYSIS,
  MACHINE_LEARNING,
  PROMPT_ENGINEERING,
  // IT & DevOps
  LINUX,
  BASH_SCRIPTING,
  VIM,
  NETWORKING,
  CYBER_SECURITY,
  DOCKER,
  KUBERNETES,
  AWS_ESSENTIALS,
  TERRAFORM_ESSENTIALS,
  // Chemistry
  PERIODIC_TABLE,
  CHEMISTRY,
  ORGANIC_CHEMISTRY,
  // Biology
  HUMAN_SKELETON,
  CELL_BIOLOGY,
  // Physics
  ASTRONOMY,
  PHYSICS,
  // Math
  CALCULUS,
  STATISTICS,
  LINEAR_ALGEBRA,
  NUMBER_THEORY,
]

/** The topics decks are grouped under, each with its landing-page copy. */
export const PUBLIC_CATEGORIES: PublicCategory[] = [
  {
    slug: 'japanese',
    title: 'Japanese',
    inlineTitle: 'Japanese',
    headline: 'Learn Japanese with spaced repetition: kana, JLPT N5–N1 kanji and vocabulary',
    description:
      'Free Japanese flashcards: hiragana, katakana, and JLPT N5–N1 kanji and vocabulary decks with spaced repetition. Practice in your browser, no signup needed.',
    intro:
      'Reading Japanese starts with two syllabaries, hiragana and katakana, then the most common kanji. These decks take you from zero to reading signs, menus and simple sentences, with every card scheduled at the moment you are about to forget it.',
    benefits: [
      { title: 'Read in weeks, not months', text: 'Both kana scripts fit in about two weeks of ten-minute sessions.' },
      {
        title: 'Readings and real words',
        text: 'Every kanji card shows on’yomi, kun’yomi and a common word, so characters come with context.',
      },
      { title: 'Proven review timings', text: 'Cards return on the proven SM-2 default schedule, or on FSRS if you turn it on.' },
    ],
    faq: [
      {
        q: 'What order should I learn Japanese scripts in?',
        a: 'Hiragana first, then katakana, then kanji. Kana readings are needed to learn kanji readings.',
      },
      {
        q: 'How many kanji do I need?',
        a: 'About 100 for the JLPT N5 and roughly 2,000 for everyday reading. Start with the 50 most common, then work up level by level.',
      },
      {
        q: 'Which JLPT levels are covered?',
        a: 'All five, N5 to N1, each with a 50-card kanji deck and a 50-card vocabulary deck. JLPT publishes no official lists, so levels follow widely used study lists.',
      },
      {
        q: 'Is it really free?',
        a: 'Yes. You can practice every deck without an account; a free account keeps your progress and schedule.',
      },
    ],
  },
  {
    slug: 'languages',
    title: 'Languages',
    inlineTitle: 'languages',
    headline: 'Language flashcards: European essentials, Mandarin HSK 1, and the Cyrillic, Greek, Arabic and Korean alphabets',
    description:
      'Free language flashcards: Spanish, French, German, Italian, Portuguese and Esperanto essentials, Mandarin HSK 1, and Hangul, Cyrillic, Greek and Arabic.',
    intro:
      'A small set of high-frequency words carries a large share of everyday conversation. These decks start with the words and phrases beginners need first, each with its article or gender and a short example sentence. Others teach a new script letter by letter, from Korean Hangul to Russian Cyrillic, Greek and Arabic, or the first Mandarin words with pinyin.',
    benefits: [
      {
        title: 'Genders from day one',
        text: 'Every noun comes with its article, so el and la, le and la, or der, die and das stick with the word.',
      },
      {
        title: 'Words in real sentences',
        text: 'Each card has a natural example sentence and its translation, so you see how the word is used.',
      },
      {
        title: 'Read a new script',
        text: 'Hangul, Cyrillic, Greek and Arabic letter by letter, with sounds, example words and, for Arabic, the joined forms.',
      },
    ],
    faq: [
      {
        q: 'Which languages are covered?',
        a: 'Spanish, French, German, Italian, Brazilian Portuguese and Esperanto essentials; Mandarin HSK 1 vocabulary; and the Korean, Russian, Greek and Arabic alphabets with first words. Japanese has its own topic with kana and JLPT decks.',
      },
      {
        q: 'Should I learn noun genders with each word?',
        a: 'Yes. Gender affects articles, adjectives and pronouns, and it is far easier to learn la maison or das Haus as a unit than to fix it later.',
      },
      {
        q: 'Are flashcards enough to learn a language?',
        a: 'They are the fastest way to build vocabulary, but pair them with listening, reading and speaking practice to put the words to use.',
      },
      {
        q: 'Is it free?',
        a: 'Yes. You can practice every deck without an account; a free account keeps your progress and schedule.',
      },
    ],
  },
  {
    slug: 'programming',
    title: 'Programming',
    inlineTitle: 'programming',
    headline: 'Programming flashcards: JavaScript, TypeScript, Python, Java, C#, Go, Rust and more',
    description:
      'Free flashcards for developers with highlighted code: JavaScript, TypeScript, Python, Java, C#, Go, Rust, C++, Haskell, Elixir, x86 assembly and more.',
    intro:
      'Developers look things up constantly, but the basics you recall instantly are the ones you actually use well. These decks cover the language features, query patterns and commands that come up in daily work and in technical interviews, each with a short, highlighted code example.',
    benefits: [
      { title: 'Real code, highlighted', text: 'Answers are runnable snippets with syntax highlighting, not vague definitions.' },
      {
        title: 'Interview-ready',
        text: 'Closures, the event loop, generics, ownership and rebasing: the questions interviewers love.',
      },
      {
        title: 'Five minutes a day',
        text: 'Spaced repetition shows each card just before you forget it, so short sessions are enough.',
      },
    ],
    faq: [
      {
        q: 'Are flashcards useful for learning to code?',
        a: 'For syntax, idioms and concepts, yes. They complement building projects by making the details automatic.',
      },
      {
        q: 'Which languages are covered?',
        a: 'JavaScript (essentials and advanced), TypeScript, Python, Java, C#, Kotlin, Swift, Flutter and Dart, PHP, Ruby, Go, Rust, C++, Haskell, Elixir and x86-64 assembly, plus Git and regex. Web frameworks, databases and computer science have their own topics, and Docker, Kubernetes, Linux and Vim are under IT & DevOps.',
      },
      {
        q: 'Can I make my own code cards?',
        a: 'Yes. Cards support fenced code blocks with highlighting for more than a dozen languages.',
      },
    ],
  },
  {
    slug: 'web',
    title: 'Web development',
    inlineTitle: 'web development',
    headline: 'Web development flashcards: HTML & CSS, React, Vue, Angular, Next.js, Node.js and GraphQL',
    description:
      'Free web development flashcards with highlighted code: HTML and CSS, React, Vue, Angular, Next.js, Node.js and GraphQL, for frontend and full-stack developers.',
    intro:
      'Frameworks change fast, but each one rests on a handful of ideas you use every day: components and props, reactivity, rendering on the server or the client, the event loop. These decks drill those ideas with short, highlighted examples, so they stay sharp between projects.',
    benefits: [
      {
        title: 'Frontend and backend',
        text: 'From semantic HTML and CSS layout to React, Vue and Angular, Next.js server components and Node.js internals.',
      },
      { title: 'Up to date', text: 'Modern APIs: hooks, the Composition API, signals, the App Router and ES modules.' },
      { title: 'Short, real snippets', text: 'Every code answer is a few highlighted lines you could paste into a project.' },
    ],
    faq: [
      {
        q: 'Which web framework deck should I start with?',
        a: 'Start with HTML & CSS and the JavaScript decks, then pick the framework you use: React, Vue or Angular. Next.js builds on React.',
      },
      {
        q: 'Are these decks for frontend or backend developers?',
        a: 'Both. The framework decks cover the frontend; Node.js and GraphQL cover the server side of a full-stack app.',
      },
      {
        q: 'Do the cards follow current versions?',
        a: 'Yes: React hooks, Vue 3, standalone components and signals in Angular, the Next.js App Router and modern Node.js.',
      },
    ],
  },
  {
    slug: 'databases',
    title: 'Databases',
    inlineTitle: 'databases',
    headline: 'Database flashcards: SQL, PostgreSQL, MongoDB and Redis',
    description:
      'Free database flashcards: SQL joins and window functions, PostgreSQL indexes, MVCC and JSONB, MongoDB queries and aggregation, and Redis data types and caching.',
    intro:
      'Most performance problems and many bugs trace back to the database. These decks cover the queries you write every day and the internals that explain why a query is slow, a transaction blocks or a cache goes stale, across relational, document and key-value stores.',
    benefits: [
      { title: 'Relational and NoSQL', text: 'SQL and PostgreSQL alongside MongoDB documents and Redis data structures.' },
      {
        title: 'Why, not just how',
        text: 'Indexes, isolation levels, MVCC, replication and eviction, explained in a line or two.',
      },
      { title: 'Queries you can run', text: 'Real SQL, mongosh and redis-cli snippets with highlighted syntax.' },
    ],
    faq: [
      {
        q: 'Should I learn SQL or NoSQL first?',
        a: 'SQL first: it carries over to every relational database and helps you judge when a document or key-value store fits better.',
      },
      {
        q: 'Is the PostgreSQL deck beginner friendly?',
        a: 'It assumes basic SQL. Start with the SQL deck, then move on to PostgreSQL for indexes, transactions and JSONB.',
      },
      {
        q: 'What does the Redis deck cover?',
        a: 'Its data types, expiry, persistence, pub/sub, caching patterns and eviction policies.',
      },
    ],
  },
  {
    slug: 'cs',
    title: 'Computer science',
    inlineTitle: 'computer science',
    headline: 'Computer science flashcards: algorithms, system design, APIs, design patterns and cryptography',
    description:
      'Free computer science flashcards: CS fundamentals, algorithms, system design, API design, design patterns, testing, cryptography and Morse code.',
    intro:
      'Interviews and day-to-day engineering lean on the same core ideas: complexity, memory, concurrency, scaling, clean APIs and testable code. These decks turn them into short, precise cards you review for a few minutes a day, so the concepts are there when you need them.',
    benefits: [
      {
        title: 'Interview ready',
        text: 'Big-O, data structures, system design trade-offs and design patterns, phrased the way interviewers ask.',
      },
      { title: 'Concepts, not trivia', text: 'Each card tests one idea, with a short example where it helps it stick.' },
      {
        title: 'From basics to architecture',
        text: 'Start with bits and memory, finish with caching, sharding and consistency models.',
      },
    ],
    faq: [
      {
        q: 'Are these decks good for coding interviews?',
        a: 'Yes. Data structures and algorithms, system design, API design and design patterns cover the most common interview topics, and spaced repetition keeps them fresh between interviews.',
      },
      {
        q: 'Do I need a computer science degree to start?',
        a: 'No. The computer science basics deck starts from binary, memory and processes, and every card explains its answer.',
      },
      {
        q: 'Is code included?',
        a: 'Yes, short snippets where they make a concept concrete, in languages like Python, Java and TypeScript.',
      },
    ],
  },
  {
    slug: 'data-ai',
    title: 'Data & AI',
    inlineTitle: 'data and AI',
    headline: 'Data and AI flashcards: machine learning, prompt engineering and data analysis',
    description:
      'Free flashcards for data and AI: machine learning fundamentals and metrics, prompt engineering and RAG, and practical data analysis with pandas and SQL.',
    intro:
      'Working with data and models means keeping a lot of vocabulary and judgment in your head: which metric fits, why a model overfits, how to prompt an LLM reliably, how to read an A/B test. These decks turn that into short cards you can review in a few minutes a day.',
    benefits: [
      {
        title: 'Concepts you use',
        text: 'Overfitting, precision and recall, embeddings, RAG, joins and group-bys, explained in a line or two.',
      },
      {
        title: 'Practical examples',
        text: 'pandas and SQL snippets, prompt patterns and evaluation metrics you can apply the same day.',
      },
      {
        title: 'Current, not hype',
        text: 'Plain explanations of how LLMs and classic models actually behave, including their limits.',
      },
    ],
    faq: [
      {
        q: 'Do I need to know math for the machine learning deck?',
        a: 'A little algebra helps; formulas are typeset with KaTeX and each card explains the idea in words too.',
      },
      {
        q: 'Is prompt engineering still worth learning?',
        a: 'Yes: clear instructions, examples, structured output and retrieval make any model more reliable, and the deck focuses on those fundamentals.',
      },
      {
        q: 'Which tools does the data analysis deck use?',
        a: 'pandas and SQL, plus the statistics and visualization choices behind a sound analysis.',
      },
    ],
  },
  {
    slug: 'devops',
    title: 'IT & DevOps',
    inlineTitle: 'IT and DevOps',
    headline: 'IT and DevOps flashcards: Linux, Bash, Vim, networking, security, Docker, Kubernetes, AWS and Terraform',
    description:
      'Free IT flashcards for sysadmins and DevOps engineers: Linux, Bash and Vim, networking, cyber security, Docker, Kubernetes, AWS and Terraform.',
    intro:
      'Operations work rewards instant recall: the right find flags, the port behind a service, the subnet a host sits in, the kubectl command that shows why a Pod keeps crashing. These decks cover the commands and concepts that certifications like LPIC-1 test and that on-call shifts demand.',
    benefits: [
      {
        title: 'Exam-aligned',
        text: 'The Linux deck follows LPIC-1 topics: filesystems, permissions, packages, boot targets, users and cron.',
      },
      { title: 'Commands you can run', text: 'Answers are real, highlighted commands and manifests, not vague definitions.' },
      {
        title: 'From one server to a cluster',
        text: 'Linux and networking basics through Docker images and Kubernetes objects.',
      },
    ],
    faq: [
      {
        q: 'Does the Linux deck cover LPIC-1?',
        a: 'It follows the LPIC-1 (101 and 102) topics, from find, grep and permissions to fstab, systemd targets, package managers and cron. It is a review aid, so pair it with hands-on practice.',
      },
      {
        q: 'Are the commands for Debian or Red Hat?',
        a: 'Both. Package management covers dpkg and apt as well as rpm and dnf, and systemd works the same on every major distribution.',
      },
      {
        q: 'Which networking topics are included?',
        a: 'The OSI and TCP/IP models, TCP and UDP, common ports, subnetting and CIDR, DNS records, DHCP, ARP and IPv6 basics.',
      },
    ],
  },
  {
    slug: 'chemistry',
    title: 'Chemistry',
    inlineTitle: 'chemistry',
    headline: 'Chemistry flashcards: periodic table, general and organic chemistry',
    description:
      'Free chemistry flashcards: element symbols 1–50, essential general chemistry and organic chemistry (functional groups, mechanisms, reagents), with formulas in LaTeX.',
    intro:
      'Chemistry builds on a vocabulary of symbols, definitions and a few key equations. These decks cover the first fifty elements and the concepts every general chemistry course relies on, with formulas rendered properly in LaTeX.',
    benefits: [
      { title: 'Formulas that look right', text: 'Equations like PV = nRT and ΔG = ΔH − TΔS render cleanly with LaTeX.' },
      { title: 'Exam-focused', text: 'Definitions short enough to recall in seconds, covering what introductory exams test.' },
      { title: 'Never cram again', text: 'Spaced repetition keeps symbols and definitions fresh all semester.' },
    ],
    faq: [
      {
        q: 'How do I memorize the periodic table?',
        a: 'A few elements a day with spaced repetition. Learn the symbol-to-name mapping first; the Latin-derived symbols include notes.',
      },
      { q: 'Is this deck for high school or university?', a: 'Both. It covers introductory general chemistry.' },
      {
        q: 'Can I add reaction equations?',
        a: 'Yes. Cards support LaTeX, so you can write equations and structural formulas in your own cards.',
      },
    ],
  },
  {
    slug: 'biology',
    title: 'Biology',
    inlineTitle: 'biology',
    headline: 'Biology flashcards: cell biology, mitosis, DNA and the human skeleton',
    description:
      'Free biology flashcards: organelles, membrane transport, mitosis and meiosis, DNA and protein synthesis, and the bones and joints of the human skeleton.',
    intro:
      'Cell biology is the foundation for genetics, physiology and medicine, and anatomy starts with the skeleton; both are heavy on vocabulary. These decks turn organelles, transport, cell division, the central dogma and the bones of the body into short cards you can review in a few minutes a day.',
    benefits: [
      {
        title: 'Short, precise answers',
        text: 'Each card is one fact you can recall in seconds: what an organelle does, what happens in anaphase.',
      },
      {
        title: 'Exam coverage',
        text: 'The cell biology tested in AP and A-level Biology and in introductory university courses.',
      },
      { title: 'Retain it all term', text: 'Spaced repetition keeps early topics fresh while you move on to new ones.' },
    ],
    faq: [
      {
        q: 'What does the cell biology deck cover?',
        a: 'Organelles and their functions, membrane transport, the cell cycle, mitosis and meiosis, and DNA replication, transcription and translation.',
      },
      {
        q: 'What does the human skeleton deck cover?',
        a: 'The bones of the skull, spine, ribcage, arms, hands, legs and feet, with bone counts, the main joint types and a few key facts.',
      },
      {
        q: 'Is it useful for the MCAT?',
        a: 'It reviews the core cell and molecular biology the MCAT builds on. The exam goes deeper, so treat it as a foundation.',
      },
      {
        q: 'Can I add diagrams or my own cards?',
        a: 'You can add the deck to your collection and write your own cards, including formulas in LaTeX.',
      },
    ],
  },
  {
    slug: 'physics',
    title: 'Physics',
    inlineTitle: 'physics',
    headline: 'Physics flashcards: mechanics, energy, electricity, waves and astronomy',
    description:
      'Free physics and astronomy flashcards, equations in LaTeX: Newton’s laws, energy, circuits, electromagnetism, waves, planets, stars and galaxies.',
    intro:
      'Solving physics problems is much easier when the core equations are automatic. The physics deck covers mechanics, energy and momentum, electricity and magnetism, and waves, with each formula written out properly and a note on what the symbols mean. The astronomy deck adds the planets, stars, galaxies and cosmic distances.',
    benefits: [
      { title: 'Typeset equations', text: 'Every formula is rendered with KaTeX, from v = v₀ + at to Faraday’s law.' },
      {
        title: 'Symbols explained',
        text: 'Notes give units, constants and sign conventions, so you know when a formula applies.',
      },
      { title: 'Ready for exams', text: 'Covers what introductory physics and AP Physics exams expect you to know by heart.' },
    ],
    faq: [
      {
        q: 'Which physics topics are covered?',
        a: 'Kinematics and Newton’s laws, gravitation, work, energy and momentum, a little thermodynamics, circuits and electromagnetism, and waves and light, plus an astronomy deck on the planets, stars, galaxies and cosmic distances.',
      },
      {
        q: 'Is it algebra-based or calculus-based?',
        a: 'Mostly algebra-based, as in AP Physics 1 and 2, with a few calculus-based results such as Faraday’s law.',
      },
      {
        q: 'Are physical constants included?',
        a: 'Yes: g, G, the speed of light, the elementary charge, Planck’s constant and Coulomb’s constant, with their values.',
      },
    ],
  },
  {
    slug: 'math',
    title: 'Math',
    inlineTitle: 'math',
    headline: 'Math flashcards: calculus, statistics, linear algebra and number theory',
    description:
      'Free math flashcards with every formula in clean LaTeX: derivatives and integrals, statistics, linear algebra from vectors to SVD, and number theory.',
    intro:
      'Math goes faster when the standard results are automatic. These decks cover the derivatives, integrals and limits you use constantly, the probability and statistics behind every test and chart, linear algebra from vectors to SVD, and number theory from primes to modular arithmetic, all typeset like your textbook.',
    benefits: [
      { title: 'Typeset formulas', text: 'Every expression is rendered with KaTeX, exactly as in a textbook.' },
      {
        title: 'The results you actually use',
        text: 'Trig and inverse trig derivatives, standard integrals, classic limits and series.',
      },
      { title: 'Ready for exams', text: 'Short daily reviews mean you walk into the exam with instant recall.' },
    ],
    faq: [
      {
        q: 'Is memorizing calculus formulas worth it?',
        a: 'Yes. Instant recall of standard results leaves your attention for the problem itself.',
      },
      { q: 'What level is this deck?', a: 'Single-variable calculus, as taught in a first university course or AP Calculus.' },
      {
        q: 'Which math topics are covered?',
        a: 'Single-variable calculus, introductory statistics and probability, linear algebra and elementary number theory. You can also write your own cards with LaTeX.',
      },
    ],
  },
]

export function getPublicDeck(slug: string): PublicDeck | undefined {
  return PUBLIC_DECKS.find((d) => d.slug === slug)
}

export function getPublicCategory(slug: string): PublicCategory | undefined {
  return PUBLIC_CATEGORIES.find((c) => c.slug === slug)
}

/** A topic's decks, in library order. */
export function decksInCategory(slug: PublicCategorySlug | string): PublicDeck[] {
  return PUBLIC_DECKS.filter((d) => d.category === slug)
}
