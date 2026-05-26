const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log("=== SONICBOTS PRODUCTION BACKEND (AUTO-RECONNECT) ===");

// ─── 1. Start the Node.js backend server ────────────────────────────────────
const serverDir = path.join(__dirname, 'server');
console.log("Starting backend server in:", serverDir);

let backend = null;

function startBackend() {
  backend = spawn('node', ['index.js'], {
    cwd: serverDir,
    stdio: 'inherit',
    shell: true,
  });

  backend.on('error', (err) => {
    console.error("[Backend] Failed to start:", err.message);
  });

  backend.on('exit', (code) => {
    console.error("[Backend] Server exited with code", code, "— restarting in 3s...");
    setTimeout(startBackend, 3000);
  });
}

startBackend();

// ─── 2. Auto-reconnecting localtunnel ────────────────────────────────────────
// Using a fixed subdomain "sonicbots-neotalk-api" so the URL NEVER changes:
//   https://sonicbots-neotalk-api.loca.lt
// Even if the tunnel drops, it reconnects to the SAME URL automatically.
// This means you only have to set the Vercel env variable ONCE.

const SUBDOMAIN = 'sonicbots-neotalk-api';
const FIXED_URL  = `https://${SUBDOMAIN}.loca.lt`;

let tunnelProcess = null;
let tunnelRestartTimeout = null;

function startTunnel() {
  if (tunnelRestartTimeout) {
    clearTimeout(tunnelRestartTimeout);
    tunnelRestartTimeout = null;
  }

  console.log(`[Tunnel] Starting localtunnel (subdomain: ${SUBDOMAIN})...`);

  tunnelProcess = spawn(
    'npx',
    ['localtunnel', '--port', '5000', '--subdomain', SUBDOMAIN],
    { shell: true, windowsHide: false }
  );

  tunnelProcess.stdout.on('data', (data) => {
    const out = data.toString().trim();
    console.log("[Tunnel]", out);

    if (out.includes('your url is')) {
      const match = out.match(/your url is: (https?:\/\/[^\s]+)/);
      const url = match ? match[1] : FIXED_URL;
      
      if (url.toLowerCase() !== FIXED_URL.toLowerCase()) {
        console.warn(`[Tunnel] Warning: Received random URL (${url}) instead of requested subdomain (${FIXED_URL}). Reconnecting in 10s...`);
        // Kill the process. The 'close' or 'exit' event will automatically trigger a retry.
        tunnelProcess.kill();
        return;
      }

      fs.writeFileSync(path.join(__dirname, 'tunnel_url.txt'), url);
      console.log('\n==========================================');
      console.log('🚀 BACKEND IS LIVE!');
      console.log('   URL :', url);
      console.log('==========================================\n');
    }
  });

  tunnelProcess.stderr.on('data', (data) => {
    const msg = data.toString().trim();
    if (msg) console.error("[Tunnel Error]", msg);
  });

  tunnelProcess.on('close', (code) => {
    console.warn(`[Tunnel] Process exited (code ${code}) — reconnecting in 5s...`);
    tunnelProcess = null;
    tunnelRestartTimeout = setTimeout(startTunnel, 5000);
  });

  tunnelProcess.on('error', (err) => {
    console.error("[Tunnel] Spawn error:", err.message, "— reconnecting in 5s...");
    tunnelProcess = null;
    tunnelRestartTimeout = setTimeout(startTunnel, 5000);
  });
}

// Wait 2 seconds for the backend server to fully boot before opening the tunnel
setTimeout(startTunnel, 2000);

// ─── 3. Graceful shutdown ────────────────────────────────────────────────────
function shutdown() {
  console.log("\nShutting down...");
  if (tunnelRestartTimeout) clearTimeout(tunnelRestartTimeout);
  if (tunnelProcess)  tunnelProcess.kill();
  if (backend)        backend.kill();
  process.exit(0);
}

process.on('SIGINT',  shutdown);
process.on('SIGTERM', shutdown);
process.on('exit',    () => {
  if (tunnelProcess) tunnelProcess.kill();
  if (backend)       backend.kill();
});
