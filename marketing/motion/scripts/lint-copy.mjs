// Copy rules from the campaign's Design guideline, enforced before render.
// A rule that lives in code can't drift, whoever writes the next post.
//
//   node scripts/lint-copy.mjs          check every job in content/campaign.json
//
// Errors stop the render. Warnings print. Unfilled placeholders ([…], ___)
// don't stop it, but those jobs are stamped "مسودة · DRAFT".
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const BANNED = [
  ['تأمين', 'never "تأمين" in consumer content'],
  ['الأفضل', 'never "الأفضل": replace the adjective with a name, a number or a picture'],
  ['مضمون', 'never "مضمون"'],
  ['علاج نهائي', 'never "علاج نهائي"'],
  ['دينار', 'no prices in consumer content'],
  ['د.ع', 'no prices in consumer content'],
  ['IQD', 'no prices in consumer content'],
];
// Adjectives that need proof next to them.
const PROOF = ['أفضل', 'أسرع', 'موثوق'];
// Other dialects (Design guideline → Copy rules → "Never").
const DIALECT = {
  'شو': 'شنو', 'إيش': 'شنو', 'هلق': 'هسه', 'دلوقتي': 'هسه', 'الحين': 'هسه', 'كتير': 'هواية', 'وايد': 'هواية',
  'هيك': 'هيچ', 'كده': 'هيچ', 'بكرة': 'باچر', 'بكره': 'باچر', 'بدّي': 'أريد', 'بدي': 'أريد', 'عايز': 'أريد',
  'ازاي': 'شلون', 'حكي': 'حچي', 'ابعت': 'دز',
};
const FEAR = ['ما تدري', 'فوات الأوان', 'قبل لا يفوت'];
const LATIN_OK_KEYS = new Set(['phone', 'whatsapp', 'handle', 'url', 'figure', 'template', 'id', 'when', 'icon', 'sfx']);
const HOOK_KEYS = new Set(['hook', 'kicker']);

const tokens = (s) => s.replace(/[*~]/g, '').split(/[\s،,.:؛;!؟?()«»"'…\-–—/]+/).filter(Boolean);

function walk(value, keyPath, visit) {
  if (typeof value === 'string') visit(keyPath, value);
  else if (Array.isArray(value)) value.forEach((v, i) => walk(v, [...keyPath, i], visit));
  else if (value && typeof value === 'object') for (const k of Object.keys(value)) walk(value[k], [...keyPath, k], visit);
}

export function lintCampaign(campaign, onlyIds = null) {
  const errors = [], warnings = [], placeholders = new Set();
  const check = (owner, keyPath, s) => {
    const key = [...keyPath].reverse().find((k) => typeof k === 'string') || '';
    const where = `${owner} → ${keyPath.join('.')}`;
    const arabic = /[؀-ۿ]/.test(s);
    for (const [word, why] of BANNED) if (s.includes(word)) errors.push(`${where}: ${why}`);
    const toks = tokens(s);
    for (const w of PROOF) if (toks.includes(w)) warnings.push(`${where}: "${w}" needs proof beside it (a name, a number or a picture)`);
    for (const tk of toks) if (DIALECT[tk]) warnings.push(`${where}: "${tk}" is not Iraqi; write "${DIALECT[tk]}"`);
    for (const f of FEAR) if (s.includes(f)) warnings.push(`${where}: sounds like a fear hook ("${f}"); inform and invite instead`);
    if (arabic && /[0-9]/.test(s) && !LATIN_OK_KEYS.has(key)) errors.push(`${where}: Western digits in Arabic copy; use ٠١٢٣٤٥٦٧٨٩ (phone numbers and handles only are Western)`);
    const pinks = (s.match(/\*[^*]+\*/g) || []).length;
    if (pinks > 1) errors.push(`${where}: ${pinks} pink groups; exactly one element per frame is pink`);
    if (HOOK_KEYS.has(key) && toks.length > 5) warnings.push(`${where}: hook has ${toks.length} words; keep it to 5`);
    if (toks.length > 20) warnings.push(`${where}: ${toks.length} words; keep on-screen text to 20 per frame`);
    if (/\[[^\]]*\]|_{2,}/.test(s)) placeholders.add(owner);
  };
  walk(campaign.brand, ['brand'], (kp, s) => check('brand', kp, s));
  for (const job of campaign.jobs) {
    if (onlyIds && !onlyIds.includes(job.id)) continue;
    walk(job.params || {}, [], (kp, s) => check(job.id, kp, s));
  }
  for (const id of placeholders) warnings.push(`${id}: has unfilled placeholders → rendered with a DRAFT stamp`);
  return { errors, warnings, placeholders };
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const campaign = JSON.parse(readFileSync(path.join(root, 'content/campaign.json'), 'utf8'));
  const { errors, warnings } = lintCampaign(campaign);
  for (const w of warnings) console.log('⚠', w);
  for (const e of errors) console.log('✖', e);
  console.log(errors.length ? `\n${errors.length} error(s): fix before rendering.` : `\nCopy check passed (${campaign.jobs.length} jobs, ${warnings.length} warning(s)).`);
  process.exit(errors.length ? 1 : 0);
}
