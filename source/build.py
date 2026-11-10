import json, pathlib
here = pathlib.Path(__file__).parent
g = {}; exec((here/"content.py").read_text(), g)
s = {}; exec((here/"subjects.py").read_text(), s)
SUBJ = [
 {"id":"gr","name":"Grammar","icon":"nv","boss":"boss","units":g["UNITS"]},
 {"id":"al","name":"Algebra 1","icon":"al6","boss":"al-boss","units":s["ALGEBRA"]},
 {"id":"bi","name":"Biology","icon":"bi4","boss":"bi-boss","units":s["BIOLOGY"]},
 {"id":"wh","name":"World History","icon":"wh3","boss":"wh-boss","units":s["HISTORY"]},
]
l2 = {}; exec((here/"lessons2.py").read_text(), l2)
import random
g2 = {}; exec((here/"grammar2.py").read_text(), g2)
def conv(q):
    if q["t"] == "tap":
        return {"t":"tapw","s":q["s"],"want":q["want"],"say":q["prompt"],"cap":q["prompt"],"ex":q["ex"]}
    order = list(range(len(q["ch"])))
    rest = [k for k in order if q["ch"][k] != "Correct as is"]; random.Random(q["prompt"] + q.get("s","")).shuffle(rest)
    order = [k for k in order if q["ch"][k] == "Correct as is"] + rest
    return {"t":"fixit","s":q.get("s",""),"say":q["prompt"],"cap":q["prompt"],"ch":q["ch"],"a":q["a"],"ex":q["ex"],"why":q["why"],"order":order}
for u in SUBJ[0]["units"]:
    G = g2["G2"][u["id"]]
    u["v2"] = {k:v for k,v in G.items() if k != "extra"}
    u["v2"]["play"] = [conv(q) for q in u["q"]] + G.get("extra", [])
for S_ in SUBJ[1:]:
    for u in S_["units"]:
        u["v2"] = l2["V2"][u["id"]]
h = (here/"template.html").read_text().replace("__V2CSS__", (here/"v2.css").read_text()).replace("__V2JS__", (here/"v2.js").read_text()).replace("__SUBJ__", json.dumps(SUBJ, ensure_ascii=False))
(here.parent/"public/index.html").write_text(h); print("built", len(h))
