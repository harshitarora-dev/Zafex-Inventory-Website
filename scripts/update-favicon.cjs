const fs = require('fs');
const path = require('path');

const logoPath = path.resolve(__dirname, '../artifacts/zafex-collectibles/public/logo.png');
const base64Logo = fs.readFileSync(logoPath).toString('base64');

const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,${base64Logo}" width="512" height="512" preserveAspectRatio="xMidYMid meet" />
</svg>
`;

const targets = [
  path.resolve(__dirname, '../artifacts/zafex-collectibles/public/favicon.svg'),
  path.resolve(__dirname, '../artifacts/zafex-collectibles/dist/public/favicon.svg'),
  path.resolve(__dirname, '../hostinger-frontend/favicon.svg'),
];

for (const target of targets) {
  try {
    fs.writeFileSync(target, svgContent);
    console.log(`Updated ${target}`);
  } catch (err) {
    console.warn(`Could not update ${target}:`, err.message);
  }
}
