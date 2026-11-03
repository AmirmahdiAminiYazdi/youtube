<div dir="rtl" align="right">

# جعبه‌ابزار: ۲۸ ابزار موشن‌گرافیک

همه‌چیز با نسخه یا کامیت دقیق قفل شده است (فایل‌های `tools/pins.env`، `tools/motion-lab/package-lock.json` و `tools/python/requirements.lock`). روی یک کلون تازه، یک دستور هر چیزی را که لازم است نصب می‌کند:

```bash
bash scripts/setup.sh              # کتابخانه‌ها، اسکیل‌های دانلودی و سورس UI
bash scripts/setup.sh --check      # فقط گزارش می‌دهد چه چیزی نصب است
SETUP_MCP=1 bash scripts/setup.sh  # سورس MCP بلندر و افترافکت را هم می‌گیرد
```

پیش‌نیازها: git، Node نسخه ۲۲ به بالا، uv، ffmpeg و Chrome یا Chromium. برای manim روی لینوکس هم `libcairo2-dev libpango1.0-dev pkg-config`.

## «نصب» اینجا یعنی چه

- **اسکیل‌ها** جایی که لایسنس بازپخش را اجازه می‌دهد، به‌صورت فایل داخل `.claude/skills/` کامیت شده‌اند (۷۲ اسکیل).
- **کتابخانه‌ها** وابستگی واقعی‌اند (`npm ci` و `uv pip install`) و سورسشان کپی نشده است.
- **کدی که لایسنس بازپخشش را نمی‌دهد** (اسکیل‌های Remotion و سورس کامپوننت‌های UI) را `setup.sh` با کامیت ثابت از منبع اصلی می‌گیرد و در گیت نادیده گرفته می‌شود.

## وضعیت هر ابزار

«تست‌شده» یعنی روی کانتینر ابری در 2026-11-03 واقعاً اجرا شد. «فقط نصب» یعنی با نسخه‌ی ثابت نصب می‌شود ولی اینجا نشد امتحانش کرد و دلیلش نوشته شده است.

| ابزار | وضعیت |
|---|---|
| three.js 0.187.0 | تست‌شده: import و ساخت کلاس Scene |
| anime.js 4.5.0 | تست‌شده |
| motion 14.9.0 | تست‌شده |
| react-three-fiber 9.8.2 (با drei) | فقط نصب: به مرورگر و WebGL نیاز دارد، نسخه تأیید شد |
| lottie-web 5.13.0 | فقط نصب: به DOM مرورگر نیاز دارد |
| gsap 3.15.0 | تست‌شده. شرایط لایسنس را در gsap.com/licensing ببین |
| ffmpeg (نسخه 6.1.1 سیستم) | تست‌شده، در هر رندر استفاده می‌شود |
| remotion 4.0.540 | تست‌شده: یک کلیپ ۱۰۸۰×۱۹۲۰ با H.264 رندر شد (`npm run smoke:remotion`). لایسنس Remotion برای افراد و تیم‌های کوچک رایگان است و بالاتر از آن پولی؛ قبل از درآمدزایی `/remotion-license` را بخوان |
| hyperframes (نسخه 0.9.8 و ۴ اسکیل) | `doctor` با Chrome و FFmpeg موفق بود، اسکیل‌ها کامیت شده‌اند. قوانین در `CLAUDE.md` |
| manim 0.22.1 | تست‌شده: یک صحنه به MP4 رندر شد |
| motion-canvas 3.17.2 | فقط نصب: مبتنی بر Vite است، صحنه‌ای رندر نشد |
| revideo 0.11.0 | فقط نصب: مبتنی بر Vite است، صحنه‌ای رندر نشد |
| shadcn/ui | CLI نصب می‌شود. `shadcn add` به ui.shadcn.com وصل می‌شود که کانتینر ابری مسدودش کرده، پس اینجا تست نشد |
| magicui و motion-primitives | سورس با کامیت ثابت دانلود می‌شود. سایت رجیستری اینجا مسدود است |
| react-bits | سورس دانلود می‌شود. لایسنسش (MIT + Commons Clause) بازپخش کامپوننت‌ها را ممنوع می‌کند، برای همین در مخزن عمومی کامیت نشده. استفاده در ویدیو و سایت خودت آزاد است |
| magic-mcp (21st.dev) | فقط پیکربندی: به کلید API رایگان نیاز دارد، `tools/mcp/README.md` را ببین |
| whisper (faster-whisper 1.2.1) | فقط نصب: کتابخانه import می‌شود ولی مدل‌هایش از huggingface.co دانلود می‌شوند که اینجا مسدود است. روی کامپیوتر خودت در اولین استفاده مدل را می‌گیرد |
| tone.js 15.1.22 و wavesurfer.js 8.0.5 | فقط نصب: فقط در مرورگر کار می‌کنند |
| elevenlabs/skills | ۱۲ اسکیل کامیت شده. به حساب ElevenLabs و `ELEVENLABS_API_KEY` در `.env` نیاز دارد. اجرا نشد چون اعتبار مصرف می‌کند |
| anthropics/skills | کامیت‌شده: `canvas-design`، `algorithmic-art`، `slack-gif-creator` و `theme-factory` (همه Apache-2.0). عمداً کپی نشده: `docx`، `pdf`، `pptx`، `xlsx` (لایسنس Anthropic بازپخش را اجازه نمی‌دهد) |
| gsap-skills | قبلاً کامیت شده (۸ اسکیل) |
| threejs-skills | کامیت‌شده: ۱۳ اسکیل |
| motion-graphics-skills | کامیت‌شده: ۱۵ اسکیل. اول یک‌بار `brand-intake` را اجرا کن |
| remotion/skills | `setup.sh` می‌گیرد (۱۳ اسکیل)، کامیت نشده چون مخزن اصلی فایل لایسنس ندارد |
| mcp-for-blender | تنظیمات و نکات امنیتی در `tools/mcp/`. روی Blender واقعی تست نشد |
| after-effects-mcp | تنظیمات و نکات امنیتی در `tools/mcp/`. سرور build می‌شود و به handshake پاسخ می‌دهد. روی After Effects واقعی تست نشد |

## برای کدام کار کدام ابزار

- **شورت روزانه (پیش‌فرض):** HyperFrames (‏HTML و GSAP به MP4)، صدای ElevenLabs و ffmpeg.
- **صحنه‌های React یا تولید دسته‌ای از داده:** Remotion.
- **ریاضی و دیاگرام مرحله‌به‌مرحله (Learn Faster):** manim.
- **شروع سه‌بعدی:** three.js با اسکیل `title-sequence-3d`.
- **کپشن از روی voiceover:** `faster-whisper` یا دستور `transcribe` در HyperFrames.
- **کنترل خروجی عمودی:** اسکیل `reel-export`.

## به‌روزرسانی یک نسخه

مخزن اصلی را کلون کن، تغییرات بعد از نسخه‌ی قبلی را بخوان، بعد نسخه یا SHA را عوض کن، `bash scripts/setup.sh` را اجرا کن و کامیت بزن. هرگز به `@latest` برنگرد.

</div>
