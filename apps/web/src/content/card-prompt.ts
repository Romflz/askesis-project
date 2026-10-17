import { DECK_PATH_SEPARATOR } from '@askesis/core'

// A copy-paste prompt that has a chat assistant (ChatGPT, Claude, Gemini) write a
// deck from a topic, notes or a document, as a file that imports cleanly. It is
// self-contained because chat assistants usually can't open /llms.txt; the full
// spec stays in card-spec.ts. Its example rows must parse with the real importer.
// Shown on /docs/for-ai-agents and copied from the import dialog.

const FENCE = '```'
const SEP = DECK_PATH_SEPARATOR

/** The example file in the prompt, also handy for checking the format. */
export const CARD_PROMPT_EXAMPLE = String.raw`#separator:comma
#html:false
#columns:deck,front,back,hint,extra,tags
#deck column:1
#tags column:6
"Biology${SEP}Cells","What does the mitochondrion produce?","ATP","","Cellular respiration happens here, which is why it's called the cell's power plant.","biology${SEP}cells organelles"
"Biology${SEP}Cells","{{c1::Ribosomes}} build proteins.","","","They sit free in the cytoplasm and on the rough endoplasmic reticulum.","biology${SEP}cells"
"Math${SEP}Calculus","Derivative of \(x^2\)?","\(2x\)","","Power rule: \(\frac{d}{dx} x^n = n x^{n-1}\)","calculus"`

export const CARD_PROMPT = String.raw`Make flashcards for Askesis, a spaced-repetition app, and give them to me as a CSV file I can import.

What I want:
- Topic or source: [a topic, or paste or attach your notes, a chapter or a document]
- Number of cards: [for example 40]
- My level: [beginner, intermediate or advanced]
- Deck: [for example Biology${SEP}Cells; "${SEP}" separates a deck from its subdecks]
- Language of the cards: [for example English]

How to write the cards:
- One fact per card. Split lists and long explanations into several cards.
- Ask a precise question with exactly one right answer, and make every card understandable on its own.
- Keep the back short: a word, a phrase or one sentence. Put context, an example or a memory aid in "extra".
- Use "hint" only for a small nudge shown under the question, such as a reading or a category. Usually leave it empty.
- Cover what matters most at my level, not trivia. No two cards may have the same front.
- For key terms in a sentence, a cloze card works well: write {{c1::the hidden part}} in the front and leave the back empty. {{c1::answer::hint}} shows the hint in the gap; c1, c2 and so on make one card per gap.
- If you're working from my material, stick to what it says and don't invent facts.

The file format (follow it exactly):
1. Start with these five lines:
#separator:comma
#html:false
#columns:deck,front,back,hint,extra,tags
#deck column:1
#tags column:6
2. Then one card per line, with six fields in this order: deck, front, back, hint, extra, tags.
3. Wrap every field in double quotes. Inside a field, write a double quote as two double quotes ("").
4. deck: the full deck path with ${SEP} between levels, the same on every row unless I asked for subdecks.
5. tags: lowercase words separated by spaces, with no spaces inside a tag (use - instead). Nest a tag with ${SEP}, like biology${SEP}cells.
6. Leave a field as "" when it has nothing. Never use HTML.
7. Math: \( … \) inside a line and \[ … \] on its own, with single backslashes (\frac, not \\frac).
8. Code: a fenced block with the language name, like ${FENCE}python on its own line, then the code, then ${FENCE}, all inside the quoted field.

Example:
${CARD_PROMPT_EXAMPLE}

Before you answer, check that every row has exactly six fields and that there are as many cards as I asked for.

Give me the CSV as a downloadable file named askesis-cards.csv. If you can't create files, put the whole CSV in a single code block and nothing else.

I'll import it on the Decks page in Askesis (Import).`
