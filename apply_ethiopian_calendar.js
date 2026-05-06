const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'src');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function processFile(filePath) {
  if (!filePath.endsWith('.jsx') && !filePath.endsWith('.js')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  let changed = false;

  // 1. Check if we need formatToEthiopian
  if (content.includes('toLocaleDateString')) {
    // If we have toLocaleDateString, we need to import formatToEthiopian
    if (!content.includes('formatToEthiopian')) {
      const depth = filePath.replace(srcDir, '').split(path.sep).length - 2;
      const relativePath = depth <= 0 ? './utils/ethiopianDate' : '../'.repeat(depth) + 'utils/ethiopianDate';
      content = `import { formatToEthiopian } from "${relativePath}";\n` + content;
    }
    
    // Replace new Date(...).toLocaleDateString(...) 
    // Example: new Date(m.join_date).toLocaleDateString() -> formatToEthiopian(m.join_date)
    // Example: new Date(e.event_date).toLocaleDateString('en-US', ...) -> formatToEthiopian(e.event_date)
    // We will use regex to find new Date(XXX).toLocaleDateString(YYY)
    content = content.replace(/new Date\(([^)]+)\)\.toLocaleDateString\([^)]*\)/g, 'formatToEthiopian($1)');
    content = content.replace(/new Date\(([^)]+)\)\.toLocaleDateString\(\)/g, 'formatToEthiopian($1)');
    content = content.replace(/new Date\(\)\.toLocaleDateString\([^)]*\)/g, 'formatToEthiopian(new Date())');
    
    // Some are date.toLocaleDateString...
    content = content.replace(/date\.toLocaleDateString\([^)]*\)/g, 'formatToEthiopian(date)');
  }

  // 2. Check if we need EtDatePicker
  if (content.includes('type="date"') && !filePath.includes('EtDatePicker.jsx')) {
    if (!content.includes('EtDatePicker')) {
      const depth = filePath.replace(srcDir, '').split(path.sep).length - 2;
      const relativePath = depth <= 0 ? './components/common/EtDatePicker' : '../'.repeat(depth) + 'components/common/EtDatePicker';
      content = `import EtDatePicker from "${relativePath}";\n` + content;
    }

    // Replace <Input type="date" ... /> -> <EtDatePicker ... />
    // Replace <input type="date" ... /> -> <EtDatePicker ... />
    content = content.replace(/<Input[^>]*type="date"[^>]*>/g, (match) => {
      let newTag = match.replace(/<Input/, '<EtDatePicker').replace(/type="date"\s*/, '');
      return newTag;
    });
    
    content = content.replace(/<input[^>]*type="date"[^>]*>/g, (match) => {
      let newTag = match.replace(/<input/, '<EtDatePicker').replace(/type="date"\s*/, '');
      return newTag;
    });
  }

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log('Updated:', filePath);
  }
}

walkDir(srcDir, processFile);
console.log('Done!');
