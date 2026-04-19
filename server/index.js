import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import config from './config.js';
import monitorsRouter from './routes/monitors.js';
import resultsRouter from './routes/results.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initScheduler } from './services/scheduler.js';
import { seedMonitors } from './seed.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ---------- Middleware ----------
app.use(express.json());
app.use('/api', generalLimiter);

// ---------- API Routes ----------
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/monitors', monitorsRouter);
app.use('/api/monitors', resultsRouter);

// ---------- Serve Frontend (Production) ----------
if (config.isProduction) {
  const clientDist = path.join(__dirname, '..', 'client', 'dist');
  app.use(express.static(clientDist));
  
  // This is the v8+ way to do a catch-all route:
  // It captures everything into a parameter named '0'
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}
// ---------- Error Handler ----------
app.use(errorHandler);

// ---------- Start Server ----------
async function start() {
  try {
    console.log('[Server] Connecting to MongoDB...');
    await mongoose.connect(config.mongoUri);
    console.log('[Server] Connected to MongoDB ✓');

    // Seed default monitors
    await seedMonitors();

    // Start the ping scheduler
    await initScheduler();

    app.listen(config.port, () => {
      console.log(`\n🚀 Lively server running on http://localhost:${config.port}`);
      console.log(`📊 Health check: http://localhost:${config.port}/api/health\n`);
    });
  } catch (err) {
    console.error('[Server] Fatal error:', err);
    process.exit(1);
  }
}

start();
