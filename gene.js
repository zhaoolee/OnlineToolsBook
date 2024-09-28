const fs = require('fs');
const path = require('path');

const docsDir = './docs';

function extractTitle(content) {
    const match = content.match(/^---[\s\S]*?title:\s*(.+)[\s\S]*?---/m);
    return match ? match[1].trim() : null;
}

function slugify(title) {
    return title.toLowerCase()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
}

function generateTOC() {
    let tocEntries = [];
    
    fs.readdirSync(docsDir).forEach(file => {
        if (path.extname(file) === '.md') {
            const filePath = path.join(docsDir, file);
            const content = fs.readFileSync(filePath, 'utf8');
            const title = extractTitle(content);
            
            if (title) {
                tocEntries.push(`* [${title}](/${file})`);
            }
        }
    });
    
    // Sort entries in reverse order
    tocEntries.sort((a, b) => b.localeCompare(a));
    
    return tocEntries.join('\n');
}

const tableOfContents = generateTOC();
console.log(tableOfContents);

// Optionally, write the TOC to a file
// fs.writeFileSync('TABLE_OF_CONTENTS.md', tableOfContents);