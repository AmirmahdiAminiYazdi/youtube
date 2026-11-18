# Cover prompt: special-smart-glasses (vertical 9:16, held 1 s at the end of the Short)

Style reference: the cover of "Claude Fable 5.2 Made a Playable FPS in 8 Hours" (cartoon toy-like 3D Brainmaxx robot on a small isometric slab, big text on top in off-white and orange). Paste into an image model (ChatGPT image, Gemini or Midjourney), ask for 1080 x 1920 (9:16), and send back the PNG.

```
Vertical 9:16 cover image, 1080x1920, for a YouTube Short about how AI smart glasses work. Cute stylized 3D render like a premium toy or game icon, clearly animation, not a photo. Dark navy background (#0B1B33) with a soft teal glow behind the subject.

Main subject, centered: a friendly chunky teal robot (#19C3B1) with a rounded square head, a black glossy screen as its face showing big glowing cyan star-shaped eyes and a wide surprised happy mouth, orange round ear cups (#FF7A3D) on both sides of the head, and a transparent glass dome on top of its head with a glowing teal circuit-brain inside. The robot wears oversized black smart glasses: a tiny camera lens on the front left corner of the frame, a small glowing white recording light on the front right corner, and thin teal sound waves coming out of the glasses arms toward its orange ears. One robot hand points at the viewer.

Next to the robot: a floating exam paper with a big score written in red pen, "397.5/400", and a large red circle around it. Small glowing teal particles and three small chat bubbles float up from the glasses into the air above the dome.

Under the robot: a small square isometric slab with a teal grid floor and glowing teal edges, with two tiny school desks and a smartphone lying on one desk, its screen glowing teal.

Lighting: warm orange glow from behind the head, teal rim light, soft bloom, light rays behind the robot, high contrast, bright saturated colors, clean premium look. The robot and slab fill the middle of the frame between y 25 percent and y 75 percent.

Text, top area only (upper 22 percent of the frame), very bold rounded geometric sans-serif like Outfit Bold, perfectly spelled: first line in off-white (#F4F1EA) "397.5 OUT OF 400", second line bigger in orange (#FF7A3D) "WHO HELPED?". Keep the bottom 20 percent of the image empty dark navy, no text and no logos there.

No people, no human faces, no hands of real people, no brand logos, no watermark, no extra words, no realistic photo style, no blur on the text.
```

Notes: the text must be spelled exactly; if the model misspells it, ask it to regenerate the text only, or send the image without text and the text is added in code. "397.5 out of 400" is from Korea JoongAng Daily (second source still to confirm before upload). The cover says "WHO HELPED?" and not "glasses cheated", because the confession named a miniature camera, a smartphone and generative AI, not glasses.

---

## v2 (2026-11-18, creator-studio: yt-package + prompt-master)

Paired with the v2 title "How Do AI Smart Glasses Work? Built in 3D". The headline is only two words ("WHO HELPED?") so it does not repeat the title and stays readable at feed size; the score is a prop on the exam paper, not a headline. Target tool: ChatGPT image generation (also works in Gemini). Ask for a 1080 x 1920 PNG.

```
Create a vertical 9:16 image, 1080x1920 px, as the cover of a YouTube Short. Style: glossy stylized 3D render like a premium toy or mobile game key art, clearly animation, never a photo. Dark navy background (#0B1B33) with a soft teal glow (#19C3B1) behind the subject and faint glowing teal grid lines at the bottom.

Hero, large and close: the head and shoulders of a friendly chunky robot filling the middle of the frame (from about 28% to 78% of the height, centered slightly left). Rounded square teal head, a black glossy screen as its face with two glowing cyan eyes looking nervously to the side, a small teal sweat drop on the screen, and a tight awkward smile. Orange round ear cups (#FF7A3D) on both sides. A transparent glass dome on top of the head with a glowing teal circuit-brain inside. The robot wears oversized thick black smart glasses: a tiny camera lens with a teal ring on the left corner of the frame, a small bright white recording light on the right corner, and four tiny microphone dots on the top of the frame. The left lens shows a small reflection of an exam sheet.

Props: on the left, a white exam sheet floats at a slight angle, with the score "397.5/400" handwritten in red marker and circled in red. On the right, a smartphone floats with a glowing teal screen showing a chat bubble with the letters "AI". Thin glowing teal data lines connect the glasses to the phone and up to a small soft white cloud above it. A few small orange sparks around the glasses.

Headline in the top area only (between 7% and 24% of the height), centered, huge, very bold rounded geometric sans-serif like Outfit Bold, perfectly spelled, exactly two words: "WHO HELPED?" in warm off-white (#F4F1EA) with a thick navy outline, the question mark in orange (#FF7A3D).

Lighting: teal rim light, warm orange backlight behind the head, soft bloom, high contrast, saturated clean colors, sharp focus on the glasses.

Layout rules: keep the bottom 20% of the image empty dark navy, and keep the right 12% free of faces and text, because app buttons cover those areas. No other words or letters anywhere except "WHO HELPED?", "397.5/400" and "AI". No people, no human faces or hands, no brand logos, no watermark, no photo realism, no blur on the text.
```

Checks after generating: "WHO HELPED?" and "397.5/400" spelled exactly; robot, glasses and phone readable at thumbnail size; nothing important in the bottom 20% or the right edge. If the text is wrong, ask the model to fix only the text, or send the image without text and the text is set in code (Outfit Bold). When the PNG comes back, the last second of the video can be swapped with ffmpeg (no full re-render).
