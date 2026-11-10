<div dir="rtl" align="right">

# اسکریپت: ترمز دوچرخه (`special-bicycle-brakes`)

status: draft، منتظر تأیید تو (Gate A). فایل ماشینی: `channel/scripts/special-bicycle-brakes.beats.json`. برگه‌ی حقایق: `channel/research/special-bicycle-brakes.facts.md`.

سنجش: `script_budget.py` ← ۰ خطا، ۱۳۶ کلمه، حدود ۵۲ ثانیه، ۵ قدم، زنجیره‌ی مشکل ← قطعه کامل. هوک: «You're at the top of a steep hill. Your bike has no brakes. Congratulations!» (۱۴ کلمه؛ hookscore فقط ۴۳ می‌دهد چون هوک سناریویی را کم‌امتیاز می‌دهد، با خواندن قضاوت کن).

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
You're at the top of a steep hill. Your bike has no brakes. Congratulations!

Dragging your shoes is not working. So you press a rubber pad on the wheel rim. That's a rim brake.

But you can't reach the wheel while riding. So a cable runs to a lever on your handlebar. Now squeezing stops you.

Then it rains, and wet rims brake badly. So you squeeze a disc on the hub, away from the rim. That's a disc brake.

But cables stretch and drag. So you swap the cable for fluid in a sealed hose, like a syringe. That's hydraulic.

On a long descent, heat weakens the brakes. So you fit a bigger rotor, which sheds heat better.

You built a modern disc brake. Your shoes can retire.

Save this for your next big hill.
```

## نسخه‌ی ElevenLabs Eleven v4 (با تگ)

طبق مستندات ElevenLabs برای v4: تگ‌ها در کروشه و قبل از جمله‌ای که اثر می‌گذارند؛ SSML و اسلایدرهای Style و Speed در v4 نیست؛ مکث با ویرگول، سه‌نقطه و ساختار متن؛ حروف بزرگ تأکید را بیشتر می‌کند (نیاز نیست). تگ‌ها را کم نگه داشتم و فقط حالت صدا هستند، بدون تگ صدای اضافه (مثل [applause]) چون جلوه‌ها را خودمان در کد می‌سازیم. گوش بده که تگ‌ها خوانده نشوند.

```
[casual, playful narration] You're at the top of a steep hill. [brief pause] Your bike has no brakes. [dry amusement] Congratulations!

[measured] Dragging your shoes is not working. So you press a rubber pad on the wheel rim. That's a rim brake.

But you can't reach the wheel while riding. So a cable runs to a lever on your handlebar. Now squeezing stops you.

Then it rains, and wet rims brake badly. So you squeeze a disc on the hub, away from the rim. That's a disc brake.

But cables stretch and drag. So you swap the cable for fluid in a sealed hose, like a syringe. That's hydraulic.

[calm] On a long descent, heat weakens the brakes. So you fit a bigger rotor, which sheds heat better.

[brief pause, dry amusement] You built a modern disc brake. Your shoes can retire.

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
