import config from '../config.js';
import Monitor from '../models/Monitor.js';
import PingResult from '../models/PingResult.js';
import { notify } from './notifier.js';

/**
 * Ping a single monitor's URL and record the result.
 */
export async function pingMonitor(monitor) {
  const start = performance.now();
  let statusCode = null;
  let isUp = false;
  let error = null;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), config.pingTimeout);

    const response = await fetch(monitor.url, {
      method: 'HEAD',
      signal: controller.signal,
      redirect: 'follow',
      headers: {
        'User-Agent': 'Lively-Monitor/1.0',
      },
    });

    clearTimeout(timeout);
    statusCode = response.status;

    // Consider any 2xx or 3xx as "up", or match expected status code
    isUp = statusCode === monitor.expectedStatusCode ||
      (statusCode >= 200 && statusCode < 400);
  } catch (err) {
    if (err.name === 'AbortError') {
      error = `Timeout after ${config.pingTimeout}ms`;
    } else {
      error = err.message || 'Unknown error';
    }
    isUp = false;
  }

  const responseTime = Math.round(performance.now() - start);

  // Save ping result
  const result = await PingResult.create({
    monitorId: monitor._id,
    statusCode,
    responseTime,
    isUp,
    error,
    checkedAt: new Date(),
  });

  // Detect state transitions for notifications
  const previousStatus = monitor.lastStatus;
  const newStatus = isUp ? 'up' : 'down';

  // Update monitor with latest status
  await Monitor.findByIdAndUpdate(monitor._id, {
    lastStatus: newStatus,
    lastResponseTime: responseTime,
    lastCheckedAt: new Date(),
  });

  // Notify on state transitions
  if (previousStatus === 'up' && newStatus === 'down') {
    notify({
      type: 'down',
      monitor,
      result,
      message: `🔴 ${monitor.name} (${monitor.url}) is DOWN! ${error || `Status: ${statusCode}`}`,
    });
  } else if (previousStatus === 'down' && newStatus === 'up') {
    notify({
      type: 'up',
      monitor,
      result,
      message: `🟢 ${monitor.name} (${monitor.url}) is back UP! Response: ${responseTime}ms`,
    });
  }

  return result;
}
