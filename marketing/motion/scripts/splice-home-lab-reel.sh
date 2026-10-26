#!/usr/bin/env bash
# Assemble the Home Lab Packages Reel from four things:
#   REEL      the reel with the testimonials and the call to action (its first 3.9 s and its last 4.15 s are used)
#   PACKAGES  the reel whose packages block is wanted (its 7.45–27.5 s: one card per package, text underneath)
#   SEGMENT   the home-visit stretch from `render.mjs 04-home-lab --from 3.65 --to 9.95 --suffix segment`
#   WAV       the soundtrack from `render.mjs 04-home-lab --audio`
# Each layer fades in over the one beneath it (0.15 s), at moments where the layers show the same
# background and the floating logo is in the same place. Final length: 34.05 s, matching the soundtrack.
#
#   scripts/splice-home-lab-reel.sh REEL.mp4 PACKAGES.mp4 SEGMENT.mp4 SOUNDTRACK.wav OUT.mp4
# Needs ffmpeg with libx264 on PATH, or FFMPEG=/path/to/ffmpeg.
set -euo pipefail
FFMPEG="${FFMPEG:-ffmpeg}"
[ "$#" -eq 5 ] || { sed -n '2,12p' "$0"; exit 1; }
REEL="$1"; PACKAGES="$2"; SEGMENT="$3"; WAV="$4"; OUT="$5"
SWS='scale=out_color_matrix=bt709:out_range=tv:flags=bicubic+accurate_rnd+full_chroma_int'
"$FFMPEG" -hide_banner -loglevel error -y -i "$REEL" -i "$SEGMENT" -i "$PACKAGES" -i "$WAV" \
  -filter_complex "
    color=c=black:s=1080x1920:r=30:d=34.05[bg];
    [0:v]split=2[o1][o2];
    [o1]trim=0:3.9,setpts=PTS-STARTPTS,format=rgba[h];
    [1:v]format=rgba,fade=t=in:st=0:d=0.15:alpha=1,setpts=PTS+3.65/TB[b];
    [2:v]trim=7.45:27.7,setpts=PTS-STARTPTS,format=rgba,fade=t=in:st=0:d=0.15:alpha=1,setpts=PTS+9.8/TB[p];
    [o2]trim=30.15:34.3,setpts=PTS-STARTPTS,format=rgba,fade=t=in:st=0:d=0.1:alpha=1,setpts=PTS+29.9/TB[c];
    [bg][h]overlay=eof_action=pass:enable='between(t,0,3.9)'[v1];
    [v1][b]overlay=eof_action=pass:enable='between(t,3.65,9.95)'[v2];
    [v2][p]overlay=eof_action=pass:enable='between(t,9.8,30.05)'[v3];
    [v3][c]overlay=eof_action=pass:enable='gte(t,29.9)',${SWS},format=yuv420p[v]" \
  -map "[v]" -map 3:a -t 34.05 \
  -c:v libx264 -preset slow -crf 16 -profile:v high -level 4.2 \
  -colorspace bt709 -color_primaries bt709 -color_trc bt709 -color_range tv -r 30 -g 60 \
  -c:a aac -b:a 192k -ar 48000 -shortest -movflags +faststart "$OUT"
echo "✓ $OUT"
