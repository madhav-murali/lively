import { Router } from 'express';
import Monitor from '../models/Monitor.js';
import PingResult from '../models/PingResult.js';
import { pingMonitor } from '../services/pinger.js';
import { startMonitor, stopMonitor } from '../services/scheduler.js';
import { createLimiter, pingNowLimiter } from '../middleware/rateLimiter.js';

const router = Router();

/**
 * GET /api/monitors
 * List all monitors with latest status info.
 */
router.get('/', async (req, res, next) => {
  try {
    const monitors = await Monitor.find().sort({ createdAt: -1 }).lean();

    // Enrich each monitor with uptime stats (last 24h)
    const enriched = await Promise.all(
      monitors.map(async (monitor) => {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const results = await PingResult.find({
          monitorId: monitor._id,
          checkedAt: { $gte: oneDayAgo },
        }).lean();

        const totalPings = results.length;
        const upPings = results.filter(r => r.isUp).length;
        const uptime24h = totalPings > 0 ? ((upPings / totalPings) * 100).toFixed(2) : null;
        const avgResponseTime = totalPings > 0
          ? Math.round(results.reduce((sum, r) => sum + r.responseTime, 0) / totalPings)
          : null;

        return {
          ...monitor,
          uptime24h: uptime24h ? parseFloat(uptime24h) : null,
          avgResponseTime,
          totalPings24h: totalPings,
        };
      })
    );

    res.json(enriched);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/monitors/:id
 * Get a single monitor with detailed stats.
 */
router.get('/:id', async (req, res, next) => {
  try {
    const monitor = await Monitor.findById(req.params.id).lean();
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });

    // Get uptime for multiple time ranges
    const ranges = [
      { label: '1h', ms: 60 * 60 * 1000 },
      { label: '24h', ms: 24 * 60 * 60 * 1000 },
      { label: '7d', ms: 7 * 24 * 60 * 60 * 1000 },
      { label: '30d', ms: 30 * 24 * 60 * 60 * 1000 },
    ];

    const uptimeStats = {};
    for (const range of ranges) {
      const since = new Date(Date.now() - range.ms);
      const results = await PingResult.find({
        monitorId: monitor._id,
        checkedAt: { $gte: since },
      }).lean();

      const total = results.length;
      const up = results.filter(r => r.isUp).length;
      uptimeStats[range.label] = total > 0
        ? parseFloat(((up / total) * 100).toFixed(2))
        : null;
    }

    res.json({ ...monitor, uptimeStats });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/monitors
 * Create a new monitor.
 */
router.post('/', createLimiter, async (req, res, next) => {
  try {
    const { name, url, interval, expectedStatusCode } = req.body;

    const monitor = await Monitor.create({
      name,
      url,
      interval,
      expectedStatusCode,
    });

    // Start monitoring immediately
    startMonitor(monitor);

    res.status(201).json(monitor);
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/monitors/:id
 * Update a monitor (pause/resume, change interval, etc).
 */
router.patch('/:id', async (req, res, next) => {
  try {
    const allowedFields = ['name', 'url', 'interval', 'expectedStatusCode', 'isActive'];
    const updates = {};
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    }

    const monitor = await Monitor.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });

    // Restart or stop the scheduler based on active status
    if (monitor.isActive) {
      startMonitor(monitor);
    } else {
      stopMonitor(monitor._id);
    }

    res.json(monitor);
  } catch (err) {
    next(err);
  }
});

/**
 * DELETE /api/monitors/:id
 * Delete a monitor and its ping history.
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const monitor = await Monitor.findByIdAndDelete(req.params.id);
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });

    // Stop the scheduler
    stopMonitor(monitor._id);

    // Clean up ping results
    await PingResult.deleteMany({ monitorId: monitor._id });

    res.json({ message: 'Monitor deleted', id: monitor._id });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/monitors/:id/ping
 * Manual "Ping Now" for a single monitor.
 */
router.post('/:id/ping', pingNowLimiter, async (req, res, next) => {
  try {
    const monitor = await Monitor.findById(req.params.id);
    if (!monitor) return res.status(404).json({ error: 'Monitor not found' });

    const result = await pingMonitor(monitor);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

export default router;
