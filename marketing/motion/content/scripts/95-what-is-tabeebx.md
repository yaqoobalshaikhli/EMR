# «شنو هو طبيب اكس؟» — 3D script (job `95-what-is-tabeebx-3d`)

Script 1 from the old batch, rewritten for 3D.

**What changed and why.** The original reads like a brochure: «مشروع طبي
عراقي يوفر خدمات عديدة تهدف إلى تحسين جودة الحياة الصحية...». It lists three
services, two visit types and five lab packages, and a viewer remembers none
of them. The new version keeps every fact but hangs them on three Iraqi verbs,
one per service:

**«نسمعك. نجيك. نفحصك.»**
- **نسمعك** — we listen: a medical consultation in any specialty.
- **نجيك** — we come to you: a home visit, in two speeds.
- **نفحصك** — we test you: lab tests at home, results sent to you.

Three words fit in a viewer's head, and they're the answer to the hook.

The film is one continuous 3D shot of a Baghdadi house at night, with a shanasheel,
a palm and warm windows. The camera goes up to the sky for «نسمعك», down to
the door for «نجيك», and inside the house for «نفحصك».

- Format: Reel, 1080×1920, about 44 s, no faces, no names.
- The film works muted through the on-screen text. The voice-over is for a
  TabeebX doctor or presenter to record.

| # | Time | 3D picture | On screen | Voice-over (Iraqi dialect) |
| --- | --- | --- | --- | --- |
| 1 | 0–4.8 s | Night in Baghdad: a house with a glowing shanasheel, a palm, a street lamp. The doorbell rings and pink rings pulse from the door. Three glossy cards arrive, each with an icon. | «شنو هو طبيب اكس؟» / «بثلاث كلمات...» / cards: «نسمعك» «نجيك» «نفحصك» | «شنو هو طبيب اكس؟ بثلاث كلمات: نسمعك، نجيك، ونفحصك.» |
| 2 | 4.8–13 s | A speech bubble rises from the shanasheel into the night sky. Eight specialty tiles gather in a ring around it, each linked to it by a line of light. | «نسمعك.» / «استشارة طبية، بأي اختصاص.» Tiles: باطنية، أطفال، نسائية، قلبية، عظام، جلدية، أعصاب، أنف وأذن | «نسمعك: استشارة طبية بأي اختصاص، من الباطنية والأطفال، للقلبية والنسائية.» |
| 3 | 13–23 s | Down on the street, the pink head of the logo rolls up to the door and rings the doorbell. The door opens onto warm light. Above it, a 24-hour dial sweeps round, lighting a short pink arc (2–4 h) and a long blue one (12–24 h). | «نجيك.» / «زيارة منزلية، بنوعين:» / «VIP: من ساعتين لأربع ساعات.» / «اعتيادية: خلال ١٢ لـ ٢٤ ساعة.» | «نجيك: الكادر الطبي يوصل لبيتك. بالزيارة الاعتيادية خلال ١٢ لـ ٢٤ ساعة، وبالـVIP من ساعتين لأربع ساعات.» |
| 4 | 23–33.5 s | The camera goes through the door into a warm room. Five sample tubes drop into a rack on the table, one per family package, and a counter climbs to ٦٣١. A results sheet flies onto a phone, whose screen lights with the result and a note from the doctor. | «نفحصك.» / «تحاليل بالبيت، بحزم لكل العائلة.» Tags: للنساء، للحوامل، للأطفال، لكبار السن، للأمراض المزمنة / «٦٣١ تحليل» / «النتيجة توصلك... ووياها استشارة إذا تحتاج.» | «نفحصك: تحاليل بالبيت، بحزم للنساء والحوامل والأطفال وكبار السن وأصحاب الأمراض المزمنة. والنتيجة توصلك، ووياها استشارة إذا الحالة تحتاج.» |
| 5 | 33.5–44 s | White-out into the studio. The three cards line up again, then the pink head drops in and the TabeebX logo builds in 3D, locking on the doorbell. | «كل هذا، وأنت ببيتك.» / «لا تصدگنا. شوف بعينك.» / «كل ليلة ٨:٣٠» | «كل هذا، حتى ترتاح وأنت ببيتك. هذا طبيب اكس.» |

## Before posting

- **The visit times are promises.** «VIP: ٢–٤ ساعات» and «اعتيادية: ١٢–٢٤
  ساعة» come from the original script. The campaign's rule is to publish a
  number only if it is met in at least 19 of 20 visits, so check the
  baseline week first.
- **«٦٣١ تحليل».** The home lab's number of tests (631, in 18 categories) is
  taken from the company fact sheet (July 2026). Confirm it is current.
- **Specialties.** The eight tiles are examples of «بأي اختصاص». Swap any
  specialty TabeebX can't book today; the tiles are just text in
  `content/campaign.json`.
- **Caption idea.** «شنو هو طبيب اكس؟ بثلاث كلمات: نسمعك، نجيك، نفحصك. كل هذا وأنت ببيتك. دزلنا رسالة ونوصلك.»
