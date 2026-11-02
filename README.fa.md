<div dir="rtl" align="right">

# راهنمای فارسی پروژهٔ یوتیوب

این مخزن فضای کاری یک کانال شورت انگلیسی و بدون چهره است (یوتیوب شورتز، تیک‌تاک، اینستاگرام ریلز) که با Claude و موشن‌گرافیک ساخته می‌شود.

وعدهٔ کانال: «بهتر فکر کن و سریع‌تر یاد بگیر، با هوش مصنوعی و با مغز خودت.»

سه سری ثابت: **AI in 60** (آموزش AI برای مبتدی‌ها)، **Mind Hacks** (روان‌شناسی)، **Learn Faster** (ترفندهای یادگیری و تفکر).

## شروع در هر محیطی

</div>

```bash
git clone https://github.com/AmirmahdiAminiYazdi/youtube.git
cd youtube
pip install google-genai pillow yt-dlp youtube-transcript-api
cp .env.example .env
claude
```

<div dir="rtl" align="right">

برای ساخت تامبنیل باید در فایل `.env` کلید `GEMINI_API_KEY` را بگذاری. این فایل هرگز نباید کامیت شود.

## چه چیزی کجاست

- `CLAUDE.md`: مفهوم کانال، قوانین، روند کار و اسکیل‌های نصب‌شده.
- `channel/ideas/first-12-ideas.md`: ساختار کانال و ۱۲ ویدیوی اول.
- `channel/voice.md`: قالب پروفایل صدا (پرش کن).
- `channel/scripts`، `thumbnails`، `motion`، `voiceover`، `published`، `research`: پوشه‌های کار.
- `.claude/skills/`: اسکیل‌های نصب‌شده (فقط در همین پروژه فعال‌اند).
- `third_party_licenses/`: متن لایسنس اسکیل‌ها.

## روند کار پیشنهادی

۱. ایده را انتخاب کن (`/youtube ideate` یا `yt-plan`).
۲. اسکریپت و هوک امتیازدار را با `yt-script` بساز و با `humanizer` طبیعی کن.
۳. صدا را با ElevenLabs و موشن‌گرافیک را با HTML و GSAP یا HyperFrames بساز.
۴. عنوان، تامبنیل و توضیحات را با `yt-package` و `/youtube seo` بنویس.
۵. بستهٔ آپلود را با `yt-chapters` و `/youtube metadata` آماده کن. انتشار همیشه با خودت است.

## نکتهٔ امنیتی

اسکیل‌ها می‌توانند اسکریپت اجرا کنند. هر اسکیل جدید را قبل از افزودن بررسی کن.

</div>
