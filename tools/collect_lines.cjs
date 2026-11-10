// Plays every new-style level in a headless browser (right and wrong answers), records every line the app
// would speak, and writes tools/lines.json. Usage: NODE_PATH=<dir with jsdom> node tools/collect_lines.js
const {JSDOM}=require("jsdom");const fs=require("fs");const path=require("path");
const root=path.join(__dirname,"..");const heard=new Set();let on=false;
const d=new JSDOM(fs.readFileSync(path.join(root,"public/index.html"),"utf8"),{runScripts:"dangerously",url:"https://x.test/",pretendToBeVisual:true,beforeParse(w){
  w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=function(){};w.SpeechSynthesisUtterance=function(t){this.text=t};
  w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){if(on)heard.add(u.text);setTimeout(()=>u.onend&&u.onend(),1)}};w.fetch=()=>Promise.resolve({ok:false});w.requestAnimationFrame=f=>setTimeout(f,0);
  w.Audio=undefined;}});
const w=d.window,doc=w.document,$=id=>doc.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const click=el=>{if(el)el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));};
const txt=el=>el?el.textContent.replace(/\s+/g," ").trim():"";
async function answer(q,right){const body=$("qBody");
  if(q.t==="tap"){click(doc.querySelector(`#tcell .v-part[data-p="${right?q.target:(q.target==="nucleus"?"mito":"nucleus")}"]`));}
  else if(q.t==="tf"){click(body.querySelector(`.v-tf button[data-v="${(q.ans===right)?1:0}"]`));}
  else if(q.t==="mc"){const bs=[...body.querySelectorAll(".v-mc button")];click(bs.find(b=>(b.textContent.slice(1)===q.opts.find(o=>o[1])[0])===right));}
  else if(q.t==="pick"){const bs=[...body.querySelectorAll(".v-pic")];click(bs.find(b=>(b.querySelector("span:last-child").textContent===q.opts.find(o=>o[2])[0])===right));}
  else if(q.t==="sort"){for(let k=0;k<q.items.length;k++){const c=$("sPool").querySelector(".v-chip");const it=+c.dataset.k;click(c);await sleep(1);click($("qBody").querySelector(`.v-bin[data-b="${right?q.items[it][2]:1-q.items[it][2]}"]`));await sleep(1);}click($("sCheck"));}
  else if(q.t==="match"){for(let k=0;k<q.pairs.length;k++){click($("qBody").querySelector(`[data-l="${k}"]`));click($("qBody").querySelector(`[data-r="${k}"]`));}}
  else if(q.t==="seq"){const n=q.items.length;const ord=right?[...Array(n).keys()]:[...Array(n).keys()].reverse();for(const k of ord)click([...$("qBody").querySelectorAll(".v-chip")].find(c=>+c.dataset.k===k));click($("qCheck"));}
  else if(q.t==="build"){for(let k=0;k<Math.abs(q.m)+(right?0:1);k++)click(body.querySelector(`[data-a="${q.m>0?"m+":"m-"}"]`));for(let k=0;k<Math.abs(q.b);k++)click($("qBody").querySelector(`[data-a="${q.b>0?"b+":"b-"}"]`));click($("bLock"));}
  else if(q.t==="pickline"){click(body.querySelector(`.v-tf button[data-j="${right?q.ans:1-q.ans}"]`));}
  else if(q.t==="ydot"){click(body.querySelector(`.v-ydot[data-v="${right?q.b:q.b+2}"]`));}
  else if(q.t==="balance"){if(!right)click([...$("qBody").querySelectorAll(".v-moves button")].find(b=>!q.steps.some(s=>s[0]===b.dataset.c)));for(const s of q.steps){await sleep(1);click([...$("qBody").querySelectorAll(".v-moves button")].find(b=>b.dataset.c===s[0]));}}
  else if(q.t==="dna"){const P={A:"T",T:"A",G:"C",C:"G"};if(!right){click([...$("qBody").querySelectorAll("[data-c]")].find(b=>b.dataset.c!==P[q.strand[0]]));}for(const c of q.strand){click($("qBody").querySelector(`[data-c="${P[c]}"]`));}}
  else if(q.t==="pun"){const [a,b]=q.p;const want=[[a[0],b[0]],[a[1],b[0]],[a[0],b[1]],[a[1],b[1]]].map(xy=>xy.sort((m,n)=>(m===m.toUpperCase()?0:1)-(n===n.toUpperCase()?0:1)).join(""));for(let k=0;k<4;k++){click($("qBody").querySelector(`td[data-k="${k}"]`));click($("qBody").querySelector(`[data-g="${right||k?want[k]:(want[k]==="bb"?"BB":"bb")}"]`));}click($("pCheck"));}
  else if(q.t==="tltap"){click(body.querySelectorAll(".v-tl button")[right?q.ans:(q.ans+1)%q._lv.tl.length]);}
  else throw new Error("type "+q.t);
  await sleep(2);return txt($("qFb"));}

(async()=>{await sleep(30);
 for(const sub of ["al","bi","wh"]){w.eval(`setSub("${sub}")`);
  for(let i=0;i<w.eval("UNITS.length");i++){on=true;
   w.eval(`V2.open(${i},0)`);await sleep(5);click($("wPlay"));
   for(let k=0;k<40&&!/Watch again/.test(txt($("wPlay")));k++)await sleep(450);
   for(let st=1;st<=3;st++){w.eval(`V2.open(${i},${st})`);await sleep(5);
     if(st===1){for(let r=0;r<2;r++)for(const b of [...doc.querySelectorAll("#vCard button")]){click(b);await sleep(3);}for(const p of [...doc.querySelectorAll("#vCard .v-part")])click(p);}
     if(st===2){const n=doc.querySelectorAll(".v-wcards button").length;for(let k=0;k<n;k++){click(doc.querySelectorAll(".v-wcards button")[k]);await sleep(2);doc.querySelectorAll(".v-chunk").forEach(c=>click(c));await sleep(2);}}
     if(st===3){click($("bVoice"));await sleep(80);}}
   for(const right of [true,false]){w.eval(`V2.open(${i},4)`);await sleep(5);const n=w.eval("V2.P.items.length");
     for(let k=0;k<n;k++){const q=w.eval("V2.P.items[V2.P.i]");try{await answer(q,right);}catch(e){}await sleep(3);click($("qNext"));await sleep(2);}}
   on=false;process.stdout.write(sub+(i+1)+" ");}
 }
 // drop lines with scores or points (they change every time), then add every authored line no matter what
 let lines=[...heard].map(t=>t.trim()).filter(t=>t&&!/\b\d+ out of \d+\b.*(Bayo!|Run it back|won|game)|\+2|points? to |Your rank/.test(t));
 const authored=w.eval(`SUBJ.slice(1).flatMap(s=>s.units.flatMap(u=>{const L=u.v2;return [...L.watch.map(x=>x[0]),...L.words.map(x=>x[2]),...L.beat,...L.play.flatMap(q=>[q.say,q.why||""])];})).concat(CHEERS_OK,CHEERS_NO)`);
 // order: authored lines level by level first (so a partial recording covers the first levels), then everything else
 const first=[...new Set(authored.filter(Boolean).map(t=>t.trim()))];
 const rest=lines.filter(t=>!first.includes(t)&&!/^[,.;:]/.test(t)).sort();
 lines=first.concat(rest);
 fs.writeFileSync(path.join(__dirname,"lines.json"),JSON.stringify(lines,null,0));
 console.log("\n"+lines.length+" lines, "+lines.reduce((a,t)=>a+t.length,0)+" characters");process.exit(0);})();
