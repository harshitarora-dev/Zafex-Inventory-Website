const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const logoPath = path.resolve(ROOT, 'artifacts/zafex-collectibles/public/logo.png');

if (!fs.existsSync(logoPath)) {
  console.error("Logo file not found:", logoPath);
  process.exit(1);
}

const logoBase64 = fs.readFileSync(logoPath).toString('base64');

// High contrast rounded white container ensuring logo is crystal clear in both dark and light browser tabs
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <rect width="512" height="512" rx="100" fill="#ffffff"/>
  <rect x="6" y="6" width="500" height="500" rx="94" fill="none" stroke="#ded8cd" stroke-width="8"/>
  <image href="data:image/png;base64,${logoBase64}" x="30" y="30" width="452" height="452" preserveAspectRatio="xMidYMid meet"/>
</svg>
`;

const targets = [
  path.resolve(ROOT, 'artifacts/zafex-collectibles/public/favicon.svg'),
  path.resolve(ROOT, 'artifacts/zafex-collectibles/dist/public/favicon.svg'),
  path.resolve(ROOT, 'hostinger-frontend/favicon.svg'),
  path.resolve(ROOT, 'public/favicon.svg'),
];

targets.forEach((dest) => {
  try {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) fs.mkdirSync(parent, { recursive: true });
    fs.writeFileSync(dest, svgContent);
    console.log("Updated favicon:", dest);
  } catch (err) {
    console.warn("Could not write favicon to:", dest, err.message);
  }
});

console.log("✅ Favicon updated everywhere!");
