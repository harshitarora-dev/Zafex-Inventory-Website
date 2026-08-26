const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const FRONTEND_DIST = path.resolve(ROOT, 'artifacts', 'zafex-collectibles', 'dist', 'public');
const BACKEND_DIST = path.resolve(ROOT, 'artifacts', 'api-server', 'dist');

const HOSTINGER_FRONTEND = path.resolve(ROOT, 'hostinger-frontend');
const HOSTINGER_BACKEND = path.resolve(ROOT, 'hostinger-backend');

function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();
  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursiveSync(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

console.log('🚀 Syncing fresh frontend build to hostinger-frontend...');
if (fs.existsSync(FRONTEND_DIST)) {
  // Copy assets folder
  const srcAssets = path.join(FRONTEND_DIST, 'assets');
  const destAssets = path.join(HOSTINGER_FRONTEND, 'assets');
  if (fs.existsSync(srcAssets)) {
    // Clean old assets
    if (fs.existsSync(destAssets)) {
      fs.rmSync(destAssets, { recursive: true, force: true });
    }
    copyRecursiveSync(srcAssets, destAssets);
  }

  // Copy index.html, favicon.svg, logo.png, robots.txt
  ['index.html', 'favicon.svg', 'logo.png', 'robots.txt'].forEach((file) => {
    const srcFile = path.join(FRONTEND_DIST, file);
    const destFile = path.join(HOSTINGER_FRONTEND, file);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
    }
  });

  console.log('✅ Frontend synced successfully!');
} else {
  console.warn('⚠️ Frontend dist folder not found!');
}

console.log('🚀 Syncing fresh backend build to hostinger-backend...');
if (fs.existsSync(BACKEND_DIST)) {
  const files = fs.readdirSync(BACKEND_DIST);
  files.forEach((file) => {
    const src = path.join(BACKEND_DIST, file);
    const dest = path.join(HOSTINGER_BACKEND, file);
    fs.copyFileSync(src, dest);
  });
  console.log('✅ Backend index.mjs synced successfully!');
} else {
  console.warn('⚠️ Backend dist folder not found!');
}

console.log('\n🎉 All Hostinger deployment packages are up-to-date!');
