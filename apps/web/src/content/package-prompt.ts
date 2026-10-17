// A prompt users paste into an AI assistant that can run Python (ChatGPT,
// Claude, Gemini with code execution) together with a flashcard package
// (.apkg/.colpkg). It converts the package to the Askesis CSV format, one row per card,
// keeping each card's progress and review history. Shown on the import dialog
// and the import/export docs, and appended to the card spec (/llms.txt).
//
// String.raw keeps the Python's backslashes literal; the code fences (backticks)
// are joined in as plain strings because a raw string can't hold them.

export const PACKAGE_PROMPT =
  String.raw`I'm attaching a flashcard package (.apkg or .colpkg). Convert it to an Askesis CSV
file I can import, keeping each card's study progress and review history. Use
Python. Run the script below as-is (install the "zstandard" package if it's
missing), then give me the resulting askesis-import.csv to download. If something
fails, explain the error and fix the script. Don't invent or rewrite any card
content.

Format rules (the Askesis spec, also at /llms.txt on the Askesis site):
- One row per CARD (not per note), so every card keeps its own progress.
- Header lines first, then rows with columns:
  deck,front,back,hint,extra,tags,state,due,interval,ease,stability,difficulty,step,reps,lapses,last_review,suspended,history
- Deck paths use "::" between levels. Tags are space-separated.
- Fields keep the package's HTML; "#html:true" tells Askesis to convert it.
- Progress: state 0 new, 1 learning, 2 review, 3 relearning; due and
  last_review as ISO 8601 UTC; interval in days; ease as a factor (2.5 = 250%);
  stability/difficulty from FSRS when present; step is left empty (Askesis restarts
  the current learning steps); leave progress empty for new cards so they stay new.
- history: every past answer from the review log (revlog table), oldest first,
  separated by ";". Each answer is "time rating ms state_before state_after
  interval_before interval_after ease" (time ISO 8601 UTC, rating 1-4, intervals
  in days). Manual reschedules (revlog type 4 and 5, or ease 0) are not answers
  and are skipped.
- Cloze cards are expanded here (front hides the deletion, back shows it in bold).
- Media (images, audio) can't be imported; references are dropped by Askesis.

` +
  '```python' +
  String.raw`
import csv, io, json, re, sqlite3, sys, tempfile, zipfile
from datetime import datetime, timezone

PATH = sys.argv[1] if len(sys.argv) > 1 else "deck.apkg"  # set to the uploaded file
OUT = "askesis-import.csv"

def open_collection(path):
    z = zipfile.ZipFile(path)
    tmp = tempfile.NamedTemporaryFile(suffix=".sqlite", delete=False)
    name = max(n for n in z.namelist() if n.startswith("collection."))   # newest format in the package
    raw = z.read(name)
    if name.endswith("b"):                     # modern packages: zstd-compressed SQLite
        import zstandard
        raw = zstandard.ZstdDecompressor().decompressobj().decompress(raw)
    tmp.write(raw); tmp.close()
    return sqlite3.connect(tmp.name)

db = open_collection(PATH)
crt = db.execute("select crt from col").fetchone()[0]          # collection day zero, seconds

try:                                                            # schema 18: decks table, "\x1f" between levels
    decks = {i: n.replace("\x1f", "::") for i, n in db.execute("select id, name from decks")}
except sqlite3.OperationalError:                                # schema 11: JSON in col.decks
    decks = {int(k): v["name"] for k, v in json.loads(db.execute("select decks from col").fetchone()[0]).items()}

notes = {nid: (flds.split("\x1f"), tags.strip()) for nid, flds, tags in db.execute("select id, flds, tags from notes")}
last = dict(db.execute("select cid, max(id) from revlog group by cid"))   # ms timestamps

# Review history. revlog type: 0 learn, 1 review, 2 relearn, 3 filtered, 4 manual, 5 rescheduled.
# ivl/lastIvl: positive = days, negative = seconds (still in learning steps).
history = {}
for rid, cid, ease, ivl, last_ivl, factor, taken, rtype in db.execute(
        "select id, cid, ease, ivl, lastIvl, factor, time, type from revlog order by id"):
    if ease not in (1, 2, 3, 4) or rtype not in (0, 1, 2, 3):
        continue
    past = history.setdefault(cid, [])
    if rtype == 0:
        before = 1 if past else 0                  # the first learning answer is the new card's
    elif rtype == 2:
        before = 3
    elif rtype == 1:
        before = 2
    else:                                          # filtered deck: judge by the interval before
        before = 2 if last_ivl > 0 else (1 if past else 0)
    if ivl > 0:
        after = 2
    elif rtype == 3:
        after = before if before != 0 else 1
    else:
        after = 1 if rtype == 0 else 3
    past.append(" ".join(str(v) for v in (
        datetime.fromtimestamp(rid / 1000, timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z"),
        ease, max(0, min(taken, 3_600_000)), before, after, max(last_ivl, 0), max(ivl, 0), round(factor / 1000, 3))))

CLOZE = re.compile(r"\{\{c(\d+)::(.*?)(?:::(.*?))?\}\}", re.S)
def cloze(text, n):
    front = CLOZE.sub(lambda m: "[%s]" % ((m.group(3) or "…").strip()) if int(m.group(1)) == n else m.group(2), text)
    back = CLOZE.sub(lambda m: "<b>%s</b>" % m.group(2) if int(m.group(1)) == n else m.group(2), text)
    return front, back

def iso(seconds):
    return datetime.fromtimestamp(seconds, timezone.utc).isoformat().replace("+00:00", "Z")

rows = []
query = "select id, nid, did, ord, type, queue, due, ivl, factor, reps, lapses, odid, odue, data from cards order by nid, ord"
for cid, nid, did, ord_, ctype, queue, due, ivl, factor, reps, lapses, odid, odue, data in db.execute(query):
    fields, tags = notes[nid]
    if odid:                                   # card sits in a filtered deck: use its home deck and due
        did, due = odid, odue
    f = lambda i: fields[i] if i < len(fields) else ""
    if CLOZE.search(f(0)):                     # Cloze: one card per deletion (ord 0 = c1)
        front, back = cloze(f(0), ord_ + 1)
        extra = f(1)
    elif ord_ == 1 and len(fields) >= 2:       # "Basic (and reversed card)": the reverse card
        front, back, extra = f(1), f(0), "<br>".join(fields[2:])
    else:
        front, back, extra = f(0), f(1), "<br>".join(fields[2:])

    if ctype in (1, 2, 3):
        if ctype == 2 or queue == 3 or due < 1_000_000_000:   # day-based due (days since crt)
            due_at = crt + due * 86400
        else:                                                  # intraday learning: epoch seconds
            due_at = due
        try:
            fsrs = json.loads(data or "{}")
        except ValueError:
            fsrs = {}
        progress = [
            ctype, iso(due_at), max(ivl, 0), round(factor / 1000, 3),
            fsrs.get("s", 0) or 0, fsrs.get("d", 0) or 0, "", reps, lapses,
            iso(last[cid] / 1000) if cid in last else "",
        ]
    else:
        progress = [""] * 10
    suspended = 1 if queue == -1 else ""
    rows.append([decks.get(did, "Imported"), front, back, "", extra, tags, *progress, suspended, ";".join(history.get(cid, []))])

with open(OUT, "w", newline="", encoding="utf-8") as out:
    out.write("#separator:comma\n#html:true\n")
    out.write("#columns:deck,front,back,hint,extra,tags,state,due,interval,ease,stability,difficulty,step,reps,lapses,last_review,suspended,history\n")
    out.write("#deck column:1\n#tags column:6\n")
    csv.writer(out, quoting=csv.QUOTE_ALL).writerows(rows)

reviews = sum(len(h) for h in history.values())
print(f"Wrote {len(rows)} cards ({reviews} past reviews) from {len(notes)} notes in {len(set(r[0] for r in rows))} decks to {OUT}")
` +
  '```' +
  String.raw`

When it's done, tell me how many cards, past reviews and decks were converted.`
