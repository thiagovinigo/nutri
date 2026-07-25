const fs = require('fs');
const zlib = require('zlib');
const path = require('path');

const crcTable = [];
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = ((c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1));
  }
  crcTable[n] = c;
}

function crc32(buf) {
  let c = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    c = crcTable[(c ^ buf[i]) & 0xFF] ^ (c >>> 8);
  }
  return (c ^ 0xFFFFFFFF) >>> 0;
}

function writeChunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPNG(width, height, r, g, b) {
  const sig = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  
  const rowLen = width * 4 + 1;
  const rawData = Buffer.alloc(height * rowLen);
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.min(width, height) * 0.45;

  for (let y = 0; y < height; y++) {
    const offset = y * rowLen;
    rawData[offset] = 0; // filter 0
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 4;
      // Draw a nice rounded rectangle / circle or solid indigo background (#3949AB -> 57, 73, 171)
      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
      rawData[px + 3] = 255;
    }
  }
  
  const idatData = zlib.deflateSync(rawData);
  const iend = writeChunk('IEND', Buffer.alloc(0));
  
  return Buffer.concat([sig, writeChunk('IHDR', ihdr), writeChunk('IDAT', idatData), iend]);
}

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);

// Generate 192x192
const png192 = createPNG(192, 192, 57, 73, 171);
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), png192);

// Generate 512x512
const png512 = createPNG(512, 512, 57, 73, 171);
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), png512);

// Generate apple-touch-icon (180x180)
const appleIcon = createPNG(180, 180, 57, 73, 171);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// Copy favicon.svg to masked-icon.svg if exists
if (fs.existsSync(path.join(publicDir, 'favicon.svg'))) {
  fs.copyFileSync(path.join(publicDir, 'favicon.svg'), path.join(publicDir, 'masked-icon.svg'));
}

// Write a minimal favicon.ico (can just be a copy of png192 or 32x32 png)
const png32 = createPNG(32, 32, 57, 73, 171);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), png32);

console.log('PWA icons successfully generated in /public directory!');
