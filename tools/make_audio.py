"""Record every line in tools/lines.json with ElevenLabs and save MP3s + word timings.

Runs in GitHub Actions (see .github/workflows/make-audio.yml). Needs the repo secret ELEVENLABS_API_KEY.
Only records lines that don't have audio yet for this voice, so re-running is cheap.
Output: public/audio/<id>.mp3 and public/audio/manifest.json  {line: [file, [[start, end] per word]]}
"""
import base64, hashlib, json, os, pathlib, sys, time
import requests

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "audio"
KEY = os.environ.get("ELEVENLABS_API_KEY", "").strip()
VOICE = os.environ.get("VOICE_ID", "").strip()
BEAT_VOICE = os.environ.get("BEAT_VOICE_ID", "").strip() or VOICE
MODEL = os.environ.get("MODEL_ID", "").strip() or "eleven_multilingual_v2"
LIMIT = int(os.environ.get("MAX_CHARS", "0") or 0)  # 0 = no limit

if not KEY: sys.exit("Missing ELEVENLABS_API_KEY secret. Add it in GitHub: Settings > Secrets and variables > Actions.")
if not VOICE: sys.exit("Missing voice ID.")

lines = json.loads((ROOT / "tools" / "lines.json").read_text())
beat = set(json.loads((ROOT / "tools" / "beat_lines.json").read_text())) if (ROOT / "tools" / "beat_lines.json").exists() else set()
OUT.mkdir(parents=True, exist_ok=True)
man_path = OUT / "manifest.json"
manifest = json.loads(man_path.read_text()) if man_path.exists() else {}

def fid(text, voice):
    return hashlib.sha1(f"{voice}|{MODEL}|{text}".encode()).hexdigest()[:16] + ".mp3"

def word_times(text, al):
    chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
    out, cur = [], None
    for c, s, e in zip(chars, st, en):
        if c.isspace():
            if cur: out.append(cur); cur = None
            continue
        cur = [s, e] if cur is None else [cur[0], e]
    if cur: out.append(cur)
    n = len(text.split())
    out = (out + [out[-1]] * n)[:n] if out else []
    return [[round(a, 3), round(b, 3)] for a, b in out]

todo = [t for t in lines if not (t in manifest and manifest[t][0] == fid(t, BEAT_VOICE if t in beat else VOICE) and (OUT / manifest[t][0]).exists())]
print(f"{len(lines)} lines, {len(todo)} to record ({sum(map(len, todo))} characters). Voice {VOICE}, model {MODEL}.")
used, done, failed = 0, 0, 0
s = requests.Session(); s.headers.update({"xi-api-key": KEY, "accept": "application/json"})
try:
    for t in todo:
        if LIMIT and used + len(t) > LIMIT: print("Reached MAX_CHARS, stopping."); break
        v = BEAT_VOICE if t in beat else VOICE
        body = {"text": t, "model_id": MODEL, "voice_settings": {"stability": 0.45, "similarity_boost": 0.8, "style": 0.35, "use_speaker_boost": True}}
        for attempt in range(5):
            r = s.post(f"https://api.elevenlabs.io/v1/text-to-speech/{v}/with-timestamps?output_format=mp3_44100_128", json=body, timeout=90)
            if r.status_code == 429 or r.status_code >= 500: time.sleep(3 * (attempt + 1)); continue
            break
        if r.status_code != 200:
            failed += 1
            msg = r.text[:300]
            print(f"FAILED ({r.status_code}): {t[:60]!r} {msg}")
            if "paid_plan_required" in msg: print("STOPPED: this voice is from the Voice Library, which needs a paid ElevenLabs plan for the API. Pick a Default voice, or upgrade."); break
            if r.status_code in (401, 402) or "quota" in msg.lower(): print("STOPPED: check the API key, or you are out of ElevenLabs credits this month."); break
            continue
        j = r.json(); f = fid(t, v)
        (OUT / f).write_bytes(base64.b64decode(j["audio_base64"]))
        manifest[t] = [f, word_times(t, j.get("alignment") or j.get("normalized_alignment"))]
        used += len(t); done += 1
        if done % 25 == 0:
            man_path.write_text(json.dumps(manifest, ensure_ascii=False, separators=(",", ":"))); print(f"  {done} recorded...")
finally:
    # drop recordings for lines that no longer exist
    keep = {k: v for k, v in manifest.items() if k in set(lines)}
    man_path.write_text(json.dumps(keep, ensure_ascii=False, separators=(",", ":")))
    live = {v[0] for v in keep.values()}
    for p in OUT.glob("*.mp3"):
        if p.name not in live: p.unlink()
    print(f"Done: {done} recorded, {failed} failed, {used} characters used. {len(keep)} lines have audio.")
if failed and not done:
    sys.exit("Nothing was recorded. See the error above.")
