import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logoPath = path.join(__dirname, '../public/asddds.png');
const publicDir = path.join(__dirname, '../public');

async function generateIcons() {
  try {
    // Verificar se a imagem existe
    if (!fs.existsSync(logoPath)) {
      console.error('❌ Arquivo asddds.png não encontrado em public/');
      process.exit(1);
    }

    // Gerar ícone 192x192
    await sharp(logoPath)
      .resize(192, 192, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      })
      .png()
      .toFile(path.join(publicDir, 'icon-192.png'));

    // Gerar ícone 512x512
    await sharp(logoPath)
      .resize(512, 512, {
        fit: 'contain',
        background: { r: 0, g: 0, b: 0, alpha: 1 }
      })
      .png()
      .toFile(path.join(publicDir, 'icon-512.png'));

    console.log('✅ Ícones PWA gerados com sucesso a partir de asddds.png!');
  } catch (error) {
    console.error('❌ Erro ao gerar ícones:', error);
    process.exit(1);
  }
}

generateIcons();

