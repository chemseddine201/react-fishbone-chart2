const fs = require('fs-extra');
const path = require('path');

function copyNonTSFiles(srcDir, destDir) {
  const srcPath = path.resolve(__dirname, '..', srcDir);
  const destPath = path.resolve(__dirname, '..', destDir);

  try {
    // Copy all files except .ts, .tsx, .js, .jsx files
    fs.copySync(srcPath, destPath, {
      filter: (src) => {
        // Get the file extension
        const ext = path.extname(src);
        
        // Exclude TypeScript and JavaScript source files
        const excludedExtensions = ['.ts', '.tsx', '.js', '.jsx'];
        
        // Also exclude any hidden files or directories
        const isHidden = path.basename(src).startsWith('.');
        
        // Skip directories with node_modules or dist
        const isExcludedDir = 
          src.includes('node_modules') || 
          src.includes('/dist') ||
          src.includes('\\dist');
        
        // Only copy if:
        // 1. It's not a TypeScript/JavaScript source file
        // 2. It's not a hidden file/directory
        // 3. It's not in an excluded directory
        return !excludedExtensions.includes(ext) && 
               !isHidden && 
               !isExcludedDir;
      }
    });
    console.log('Non-TypeScript files copied successfully');
  } catch (err) {
    console.error('Error copying files:', err);
  }
}

// Adjust these paths as needed
copyNonTSFiles('src', 'dist/esm');
copyNonTSFiles('src', 'dist/cjs');