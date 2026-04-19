import { Router } from 'express';
import PingResult from '../models/PingResult.js';

const router = Router();

/**
 * GET /api/monitors/:id/results
 * Get ping history for a monitor.
 * Query params: ?hours=24 (default 24), ?limit=500 (default 500)
 */
router.get('/:id/results', async (req, res, next) => {
  try {
    const hours = parseInt(req.query.hours || '24', 10);
    const limit = Math.min(parseInt(req.query.limit || '500', 10), 1000);
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const results = await PingResult.find({
      monitorId: req.params.id,
      checkedAt: { $gte: since },
    })
      .sort({ checkedAt: -1 })
      .limit(limit)
      .lean();

    res.json(results);
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/monitors/:id/stats
 * Aggregated stats for a monitor.
 */
router.get('/:id/stats', async (req, res, next) => {
  try {
    const hours = parseInt(req.query.hours || '24', 10);
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);

    const results = await PingResult.find({
      monitorId: req.params.id,
      checkedAt: { $gte: since },
    }).lean();

    if (results.length === 0) {
      return res.json({
        totalPings: 0,
        uptime: null,
        avgResponseTime: null,
        minResponseTime: null,
        maxResponseTime: null,
        incidents: 0,
      });
    }

    const totalPings = results.length;
    const upPings = results.filter(r => r.isUp).length;
    const uptime = parseFloat(((upPings / totalPings) * 100).toFixed(2));
    const responseTimes = results.map(r => r.responseTime);
    const avgResponseTime = Math.round(
      responseTimes.reduce((a, b) => a + b, 0) / totalPings
    );
    const minResponseTime = Math.min(...responseTimes);
    const maxResponseTime = Math.max(...responseTimes);

    // Count incidents (transitions from up to down)
    let incidents = 0;
    const sorted = [...results].sort((a, b) => a.checkedAt - b.checkedAt);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i - 1].isUp && !sorted[i].isUp) {
        incidents++;
      }
    }

    res.json({
      totalPings,
      uptime,
      avgResponseTime,
      minResponseTime,
      maxResponseTime,
      incidents,
    });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/monitors/:id/daily-uptime
 * Get daily uptime percentages for the last N days (for uptime bar chart).
 */
router.get('/:id/daily-uptime', async (req, res, next) => {
  try {
    const days = Math.min(parseInt(req.query.days || '90', 10), 90);
    const results = [];

    for (let i = 0; i < days; i++) {
      const dayStart = new Date();
      dayStart.setHours(0, 0, 0, 0);
      dayStart.setDate(dayStart.getDate() - i);

      const dayEnd = new Date(dayStart);
      dayEnd.setDate(dayEnd.getDate() + 1);

      const pings = await PingResult.find({
        monitorId: req.params.id,
        checkedAt: { $gte: dayStart, $lt: dayEnd },
      }).lean();

      const total = pings.length;
      const up = pings.filter(p => p.isUp).length;

      results.push({
        date: dayStart.toISOString().split('T')[0],
        uptime: total > 0 ? parseFloat(((up / total) * 100).toFixed(2)) : null,
        totalPings: total,
      });
    }

    res.json(results.reverse()); // oldest first
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/monitors/:id/incidents
 * Get incident log (downtime events with duration).
 */
router.get('/:id/incidents', async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || '20', 10), 50);
    const results = await PingResult.find({
      monitorId: req.params.id,
    })
      .sort({ checkedAt: -1 })
      .limit(2000) // Scan enough results to find incidents
      .lean();

    if (results.length === 0) return res.json([]);

    const sorted = [...results].sort((a, b) =>
      new Date(a.checkedAt) - new Date(b.checkedAt)
    );

    // Find incident windows (contiguous blocks of isUp=false)
    const incidents = [];
    let incidentStart = null;

    for (let i = 0; i < sorted.length; i++) {
      if (!sorted[i].isUp && !incidentStart) {
        incidentStart = sorted[i];
      } else if (sorted[i].isUp && incidentStart) {
        const duration = new Date(sorted[i].checkedAt) - new Date(incidentStart.checkedAt);
        incidents.push({
          startedAt: incidentStart.checkedAt,
          endedAt: sorted[i].checkedAt,
          durationMs: duration,
          error: incidentStart.error,
          statusCode: incidentStart.statusCode,
        });
        incidentStart = null;
      }
    }

    // If currently in an incident
    if (incidentStart) {
      incidents.push({
        startedAt: incidentStart.checkedAt,
        endedAt: null, // ongoing
        durationMs: Date.now() - new Date(incidentStart.checkedAt).getTime(),
        error: incidentStart.error,
        statusCode: incidentStart.statusCode,
      });
    }

    res.json(incidents.reverse().slice(0, limit));
  } catch (err) {
    next(err);
  }
});

export default router;
