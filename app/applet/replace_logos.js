const fs = require('fs');
const path = require('path');

const urlsToReplace = [
  "https://i.postimg.cc/pd0P8t4L/1000097620_removebg_preview.png",
  "https://i.postimg.cc/qq3vPB49/1000105226-removebg-preview.png",
  "https://i.postimg.cc/3N279HyV/1000105226-removebg-preview.png",
  "https://i.postimg.cc/fy0xzPn4/android-chrome-512x512.png"
];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('./src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    urlsToReplace.forEach(url => {
      if (content.includes(url)) {
        content = content.split(url).join('/logo.png');
        modified = true;
      }
    });
    if (modified) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log('Updated: ' + filePath);
    }
  }
});
