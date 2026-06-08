#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="${ROOT_DIR:-$(git rev-parse --show-toplevel 2>/dev/null || pwd)}"
README_PATH="${README_PATH:-${ROOT_DIR}/README.md}"
HOME_PATH="${HOME_PATH:-${ROOT_DIR}/content/_index.md}"
README_ASSETS_DIR="${README_ASSETS_DIR:-${ROOT_DIR}/README}"
RAW_README_PREFIX="${RAW_README_PREFIX:-https://raw.githubusercontent.com/zhaoolee/OnlineToolsBook/master/README/}"

if [ ! -f "$README_PATH" ]; then
  echo "[sync-home] README not found: ${README_PATH}" >&2
  exit 1
fi

mkdir -p "$(dirname "$HOME_PATH")"

front_matter="$(mktemp)"
readme_body="$(mktemp)"
next_home="$(mktemp)"

cleanup() {
  rm -f "$front_matter" "$readme_body" "$next_home"
}
trap cleanup EXIT

render_readme_body() {
  if ! command -v node >/dev/null 2>&1; then
    echo "[sync-home] node not found; README images will be copied without width/height" >&2
    cat "$README_PATH"
    return
  fi

  node - "$README_PATH" "$README_ASSETS_DIR" "$RAW_README_PREFIX" <<'NODE'
const fs = require("fs");
const path = require("path");

const readmePath = process.argv[2];
const readmeAssetsDir = process.argv[3];
const rawReadmePrefix = process.argv[4];

const source = fs.readFileSync(readmePath, "utf8");

const escapeAttr = (value) =>
  String(value)
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

const escapeRegExp = (value) =>
  String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const safeDecodeURIComponent = (value) => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

const jpegStartOfFrameMarkers = new Set([
  0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7,
  0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf,
]);

function getImageSize(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }

  const buffer = fs.readFileSync(filePath);

  if (
    buffer.length >= 24 &&
    buffer[0] === 0x89 &&
    buffer.toString("ascii", 1, 4) === "PNG" &&
    buffer.toString("ascii", 12, 16) === "IHDR"
  ) {
    return {
      width: buffer.readUInt32BE(16),
      height: buffer.readUInt32BE(20),
    };
  }

  if (
    buffer.length >= 10 &&
    (buffer.toString("ascii", 0, 6) === "GIF87a" ||
      buffer.toString("ascii", 0, 6) === "GIF89a")
  ) {
    return {
      width: buffer.readUInt16LE(6),
      height: buffer.readUInt16LE(8),
    };
  }

  if (buffer.length >= 4 && buffer[0] === 0xff && buffer[1] === 0xd8) {
    let offset = 2;

    while (offset + 9 < buffer.length) {
      while (offset < buffer.length && buffer[offset] === 0xff) {
        offset += 1;
      }

      const marker = buffer[offset];
      offset += 1;

      if (marker === 0xd9 || marker === 0xda) {
        break;
      }

      if (offset + 2 > buffer.length) {
        break;
      }

      const segmentLength = buffer.readUInt16BE(offset);
      if (segmentLength < 2 || offset + segmentLength > buffer.length) {
        break;
      }

      if (jpegStartOfFrameMarkers.has(marker)) {
        return {
          width: buffer.readUInt16BE(offset + 6),
          height: buffer.readUInt16BE(offset + 4),
        };
      }

      offset += segmentLength;
    }
  }

  return null;
}

const imagePattern = new RegExp(
  `!\\[([^\\]]*)\\]\\((${escapeRegExp(rawReadmePrefix)}([^\\s)]+))(?:\\s+(["'])(.*?)\\5)?\\)`,
  "g",
);

const misses = [];

const rendered = source.replace(
  imagePattern,
  (match, alt, url, fileName, quote, title) => {
    const localName = path.basename(safeDecodeURIComponent(fileName));
    const size = getImageSize(path.join(readmeAssetsDir, localName));

    if (!size) {
      misses.push(fileName);
      return match;
    }

    const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
    return `<img src="${escapeAttr(url)}" width="${size.width}" height="${size.height}" alt="${escapeAttr(alt)}" loading="lazy" decoding="async"${titleAttr}>`;
  },
);

if (misses.length > 0) {
  console.error(
    `[sync-home] ${misses.length} README image(s) did not get width/height: ${misses.join(", ")}`,
  );
}

process.stdout.write(rendered);
NODE
}

if [ -f "$HOME_PATH" ]; then
  awk '
    NR == 1 && ($0 == "+++" || $0 == "---") {
      delimiter = $0
      in_front_matter = 1
      print
      next
    }
    in_front_matter {
      print
      if ($0 == delimiter) {
        exit
      }
    }
  ' "$HOME_PATH" > "$front_matter"
fi

if [ ! -s "$front_matter" ]; then
  cat > "$front_matter" <<'EOF'
+++
title = "在线工具秘籍"
description = "在线工具秘籍，为在线工具和宝藏网站写一本优质开源中文说明书，让在线工具造福人类。"
+++
EOF
fi

render_readme_body > "$readme_body"

{
  cat "$front_matter"
  printf '\n'
  printf '<!-- This content is generated from README.md. Run scripts/sync-home-from-readme.sh after editing README.md. README images are rendered with width/height for stable homepage layout. -->\n\n'
  cat "$readme_body"
  printf '\n'
} > "$next_home"

if cmp -s "$next_home" "$HOME_PATH"; then
  echo "[sync-home] content/_index.md is already in sync with README.md"
else
  mv "$next_home" "$HOME_PATH"
  next_home=""
  echo "[sync-home] Synced README.md to content/_index.md"
fi
