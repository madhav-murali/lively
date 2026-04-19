function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ${minutes % 60}m`;
  const days = Math.floor(hours / 24);
  return `${days}d ${hours % 24}h`;
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function IncidentLog({ incidents }) {
  if (!incidents || incidents.length === 0) {
    return (
      <div className="incident-log" id="incident-log">
        <h3>Incident Log</h3>
        <div style={{
          textAlign: 'center',
          padding: '24px 0',
          color: '#5a5a6e',
          fontSize: '0.85rem',
        }}>
          🎉 No incidents recorded
        </div>
      </div>
    );
  }

  return (
    <div className="incident-log" id="incident-log">
      <h3>Incident Log ({incidents.length})</h3>
      {incidents.map((inc, i) => (
        <div className="incident-item" key={i}>
          <div className={`incident-icon ${inc.endedAt ? 'resolved' : ''}`}></div>
          <div className="incident-details">
            <div className="incident-time">
              {formatTime(inc.startedAt)}
              {inc.endedAt ? ` → ${formatTime(inc.endedAt)}` : ' → ongoing'}
            </div>
            <div className="incident-message">
              {inc.error || `HTTP ${inc.statusCode}`}
            </div>
          </div>
          <div className="incident-duration">
            {formatDuration(inc.durationMs)}
            {!inc.endedAt && (
              <span style={{ color: '#ff4757', marginLeft: '4px' }}>●</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
