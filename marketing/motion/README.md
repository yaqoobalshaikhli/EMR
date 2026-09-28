# TabeebX motion — «لا تصدگنا. شوف بعينك.»

Code-rendered motion graphics for the TabeebX Trust & Loyalty campaign. One
content file (`content/campaign.json`) holds the copy for every post of launch
week; `npm run render:all` turns it into Instagram-ready files. The five fixed
brand assets from the campaign's Design guideline are built into every
template, so they can't drift from post to post:

| Asset | How the code carries it |
| --- | --- |
| Navy and pink, together | Navy field on every frame. Templates place one pink element per frame besides the tab, and the copy check allows at most one pink group per line |
| The pink tab | Same size and place in every template: top right, inside Instagram's safe zone |
| Real faces with the pink lanyard | Code can't supply faces. It frames real footage: opener, B-roll and end card around the founder video |
| The doorbell | An original two-note chime (E5 → C5), synthesized in `scripts/audio.mjs`. It rings in the first second of every Reel and again on the end card. It is also exported as `out/tabeebx-doorbell.wav` for editors |
| 8:30 PM | «كل ليلة ٨:٣٠» on teasers and end cards; a clock set to 8:30 in every «باچر» story |

## Run it

Requirements: Node 18+, and ffmpeg with libx264 on `PATH` (or `FFMPEG=/path/to/ffmpeg`).

```bash
cd marketing/motion
npm install
npx playwright install chromium   # once, if Chromium isn't installed yet
npm run check                      # copy rules (see below)
npm run render:all                 # everything → out/
node scripts/render.mjs launch     # only jobs whose id contains "launch"
node scripts/render.mjs --list     # what each job is and when it posts
node scripts/render.mjs 92 --alpha # transparent background (see below)
npm run preview                    # live studio in the browser, scrubbable
```

Videos are 1080×1920 at 30 fps: H.264 High, AAC 48 kHz, BT.709, faststart.
Brand hex values survive encoding within ±1. Carousels are 1080×1350 PNG and
highlight covers are 1080×1080 PNG. Each full video also gets a `-cover.png` to
use as the Reel or story cover.

`--alpha` renders a video with no background, for laying it over other
footage. It writes two files from the same frames:

- `-alpha.webm`: VP9 with a real alpha channel, for Premiere, DaVinci, CapCut
  desktop and the web.
- `-greenscreen.mp4`: the same animation over chroma green, for phone editors.
  In CapCut, add it as an overlay, then use Cutout → Chroma key on the green.

White type gets a soft shadow in this mode, so it stays readable on light
pictures.

## Launch week in `campaign.json`

| Job | Posts | Format |
| --- | --- | --- |
| `01-sat26-teaser-story` | Sat 26 Sep, 8:30 PM | Story, 8 s. Add the countdown sticker in the app |
| `02-sun27-launch-reel` | Sun 27 Sep, 8:30 PM | Reel, 40 s: the founder script, beat by beat |
| `02a` / `02b` / `90` | Founder edit | Opener (2.4 s), door B-roll (11 s), end card (3.4 s) |
| `02c` … `08b` | Daily 10:30 AM / 9:00 PM / 9:30 PM | Morning questions (white, room for the poll sticker) and «باچر» teasers |
| `03a-mon28-doctor-carousel` | Mon 28 Sep, 8:30 PM | 6 slides, «هذا دكتورك»: the founder's photo on an ID badge, credentials, his own words |
| `03c-mon28-door-reel` | Mon 28 Sep, 8:30 PM, instead of `03a` | Reel, 28.6 s, «منو بالباب؟»: no faces, no names. The doorbell rings, the door opens and the home services come through it. Evergreen after launch week |
| `04-tue29-heart-carousel` | Tue 29 Sep, 8:30 PM | 7 slides, World Heart Day, «صح لو غلط؟» |
| `05-wed30-visit-opener` | Wed 30 Sep, 8:30 PM | Opener for the filmed home lab visit, with the demonstration label |
| `06a-thu01-parents-carousel` | Thu 1 Oct, 8:30 PM | 6 slides, «أهلنا ما يشتكون», with illustrations drawn in code |
| `08a-sat03-national-day` | Sat 3 Oct, 8:30 PM | Single image: Baghdad on the Tigris at dusk, the flag, «العراق بخير... من أهله بخير.» |
| `09-sun04-promise-reel` / `09b` | Sun 4 Oct, 8:30 PM | وعد TabeebX: the Reel and the 6-slide carousel |
| `10-nov01-scorecard-template` | First Sunday of every month | Monthly scorecard, misses included |
| `91-highlight-covers` | Profile | شوف بعينك · دكاترتنا · وعدنا · سؤالكم · لأهلك |
| `92-tabeebx-brand-film` | Any time | Brand film, 33 s, no faces. The pink dot of the logo rings as the doorbell, the door opens, the services arrive, and the dot lands as the head of the TabeebX figure in the closing logo. Render it with `--alpha` too |

### The founder edit (Sun 27 Sep)

If the founder video is filmed, the motion edition can wrap it instead of
replacing it. In CapCut or Premiere: `02a` opener → founder video (2–19 s) →
`02b` door B-roll under his voice (19–30 s) → founder (30–36 s) → `90` end
card. The doorbell is already inside the opener and the end card. Burn in
captions: Cairo Bold 52–60 px, white on a navy box at 85% opacity, two lines,
centred.

### Sat 3 Oct: fill in the promise

In `09-sun04-promise-reel`, replace each `complaint` with one of the
audience's top three answers. Set each promise's `n` to the number measured in
the baseline week, in Arabic-Indic digits (`"١٥"`). Publish only a number hit
in at least 19 of 20 cases; if a promise isn't ready, delete it and publish
two. Do the same in the `09b` carousel slides, then:

```bash
node scripts/render.mjs 09-sun04 09b
```

Once no `[…]` or `__` placeholder is left, the DRAFT stamp goes away.

### Every first Sunday: the scorecard

In `10-nov01-scorecard-template` (copy it per month), set the month in `hook`.
For each promise, set `hit` / `of` (e.g. 19 of 20) and a `fix` for any miss,
then render. A promise under `threshold` (95% by default) is shown as
«قصّرنا» with what changed, never hidden. The job is stamped
«نموذج · أرقام تجريبية» until the sample numbers are replaced: delete
`draftLabel` and the placeholders.

## Copy rules the render enforces

`npm run check` runs before every render. **Errors** stop the render; the rest
are warnings.

- **Error:** «تأمين», «الأفضل», «مضمون», «علاج نهائي» and prices (دينار, د.ع, IQD).
- **Error:** Western digits in Arabic copy. Use ٠١٢٣٤٥٦٧٨٩; only phone numbers and handles stay Western.
- **Error:** more than one pink group (`*…*`) in a line of copy.
- **Warning:** «أفضل», «أسرع», «موثوق» with nothing to prove them.
- **Warning:** another dialect's word where an Iraqi one exists (بكرة → باچر, هيك → هيچ, …).
- **Warning:** fear phrasing, hooks over 5 words, frames over 20 words.
- **DRAFT stamp:** placeholders such as `[الاسم]` or `__`. For example, «راجعها طبياً: د. [الاسم]» keeps a medical post stamped until the reviewing doctor is named.

Markup in copy: `*pink*`, `~blue~`, `\n` for a line break. A trailing `...`
pulses: it is the open loop.

## Brand assets

- `src/logo.js` and `assets/brand/tabeebx-logo.svg`: the official TabeebX
  logo, traced to vectors from the artwork. Each shape is its own path (the
  pink head, the blue arms, the pink torso, the two blue legs, the seven
  letters), so the brand film can build the logo piece by piece. The colours
  are the brand tokens. The wordmark is never retyped.
- `assets/brand/tabeebx-figure-white.svg`: the same figure in white, inside the
  pink tab and on the end card.
- `assets/fonts/`: Cairo Medium and Bold (Arabic and Latin), SIL Open Font
  License, see `OFL.txt`.
- The audio is synthesized from scratch, so nothing needs licensing.
- `assets/people/`: photos of real people, **kept out of git** because this
  repository is public. Put a consented photo there and point a job's `photo`
  at it (`"../assets/people/name.jpg"`). If the file is missing, that job
  renders an empty frame with a DRAFT stamp instead of failing.
- `src/art.js`: illustrations drawn in code for posts without photos yet (tea
  held in an older woman's hands, a nurse visiting at home, Baghdad on the
  Tigris, the flag). The figures are faceless, like the one in the logo, so
  they never pass for a real patient or nurse. Swap them for consented photos
  when you have them.

## How it works

`src/stage.html` loads the engine (`src/engine.js`), the brand components
(`src/components.js`) and one file per template (`src/compositions/`). A
template builds its DOM once and exposes `render(t)`, a pure function of time.
`scripts/render.mjs` steps Chromium frame by frame, captures lossless PNGs and
pipes them into ffmpeg. It mixes the template's audio cues
(`scripts/audio.mjs`) onto the same clock, so every chime lands on its frame.
