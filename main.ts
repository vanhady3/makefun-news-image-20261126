// news-image-20261126 — "Sum up 26 November's world news in one image"
// Node stdlib only. Deterministic: every coordinate and colour is fixed,
// no network, no Date, no randomness. Writes one 1024x1024 PNG (<=1 MiB)
// to argv[2] or /output/entry.png. Run twice -> byte-identical output.
//
// Layout: bold poster, deep charcoal-navy, ember orange, sand gold.
// Top names the day; hero = Yemen strikes; bottom row = jets / quake / space;
// footer = the day's other briefs.
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { deflateSync } from "node:zlib";

const W = 1024;
const H = 1024;
const buf = new Uint8Array(W * H * 3);

type RGB = [number, number, number];
const BG: RGB = [13, 21, 38]; // #0d1526 deep charcoal-navy
const PANEL: RGB = [22, 35, 60]; // #16233c
const STEEL: RGB = [70, 88, 122]; // #46587a
const GOLD: RGB = [217, 164, 65]; // #d9a441 sand gold
const EMBER: RGB = [255, 107, 26]; // #ff6b1a ember orange
const WHITE: RGB = [245, 242, 234];
const GREY: RGB = [138, 148, 166];
const DARK: RGB = [10, 15, 28];
const SMOKE1: RGB = [90, 98, 112];
const SMOKE2: RGB = [74, 81, 96];
const BLAST_Y: RGB = [255, 213, 79];
const BLAST_O: RGB = [255, 140, 26];
const BLAST_R: RGB = [229, 57, 53];
const JET: RGB = [16, 24, 42];
const SUN: RGB = [255, 179, 71];
const SUN_CORE: RGB = [255, 214, 120];
const CONCRETE: RGB = [16, 20, 32];
const GREEN: RGB = [1, 65, 28];

function px(x: number, y: number, c: RGB): void {
  if (x < 0 || x >= W || y < 0 || y >= H) return;
  const i = (y * W + x) * 3;
  buf[i] = c[0];
  buf[i + 1] = c[1];
  buf[i + 2] = c[2];
}

function fillRect(x0: number, y0: number, x1: number, y1: number, c: RGB): void {
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) px(x, y, c);
}

function outlineRect(x0: number, y0: number, x1: number, y1: number, t: number, c: RGB): void {
  fillRect(x0, y0, x1, y0 + t, c);
  fillRect(x0, y1 - t, x1, y1, c);
  fillRect(x0, y0, x0 + t, y1, c);
  fillRect(x1 - t, y0, x1, y1, c);
}

function line(x0: number, y0: number, x1: number, y1: number, c: RGB): void {
  const dx = Math.abs(x1 - x0);
  const dy = -Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1;
  const sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  let x = x0;
  let y = y0;
  for (;;) {
    px(x, y, c);
    if (x === x1 && y === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) {
      err += dy;
      x += sx;
    }
    if (e2 <= dx) {
      err += dx;
      y += sy;
    }
  }
}

function fillPolygon(pts: Array<[number, number]>, c: RGB): void {
  let minY = pts[0][1];
  let maxY = pts[0][1];
  for (const p of pts) {
    if (p[1] < minY) minY = p[1];
    if (p[1] > maxY) maxY = p[1];
  }
  for (let y = minY; y < maxY; y++) {
    const xs: number[] = [];
    for (let i = 0; i < pts.length; i++) {
      const a = pts[i];
      const b = pts[(i + 1) % pts.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) {
        xs.push(a[0] + ((y - a[1]) * (b[0] - a[0])) / (b[1] - a[1]));
      }
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const x0 = Math.ceil(xs[k]);
      const x1 = Math.floor(xs[k + 1]);
      for (let x = x0; x <= x1; x++) px(x, y, c);
    }
  }
}

function fillCircle(cx: number, cy: number, r: number, c: RGB): void {
  for (let dy = -r; dy <= r; dy++) {
    const dx = Math.floor(Math.sqrt(r * r - dy * dy));
    for (let x = cx - dx; x <= cx + dx; x++) px(x, cy + dy, c);
  }
}

// 16-point starburst (alternating outer/inner radius).
function burst(cx: number, cy: number, rO: number, rI: number, c: RGB): void {
  const pts: Array<[number, number]> = [];
  for (let k = 0; k < 16; k++) {
    const a = (k * Math.PI) / 8;
    const r = k % 2 === 0 ? rO : rI;
    pts.push([cx + Math.round(r * Math.cos(a)), cy + Math.round(r * Math.sin(a))]);
  }
  fillPolygon(pts, c);
}

function fireball(cx: number, cy: number, s: number): void {
  burst(cx, cy, Math.round(30 * s), Math.round(14 * s), BLAST_R);
  burst(cx, cy, Math.round(20 * s), Math.round(9 * s), BLAST_O);
  burst(cx, cy, Math.round(11 * s), Math.round(5 * s), BLAST_Y);
  fillCircle(cx, cy, Math.max(2, Math.round(4 * s)), WHITE);
}

// Side-view jet silhouette. dir = 1 faces right, -1 faces left. s = size scale.
function drawJet(cx: number, cy: number, dir: number, s: number): void {
  const shape: Array<[number, number]> = [
    [32, 0],
    [-24, -6],
    [-18, -14],
    [-26, -2],
    [-30, 0],
    [-26, 2],
    [-18, 13],
    [-24, 6],
  ];
  const pts: Array<[number, number]> = shape.map(([dx, dy]) => [
    cx + dir * Math.round(dx * s),
    cy + Math.round(dy * s),
  ]);
  fillPolygon(pts, JET);
  fillCircle(cx - dir * Math.round(32 * s), cy, Math.max(2, Math.round(3 * s)), BLAST_O);
  fillCircle(cx - dir * Math.round(32 * s), cy, Math.max(1, Math.round(1 * s)), BLAST_Y);
}

// ---- 5x7 bitmap font (scale = pixels per cell; char advance 6 cells) ----
const GLYPHS: Record<string, string[]> = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  B: ["11110", "10001", "10001", "11110", "10001", "10001", "11110"],
  C: ["01110", "10001", "10000", "10000", "10000", "10001", "01110"],
  D: ["11110", "10001", "10001", "10001", "10001", "10001", "11110"],
  E: ["11111", "10000", "10000", "11110", "10000", "10000", "11111"],
  F: ["11111", "10000", "10000", "11110", "10000", "10000", "10000"],
  G: ["01110", "10001", "10000", "10111", "10001", "10001", "01111"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  I: ["01110", "00100", "00100", "00100", "00100", "00100", "01110"],
  J: ["00111", "00010", "00010", "00010", "00010", "10010", "01100"],
  K: ["10001", "10010", "10100", "11000", "10100", "10010", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
  M: ["10001", "11011", "10101", "10101", "10001", "10001", "10001"],
  N: ["10001", "11001", "10101", "10011", "10001", "10001", "10001"],
  O: ["01110", "10001", "10001", "10001", "10001", "10001", "01110"],
  P: ["11110", "10001", "10001", "11110", "10000", "10000", "10000"],
  Q: ["01110", "10001", "10001", "10001", "10101", "10010", "01101"],
  R: ["11110", "10001", "10001", "11110", "10100", "10010", "10001"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  V: ["10001", "10001", "10001", "10001", "10001", "01010", "00100"],
  W: ["10001", "10001", "10001", "10101", "10101", "11011", "10001"],
  X: ["10001", "10001", "01010", "00100", "01010", "10001", "10001"],
  Y: ["10001", "10001", "01010", "00100", "00100", "00100", "00100"],
  Z: ["11111", "00001", "00010", "00100", "01000", "10000", "11111"],
  "0": ["01110", "10001", "10011", "10101", "11001", "10001", "01110"],
  "1": ["00100", "01100", "00100", "00100", "00100", "00100", "01110"],
  "2": ["01110", "10001", "00001", "00110", "01000", "10000", "11111"],
  "3": ["11111", "00010", "00100", "00010", "00001", "10001", "01110"],
  "4": ["00010", "00110", "01010", "10010", "11111", "00010", "00010"],
  "5": ["11111", "10000", "11110", "00001", "00001", "10001", "01110"],
  "6": ["00110", "01000", "10000", "11110", "10001", "10001", "01110"],
  "7": ["11111", "00001", "00010", "00100", "01000", "01000", "01000"],
  "8": ["01110", "10001", "10001", "01110", "10001", "10001", "01110"],
  "9": ["01110", "10001", "10001", "01111", "00001", "00010", "01100"],
  " ": ["00000", "00000", "00000", "00000", "00000", "00000", "00000"],
  ":": ["00000", "00100", "00000", "00000", "00000", "00100", "00000"],
  "/": ["00001", "00010", "00010", "00100", "01000", "01000", "10000"],
  "-": ["00000", "00000", "00000", "01110", "00000", "00000", "00000"],
  "|": ["00100", "00100", "00100", "00100", "00100", "00100", "00100"],
  "+": ["00000", "00100", "00100", "01110", "00100", "00100", "00000"],
  ".": ["00000", "00000", "00000", "00000", "00000", "01100", "01100"],
  ",": ["00000", "00000", "00000", "00000", "01100", "00100", "01000"],
  "'": ["00100", "00100", "01000", "00000", "00000", "00000", "00000"],
  "~": ["00000", "00000", "01010", "10101", "00000", "00000", "00000"],
  "\u2022": ["00000", "00000", "01100", "01100", "00000", "00000", "00000"],
  "%": ["11001", "11010", "00010", "00100", "01000", "01011", "10011"],
  "(": ["00010", "00100", "01000", "01000", "01000", "00100", "00010"],
  ")": ["01000", "00100", "00010", "00010", "00010", "00100", "01000"],
  "=": ["00000", "00000", "11111", "00000", "11111", "00000", "00000"],
};

function textWidth(s: string, scale: number): number {
  return s.length * 6 * scale - scale;
}

function drawText(s: string, cx: number, y: number, scale: number, c: RGB): void {
  let x = cx - Math.floor(textWidth(s, scale) / 2);
  for (const ch of s) {
    const g = GLYPHS[ch] ?? GLYPHS[" "];
    for (let r = 0; r < 7; r++) {
      for (let col = 0; col < 5; col++) {
        if (g[r][col] === "1") {
          for (let dy = 0; dy < scale; dy++) {
            for (let dx = 0; dx < scale; dx++) {
              px(x + col * scale + dx, y + r * scale + dy, c);
            }
          }
        }
      }
    }
    x += 6 * scale;
  }
}

// ---- PNG encoder (deterministic) ----
const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  CRC_TABLE[n] = c >>> 0;
}
function crc32(data: Uint8Array): number {
  let c = 0xffffffff;
  for (let i = 0; i < data.length; i++) c = CRC_TABLE[(c ^ data[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function chunk(type: string, data: Uint8Array): Uint8Array {
  const out = new Uint8Array(12 + data.length);
  const dv = new DataView(out.buffer);
  dv.setUint32(0, data.length);
  for (let i = 0; i < 4; i++) out[4 + i] = type.charCodeAt(i);
  out.set(data, 8);
  const crcData = new Uint8Array(4 + data.length);
  crcData.set(out.subarray(4, 8), 0);
  crcData.set(data, 4);
  dv.setUint32(8 + data.length, crc32(crcData));
  return out;
}
function encodePNG(): Buffer {
  const raw = new Uint8Array(H * (1 + W * 3));
  for (let y = 0; y < H; y++) {
    raw[y * (1 + W * 3)] = 0;
    raw.set(buf.subarray(y * W * 3, (y + 1) * W * 3), y * (1 + W * 3) + 1);
  }
  const ihdr = new Uint8Array(13);
  const dv = new DataView(ihdr.buffer);
  dv.setUint32(0, W);
  dv.setUint32(4, H);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const idat = deflateSync(raw, { level: 9 });
  const sig = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", new Uint8Array(idat)),
    chunk("IEND", new Uint8Array(0)),
  ]);
}

// ================= SCENE =================
fillRect(0, 0, W, H, BG);

// Ember frame, inset 12, 4px.
outlineRect(12, 12, 1012, 1012, 4, EMBER);

// Top: the day, named big and first. Gold rules either side.
drawText("THURSDAY 26 NOVEMBER 2026", 512, 36, 3, GOLD);
fillRect(60, 46, 272, 48, GOLD);
fillRect(752, 46, 964, 48, GOLD);

// ---- HERO panel: Yemen ----
fillRect(28, 84, 996, 600, PANEL);
outlineRect(28, 84, 996, 600, 2, STEEL);
drawText("YEMEN: 83 KILLED", 512, 100, 7, WHITE);
drawText("IN 24 HOURS OF STRIKES", 512, 154, 7, WHITE);
drawText("HOUTHIS BLAME SAUDI-LED COALITION - RIYADH REVIEWING CIVILIAN DEATH REPORTS", 512, 214, 2, GOLD);
drawText("50 WOUNDED | UN: 1,600+ DEAD, 300,000+ DISPLACED", 512, 236, 2, EMBER);

// Hero illustration: dusk sky, two warplanes crossing, city skyline,
// grey smoke columns, orange blasts, rubble at the base.
const SKY: RGB[] = [
  [28, 42, 76],
  [44, 63, 102],
  [84, 69, 92],
  [124, 74, 62],
  [201, 106, 53],
];
for (let b = 0; b < 5; b++) {
  fillRect(40, 262 + b * 60, 984, 262 + (b + 1) * 60, SKY[b]);
}
fillRect(40, 552, 984, 560, SKY[4]);
// Low dusk sun.
fillCircle(848, 470, 24, SUN);
fillCircle(848, 470, 13, SUN_CORE);
// Smoke columns (behind skyline, in front of sky).
const SMOKE_X = [200, 520, 800];
const SMOKE_OFF = [0, 7, -5, 9, -7, 4];
for (const cx of SMOKE_X) {
  for (let i = 0; i < 6; i++) {
    fillCircle(cx + SMOKE_OFF[i], 462 - i * 24, 14 + (i % 2) * 3, i % 2 === 0 ? SMOKE1 : SMOKE2);
  }
}
// City skyline with a few lit windows.
const BUILDINGS: Array<[number, number, number]> = [
  [40, 70, 84], [118, 54, 120], [180, 80, 66], [268, 46, 104],
  [322, 66, 78], [396, 58, 128], [462, 74, 88], [544, 52, 110],
  [604, 70, 70], [682, 58, 118], [748, 66, 84], [822, 56, 100],
  [886, 60, 76], [954, 30, 96],
];
BUILDINGS.forEach(([bx, bw, bh], i) => {
  fillRect(bx, 560 - bh, bx + bw, 560, DARK);
  fillRect(bx + 8 + (i % 3) * 12, 560 - bh + 12 + (i % 2) * 14, bx + 11 + (i % 3) * 12, 560 - bh + 16 + (i % 2) * 14, GOLD);
  fillRect(bx + bw - 14, 560 - bh + 30, bx + bw - 11, 560 - bh + 34, GOLD);
});
// Blast bursts on the skyline.
fireball(255, 512, 1);
fireball(715, 500, 0.7);
// Rubble at the base.
for (let x = 40; x < 984; x += 36) {
  const h = 8 + ((x * 13) % 9);
  fillPolygon([[x, 560], [x + 18, 560 - h], [x + 36, 560]], DARK);
}
// Two warplanes crossing the dusk sky, with contrails.
line(296, 312, 210, 296, [110, 120, 140]);
drawJet(330, 312, 1, 1);
line(724, 348, 810, 336, [110, 120, 140]);
drawJet(690, 348, -1, 1);

// Hero body line: the claim caveat.
drawText("CASUALTY FIGURES ARE HOUTHI CLAIMS - NOT INDEPENDENTLY VERIFIED", 512, 572, 1, GREY);

// Gold divider.
fillRect(28, 618, 996, 620, GOLD);

// ---- BOTTOM ROW: three panels ----
function bottomPanel(px0: number, kicker: string, lines: string[], body: string): void {
  fillRect(px0, 640, px0 + 304, 940, PANEL);
  outlineRect(px0, 640, px0 + 304, 940, 2, STEEL);
  drawText(kicker, px0 + 152, 652, 1, GOLD);
  const startY = lines.length === 3 ? 674 : 686;
  lines.forEach((ln, i) => drawText(ln, px0 + 152, startY + i * 24, 3, WHITE));
  drawText(body, px0 + 152, 912, 1, GREY);
}

// Panel 1: five Russian jets hit at Savasleyka airfield.
bottomPanel(28, "UKRAINE - KYIV CLAIMS", ["FIVE RUSSIAN", "JETS", "HIT AT AIRFIELD"], "3 MIG-31 KINZHAL CARRIERS + 2 SU-34");
{
  const x0 = 28;
  fillRect(x0 + 10, 752, x0 + 294, 800, [44, 63, 102]);
  fillRect(x0 + 10, 800, x0 + 294, 830, [201, 106, 53]);
  fillRect(x0 + 10, 830, x0 + 294, 896, CONCRETE);
  const jetsX = [52, 97, 142, 187, 232];
  jetsX.forEach((jx, i) => drawJet(x0 + jx, 816, 1, 0.55));
  fireball(x0 + 142, 796, 0.5);
  for (let dx = 16; dx < 280; dx += 24) fillRect(x0 + dx, 868, x0 + dx + 14, 871, GOLD);
}

// Panel 2: 5.6 quake shakes Nepal.
bottomPanel(360, "EARTHQUAKE", ["5.6 QUAKE", "SHAKES NEPAL"], "KOSHI PROVINCE, NEAR CHINA BORDER");
{
  const x0 = 360;
  fillRect(x0 + 10, 752, x0 + 294, 896, [28, 42, 76]);
  const stars: Array<[number, number]> = [[40, 766], [90, 760], [250, 764], [270, 780], [150, 758], [200, 772]];
  for (const [sx, sy] of stars) fillRect(x0 + sx, sy, x0 + sx + 2, sy + 2, WHITE);
  fillPolygon([[x0 + 10, 896], [x0 + 110, 798], [x0 + 205, 896]], [44, 63, 102]);
  fillPolygon([[x0 + 120, 896], [x0 + 215, 778], [x0 + 294, 896]], [30, 42, 66]);
  fillPolygon([[x0 + 98, 812], [x0 + 110, 798], [x0 + 122, 812]], [225, 230, 235]);
  fillPolygon([[x0 + 201, 794], [x0 + 215, 778], [x0 + 229, 794]], [225, 230, 235]);
  // Seismograph zigzag across the mountains.
  const zig: Array<[number, number]> = [
    [14, 836], [30, 824], [46, 846], [62, 822], [78, 848], [94, 826],
    [110, 844], [126, 820], [142, 848], [158, 824], [174, 846], [190, 822],
    [206, 844], [222, 826], [238, 846], [254, 824], [270, 838], [290, 836],
  ];
  for (let i = 0; i + 1 < zig.length; i++) {
    line(x0 + zig[i][0], zig[i][1], x0 + zig[i + 1][0], zig[i + 1][1], BLAST_O);
    line(x0 + zig[i][0], zig[i][1] + 1, x0 + zig[i + 1][0], zig[i + 1][1] + 1, BLAST_O);
  }
  // Cracked ground at the base.
  const crack: Array<[number, number]> = [
    [30, 872], [70, 884], [110, 876], [150, 888], [190, 878], [230, 890], [270, 882],
  ];
  for (let i = 0; i + 1 < crack.length; i++) {
    line(x0 + crack[i][0], crack[i][1], x0 + crack[i + 1][0], crack[i + 1][1], DARK);
    line(x0 + crack[i][0], crack[i][1] + 1, x0 + crack[i + 1][0], crack[i + 1][1] + 1, DARK);
  }
}

// Panel 3: Pakistan's first astronaut.
bottomPanel(692, "PAKISTAN - CHINA", ["PAKISTAN'S", "FIRST", "ASTRONAUT"], "ZEESHAN ALI TO FLY TO TIANGONG");
{
  const x0 = 692;
  fillRect(x0 + 10, 752, x0 + 294, 896, BG);
  const stars: Array<[number, number]> = [
    [30, 770], [60, 800], [90, 770], [200, 830], [250, 800],
    [280, 760], [40, 850], [260, 860], [180, 760], [110, 830],
  ];
  for (const [sx, sy] of stars) fillRect(x0 + sx, sy, x0 + sx + 2, sy + 2, WHITE);
  // Small green crescent.
  fillCircle(x0 + 40, 772, 11, GREEN);
  fillCircle(x0 + 45, 769, 9, BG);
  // Space station, top right: module + solar panels.
  fillRect(x0 + 205, 762, x0 + 245, 774, [150, 160, 180]);
  fillRect(x0 + 172, 765, x0 + 203, 771, [44, 74, 122]);
  fillRect(x0 + 247, 765, x0 + 278, 771, [44, 74, 122]);
  for (let gx = 176; gx < 203; gx += 8) line(x0 + gx, 765, x0 + gx, 771, [20, 35, 60]);
  for (let gx = 251; gx < 278; gx += 8) line(x0 + gx, 765, x0 + gx, 771, [20, 35, 60]);
  line(x0 + 225, 762, x0 + 225, 754, [150, 160, 180]);
  fillCircle(x0 + 225, 753, 2, GOLD);
  // Rocket rising, centre.
  fillPolygon([[x0 + 128, 800], [x0 + 152, 800], [x0 + 140, 776]], BLAST_R);
  fillRect(x0 + 128, 800, x0 + 152, 872, [235, 238, 242]);
  fillCircle(x0 + 140, 814, 4, [44, 120, 180]);
  fillPolygon([[x0 + 128, 872], [x0 + 116, 892], [x0 + 128, 854]], [200, 30, 30]);
  fillPolygon([[x0 + 152, 872], [x0 + 164, 892], [x0 + 152, 854]], [200, 30, 30]);
  fillPolygon([[x0 + 131, 872], [x0 + 149, 872], [x0 + 140, 894]], BLAST_O);
  fillPolygon([[x0 + 135, 872], [x0 + 145, 872], [x0 + 140, 886]], BLAST_Y);
}

// ---- FOOTER: the day's other briefs ----
drawText("RAMAPHOSA WINS FARMGATE REPRIEVE \u2022 SOLOMON ISLANDS-AUSTRALIA SECURITY PACT \u2022 XI GRAFT PROBE HITS SHANGHAI STAR", 512, 960, 1, GREY);
drawText("RUSSIA: ~500,000 WAR DEAD, OWN FIGURES \u2022 US READIES NEW TARIFFS \u2022 COP31: NO DEAL", 512, 974, 1, GREY);

// ---- WRITE ----
const outPath = process.argv[2] ?? "/output/entry.png";
mkdirSync(dirname(outPath), { recursive: true });
writeFileSync(outPath, encodePNG());
