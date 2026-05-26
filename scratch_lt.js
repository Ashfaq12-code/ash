const fs = require('fs');
const { exec } = require('child_process');

console.log("Starting localtunnel via npx...");
const child = exec('npx localtunnel --port 5000');

child.stdout.on('data', (data) => {
    const output = data.toString();
    console.log("LT Output:", output);
    const match = output.match(/your url is: (\https:\/\/[^\s]+)/);
    if (match) {
        const url = match[1];
        console.log("FOUND URL:", url);
        fs.writeFileSync('tunnel_url.txt', url);
    }
});

child.stderr.on('data', (data) => {
    console.error("LT Error:", data.toString());
});

child.on('close', (code) => {
    console.log("localtunnel process exited with code", code);
});

// Keep process alive for 30 seconds to capture the URL
setTimeout(() => {
    console.log("Finished waiting for URL.");
    process.exit(0);
}, 25000);
