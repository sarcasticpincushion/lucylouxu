#!/usr/bin/env bash
#
# Compress the portfolio videos and generate a first-frame poster for each.
#
# Why: the Work page plays many videos, and iOS/WebKit (which every iOS browser
# runs, incl. Chrome/Brave) has a hard cap on simultaneous decoding plus a
# per-tab memory watchdog. Oversized, full-res videos each cost a lot of decode
# memory. Downscaling to ~720px (the key win — fewer pixels per decoded frame)
# and re-encoding keeps memory and bandwidth low; the posters let LazyVideo show
# a frame while a clip isn't playing.
#
# Non-destructive + idempotent: pristine originals are copied once into
# video-originals/ (outside public/, so they are NOT deployed) and every run
# re-encodes from there. Delete video-originals/ to reclaim disk once you're
# happy with the results.
#
# Usage:
#     brew install ffmpeg          # one-time
#     bash scripts/optimize-videos.sh   # run from repo root
#
# Tunables:
#     MAX_WIDTH   downscale ceiling in px (only ever shrinks)   default 720
#     CRF         quality; lower = better/bigger, 18-30 sane    default 28

set -euo pipefail

MAX_WIDTH="${MAX_WIDTH:-720}"
CRF="${CRF:-28}"

SRC_DIR="public/animations"
BACKUP_DIR="video-originals"
POSTER_DIR="$SRC_DIR/posters"

if ! command -v ffmpeg >/dev/null 2>&1; then
  echo "error: ffmpeg not found. Install it first: brew install ffmpeg" >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR" "$POSTER_DIR"

# Only even dimensions are valid for yuv420p; -2 rounds height to the nearest
# even number while preserving aspect ratio. min(MAX_WIDTH,iw) never upscales.
scale_filter="scale='min(${MAX_WIDTH},iw)':-2"

shopt -s nullglob
total_before=0
total_after=0

for src in "$SRC_DIR"/*.mp4; do
  name="$(basename "$src")"
  orig="$BACKUP_DIR/$name"

  # First run: stash the pristine original outside public/ so re-runs always
  # encode from a clean source (never re-compress a compressed file).
  if [ ! -f "$orig" ]; then
    cp "$src" "$orig"
  fi

  before=$(wc -c <"$orig")

  tmp="$SRC_DIR/.${name}.tmp.mp4"
  ffmpeg -y -loglevel error -i "$orig" \
    -vf "$scale_filter" \
    -c:v libx264 -profile:v main -pix_fmt yuv420p \
    -crf "$CRF" -preset slow \
    -movflags +faststart -an \
    "$tmp"
  mv "$tmp" "$src"

  poster="$POSTER_DIR/${name%.mp4}.jpg"
  ffmpeg -y -loglevel error -ss 0.1 -i "$orig" \
    -frames:v 1 -vf "$scale_filter" -q:v 4 \
    "$poster"

  after=$(wc -c <"$src")
  total_before=$((total_before + before))
  total_after=$((total_after + after))
  printf '  %-24s %6.1f MB -> %5.1f MB   (poster %s)\n' \
    "$name" \
    "$(echo "scale=1; $before/1048576" | bc)" \
    "$(echo "scale=1; $after/1048576" | bc)" \
    "$(basename "$poster")"
done

printf '\ntotal: %.1f MB -> %.1f MB\n' \
  "$(echo "scale=1; $total_before/1048576" | bc)" \
  "$(echo "scale=1; $total_after/1048576" | bc)"
echo "posters written to $POSTER_DIR/"
echo "pristine originals kept in $BACKUP_DIR/ (not deployed)"
