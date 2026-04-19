import StatusBadge from './StatusBadge';

function getResponseTimeColor(ms) {
  if (ms === null || ms === undefined) return 'var(--text-muted)';
  if (ms < 200) return 'var(--rt-fast)';
  if (ms < 500) return 'var(--rt-medium)';
  return 'var(--rt-slow)';
}

function formatInterval(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${Math.round(seconds / 3600)}h`;
}

export default function MonitorCard({
  monitor,
  onClick,
  onPause,
  onDelete,
  onPingNow,
}) {
  const status = monitor.lastStatus || 'pending';
  const rtColor = getResponseTimeColor(monitor.lastResponseTime);

  return (
    <div
      className={`monitor-card status-${status}`}
      onClick={() => onClick(monitor._id)}
      id={`monitor-card-${monitor._id}`}
    >
      <div className="monitor-card-header">
        <div className="monitor-info">
          <div className="monitor-name">{monitor.name}</div>
          <div className="monitor-url">{monitor.url}</div>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="monitor-card-stats">
        <div className="monitor-stat">
          <div className="monitor-stat-label">Response</div>
          <div className="monitor-stat-value" style={{ color: rtColor }}>
            {monitor.lastResponseTime !== null
              ? `${monitor.lastResponseTime}ms`
              : '—'}
          </div>
        </div>
        <div className="monitor-stat">
          <div className="monitor-stat-label">Uptime 24h</div>
          <div
            className="monitor-stat-value"
            style={{
              color:
                monitor.uptime24h === null
                  ? 'var(--text-muted)'
                  : monitor.uptime24h >= 99
                    ? 'var(--status-up)'
                    : monitor.uptime24h >= 95
                      ? 'var(--status-warning)'
                      : 'var(--status-down)',
            }}
          >
            {monitor.uptime24h !== null
              ? `${monitor.uptime24h}%`
              : '—'}
          </div>
        </div>
        <div className="monitor-stat">
          <div className="monitor-stat-label">Avg Response</div>
          <div
            className="monitor-stat-value"
            style={{ color: getResponseTimeColor(monitor.avgResponseTime) }}
          >
            {monitor.avgResponseTime !== null
              ? `${monitor.avgResponseTime}ms`
              : '—'}
          </div>
        </div>
      </div>

      <div className="monitor-card-actions" onClick={e => e.stopPropagation()}>
        <div className="actions-left">
          <button
            className="btn btn-sm"
            onClick={() => onPingNow(monitor._id)}
            title="Ping Now"
          >
            ⚡ Ping
          </button>
          <button
            className="btn btn-sm"
            onClick={() => onPause(monitor._id, monitor.isActive)}
            title={monitor.isActive ? 'Pause' : 'Resume'}
          >
            {monitor.isActive ? '⏸ Pause' : '▶ Resume'}
          </button>
        </div>
        <button
          className="btn btn-sm btn-danger"
          onClick={() => onDelete(monitor._id, monitor.name)}
          title="Delete"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
