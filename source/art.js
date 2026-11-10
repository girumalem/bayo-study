/* ---------- original level illustrations (inline SVG, theme-aware) ---------- */
const C_ = { ink:"var(--ink)", acc:"var(--accent)", navy:"var(--navy)", card:"var(--card)", line:"var(--line)", good:"var(--good)", noun:"var(--noun)", verb:"var(--verb)", adv:"var(--adv)", pron:"var(--pron)" };
const ART = {
 // Level 1 · Nouns & Verbs: hoop + ball (the thing) going in (the action)
 nv: `<rect x="30" y="14" width="60" height="40" rx="4" style="fill:var(--card);stroke:var(--navy);stroke-width:4"/>
      <rect x="48" y="30" width="24" height="16" style="fill:none;stroke:var(--verb);stroke-width:3"/>
      <ellipse cx="60" cy="58" rx="20" ry="4" style="fill:none;stroke:var(--verb);stroke-width:4"/>
      <path d="M42 60l6 22M52 61l3 21M60 62v20M68 61l-3 21M78 60l-6 22M45 70h30M48 79h24" style="fill:none;stroke:var(--ink);stroke-width:2;opacity:.7"/>
      <circle cx="88" cy="92" r="16" style="fill:var(--accent)"/>
      <path d="M72 92h32M88 76v32M77 81c6 6 6 16 0 22M99 81c-6 6-6 16 0 22" style="fill:none;stroke:var(--navy);stroke-width:2.5"/>
      <path d="M70 76c-4-6-8-10-14-12" style="fill:none;stroke:var(--accent);stroke-width:3;stroke-dasharray:4 5"/>`,
 // Level 2 · Adjectives & Adverbs: fast sneaker (describe the shoe, describe how it runs)
 ar: `<path d="M18 78c0-10 6-18 14-20l18-4 10-14 14 4c-2 8 2 14 10 18l20 8c6 3 8 8 8 12v6H18z" style="fill:var(--card);stroke:var(--navy);stroke-width:4;stroke-linejoin:round"/>
      <path d="M18 88h92v8c0 4-3 6-7 6H24c-4 0-6-2-6-6z" style="fill:var(--accent)"/>
      <path d="M52 56l10 6M58 50l10 6M64 44l10 6" style="stroke:var(--navy);stroke-width:3;stroke-linecap:round"/>
      <path d="M40 70l30-2" style="stroke:var(--adv);stroke-width:5;stroke-linecap:round"/>
      <path d="M4 60h14M2 72h12M6 84h10" style="stroke:var(--adv);stroke-width:4;stroke-linecap:round"/>`,
 // Level 3 · Pronouns: two jerseys (he, she, we)
 pr: `<path d="M14 34l14-10h10c2 6 8 8 12 8s10-2 12-8h0l-2 70H18l-2-46-10 4z" style="fill:var(--pron);stroke:var(--navy);stroke-width:3;stroke-linejoin:round"/>
      <text x="38" y="78" text-anchor="middle" style="font:800 24px Lexend,sans-serif;fill:var(--card)">HE</text>
      <path d="M58 34l14-10h10c2 6 8 8 12 8s10-2 12-8l14 10-10 18-10-4-2 46H60l-2-46z" transform="translate(-6 0)" style="fill:var(--accent);stroke:var(--navy);stroke-width:3;stroke-linejoin:round"/>
      <text x="84" y="78" text-anchor="middle" style="font:800 22px Lexend,sans-serif;fill:var(--card)">SHE</text>`,
 // Level 4 · Subject–Verb Agreement: scoreboard where both sides match
 sv: `<rect x="12" y="26" width="96" height="62" rx="8" style="fill:var(--navy)"/>
      <rect x="20" y="36" width="36" height="34" rx="4" style="fill:var(--card)"/>
      <rect x="64" y="36" width="36" height="34" rx="4" style="fill:var(--card)"/>
      <text x="38" y="62" text-anchor="middle" style="font:800 22px Lexend,sans-serif;fill:var(--noun)">1</text>
      <text x="82" y="62" text-anchor="middle" style="font:800 22px Lexend,sans-serif;fill:var(--verb)">1</text>
      <text x="38" y="82" text-anchor="middle" style="font:700 9px Lexend,sans-serif;fill:var(--card)">SUBJECT</text>
      <text x="82" y="82" text-anchor="middle" style="font:700 9px Lexend,sans-serif;fill:var(--card)">VERB</text>
      <path d="M40 88v14M80 88v14" style="stroke:var(--navy);stroke-width:5"/>
      <path d="M50 18l10-8 10 8" style="fill:none;stroke:var(--good);stroke-width:4;stroke-linecap:round;stroke-linejoin:round"/>`,
 // Level 5 · Complete Sentences: football through the uprights (finish the drive)
 cs: `<path d="M60 104V62M30 62h60M30 62V14M90 62V14" style="fill:none;stroke:var(--accent);stroke-width:6;stroke-linecap:round"/>
      <ellipse cx="60" cy="34" rx="16" ry="10" transform="rotate(-25 60 34)" style="fill:#8a4b22;stroke:var(--navy);stroke-width:2"/>
      <path d="M52 36l16-6M56 30l2 4M60 29l2 4M64 27l2 4" transform="rotate(-2 60 32)" style="stroke:var(--card);stroke-width:2;stroke-linecap:round"/>
      <path d="M40 92c6-24 10-40 14-52" style="fill:none;stroke:var(--navy);stroke-width:3;stroke-dasharray:4 5"/>
      <path d="M14 104h92" style="stroke:var(--good);stroke-width:6;stroke-linecap:round"/>`,
 // Level 6 · Commas: coach's whistle (a comma is a short pause)
 cm: `<path d="M24 56a26 26 0 1 0 52 0V44h30v-14H50a26 26 0 0 0-26 26z" style="fill:var(--card);stroke:var(--navy);stroke-width:4;stroke-linejoin:round"/>
      <circle cx="50" cy="58" r="10" style="fill:var(--accent)"/>
      <path d="M20 40c-8-8-10-18-6-26" style="fill:none;stroke:var(--navy);stroke-width:3"/>
      <path d="M84 70c6 4 10 4 16 0M88 80c4 3 8 3 12 0" style="fill:none;stroke:var(--adv);stroke-width:4;stroke-linecap:round"/>
      <text x="96" y="104" text-anchor="middle" style="font:800 34px Lexend,sans-serif;fill:var(--verb)">,</text>`,
 // Level 7 · Sound-Alike Words: microphone with sound waves
 sa: `<rect x="46" y="14" width="28" height="48" rx="14" style="fill:var(--navy)"/>
      <path d="M50 26h20M50 34h20M50 42h20" style="stroke:var(--card);stroke-width:2;opacity:.6"/>
      <path d="M36 50a24 24 0 0 0 48 0" style="fill:none;stroke:var(--navy);stroke-width:4;stroke-linecap:round"/>
      <path d="M60 74v18M46 96h28" style="stroke:var(--navy);stroke-width:5;stroke-linecap:round"/>
      <path d="M22 32c-6 8-6 22 0 30M12 24c-10 14-10 32 0 46M98 32c6 8 6 22 0 30M108 24c10 14 10 32 0 46" style="fill:none;stroke:var(--accent);stroke-width:4;stroke-linecap:round"/>`,
 // Level 8 · Verb Tenses: game clock / stopwatch (past, present, future)
 vt: `<circle cx="60" cy="66" r="38" style="fill:var(--card);stroke:var(--navy);stroke-width:5"/>
      <rect x="52" y="14" width="16" height="10" rx="3" style="fill:var(--navy)"/>
      <path d="M60 66V40M60 66l18 12" style="stroke:var(--verb);stroke-width:5;stroke-linecap:round"/>
      <circle cx="60" cy="66" r="4" style="fill:var(--navy)"/>
      <path d="M30 66h6M84 66h6M60 96v-6" style="stroke:var(--ink);stroke-width:3"/>
      <path d="M90 24l10-8" style="stroke:var(--accent);stroke-width:5;stroke-linecap:round"/>`,
 // Final level · Championship Game: trophy
 boss: `<path d="M38 18h44v22a22 22 0 0 1-44 0z" style="fill:var(--accent);stroke:var(--navy);stroke-width:3"/>
      <path d="M38 24H22c0 14 6 22 18 22M82 24h16c0 14-6 22-18 22" style="fill:none;stroke:var(--navy);stroke-width:4"/>
      <path d="M54 62h12v16H54zM40 86h40v12H40z" style="fill:var(--navy)"/>
      <path d="M60 26l3 7 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1z" style="fill:var(--card)"/>`,
 // Bible (used on lesson slides about Bible examples)
 bible: `<path d="M26 18h58a8 8 0 0 1 8 8v76H34a8 8 0 0 1-8-8z" style="fill:var(--navy)"/>
      <path d="M34 94h58" style="stroke:var(--card);stroke-width:4"/>
      <path d="M59 34v36M48 46h22" style="stroke:var(--accent);stroke-width:6;stroke-linecap:round"/>`,
 lock: `<rect x="34" y="54" width="52" height="42" rx="8" style="fill:var(--muted)"/><path d="M44 54V42a16 16 0 0 1 32 0v12" style="fill:none;stroke:var(--muted);stroke-width:8"/>`,
};
const art = (id, size, label) => `<svg viewBox="0 0 120 120" width="${size}" height="${size}" ${label?`role="img" aria-label="${label}"`:'aria-hidden="true"'}>${ART[id]||ART.boss}</svg>`;
