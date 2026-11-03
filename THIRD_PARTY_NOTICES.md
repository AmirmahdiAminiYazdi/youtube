# Third-party notices

This repository includes the following agent skills, copied unmodified from their upstream repositories. Each license text is in `third_party_licenses/`. The first block is MIT; the second block (added 2026-11-03 with the motion toolbox) lists other licenses explicitly.

| Location in this repo | Upstream | Copyright | License text |
|---|---|---|---|
| `.claude/skills/youtube/` (folder renamed from `skills/claude-youtube`) | https://github.com/AgriciDaniel/claude-youtube | (c) 2025 Daniel Agrici | `third_party_licenses/claude-youtube-LICENSE` |
| `.claude/skills/yt-*/` | https://github.com/Jakeschincariol/youtube-agent-skill | (c) 2026 Jake Schincariol | `third_party_licenses/youtube-agent-skill-LICENSE` |
| `.claude/skills/video-thumbnail/` | https://github.com/aabrole/claude-video-thumbnail-skill | (c) 2026 aabrole | `third_party_licenses/claude-video-thumbnail-skill-LICENSE` |
| `.claude/skills/humanizer/` (SKILL.md only) | https://github.com/blader/humanizer | (c) 2025 Siqi Chen | `third_party_licenses/humanizer-LICENSE` |
| `.claude/skills/prompt-master/` (SKILL.md only) | https://github.com/nidhinjs/prompt-master | (c) 2026 Nidhin Joseph Nelson | `third_party_licenses/prompt-master-LICENSE` |
| `.claude/skills/gsap-*/` | https://github.com/greensock/gsap-skills | (c) 2026 GreenSock | `third_party_licenses/gsap-skills-LICENSE` |

| Location in this repo | Upstream (pinned commit) | License | License text |
|---|---|---|---|
| `.claude/skills/threejs-*/` (13) | https://github.com/CloudAI-X/threejs-skills (`0e18186`) | MIT, (c) 2026 CloudAI-X | `third_party_licenses/threejs-skills-LICENSE` |
| `.claude/skills/` motion pack: `animated-chart`, `apple-launch-film`, `brand-intake`, `launch-video`, `loop-cover`, `milestone-reveal`, `model-showdown`, `motion-brief-writer`, `motion-effects`, `motion-prompt-writer`, `newsletter-promo`, `reel-export`, `reference-to-motion`, `title-sequence-3d`, `vox-explainer` (15) | https://github.com/charlie947/motion-graphics-skills (`229022e`) | MIT, (c) 2026 Charlie Hills | `third_party_licenses/motion-graphics-skills-LICENSE` |
| `.claude/skills/` ElevenLabs: `agents`, `dubbing`, `music`, `onboarding`, `realtime`, `setup-api-key`, `sound-effects`, `speech-engine`, `speech-to-text`, `text-to-speech`, `voice-changer`, `voice-isolator` (12; upstream `evals/`, `mcp.json` and logo not copied) | https://github.com/elevenlabs/skills (`503d4e9`) | MIT, (c) 2024 ElevenLabs | `third_party_licenses/elevenlabs-skills-LICENSE` |
| `.claude/skills/21st-ui/` | https://github.com/21st-dev/magic-mcp (`6b5299e`) | ISC, (c) 2026 21st.dev | `third_party_licenses/magic-mcp-LICENSE` |
| `.claude/skills/{canvas-design,algorithmic-art,slack-gif-creator,theme-factory}/` (each keeps its own `LICENSE.txt`; `canvas-design/canvas-fonts` carries its fonts' own licenses) | https://github.com/anthropics/skills (`ca45fc4`) | Apache-2.0 | `third_party_licenses/anthropics-skills-design-APACHE-2.0-LICENSE` |
| `.claude/skills/{hyperframes,hyperframes-cli,hyperframes-registry,media-use}/` | https://github.com/heygen-com/hyperframes (`b2acef5`) | Apache-2.0 | `third_party_licenses/hyperframes-APACHE-2.0-LICENSE` |

Deliberately not redistributed (fetched by `scripts/setup.sh` at a pinned commit and git-ignored instead): `remotion-dev/skills` (no license file upstream; Remotion itself has a company license, see `/remotion-license`), and the source of shadcn/ui (MIT), magicui (MIT), motion-primitives (MIT) and react-bits (MIT + Commons Clause, which forbids redistributing the components). Not copied: Anthropic's `docx`, `pdf`, `pptx` and `xlsx` skills, whose license does not allow redistribution.

Libraries in `tools/` (three, animejs, motion, react, react-three-fiber, drei, lottie-web, gsap, tone, wavesurfer.js, remotion, motion-canvas, revideo, manim, faster-whisper, shadcn CLI and their dependencies) are installed from npm and PyPI under their own licenses; only the lock files are in this repo. The MCP servers for Blender, After Effects and 21st.dev are not included; `tools/mcp/` has configs only.

Provenance: the `yt-*` skills were verified identical to upstream commit `a2feb21` (2026-09-16, "The YouTube agent skill: eleven skills, six tools") on 2026-11-03. To update them later, re-clone upstream and compare before copying, and re-read the scripts first.

The GSAP animation library itself is licensed separately by GreenSock and is installed from npm, not included here. Check https://gsap.com/licensing/ before using it in published work.

`channel/templates-reference/` contains the channel templates shipped with the claude-youtube skill, under the same MIT license. `channel/voice.md` is the voice-profile template from youtube-agent-skill, also MIT.

`channel/brand/Brainmaxx-Brand-Pack/06-Fonts/` contains Outfit Bold and Regular (https://github.com/Outfitio/Outfit-Fonts), (c) 2021 The Outfit Project Authors, SIL Open Font License 1.1. License text: `third_party_licenses/outfit-font-OFL-1.1.txt`. The font may be redistributed with the license, but not sold by itself. The rest of the pack (logo, wordmark, banner) is the owner's own brand, generated with AI tools; no trademark clearance has been done.
