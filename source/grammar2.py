# New-style Grammar levels: Watch, Explore, Words, Beat. Play = the original 64 questions (converted in build.py) + one extra hands-on item.
# Visual {"sent": tagged sentence, "hi": tag} shows the colored word chips with one part of speech lit up.
def W(*lines): return [list(l) for l in lines]
def sort(say, cap, bins, items): return {"t": "sort", "say": say, "cap": cap, "bins": bins, "items": items}
def seq(say, cap, items): return {"t": "seq", "say": say, "cap": cap, "items": items}
def match(say, cap, pairs): return {"t": "match", "say": say, "cap": cap, "pairs": pairs}
def lab(*sents): return {"type": "lab", "sents": list(sents)}
def swap(*items): return {"type": "swap", "items": [{"s": s, "opts": [list(o) for o in opts]} for s, opts in items]}

G2 = {
"nv": {
 "watch": W(
  ["Bayo, every sentence has a team. Two starters are nouns and verbs.", "Two starters: *nouns* and *verbs*.", {"e": ["🏀", "🏃🏾"]}],
  ["A noun is a person, place, thing, or idea. Coach. Gym. Ball. Faith.", "*Noun*: person, place, thing, idea.", {"e": ["🧑🏾‍🏫", "🏟️", "🏀", "🙏🏾"]}],
  ["A verb is the action. What someone does.", "*Verb*: the action.", {"e": ["🏃🏾", "🤾🏾", "🙌🏾"]}],
  ["Watch. The coach grabbed the ball. Coach and ball are nouns.", "Nouns light up *blue*.", {"sent": "The/d coach/n grabbed/v the/d ball/n ./x", "hi": "n"}],
  ["Grabbed is the verb. It's what the coach did.", "The verb lights up *orange*.", {"sent": "The/d coach/n grabbed/v the/d ball/n ./x", "hi": "v"}],
  ["Is, am, and are are verbs too. They tell what something is.", "*Is, am, are* are verbs too.", {"sent": "My/p game/n is/v strong/a ./x", "hi": "v"}],
  ["Trick: if you can put the in front of it, it's probably a noun. If you can do it, it's a verb.", "*the ___* = noun. *I can ___* = verb.", {"e": ["🔎"]}]),
 "explore": lab("The/d coach/n grabbed/v the/d ball/n ./x", "David/n threw/v a/d stone/n ./x", "I/p train/v at/o dawn/n ./x", "The/d crowd/n cheered/v loudly/r ./x"),
 "words": [[["Noun"], ["name"], "Noun comes from the word for name. A noun names a person, place, thing, or idea.", "A word that names something."],
           [["Verb"], ["word"], "Verb comes from the word for word. It's the most important word: the action.", "The action word."]],
 "beat": ["Noun is the name, person, place, or thing,", "Coach, gym, ball, faith, that's the team they bring,", "Verb is the action, what you do on the floor,", "Run, pass, shoot, pray, score some more."],
 "extra": [sort("Sort the words. Noun or verb?", "*Noun* or *verb*?", ["Noun (a thing)", "Verb (an action)"], [["coach", "🧑🏾‍🏫", 0], ["stadium", "🏟️", 0], ["faith", "🙏🏾", 0], ["dribble", "🏀", 1], ["pray", "🙌🏾", 1], ["sprint", "🏃🏾", 1]])]},
"ar": {
 "watch": W(
  ["Adjectives and adverbs are describers. They make sentences hit harder.", "The *describers*.", {"e": ["✨", "🎨"]}],
  ["An adjective describes a noun. What kind? Which one? How many?", "*Adjective* describes a *noun*.", {"e": ["📏", "🔥", "🔢"]}],
  ["The tall center blocked the shot. Tall describes the center.", "*Tall* describes the center.", {"sent": "The/d tall/a center/n blocked/v the/d shot/n ./x", "hi": "a"}],
  ["An adverb describes a verb. How? When? Where?", "*Adverb* describes a *verb*.", {"e": ["⚡", "⏰", "📍"]}],
  ["She ran quickly down the field. Quickly tells how she ran.", "*Quickly* tells how.", {"sent": "She/p ran/v quickly/r down/o the/d field/n ./x", "hi": "r"}],
  ["Lots of adverbs end in L Y. Quickly. Quietly. Easily.", "Lots of adverbs end in *-ly*.", {"big": ["quick → quickly", "quiet → quietly"]}],
  ["Adjectives describe things. Adverbs describe actions.", "Things → *adjective*. Actions → *adverb*.", {"sent": "The/d humble/a shepherd/n prayed/v quietly/r ./x", "hi": "a"}]),
 "explore": lab("The/d tall/a center/n blocked/v the/d shot/n ./x", "She/p ran/v quickly/r down/o the/d field/n ./x", "The/d humble/a shepherd/n prayed/v quietly/r ./x", "The/d loud/a crowd/n stood/v up/r ./x"),
 "words": [[["Ad", "jective"], ["next to", "thrown"], "Ad means next to. Jective means thrown. An adjective is thrown next to a noun to describe it.", "Describes a noun."],
           [["Ad", "verb"], ["added to", "verb"], "Ad means added to. An adverb is added to a verb to tell how, when, or where.", "Describes a verb."]],
 "beat": ["Tall center, loud crowd, adjectives describe,", "What kind, which one, how many, that's the vibe,", "Ran quickly, played hard, adverbs tell how,", "Most end in L Y, you got it now."],
 "extra": [sort("Sort them. Does it describe a thing, or an action?", "*Adjective* or *adverb*?", ["Adjective (describes a thing)", "Adverb (describes an action)"], [["tall", "📏", 0], ["loud", "📢", 0], ["humble", "🙏🏾", 0], ["quickly", "⚡", 1], ["quietly", "🤫", 1], ["easily", "😎", 1]])]},
"pr": {
 "watch": W(
  ["Imagine saying Marcus every time. Marcus scored. Marcus celebrated. Marcus went home.", "Too many *Marcus*.", {"e": ["🧍🏾", "🧍🏾", "🧍🏾"]}],
  ["A pronoun takes the place of a noun. Marcus scored. He celebrated.", "*He* takes Marcus's place.", {"sent": "Marcus/n scored/v ./x He/p celebrated/v ./x", "hi": "p"}],
  ["I, he, she, we, and they do the action.", "*I, he, she, we, they*: doing it.", {"e": ["🏃🏾", "⬅️"]}],
  ["Me, him, her, us, and them get the action.", "*Me, him, her, us, them*: getting it.", {"e": ["🏀", "➡️", "🧍🏾"]}],
  ["Trick: cover up the other person. Coach called Andre and me. Coach called me. Sounds right.", "Cover the other person. *Coach called me.*", {"sent": "Coach/n called/v me/p and/c Andre/n ./x", "hi": "p"}],
  ["Andre and me went to practice? Cover Andre. Me went to practice. Nope. Andre and I.", "*Me went*? Nope. *Andre and I.*", {"big": ["Me went ✗", "I went ✓"]}]),
 "explore": swap(("[___] went to practice with Andre.", [["I", "I went to practice. I is doing the action. That fits."], ["Me", "Me went to practice? Me gets the action, it doesn't do it. Doesn't fit."], ["Myself", "Myself went? Myself only works when you did something to yourself. Doesn't fit."]]),
                 ("Coach gave the ball to [___].", [["me", "Coach gave the ball to me. Me gets the action. That fits."], ["I", "Gave the ball to I? I does the action, it doesn't get it. Doesn't fit."]]),
                 ("Jaylen and [___] won the game.", [["she", "Jaylen and she won. Cover Jaylen: she won. That fits."], ["her", "Cover Jaylen: her won? Doesn't fit."]])),
 "words": [[["Pro", "noun"], ["in place of", "noun"], "Pro means in place of. A pronoun goes in place of a noun.", "Takes a noun's place."]],
 "beat": ["Marcus scored, he celebrated, see,", "Pronoun takes the place so you don't repeat me,", "I, he, she, we, they, doing the play,", "Me, him, her, us, them, the ball comes their way."],
 "extra": [sort("Sort them. Does it do the action, or get the action?", "*Doing* or *getting* the action?", ["Doing it (I, he...)", "Getting it (me, him...)"], [["I", "", 0], ["she", "", 0], ["they", "", 0], ["me", "", 1], ["him", "", 1], ["them", "", 1]])]},
"sv": {
 "watch": W(
  ["The subject and the verb are teammates. They have to match.", "Subject and verb have to *match*.", {"e": ["🤝🏾"]}],
  ["One player runs. Runs has an S.", "*One* player *runs*.", {"sent": "The/d player/n runs/v ./x", "hi": "v"}],
  ["Two players run. No S on the verb.", "*Two* players *run*.", {"sent": "The/d players/n run/v ./x", "hi": "v"}],
  ["It's backwards from nouns. One noun, no S. One verb, add the S.", "One player*s*? No. One run*s*. Yes.", {"big": ["1 player runs", "2 players run"]}],
  ["Sometimes words sneak in the middle. The bag of footballs is heavy. Skip the middle words.", "*Skip* the middle words.", {"sent": "The/d bag/n of/o footballs/n is/v heavy/a ./x", "hi": "n"}],
  ["What's heavy? The bag. One bag, so is.", "One *bag* → *is*.", {"sent": "The/d bag/n of/o footballs/n is/v heavy/a ./x", "hi": "v"}]),
 "explore": swap(("The team [___] every day.", [["practices", "The team practices. One team, so the verb gets an S. That fits."], ["practice", "The team practice? One team needs practices. Doesn't fit."]]),
                 ("My brothers [___] football.", [["play", "My brothers play. More than one brother, no S. That fits."], ["plays", "My brothers plays? Two or more brothers, so drop the S. Doesn't fit."]]),
                 ("The bag of footballs [___] heavy.", [["is", "The bag is heavy. Skip of footballs. One bag, is. That fits."], ["are", "The bag are? The real subject is one bag. Doesn't fit."]])),
 "words": [[["Sub", "ject"], ["under", "thrown"], "The subject is who or what the sentence is about.", "Who or what it's about."],
           [["Singu", "lar"], ["one", ""], "Singular means one.", "Just one."], [["Plur", "al"], ["more", ""], "Plural means more than one.", "More than one."]],
 "beat": ["One player runs, two players run,", "Subject and the verb, they match as one,", "Bag of footballs? Skip the middle part,", "One bag is heavy, play it smart."],
 "extra": [sort("Sort them. Does the verb go with one player, or two players?", "*One* player or *two* players?", ["One player...", "Two players..."], [["runs", "", 0], ["shoots", "", 0], ["is", "", 0], ["run", "", 1], ["shoot", "", 1], ["are", "", 1]])]},
"cs": {
 "watch": W(
  ["A complete sentence needs three things. A subject, a verb, and a complete thought.", "Subject + verb + *complete thought*.", {"e": ["🧍🏾", "🏃🏾", "💭"]}],
  ["The ball went in. Complete. You know what happened.", "*The ball went in.* Complete.", {"sent": "The/d ball/n went/v in/r ./x", "hi": "v"}],
  ["A fragment is only a piece. Because the game ran late. Then what? It leaves you hanging.", "*Fragment*: only a piece.", {"sent": "Because/c the/d game/n ran/v late/r ./x", "hi": "c"}],
  ["Fix it by finishing the thought. Because the game ran late, we got home at midnight.", "Finish the thought.", {"e": ["🧩", "➕", "🧩"]}],
  ["A run-on smashes two sentences together with nothing between them.", "*Run-on*: two sentences smashed.", {"e": ["💥"]}],
  ["Fix a run-on with a period, or a comma plus and, but, or so.", "Fix with a *period* or *, so*.", {"sent": "We/p won/v ,/x so/c we/p celebrated/v ./x", "hi": "c"}]),
 "explore": swap(("We won the [___] celebrated all night.", [["game, so we", "We won the game, so we celebrated. A comma plus so joins them. That works."], ["game. We", "We won the game. We celebrated. Two sentences with a period. That works too."], ["game we", "We won the game we celebrated. That's a run-on. Doesn't work."]]),
                 ("[___]", [["Because the game ran late.", "Because the game ran late. Then what? That's a fragment."], ["Because the game ran late, we got home at midnight.", "Now the thought is finished. That's a complete sentence."]])),
 "words": [[["Frag", "ment"], ["broken", "piece"], "A fragment is a broken piece of a sentence.", "A broken piece."],
           [["Run", "-on"], ["", ""], "A run-on runs two sentences together without stopping.", "Two sentences smashed together."]],
 "beat": ["Subject, verb, and a thought that's done,", "The ball went in, that's a complete one,", "Because the game ran late, then what, I'm stuck,", "Smash two together? Run-on, bad luck."],
 "extra": [sort("Sort them. Complete sentence, or fragment?", "*Complete* or *fragment*?", ["Complete sentence", "Fragment"], [["The ball went in.", "✅", 0], ["God is good.", "✅", 0], ["We ran.", "✅", 0], ["Because the ball went in.", "🧩", 1], ["After the final buzzer.", "🧩", 1], ["Running down the court.", "🧩", 1]])]},
"cm": {
 "watch": W(
  ["A comma is a quick pause. Like a short breath, or a hand-off.", "A comma = a *short pause*.", {"e": ["⏸️", "🫁"]}],
  ["Rule one. Lists. We need cones, balls, and water.", "Rule 1: *lists*.", {"sent": "We/p need/v cones/n ,/x balls/n ,/x and/c water/n ./x", "hi": "n"}],
  ["Rule two. After a starter phrase. After the game, we ate.", "Rule 2: after a *starter*.", {"sent": "After/o the/d game/n ,/x we/p ate/v ./x", "hi": "x"}],
  ["Rule three. Before and, but, or so, when they join two sentences. I was tired, but I finished.", "Rule 3: before *and, but, so*.", {"sent": "I/p was/v tired/a ,/x but/c I/p finished/v ./x", "hi": "c"}],
  ["Read it out loud. If you pause, you probably need a comma.", "Read it out loud. *Pause* = comma.", {"e": ["🗣️", "⏸️"]}]),
 "explore": swap(("We bought [___] a helmet.", [["cleats, socks, and", "We bought cleats, socks, and a helmet. Commas between the list items. That's it."], ["cleats socks and", "No commas, so the list runs together. Add commas."]]),
                 ("After [___] went to church.", [["practice, we", "After practice, we went to church. Comma after the starter. That's it."], ["practice we", "No pause after the starter. Add a comma after practice."]]),
                 ("The game was [___] we won.", [["close, but", "The game was close, but we won. Comma before but. That's it."], ["close but", "Two sentences joined by but need a comma before it."]])),
 "words": [[["Com", "ma"], ["piece", "cut off"], "Comma comes from a Greek word for a piece cut off. It cuts the sentence into pieces with a pause.", "A short pause."]],
 "beat": ["Cones, balls, and water, list it with a comma,", "After the game, pause, no need for drama,", "I was tired, comma, but I finished strong,", "Read it out loud, the pause won't steer you wrong."],
 "extra": [seq("Put the sentence together in order. Tap them one by one.", "Build the *sentence*.", [["After the game,", "🏁"], ["we", "🧍🏾"], ["ate", "🍕"], ["pizza.", "🍕"]])]},
"sa": {
 "watch": W(
  ["Some words sound exactly the same, but mean different things. Your ears can't help here, so use a trick.", "Same sound, *different word*.", {"e": ["👂🏾", "🤔"]}],
  ["There. A place. There has here inside it.", "*There*: a place. Has *here* in it.", {"big": ["t-HERE", "over there"]}],
  ["Their. It belongs to them. Their has I inside, a person.", "*Their*: belongs to them.", {"big": ["the-I-r", "their ball"]}],
  ["They're. They are. The apostrophe is a squished letter.", "*They're* = they are.", {"big": ["they're = they are"]}],
  ["Your means it belongs to you. You're means you are.", "*Your* ball. *You're* = you are.", {"big": ["your game", "you're ready"]}],
  ["It's means it is. Its means belonging to it.", "*It's* = it is.", {"big": ["it's = it is", "its helmet"]}],
  ["Two is the number. Too means also, or very. To is everything else.", "*two* = 2. *too* = also. *to* = the rest.", {"big": ["two = 2", "too = also", "to"]}],
  ["Trick: say the long version. They are going? Then it's they're.", "Say the *long version*.", {"e": ["🔁"]}]),
 "explore": swap(("[___] going to the game.", [["They're", "They are going to the game. They're means they are. That fits."], ["Their", "Their means belonging to them. Their going? Doesn't fit."], ["There", "There is a place. There going? Doesn't fit."]]),
                 ("Put the ball over [___].", [["there", "Over there. A place. That fits."], ["their", "Over their? Their means belonging to them. Doesn't fit."], ["they're", "Over they are? Doesn't fit."]]),
                 ("[___] ready for the game.", [["You're", "You are ready. You're means you are. That fits."], ["Your", "Your means belonging to you. Your ready? Doesn't fit."]])),
 "words": [[["Homo", "phone"], ["same", "sound"], "Homo means same. Phone means sound. Homophones are words with the same sound.", "Same sound, different word."],
           [["A", "postrophe"], ["", ""], "An apostrophe is the little mark that shows a letter got squished out. They are becomes they're.", "Marks squished letters."]],
 "beat": ["There is a place, their means it's theirs,", "They're is they are, now you know the pairs,", "Your is yours, you're means you are,", "It's means it is, keep it up, star."],
 "extra": [match("Match each word to what it means.", "Match the *word* to its *meaning*.", [["they're", "", "they are"], ["their", "", "belongs to them"], ["there", "", "a place"], ["you're", "", "you are"]])]},
"vt": {
 "watch": W(
  ["Verbs tell time. Like a game clock.", "Verbs tell *time*.", {"e": ["⏱️"]}],
  ["Yesterday I played. That's the past.", "Past: *played*.", {"sent": "Yesterday/r I/p played/v ./x", "hi": "v"}],
  ["Today I play. That's the present.", "Present: *play*.", {"sent": "Today/r I/p play/v ./x", "hi": "v"}],
  ["Tomorrow I will play. That's the future.", "Future: *will play*.", {"sent": "Tomorrow/r I/p will/v play/v ./x", "hi": "v"}],
  ["Some verbs change completely in the past. Run, ran. Throw, threw. Write, wrote.", "*Irregular*: run → ran.", {"big": ["run → ran", "throw → threw", "write → wrote"]}],
  ["Stay in one time. David picked a stone and threw it. Both in the past.", "Stay in *one time*.", {"sent": "David/n picked/v a/d stone/n and/c threw/v it/p ./x", "hi": "v"}]),
 "explore": swap(("Yesterday, we [___] the game.", [["won", "Yesterday, we won. Past time, past verb. That fits."], ["win", "Yesterday, we win? Yesterday is the past. Use won."], ["will win", "Yesterday, we will win? That's the future. Doesn't fit."]]),
                 ("Tomorrow, the team [___] at home.", [["will play", "Tomorrow, the team will play. Future. That fits."], ["played", "Tomorrow, the team played? Played is the past. Doesn't fit."]]),
                 ("He [___] a long pass.", [["threw", "He threw a long pass. Throw becomes threw. That fits."], ["throwed", "Throwed isn't a word. Throw changes to threw."]])),
 "words": [[["Tense"], ["time"], "Tense comes from the word for time. A verb's tense tells when it happens.", "When it happens."],
           [["Ir", "regular"], ["not", "following the rule"], "Ir means not. Irregular verbs don't follow the add E D rule. Run becomes ran.", "Doesn't follow the rule."]],
 "beat": ["Yesterday I played, today I play,", "Tomorrow I will, that's the future way,", "Run turned to ran, threw not throwed,", "Stay in one time, keep it in the zone."],
 "extra": [sort("Sort the verbs. Past, or future?", "*Past* or *future*?", ["Past (already happened)", "Future (going to happen)"], [["won", "⏪", 0], ["threw", "⏪", 0], ["prayed", "⏪", 0], ["will win", "⏩", 1], ["will throw", "⏩", 1], ["will pray", "⏩", 1]])]},
}
