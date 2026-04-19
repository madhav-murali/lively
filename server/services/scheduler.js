import cron from 'node-cron';
import Monitor from '../models/Monitor.js';
import { pingMonitor } from './pinger.js';

// Map of monitorId -> cron task
const activeTasks = new Map();

/**
 * Convert seconds interval to a cron expression.
 * For intervals < 60s, we use setInterval instead of cron.
 */
function createTask(monitor) {
  const intervalSec = monitor.interval;

  if (intervalSec < 60) {
    // node-cron minimum is 1 minute, so use setInterval for sub-minute
    const intervalId = setInterval(async () => {
      try {
        await pingMonitor(monitor);
      } catch (err) {
        console.error(`[Scheduler] Error pinging ${monitor.name}:`, err.message);
      }
    }, intervalSec * 1000);

    return {
      stop: () => clearInterval(intervalId),
      type: 'interval',
    };
  }

  // Convert seconds to cron: every N minutes
  const intervalMin = Math.max(1, Math.round(intervalSec / 60));
  const cronExpr = `*/${intervalMin} * * * *`;

  const task = cron.schedule(cronExpr, async () => {
    try {
      await pingMonitor(monitor);
    } catch (err) {
      console.error(`[Scheduler] Error pinging ${monitor.name}:`, err.message);
    }
  });

  return { stop: () => task.stop(), type: 'cron', expr: cronExpr };
}

/**
 * Start monitoring a single monitor.
 */
export function startMonitor(monitor) {
  // Stop existing task if any
  stopMonitor(monitor._id.toString());

  if (!monitor.isActive) return;

  const task = createTask(monitor);
  activeTasks.set(monitor._id.toString(), task);

  console.log(
    `[Scheduler] Started monitoring "${monitor.name}" every ${monitor.interval}s`
  );

  // Immediately run first ping
  pingMonitor(monitor).catch(err =>
    console.error(`[Scheduler] Initial ping error for ${monitor.name}:`, err.message)
  );
}

/**
 * Stop monitoring a single monitor.
 */
export function stopMonitor(monitorId) {
  const id = monitorId.toString();
  const task = activeTasks.get(id);
  if (task) {
    task.stop();
    activeTasks.delete(id);
    console.log(`[Scheduler] Stopped monitoring ${id}`);
  }
}

/**
 * Initialize scheduler: load all active monitors and start them.
 */
export async function initScheduler() {
  const monitors = await Monitor.find({ isActive: true });
  console.log(`[Scheduler] Loading ${monitors.length} active monitor(s)...`);

  for (const monitor of monitors) {
    startMonitor(monitor);
  }
}

/**
 * Stop all monitors.
 */
export function stopAll() {
  for (const [id, task] of activeTasks) {
    task.stop();
  }
  activeTasks.clear();
  console.log('[Scheduler] All monitors stopped.');
}
