const fs = require('fs');
const path = require('path');

const minSize = 50 * 1024 * 1024; // 50MB
const results = [];

function scanDir(dir) {
    try {
        const files = fs.readdirSync(dir, { withFileTypes: true });
        for (const file of files) {
            const fullPath = path.join(dir, file.name);
            if (file.isDirectory()) {
                // Skip symbolic links, junction points, or AppData/Local/History etc
                if (file.name === 'AppData' && !dir.endsWith('AKAM')) {
                    continue;
                }
                scanDir(fullPath);
            } else if (file.isFile()) {
                try {
                    const stats = fs.statSync(fullPath);
                    if (stats.size >= minSize) {
                        results.push({
                            path: fullPath,
                            sizeMB: Math.round(stats.size / (1024 * 1024))
                        });
                    }
                } catch (e) {}
            }
        }
    } catch (e) {}
}

console.log("Scanning C:\\Users\\AKAM...");
scanDir("C:\\Users\\AKAM");

results.sort((a, b) => b.sizeMB - a.sizeMB);
console.log("\nTop 50 large files in C:\\Users\\AKAM:");
results.slice(0, 50).forEach(r => {
    console.log(`${r.sizeMB} MB - ${r.path}`);
});
