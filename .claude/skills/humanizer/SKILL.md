---
name: humanizer
description: Rewrite text so it reads like a person wrote it, by removing the habits that make drafts sound machine-generated (stock vocabulary, hollow significance claims, "not just X, but Y" framing, rule-of-three lists, -ing tack-ons, em dash overuse, vague attributions, tidy summary endings). Use this whenever the user asks to humanize, de-AI, make more natural or human, or "make it sound like me" for any text, including emails, posts, essays, reports and cover letters, even if they never say "humanizer". Also use it to proofread a draft for AI-sounding patterns. English only.
---

# Humanizer

Rewrite the user's text so it sounds like a specific person wrote it, while keeping every fact, number, name, citation and claim exactly as it was.

## What "human" means here

Machine-sounding text is rarely wrong, it is generic. It reaches for the safest word, inflates the importance of everything, hedges with vague sources, and wraps each point in a neat package. Human writing is more specific, more uneven, and takes a position. So the job is not to swap words for synonyms. It is to replace generic filler with the plain, specific thing the writer would have said.

Do not promise the result will pass an AI detector. Detectors are unreliable and nothing here can guarantee it. If the user asks, say so.

## Workflow

1. **Read for register.** Decide whether the text is formal (academic, clinical, legal), professional (work email, report), or casual (blog, social). Keep that register. Formal text stays formal: remove the tells, do not add slang or contractions where they would be out of place.
2. **Mark the tells.** Scan against `references/ai-patterns.md`. Read it fully the first time. It lists vocabulary, phrasing, structure, formatting and punctuation patterns with examples.
3. **Rewrite.** For each flagged spot, ask what the sentence is actually claiming and say that directly. Cut a sentence if it only gestures at importance. Use the simple verb ("is", "has") over a fancy one ("serves as", "boasts"). Vary sentence length naturally, but do not force fragments or errors in.
4. **Check meaning.** Compare against the original: no facts added, dropped or changed; same numbers, names, dates, quotes, citations, hedges that carry real uncertainty (for example "may", "in this sample") and technical terms. Humanizing must never make a claim stronger or weaker.
5. **Re-scan your own output.** Rewrites often introduce new tells, such as swapping one stock phrase for another or overusing contractions and rhetorical questions. Fix what you find.

## Rules that matter

- **Never invent.** Do not add personal anecdotes, opinions, statistics, sources or experiences the user did not give you. If the text feels vague because a concrete detail is missing, flag it in the change list and ask for the detail rather than making one up.
- **Do not hide the seams.** No deliberate typos or grammar mistakes. They damage credibility and are not what human writing is.
- **Match the user's voice if you have a sample.** If they paste something they wrote themselves, mirror its sentence length, vocabulary and punctuation habits over the general guidance here.
- **Keep what is already fine.** Edit the problems and leave good sentences alone. A heavier rewrite is not a better one.
- **Keep the original's structure** unless the structure itself is the tell (for example, a forced "Challenges and Future Outlook" section). Say so when you change it.
- **Formatting follows the medium.** Strip decorative bold, emoji bullets and heading clutter from prose that would normally be plain paragraphs. Keep real lists and headings where the format calls for them.

## Output format

Return exactly this:

```
**Rewritten text**

<the humanized text, ready to paste>

**What changed**
- <pattern removed> → <what replaced it>, with a short quoted example
- ...
- <any spot where a concrete detail is missing and you need it from the user>
```

Keep the change list to the changes that matter, usually 3 to 8 bullets, grouped by pattern rather than listed line by line. Do not add commentary beyond that. If the text is short and already reads naturally, say so and list only the small edits.

## Example

Input:
> Our team is thrilled to announce a pivotal milestone. The new dashboard serves as a testament to our commitment to innovation, empowering users to seamlessly navigate their data, fostering collaboration, and ensuring informed decision-making.

Output:
> We launched the new dashboard today. It's built so you can find and work with your data more easily. [Add one or two specific things it does, for example a feature you use most.]

What changed:
- Hollow significance ("pivotal milestone", "testament to our commitment") became a plain statement of what shipped.
- Stacked -ing clauses ("empowering... fostering... ensuring...") were cut. They claimed benefits without naming any.
- The input names no actual features, so I left a bracketed gap instead of inventing some. Send me the details and I will fill it in.
