"""Turn each level's rap lyrics into a real hip-hop track with ElevenLabs Music.

Runs in GitHub Actions (.github/workflows/make-music.yml) with the ELEVENLABS_API_KEY secret.
Each lyric line gets its own timed section, so the app knows exactly when each line plays and can light it up.
Output: public/audio/beat/<level>-<hash>.mp3 and public/audio/beat/manifest.json {level: [file, intro_ms, line_ms, outro_ms]}
"""
import hashlib, json, os, pathlib, sys, time
import requests

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio" / "beat"
KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()
LEVELS = [x.strip() for x in os.environ.get("LEVELS", "all").split(",") if x.strip()]
LINE_MS = int(os.environ.get("LINE_MS", "") or 5000)       # time for each lyric line (slow and clear)
INTRO_MS, OUTRO_MS = 4000, 3000
VOCAL = os.environ.get("VOCAL", "").strip() or "clear male rap vocals"
REDO = os.environ.get("REDO", "") in ("1", "true", "yes")
if not KEY: sys.exit("Missing ELEVENLABS_API_KEY secret.")

beats = json.loads((ROOT / "tools" / "beats.json").read_text())
OUT.mkdir(parents=True, exist_ok=True)
man_path = OUT / "manifest.json"
manifest = json.loads(man_path.read_text()) if man_path.exists() else {}
want = list(beats) if LEVELS in (["all"], []) else [l for l in LEVELS if l in beats]

STYLE = ["hip hop", "boom bap", "head-nodding groove", "88 BPM", VOCAL, "slow, clear, easy-to-follow flow",
         "every word pronounced clearly", "kid-friendly", "positive energy", "clean mix, vocals up front"]
AVOID = ["explicit lyrics", "mumbling", "heavy autotune", "distorted vocals", "fast rap", "double-time", "screaming", "ad-lib over the lyrics"]

def plan(lines):
    chunks = [{"text": "[Intro]\n{instrumental, the beat comes in}", "duration_ms": INTRO_MS, "positive_styles": STYLE[:4] + ["instrumental intro"], "negative_styles": ["vocals"], "context_adherence": "high"}]
    for i, line in enumerate(lines):
        chunks.append({"text": f"[Verse]\n{line}", "duration_ms": LINE_MS, "positive_styles": STYLE, "negative_styles": AVOID, "context_adherence": "high"})
    chunks.append({"text": "[Outro]\n{instrumental, beat rides out}", "duration_ms": OUTRO_MS, "positive_styles": STYLE[:4] + ["instrumental outro"], "negative_styles": ["vocals"], "context_adherence": "high"})
    return {"chunks": chunks}

made = failed = 0
for lv in want:
    lines = beats[lv]["lines"]
    h = hashlib.sha1(json.dumps([lines, LINE_MS, VOCAL]).encode()).hexdigest()[:10]
    f = f"{lv}-{h}.mp3"
    if not REDO and lv in manifest and manifest[lv][0] == f and (OUT / f).exists():
        print(f"{lv}: already made"); continue
    body = {"model_id": "music_v2_5", "composition_plan": plan(lines)}
    for attempt in range(4):
        r = requests.post("https://api.elevenlabs.io/v1/music?output_format=mp3_44100_128", json=body, headers={"xi-api-key": KEY}, timeout=300)
        if r.status_code == 429 or r.status_code >= 500: time.sleep(10 * (attempt + 1)); continue
        break
    if r.status_code != 200:
        failed += 1; msg = r.text[:400]; print(f"{lv}: FAILED ({r.status_code}) {msg}")
        if r.status_code in (401, 402, 403) or "quota" in msg.lower() or "plan" in msg.lower(): print("STOPPED: check your ElevenLabs plan or credits for Music."); break
        continue
    old = manifest.get(lv, [None])[0]
    (OUT / f).write_bytes(r.content)
    manifest[lv] = [f, INTRO_MS, LINE_MS, OUTRO_MS]
    if old and old != f and (OUT / old).exists(): (OUT / old).unlink()
    man_path.write_text(json.dumps(manifest, indent=1))
    made += 1; print(f"{lv}: made {f} ({len(r.content)//1024} KB)")
man_path.write_text(json.dumps(manifest, indent=1))
print(f"Done: {made} tracks made, {failed} failed. {len(manifest)} levels have a track.")
if failed and not made: sys.exit("No tracks were made. See the error above.")
