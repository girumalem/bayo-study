/* =====================================================================
   NEW-STYLE LESSONS: Watch → Explore → Words → Beat → Play
   Listen-first, hands-on. Uses the app's voice, points, unlocks and sync.
   ===================================================================== */
const V2 = (() => {
const E = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
const capHTML = s => E(s).replace(/\*([^*]+)\*/g, "<span class='k'>$1</span>");
const plain = s => String(s).replace(/\*/g, "");
const sleep = ms => new Promise(r => setTimeout(r, ms));
const mix = a => shuffle(a);

/* ---------- voice: authored lines are read as written; labels go through the app's math/genetics reader ---------- */
let talkId = 0;
/* recorded voice: /audio/manifest.json maps each line to [file, [[start,end] per word]] */
let REC = {}; const AU = typeof Audio !== "undefined" ? new Audio() : null;
let BEATS = {}; try { fetch("/audio/beat/manifest.json", {cache:"no-cache"}).then(r => r.ok ? r.json() : {}).then(x => { BEATS = x || {}; }).catch(() => {}); } catch(e) {}
try { fetch("/audio/manifest.json", {cache:"no-cache"}).then(r => r.ok ? r.json() : {}).then(j => { REC = j || {}; }).catch(() => {}); } catch(e) {}
document.addEventListener("click", function unlock(){ if (AU && !AU.src) { try { AU.muted = true; AU.play().catch(()=>{}); AU.muted = false; } catch(e) {} } document.removeEventListener("click", unlock, true); }, true);
function hush(){ talkId++; try { synth && synth.cancel(); } catch(e) {} try { if (AU) { AU.pause(); AU.ontimeupdate = null; } } catch(e) {} document.querySelectorAll(".v-w.now").forEach(w => w.classList.remove("now")); }
/* slower playback keeps the voice's pitch natural (preservesPitch) */
function setRate(){ const r = Math.max(0.6, Math.min(1.2, S.rate || 0.8)); try { AU.preservesPitch = true; AU.webkitPreservesPitch = true; AU.defaultPlaybackRate = r; AU.playbackRate = r; } catch(e) {} }
AU && AU.addEventListener("loadedmetadata", () => setRate());
function wordSpans(el, text){ if (!el) return []; el.innerHTML = text.split(/\s+/).map(w => `<span class="v-w">${E(w)}</span>`).join(" "); return [...el.querySelectorAll(".v-w")]; }
function playRec(text, el){ const rec = REC[text]; if (!rec || !AU || S.rec === false) return null; const id = talkId;
  return new Promise(res => { const ws = wordSpans(el, text), T = rec[1] || []; let fin = false; const end = ok => { if (!fin) { fin = true; ws.forEach(w => w.classList.remove("now")); res(ok && id === talkId); } };
    AU.src = "/audio/" + rec[0]; setRate();
    AU.ontimeupdate = () => { if (id !== talkId) return; const t = AU.currentTime; ws.forEach((w,i) => w.classList.toggle("now", !!T[i] && t >= T[i][0] && t < T[i][1] + 0.05)); };
    AU.onended = () => end(true); AU.onerror = () => end(false);
    AU.play().catch(() => { end(false); }); }); }
function sayRaw(text, el){ hush(); const id = talkId, p = playRec(String(text||""), el); if (p) return p.then(ok => ok ? true : (id === talkId ? ttsRaw(text) : false)); return ttsRaw(text); }
async function saySeq(parts){ let last = null; for (const [t, el] of parts) { if (!t) continue; if (last !== null) { await sleep(450); if (talkId !== last) return false; } const ok = await sayRaw(t, el); if (!ok) return false; last = talkId; } return true; }
function ttsRaw(text){ const id = talkId; return new Promise(res => {
  if (!synth || !text) { setTimeout(() => res(id === talkId), 30); return; }
  const u = new SpeechSynthesisUtterance(text); u.rate = S.rate; if (voice) u.voice = voice; u.lang = voice ? voice.lang : "en-US";
  let fin = false; const end = () => { if (!fin) { fin = true; res(id === talkId); } };
  u.onend = end; u.onerror = end; setTimeout(end, 2500 + text.length * 110 / (S.rate||0.9));
  synth.speak(u); }); }
const sayLabel = t => sayRaw(spoken(String(t)));
const tick = () => tone([[520,.06]]);

/* ---------- small svg icons (anything else is shown as an emoji) ---------- */
const IC = {
 coach:`<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 20a9 9 0 1 0 18 0v-4h10v-5H17a9 9 0 0 0-9 9z" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="17" cy="20" r="3.5" fill="var(--accent)"/></svg>`,
 power:`<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M23 3L9 23h10l-3 14 15-21H21z" fill="var(--accent)" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`,
 shield:`<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4l13 5v9c0 9-6 15-13 18C13 33 7 27 7 18V9z" fill="none" stroke="currentColor" stroke-width="3"/><path d="M14 20l4 4 8-9" fill="none" stroke="var(--good)" stroke-width="3.5" stroke-linecap="round"/></svg>`,
 hammer:`<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M8 10h16l4 4-4 4H8z" fill="var(--accent)"/><path d="M18 18l-10 16" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg>`,
 sun:`<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="8" fill="var(--accent)"/><path d="M20 3v6M20 31v6M3 20h6M31 20h6M8 8l4 4M28 28l4 4M32 8l-4 4M12 28l-4 4" stroke="var(--accent)" stroke-width="3" stroke-linecap="round"/></svg>`,
 brick:`<svg viewBox="0 0 40 40" aria-hidden="true"><rect x="4" y="8" width="32" height="24" rx="3" fill="var(--wall)"/><path d="M4 16h32M4 24h32M14 8v8M26 8v8M20 16v8M10 24v8M30 24v8" stroke="var(--card)" stroke-width="2"/></svg>`,
 drop:`<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4C14 14 9 20 9 26a11 11 0 0 0 22 0c0-6-5-12-11-22z" fill="var(--vac)"/></svg>`,
 yes:`<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="var(--good)"/><path d="M12 21l6 6 11-13" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
 nope:`<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="17" fill="var(--bad)"/><path d="M13 13l14 14M27 13L13 27" stroke="#fff" stroke-width="4" stroke-linecap="round"/></svg>`,
 cell1:`<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="20" r="15" fill="var(--cyto)" stroke="var(--mem)" stroke-width="3"/><circle cx="20" cy="20" r="5" fill="var(--nuc)"/></svg>`,
 tissue:`<svg viewBox="0 0 40 40" aria-hidden="true">${[[10,12],[22,10],[32,16],[12,26],[24,24],[32,30],[18,34]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="6" fill="var(--cyto)" stroke="var(--mem)" stroke-width="2"/>`).join("")}</svg>`,
 heart:`<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 34S5 25 5 14a8 8 0 0 1 15-4 8 8 0 0 1 15 4c0 11-15 20-15 20z" fill="var(--bad)"/></svg>`,
 system:`<svg viewBox="0 0 40 40" aria-hidden="true"><path d="M20 4v32M20 12l-10 8M20 12l10 8M20 22l-8 8M20 22l8 8" stroke="var(--bad)" stroke-width="3" stroke-linecap="round"/></svg>`,
 person:`<svg viewBox="0 0 40 40" aria-hidden="true"><circle cx="20" cy="9" r="6" fill="currentColor"/><path d="M8 38c0-10 5-17 12-17s12 7 12 17" fill="var(--accent)"/></svg>`,
};
const icon = n => !n ? "" : IC[n] || `<span class="v-emo" aria-hidden="true">${E(n)}</span>`;

/* ---------- the cell ---------- */
const PARTS = {
 wall:{role:"the strong wall", name:"Cell wall", icon:"brick", say:"Cell wall. Plants only. A strong wall that holds the plant up."},
 membrane:{role:"security", name:"Cell membrane", icon:"shield", say:"Cell membrane. The security. It decides what goes in and out."},
 vacuole:{role:"the water tank", name:"Vacuole", icon:"drop", say:"Vacuole. A big water tank. Plants have a giant one."},
 nucleus:{role:"the coach", name:"Nucleus", icon:"coach", say:"Nucleus. The coach. It holds the DNA playbook."},
 mito:{role:"the power", name:"Mitochondria", icon:"power", say:"Mitochondria. The power. They make energy."},
 ribo:{role:"the builders", name:"Ribosomes", icon:"hammer", say:"Ribosomes. The builders. They make proteins."},
 chloro:{role:"the sun catcher", name:"Chloroplast", icon:"sun", say:"Chloroplast. Plants only. It catches sunlight to make food."},
};
const ANIMAL = ["membrane","nucleus","mito","ribo"], PLANT = ["wall","membrane","vacuole","nucleus","mito","ribo","chloro"];
function cellSVG(id){ return `<svg class="v-scene" id="${id}" viewBox="0 0 400 290" role="img" aria-label="A cell">
  <g class="v-part off" data-p="wall"><rect x="14" y="10" width="372" height="270" rx="48" fill="none" stroke="var(--wall)" stroke-width="14"/></g>
  <g class="v-part off" data-p="membrane"><path d="M200 26C310 24 368 70 368 146s-52 122-168 122S30 224 32 146 92 28 200 26z" fill="var(--cyto)" stroke="var(--mem)" stroke-width="8"/></g>
  <g class="v-part off" data-p="vacuole"><path d="M70 150c0-40 30-60 60-56s40 30 36 60-24 56-56 54-40-24-40-58z" fill="var(--vac)" opacity=".85"/></g>
  <g class="v-part off" data-p="nucleus"><circle cx="210" cy="140" r="52" fill="var(--nuc)" opacity=".9"/><path d="M182 128c10-14 20 14 30 0s20 14 30 0M182 152c10-14 20 14 30 0s20 14 30 0" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/></g>
  <g class="v-part off" data-p="mito"><g transform="rotate(-20 306 96)"><ellipse cx="306" cy="96" rx="34" ry="17" fill="var(--mito)"/><path d="M280 96c6-10 10 10 16 0s10 10 16 0 10 10 16 0" fill="none" stroke="#fff" stroke-width="3"/></g>
    <g transform="rotate(25 300 206)"><ellipse cx="300" cy="206" rx="30" ry="15" fill="var(--mito)"/><path d="M278 206c6-9 9 9 15 0s9 9 15 0 9 9 15 0" fill="none" stroke="#fff" stroke-width="3"/></g></g>
  <g class="v-part off" data-p="ribo">${[[120,70],[140,58],[160,224],[180,236],[250,226],[270,60],[110,214],[340,150],[86,96],[236,62]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="16" fill="transparent"/><circle cx="${x}" cy="${y}" r="6" fill="var(--ribo)"/>`).join("")}</g>
  <g class="v-part off" data-p="chloro">${[[130,232,-15],[300,150,10],[112,62,20]].map(([x,y,r])=>`<g transform="rotate(${r} ${x} ${y})"><ellipse cx="${x}" cy="${y}" rx="28" ry="14" fill="var(--chl)"/><path d="M${x-14} ${y-6}v12M${x-4} ${y-8}v16M${x+6} ${y-8}v16M${x+16} ${y-6}v12" stroke="#fff" stroke-width="3" opacity=".8"/></g>`).join("")}</g>
</svg>`; }
const cellShow = (s, parts) => s.querySelectorAll(".v-part").forEach(g => g.classList.toggle("off", !parts.includes(g.dataset.p)));
const cellGlow = (s, p) => s.querySelectorAll(".v-part").forEach(g => { g.classList.toggle("glow", g.dataset.p===p); g.classList.toggle("dim", !!p && g.dataset.p!==p && g.dataset.p!=="membrane"); });
function cellTap(s, fn){ s.parentElement.classList.add("v-tappable"); s.addEventListener("click", e => { const g = e.target.closest(".v-part"); if (g && !g.classList.contains("off")) fn(g.dataset.p, g); }); }
const proSVG = () => `<svg viewBox="0 0 200 130" aria-hidden="true"><rect x="20" y="30" width="160" height="70" rx="35" fill="var(--cyto)" stroke="var(--mem)" stroke-width="6"/><path d="M60 60c10-12 20 12 30 0s20 12 30 0 20 12 30 0" fill="none" stroke="var(--nuc)" stroke-width="4"/>${[[50,82],[150,50],[130,84],[70,46]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="var(--ribo)"/>`).join("")}</svg>`;
const euSVG = () => `<svg viewBox="0 0 200 130" aria-hidden="true"><ellipse cx="100" cy="65" rx="84" ry="56" fill="var(--cyto)" stroke="var(--mem)" stroke-width="6"/><circle cx="96" cy="64" r="24" fill="var(--nuc)"/><ellipse cx="150" cy="44" rx="16" ry="8" fill="var(--mito)"/>${[[50,50],[60,90],[140,92]].map(([x,y])=>`<circle cx="${x}" cy="${y}" r="5" fill="var(--ribo)"/>`).join("")}</svg>`;

/* ---------- graphs ---------- */
let gk = 0;
function graphSVG(g, opt){ opt = opt || {}; const R = 6, W = 360, sc = W/(2*R), X = x => (x+R)*sc, Y = y => (R-y)*sc; let s = "";
  for (let i=-R;i<=R;i++) s += `<path class="grid" d="M${X(i)} 0V${W}M0 ${Y(i)}H${W}"/>`;
  s += `<path class="ax" d="M${X(0)} 0V${W}M0 ${Y(0)}H${W}"/>`;
  for (const i of [-4,-2,2,4]) s += `<text x="${X(i)}" y="${Y(0)+16}" text-anchor="middle">${i<0?"−"+(-i):i}</text><text x="${X(0)-7}" y="${Y(i)+5}" text-anchor="end">${i<0?"−"+(-i):i}</text>`;
  const cols = ["var(--accent)","var(--blue)","var(--good)"];
  (g.lines||[]).forEach((L,k) => { const [m,b,tri,c,w] = L; s += `<path d="M${X(-R)} ${Y(m*-R+b)}L${X(R)} ${Y(m*R+b)}" style="stroke:${c||cols[k%3]};stroke-width:${w||5};stroke-linecap:round"/>`;
    if (tri!=null && typeof tri === "number") { const x0 = tri; s += `<path d="M${X(x0)} ${Y(m*x0+b)}H${X(x0+1)}V${Y(m*(x0+1)+b)}" style="fill:none;stroke:var(--blue);stroke-width:4;stroke-dasharray:7 5"/>
      <text x="${X(x0+.5)}" y="${Y(m*x0+b)+(m>=0?20:-10)}" text-anchor="middle" style="fill:var(--blue);font-size:15px">over 1</text>
      <text x="${X(x0+1)+8}" y="${(Y(m*x0+b)+Y(m*(x0+1)+b))/2+5}" style="fill:var(--accent);font-size:15px">${m>=0?"up":"down"} ${Math.abs(m)}</text>`; } });
  if (g.quad){ const [a,b,c] = g.quad; let d = ""; for (let x=-R;x<=R+0.001;x+=0.1){ const y = a*x*x+b*x+c; d += (d?"L":"M")+X(x).toFixed(1)+" "+Y(Math.max(-R-2,Math.min(R+2,y))).toFixed(1); } s += `<path d="${d}" style="fill:none;stroke:var(--accent);stroke-width:5;stroke-linecap:round"/>`; }
  (g.pts||[]).forEach(([x,y]) => { s += `<circle cx="${X(x)}" cy="${Y(y)}" r="9" style="fill:var(--navy);stroke:var(--card);stroke-width:3"/>`; });
  (opt.ydots||[]).forEach(v => { s += `<circle class="v-ydot" data-v="${v}" cx="${X(0)}" cy="${Y(v)}" r="15" style="fill:var(--card);stroke:var(--navy);stroke-width:3"/>`; });
  const id = "gc" + (++gk);
  return `<svg class="v-graph" viewBox="-4 -4 ${W+8} ${W+8}" role="img" aria-label="${E(opt.label||"Graph")}"><defs><clipPath id="${id}"><rect width="${W}" height="${W}"/></clipPath></defs><g clip-path="url(#${id})">${s}</g></svg>`; }
const fmtN = n => n<0 ? "−"+(-n) : String(n);
const eqHTML = (m,b) => `<span class="m">${m===1?"":m===-1?"−":m===0?"0":fmtN(m)}${m===0?"":"x"}</span>${b?` ${b<0?"−":"+"} <span class="b">${Math.abs(b)}</span>`:""}`;
const eqSay = (m,b) => `y equals ${m===0?"0":(m===1?"":m===-1?"negative ":m<0?"negative "+(-m)+" ":m+" ")+"x"}${b?(b<0?" minus ":" plus ")+Math.abs(b):""}`;

/* ---------- other visuals ---------- */
/* ---------- balance: x = orange bags, numbers = blue blocks, minus = red holes ---------- */
function parseSide(str){ let s = String(str).replace(/−/g,"-").replace(/\s+/g,"");
  let m = s.match(/^(\d+)\(x([+-])(\d+)\)$/); if (m) return {x:1, d:1, pos:m[2]==="+"?+m[3]:0, neg:m[2]==="-"?+m[3]:0, grp:+m[1]};
  const out = {x:0, d:1, pos:0, neg:0, grp:0}, terms = s.match(/[+-]?[^+-]+/g); if (!terms) return null;
  for (const t of terms) { if (t.includes("x")) { m = t.match(/^([+-]?)(\d*)x(?:\/(\d+))?$/); if (!m) return null; out.x += (m[1]==="-"?-1:1) * (m[2]?+m[2]:1); if (m[3]) out.d = +m[3]; }
    else if (/^[+-]?\d+$/.test(t)) { const n = +t; if (n >= 0) out.pos += n; else out.neg += -n; } else return null; }
  return out; }
function sideText(sd){ if (!sd) return "";
  if (sd.grp) return `${sd.grp}(x ${sd.neg?"−":"+"} ${sd.neg||sd.pos})`;
  let t = sd.x ? (sd.x===1?"":sd.x===-1?"−":sd.x) + "x" + (sd.d>1?"/"+sd.d:"") : "";
  if (sd.pos) t += t ? ` + ${sd.pos}` : String(sd.pos);
  if (sd.neg) t += t ? ` − ${sd.neg}` : `−${sd.neg}`;
  return t || "0"; }
const alone = sd => sd && sd.x===1 && sd.d===1 && !sd.pos && !sd.neg && !sd.grp;
function itemsHTML(sd){ if (!sd) return "";
  const bag = k => `<span class="bag ${sd.d>1?"frac":""}" data-k="x${k}">${sd.d>1?"x÷"+sd.d:"x"}</span>`;
  const big = sd.pos > 40 || sd.neg > 40 || Math.abs(sd.x) > 10;
  if (big) return `<div class="v-badge">${E(sideText(sd))}</div>`;
  const unit = (n, cls, off) => Array.from({length:n}, (_,i) => `<span class="${cls}" data-k="${cls}${off+i}"></span>`).join("");
  if (sd.grp) return `<div class="grps">${Array.from({length:sd.grp}, (_,g) => `<span class="grp">${bag(g)}<span class="blks">${unit(sd.pos,"blk",g*sd.pos)}${unit(sd.neg,"hole",g*sd.neg)}</span></span>`).join("")}</div>`;
  return `<div class="bags">${Array.from({length:Math.max(0,sd.x)}, (_,i) => bag(i)).join("")}</div><div class="blks">${unit(sd.pos,"blk",0)}${unit(sd.neg,"hole",0)}</div>`; }
function balHTML(L, R, opt){ opt = opt || {}; const pL = typeof L === "string" ? parseSide(L) : L, pR = typeof R === "string" ? parseSide(R) : R;
  return `<div class="v-balx ${opt.win?"win":""}" style="--t:0deg;--dy:0px" role="img" aria-label="${E(sideText(pL)||L)} equals ${E(sideText(pR)||R)}">
    <div class="beam"></div><div class="pivot"></div><div class="post"></div><div class="base"></div>
    <div class="pans"><div class="pan l">${pL?itemsHTML(pL):`<b>${E(L)}</b>`}</div><div class="eqc">=</div><div class="pan r">${pR?itemsHTML(pR):`<b>${E(R)}</b>`}</div></div>
    <div class="lbls"><span class="lbl l">${E(pL?sideText(pL):L)}</span><span class="act">${opt.act?E(opt.act):""}</span><span class="lbl r">${E(pR?sideText(pR):R)}</span></div></div>`; }
function parseMove(c){ let m;
  if ((m = c.match(/^Subtract (\d*)(x?)$/))) return {op:"-", k:+(m[1]||1), x:!!m[2], sym:"− "+(m[1]||"")+(m[2]||"")};
  if ((m = c.match(/^Add (\d*)(x?)$/))) return {op:"+", k:+(m[1]||1), x:!!m[2], sym:"+ "+(m[1]||"")+(m[2]||"")};
  if ((m = c.match(/^Divide by (\d+)$/))) return {op:"/", k:+m[1], sym:"÷ "+m[1]};
  if ((m = c.match(/^Multiply by (\d+)$/))) return {op:"*", k:+m[1], sym:"× "+m[1]};
  if (/^Distribute/.test(c)) return {op:"dist", sym:"distribute"};
  return null; }
function applyMove(sd, mv){ if (!sd || !mv) return null; const o = Object.assign({}, sd);
  if (mv.op === "dist") { if (!o.grp) return o; o.x = o.grp; o.pos *= o.grp; o.neg *= o.grp; o.grp = 0; return o; }
  if (o.grp) { if (mv.op === "/" && mv.k === o.grp) { o.grp = 0; return o; } return null; }
  if (mv.op === "-" && mv.x) { o.x -= mv.k; return o; }
  if (mv.op === "+" && mv.x) { o.x += mv.k; return o; }
  if (mv.op === "-") { const c = Math.min(o.pos, mv.k); o.pos -= c; o.neg += mv.k - c; return o; }
  if (mv.op === "+") { const c = Math.min(o.neg, mv.k); o.neg -= c; o.pos += mv.k - c; return o; }
  if (mv.op === "/") { if (o.d > 1 || o.x % mv.k || o.pos % mv.k || o.neg % mv.k) return null; o.x /= mv.k; o.pos /= mv.k; o.neg /= mv.k; return o; }
  if (mv.op === "*") { if (o.d === mv.k) { o.d = 1; } else o.x *= mv.k; o.pos *= mv.k; o.neg *= mv.k; return o; }
  return null; }
const calm = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = ms => sleep(calm() ? Math.min(ms, 120) : ms);
function tilt(host, dir){ const b = host.querySelector(".v-balx"); if (!b) return; b.style.setProperty("--t", (dir*7)+"deg"); b.style.setProperty("--dy", (dir*14)+"px");
  const eq = b.querySelector(".eqc"); eq.textContent = dir ? "≠" : "="; eq.classList.toggle("off", !!dir); }
/* play one move on one pan: things lift off (or drop in) */
async function panStep(pan, sd, mv){
  const add = (cls, n) => { const box = pan.querySelector(".blks") || pan.appendChild(Object.assign(document.createElement("div"), {className:"blks"}));
    for (let i=0;i<n;i++) { const e = document.createElement("span"); e.className = cls + " v-enter"; box.appendChild(e); } };
  if (mv.x) { const bags = [...pan.querySelectorAll(".bag")];
    if (mv.op === "-") bags.slice(-mv.k).forEach(b => b.classList.add("v-leave"));
    else { const box = pan.querySelector(".bags"); for (let i=0;i<mv.k;i++) { const e = document.createElement("span"); e.className = "bag v-enter"; e.textContent = "x"; box && box.appendChild(e); } } }
  else if (mv.op === "-") { const blks = [...pan.querySelectorAll(".blk")], take = Math.min(blks.length, mv.k); blks.slice(-take || blks.length).slice(0, take).forEach(b => b.classList.add("v-leave")); if (mv.k > take) add("hole", mv.k - take); }
  else if (mv.op === "+") { const holes = [...pan.querySelectorAll(".hole")], take = Math.min(holes.length, mv.k); holes.slice(0, take).forEach(h => h.classList.add("v-cancel")); if (mv.k > take) add("blk", mv.k - take); }
  await wait(750); }
/* divide: split both pans into equal colored groups, keep one */
async function splitStep(host, k){ host.querySelectorAll(".pan").forEach(pan => {
    pan.querySelectorAll(".bag").forEach((b,i) => b.classList.add("g"+(i%k)));
    pan.querySelectorAll(".blk,.hole").forEach((b,i) => b.classList.add("g"+(i%k))); });
  await wait(1100);
  host.querySelectorAll(".pan").forEach(pan => pan.querySelectorAll(".bag,.blk,.hole").forEach(b => { if (![...b.classList].includes("g0")) b.classList.add("v-leave"); }));
  await wait(800); }
async function growStep(host, k){ host.querySelectorAll(".pan").forEach(pan => { const html = pan.innerHTML; for (let i=1;i<k && i<6;i++) pan.insertAdjacentHTML("beforeend", `<div class="v-copy v-enter">${html}</div>`); }); await wait(900); }
async function distStep(host){ host.querySelectorAll(".grp").forEach(g => g.classList.add("open")); await wait(900); }
const MV_SAY = mv => mv.op==="dist" ? "Distribute. Everything inside the group gets multiplied." : mv.op==="/" ? `Divide by ${mv.k}, on both sides. Split into ${mv.k} equal groups, and keep one.` : mv.op==="*" ? `Multiply by ${mv.k}, on both sides.` : null;
/* the whole move, with the voice explaining each beat */
async function animateMove(host, L, R, mv, label){
  const pans = host.querySelectorAll(".pan"), my = tok;
  if (mv.op === "/" || mv.op === "*" || mv.op === "dist") {
    const said = sayRaw(MV_SAY(mv)); if (mv.op === "/") await splitStep(host, mv.k); else if (mv.op === "*") await growStep(host, mv.k); else await distStep(host); await said; return my === tok; }
  const dir = mv.op === "-" ? 1 : -1;
  const s1 = sayLabel(`Left side: ${label.toLowerCase()}.`); await panStep(pans[0], L, mv); tilt(host, dir); await s1; await wait(300); if (my !== tok) return false;
  const s2 = sayRaw("Now the right side too. Balanced again."); await panStep(pans[1], R, mv); tilt(host, 0); await s2; return my === tok; }
function renderPans(host, L, R, act, win){ const st = host.querySelector(".v-stage"); st.innerHTML = balHTML(L, R, {act, win}); }

function nlSVG(v, op){ const X = n => 30 + (n+6)*28.3; let s = `<path d="M20 50H380" style="stroke:var(--ink);stroke-width:3"/>`;
  for (let n=-6;n<=6;n++) s += `<path d="M${X(n)} 42v16" style="stroke:var(--ink);stroke-width:2"/>${n%2===0?`<text x="${X(n)}" y="80" text-anchor="middle">${fmtN(n)}</text>`:""}`;
  const right = op === ">" || op === "≥", closed = op === "≥" || op === "≤";
  s += `<path d="M${X(v)} 50H${right?378:22}" style="stroke:var(--accent);stroke-width:8;stroke-linecap:round"/>`;
  s += `<path d="${right?"M368 40l14 10-14 10":"M32 40l-14 10 14 10"}" style="fill:var(--accent)"/>`;
  s += `<circle cx="${X(v)}" cy="50" r="10" style="fill:${closed?"var(--accent)":"var(--card)"};stroke:var(--accent);stroke-width:4"/>`;
  return `<svg class="v-nl" viewBox="0 0 400 96" role="img" aria-label="x ${op} ${v}">${s}</svg>`; }
function punHTML(a, b, fill, opt){ opt = opt || {};
  const cell = (x,y) => [x,y].sort((m,n)=>(m===m.toUpperCase()?0:1)-(n===n.toUpperCase()?0:1)).join("");
  const td = (x,y,k) => { const p = cell(x,y); if (opt.ask) return `<td data-k="${k}" class="${opt.marks&&opt.marks[k]||""}"><button aria-label="Box ${k+1}">${opt.vals&&opt.vals[k]?E(opt.vals[k]):"?"}</button></td>`;
    return `<td class="${fill?(p===p.toLowerCase()?"rec":"dom"):""}">${fill?p:""}</td>`; };
  return `<table class="v-pun" aria-label="Punnett square ${E(a)} by ${E(b)}"><tr><th></th><th>${a[0]}</th><th>${a[1]}</th></tr>
    <tr><th>${b[0]}</th>${td(a[0],b[0],0)}${td(a[1],b[0],1)}</tr><tr><th>${b[1]}</th>${td(a[0],b[1],2)}${td(a[1],b[1],3)}</tr></table>`; }
const PAIR = {A:"T",T:"A",G:"C",C:"G"};
function dnaHTML(str, hi, mut){ return `<div class="v-dna">${[...str].map((c,i)=>`<div class="r ${hi&&(c===hi||c===PAIR[hi])?"hi":""} ${mut===i?"mut":""}"><span class="b b${mut===i?"A":c}">${mut===i?(c==="A"?"G":"A"):c}</span><span class="bar"></span><span class="b b${PAIR[c]}">${PAIR[c]}</span></div>`).join("")}</div>`; }
function machHTML(m){ return `<div class="v-mach"><span class="io">${m.in!=null?E(m.in):"?"}</span><span class="ar">➜</span><span class="box"><small>RULE</small>${E(m.rule)}</span><span class="ar">➜</span><span class="io out">${m.out!=null?E(m.out):"?"}</span></div>`; }
function mothSVG(dark){ return `<svg viewBox="0 0 60 40" aria-hidden="true"><path d="M30 20C20 4 4 6 6 18s14 14 24 4c10 10 22 8 24-4S40 4 30 20z" fill="${dark?"#2b2622":"#e8e0d0"}" stroke="#7a6a5a" stroke-width="2"/><path d="M30 12v18" stroke="#5a4a3a" stroke-width="3"/></svg>`; }
function mothsSVG(m){ const pos = [[60,40],[150,30],[240,50],[330,36],[90,120],[190,110],[290,128],[360,100],[40,180],[140,190],[250,176],[340,184]];
  const list = [...Array(m.l).fill(0), ...Array(m.d).fill(1)]; let s = `<rect width="400" height="220" rx="14" fill="var(--bark-${m.bark==="dark"?"d":"l"})"/>`;
  s += `<path d="M120 0c-10 60 10 120-6 220M280 0c14 70-8 140 8 220" stroke="${m.bark==="dark"?"#4a433c":"#bfb39f"}" stroke-width="6" fill="none"/>`;
  list.forEach((d,i) => { const [x,y] = pos[i % pos.length]; s += `<g transform="translate(${x-30} ${y-20})">${mothSVG(d).replace(/<\/?svg[^>]*>/g,"")}</g>`; });
  if (m.bird) s += `<text x="360" y="210" font-size="44">🐦</text>`;
  return `<svg class="v-moths" viewBox="0 0 400 220" role="img" aria-label="${m.l} light moths and ${m.d} dark moths on a ${m.bark} tree">${s}</svg>`; }
function tlHTML(tl, hi, opt){ opt = opt || {}; const H = Array.isArray(hi) ? hi : hi==null ? [] : [hi];
  return `<div class="v-tl">${tl.map(([y,l,e],k)=>`<button data-k="${k}" class="${H.includes(k)?"hi":""} ${H.length&&!H.includes(k)&&!opt.ask?"dimmed":""}" ${opt.ask?"":"tabindex=\"-1\""}><b>${E(y)}</b>${icon(e)}<span>${opt.ask?"":E(l)}</span></button>`).join("")}</div>`; }
function visHTML(v, LV){ if (!v) return "";
  if (v.e) return `<div class="v-erow ${v.e.length>4?"many":""}">${v.e.map((x,i)=>`<span class="v-emo v-pop" style="animation-delay:${i*0.25}s" aria-hidden="true">${E(x)}</span>`).join("")}</div>`;
  if (v.big) return `<div class="v-bigtxt">${v.big.map((x,i)=>`<div class="v-pop" style="animation-delay:${i*0.4}s">${E(x)}</div>`).join("")}</div>`;
  if (v.g) return graphSVG(v.g) + (v.eq ? `<div class="v-eq">y = ${eqHTML(v.eq[0], v.eq[1])}</div>` : "");
  if (v.bal) return balHTML(v.bal[0], v.bal[1], {act:v.act, win:v.win});
  if (v.tl != null) return tlHTML(LV.tl, v.tl);
  if (v.pun) return punHTML(v.pun[0], v.pun[1], v.fill);
  if (v.chain) return `<div class="v-chain">${v.chain.map(([e,l],k)=>`${k?`<span class="ar" aria-hidden="true">→</span>`:""}<span class="n ${k===v.hi?"hi":""} v-pop" style="animation-delay:${k*0.3}s">${icon(e)}<span>${E(l)}</span></span>`).join("")}</div>`;
  if (v.dna) return dnaHTML(v.dna, v.hi, v.mut);
  if (v.pyr) return `<div class="v-pyr">${v.pyr.map(([e,l],k)=>`<div style="width:${36+k*30}%">${icon(e)}<span>${E(l)}</span></div>`).join("")}</div>`;
  if (v.nl) return nlSVG(v.nl.v, v.nl.op);
  if (v.mach) return machHTML(v.mach);
  if (v.acr) return `<div class="v-acr ${v.hi===-1?"all":""}">${v.acr.map((w,k)=>`<div class="${k===v.hi?"hi":""}"><b>${w[0]}</b>${E(w)}</div>`).join("")}</div>`;
  if (v.moths) return mothsSVG(v.moths);
  return ""; }
/* pictures for "pick" answers: "@eu", "@pro", "@mothd", "@mothl", "@nl:v:op", "@g:m:b", "@g2:m1:b1:m2:b2", "@q:a:c" or an emoji */
function picHTML(p){ if (!p || p[0] !== "@") return icon(p); const [k,...a] = p.slice(1).split(":");
  if (k==="eu") return euSVG(); if (k==="pro") return proSVG(); if (k==="mothd") return mothSVG(true); if (k==="mothl") return mothSVG(false);
  if (k==="nl") return nlSVG(+a[0], a[1]); if (k==="g") return graphSVG({lines:[[+a[0],+a[1]]]}); if (k==="g2") return graphSVG({lines:[[+a[0],+a[1]],[+a[2],+a[3]]]});
  if (k==="q") return graphSVG({quad:[+a[0],0,+a[1]]}); return ""; }

/* =====================================================================
   FLOW
   ===================================================================== */
const STAGES = [["▶","Watch"],["👆","Explore"],["🧩","Words"],["🎤","Beat"],["🏀","Play"]];
let LV = null, stage = 0, doneSt = new Set(), tok = 0, P = null, lastMiss = [];
function frame(inner, nextLabel){
  tok++; hush(); beatStop();
  go(`<div class="v2" style="display:flex;flex-direction:column;gap:18px"><section class="card"><div class="row between"><button class="btn" id="vMap">← Map</button><span class="small muted" style="font-weight:700">${unit.boss?"Final":"Level "+(unitI+1)} · ${E(unit.name)}</span></div>
    ${unit.boss?"":`<nav class="v-track" aria-label="Steps">${STAGES.map(([ic,nm],i)=>`<button data-i="${i}" class="${i===stage?"on":""} ${doneSt.has(i)&&i!==stage?"done":""}" ${i===stage?'aria-current="step"':""}><i>${doneSt.has(i)&&i!==stage?"✓":ic}</i>${nm}</button>`).join("")}</nav>`}</section>
    <section class="card" id="vCard">${inner}</section>
    ${nextLabel?`<div class="row" style="justify-content:flex-end"><button class="btn go v-big" id="vNext">${nextLabel} →</button></div>`:""}</div>`);
  $("vMap").onclick = home; document.querySelectorAll(".v-track button").forEach(b => b.onclick = () => openStage(+b.dataset.i));
  if ($("vNext")) $("vNext").onclick = () => { doneSt.add(stage); openStage(stage+1); };
}
function open(i, st){ unitI = i; unit = UNITS[i]; LV = unit.v2; doneSt = new Set(); S.seen[unit.id] = true; save(); openStage(st||0); }
function openStage(i){ stage = i; [watch, explore, words, beat, play][i](); }

/* 1. Watch */
function watch(){
  frame(`<div class="v-stage" id="vStage"></div><div class="v-cap" id="vCap" aria-live="polite">Tap Play. I'll walk you through it.</div>
    <div class="row v-center"><button class="btn go v-big" id="wPlay">▶ Play</button><button class="btn" id="wBack">⏮ Back</button><button class="btn" id="wAgain">🔁 Again</button></div>
    <div class="v-dots" id="wDots">${LV.watch.map(()=>"<i></i>").join("")}</div>`, "Explore");
  const my = tok; let i = 0, playing = false;
  const show = k => { const [, cap, v] = LV.watch[k]; $("vCap").innerHTML = capHTML(cap);
    const st = $("vStage"), cur = st.querySelector("#wcell");
    if (v.cell) { if (!cur) { st.innerHTML = cellSVG("wcell"); requestAnimationFrame(() => { const s = $("wcell"); if (s) { cellShow(s, v.cell); cellGlow(s, v.glow||null); } }); } else { cellShow(cur, v.cell); cellGlow(cur, v.glow||null); } }
    else st.innerHTML = visHTML(v, LV);
    document.querySelectorAll("#wDots i").forEach((d,j) => d.className = j<k?"ok":j===k?"now":""); };
  show(0);
  const run = async () => { playing = true; $("wPlay").textContent = "⏸ Pause";
    while (playing && i < LV.watch.length && my === tok) { show(i); const ok = await sayRaw(LV.watch[i][0]); if (!ok || !playing || my !== tok) return; await sleep(Math.round(1300 / (S.rate||0.8))); if (my !== tok) return; i++; }
    if (my === tok && i >= LV.watch.length) { playing = false; i = 0; doneSt.add(0); $("wPlay").textContent = "▶ Watch again"; } };
  $("wPlay").onclick = () => { if (playing) { playing = false; hush(); $("wPlay").textContent = "▶ Play"; } else run(); };
  $("wAgain").onclick = () => { playing = false; hush(); $("wPlay").textContent = "▶ Play"; show(i); sayRaw(LV.watch[i][0]); };
  $("wBack").onclick = () => { playing = false; hush(); $("wPlay").textContent = "▶ Play"; i = Math.max(0, i-1); show(i); sayRaw(LV.watch[i][0]); };
  setTimeout(() => { if (my === tok && !playing) run(); }, 600);
}

/* 2. Explore */
function explore(){ const ex = LV.explore || {type:"cards"};
  const T = {cell:exCell, slope:exSlope, quad:exQuad, sys:exSys, nl:exNl, mach:exMach, pow:exPow, balance:exBalance, dna:exDna, pun:exPun, moths:exMoths, tl:exTl, cards:exCards}[ex.type] || exCards;
  T(ex);
}
function exFrame(prompt, inner, intro){ frame(`<p class="v-prompt">${prompt}</p>${inner}`, "Word power"); sayRaw(intro || plain(prompt)); }
function exCell(){
  exFrame("Tap any part. I'll tell you what it is.", `<div class="row"><button class="btn" id="eA">Animal cell</button><button class="btn" id="eP">Plant cell</button></div><div class="v-stage" id="eStage">${cellSVG("ecell")}</div><p class="small muted" id="eCount">0 of 7 parts found</p>`,
    "Tap any part of the cell. I'll tell you what it is. Switch between animal and plant cells.");
  const s = $("ecell"), found = new Set(); requestAnimationFrame(() => cellShow(s, PLANT));
  const set = p => { cellShow(s, p); cellGlow(s, null); $("eStage").querySelector(".v-bubble")?.remove(); };
  $("eA").onclick = () => { set(ANIMAL); sayRaw("Animal cell. No wall, no chloroplasts, and small vacuoles."); };
  $("eP").onclick = () => { set(PLANT); sayRaw("Plant cell. It has a wall, chloroplasts, and a big vacuole."); };
  cellTap(s, p => { const X = PARTS[p]; found.add(p); cellGlow(s, p); tick(); $("eStage").querySelector(".v-bubble")?.remove();
    $("eStage").insertAdjacentHTML("beforeend", `<div class="v-bubble">${icon(X.icon)}${E(X.name)}</div>`); sayRaw(X.say); $("eCount").textContent = `${found.size} of 7 parts found`; });
}
function knob(cls, label, val, minus, plus){ return `<div class="v-knob ${cls}"><b>${label}</b><span class="v">${val}</span><div class="row"><button class="btn" data-a="${minus}" aria-label="Less">−</button><button class="btn" data-a="${plus}" aria-label="More">+</button></div></div>`; }
function exSlope(){ let m = 1, b = 0;
  exFrame("Change <span style='color:var(--accent)'>m</span> and <span style='color:var(--blue)'>b</span>. Watch the line move.", `<div class="v-stage" id="eG"></div><div class="v-eq" id="eEq"></div><div class="v-knobs" id="eK"></div>`, "Use the plus and minus buttons. Change m and b, and watch the line move.");
  const draw = talk => { $("eG").innerHTML = graphSVG({lines:[[m,b,m?0:null]], pts:[[0,b]]}, {label:eqSay(m,b)}); $("eEq").innerHTML = "y = " + eqHTML(m,b);
    $("eK").innerHTML = knob("m","m = slope",fmtN(m),"m-","m+") + knob("b","b = start",fmtN(b),"b-","b+");
    $("eK").querySelectorAll("[data-a]").forEach(x => x.onclick = () => { const a = x.dataset.a; if (a[0]==="m") m = Math.max(-4,Math.min(4, m + (a[1]==="+"?1:-1))); else b = Math.max(-5,Math.min(5, b + (a[1]==="+"?1:-1))); tick(); draw(1); });
    if (talk) sayRaw(`${eqSay(m,b)}. ${m>0?"Up "+m+" for every 1 over.":m<0?"Down "+(-m)+" for every 1 over.":"Flat. Slope zero."} Starts at ${b<0?"negative "+(-b):b}.`); };
  draw(0); }
function exQuad(){ const AS = [-2,-1,-0.5,0.5,1,2]; let ai = 4, c = -4;
  exFrame("Change the shape. Watch the parabola.", `<div class="v-stage" id="eG"></div><div class="v-eq" id="eEq"></div><div class="v-knobs" id="eK"></div>`, "Change the number in front of x squared, and the starting point. Watch what the parabola does.");
  const draw = talk => { const a = AS[ai]; $("eG").innerHTML = graphSVG({quad:[a,0,c], pts:[[0,c]]}); $("eEq").innerHTML = `y = <span class="m">${a===1?"":a===-1?"−":fmtN(a)}x²</span>${c?` ${c<0?"−":"+"} <span class="b">${Math.abs(c)}</span>`:""}`;
    $("eK").innerHTML = knob("m","x² number",fmtN(a),"a-","a+") + knob("b","vertex height",fmtN(c),"c-","c+");
    $("eK").querySelectorAll("[data-a]").forEach(x => x.onclick = () => { const k = x.dataset.a; if (k[0]==="a") ai = Math.max(0,Math.min(AS.length-1, ai + (k[1]==="+"?1:-1))); else c = Math.max(-5,Math.min(5, c + (k[1]==="+"?1:-1))); tick(); draw(1); });
    if (talk) sayRaw(`${a<0?"Negative, so it opens down, like a frown.":"Positive, so it opens up, like a smile."} ${Math.abs(a)>1?"Skinny.":Math.abs(a)<1?"Wide.":""} The vertex is at ${c<0?"negative "+(-c):c}.`); };
  draw(0); }
function exSys(){ let m = -1, b = 4;
  exFrame("Move the <span style='color:var(--blue)'>blue</span> line. Where do they cross?", `<div class="v-stage" id="eG"></div><div class="v-cap" id="eX"></div><div class="v-knobs" id="eK"></div>`, "The orange line stays still. Move the blue line, and see where the two lines cross.");
  const draw = talk => { let msg; if (m === 1) msg = b === 1 ? "Same line. Every point works." : "Parallel. They never cross. No solution.";
    else { const x = (b - 1) / (1 - m), y = x + 1; msg = Number.isInteger(x) && Number.isInteger(y) ? `They cross at (${fmtN(x)}, ${fmtN(y)}).` : "They cross between grid lines."; }
    const X = m!==1 ? (b-1)/(1-m) : null; $("eG").innerHTML = graphSVG({lines:[[1,1],[m,b]], pts: X!=null && Number.isInteger(X) ? [[X, X+1]] : []});
    $("eX").textContent = msg; $("eK").innerHTML = knob("m","blue slope",fmtN(m),"m-","m+") + knob("b","blue start",fmtN(b),"b-","b+");
    $("eK").querySelectorAll("[data-a]").forEach(x => x.onclick = () => { const a = x.dataset.a; if (a[0]==="m") m = Math.max(-3,Math.min(3, m + (a[1]==="+"?1:-1))); else b = Math.max(-5,Math.min(5, b + (a[1]==="+"?1:-1))); tick(); draw(1); });
    if (talk) sayLabel(msg.replace(/[()]/g,"")); };
  draw(0); }
function exNl(){ let v = 2, op = ">"; const OPS = [">","≥","<","≤"], SAY = {">":"is greater than","≥":"is greater than or equal to","<":"is less than","≤":"is less than or equal to"};
  exFrame("Pick a sign and a number. See the answers.", `<div class="v-bigtxt"><div id="eT"></div></div><div class="v-stage" id="eN"></div><div class="row v-center" id="eOps">${OPS.map(o=>`<button class="btn v-big" data-o="${o}">${o}</button>`).join("")}</div>${knob("b","number",`<span id="eV"></span>`,"v-","v+")}`, "Pick a sign and a number. I'll show you all the answers on the number line.");
  const draw = talk => { $("eT").textContent = `x ${op} ${fmtN(v)}`; $("eN").innerHTML = nlSVG(v, op); $("eV").textContent = fmtN(v);
    if (talk) sayRaw(`x ${SAY[op]} ${v<0?"negative "+(-v):v}. ${op==="≥"||op==="≤"?"Closed circle. It counts.":"Open circle. It doesn't count."} The arrow goes ${op===">"||op==="≥"?"right":"left"}.`); };
  document.querySelectorAll("#eOps button").forEach(b => b.onclick = () => { op = b.dataset.o; tick(); draw(1); });
  document.querySelectorAll("[data-a^=v]").forEach(x => x.onclick = () => { v = Math.max(-5,Math.min(5, v + (x.dataset.a[1]==="+"?1:-1))); tick(); draw(1); });
  draw(0); }
function exMach(){ const RULES = [["2x + 1", x=>2*x+1, "times 2, plus 1"], ["x²", x=>x*x, "times itself"], ["3x − 2", x=>3*x-2, "times 3, minus 2"]]; let r = 0;
  exFrame("Pick a rule. Drop a number in.", `<div class="row v-center" id="eR">${RULES.map((R,k)=>`<button class="btn" data-r="${k}">${E(R[0])}</button>`).join("")}</div><div class="v-stage" id="eM"></div><div class="row v-center" id="eIn">${[0,1,2,3,4,5].map(n=>`<button class="btn v-big" data-n="${n}">${n}</button>`).join("")}</div>`, "Pick a rule. Then tap a number to drop it in the machine.");
  const draw = (n, out) => { if (!$("eM")) return; $("eM").innerHTML = machHTML({rule:RULES[r][0], in:n, out}); document.querySelectorAll("#eR button").forEach((b,k)=>b.classList.toggle("go", k===r)); };
  document.querySelectorAll("#eR button").forEach(b => b.onclick = () => { r = +b.dataset.r; draw(); sayRaw(`Rule: ${RULES[r][2]}.`); });
  document.querySelectorAll("#eIn button").forEach(b => b.onclick = async () => { const n = +b.dataset.n, o = RULES[r][1](n); draw(n); tick(); await sleep(500); if (!$("eM")) return; draw(n, o); sayRaw(`${n} goes in. ${RULES[r][2]}. ${o} comes out.`); });
  draw(); }
function exPow(){ let base = 2, n = 1;
  exFrame("Multiply again and again.", `<div class="row v-center" id="eB">${[2,3,5].map(x=>`<button class="btn" data-b="${x}">Base ${x}</button>`).join("")}</div><div class="v-bigtxt" id="eP"></div><div class="row v-center"><button class="btn go v-big" id="eMore">× ${base} again</button><button class="btn" id="eReset">Start over</button></div>`, "Pick a base. Then tap times again, and watch the number grow.");
  const draw = talk => { const val = Math.pow(base, n); $("eP").innerHTML = `<div>${base}<sup>${n}</sup></div><div style="font-size:24px">${Array(n).fill(base).join(" × ")}</div><div>= ${val.toLocaleString()}</div>`; $("eMore").textContent = `× ${base} again`;
    if (talk) sayRaw(`${base} to the ${n===1?"first":n===2?"second":n===3?"third":n+"th"} power. ${Array(n).fill(base).join(" times ")}. That's ${val}.`); };
  document.querySelectorAll("#eB button").forEach(b => b.onclick = () => { base = +b.dataset.b; n = 1; tick(); draw(1); });
  $("eMore").onclick = () => { if (n < 6) n++; tick(); draw(1); }; $("eReset").onclick = () => { n = 1; draw(1); };
  draw(0); }
function exBalance(ex){ let k = 0;
  exFrame("Pick the move that gets x alone.", `<div id="eBal"></div>`, "Pick the move that gets x alone. Same move on both sides.");
  const run = () => { const pz = ex.puzzles[k % ex.puzzles.length]; balGame($("eBal"), pz.start, pz.steps, pz.choices, () => { setTimeout(() => { if (!$("eBal") || $("eNextP")) return; k++; $("eBal").insertAdjacentHTML("beforeend", `<div class="row v-center"><button class="btn go" id="eNextP">Next puzzle →</button></div>`); $("eNextP").onclick = run; }, 300); }, true); };
  run(); }
function balGame(host, start, steps, choices, onEnd, practice){
  let L = parseSide(start[0]), R = parseSide(start[1]), s = 0, wrong = 0, busy = false;
  host.innerHTML = `<div class="v-stage v-balstage">${balHTML(L, R)}</div><div class="v-moves">${choices.map(c=>`<button data-c="${E(c)}">${E(c)}</button>`).join("")}</div><p class="small muted v-center" style="text-align:center;margin:0">Pick a move. Watch what happens to both sides.</p>`;
  const btns = [...host.querySelectorAll(".v-moves button")], lock = on => btns.forEach(b => b.disabled = on);
  btns.forEach(b => b.onclick = async () => { if (busy || s >= steps.length) return; busy = true; lock(true);
    const c = b.dataset.c, mv = parseMove(c), right = c === steps[s][0], nL = applyMove(L, mv), nR = applyMove(R, mv), my = tok;
    b.classList.add("picked"); tick();
    if (!nL || !nR) { // e.g. dividing something that doesn't split evenly
      host.querySelector(".v-balx").classList.add("v-wobble"); await sayRaw(`${c} doesn't split evenly here. x is still stuck. Try another move.`); if (my !== tok) return;
      host.querySelector(".v-balx")?.classList.remove("v-wobble"); wrong++; b.classList.remove("picked"); b.classList.add("nope"); busy = false; lock(false); return; }
    const ok = await animateMove(host, L, R, mv, c); if (!ok || my !== tok) return;
    renderPans(host, nL, nR, mv.sym); await wait(250);
    if (right) { L = nL; R = nR; s++; b.classList.remove("picked");
      const done = s >= steps.length;
      if (done) { renderPans(host, L, R, mv.sym, true); SFX.win(); await sayLabel(`${sideText(L)} = ${sideText(R)}.`); await sayRaw("x is all alone. Solved!"); if (my !== tok) return; onEnd(wrong === 0); return; }
      await sayLabel(`${sideText(L)} = ${sideText(R)}.`); }
    else { wrong++; SFX.no(); await sayRaw("Still balanced, but x isn't alone yet. Let's undo that move."); if (my !== tok) return;
      host.querySelector(".v-balx").classList.add("v-rewind"); await wait(500); renderPans(host, L, R); b.classList.remove("picked"); b.classList.add("nope"); }
    busy = false; lock(false); });
}
function exDna(){ const S0 = "ATGCGTAC"; let shown = new Set();
  exFrame("Tap a letter. See its partner.", `<div class="v-stage"><div class="v-dna" id="eD"></div></div><p class="small muted">Apple in the Tree: A–T. Car in the Garage: C–G.</p>`, "Tap a letter on the left side. I'll show you its partner.");
  const draw = () => { $("eD").innerHTML = [...S0].map((c,i)=>`<div class="r"><button class="b b${c}" data-i="${i}" style="border:0;font:inherit;font-weight:800;font-size:26px;cursor:pointer">${c}</button><span class="bar"></span><span class="b ${shown.has(i)?"b"+PAIR[c]:"bq"}">${shown.has(i)?PAIR[c]:"?"}</span></div>`).join("");
    $("eD").querySelectorAll("button").forEach(b => b.onclick = () => { const i = +b.dataset.i, c = S0[i]; shown.add(i); tick(); draw(); sayRaw(`${c} pairs with ${PAIR[c]}. ${c==="A"||c==="T"?"Apple in the Tree.":"Car in the Garage."}`); }); };
  draw(); }
function exPun(){ const G = ["BB","Bb","bb"]; let a = 1, b = 1;
  exFrame("Pick the parents. Watch the kids.", `<div class="v-knobs"><div class="v-knob m"><b>Parent 1</b><div class="row" id="eA">${G.map((g,k)=>`<button class="btn" data-k="${k}">${g}</button>`).join("")}</div></div><div class="v-knob b"><b>Parent 2</b><div class="row" id="eB">${G.map((g,k)=>`<button class="btn" data-k="${k}">${g}</button>`).join("")}</div></div></div><div class="v-stage" id="eS"></div><div class="v-cap" id="eR"></div>`, "Pick each parent's letters. The Punnett square fills in, and I'll tell you how many kids show each trait.");
  const say2 = g => g.split("").map(c => (c===c.toUpperCase()?"big ":"small ")+c.toUpperCase()).join(", ");
  const draw = talk => { const A = G[a], B = G[b]; $("eS").innerHTML = punHTML(A, B, 1); let dom = 0; for (const x of A) for (const y of B) if (x==="B"||y==="B") dom++;
    $("eR").innerHTML = `<span class='k'>${dom} of 4</span> dominant · <span class='k'>${4-dom} of 4</span> recessive`;
    document.querySelectorAll("#eA button").forEach((x,k)=>x.classList.toggle("go",k===a)); document.querySelectorAll("#eB button").forEach((x,k)=>x.classList.toggle("go",k===b));
    if (talk) sayRaw(`${say2(A)}, times ${say2(B)}. ${dom} out of 4 kids show the dominant trait. ${4-dom} out of 4 show the recessive trait.`); };
  document.querySelectorAll("#eA button").forEach(x => x.onclick = () => { a = +x.dataset.k; tick(); draw(1); });
  document.querySelectorAll("#eB button").forEach(x => x.onclick = () => { b = +x.dataset.k; tick(); draw(1); });
  draw(0); }
function exMoths(){ let m = {bark:"light", l:6, d:2};
  exFrame("Run the experiment.", `<div class="v-stage" id="eM"></div><div class="v-cap" id="eC"></div><div class="row v-center"><button class="btn" id="eBark">🌳 Change the tree</button><button class="btn" id="eBird">🐦 Birds hunt</button><button class="btn go" id="eGen">👶 Next generation</button></div>`, "Run the experiment. Change the tree color, let the birds hunt, then make the next generation.");
  const draw = () => { $("eM").innerHTML = mothsSVG(m); $("eC").textContent = `${m.l} light · ${m.d} dark on a ${m.bark} tree`; };
  $("eBark").onclick = () => { m.bark = m.bark==="light"?"dark":"light"; tick(); draw(); sayRaw(`Now the tree is ${m.bark}. Which moths stand out?`); };
  $("eBird").onclick = () => { const k = m.bark==="dark" ? "l" : "d"; const ate = Math.min(2, m[k]); m[k] -= ate; draw(); sayRaw(ate ? `The birds ate ${ate} ${k==="l"?"light":"dark"} moths. They stood out on the ${m.bark} tree.` : "The birds can't find any moths that stand out."); };
  $("eGen").onclick = () => { const t = m.l + m.d; if (!t) { m = {bark:m.bark, l:4, d:4}; } else { const L = Math.round(m.l / t * 8); m.l = L; m.d = 8 - L; } tick(); draw(); sayRaw(`The survivors had babies. Now ${m.l} light and ${m.d} dark. The moths that blend in take over.`); };
  draw(); }
function exTl(){ const seen = new Set();
  exFrame("Tap each event to hear what happened.", `<div id="eT">${tlHTML(LV.tl, null, {})}</div>`, "Tap each event on the timeline to hear what happened.");
  const lines = LV.watch.filter(w => w[2].tl != null);
  $("eT").querySelectorAll("button").forEach(b => { b.tabIndex = 0; b.onclick = () => { const k = +b.dataset.k; seen.add(k); b.classList.add("hi"); tick();
    const line = lines.find(w => [].concat(w[2].tl).includes(k)); sayRaw(`${LV.tl[k][0]}. ${LV.tl[k][1].replace(/;/g, ".")}. ${line ? line[0] : ""}`); }; });
}
const cardEmo = v => (v.e || (v.chain||v.pyr||[]).map(x=>x[0]) || []).slice(0,3).join("") || (v.cell?"🔬":v.g?"📈":v.big?"🔢":v.bal?"⚖️":v.dna?"🧬":v.pun?"🔲":v.moths?"🦋":v.acr?"🔤":"💡");
function exCards(){ const seen = new Set();
  exFrame("Tap each card to hear it again.", `<div class="v-gallery">${LV.watch.map((w,k)=>`<button data-k="${k}"><span class="v-emo">${E(cardEmo(w[2]))}</span><span>${capHTML(w[1])}</span></button>`).join("")}</div>`, "Tap each card to hear it again. Try to say it back out loud.");
  document.querySelectorAll(".v-gallery button").forEach(b => b.onclick = () => { const k = +b.dataset.k; seen.add(k); b.classList.add("seen"); tick(); sayRaw(LV.watch[k][0]); });
}

/* 3. Word power */
function words(){ let k = 0;
  const draw = () => { const [ps, ms, say, sum] = LV.words[k];
    $("wBox").innerHTML = `<div class="v-word">${ps.map((p,i)=>`<button class="v-chunk c${i}" data-i="${i}">${E(p)}</button>`).join("")}</div>
      <div class="v-mean">${ms.map((m,i)=>m?`<span style="color:${["var(--blue)","var(--accent)","var(--good)"][i]}">${E(m)}</span>`:"").filter(Boolean).join(" + ")}</div><div class="v-cap" style="font-size:21px">${E(sum)}</div>`;
    document.querySelectorAll(".v-chunk").forEach(c => c.onclick = () => { const i = +c.dataset.i; tick(); sayRaw(`${ps[i]}. ${ms[i] ? "Means " + ms[i] + "." : ""}`); });
    document.querySelectorAll(".v-wcards button").forEach((b,i) => b.classList.toggle("on", i===k)); sayRaw(say); };
  frame(`<p class="v-prompt">Big words are just small parts. Tap each colored part.</p><div class="v-wcards">${LV.words.map((w,i)=>`<button data-i="${i}">${E(w[0].join(""))}</button>`).join("")}</div>
    <div id="wBox" style="display:flex;flex-direction:column;gap:12px"></div><div class="row v-center"><button class="btn" id="wAgain">🔁 Hear it again</button><button class="btn go" id="wNext">Next word →</button></div>`, "The beat");
  document.querySelectorAll(".v-wcards button").forEach(b => b.onclick = () => { k = +b.dataset.i; draw(); });
  $("wAgain").onclick = () => sayRaw(LV.words[k][2]); $("wNext").onclick = () => { k = (k+1) % LV.words.length; draw(); };
  draw(); }

/* 4. Beat */
let beatT = null, bctx = null;
function drum(kind){ try { const a = bctx = bctx || new (window.AudioContext||window.webkitAudioContext)(), t = a.currentTime, g = a.createGain(); g.connect(a.destination);
  if (kind==="k"){ const o=a.createOscillator(); o.frequency.setValueAtTime(140,t); o.frequency.exponentialRampToValueAtTime(40,t+.15); g.gain.setValueAtTime(.5,t); g.gain.exponentialRampToValueAtTime(.001,t+.18); o.connect(g); o.start(t); o.stop(t+.2); }
  else { const len = kind==="s"?.15:.04, b = a.createBuffer(1, a.sampleRate*len, a.sampleRate), d = b.getChannelData(0); for (let i=0;i<d.length;i++) d[i]=Math.random()*2-1;
    const s = a.createBufferSource(), f = a.createBiquadFilter(); f.type = kind==="s"?"bandpass":"highpass"; f.frequency.value = kind==="s"?1800:7000; s.buffer=b; s.connect(f).connect(g);
    g.gain.setValueAtTime(kind==="s"?.35:.12,t); g.gain.exponentialRampToValueAtTime(.001,t+len); s.start(t); } } catch(e) {} }
function beatStart(){ beatStop(); let n = 0; beatT = setInterval(() => { const k = n++ % 8; if (k===0||k===3||k===5) drum("k"); if (k===2||k===6) drum("s"); drum("h");
  document.querySelectorAll(".v-beatviz i").forEach((e,i) => e.classList.toggle("hit", i===k)); }, 60000/88/2); }
function beatStop(){ clearInterval(beatT); beatT = null; document.querySelectorAll(".v-beatviz i").forEach(e => e.classList.remove("hit")); }
function beat(){
  const tr = BEATS[unit.id], lastWord = l => l.trim().split(/\s+/).pop();
  const lineHTML = (l, hide) => { const ws = l.trim().split(/\s+/); const last = ws.pop(); return `${E(ws.join(" "))} <span class="v-rhyme ${hide?"hid":""}">${E(last)}</span>`; };
  frame(`<p class="v-prompt">${tr ? "Press play. Nod your head. Rap it with him." : "Learn it like a song. Play the beat and follow along."}</p>
    <div class="v-beatviz" aria-hidden="true">${"<i></i>".repeat(8)}</div>
    <div class="v-lyrics" id="bLyr">${LV.beat.map(l=>`<p>${lineHTML(l, false)}</p>`).join("")}</div>
    <div class="row v-center">${tr ? `<button class="btn go v-big" id="bTrack">🎵 Play the track</button><button class="btn v-big" id="bRhyme">🧠 Finish the rhyme</button>` : `<button class="btn go v-big" id="bPlay">🎤 Play the beat</button>`}<button class="btn" id="bVoice">🗣 Words only</button></div>
    <p class="small muted">${tr ? "Finish the rhyme: the last word of each line is hidden. Say it out loud before it pops up." : "Play it twice. The second time, say it with the voice."}</p>`, "Play");
  const my = tok; let on = false;
  const paint = (i, reveal) => document.querySelectorAll("#bLyr p").forEach((p,j) => { p.classList.toggle("now", j===i); if (reveal != null && j===i && reveal) p.querySelector(".v-rhyme")?.classList.remove("hid"); });
  const setBtns = () => { if ($("bTrack")) $("bTrack").textContent = "🎵 Play the track"; if ($("bRhyme")) $("bRhyme").textContent = "🧠 Finish the rhyme"; if ($("bPlay")) $("bPlay").textContent = "🎤 Play the beat"; };
  const stopAll = () => { on = false; hush(); beatStop(); paint(-1); setBtns(); };
  /* the real track: each lyric line has its own timed section */
  const playTrack = rhyme => { if (on) { stopAll(); return; } hush(); on = true; const id = talkId, [f, intro, lineMs] = tr;
    document.querySelectorAll("#bLyr p").forEach((p,i) => p.innerHTML = lineHTML(LV.beat[i], rhyme));
    (rhyme ? $("bRhyme") : $("bTrack")).textContent = "⏹ Stop";
    AU.src = "/audio/beat/" + f; try { AU.playbackRate = 1; AU.defaultPlaybackRate = 1; } catch(e) {}
    let beatN = -1;
    AU.ontimeupdate = () => { if (id !== talkId) return; const ms = AU.currentTime * 1000, i = Math.floor((ms - intro) / lineMs), into = ((ms - intro) % lineMs) / lineMs;
      const k = Math.floor(AU.currentTime * 88 / 60 * 2) % 8; if (k !== beatN) { beatN = k; document.querySelectorAll(".v-beatviz i").forEach((e,x) => e.classList.toggle("hit", x===k)); }
      if (i >= 0 && i < LV.beat.length) paint(i, !rhyme || into > 0.55); else paint(-1); };
    AU.onended = () => { if (id !== talkId) return; on = false; paint(-1); setBtns(); document.querySelectorAll(".v-rhyme").forEach(r => r.classList.remove("hid")); document.querySelectorAll(".v-beatviz i").forEach(e => e.classList.remove("hit")); doneSt.add(3); };
    AU.play().catch(() => { on = false; setBtns(); }); };
  /* the recorded voice reads each line (or the drum loop when there's no track) */
  const sing = async withBeat => { on = true; if (withBeat) beatStart(); await sleep(withBeat ? 1400 : 0); const ps = [...document.querySelectorAll("#bLyr p")];
    for (let i=0;i<ps.length && on && my===tok;i++){ ps.forEach((p,j)=>p.classList.toggle("now", j===i)); const ok = await sayRaw(LV.beat[i], ps[i]); if (!ok) break; await sleep(250); }
    if (my !== tok) return; document.querySelectorAll("#bLyr p").forEach((p,i) => { p.classList.remove("now"); p.innerHTML = lineHTML(LV.beat[i], false); }); beatStop(); on = false; setBtns(); doneSt.add(3); };
  if ($("bTrack")) $("bTrack").onclick = () => playTrack(false);
  if ($("bRhyme")) $("bRhyme").onclick = () => playTrack(true);
  if ($("bPlay")) $("bPlay").onclick = () => { if (on) stopAll(); else { $("bPlay").textContent = "⏹ Stop"; sing(true); } };
  $("bVoice").onclick = () => { if (on) stopAll(); else sing(false); };
}

/* 5. Play */
function play(items, replay){ items = items || LV.play.map(q => Object.assign({}, q, {_lv:LV}));
  P = {items, i:0, right:0, res:[], miss:[], replay:!!replay};
  if (!replay) qset = {qs: items.map((_,i)=>i), n:0, right:0};
  ask(); }
function ask(){ const q = P.items[P.i];
  frame(`<div class="v-dots">${P.items.map((_,j)=>`<i class="${P.res[j]===true?"ok":P.res[j]===false?"no":j===P.i?"now":""}"></i>`).join("")}</div>
    <div class="v-qtop"><button class="btn" id="qHear" aria-label="Hear it again">🔊</button><p class="v-prompt">${capHTML(q.cap)}</p></div>
    <div id="qBody" style="display:flex;flex-direction:column;gap:12px"></div><div id="qFb"></div>`, "");
  $("qHear").onclick = () => sayRaw(q.say);
  const fin = (ok, why, show) => answered(q, ok, why, show);
  ({tap:qTap, tf:qTf, sort:qSort, match:qMatch, seq:qSeq, pick:qPick, mc:qMc, build:qBuild, pickline:qPickLine, ydot:qYdot, balance:qBal, dna:qDna, pun:qPun, tltap:qTl})[q.t](q, $("qBody"), fin);
  sayRaw(q.say);
}
function answered(q, ok, why, show){
  if (P.res[P.i] !== undefined) return; P.res[P.i] = ok; if (ok) P.right++; else P.miss.push(q);
  if (P.replay) { ok ? SFX.ok() : SFX.no(); if (ok) { S.points += 1; save(); paintBoard(); } } else score(ok, {prompt: plain(q.cap)});
  const cheer = ok ? CHEERS_OK[Math.floor(Math.random()*CHEERS_OK.length)] : CHEERS_NO[Math.floor(Math.random()*CHEERS_NO.length)];
  const last = P.i + 1 >= P.items.length;
  $("qFb").innerHTML = `<div class="v-fb ${ok?"ok":"no"}">${ok?IC.yes:IC.nope}<div><div>${E(cheer)}${ok&&!P.replay?" +2":""}</div>${why?`<div style="font-weight:500" id="fbWhy">${E(why)}</div>`:""}</div></div>
    <div class="row" style="justify-content:flex-end;margin-top:12px"><button class="btn" id="fbHear">🔊 Hear it</button><button class="btn go v-big" id="qNext">${last?"See my score":"Next"} →</button></div>`;
  if (show) show();
  if (ok) { $("qFb").insertAdjacentHTML("afterbegin", `<div class="v-pop2" aria-hidden="true">+${P.replay?1:2}</div><div class="v-confetti" aria-hidden="true">${Array.from({length:18},(_,k)=>`<i style="left:${5+(k*53)%90}%;background:${["var(--accent)","var(--blue)","var(--good)","var(--nuc)"][k%4]};animation-delay:${(k%6)*0.05}s"></i>`).join("")}</div>`);
    if (S.streak >= 3 && !P.replay) $("qFb").querySelector(".v-fb > div").insertAdjacentHTML("beforeend", `<div class="v-streak">🔥 ${S.streak} in a row</div>`); }
  else { const qb = $("qBody"); qb.classList.remove("v-shake"); void qb.offsetWidth; qb.classList.add("v-shake"); }
  const talk = () => saySeq([[cheer], [why, $("fbWhy")]]); talk(); $("fbHear").onclick = talk;
  $("qNext").onclick = () => { P.i++; if (P.i < P.items.length) ask(); else finish(); };
  $("qNext").focus({preventScroll:true}); $("qBody").style.pointerEvents = "none";
  const calm = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches; $("qFb").scrollIntoView({behavior: calm ? "auto" : "smooth", block:"nearest"});
}
function finish(){ lastMiss = P.miss.slice();
  if (!P.replay) { doneSt.add(4); qset.right = P.right; done(); return; }
  const n = P.items.length;
  frame(`<p class="small muted" style="font-weight:700;text-transform:uppercase;letter-spacing:.08em">Replay round</p><h1 style="font-size:52px;line-height:1;text-align:center">${P.right} / ${n}</h1>
    <p class="v-cap">${P.right===n?"All fixed, Bayo. That's growth.":"Getting there. Run them back once more."}</p>
    <div class="row v-center">${P.miss.length?`<button class="btn go v-big" id="rAgain">🔁 Replay ${P.miss.length} more</button>`:""}<button class="btn" id="rAll">Play the full level</button><button class="btn" id="rMap">Season map</button></div>`, "");
  sayRaw(P.right===n ? "All fixed, Bayo. That's growth." : "Getting there. Let's run those back once more.");
  if ($("rAgain")) $("rAgain").onclick = () => play(mix(P.miss), true);
  $("rAll").onclick = () => openStage(4); $("rMap").onclick = home;
}

/* ---- question types ---- */
function qTap(q, body, fin){
  body.innerHTML = `<div class="v-stage">${cellSVG("tcell")}</div>`; const s = $("tcell"); requestAnimationFrame(() => cellShow(s, q.cell));
  cellTap(s, (p, g) => { const ok = p === q.target, T = PARTS[q.target], H = PARTS[p];
    fin(ok, ok ? T.say : `That's the ${H.name.toLowerCase()}, ${H.role}. You wanted ${T.role}: the ${T.name.toLowerCase()}. It's glowing green now.`,
      () => { cellGlow(s, null); s.querySelector(`.v-part[data-p="${q.target}"]`).classList.add("right"); if (!ok) g.classList.add("wrong"); }); });
}
function qTf(q, body, fin){
  body.innerHTML = `${q.vis?`<div class="v-stage">${visHTML(q.vis, q._lv)}</div>`:""}<div class="v-tf"><button data-v="1">${IC.yes}True</button><button data-v="0">${IC.nope}False</button></div>`;
  body.querySelectorAll(".v-tf button").forEach(b => b.onclick = () => { const v = b.dataset.v==="1"; b.style.borderColor = v===q.ans ? "var(--good)" : "var(--bad)"; fin(v===q.ans, q.why); });
}
function qMc(q, body, fin){ const opts = mix(q.opts);
  body.innerHTML = `${q.vis?`<div class="v-stage">${visHTML(q.vis, q._lv)}</div>`:""}<div class="v-mc">${opts.map((o,j)=>`<button data-j="${j}"><span class="lt">${"ABC"[j]}</span>${E(o[0])}</button>`).join("")}</div>`;
  body.querySelectorAll(".v-mc button").forEach(b => b.onclick = () => { const o = opts[+b.dataset.j]; b.style.borderColor = o[1] ? "var(--good)" : "var(--bad)";
    if (!o[1]) body.querySelectorAll(".v-mc button").forEach((x,j) => { if (opts[j][1]) x.style.borderColor = "var(--good)"; });
    fin(!!o[1], o[1] ? q.why : `The answer is ${spoken(opts.find(x=>x[1])[0])}. ${q.why}`); });
}
function qSort(q, body, fin){
  let sel = null; const where = {}; const items = mix(q.items.map((it,i)=>({t:it[0], ic:it[1], bin:it[2], say:it[3]||it[0], k:i})));
  const chip = it => `<button class="v-chip ${sel===it.k?"sel":""}" data-k="${it.k}">${icon(it.ic)}${E(it.t)}</button>`;
  const draw = () => { body.innerHTML = `<div class="v-chips" id="sPool">${items.filter(it=>where[it.k]==null).map(chip).join("")}</div>
    <div class="v-bins">${q.bins.map((b,j)=>`<button class="v-bin" data-b="${j}"><b>${E(b)}</b><span class="v-chips">${items.filter(it=>where[it.k]===j).map(chip).join("")}</span></button>`).join("")}</div>
    <div class="row"><button class="btn go" id="sCheck" ${Object.keys(where).length<items.length?"disabled":""}>Check</button></div>`;
    body.querySelectorAll("#sPool .v-chip").forEach(c => c.onclick = () => { sel = +c.dataset.k; sayLabel(items.find(x=>x.k===sel).say); draw(); });
    body.querySelectorAll(".v-bin").forEach(bn => bn.onclick = e => { const ic = e.target.closest(".v-chip");
      if (ic) { delete where[+ic.dataset.k]; draw(); return; }
      if (sel==null) { sayRaw("Tap one first, then tap a box."); return; } where[sel] = +bn.dataset.b; tick(); sayLabel(q.bins[+bn.dataset.b].replace(/[↗↘]/g,"")); sel = null; draw(); });
    $("sCheck").onclick = () => { const wrong = items.filter(it => where[it.k] !== it.bin);
      body.querySelectorAll(".v-bin .v-chip").forEach(c => { const it = items.find(x=>x.k===+c.dataset.k); c.classList.add(where[it.k]===it.bin?"ok":"no"); });
      fin(!wrong.length, wrong.length ? q.bins.map((b,j)=>`${b.replace(/[↗↘]/g,"").trim()}: ${q.items.filter(it=>it[2]===j).map(it=>it[3]||it[0]).join(", ")}.`).join(" ") : "All sorted right."); }; };
  draw();
}
function qMatch(q, body, fin){
  const left = q.pairs.map((p,i)=>({i,t:p[0],ic:p[1]})), right = mix(q.pairs.map((p,i)=>({i,t:p[2]})));
  let sel = null, made = {}, n = 0, wrongs = 0; const pc = {};
  const draw = () => { body.innerHTML = `<div class="v-match"><div class="col">${left.map(l=>`<button class="v-mi ${pc[l.i]!=null?"p"+pc[l.i]:""} ${sel===l.i?"sel":""}" data-l="${l.i}">${icon(l.ic)}${E(l.t)}</button>`).join("")}</div>
    <div class="col">${right.map(r=>`<button class="v-mi ${made[r.i]?"p"+pc[r.i]:""}" data-r="${r.i}">${E(r.t)}</button>`).join("")}</div></div>`;
    body.querySelectorAll("[data-l]").forEach(b => b.onclick = () => { const i = +b.dataset.l; if (made[i]) return; sel = i; sayLabel(left[i].t); draw(); });
    body.querySelectorAll("[data-r]").forEach(b => b.onclick = () => { const i = +b.dataset.r; if (made[i]) return; const r = right.find(x=>x.i===i);
      if (sel==null) { sayLabel(r.t + ". Tap one on the left first."); return; }
      if (i === sel) { made[i] = true; pc[i] = n++ % 4; tick(); sayLabel(r.t); sel = null; draw();
        if (n === left.length) fin(wrongs === 0, wrongs ? "All matched. Some took a second try. Run it back for a clean sweep." : "Every match on the first try."); }
      else { wrongs++; SFX.no(); b.classList.add("no"); sayRaw("Not that one. Try again."); setTimeout(draw, 700); } }); };
  draw();
}
function qSeq(q, body, fin){
  let order; do { order = mix(q.items.map((_,i)=>i)); } while (order.length > 1 && order.every((v,i)=>v===i));
  const pk = [];
  const draw = () => { body.innerHTML = `<div class="v-seq">${q.items.map((_,j)=>pk[j]!=null?`<div class="v-slot filled"><span class="n">${j+1}</span><button data-p="${j}">${icon(q.items[pk[j]][1])}${E(q.items[pk[j]][0])}</button></div>`:`<div class="v-slot"><span class="n">${j+1}</span><span class="muted small">tap one below</span></div>`).join("")}</div>
    <div class="v-chips">${order.filter(k=>!pk.includes(k)).map(k=>`<button class="v-chip" data-k="${k}">${icon(q.items[k][1])}${E(q.items[k][0])}</button>`).join("")}</div>
    <div class="row"><button class="btn go" id="qCheck" ${pk.length<q.items.length?"disabled":""}>Check</button></div>`;
    body.querySelectorAll(".v-chip").forEach(c => c.onclick = () => { pk.push(+c.dataset.k); tick(); sayLabel(q.items[+c.dataset.k][0]); draw(); });
    body.querySelectorAll(".v-slot button").forEach(b => b.onclick = () => { pk.splice(+b.dataset.p,1); draw(); });
    $("qCheck").onclick = () => { body.querySelectorAll(".v-slot").forEach((s,j)=>s.classList.add(pk[j]===j?"ok":"no")); const ok = pk.every((k,j)=>k===j);
      fin(ok, (ok ? "" : "The right order: ") + q.items.map(x=>spoken(x[0])).join(", then ") + "."); }; };
  draw();
}
function qPick(q, body, fin){ const opts = mix(q.opts);
  body.innerHTML = `${q.vis?`<div class="v-stage">${visHTML(q.vis, q._lv)}</div>`:""}<div class="v-pics">${opts.map((o,j)=>`<button class="v-pic" data-j="${j}">${picHTML(o[1])}<span>${E(o[0])}</span></button>`).join("")}</div>`;
  body.querySelectorAll(".v-pic").forEach(b => b.onclick = () => { const o = opts[+b.dataset.j]; b.style.borderColor = o[2] ? "var(--good)" : "var(--bad)";
    if (!o[2]) body.querySelectorAll(".v-pic").forEach((x,j) => { if (opts[j][2]) x.style.borderColor = "var(--good)"; }); fin(!!o[2], q.why); });
}
function qBuild(q, body, fin){ let m = 0, b = 0;
  const draw = () => { body.innerHTML = `<div class="v-stage">${graphSVG({lines:[[q.m,q.b,null,"var(--line)",10],[m,b]], pts:[[0,b]]},{label:"Your line"})}</div><div class="v-eq">y = ${eqHTML(m,b)}</div>
    <div class="v-knobs">${knob("m","m = slope",fmtN(m),"m-","m+")}${knob("b","b = start",fmtN(b),"b-","b+")}</div>
    <p class="small muted" style="text-align:center">Match the thick gray line.</p><div class="row v-center"><button class="btn go v-big" id="bLock">Lock it in</button></div>`;
    body.querySelectorAll("[data-a]").forEach(x => x.onclick = () => { const a = x.dataset.a; if (a[0]==="m") m = Math.max(-4,Math.min(4, m + (a[1]==="+"?1:-1))); else b = Math.max(-5,Math.min(5, b + (a[1]==="+"?1:-1))); tick(); draw(); sayRaw(eqSay(m,b)); });
    $("bLock").onclick = () => { const ok = m===q.m && b===q.b; fin(ok, ok ? `${eqSay(m,b)}. Starts at ${q.b}, ${m>0?"up":"down"} ${Math.abs(m)} each step.` : `The line was ${eqSay(q.m,q.b)}. Start at ${q.b}, then ${q.m>0?"up":"down"} ${Math.abs(q.m)} for every 1 over.`); }; };
  draw();
}
function qPickLine(q, body, fin){
  body.innerHTML = `<div class="v-stage">${graphSVG({lines:q.lines.map(l=>[l[0],l[1],null,l[2]])})}</div><div class="v-tf">${q.lines.map((l,j)=>`<button data-j="${j}" style="border-color:${l[2]}"><span style="width:60px;height:8px;border-radius:4px;background:${l[2]}"></span>${E(l[3])}</button>`).join("")}</div>`;
  body.querySelectorAll(".v-tf button").forEach(b => b.onclick = () => fin(+b.dataset.j===q.ans, q.why));
}
function qYdot(q, body, fin){
  body.innerHTML = `<div class="v-stage">${graphSVG({lines:[[q.m,q.b]]},{ydots:[-4,-2,0,2,4]})}</div><p class="small muted" style="text-align:center">Tap a circle on the y axis.</p>`;
  body.querySelectorAll(".v-ydot").forEach(d => d.onclick = () => { const v = +d.dataset.v; d.style.fill = v===q.b ? "var(--good)" : "var(--bad)"; fin(v===q.b, q.why); });
}
function qBal(q, body, fin){ balGame(body, q.start, q.steps, q.choices, clean => {
  const last = q.steps[q.steps.length-1][1]; fin(clean, clean ? `${last[0]} = ${last[1]}. Perfect moves.` : `You got there: ${last[0]} = ${last[1]}. Next time, pick ${q.steps.map(s=>s[0].toLowerCase()).join(", then ")} first.`); }); }
function qDna(q, body, fin){ const got = []; let wrong = 0;
  const draw = () => { const i = got.length;
    body.innerHTML = `<div class="v-stage"><div class="v-dna">${[...q.strand].map((c,k)=>`<div class="r ${k===i?"hi":""}"><span class="b b${c}">${c}</span><span class="bar"></span><span class="b ${k<i?"b"+PAIR[c]:"bq"}">${k<i?PAIR[c]:"?"}</span></div>`).join("")}</div></div>
      ${i<q.strand.length?`<p class="small muted" style="text-align:center">Partner for <b>${q.strand[i]}</b>?</p><div class="v-tf" style="grid-template-columns:repeat(4,1fr)">${"ATGC".split("").map(c=>`<button data-c="${c}" style="min-height:72px"><span class="b b${c}" style="width:46px;height:40px;border-radius:10px;display:grid;place-items:center;color:#fff">${c}</span></button>`).join("")}</div>`:""}`;
    body.querySelectorAll("[data-c]").forEach(b => b.onclick = () => { const c = b.dataset.c, want = PAIR[q.strand[got.length]];
      if (c === want) { got.push(c); tick(); sayRaw(`${q.strand[got.length-1]} with ${c}.`); draw(); if (got.length === q.strand.length) fin(wrong === 0, wrong ? "Built it, with a slip. Remember: A with T, C with G." : "Perfect. A with T, C with G."); }
      else { wrong++; SFX.no(); b.style.borderColor = "var(--bad)"; sayRaw(`Not ${c}. ${q.strand[got.length]==="A"||q.strand[got.length]==="T"?"Apple in the Tree.":"Car in the Garage."}`); } }); };
  draw(); }
function qPun(q, body, fin){ const [a,b] = q.p, vals = [null,null,null,null], marks = {}; let cur = 0;
  const want = [[a[0],b[0]],[a[1],b[0]],[a[0],b[1]],[a[1],b[1]]].map(xy => xy.sort((m,n)=>(m===m.toUpperCase()?0:1)-(n===n.toUpperCase()?0:1)).join(""));
  const draw = () => { body.innerHTML = `<div class="v-stage">${punHTML(a, b, 0, {ask:1, vals, marks:Object.assign({}, marks, {[cur]:(marks[cur]||"")+" sel"})})}</div>
    <p class="small muted" style="text-align:center">Box ${cur+1}: one letter from the top, one from the side.</p>
    <div class="v-tf" style="grid-template-columns:repeat(3,1fr)">${["BB","Bb","bb"].map(g=>`<button data-g="${g}" style="min-height:72px">${g}</button>`).join("")}</div>
    <div class="row"><button class="btn go" id="pCheck" ${vals.includes(null)?"disabled":""}>Check</button></div>`;
    body.querySelectorAll("td[data-k]").forEach(td => td.onclick = () => { cur = +td.dataset.k; draw(); });
    body.querySelectorAll("[data-g]").forEach(x => x.onclick = () => { vals[cur] = x.dataset.g; sayLabel(x.dataset.g); tick(); const nx = vals.indexOf(null); if (nx >= 0) cur = nx; draw(); });
    $("pCheck").onclick = () => { want.forEach((w,k)=>marks[k] = vals[k]===w ? "ok" : "no"); cur = -1; draw(); const ok = want.every((w,k)=>vals[k]===w);
      const dom = want.filter(w=>w.includes("B")).length; fin(ok, `${ok?"":"The boxes are " + want.map(w=>spoken(w)).join("; ") + ". "}${dom} out of 4 show the dominant trait.`); }; };
  draw(); }
function qTl(q, body, fin){ const tl = q._lv.tl;
  body.innerHTML = `<div class="v-stage">${tlHTML(tl, null, {ask:1})}</div>`;
  body.querySelectorAll(".v-tl button").forEach(b => b.onclick = () => { const k = +b.dataset.k; b.classList.add("hi"); b.style.borderColor = k===q.ans ? "var(--good)" : "var(--bad)";
    body.querySelectorAll(".v-tl button").forEach((x,j) => { x.querySelector("span:last-child").textContent = tl[j][1]; if (j===q.ans) x.style.borderColor = "var(--good)"; }); fin(k===q.ans, q.why); });
}

/* championship: two plays from every level */
function boss(){ unit = Object.assign({}, bossU(), {v2:true}); unitI = UNITS.length; stage = 4;
  const items = mix(UNITS.flatMap(u => mix(u.v2.play).slice(0,2).map(q => Object.assign({}, q, {_lv:u.v2}))));
  play(items); }
function replayMisses(){ if (!unit.boss) { unit = UNITS[unitI]; LV = unit.v2; } stage = 4; play(mix(lastMiss), true); }
/* lets the rest of the app (Grammar, map, scores) use the recordings too */
function recMain(text, onWord, onEnd){ const rec = REC[text]; if (!rec || !AU || S.rec === false) return false;
  hush(); const id = talkId, T = rec[1] || [];
  AU.src = "/audio/" + rec[0]; setRate();
  AU.ontimeupdate = () => { if (id !== talkId) return; const t = AU.currentTime; let i = -1; T.forEach((w,k) => { if (t >= w[0]) i = k; }); onWord(i, T.length); };
  AU.onended = () => { if (id === talkId) onEnd(true); }; AU.onerror = () => { if (id === talkId) onEnd(false); };
  AU.play().catch(() => { if (id === talkId) onEnd(false); }); return true; }
return {recMain, quiet: () => hush(), get P(){ return P; }, open, boss, hush: () => { tok++; hush(); beatStop(); }, misses: () => lastMiss.length, replayMisses};
})();
