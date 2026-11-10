<div dir="rtl" align="right">

# بسته‌ی آپلود: «ترمز دوچرخه» (`special-bicycle-brakes`، Short، فرمت Built Step by Step)

status: ready (not published). انتشار با خود توست.

فایل برای آپلود: `special-bicycle-brakes-v2-8mbps.mp4` (همان که در چت فرستادم): ۶۰٫۲ ثانیه، ۱۰۸۰×۱۹۲۰، ۶۱٫۶ مگابایت، −۱۴٫۷ LUFS، از `scripts/check_short.py` با ۰ خطا و ۰ هشدار رد شد. نسخه‌ی مستر (۱۳۶ مگابایت) در `channel/motion/special-bicycle-brakes/renders/` است و در گیت نیست؛ برای YouTube همین نسخه‌ی ۸ مگابیتی کافی است.

بسته با `youtube/metadata`، `yt-seo` و `yt-package` ساخته شد و `title.py` عنوان‌ها را سنجید. متن‌های انگلیسی داخل کادرها را عیناً کپی کن.

## ۱. یافته‌های جست‌وجو (2026-11-10، خودکارتکمیل YouTube و نتایج Shorts)

از Claude in Chrome روی خود YouTube نگاه کردم (رابط آلمانی). نمونه‌ی کوچک و فقط یک روز است، پس راهنماست، نه آمار.

- **خودکارتکمیل:** «how bike brakes work»، «how do bike brakes work»، «how disc brakes work»، «how hydraulic brakes work on a bike»، «disc brake vs rim brake» همگی پیشنهاد می‌شوند. یعنی «how bike brakes work» عبارتی است که واقعاً تایپ می‌شود.
- **رقبا (Shorts برای «how bike brakes work»):** بازار شلوغ و پراکنده است. چند ویدیوی خیلی بزرگ هست («Evolution of Bike Brakes!» ۷٫۸ میلیون، «Disc Brakes Explained» ۵٫۳ میلیون، «How do disc brakes work?» ۲ میلیون) و بقیه از چند صد تا چند ده هزار بازدید دارند، از جمله چند انیمیشن سه‌بعدی هیدرولیک (حدود ۵ تا ۲۶ هزار). همه‌شان یک قطعه را توضیح می‌دهند.
- **چیزی که ما داریم و آن‌ها ندارند:** یک زنجیره‌ی کامل از مشکل به قطعه (کفش ← ترمز رینگی ← کابل ← دیسک ← هیدرولیک ← روتور بزرگ‌تر) و هوک عددی (۸۰ کیلو، ۳۲ کیلومتر بر ساعت، شیب ۸٪، ۵۶۰ وات). عنوان و توضیحات همین دو را جفت می‌کنند.

## ۲. عنوان

طبق playbook: Shorts چهار تا شش کلمه یا ۲۰ تا ۴۰ نویسه، کلیدواژه اول. `title.py` نتیجه داد:

| نوع | عنوان | نویسه | امتیاز |
|---|---|---|---|
| ترکیبی (پیشنهادی) | `How Bike Brakes Work, Built Step by Step` | ۴۰ | ۹۰ |
| کنجکاوی + عدد | `No Brakes on an 8% Hill: How Bikes Stop` | ۳۹ | ۱۰۰ |
| جست‌وجو | `How Bike Brakes Work in 60 Seconds` | ۳۴ | ۱۰۰ |

پیشنهاد: ترکیبی. عبارت خودکارتکمیل‌شده‌ی «How Bike Brakes Work» اول می‌آید و «Built Step by Step» اسم فرمت است، یعنی شاید بعداً بیننده را به ویدیوهای بعدی همین فرمت وصل کند. تنها هشدار `title.py` «عدد ندارد» است و عدد در فریم اول ویدیو می‌آید. گزینه‌ی عدد‌دار (دومی) را نگه دار اگر می‌خواهی عنوان هم همان تعجب هوک را بسازد. «in 60 Seconds» را پیشنهاد نمی‌کنم: ویدیو ۶۰٫۲ ثانیه است و وعده‌ای است که کمی نادقیق می‌شود.

```
How Bike Brakes Work, Built Step by Step
```

سه جست‌وجویی که باید ببرد: «how bike brakes work»، «how disc brakes work»، «disc brake vs rim brake».

## ۳. توضیحات

خط اول ۱۲۷ نویسه است (دو نویسه بعد از ۱۲۵؛ «how bike brakes work» در ابتدا می‌ماند) و «how bike brakes work» در آن هست؛ خط دوم عدد هوک را می‌گوید. کلیدواژه‌ها ۲ تا ۴ بار می‌آیند. ساده‌سازی‌های برگه‌ی حقایق (`channel/research/special-bicycle-brakes.facts.md`) و جمله‌ی «۵۶۰ وات یک سناریوی نمونه است» در متن هستند.

```
How bike brakes work, built step by step: from your shoes to a rim brake, cable, disc brake, hydraulic line and a bigger rotor.

Example: an 80 kg rider on an 8% hill at about 32 km/h has roughly 560 W of braking power to shed.

The steps in the video:
1. Rim brake: a rubber pad presses on the wheel rim and friction turns speed into heat.
2. Lever and cable: a cable runs from the handlebar lever to the pad.
3. Disc brake: pads squeeze a rotor on the hub, away from wet rims.
4. Hydraulic line: fluid in a sealed hose replaces the stretchy, dragging cable.
5. Bigger rotor: a larger rotor sheds heat better on long descents.

Simplified on purpose: it shows one path from shoes to a modern disc brake, not the real history of the invention. Mechanical (cable) disc brakes exist too, and a bigger rotor is only one way to fight heat. Wet rims brake worse, which is not the same as disc brakes being perfect in the rain. The 560 W figure is an example rider and slope. Real braking power is lower because of air drag and rolling resistance.

This is not a repair guide. Follow your brake manufacturer's instructions for setup and maintenance.

Narration is an AI-generated voice. The 3D animation was made by Brainmaxx.

Sources: BikeRadar, "Bike brakes explained"; Explain that Stuff, "Brakes"; Cyclingnews, "Disc brakes vs rim brakes"; Ribble Cycles, "Disc brake vs rim brake"; Velo, "Hydraulic vs mechanical disc brakes"; BikeRadar, "Trail Tech: Disc brake rotor size"; Competitive Cyclist, "How to choose brake rotor size"; MDPI Proceedings (2020), "Bicycle Disc Brake Thermal Performance".

Brainmaxx: Think better. Learn faster.

#BikeBrakes #DiscBrakes #HowItWorks #Engineering
```

هشتگ‌ها ۴۸ نویسه‌اند (سقف Shorts در playbook ۶۰). سه‌تای اول بالای عنوان دیده می‌شوند.

**تأیید ادعاها:** هر ادعا در برگه‌ی حقایق حداقل دو منبع دارد (2026-11-10)، همه از خلاصه‌ی صفحه، نه متن کامل مقاله. عدد ۵۶۰ وات هم از مقاله‌ی MDPI (۵۵۹ وات) و هم از محاسبه‌ی خودمان درمی‌آید: P = m·g·v·sin θ = ۵۵۹٫۵ وات، و حداکثر است چون مقاومت هوا و غلتش را نادیده می‌گیرد. **لینک منبع‌ها** را در این بسته نگذاشتم چون نشانی‌های دقیق در برگه‌ی حقایق ذخیره نشده بود و از خودم نمی‌سازم. اگر می‌خواهی لینک‌ها در توضیحات باشند، بگو تا از روی عنوان‌ها دوباره پیدا و بررسی کنم.

### زیرنویس (SRT)

`channel/published/special-bicycle-brakes.en.srt` را از زمان‌بندی کلمات خود راوی ساختم (۳۱ خط، هر جمله یک خط یا دو نیمه). متن همان چیزی است که شنیده می‌شود، با «80» و «8%» به‌صورت رقم. در Studio: Subtitles → Add language → English → Upload file → «With timing».

### تگ‌ها (۱۵ تا)

تگ‌ها در playbook «تقریباً بی‌اثر»اند؛ فقط عبارت‌های جست‌وجوشونده و املاهای مختلف.

```
how bike brakes work, how do bike brakes work, how disc brakes work, how hydraulic brakes work on a bike, disc brake vs rim brake, rim brake, disc brake, hydraulic disc brake, bike brakes explained, bicycle brakes, brake rotor, brake fade, how things work, 3D animation, Brainmaxx
```

## ۴. کامنت سنجاق‌شده

بعد از انتشار از حساب خودت بنویس و سنجاق کن. سؤال با سه جواب ساده است و جواب‌دادنش یک ثانیه طول می‌کشد.

```
Which brakes are on your bike: rim, cable disc or hydraulic disc?
```

پاسخ‌های آماده (فقط اگر کسی واقعاً همین را پرسید):

```
Is this how brakes were really invented?
Not exactly. I simplified it into one path from shoes to a modern disc brake. The real history has more branches, like drum and coaster brakes.

Is 560 watts real?
It's an example: an 80 kg rider on an 8% slope at about 32 km/h. Real braking power is lower because of air drag and rolling resistance.

Are cable disc brakes bad?
No. Mechanical disc brakes work fine and are simpler to service. The video shows why many people move to hydraulic.
```

اگر کسی اشتباهی را درست اصلاح کرد، ساده تأیید کن و تشکر کن. به بیت‌ها پاسخ نده.

## ۵. تنظیمات Studio

۱. **Audience:** «No, it's not made for kids».

۲. **Altered or synthetic content: «Yes».** راوی یک صدای واقع‌نمای مصنوعی است (ElevenLabs، Eleven v4)؛ YouTube خودش «generating a person's voice to narrate a video» را مثال افشا می‌آورد. تصویر انیمیشن آشکار است و معاف. جمله‌ی «Narration is an AI-generated voice.» در توضیحات با آن می‌خواند. اگر Studio گزینه‌ی جداگانه‌ای برای صدای مصنوعی داشت، همان را انتخاب کن.

۳. **Paid promotion:** نه. **Language:** English. **Category:** Education. **Comments:** روشن.

۴. **کاور:** فریم ثانیه‌ی ۰٫۰ (۸۰ KG سه‌بعدی روی جاده‌ی شیب‌دار). در Shorts فید خودکار پخش می‌شود و کاور کم‌اثر است؛ تامبنیل دلخواه هنوز به تاییدیه‌ی شماره‌تلفن کانال نیاز دارد (در `STATUS.md` ثبت است).

۵. **Visibility:** Public. ساعت پیشنهادی ۱۶:۰۰ تا ۱۸:۰۰ برلین (حدس منطقی، نه آمار؛ برای کانال تازه داده‌ای نداریم). ترتیب نسبت به #9 و بقیه با توست؛ این ویدیو در تقویم دوازده‌تایی نیست.

۶. **Checks:** صدا فقط راوی و افکت‌هایی است که در کد ساختیم؛ موسیقی ثبت‌شده ندارد. مشکل کپی‌رایت انتظار نمی‌رود.

۷. **پلی‌لیست (اختیاری):** اگر «Everyday Things Explained» سری رسمی شد، پلی‌لیستی با همین اسم بساز؛ تا آن موقع ویدیو را بدون پلی‌لیست منتشر کن.

```
Title: Everyday Things Explained
Description: How everyday things work, built part by part in 3D. One thing per video. Think better. Learn faster. Brainmaxx.
```

## ۶. کپشن برای TikTok و Instagram Reels

همان فایل بدون واترمارک، چند ساعت بعد از YouTube. کارت پایانی دکمه‌ی «Subscribe» دارد که مخصوص YouTube است و روی TikTok و Reels کار نمی‌کند ولی مانعی برای پست نیست؛ «Save» روی هر دو کار می‌کند. هر دو پلتفرم برچسب محتوای تولیدشده با هوش مصنوعی دارند؛ هنگام آپلود اگر گزینه‌اش آمد و صدا را می‌پوشاند، روشنش کن (قانون دقیقشان را بررسی نکرده‌ام).

```
TikTok:
80 kg. 32 km/h. An 8% hill. No brakes. Watch the brake get built, one problem at a time. Save this for your next big hill. #bikebrakes #discbrakes #howitworks
```

```
Instagram Reels:
80 kg. 32 km/h. An 8% hill. Your bike has no brakes.
Rim brake, cable, disc brake, hydraulic line, bigger rotor: each one fixes the last one's problem.
Save this for your next big hill.
#bikebrakes #discbrakes #howitworks #cycling #brainmaxx
```

## ۷. بعد از انتشار و معیار تست

- ساعت‌های اول: کامنت را سنجاق کن، به هر پرسش واقعی پاسخ بده.
- پیش از قضاوت ۴۸ تا ۹۶ ساعت صبر کن.
- در Studio، تب Analytics → Engagement: «Viewed vs Swiped Away» (زیر ۵۰٪ هوک ضعیف است، ۷۵٪ به بالا خوب)، «Average percentage viewed» (بالای ۱۰۰٪ یعنی بیننده‌ها دوباره تماشا می‌کنند) و کامنت‌ها و ذخیره‌ها. آستانه‌ها تقریبی‌اند و برای کانال تازه نمونه‌ی کوچک است.
- مقایسه برای فرمت: ویدیوی هواپیما با میانگین مدت تماشای ۷۰٫۵٪ بهترین از چهار Short اول بود. حکم درباره‌ی فرمت Built Step by Step بعد از ۵ تا ۸ موضوع داده می‌شود، نه با این یک ویدیو.
- اگر Viewed vs Swiped Away زیر ۶۰٪ بود، اول هوک و ثانیه‌های اول را عوض می‌کنیم، نه کل قالب.
- ۴۸ ساعت بعد، منحنی را با `yt-retention` بخوان.

## ۸. سؤال‌های باز

- «Everyday Things Explained» سری رسمی چهارم می‌شود یا نه (برای شماره‌ی ایده و اسم فایل؛ فعلاً `special-`).
- لینک منبع‌ها در توضیحات می‌خواهی؟

</div>
