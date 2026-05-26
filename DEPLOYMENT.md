# Deployment Guide for SonicBots

## Overview
This project is split into two parts:

1. `client/` — Next.js front end deployed to Vercel
2. `server/` — Node.js backend with Express and Socket.io deployed to a Node host

The backend must remain live for the app to work. The front end cannot host the Socket.io backend on Vercel reliably, so we use Vercel only for `client/`.

---

## Local development

From the repository root:

- Start backend: `npm start`
- Start frontend: `cd client && npm run dev`

Or from separate folders:

- Backend: `cd server && npm install && npm start`
- Frontend: `cd client && npm install && npm run dev`

The backend listens on `PORT` or `5000`.

---

## Production deployment flow

### Backend deployment

Deploy the backend folder separately to a Node-compatible host such as:

- Railway
- Render
- Fly
- Heroku
- DigitalOcean App Platform
- Any VPS with Node.js

Use:

- `cd server`
- `npm install`
- `npm start`

Set the host environment variable if required:

- `PORT` = 5000 (or leave default)

Once deployed, the backend URL should be a full WebSocket/HTTP origin, for example:

- `https://backend.example.com`

### Frontend deployment on Vercel

Deploy only the `client/` app to Vercel.

#### Option 1: Set project root to `client`

In the Vercel dashboard, create a new project and point the root directory to `client`.

- Framework Preset: `Next.js`
- Build command: `npm run build`
- Install command: `npm install`
- Output directory: leave blank

#### Option 2: Use the repository root and `vercel.json`

If you prefer to deploy from the repository root, use the provided `vercel.json` file.

### Required environment variable on Vercel

Add this variable in Vercel Project Settings:

- `NEXT_PUBLIC_SOCKET_URL` = `https://<your-backend-host>`

For example:

- `https://sonicbots-backend.example.com`

This tells the front end where to connect for Socket.io.

---

## Why this is required

- The front end is a static/Next.js app served by Vercel.
- The backend is a long-lived Socket.io server and cannot be hosted properly by Vercel functions.
- The app must connect to the backend URL with `NEXT_PUBLIC_SOCKET_URL` for login, authentication, chat, wallet, and Ludo gameplay.

---

## What was changed

- `index.js` root shim now starts `server/index.js`
- `package.json` root scripts now include `start` and `backend`
- `client/src/app/page.tsx` now uses `NEXT_PUBLIC_SOCKET_URL` and falls back to `window.location.protocol`

---

## Notes

- Keep the backend always running in production.
- The backend and frontend should use the same domain origin if possible, but can be separate hosts.
- If you change the backend host, update `NEXT_PUBLIC_SOCKET_URL` in Vercel.
