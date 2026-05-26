# Deploying the `server/` backend to Railway

This file contains step-by-step instructions to deploy the backend to Railway (quick, reliable WebSocket support).

Prerequisites
- A Railway account connected to your GitHub repository.
- Your `server/` folder committed and pushed to the repo.

Steps (Railway web UI)
1. Commit & push the `Procfile` and `start` script changes:
```bash
git add server/Procfile server/package.json
git commit -m "chore(server): add start script and Procfile for Railway"
git push
```
2. In Railway:
  - Create a new Project → Deploy from GitHub.
  - Select your repository and pick the branch you pushed to.
  - When adding a Service, choose the `server/` directory as the service root.
  - Railway will detect Node.js. Ensure the Start Command is `npm start` (the `Procfile` is also supported).
3. Add environment variables in Railway (Project → Variables):
  - `PORT` (optional; Railway sets one automatically)
  - `MONGO_URI`, `GEMINI_API_KEY`, `JWT_SECRET` (if used)

4. Deploy. After successful deployment Railway will provide a public HTTPS URL (e.g. `https://your-service.up.railway.app`).

Post-deploy steps
- In the deployed frontend (sonicbots.vercel.app) open the Backend Socket URL field and paste the Railway base URL (do NOT include `/socket.io`), then click Save & Reconnect.
- Or set `NEXT_PUBLIC_SOCKET_URL` in Vercel environment variables to the Railway URL and redeploy the frontend so all visitors automatically connect.

Troubleshooting
- If sockets still fail, check Railway logs for errors and ensure `server/index.js` is listening on `process.env.PORT` (it already does).
- Verify `/socket.io/?EIO=4&transport=polling` returns 200 by running:
  ```bash
  curl https://your-service.up.railway.app/socket.io/?EIO=4&transport=polling
  ```

If you want, I can attempt to run the Railway CLI deploy here — paste your Railway API key and I'll proceed, or I can walk you through the web UI step-by-step.
