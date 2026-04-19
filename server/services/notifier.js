import config from '../config.js';

// Cooldown tracking: prevent notification spam
const lastNotified = new Map(); // monitorId -> timestamp
const COOLDOWN_MS = 5 * 60 * 1000; // 5 minutes

/**
 * Send a notification for a monitor state change.
 */
export async function notify({ type, monitor, result, message }) {
  const monitorId = monitor._id.toString();
  const now = Date.now();

  // Check cooldown
  const last = lastNotified.get(monitorId);
  if (last && now - last < COOLDOWN_MS) {
    return; // Skip, in cooldown
  }
  lastNotified.set(monitorId, now);

  // Console notification (always)
  const timestamp = new Date().toISOString();
  if (type === 'down') {
    console.error(`\n⚠️  [${timestamp}] ALERT: ${message}\n`);
  } else {
    console.log(`\n✅ [${timestamp}] RECOVERY: ${message}\n`);
  }

  // Webhook notification (optional)
  if (config.webhookUrl) {
    try {
      await sendWebhook(config.webhookUrl, { type, monitor, result, message });
    } catch (err) {
      console.error('[Notifier] Webhook failed:', err.message);
    }
  }
}

/**
 * Send a webhook notification (Discord/Slack compatible format).
 */
async function sendWebhook(url, { type, monitor, message }) {
  const color = type === 'down' ? 0xff4757 : 0x2ed573;
  const title = type === 'down' ? '🔴 Service Down' : '🟢 Service Recovered';

  // Discord webhook format
  const payload = {
    embeds: [
      {
        title,
        description: message,
        color,
        fields: [
          { name: 'Service', value: monitor.name, inline: true },
          { name: 'URL', value: monitor.url, inline: true },
        ],
        timestamp: new Date().toISOString(),
        footer: { text: 'Lively Monitor' },
      },
    ],
  };

  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}
