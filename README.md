# NutriScan

A Progressive Web App for scanning food barcodes, calculating recipe nutrition, and tracking daily calorie/macro intake.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS (PWA)
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **APIs:** Open Food Facts, USDA FoodData Central

## Features

- Barcode scanning via device camera
- Recipe calculator — paste ingredients, get per-serving nutrition
- Daily nutrition dashboard (simple + advanced modes)
- Calendar view with per-day calorie history
- User onboarding with body stats and auto-calculated goals
- Saved recipes with quick-log

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or [MongoDB Atlas](https://www.mongodb.com/atlas))

### Installation

```bash
npm run install:all
```

### Environment Variables

Copy `server/.env.example` to `server/.env` and fill in your values:

```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nutriscan
JWT_SECRET=<random-string>
JWT_REFRESH_SECRET=<another-random-string>
USDA_API_KEY=<optional-usda-key>
CLIENT_URL=http://localhost:5173
LOG_LEVEL=info
```

### Development

```bash
npm run dev
```

Runs both client (port 5173) and server (port 5000) concurrently.

### Run Tests

```bash
npm test
```

## Production Deployment

### Option 1: Docker

```bash
docker build -t nutriscan .
docker run -p 5000:5000 \
  -e NODE_ENV=production \
  -e MONGODB_URI=<your-atlas-uri> \
  -e JWT_SECRET=<random-string> \
  -e JWT_REFRESH_SECRET=<random-string> \
  -e CLIENT_URL=https://your-domain.com \
  nutriscan
```

### Option 2: Platform (Railway, Render, Fly.io)

1. Set the build command to `npm run install:all && npm run build`
2. Set the start command to `npm start`
3. Configure environment variables:
   - `NODE_ENV=production`
   - `MONGODB_URI` — your MongoDB Atlas connection string
   - `JWT_SECRET` — a random 32+ character string
   - `JWT_REFRESH_SECRET` — a different random string
   - `CLIENT_URL` — your production URL (for CORS)
   - `PORT` — usually set automatically by the platform

### Required for Production

- `NODE_ENV=production` — enables static file serving, secure cookies, error hiding
- `MONGODB_URI` — Atlas connection string with IP whitelist configured
- `JWT_SECRET` and `JWT_REFRESH_SECRET` — strong random strings (use `openssl rand -hex 32`)
- `CLIENT_URL` — your production domain for CORS

## Project Structure

```
├── client/          React PWA (Vite)
├── server/          Express API
├── Dockerfile       Multi-stage production build
├── .github/         CI/CD pipeline
└── package.json     Root scripts
```
