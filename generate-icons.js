const sharp = require('sharp');
const sizes = [16, 48, 128];

sizes.forEach(size => {
  sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 34, g: 197, b: 94, alpha: 1 }
    }
  })
  .png()
  .toFile(`public/icons/icon${size}.png`, (err) => {
    if (err) console.error(`Error creating icon${size}.png:`, err);
    else console.log(`Created icon${size}.png`);
  });
});