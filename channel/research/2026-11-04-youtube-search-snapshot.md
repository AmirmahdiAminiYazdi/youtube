# YouTube search snapshot, 2026-11-04

Read by Claude in the owner's Chrome (German YouTube UI, logged-in account, so results may be personalized). Three searches: "ai tips for beginners shorts", "psychology trick shorts", "study tips learn faster shorts". Sponsored results ignored.

## How to read this

- Results are ordered by YouTube's relevance, not by growth. View counts are lifetime views.
- Shorts show no upload date, so a big number may be years old. Long videos show their age.
- Not a velocity ranking: no multiple over each channel's own median (that needs `yt-viral` with 4+ videos per channel, and YouTube is blocked in the cloud container).
- Three queries is a small sample. Treat it as a pointer, not proof.

## Mind Hacks (psychology)

| Short, as shown | Views |
|---|---|
| "This Reverse Psychology Trick Actually Worked" | 18M |
| "Dangerous Psychology Tricks" | 10M |
| "10 Psychology Tricks That Make You Difficult to Manipulate" | 6.5M |
| "6 easy psycho tricks" (manipulation, dark psychology tags) | 3.2M |
| "Psychological basic trick" (manipulation tag) | 1.1M |
| "3 Psychology Tricks to Read People Instantly" | 137,855 |
| "4 Psychology Tricks That Make People Respect You" | 64,193 |
| New, same formula, small channels | 690 to 15,616 |

Pattern: number + "psychology tricks" + manipulation or reading people. The defensive version ("difficult to manipulate") also reached millions. Channel rule stays: no "control people" framing, no diagnosing.

## Learn Faster

| Short, as shown | Views |
|---|---|
| "How to study for exam in 2 days" | 8.5M |
| "Study tips straight A students never told you!" | 5.3M |
| "LEARN so fast it feels ILLEGAL (read comments)" | 1.6M |
| "99% Don't Know This Cross Multiplication Trick" (new) | 61,853 |
| "Stop Forgetting What You Study!" (new, tiny channel) | 4 |

Long videos on the same theme: 7.4M, 4.6M and 4.1M views (1 to 2 years old). One of them lists "Stop Re-reading, Start Testing" as a chapter, so idea #9 has an audience.

Pattern: "nobody told you" and "feels like cheating" framing, exam urgency. Keep the framing, drop hype words and unsourced claims (see `channel/voice.md`).

## AI in 60 (AI for beginners)

- Beginner-AI Shorts that match our titles were tiny (5 to 53 views). "22 ChatGPT Secrets Nobody Tells You" had about 11k.
- The big Shorts are about making Shorts with AI or making money with AI (1.2M to 2M): a creator audience, not beginners.
- Claude-for-video tutorials (editing with Claude, motion graphics with Claude) got 80k to 920k views in the last 1 to 2 months, again for creators.
- Weak evidence for "AI for beginners" as a Shorts niche in this sample. Not enough to drop the series.

## Hook options for idea #9 "Stop Rereading"

Scored with `.claude/skills/yt-script/hookscore.py`. It is a rough pattern heuristic: 55 and above is WORKABLE, 72 and above is STRONG. The current draft in `channel/ideas/first-12-ideas.md` scored 52.

| Score | Hook | Formula |
|---|---|---|
| 68 | Why does rereading your notes feel like studying, but fail you on test day? Researchers compared 10 study methods. | The Question |
| 61 | Your test is coming. Why does rereading your notes feel like studying but fail you? Stop doing it. | The Mistake |
| 60 | Before test day, stop rereading your notes. Researchers compared 10 study methods and rated rereading low. | The Mistake |
| 59 | You reread your notes and it feels like studying. Why does it fail you on test day? Stop doing it. | The Mistake |
| 58 | Why does rereading your notes feel like studying, but fail you on test day? Stop doing it. | The Mistake |

Six first-round attempts (for example "Rereading feels like studying. It isn't. Do this instead.") scored 34 to 52 and are dropped. Not yet chosen by the owner.

Source check for "10 study methods": Dunlosky, Rawson, Marsh, Nathan and Willingham, Psychological Science in the Public Interest, January 2013, reviewed ten learning techniques. Practice testing and distributed practice were rated high utility, rereading low (APS press release, https://www.psychologicalscience.org/news/releases/which-study-strategies-make-the-grade.html). Read the paper itself before recording; this check used the press release.
