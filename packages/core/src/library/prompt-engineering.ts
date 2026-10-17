import type { CardContent } from '../collection.ts'
import type { PublicDeck } from './types.ts'
import { code } from './util.ts'

const r = String.raw
const prompt = (...lines: string[]) => code('markdown', ...lines)
const xml = (...lines: string[]) => code('xml', ...lines)
const json = (...lines: string[]) => code('json', ...lines)

const CARDS: CardContent[] = [
  // How LLMs work
  {
    front: 'How does a large language model (LLM) generate text?',
    back: 'It predicts a probability distribution over the next token, samples one, appends it to the input and repeats until it emits a stop token or hits a length limit',
    extra: 'Most LLMs are transformer networks trained on huge text corpora, then tuned to follow instructions.',
  },
  {
    front: 'Token',
    back: 'The unit of text a model reads and writes: a whole word, part of a word, a punctuation mark or whitespace',
    extra: 'Each model has its own tokenizer, so the same text can be a different number of tokens on different models.',
  },
  {
    front: 'Rule of thumb: how many tokens is English text?',
    back: 'About 4 characters, or ¾ of a word, per token, so 100 tokens ≈ 75 words',
    extra: 'Code and most non-English languages use more tokens for the same content.',
  },
  {
    front: 'Why do token counts matter?',
    back: 'Context limits, pricing and latency are all measured in tokens; output tokens usually cost more than input tokens and take longer to generate',
  },
  {
    front: 'Context window',
    back: 'The maximum number of tokens a model can handle in one request: system prompt, conversation history, documents, tool results and the generated output together',
    extra: 'Current models range from tens of thousands to over a million tokens.',
  },
  {
    front: 'What happens when a conversation outgrows the context window?',
    back: 'Older content has to be dropped, truncated or summarized, or the request fails. The model can’t use anything that isn’t in the window',
  },
  {
    front: 'Does a chat API remember your previous requests?',
    back: 'Usually not: the model itself is stateless, so you resend the relevant conversation history with every request',
    extra: 'Chat apps and some APIs store history for you, but it still has to fit in the context window.',
  },
  {
    front: 'Knowledge cutoff',
    back: 'The date the model’s training data ends; it knows nothing later unless you put the information in the prompt or give it a search tool',
  },
  // Sampling settings
  {
    front: 'Temperature',
    back: r`Rescales the next-token probabilities before sampling: low values make output focused and repeatable, high values make it more varied. With logits \(z_i\) and temperature \(T\): \(p_i = \dfrac{e^{z_i/T}}{\sum_j e^{z_j/T}}\)`,
    extra: 'Even temperature 0 isn’t guaranteed to be perfectly deterministic.',
  },
  {
    front: 'Temperature for data extraction vs brainstorming',
    back: 'Low (around 0 to 0.3) for extraction, classification and code; higher (around 0.7 to 1) for brainstorming and creative writing',
    extra:
      'Ranges differ by provider, e.g. 0–2 for OpenAI and 0–1 for Anthropic. Some reasoning models ignore or fix the setting.',
  },
  {
    front: 'Top-p (nucleus sampling)',
    back: 'Samples only from the smallest set of most likely tokens whose probabilities add up to p, such as 0.9',
    extra:
      'Top-k is similar but keeps a fixed number k of tokens. A common recommendation is to tune temperature or top-p, not both.',
  },
  {
    front: 'What does a max output tokens limit do?',
    back: 'Caps the length of the response; if it is reached, the output stops mid-sentence and the API reports a length or max-tokens stop reason',
    extra: 'Stop sequences are strings that end generation early when the model produces them.',
  },
  // Writing prompts
  {
    front: 'System prompt vs user message',
    back: 'The system prompt, set by the developer, defines the role, rules and context for the whole conversation; user messages carry the individual requests. Models are trained to give system instructions priority',
    extra: 'Some APIs call it the developer message.',
  },
  {
    front: 'Role (persona) prompting',
    back: 'Telling the model who it is, such as “You are a senior tax accountant reviewing a small business’s expenses”, to set its expertise, vocabulary and tone',
  },
  {
    front: 'Make this prompt specific: “Write about our new app.”',
    back: 'State the audience, goal, format, length, tone and key facts, e.g. “Write a 120-word announcement for existing customers about our budgeting app’s new shared wallets. Friendly tone, one call to action, no jargon.”',
    extra: 'A good test: would a smart new colleague with no context know exactly what to produce?',
  },
  {
    front: 'Why wrap instructions and data in delimiters such as XML tags?',
    back: 'They separate instructions from content so the model knows what to act on and what to treat as data, and you can refer to sections by name',
    extra: xml(
      '<instructions>',
      'Summarize the article in two sentences for a busy executive.',
      '</instructions>',
      '<article>',
      '{{ARTICLE_TEXT}}',
      '</article>',
    ),
  },
  {
    front: 'Where should a long document go in a prompt?',
    back: 'Usually first, with the question and instructions after it; for very long inputs, repeat the key instructions at the end',
    extra:
      'Models tend to use information at the start and end of a long context better than in the middle (“lost in the middle”).',
  },
  {
    front: 'Why phrase instructions positively?',
    back: 'Saying what to do works better than listing what not to do: “Write in plain prose paragraphs” beats “Don’t use markdown”, and explaining why helps the model generalize',
  },
  {
    front: 'How do you give the model an “out”?',
    back: 'Explicitly allow an answer like “I don’t know” or “Not found in the document”, which reduces made-up answers when the information is missing',
  },
  // Prompting techniques
  { front: 'Zero-shot prompting', back: 'Asking for a task with instructions only, without any examples' },
  {
    front: 'Few-shot prompting',
    back: prompt(
      'Classify the sentiment as positive, negative or neutral.',
      '',
      'Review: Arrived quickly and works great.',
      'Sentiment: positive',
      '',
      'Review: Stopped charging after two days.',
      'Sentiment: negative',
      '',
      'Review: {{review}}',
      'Sentiment:',
    ),
    extra: 'Including a few input–output examples shows the model the task, the labels and the exact output format.',
  },
  {
    front: 'How should you choose few-shot examples?',
    back: 'Make them diverse, representative and consistent in format, and include tricky edge cases; the model copies their style and quirks, including mistakes and length',
  },
  {
    front: 'Chain-of-thought prompting',
    back: 'Asking the model to reason step by step before giving its final answer, which improves multi-step tasks like math, logic and planning',
    extra: 'Ask for the reasoning and the final answer in separate sections (or tags) so code can extract the answer.',
  },
  {
    front: 'Reasoning models',
    back: 'Models trained to work through a hidden or summarized chain of thought before answering, such as OpenAI’s o-series, DeepSeek-R1 or Claude with extended thinking',
    extra:
      'For them, a clear goal and constraints matter more than spelling out each step; many let you set a reasoning effort or thinking budget.',
  },
  {
    front: 'Prompt chaining',
    back: 'Splitting a complex task into a sequence of prompts where each output feeds the next step, such as extract → analyze → draft → review; each step is easier to test and debug',
  },
  // Structured output and tools
  {
    front: 'Structured output',
    back: 'Asking the model to answer in a machine-readable format, usually JSON matching a schema, so your code can parse the result reliably',
  },
  {
    front: 'JSON mode vs schema-enforced structured outputs',
    back: 'JSON mode guarantees syntactically valid JSON but not its shape; structured outputs constrain generation to a JSON Schema you supply, so required fields and types are guaranteed',
    extra: 'Still validate the result: the values can be wrong even when the shape is right.',
  },
  {
    front: 'Prompt pattern for extracting fields as JSON',
    back: 'Describe each field, say what to do when it is missing, and show the exact shape',
    extra: json(
      '{',
      '  "company": "string",',
      '  "invoice_date": "YYYY-MM-DD or null",',
      '  "total": "number or null",',
      '  "currency": "ISO 4217 code, e.g. EUR"',
      '}',
    ),
  },
  {
    front: 'Tool (function) calling',
    back: 'You describe functions with a name, description and JSON Schema for the arguments; the model replies with a call request, your code runs the function and sends back the result for the model to use',
    extra:
      'With client-side tools the model never executes anything itself. Some providers also run built-in tools, such as web search, on their side.',
  },
  {
    front: 'AI agent',
    back: 'An LLM that uses tools in a loop: it decides on a step, calls a tool, reads the result and repeats until the task is done or a limit is reached',
  },
  // Hallucinations
  {
    front: 'Hallucination',
    back: 'Fluent, confident output that is false or unsupported, such as invented facts, quotes, citations, URLs or API functions',
  },
  {
    front: 'Why do LLMs hallucinate?',
    back: 'They are trained to produce plausible text, not to check facts; gaps in training data, the knowledge cutoff and pressure to always give an answer all make it worse',
  },
  {
    front: 'How can you reduce hallucinations?',
    back: 'Ground answers in supplied sources (RAG), ask for supporting quotes or citations, allow “I don’t know”, use a lower temperature for factual tasks, and verify important claims',
    extra: 'No technique eliminates hallucinations, so high-stakes outputs need checks.',
  },
  // Embeddings and RAG
  {
    front: 'Embedding',
    back: 'A vector of numbers representing the meaning of a text, so that texts with similar meanings have nearby vectors',
    extra: 'Typical embeddings have a few hundred to a few thousand dimensions.',
  },
  {
    front: 'Cosine similarity',
    back: r`\(\cos\theta = \dfrac{a \cdot b}{\lVert a\rVert\,\lVert b\rVert}\): the angle-based similarity of two vectors, 1 for the same direction`,
    extra: 'The usual way to compare embeddings.',
  },
  {
    front: 'Vector database',
    back: 'A store for embeddings with fast (usually approximate) nearest-neighbor search, so you can find the chunks most similar to a query',
    extra: 'Examples include pgvector for PostgreSQL, Qdrant, Pinecone, Weaviate and Chroma.',
  },
  {
    front: 'Retrieval-augmented generation (RAG)',
    back: 'At query time, retrieve relevant documents (often by embedding search) and put them in the prompt, so the model answers from current, specific sources instead of memory alone',
  },
  {
    front: 'The steps of a basic RAG pipeline',
    back: 'Indexing: split documents into chunks, embed them, store the vectors. Querying: embed the question, retrieve the top-k similar chunks, optionally rerank them, add them to the prompt and generate an answer with citations',
  },
  {
    front: 'Chunking trade-offs in RAG',
    back: 'Chunks that are too large dilute relevance and waste context; chunks that are too small lose surrounding meaning. Splitting on headings or paragraphs, with some overlap, is a common start',
  },
  {
    front: 'Hybrid search',
    back: 'Combining keyword search (such as BM25) with vector search, which catches exact terms like product codes and names that embeddings can miss',
    extra: 'The two result lists are often merged with reciprocal rank fusion.',
  },
  {
    front: 'Reranking',
    back: 'A second stage where a more accurate model, usually a cross-encoder, scores each retrieved chunk against the query and reorders them before they go into the prompt',
  },
  {
    front: 'RAG vs fine-tuning',
    back: 'RAG supplies knowledge at query time, so it stays current and can cite sources; fine-tuning changes the model’s weights to teach a style, format or task, and is a poor way to add facts that change',
  },
  // Security
  {
    front: 'Prompt injection',
    back: 'Input that contains instructions which override the developer’s, such as “Ignore all previous instructions and…”',
    extra: 'It is first in the OWASP Top 10 for LLM Applications.',
  },
  {
    front: 'Indirect prompt injection',
    back: 'Malicious instructions hidden in content the model processes, such as a web page, email, PDF or retrieved document, rather than typed by the user',
  },
  {
    front: 'How do you limit the damage from prompt injection?',
    back: 'There is no complete fix, so treat model output as untrusted: give tools least privilege, require human approval for sensitive actions, mark untrusted content clearly, and filter inputs and outputs',
  },
  {
    front: 'Jailbreak vs prompt injection',
    back: 'A jailbreak tries to get the model to ignore its safety training; prompt injection hijacks an application by smuggling in instructions that override the developer’s',
  },
  {
    front: 'Is it safe to put secrets in a system prompt?',
    back: 'No. Users can often get the model to reveal its system prompt, so treat it as public and keep API keys and confidential data out of it',
  },
  // Evaluation and cost
  {
    front: 'Prompt evaluation (evals)',
    back: 'A test set of representative inputs with expected outputs or grading criteria; run every prompt or model change against it and compare scores instead of eyeballing a few examples',
  },
  {
    front: 'LLM-as-a-judge',
    back: 'Using a model to grade outputs against a rubric. It scales well but has biases (position, length, preferring its own style), so check it against human ratings',
  },
  {
    front: 'Prompt caching',
    back: 'Providers can cache a repeated prompt prefix, such as a long system prompt, tool definitions or a document, making later requests cheaper and faster',
    extra: 'Put stable content first and the parts that change last, so the prefix stays identical.',
  },
]

export const PROMPT_ENGINEERING: PublicDeck = {
  slug: 'prompt-engineering',
  title: 'Prompt engineering: 50 cards on LLMs, prompting techniques and RAG',
  shortTitle: 'Prompt engineering',
  category: 'data-ai',
  level: 'beginner',
  icon: 'spark',
  description:
    'Prompt engineering flashcards: tokens, context windows, temperature, few-shot and chain-of-thought prompting, structured output, RAG and prompt injection.',
  intro:
    'Fifty cards on working with large language models: how tokens, context windows and sampling settings shape the output; system prompts, few-shot examples, chain-of-thought and structured output; tool calling, embeddings and retrieval-augmented generation; and the failure modes to plan for, from hallucinations to prompt injection. The ideas apply whichever model you use, from OpenAI, Anthropic or Google to open-weight models.',
  faq: [
    {
      q: 'Is this deck tied to one AI provider?',
      a: 'No. Tokens, temperature, few-shot prompting and RAG work the same way across providers and open-weight models; where APIs differ, the cards say so.',
    },
    {
      q: 'Do I need to code to use it?',
      a: 'No. Most cards are about writing better prompts. A few cover developer topics such as structured output, tool calling and RAG pipelines.',
    },
    {
      q: 'Does it cover AI security?',
      a: 'Yes: direct and indirect prompt injection, jailbreaks, system prompt leaks and practical ways to limit the damage.',
    },
  ],
  cards: CARDS,
}
