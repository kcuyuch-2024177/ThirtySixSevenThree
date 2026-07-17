import sharp from 'sharp';
import { copyFileSync } from 'fs';

const src =
  'C:/Users/Informatica/.cursor/projects/c-Users-Informatica-Documents-ThirtySixSevenThree/assets/c__Users_Informatica_AppData_Roaming_Cursor_User_workspaceStorage_empty-window_images_ChatGPT_Image_17_jul_2026__16_24_19-6e5120bf-452d-4ea1-b0a0-7778f83ef2f5.png';
const out =
  'C:/Users/Informatica/Documents/ThirtySixSevenThree/inventario-app/frontend/public/logo-ynventory-transparent.png';
const out2 =
  'C:/Users/Informatica/Documents/ThirtySixSevenThree/inventario-app/frontend/public/logo-ynventory.png';

const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

for (let i = 0; i < data.length; i += 4) {
  const r = data[i];
  const g = data[i + 1];
  const b = data[i + 2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  // Fondo negro / gris muy oscuro sin croma → transparente
  if (max < 42) {
    data[i + 3] = 0;
  } else if (max < 75 && max - min < 20) {
    data[i + 3] = Math.round(((max - 42) / 33) * 255);
  }
}

const trimmed = await sharp(data, {
  raw: { width: info.width, height: info.height, channels: 4 },
})
  .trim({ threshold: 5 })
  .png()
  .toBuffer();

await sharp(trimmed).png().toFile(out);
copyFileSync(out, out2);
const meta = await sharp(out).metadata();
console.log('ok', meta.width, 'x', meta.height, 'hasAlpha', meta.hasAlpha);
