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
for S_ in SUBJ[1:]:
    for u in S_["units"]:
        u["v2"] = l2["V2"][u["id"]]
h = (here/"template.html").read_text().replace("__SUBJ__", json.dumps(SUBJ, ensure_ascii=False))
(here.parent/"public/index.html").write_text(h); print("built", len(h))
