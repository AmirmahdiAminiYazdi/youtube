# youtube

Workspace for an English, faceless Shorts channel (YouTube Shorts, TikTok, Instagram Reels) built with Claude: motion graphics, scripts, thumbnails and upload packages.

Promise: "Think better and learn faster, with AI and with your own brain."
Series: **AI in 60**, **Mind Hacks**, **Learn Faster**.

Persian guide: [README.fa.md](README.fa.md)

## Start in any environment

```bash
git clone https://github.com/AmirmahdiAminiYazdi/youtube.git
cd youtube
pip install google-genai pillow yt-dlp youtube-transcript-api
cp .env.example .env   # add GEMINI_API_KEY if you want thumbnail generation
claude
```

The skills live in `.claude/skills/` and are active only inside this project. Project rules are in [CLAUDE.md](CLAUDE.md).

## Where things are

| Path | What |
|---|---|
| `CLAUDE.md` | Channel concept, rules, workflow, installed skills |
| `channel/ideas/first-12-ideas.md` | Channel structure and the first 12 videos |
| `channel/voice.md` | Voice profile template (fill it in) |
| `channel/scripts`, `thumbnails`, `motion`, `voiceover`, `published`, `research` | Working folders |
| `.claude/skills/` | Installed third-party skills |
| `third_party_licenses/` | License texts of the skills |

## Third-party skills

All six skill packs are MIT licensed and used unmodified. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## Safety

Never commit `.env`. Skills can run scripts, so review any new skill before adding it.
