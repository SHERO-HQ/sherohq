const fs = require('fs');
const path = require('path');

const walkSync = function (dir, filelist = []) {
  const files = fs.readdirSync(dir);
  files.forEach(function (file) {
    const filepath = path.join(dir, file);
    if (fs.statSync(filepath).isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else {
      filelist.push(filepath);
    }
  });
  return filelist;
};

const tsFiles = walkSync('./src').filter(f => f.endsWith('.ts') || f.endsWith('.tsx'));

const REPLACEMENT = '.toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })';

let totalReplaced = 0;

tsFiles.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  let changed = false;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];

    // Only replace .toLocaleString() if it doesn't look like a date
    if (line.includes('.toLocaleString()') && !line.includes('Date(') && !line.includes('scheduleAt')) {
      // Check if it's related to currency (contains GHS, price, total, amount, value, revenue, expenses, profit, Item)
      const isCurrency = /(GHS|price|total|amount|value|revenue|expenses|profit|count)/i.test(line);

      if (isCurrency) {
        lines[i] = line.replace(/\.toLocaleString\(\)/g, REPLACEMENT);
        changed = true;
        totalReplaced++;
      }
    }
  }

  if (changed) {
    fs.writeFileSync(file, lines.join('\n'), 'utf8');
    console.log('Updated', file);
  }
});

console.log('Total replacements:', totalReplaced);
