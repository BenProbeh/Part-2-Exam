import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { deflateSync } from 'zlib';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', 'public');

// Pixel art middle finger cursor — GTA style, transparent background
// W = white, B = black outline
const grid = [
  '...........WW...........',
  '..........WWWW..........',
  '..........WWWW..........',
  '..........WWWW..........',
  '..........WWWW..........',
  '.........WWWWWW.........',
  '........WWWWWWWW........',
  '........WWWWWWWW........',
  '........WWWWWWWW........',
  '........WWWWWWWW........',
  '.......WWWWWWWWWW.......',
  '......WWWWWWWWWWWW......',
  '.....WWWWWWWWWWWWWW.....',
  '....WWWWWWWWWWWWWWWW....',
  '...WWWWWWWWWWWWWWWWWW...',
  '..WWWWWWWWWWWWWWWWWWWW..',
  '..WWWW..WWWWWW..WWWWWW..',
  '..WWWWWWWWWWWWWWWWWWWW..',
  '..WWWWWWWWWWWWWWWWWWWW..',
  '.WWWW....WWWWWWWW....WW.',
  '.WWWW....WWWWWWWW....WW.',
  '..WWWWWWWWWWWWWWWWWWWW..',
  '...WWWWWWWWWWWWWWWWWW...',
  '....WWWWWWWWWWWWWWWW....',
  '.....WWWWWWWWWWWWWW.....',
  '......WWWWWWWWWWWW......',
  '.......WWWWWWWWWW.......',
  '........WWWWWWWW........',
  '.........WWWWWW.........',
  '..........WWWW..........',
];

// Add black outline around white pixels
function buildOutline(source) {
  const rows = source.length;
  const cols = source[0].length;
  const out = source.map(r => r.split(''));

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (source[y][x] !== 'W') continue;
      const neighbors = [
        [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
        [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1],
      ];
      for (const [nx, ny] of neighbors) {
        if (ny < 0 || ny >= rows || nx < 0 || nx >= cols || source[ny][nx] === '.') {
          if (out[y][x] === 'W') out[y][x] = 'W';
        }
      }
    }
  }

  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (source[y][x] !== '.') continue;
      let touchesWhite = false;
      const neighbors = [[x-1,y],[x+1,y],[x,y-1],[x,y+1],[x-1,y-1],[x+1,y-1],[x-1,y+1],[x+1,y+1]];
      for (const [nx, ny] of neighbors) {
        if (ny >= 0 && ny < rows && nx >= 0 && nx < cols && source[ny][nx] === 'W') {
          touchesWhite = true;
          break;
        }
      }
      if (touchesWhite) out[y][x] = 'B';
    }
  }

  return out.map(r => r.join(''));
}

const art = buildOutline(grid);
const rows = art.length;
const cols = art[0].length;
const scale = 2;
const width = cols * scale;
const height = rows * scale;

let rects = '';
for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    const cell = art[y][x];
    if (cell === '.') continue;
    const fill = cell === 'W' ? '#FFFFFF' : '#000000';
    rects += `<rect x="${x * scale}" y="${y * scale}" width="${scale}" height="${scale}" fill="${fill}"/>`;
  }
}

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" shape-rendering="crispEdges">\n${rects}\n</svg>`;
fs.writeFileSync(path.join(publicDir, 'cursor-finger.svg'), svg);

const cursorSize = 32;
const canvas = Array.from({ length: cursorSize }, () => Array(cursorSize).fill(null));

for (let y = 0; y < rows; y++) {
  for (let x = 0; x < cols; x++) {
    const cell = art[y][x];
    if (cell === '.') continue;
    const color = cell === 'W' ? [255, 255, 255] : [0, 0, 0];
    for (let dy = 0; dy < scale; dy++) {
      for (let dx = 0; dx < scale; dx++) {
        const px = Math.floor(((x * scale + dx) / width) * cursorSize);
        const py = Math.floor(((y * scale + dy) / height) * cursorSize);
        if (px < cursorSize && py < cursorSize) canvas[py][px] = color;
      }
    }
  }
}

function crc32(buf) {
  let c = ~0;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c >>> 1) ^ (0xedb88320 & -(c & 1));
  }
  return ~c >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

const rowBytes = 1 + cursorSize * 4;
const raw = Buffer.alloc((rowBytes + 1) * cursorSize);
for (let y = 0; y < cursorSize; y++) {
  const offset = y * (rowBytes + 1);
  raw[offset] = 0;
  for (let x = 0; x < cursorSize; x++) {
    const px = canvas[y][x];
    const i = offset + 1 + x * 4;
    if (!px) {
      raw[i] = 0; raw[i + 1] = 0; raw[i + 2] = 0; raw[i + 3] = 0;
    } else {
      raw[i] = px[0]; raw[i + 1] = px[1]; raw[i + 2] = px[2]; raw[i + 3] = 255;
    }
  }
}

const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(cursorSize, 0);
ihdr.writeUInt32BE(cursorSize, 4);
ihdr[8] = 8; ihdr[9] = 6;

const png = Buffer.concat([
  Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
  chunk('IHDR', ihdr),
  chunk('IDAT', deflateSync(raw)),
  chunk('IEND', Buffer.alloc(0)),
]);

fs.writeFileSync(path.join(publicDir, 'cursor-finger.png'), png);
console.log('Done');
