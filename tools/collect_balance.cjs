// Adds every line the animated balance can say (every move from every step of every puzzle) to tools/lines.json.
const {JSDOM}=require("jsdom");const fs=require("fs");const path=require("path");const root=path.join(__dirname,"..");
const d=new JSDOM(fs.readFileSync(path.join(root,"public/index.html"),"utf8"),{runScripts:"dangerously",beforeParse(w){w.scrollTo=()=>{};w.speechSynthesis=null;w.fetch=()=>Promise.resolve({ok:false});w.Audio=undefined;}});
const w=d.window;const src=fs.readFileSync(path.join(root,"source/v2.js"),"utf8");
const grab=n=>src.slice(src.indexOf("function "+n+"("),src.indexOf("\nfunction ",src.indexOf("function "+n+"(")+5));
w.eval("var E=s=>String(s);"+["parseSide","sideText","parseMove","applyMove"].map(grab).join("\n")+";"+src.slice(src.indexOf("const MV_SAY"),src.indexOf("\n",src.indexOf("const MV_SAY")))+";window.__b={parseSide,sideText,parseMove,applyMove,MV_SAY}");
w.eval('setSub("al")');const {parseSide,sideText,parseMove,applyMove,MV_SAY}=w.__b;const sp=t=>w.eval("spoken("+JSON.stringify(t)+")");
const P=JSON.parse(w.eval("JSON.stringify(SUBJ[1].units.flatMap(u=>[...u.v2.play.filter(q=>q.t===\"balance\"),...((u.v2.explore||{}).puzzles||[])]))"));
const says=JSON.parse(w.eval("JSON.stringify(SUBJ[1].units.flatMap(u=>u.v2.play.flatMap(q=>[q.say,q.why||\"\"])))")).filter(Boolean);
const out=new Set(["Now the right side too. Balanced again.","Still balanced, but x isn't alone yet. Let's undo that move.","x is all alone. Solved!",...says]);
for(const p of P){let L=parseSide(p.start[0]),R=parseSide(p.start[1]);
  for(const [right] of p.steps){for(const c of p.choices){const mv=parseMove(c),a=applyMove(L,mv),b=applyMove(R,mv);
      if(!a||!b){out.add(`${c} doesn't split evenly here. x is still stuck. Try another move.`);continue;}
      const j=MV_SAY(mv); if(j) out.add(j); else out.add(sp(`Left side: ${c.toLowerCase()}.`));
      out.add(sp(`${sideText(a)} = ${sideText(b)}.`));}
    L=applyMove(L,parseMove(right));R=applyMove(R,parseMove(right));}}
const old=JSON.parse(fs.readFileSync(path.join(__dirname,"lines.json"),"utf8"));const have=new Set(old);
const add=[...out].map(t=>t.trim()).filter(t=>t&&!have.has(t));fs.writeFileSync(path.join(__dirname,"lines.json"),JSON.stringify(old.concat(add)));
console.log(add.length+" new lines, "+add.reduce((a,t)=>a+t.length,0)+" characters");console.log(add.slice(0,8));
