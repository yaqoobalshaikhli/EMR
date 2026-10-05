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
node scripts/render.mjs 93-tabeebx --audio  # the soundtrack alone, as a WAV
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

On a still (a carousel, the wordmark), `--alpha` writes PNGs with a
transparent background instead, named `<job>-alpha-01.png` and so on.

White type gets a soft shadow in this mode, so it stays readable on light
pictures. The 3D film is a set, not an overlay, so its transparent version is
`93a`: the logo build alone, with no backdrop, floor or type.

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
| `11-mon05-pressure-carousel` | Mon 5 Oct, 8:30 PM | «اعرف أرقامك» 1 of 7, 7 infographic slides: «الضغط العالي ما يوجع.» A grid of 100 people with 46 in pink (unaware), a funnel down to the 21 whose pressure is controlled, a monitor reading «؟؟؟/؟؟», then the visit at home. WHO figures; needs the reviewing doctor's name |
| `19-tue06-every-minute-carousel` | Tue 6 Oct, 8:30 PM | «أكتوبر الوردي» 1 of 10, 8 slides: «كل دقيقة بالعالم ٤ نساء يطلعلهن سرطان ثدي.» The world in 2022 (2.3 million diagnosed, 670,000 deaths), 2050 (+38% cases, +68% deaths) and lifetime odds in rich vs poor countries. WHO and IARC |
| `12-wed07-sugar-carousel` | Wed 7 Oct, 8:30 PM | «اعرف أرقامك» 2 of 7, 7 slides: «السكري ما يدگ الباب.» A ring at 45% (undiagnosed, IDF Diabetes Atlas 2021), quiet years on a timeline, two blood-sugar numbers still «؟», and the twist «إحنا ندگه.» |
| `18-thu08-breast-cancer-carousel` | Thu 8 Oct, 8:30 PM | «أكتوبر الوردي», Breast Cancer Awareness Month, 8 slides: «كل يوم بالعراق ٢٢ امرأة يطلعلهن سرطان ثدي.» Iraq's 2022 count (8,184 new cases, the most common cancer in Iraqi women), one woman in twenty over a lifetime, the WHO warning signs, and 5-year survival by region. WHO and IARC figures only |
| `13-fri09-cholesterol-carousel` | Fri 9 Oct, 8:30 PM | «اعرف أرقامك» 3 of 7, 8 slides: «الكوليسترول ما يبين بالمراية.» An iceberg, an artery narrowing in three cross-sections, a lipid panel of four «؟», the one who checked beside the one who didn't, and the home test in three steps |
| `20-sat10-brca-carousel` | Sat 10 Oct, 8:30 PM | «أكتوبر الوردي» 2 of 10, 8 slides: what BRCA1 and BRCA2 are (a drawn DNA strand), breast and ovarian risk with a harmful change, and what a positive, negative or unclear result means. NCI |
| `14-sun11-prediabetes-carousel` | Sun 11 Oct, 8:30 PM | «اعرف أرقامك» 4 of 7, 7 slides: «السكري يعطيك فرصة وحدة.» 11 of 100 adults in pink (impaired glucose tolerance, IDF 2021), the blood-sugar band from normal to diabetes with the middle zone «هنا بعده يرجع», and a ring at 58% (the Diabetes Prevention Program) |
| `21-mon12-family-tree-carousel` | Mon 12 Oct, 8:30 PM | «أكتوبر الوردي» 3 of 10, 8 slides: «شجرة عائلتچ تحچي.» Who should ask about the genetic test, the 50% chance of passing a change on, from the mother or the father. NCI, USPSTF |
| `15-tue13-anemia-carousel` | Tue 13 Oct, 8:30 PM | «اعرف أرقامك» 5 of 7, 7 slides: «تعبك مو دايماً من الشغل.» WHO anaemia bars (children 40, pregnant women 37, women 30 in 100), the signs we call «تعب عادي», and a blood picture of two «؟» |
| `22-wed14-myths-carousel` | Wed 14 Oct, 8:30 PM | «أكتوبر الوردي» 4 of 10, 8 slides: «صح لو غلط؟» Five beliefs, including «a blood test finds it early» (no: ASCO). WHO |
| `16-thu15-kidney-carousel` | Thu 15 Oct, 8:30 PM | «اعرف أرقامك» 6 of 7, 7 slides: «الكلى ما تصيح.» Over 10 in 100 (ISN), the five stages by filtration rate with symptoms only in the last two, diabetes and blood pressure as the two main causes, and a kidney panel of three «؟» |
| `23-fri16-signs-carousel` | Fri 16 Oct, 8:30 PM | «أكتوبر الوردي» 5 of 10, 8 slides: «مو كل علامة كتلة.» The WHO signs, sorted into what you see and what you feel; most lumps are not cancer |
| `17-sat17-thyroid-carousel` | Sat 17 Oct, 8:30 PM | «اعرف أرقامك» 7 of 7, 7 slides: «الغدة الدرقية ما تعطي إنذار.» One woman in eight in pink (American Thyroid Association), an underactive and an overactive thyroid side by side, and TSH and FT4 still «؟» |
| `24-sun18-risk-factors-carousel` | Sun 18 Oct, 8:30 PM | «أكتوبر الوردي» 6 of 10, 8 slides: «بعض أسباب الخطر بإيدچ.» WHO risk factors, fixed and changeable |
| `25-tue20-time-carousel` | Tue 20 Oct, 8:30 PM | «أكتوبر الوردي» 7 of 10, 8 slides: «أخطر شي بعد الكتلة... الانتظار.» The stages and the WHO Global Breast Cancer Initiative targets (60% found early, diagnosis within 60 days, 2.5 million lives by 2040) |
| `26-thu22-mammogram-carousel` | Thu 22 Oct, 8:30 PM | «أكتوبر الوردي» 8 of 10, 8 slides: «فوق الخمسين؟ هذا فحصچ.» Mammography every 2 years at 50–69 (WHO 2014); the doctor points her to a radiology centre |
| `27-sat24-men-carousel` | Sat 24 Oct, 8:30 PM | «أكتوبر الوردي» 9 of 10, 8 slides, to men: «سرطان الثدي... يصيب الرجال هم.» Up to 1 case in 100, the signs, and BRCA2 risk in men. WHO, NCI |
| `28-mon26-mothers-carousel` | Mon 26 Oct, 8:30 PM | «أكتوبر الوردي» 10 of 10, 8 slides: «أمچ ما راح تشتكي.» Questions for a daughter to ask her mother |
| `29-tue27-hormones-overview-carousel` | Tue 27 Oct, 8:30 PM | «هرمونات بلا طبيب» 1 of 10, to men, 8 slides: «العضلات تبين. الضرر ما يبين.» Baghdad bodybuilders who used hormones (PubMed 2012), the FDA and NHS list of harms, a Danish cohort with nearly 3 times the death rate (JAMA 2024), and the four specialties that follow a user |
| `30-thu29-hormones-heart-carousel` | Thu 29 Oct, 8:30 PM | «هرمونات بلا طبيب» 2 of 10: the heart and the blood. Pressure, cholesterol, thick blood and clots, a weaker heart muscle. FDA, NHS, PubMed |
| `31-sat31-hormones-manhood-carousel` | Sat 31 Oct, 8:30 PM | «هرمونات بلا طبيب» 3 of 10: «الإبرة تكبّر العضلة... وتصغّر الخصية.» Testicles, sperm, erections, a Baghdad hormone study (PubMed 2024), and 27 in 100 former users still low years later (PubMed 2016) |
| `32-mon02-hormones-stopping-carousel` | Mon 2 Nov, 8:30 PM | «هرمونات بلا طبيب» 4 of 10: stopping suddenly or tapering alone. FDA withdrawal symptoms; the doctor plans the stop. No doses or protocols |
| `33-wed04-hormones-mind-carousel` | Wed 4 Nov, 8:30 PM | «هرمونات بلا طبيب» 5 of 10: aggression, mood, 3 in 10 users dependent (PubMed 2009), depression after stopping, and psychiatry |
| `34-fri06-hormones-chest-carousel` | Fri 6 Nov, 8:30 PM | «هرمونات بلا طبيب» 6 of 10: gynaecomastia and general surgery. NHS |
| `35-sun08-hormones-tendons-carousel` | Sun 8 Nov, 8:30 PM | «هرمونات بلا طبيب» 7 of 10: torn tendons, 22 vs 6 in 100 bodybuilders (PubMed 2015), growth in teenagers (NHS), and orthopaedics |
| `36-tue10-hormones-peptides-carousel` | Tue 10 Nov, 8:30 PM | «هرمونات بلا طبيب» 8 of 10: peptides, SARMs and growth hormone. FDA, PubMed |
| `37-thu12-hormones-liver-kidney-carousel` | Thu 12 Nov, 8:30 PM | «هرمونات بلا طبيب» 9 of 10: «الكبد ما يشتكي... لحد ما يصفر وجهك.» Steroid tablets and the liver, kidney damage in bodybuilders (PubMed 2010), and Iraqi Kurdistan: 26 in 100 regular gym-goers using steroids, veterinary vitamin D injections and kidney failure (PubMed 2020) |
| `38-sat14-hormones-myths-carousel` | Sat 14 Nov, 8:30 PM | «هرمونات بلا طبيب» 10 of 10: «صح لو غلط؟» Five gym beliefs, including the WHO male-contraception study where testosterone stopped sperm in 65 in 100 men (Lancet 1990) |
| `97-pink-october-wordmark` | Any time in October | «أكتوبر الوردي» in Cairo Black with the ribbon, in pink, white and navy. Render with `--alpha` for transparent PNGs |
| `10-nov01-scorecard-template` | First Sunday of every month | Monthly scorecard, misses included |
| `91-highlight-covers` | Profile | شوف بعينك · دكاترتنا · وعدنا · سؤالكم · لأهلك |
| `92-tabeebx-brand-film` | Any time | Brand film, 33 s, no faces. The pink dot of the logo rings as the doorbell, the door opens, the services arrive, and the dot lands as the head of the TabeebX figure in the closing logo. Render it with `--alpha` too |
| `93-tabeebx-film-3d` | Any time | The brand film in real 3D, 30.5 s, no faces, with its own orchestral score. At night the logo's pink head rings as the doorbell beside a Baghdadi door. The door opens onto light and the camera walks through into a bright studio. The seven services arrive as glossy cards, then the logo builds in 3D and lands on the doorbell |
| `93a-tabeebx-logo-3d` | Any time | The 3D logo build from `93` on its own, 10.9 s. Render it with `--alpha` to lay it over footage |
| `94-knee-prp-3d` | After a doctor's review | 3D explainer, 47.5 s, «ركبتك... من جوّه». It goes inside the knee: the cartilage, how it wears, why each extra kilo counts four times, the treatment ladder, PRP from blood tube to ultrasound-guided injection, and the team at home. Script and voice-over: `content/scripts/94-knee-from-inside.md` |
| `95-what-is-tabeebx-3d` | Pinned intro, after the visit times are confirmed | Video 1 of the scripts, in 3D, 44 s: «شنو هو طبيب اكس؟» answered in three words, «نسمعك. نجيك. نفحصك.», around a Baghdadi house at night. Specialties gather round a speech bubble; the pink head rings the door and a 24-hour dial shows the two visit times; sample tubes and a result on a phone. Script and voice-over: `content/scripts/95-what-is-tabeebx.md` |
| `96-tabeebx-characters` | Internal: pick one man and one woman | The TabeebX cast in 3D, 8 stills at 1080×1920. The three men and the three women line up numbered on pedestals, then each gets a card with name, role and one line on who they are. Men: حكيم (specialist), أمين (home visits), سالم (senior doctor). Women: نور (consultations), أمل (follow-up nurse), سارة (lab tests). Real-looking 3D people from `src/cast.js`, never real staff or patients |

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
- **DRAFT stamp:** placeholders such as `[الاسم]` or `__`. For example, «راجعها طبياً: د. [الاسم]» keeps a medical post stamped until the reviewing doctor is named. The «أكتوبر الوردي» and «هرمونات بلا طبيب» carousels (`18` to `38`) are final without a reviewer line; add one back with a real name only.

Markup in copy: `*pink*`, `~blue~`, `\n` for a line break. A trailing `...`
pulses: it is the open loop.

`"theme": "pink"` on a carousel draws it in pink and white only; the eleven
«أكتوبر الوردي» carousels (`18` to `28`) use it. A navy slide turns pink with
white type, a white slide keeps white with pink type and its small print in a
deeper pink, and each `*pink*` phrase sits in a chip of the other colour. The
«أكتوبر الوردي» lettering keeps its transparent background, white on pink and
pink on white. It covers every slide type Pink October uses, the DNA drawing
included; the «هرمونات بلا طبيب» carousels keep the navy look.

`"hookPop": true` sets the cover's highlighted line, its keyword, in Cairo Black
as big as the column allows, up to 150 px. Carousels `18` to `38` use it.

## Brand assets

- `src/logo.js` and `assets/brand/tabeebx-logo.svg`: the official TabeebX
  logo, traced to vectors from the artwork. Each shape is its own path (the
  pink head, the blue arms, the pink torso, the two blue legs, the seven
  letters), so the brand film can build the logo piece by piece. The colours
  are the brand tokens. The wordmark is never retyped.
- `assets/brand/tabeebx-figure-white.svg`: the same figure in white, inside the
  pink tab and on the end card.
- `assets/fonts/`: Cairo Medium, Bold and Black (Arabic and Latin), SIL Open Font
  License, see `OFL.txt`.
- The audio is synthesized from scratch, so nothing needs licensing. That
  includes the score of `93`: strings, felt piano, a heartbeat and impacts,
  composed in `brand-film-3d.js` with the instruments in `src/score.js`.
- `assets/people/`: photos of real people, **kept out of git** because this
  repository is public. Put a consented photo there and point a job's `photo`
  at it (`"../assets/people/name.jpg"`). If the file is missing, that job
  renders an empty frame with a DRAFT stamp instead of failing.
- `src/art.js`: illustrations drawn in code for posts without photos yet (tea
  held in an older woman's hands, a nurse visiting at home, Baghdad on the
  Tigris, the flag, a DNA strand with BRCA1 and BRCA2 marked). The figures are faceless, like the one in the logo, so
  they never pass for a real patient or nurse. Swap them for consented photos
  when you have them.

## How it works

`src/stage.html` loads the engine (`src/engine.js`), the brand components
(`src/components.js`) and one file per template (`src/compositions/`). A
template builds its DOM once and exposes `render(t)`, a pure function of time.
`scripts/render.mjs` steps Chromium frame by frame, captures lossless PNGs and
pipes them into ffmpeg. It mixes the template's audio cues
(`scripts/audio.mjs`) onto the same clock, so every chime lands on its frame.

The 3D films (`brand-film-3d.js`, `knee-3d.js` and `intro-3d.js` in
`src/compositions/`) use three.js, installed by `npm install` and served from
`node_modules`. What they share lives in `src/three-kit.js`: the renderer and
post chain (bloom, SMAA, grain), the white studio, the service cards, the
Baghdadi door, the sample tube, and the logo, extruded from the traced vectors
in `src/logo.js` and assembled piece by piece. Headless
Chromium renders WebGL in software, so expect about 2 s per frame: 30 minutes
for `93` and about 45–50 for `94` and `95` on four cores. Each film composes its own score,
rendered in the page with the Web Audio API (`src/score.js`), so music and
picture share one clock. A scored film is mastered to −14 LUFS, the usual
level for social video, with a look-ahead limiter at −1.4 dBFS. The other
videos are peak-normalised as before.

The cast lives in `src/cast.js`: `await loadPerson('noor')` returns a posed,
dressed person in metres, and `pose(t)` moves them to any moment of their motion
clip. The bodies, faces and motion are avatars from Microsoft's Rocketbox library
(MIT licence, `assets/cast/LICENSE`); `src/cast.json` says who wears what and
`scripts/build-cast.mjs` copies those files into `assets/cast` (about 28 MB).
At load time `src/cast.js` lays a face from another avatar over each body and
tones the neck and hands to match, grows a hijab round the head where the roster
asks for one, turns the field jackets TabeebX navy with TabeebX badges and back
patch, swaps the hospital ID card on the coats for a TabeebX one, adds a smile,
and puts the bag, the phone or the sample kit in the hand. The faces are stock
3D scans of models: never present them as real TabeebX doctors or nurses.
`96` renders the choice sheet in about 20 s.
