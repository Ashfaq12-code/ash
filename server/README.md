# Server Deployment Guide

This backend is the Node.js Socket.io server for SonicBots.

## Run locally

```bash
cd server
npm install
npm start
```

The server listens on `process.env.PORT` or `5000` by default.

## Production deployment

Deploy this folder to any Node host that supports long-lived processes.

### Recommended hosts

- Railway
- Render
- Fly
- Heroku
- DigitalOcean App Platform
- Any VPS with Node.js

### Required configuration

- Install dependencies: `npm install`
- Start command: `npm start`
- Environment variables:
  - `PORT` (optional; defaults to `5000`)
  - `GEMINI_API_KEY` (optional, if using Google Gemini)

### Example deployment steps

On a host that provides a Git repository or deploy button:

1. Push this repo or the `server/` folder to the host.
2. Configure the start command as `npm start`.
3. Ensure the host exposes the port from `PORT`.
4. Deploy.

### Backend URL

Once deployed, the backend will be reachable at a URL like:

- `https://your-backend-host.example`

Then set this in the frontend deployment as:

- `NEXT_PUBLIC_SOCKET_URL=https://your-backend-host.example`

## Notes

- The frontend cannot use this backend unless it is running continuously.
- Vercel is only intended for the `client/` app, not the Socket.io backend.
- Make sure the deployed backend allows WebSocket connections.
