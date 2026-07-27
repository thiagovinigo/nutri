const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const publicDir = path.join(__dirname, 'public');
const svgPath = path.join(publicDir, 'favicon.svg');

// Cor de fundo dos ícones (mesma do theme_color do manifest / vite.config.js)
const BRAND_BG = { r: 57, g: 73, b: 171, alpha: 1 };
const TRANSPARENT = { r: 0, g: 0, b: 0, alpha: 0 };

// Densidade alta para rasterizar o SVG (viewBox pequeno) sem perder nitidez ao ampliar
const RENDER_DENSITY = 1200;

async function renderLogoBuffer(innerSize) {
  return sharp(svgPath, { density: RENDER_DENSITY })
    .resize(innerSize, innerSize, { fit: 'contain', background: TRANSPARENT })
    .png()
    .toBuffer();
}

// Ícone com fundo sólido (PWA / apple-touch-icon), logo centralizado com margem
// de segurança para ícones "maskable" (Android pode recortar em círculo etc.)
async function renderSolidIcon(size, marginRatio, outPath) {
  const innerSize = Math.round(size * (1 - marginRatio * 2));
  const logoBuffer = await renderLogoBuffer(innerSize);
  const offset = Math.round((size - innerSize) / 2);

  await sharp({ create: { width: size, height: size, channels: 4, background: BRAND_BG } })
    .composite([{ input: logoBuffer, left: offset, top: offset }])
    .png()
    .toFile(outPath);
}

// Ícone com fundo transparente (favicon), sem forçar cor de fundo
async function renderTransparentIconBuffer(size, marginRatio) {
  const innerSize = Math.round(size * (1 - marginRatio * 2));
  const logoBuffer = await renderLogoBuffer(innerSize);
  const offset = Math.round((size - innerSize) / 2);

  return sharp({ create: { width: size, height: size, channels: 4, background: TRANSPARENT } })
    .composite([{ input: logoBuffer, left: offset, top: offset }])
    .png()
    .toBuffer();
}

// Envolve um PNG num container ICO válido (formato PNG-in-ICO, suportado desde o Windows Vista)
function writeIco(pngBuffer, size, outPath) {
  const ICONDIR_SIZE = 6;
  const ICONDIRENTRY_SIZE = 16;

  const iconDir = Buffer.alloc(ICONDIR_SIZE);
  iconDir.writeUInt16LE(0, 0); // reserved, deve ser 0
  iconDir.writeUInt16LE(1, 2); // type: 1 = ícone
  iconDir.writeUInt16LE(1, 4); // número de imagens no arquivo

  const entry = Buffer.alloc(ICONDIRENTRY_SIZE);
  entry.writeUInt8(size >= 256 ? 0 : size, 0); // largura (0 significa 256px)
  entry.writeUInt8(size >= 256 ? 0 : size, 1); // altura
  entry.writeUInt8(0, 2); // paleta de cores (0 = sem paleta)
  entry.writeUInt8(0, 3); // reserved
  entry.writeUInt16LE(1, 4); // color planes
  entry.writeUInt16LE(32, 6); // bits por pixel (RGBA)
  entry.writeUInt32LE(pngBuffer.length, 8); // tamanho dos dados da imagem
  entry.writeUInt32LE(ICONDIR_SIZE + ICONDIRENTRY_SIZE, 12); // offset dos dados da imagem

  fs.writeFileSync(outPath, Buffer.concat([iconDir, entry, pngBuffer]));
}

async function main() {
  if (!fs.existsSync(svgPath)) {
    console.error('favicon.svg não encontrado em public/ — abortando geração de ícones.');
    process.exit(1);
  }

  await renderSolidIcon(192, 0.17, path.join(publicDir, 'pwa-192x192.png'));
  await renderSolidIcon(512, 0.17, path.join(publicDir, 'pwa-512x512.png'));
  await renderSolidIcon(180, 0.12, path.join(publicDir, 'apple-touch-icon.png'));

  const faviconPng = await renderTransparentIconBuffer(32, 0.06);
  writeIco(faviconPng, 32, path.join(publicDir, 'favicon.ico'));

  fs.copyFileSync(svgPath, path.join(publicDir, 'masked-icon.svg'));

  console.log('Ícones PWA/favicon regenerados a partir do logo real em public/favicon.svg.');
}

main().catch((err) => {
  console.error('Falha ao gerar ícones:', err);
  process.exit(1);
});
