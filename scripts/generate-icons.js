import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const svgPath = path.join(__dirname, '../public/icon.svg');
const publicDir = path.join(__dirname, '../public');

// SVG com logo FlowTech
const svgContent = `<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <rect width="512" height="512" fill="#000000"/>
  <path d="M102 102 L102 256 L179 256 L179 179 L256 179 L256 102 Z" fill="#d1d5db" fill-opacity="0.9"/>
  <circle cx="143" cy="140" r="13" fill="#d1d5db" fill-opacity="0.9"/>
  <circle cx="215" cy="140" r="13" fill="#d1d5db" fill-opacity="0.9"/>
  <path d="M256 102 L256 179 L410 179 L410 256 L333 256 L333 410 L256 410 L256 333 L179 333 L179 256 L256 256 Z" fill="#3b82f6"/>
  <circle cx="292" cy="140" r="13" fill="#3b82f6"/>
  <circle cx="369" cy="140" r="13" fill="#3b82f6"/>
  <text x="256" y="350" font-family="Arial, sans-serif" font-size="48" font-weight="bold" fill="#d1d5db" text-anchor="middle">
    <tspan fill="#d1d5db">Flow</tspan><tspan fill="#3b82f6">Tech</tspan>
  </text>
  <text x="256" y="400" font-family="Arial, sans-serif" font-size="24" font-weight="600" fill="#d1d5db" text-anchor="middle">SYSTEMS</text>
</svg>`;

async function generateIcons() {
  try {
    // Gerar ícone 192x192
    await sharp(Buffer.from(svgContent))
      .resize(192, 192)
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));

    // Gerar ícone 512x512
    await sharp(Buffer.from(svgContent))
      .resize(512, 512)
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));

    console.log('✅ Ícones PWA gerados com sucesso!');
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
    process.exit(1);
  }
}

generateIcons();

