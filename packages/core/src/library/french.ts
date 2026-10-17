import type { PublicDeck } from './types.ts'

// [French, English, hint (word class, gender), example (French), example (English)]
const WORDS: [string, string, string, string, string][] = [
  // Greetings and phrases
  ['bonjour', 'hello; good morning', 'Greeting, used during the day', 'Bonjour, madame !', 'Hello, madam!'],
  ['bonsoir', 'good evening', 'Greeting, used in the evening', 'Bonsoir, tout le monde !', 'Good evening, everyone!'],
  ['salut', 'hi; bye', 'Informal greeting or farewell', 'Salut, ça va ?', 'Hi, how’s it going?'],
  ['au revoir', 'goodbye', 'Farewell', 'Au revoir et à demain !', 'Goodbye, see you tomorrow!'],
  ['merci', 'thank you', 'Phrase', 'Merci beaucoup pour ton aide.', 'Thank you very much for your help.'],
  ['s’il vous plaît', 'please', 'Formal (vous); informal: s’il te plaît', 'Un café, s’il vous plaît.', 'A coffee, please.'],
  ['de rien', 'you’re welcome', 'Reply to merci', 'De rien, c’était un plaisir.', 'You’re welcome, it was a pleasure.'],
  [
    'excusez-moi',
    'excuse me',
    'Formal (vous); informal: excuse-moi',
    'Excusez-moi, où est la gare ?',
    'Excuse me, where is the train station?',
  ],
  ['je suis désolé', 'I’m sorry', 'Phrase; a woman writes désolée', 'Je suis désolé, je suis en retard.', 'I’m sorry, I’m late.'],
  [
    'Comment allez-vous ?',
    'How are you?',
    'Formal (vous); informal: Comment vas-tu ?',
    'Bonjour, monsieur Martin, comment allez-vous ?',
    'Hello, Mr. Martin, how are you?',
  ],
  ['Ça va ?', 'How’s it going?; Are you OK?', 'Informal; the answer can be ça va too', 'Ça va bien, merci.', 'I’m fine, thanks.'],
  [
    'Je ne comprends pas',
    'I don’t understand',
    'Phrase',
    'Je ne comprends pas. Vous pouvez répéter ?',
    'I don’t understand. Could you repeat that?',
  ],
  ['Combien ça coûte ?', 'How much does it cost?', 'Question', 'Combien ça coûte, ce pull ?', 'How much is this sweater?'],
  [
    'Je m’appelle…',
    'My name is…',
    'Phrase, literally “I call myself”',
    'Je m’appelle Camille. Et toi ?',
    'My name is Camille. And you?',
  ],
  // Verbs
  ['être', 'to be', 'Irregular verb: je suis, tu es, il est', 'Je suis étudiant.', 'I’m a student.'],
  ['avoir', 'to have', 'Irregular verb: j’ai, tu as, il a; also used for age', 'J’ai vingt ans.', 'I’m twenty years old.'],
  ['aller', 'to go', 'Irregular verb: je vais, tu vas, il va', 'Je vais au travail à vélo.', 'I go to work by bike.'],
  [
    'faire',
    'to do; to make',
    'Irregular verb: je fais; also used for weather',
    'Il fait beau aujourd’hui.',
    'The weather is nice today.',
  ],
  ['pouvoir', 'can; to be able to', 'Irregular verb: je peux', 'Je peux payer par carte ?', 'Can I pay by card?'],
  [
    'vouloir',
    'to want',
    'Irregular verb: je veux; je voudrais is the polite form',
    'Je voudrais un verre d’eau.',
    'I’d like a glass of water.',
  ],
  ['savoir', 'to know (facts, how to)', 'Irregular verb: je sais', 'Je ne sais pas où il est.', 'I don’t know where he is.'],
  ['connaître', 'to know (people, places)', 'Irregular verb: je connais', 'Tu connais Paris ?', 'Do you know Paris?'],
  ['parler', 'to speak; to talk', 'Regular -er verb', 'Vous parlez anglais ?', 'Do you speak English?'],
  ['manger', 'to eat', 'Regular -er verb (nous mangeons)', 'On mange à midi.', 'We eat at noon.'],
  [
    'prendre',
    'to take; to have (food, drink)',
    'Irregular verb: je prends',
    'Je prends le train à huit heures.',
    'I take the train at eight.',
  ],
  ['venir', 'to come', 'Irregular verb: je viens', 'Tu viens avec nous ?', 'Are you coming with us?'],
  ['aimer', 'to like; to love', 'Regular -er verb', 'J’aime beaucoup le chocolat.', 'I really like chocolate.'],
  ['habiter', 'to live (somewhere)', 'Regular -er verb', 'J’habite à Lyon.', 'I live in Lyon.'],
  // Nouns, with their article
  ['l’eau', 'water', 'Feminine noun (la becomes l’ before a vowel)', 'L’eau est froide.', 'The water is cold.'],
  ['la maison', 'house; home', 'Feminine noun', 'Je suis à la maison.', 'I’m at home.'],
  ['le jour', 'day', 'Masculine noun', 'Il pleut tous les jours.', 'It rains every day.'],
  ['la nuit', 'night', 'Feminine noun', 'Bonne nuit, dors bien !', 'Good night, sleep well!'],
  ['le temps', 'time; weather', 'Masculine noun', 'Je n’ai pas le temps.', 'I don’t have time.'],
  ['le travail', 'work; job', 'Masculine noun; plural: les travaux', 'Je cherche du travail.', 'I’m looking for work.'],
  ['la ville', 'town; city', 'Feminine noun', 'Marseille est une grande ville.', 'Marseille is a big city.'],
  ['l’ami / l’amie', 'friend', 'Noun: un ami (a man), une amie (a woman)', 'C’est mon meilleur ami.', 'He’s my best friend.'],
  ['l’homme', 'man', 'Masculine noun (the h is silent)', 'Qui est cet homme ?', 'Who is that man?'],
  ['la femme', 'woman; wife', 'Feminine noun; pronounced like “fam”', 'Sa femme est médecin.', 'His wife is a doctor.'],
  ['le problème', 'problem', 'Masculine noun, despite the -e', 'Il n’y a pas de problème.', 'There’s no problem.'],
  ['la gare', 'train station', 'Feminine noun', 'La gare est loin d’ici ?', 'Is the station far from here?'],
  ['le pain', 'bread', 'Masculine noun', 'Je vais acheter du pain.', 'I’m going to buy some bread.'],
  // Adjectives, adverbs and connectors
  ['bon / bonne', 'good', 'Adjective, placed before the noun', 'C’est un bon restaurant.', 'It’s a good restaurant.'],
  [
    'beau / belle',
    'beautiful; handsome',
    'Adjective; bel before a masculine noun starting with a vowel sound',
    'Quelle belle journée !',
    'What a beautiful day!',
  ],
  ['grand / grande', 'big; tall', 'Adjective, usually before the noun', 'Ils ont une grande maison.', 'They have a big house.'],
  ['petit / petite', 'small; little', 'Adjective, usually before the noun', 'J’ai un petit chien.', 'I have a small dog.'],
  ['beaucoup', 'a lot; very much', 'Adverb; beaucoup de + noun', 'Il y a beaucoup de monde.', 'There are a lot of people.'],
  ['aussi', 'also; too', 'Adverb', 'Moi aussi, je veux venir.', 'I want to come too.'],
  ['toujours', 'always; still', 'Adverb', 'Il est toujours en retard.', 'He’s always late.'],
  ['aujourd’hui', 'today', 'Adverb', 'On est quel jour aujourd’hui ?', 'What day is it today?'],
  [
    'parce que / pourquoi ?',
    'because / why?',
    'Conjunction / question word',
    'Pourquoi tu apprends le français ? Parce que j’aime la France.',
    'Why are you learning French? Because I love France.',
  ],
]

/** French typography: a narrow no-break space before ? ! : and ; (so they never wrap alone). */
const fr = (text: string) => text.replace(/ ([?!:;])/g, ' $1')

export const FRENCH: PublicDeck = {
  slug: 'french-essentials',
  title: 'French essentials: 50 high-frequency words and phrases',
  shortTitle: 'French essentials',
  category: 'languages',
  level: 'beginner',
  icon: 'globe',
  description:
    'The first fifty French words and phrases to learn: greetings and polite phrases, core verbs like être, avoir and aller, and everyday nouns with le, la or l’, each with an example.',
  intro:
    'Each card shows a French word or phrase; recall the English, then check the example sentence. Nouns come with their article, and where l’ hides the gender the hint gives it, so la maison and le problème stick as whole units. Formal and informal forms (vous and tu) are marked.',
  faq: [
    {
      q: 'How do I know if a French noun is masculine or feminine?',
      a: 'Mostly by learning it with its article, as these cards do. Endings help: -tion and -té are usually feminine, -ment and -age usually masculine, but there are exceptions such as la plage and l’image (feminine).',
    },
    {
      q: 'When do I use tu or vous?',
      a: 'Tu with friends, family, children and people your age in casual settings; vous with strangers, in shops and at work, and always for more than one person.',
    },
    {
      q: 'Why is there a space before question marks?',
      a: 'French typography puts a thin space before ? ! : and ;. The cards follow that convention.',
    },
  ],
  cards: WORDS.map(([front, back, hint, ex, en]) => ({ front: fr(front), back, hint: fr(hint), extra: `${fr(ex)} — ${en}` })),
}
