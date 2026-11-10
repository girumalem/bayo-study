// Adds the rest of the spoken lines to tools/lines.json: map/score/unlock/home sentences and every Explore
// button combination. Existing lines keep their place. Usage: NODE_PATH=<jsdom dir> node tools/collect_more.cjs
const {JSDOM}=require("jsdom");const fs=require("fs");const path=require("path");
const root=path.join(__dirname,"..");const heard=new Set();let on=false;
const d=new JSDOM(fs.readFileSync(path.join(root,"public/index.html"),"utf8"),{runScripts:"dangerously",url:"https://x.test/",pretendToBeVisual:true,beforeParse(w){
  w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=function(){};w.SpeechSynthesisUtterance=function(t){this.text=t};
  w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){if(on)heard.add(u.text);setTimeout(()=>u.onend&&u.onend(),1)}};w.fetch=()=>Promise.resolve({ok:false});w.requestAnimationFrame=f=>setTimeout(f,0);w.Audio=undefined;w.matchMedia=()=>({matches:false});}});
const w=d.window,doc=w.document,$=id=>doc.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const click=el=>{if(el)el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));};
const tap=sel=>click(doc.querySelector(sel));
async function sweep(a,b,n=12){ for(let i=0;i<n;i++)tap(`[data-a="${a}-"]`); for(let i=0;i<n;i++){ for(let j=0;j<n;j++)tap(`[data-a="${b}-"]`); for(let j=0;j<n;j++)tap(`[data-a="${b}+"]`); tap(`[data-a="${a}+"]`); await sleep(1);} }
(async()=>{await sleep(30);
 // 1) fixed sentences for map, scores, unlocks, ranks, home, locked levels: the exact strings the app builds
 const ui=w.eval(`(()=>{const out=[];const R=RANKS.map(r=>r.name);
  for(const s of SUBJ){const n=s.units.length;
   s.units.forEach((u,k)=>{out.push("Bayo, you're on Level "+(k+1)+" of "+s.name+": "+u.name+".");if(k+1<n)out.push("Level "+(k+2)+", "+s.units[k+1].name+", is unlocked.");if(k)out.push("Locked. Get one star on Level "+k+" first.");});
   out.push("Bayo, you're in the "+s.name+" Championship Game.","Locked. Finish all "+n+" levels to unlock the Championship Game.");
   for(let w=0;w<=n;w++)out.push(s.name+": "+w+" of "+n+" levels won.");}
  out.push("You won the championship. Go for three stars on every level.","That's the top rank.","Each right answer is 2 points.","The Championship Game is unlocked.","You won the championship!",
   "What's up, Bayo!","You're putting in work today. Keep it going.","Pick a subject and let's get to work.","This is how fast I'll read.","Hi Bayo. This is my voice.");
  R.forEach(r=>out.push("Your rank is "+r+".","Keep stacking points to reach "+r+".","New rank: "+r+"."));
  const sizes=new Set();for(const s of SUBJ){s.units.forEach(u=>sizes.add(u.v2?u.v2.play.length:u.q.length));sizes.add(s.units.length*2);}
  for(const n of sizes){for(let r=0;r<=n;r++)out.push(r+" out of "+n+".");out.push("You need "+Math.ceil(PASS*n)+" right to win this level. Run it back, you've got this.");}
  out.push("Bayo! Champion. That's a title run.","Bayo! Game over, and you won big.","Bayo! Strong game. A little more practice and it's three stars.","You won the level. Run it back for more stars.");
  const keys=new Set();for(const s of SUBJ){setSub(s.id);out.forEach(t=>keys.add(spoken(t)));}return [...keys];})()`);
 ui.forEach(t=>heard.add(t));
 // 2) every Explore combination (the app speaks each one as you change it)
 on=true;
 const lv=(s,i,st)=>{w.eval(`setSub("${s}");V2.open(${i},${st})`);};
 lv("al",2,1);await sweep("m","b");                       // slope
 lv("al",6,1);await sweep("a","c");                       // parabola
 lv("al",4,1);await sweep("m","b",8);                     // two lines
 lv("al",1,1);for(const o of [">","≥","<","≤"]){tap(`#eOps [data-o="${o}"]`);for(let i=0;i<12;i++)tap('[data-a="v-"]');for(let i=0;i<12;i++)tap('[data-a="v+"]');} // number line
 lv("al",3,1);for(let r=0;r<3;r++){tap(`#eR [data-r="${r}"]`);for(let n=0;n<6;n++){tap(`#eIn [data-n="${n}"]`);await sleep(560);}}           // machine
 lv("al",5,1);for(const b of [2,3,5]){tap(`#eB [data-b="${b}"]`);for(let n=0;n<6;n++)tap("#eMore");}                                            // powers
 lv("bi",4,1);for(let a=0;a<3;a++)for(let b=0;b<3;b++){tap(`#eA [data-k="${a}"]`);tap(`#eB [data-k="${b}"]`);}                               // punnett
 lv("bi",6,1);for(let r=0;r<30;r++){tap(["#eBark","#eBird","#eBird","#eGen","#eBird","#eGen"][r%6]);await sleep(1);}                          // moths
 lv("bi",3,1);for(let i=0;i<8;i++){tap(`#eD [data-i="${i}"]`);}                                                                             // dna
 lv("al",0,1);for(let p=0;p<4;p++){for(const b of [...doc.querySelectorAll("#eBal .v-moves button")])click(b);await sleep(400);tap("#eNextP");await sleep(5);} // balance
 lv("al",2,4);await sweep("m","b");                       // build-a-line question
 on=false;
 const old=JSON.parse(fs.readFileSync(path.join(__dirname,"lines.json"),"utf8"));const have=new Set(old);
 const add=[...heard].map(t=>t.trim()).filter(t=>t&&!have.has(t));
 fs.writeFileSync(path.join(__dirname,"lines.json"),JSON.stringify(old.concat(add)));
 console.log(add.length+" new lines, "+add.reduce((a,t)=>a+t.length,0)+" characters");process.exit(0);})();
