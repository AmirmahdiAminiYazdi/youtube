# beats.json

Saved as `channel/scripts/NN-slug.beats.json` at stage 2, copied into the project by the scaffold. Order of narration: hook, steps in order, payoff, ask. `build_timeline.py` aligns every `say` to the voiceover word times.

```jsonc
{
  "slug": "12-how-x-works",            // NN-slug (idea number) or special-slug
  "series": "AI in 60 | Mind Hacks | Learn Faster | Everyday Things Explained",
  "topic": "one sentence",
  "hook": {
    "say": "You're ... . You ... . Congratulations!",    // <= 22 words, first sentence addresses "you"
    "title_top": "ONE CRATE.",                           // frame 0 text and thumbnail, caps, <= 14 chars per line
    "title_bottom": "ONE ENGINE."
  },
  "base": { "part": "CRATE", "label": "WOODEN CRATE", "kind": "box", "tone": "steel",
            "pos": [0,0,0], "size": [2.2,0.9,0.9], "rot": [0,0,0] },
  "beats": [                                              // 5-9 steps
    {
      "say": "Problem sentence. Then the part, named late.",      // 8-24 words
      "anchor": "wings",                                          // word of `say` on which the part pops
      "part": "WING", "label": "WING",                            // label = pill text, <= 3 words, <= 22 chars
      "kind": "plate", "tone": "teal",                            // BUILDERS key in world.js; tone: teal|white|navy|steel|orange or a hex
      "pos": [0, 0.15, 0], "size": [0.9, 0.08, 4.2], "rot": [0, 0, 0],   // world units, radians
      "label_side": "left|right",                                 // optional; default: toward the screen centre
      "label_up": 0,                                              // optional extra lift of the pill
      "problem_text": "PROBLEM: NO LIFT",                         // HUD line, caps, <= 28 chars
      "analogy": "like the feathers on an arrow",                 // optional, at most 1-2 per Short
      "creates": "it nose-dives",                                 // the problem this part leaves behind
      "solves": "no lift"                                         // the problem it fixes (must match the previous step's `creates`)
    }
  ],
  "payoff": { "say": "You built an X. <small gag>.", "title": "YOU BUILT AN X.", "subtitle": "ONE PROBLEM AT A TIME" },
  "ask": { "say": "Save this for the next time ..." },           // the only ask in the Short
  "original_element": "one sentence: what only this video has",
  "sources": [ { "claim": "...", "source": "title, publisher, URL, date checked" } ],  // required if any digit is narrated
  "emphasis": ["wings", "fin"]                                   // words that stay teal in the captions
}
```

Alignment: tokens are compared case-insensitively without punctuation; number words and digits are treated alike (ten = 10). If less than 85 % of the script words are found in the take, `build_timeline.py` warns: fix the script text or ask for a new take before trusting times.

Last-step rule: the final step's `creates` may be empty; the payoff names the finished thing.
