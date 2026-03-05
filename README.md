# NutriScan

A Progressive Web App for scanning food barcodes and tracking daily nutrition intake.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS (PWA)
- **Backend:** Node.js + Express
- **Database:** MongoDB (Mongoose)
- **APIs:** Open Food Facts, USDA FoodData Central

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas connection string)

### Installation

```bash
npm run install:all
```

### Environment Variables

Create `server/.env`:

```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nutriscan
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret
USDA_API_KEY=your_usda_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLIENT_URL=http://localhost:5173
```

### Development

```bash
npm run dev
```

Runs both client (port 5173) and server (port 5000) concurrently.
