#!/usr/bin/env bash
# Final master for #9 "Stop Rereading": picture from the HyperFrames render, sound mixed here
# (voice on top, code-made effects 6 dB under), loudness for Shorts, upload-safe H.264.
# Usage: bash scripts/finish.sh   (after the render wrote renders/raw.mp4)
set -euo pipefail
cd "$(dirname "$0")/.."
OUT=renders/09-stop-rereading.mp4
ffmpeg -v error -y -i renders/raw.mp4 -i assets/audio/vo.mp3 -i assets/audio/sfx.wav \
  -filter_complex "[1:a]aresample=48000,aformat=channel_layouts=stereo,apad=whole_dur=43[v];[2:a]volume=-6dB[s];[v][s]amix=inputs=2:duration=first:normalize=0,loudnorm=I=-14:TP=-1.0:LRA=11,atrim=0:43[a]" \
  -map 0:v -map "[a]" -c:v libx264 -preset slow -crf 17 -pix_fmt yuv420p -color_range tv \
  -color_primaries bt709 -color_trc bt709 -colorspace bt709 -r 30 \
  -c:a aac -b:a 256k -ar 48000 -movflags +faststart -t 43 "$OUT"
ffprobe -v error -show_entries stream=codec_name,width,height,pix_fmt,r_frame_rate,color_space,sample_rate,channels -show_entries format=duration,size -of compact "$OUT"
