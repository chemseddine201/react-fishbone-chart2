const fs = require('fs-extra');
const path = require('path');

function copyNonTSFiles(srcDir, destDirs) {
  const destinations = Array.isArray(destDirs) ? destDirs : [destDirs];
  const srcPath = path.resolve(__dirname, '..', srcDir);
  const excludedExtensions = ['.ts', '.tsx', '.js', '.jsx'];

  try {
    // Copy to each destination
    destinations.forEach(destDir => {
      const destPath = path.resolve(__dirname, '..', destDir);
      fs.copySync(srcPath, destPath, {
        filter: (src) => {
          const isExcludedDir = src.includes('node_modules') || src.includes('/dist') || src.includes('\\dist');
          const isHidden = path.basename(src).startsWith('.');
          if(isExcludedDir || isHidden) {
            return false;
          }
          const ext = path.extname(src);
          return !excludedExtensions.includes(ext) && 
                 !isHidden && 
                 !isExcludedDir;
        }
      });
      console.log(`Non-TypeScript files copied to ${destPath} successfully`);
    });
  } catch (err) {
    console.error('Error copying files:', err);
  }
}

copyNonTSFiles('src', ['dist/esm', 'dist/cjs']);