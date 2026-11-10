<div dir="rtl" align="right">

# اسکریپت: ترمز دوچرخه (`special-bicycle-brakes`)

status: draft، منتظر تأیید تو (Gate A). فایل ماشینی: `channel/scripts/special-bicycle-brakes.beats.json`. برگه‌ی حقایق: `channel/research/special-bicycle-brakes.facts.md`.

سنجش (نسخه‌ی هوک عددی): `script_budget.py` ← ۰ خطا، ۱۵۱ کلمه، حدود ۵۷ ثانیه، ۵ قدم، زنجیره‌ی مشکل ← قطعه کامل. هوک: «Eighty kilos. Thirty-two kilometers per hour. Just an eight percent hill. And your bike has no brakes. Congratulations!» (۱۹ کلمه؛ hookscore فقط ۳۷ می‌دهد چون هوک سناریویی را کم‌امتیاز می‌دهد، با خواندن قضاوت کن).

## هوک عددی و غافلگیری (۲۰۲۶-۱۱-۱۰)

عددها از سناریوی خودِ مقاله‌ی علمی MDPI گرفته شده‌اند (۸۰ کیلو، شیب ۸٪، ۸٫۹۴ متر بر ثانیه = ۳۲٫۲ کیلومتر بر ساعت ← ۵۵۹ وات) و با محاسبه‌ی خودمان هم درآمد: P = m·g·v·sin θ = ۵۵۹٫۵ وات. این **حداکثر** است، چون مقاومت هوا و غلتش را نادیده می‌گیرد. در توضیحات بنویس: «Example rider and slope; real braking power is lower because of air drag and rolling resistance.»

تکنیک غافلگیری: (۱) سه عدد پشت‌سرهم قبل از جمله‌ی اصلی، با «just an eight percent hill» که شیب ملایم را خطرناک نشان می‌دهد؛ (۲) در قدم اول عدد ۵۶۰ وات می‌آید تا بیننده بفهمد مشکل «انرژی» است نه «ایستادن»؛ (۳) در پایان تلنگر: ترمز سرعت را نابود نمی‌کند، آن را به گرما تبدیل می‌کند («It turns that hill into heat»).

هوک‌های جایگزین (امتیاز hookscore فقط heuristic است):

- B (۴۴): «A hill that's just eight percent steep gives you 560 watts to burn off. Your bike has no brakes. Congratulations!»
- C (۵۲، کنجکاوی): «Your brakes don't stop you. They turn a hill into 560 watts of heat. Let's build them from nothing.»

## زنجیره

| # | مشکل (شنیده می‌شود) | قطعه (برچسب روی تصویر) | مشکل بعدی |
|---|---|---|---|
| هوک | دوچرخه‌ی بی‌ترمز بالای سرازیری | BIKE WITH NO BRAKES | کفش کشیدن جواب نمی‌دهد |
| 1 | کفش کشیدن جواب نمی‌دهد | RIM BRAKE | به چرخ نمی‌رسی |
| 2 | به چرخ نمی‌رسی | LEVER + CABLE | باران، رینگ خیس |
| 3 | باران، رینگ خیس | DISC BRAKE | کابل کش می‌آید |
| 4 | کابل کش می‌آید | HYDRAULIC LINE (تشبیه: سرنگ) | سرازیری طولانی گرم می‌شود |
| 5 | گرما ترمز را ضعیف می‌کند | BIGGER ROTOR | پایان: «You built a modern disc brake.» |

## روایت پاک (برای ثبت و زیرنویس؛ دقیقاً همین متن را هم‌تراز می‌کنیم)

```
Eighty kilos. Thirty-two kilometers per hour. Just an eight percent hill. And your bike has no brakes. Congratulations!

Holding that speed means shedding about 560 watts. Your shoes can't. So you press a rubber pad on the rim. That's a rim brake.

But you can't reach the wheel while riding. So a cable runs to a lever on your handlebar. Now squeezing stops you.

Then it rains, and wet rims brake badly. So you squeeze a disc on the hub, away from the rim. That's a disc brake.

But cables stretch and drag. So you swap the cable for fluid in a sealed hose, like a syringe. That's hydraulic.

On a long descent, heat weakens the brakes. So you fit a bigger rotor, which sheds heat better.

You built a modern disc brake. It turns that hill into heat. Your shoes can retire.

Save this for your next big hill.
```

## نسخه‌ی ElevenLabs Eleven v4 (با تگ)

طبق مستندات ElevenLabs برای v4: تگ‌ها در کروشه و قبل از جمله‌ای که اثر می‌گذارند؛ SSML و اسلایدرهای Style و Speed در v4 نیست؛ مکث با ویرگول، سه‌نقطه و ساختار متن؛ حروف بزرگ تأکید را بیشتر می‌کند (نیاز نیست). تگ‌ها را کم نگه داشتم و فقط حالت صدا هستند، بدون تگ صدای اضافه (مثل [applause]) چون جلوه‌ها را خودمان در کد می‌سازیم. گوش بده که تگ‌ها خوانده نشوند.

```
[casual, playful narration] Eighty kilos. Thirty-two kilometers per hour. Just an eight percent hill. [brief pause] And your bike has... no brakes. [dry amusement] Congratulations!

[measured] Holding that speed means shedding about 560 watts. Your shoes can't. So you press a rubber pad on the rim. That's a rim brake.

But you can't reach the wheel while riding. So a cable runs to a lever on your handlebar. Now squeezing stops you.

Then it rains, and wet rims brake badly. So you squeeze a disc on the hub, away from the rim. That's a disc brake.

But cables stretch and drag. So you swap the cable for fluid in a sealed hose, like a syringe. That's hydraulic.

[calm] On a long descent, heat weakens the brakes. So you fit a bigger rotor, which sheds heat better.

[brief pause, dry amusement] You built a modern disc brake. It turns that hill into heat. Your shoes can retire.

[warm] Save this for your next big hill.
```

## تنظیمات و گرفتن خروجی

- مدل: Eleven v4 (نه Turbo؛ Turbo برای تأخیر کم است). اگر صدای خودت PVC است، مستندات v4 را برایش توصیه می‌کند.
- صدا: همان صدای #9 تا لحن کانال ثابت بماند.
- Stability: وسط (کمتر = بیان بیشتر، بیشتر = ثابت‌تر). Speed نداریم؛ سرعت از متن می‌آید. هدف حدود ۱۶۰ کلمه در دقیقه با مکث‌ها، مثل #9. حدود ۵۰ تا ۵۵ ثانیه.
- ۲ تا ۳ تیک بگیر و بهترین را انتخاب کن؛ مراقب باشد «Congratulations!» طعنه‌دار باشد نه فریاد.
- بعد از انتخاب: mp3 را بده و فایل زمان‌بندی کلمات (Scribe، همان قالب #9) را هم؛ اگر نمی‌توانی، mp3 کافی است و من از آن زمان‌بندی را درمی‌آورم اگر Scribe در دسترس باشد؛ وگرنه export بگیر.
- اگر اسم فایل را `special-bicycle-brakes.mp3` بگذاری، مسیرش `channel/voiceover/special-bicycle-brakes.mp3` است.

## قطعه‌های سه‌بعدی (طرح اولیه، در مرحله‌ی ۵ دقیق می‌شود)

چرخ یک حلقه‌ی سه‌بعدی است (پایه). لنت = بلوک لاستیکی نیمه‌گرد روی لبه؛ اهرم + کابل = دسته‌ی کوچک روی فرمان و خط کابل؛ دیسک = حلقه‌ی نازک روی هاب با کالیپر؛ لوله‌ی هیدرولیک = لوله‌ی نارنجی (فقط این یک قطعه‌ی نارنجی، مطابق قانون جرقه)؛ روتور بزرگ‌تر = حلقه‌ی بزرگ‌تر فیروزه‌ای. تشبیه سرنگ: یک انیمیشن کوتاه پیستون و سیال داخل لوله.

## یادداشت‌های بسته‌ی آپلود (بعداً)

توضیحات باید ساده‌سازی‌های برگه‌ی حقایق را بگوید، «Narration is an AI-generated voice.» و منابع (BikeRadar، Cyclingnews، Velo) را بیاورد. تنظیم Studio: «altered content: Yes» به‌خاطر صدای مصنوعی.

</div>
