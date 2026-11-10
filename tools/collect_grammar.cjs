// Plays every Grammar lesson and every answer choice of every question, records what would be spoken,
// and adds those lines to tools/lines.json (existing lines keep their order). Usage: NODE_PATH=<jsdom dir> node tools/collect_grammar.cjs
const {JSDOM}=require("jsdom");const fs=require("fs");const path=require("path");
const root=path.join(__dirname,"..");const heard=new Set();
const d=new JSDOM(fs.readFileSync(path.join(root,"public/index.html"),"utf8"),{runScripts:"dangerously",url:"https://x.test/",pretendToBeVisual:true,beforeParse(w){
  w.scrollTo=()=>{};w.Element.prototype.scrollIntoView=function(){};w.SpeechSynthesisUtterance=function(t){this.text=t};
  w.speechSynthesis={getVoices:()=>[],cancel(){},speak(u){heard.add(u.text);setTimeout(()=>u.onend&&u.onend(),1)}};w.fetch=()=>Promise.resolve({ok:false});w.requestAnimationFrame=f=>setTimeout(f,0);w.Audio=undefined;w.matchMedia=()=>({matches:false});}});
const w=d.window,doc=w.document,$=id=>doc.getElementById(id);
const sleep=ms=>new Promise(r=>setTimeout(r,ms));const click=el=>{if(el)el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));};
(async()=>{await sleep(30);w.eval('setSub("gr")');const before=heard.size;heard.clear();
 const nU=w.eval("UNITS.length");
 for(let i=0;i<nU;i++){
  w.eval(`openUnit(${i})`);await sleep(5);
  for(let s=0;s<30;s++){click($("hearL"));await sleep(40);click($("hearEx"));await sleep(5);if($("next"))click($("next"));else break;await sleep(5);}
  const nQ=w.eval("unit.q.length");
  for(let k=0;k<nQ;k++){const q=w.eval(`unit.q[${k}]`);
   const nOpt=q.t==="tap"?q.s.split(" ").length:q.ch.length;
   for(let o=0;o<nOpt;o++){
    w.eval(`qset={qs:[${k}],n:0,right:0};ask()`);await sleep(3);
    if(o===0){click($("hearQ"));await sleep(80);doc.querySelectorAll(".opt .hear").forEach(b=>click(b));}
    if(q.t==="tap"){const b=[...doc.querySelectorAll("#qs button.w")].find(x=>+x.dataset.i===o);if(!b)continue;click(b);await sleep(300);}
    else{const b=[...doc.querySelectorAll(".opt .pick")].find(x=>+x.dataset.k===o);if(!b)continue;click(b);await sleep(3);}
    click($("hearWhy"));await sleep(60);
   }}
  process.stdout.write("gr"+(i+1)+" ");}
 ["Hi Bayo. This is my voice.","Hi Bayo. Let's get to work."].forEach(t=>heard.add(t));
 const old=JSON.parse(fs.readFileSync(path.join(__dirname,"lines.json"),"utf8"));const have=new Set(old);
 const add=[...heard].map(t=>t.trim()).filter(t=>t&&!have.has(t)&&!/\b\d+ out of \d+\b|points? to |Your rank|plays today/.test(t));
 fs.writeFileSync(path.join(__dirname,"lines.json"),JSON.stringify(old.concat(add)));
 console.log("\nGrammar: "+heard.size+" lines heard, "+add.length+" new, "+add.reduce((a,t)=>a+t.length,0)+" characters");process.exit(0);})();
