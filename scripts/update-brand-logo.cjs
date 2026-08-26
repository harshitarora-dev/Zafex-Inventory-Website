const fs = require('fs');
const path = require('path');

const srcLogo = "C:\\Users\\abc\\.gemini\\antigravity-ide\\brain\\d50ebc1b-4772-43a4-9cdf-c483c21b068b\\.user_uploaded\\media_1787725412626.png";

if (!fs.existsSync(srcLogo)) {
  console.error("Source logo does not exist:", srcLogo);
  process.exit(1);
}

const logoBuffer = fs.readFileSync(srcLogo);
const base64Logo = logoBuffer.toString('base64');

const destinations = [
  path.resolve(__dirname, '../artifacts/zafex-collectibles/public/logo.png'),
  path.resolve(__dirname, '../artifacts/zafex-collectibles/public/images/logo.png'),
  path.resolve(__dirname, '../artifacts/zafex-collectibles/dist/public/logo.png'),
  path.resolve(__dirname, '../artifacts/zafex-collectibles/dist/public/images/logo.png'),
  path.resolve(__dirname, '../hostinger-frontend/logo.png'),
  path.resolve(__dirname, '../hostinger-frontend/images/logo.png'),
  path.resolve(__dirname, '../Zafex-Inventory-System-main/artifacts/zafex-collectibles/public/logo.png'),
  path.resolve(__dirname, '../attached_assets/logo.png'),
];

for (const dest of destinations) {
  try {
    const parent = path.dirname(dest);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.writeFileSync(dest, logoBuffer);
    console.log("Updated logo at:", dest);
  } catch (err) {
    console.warn("Could not copy to", dest, err.message);
  }
}

// Generate new SVG Favicon with the new logo
const svgFavicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <image href="data:image/png;base64,${base64Logo}" width="512" height="512" preserveAspectRatio="xMidYMid meet" />
</svg>
`;

const svgTargets = [
  path.resolve(__dirname, '../artifacts/zafex-collectibles/public/favicon.svg'),
  path.resolve(__dirname, '../artifacts/zafex-collectibles/dist/public/favicon.svg'),
  path.resolve(__dirname, '../hostinger-frontend/favicon.svg'),
];

for (const target of svgTargets) {
  try {
    const parent = path.dirname(target);
    if (!fs.existsSync(parent)) {
      fs.mkdirSync(parent, { recursive: true });
    }
    fs.writeFileSync(target, svgFavicon);
    console.log("Updated favicon at:", target);
  } catch (err) {
    console.warn("Could not write favicon to", target, err.message);
  }
}

console.log("All logo files and favicons successfully updated!");
