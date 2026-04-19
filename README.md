# 🚀 Lively — Latency Monitor & Health Dashboard

A real-time dashboard that pings your URLs, tracks response times, status codes, and uptime, and alerts you when services go down.

![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![License](https://img.shields.io/badge/License-MIT-blue)

## Features

- 📊 **Real-time Dashboard** — Monitor all your services at a glance
- ⚡ **Instant Ping** — On-demand "Ping Now" for any monitor
- 📈 **Response Time Charts** — Beautiful area charts with multiple time ranges
- 📅 **90-Day Uptime Bar** — GitHub-style uptime visualization
- 🔔 **Down Alerts** — Console notifications + optional Discord/Slack webhooks
- 🎯 **Rate Limiting** — Built-in API protection against abuse
- 🌱 **Auto-Seed** — Starts with sample monitors (Google, GitHub, Cloudflare)
- 🚢 **Deploy-Ready** — One-click deploy to Railway

## Quick Start

### Prerequisites

- **Node.js 18+**
- **MongoDB** (local or [Atlas free tier](https://www.mongodb.com/atlas/database))

### Install & Run

```bash
# Clone
git clone <your-repo-url> lively
cd lively

# Install dependencies
npm install
cd client && npm install && cd ..

# Set up environment
cp .env.example .env
# Edit .env with your MongoDB URI

# Run both servers (backend + frontend)
npm run dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/api/health

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `GET` | `/api/monitors` | List all monitors |
| `POST` | `/api/monitors` | Add monitor |
| `PATCH` | `/api/monitors/:id` | Update monitor |
| `DELETE` | `/api/monitors/:id` | Delete monitor |
| `POST` | `/api/monitors/:id/ping` | Manual ping |
| `GET` | `/api/monitors/:id/results` | Ping history |
| `GET` | `/api/monitors/:id/stats` | Aggregated stats |
| `GET` | `/api/monitors/:id/daily-uptime` | Daily uptime % |
| `GET` | `/api/monitors/:id/incidents` | Incident log |

## Deployment (Railway)

1. Push to GitHub
2. Connect repo on [Railway](https://railway.app)
3. Add a MongoDB plugin
4. Set `MONGODB_URI` environment variable
5. Deploy — Railway will auto-detect the `railway.json` config

## Tech Stack

- **Backend**: Node.js, Express, Mongoose
- **Database**: MongoDB (Atlas free tier)
- **Frontend**: React 19, Vite, Recharts
- **Monitoring**: native `fetch`, `node-cron`
- **Security**: `express-rate-limit`

## License

MIT
