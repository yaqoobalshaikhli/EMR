---
name: ai-detector
description: Check a file or pasted text for AI-style writing patterns and report which paragraphs look machine-written, with quoted evidence. Use whenever the user sends a .txt, .md, .docx or .pdf (or pasted text) and asks how much of it is AI, whether it sounds AI-generated, or to check/scan/detect AI in their writing. Reports style signals per paragraph, not a verified percent of AI authorship. Pairs with the humanizer skill to fix flagged parts. English only.
---

# AI Detector (style-pattern report)

Report which parts of a document show the stylistic habits common in machine-generated text. This is a style audit, not proof of who wrote it.

## Be honest about what this can and cannot say

- The output measures **surface patterns** (stock words, phrasing formulas, em dash density, uniform sentence rhythm). Humans also write this way, especially in formal, corporate or non-native English, and a model can be prompted to avoid all of it.
- Never present a figure as "X% AI-written" or "probability this was AI". Nobody can state that reliably, and the scanner's thresholds have not been calibrated against labelled data.
- Do not use this to accuse someone of cheating or misconduct. Say so if the user mentions that use.
- Pattern lists come from Wikipedia's "Signs of AI writing" page, which says its word lists drift as models change.

## Workflow

1. **Get the text.** For a file, run the scanner. It reads .txt, .md, .docx and .pdf:
   ```bash
   python3 .claude/skills/ai-detector/scripts/scan.py "<path>"
   ```
   It prints JSON with per-paragraph counts and ratings. If a PDF has no text layer, the scanner says so; tell the user it was scanned and cannot be read, and stop. For pasted text, save it to a temp file first (use the scratchpad directory), then run the same command.
2. **Read the document yourself too.** The scanner only sees what its patterns match. Skim for what it misses: generic claims with no specifics, a wrap-up that restates the whole text, every paragraph built the same way, no concrete detail anywhere (names, numbers, places, personal observations). Use `../humanizer/references/ai-patterns.md` as the guide. Add anything you find that the scanner did not.
3. **Judge each paragraph** low / medium / high style-signal, starting from the scanner rating and adjusting with your own reading. Do not silently override the scanner: if you change a rating, say why.
4. **Report** in the format below.
5. **Offer the next step**: rewrite the medium and high paragraphs with the humanizer skill. Do not rewrite unless asked.

## Report format

```
**AI-style signal report: <file name>**

Overall: <low | mixed | high> style-signal. <n> of <m> paragraphs medium or high (<x>% of words).
This is a pattern count, not the likelihood the text was written by AI.

| # | Rating | Evidence |
|---|--------|----------|
| 1 | high   | "serves as a testament", "seamlessly", 3 stock words, 1 -ing tack-on |
| 2 | low    | none found |
...

**Strongest signals**
- <pattern>: <quoted example(s)>

**What reads as human**
- <specific detail, uneven rhythm, concrete example, etc.>

**Confidence in this report**
<state plainly: e.g. "Moderate for the pattern findings (they are quoted and checkable). Low for any claim about authorship.">
```

Keep the table to the paragraphs worth noting if the document is long (group the clean ones: "paragraphs 4-9: low"). Always quote the evidence so the user can check it themselves.

## Edge cases

- Under about 150 words total: say the sample is too small for a meaningful read.
- Heavily formal or technical text (legal, clinical, academic): note that these registers naturally trigger some patterns, and weigh the stock-word hits less than structural signs.
- Text the user says is quoted from another source: exclude it.
