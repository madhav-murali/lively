import { useState } from 'react';

export default function UptimeBar({ data }) {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (!data || data.length === 0) {
    return null;
  }

  const getClass = (uptime) => {
    if (uptime === null) return 'no-data';
    if (uptime >= 99.5) return 'excellent';
    if (uptime >= 95) return 'good';
    if (uptime >= 80) return 'degraded';
    return 'down';
  };

  // Calculate overall uptime
  const validDays = data.filter(d => d.uptime !== null);
  const overallUptime = validDays.length > 0
    ? (validDays.reduce((sum, d) => sum + d.uptime, 0) / validDays.length).toFixed(2)
    : null;

  return (
    <div className="uptime-bar-container" id="uptime-bar">
      <div className="uptime-bar-label">
        <span>{data.length} days ago</span>
        <span>
          {overallUptime !== null ? `${overallUptime}% uptime` : 'No data'}
        </span>
        <span>Today</span>
      </div>
      <div className="uptime-bar">
        {data.map((day, i) => (
          <div
            key={day.date}
            className={`uptime-bar-segment ${getClass(day.uptime)}`}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(null)}
          >
            {hoveredIdx === i && (
              <div className="uptime-bar-tooltip">
                <strong>{day.date}</strong>
                <br />
                {day.uptime !== null ? `${day.uptime}%` : 'No data'}
                {day.totalPings > 0 && ` (${day.totalPings} pings)`}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
