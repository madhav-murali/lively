import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const PERIODS = [
  { label: '1H', hours: 1 },
  { label: '6H', hours: 6 },
  { label: '24H', hours: 24 },
  { label: '7D', hours: 168 },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div style={{
      background: '#0d0d15',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '8px',
      padding: '10px 14px',
      fontSize: '0.8rem',
    }}>
      <div style={{ color: '#8a8a9a', marginBottom: '4px' }}>{label}</div>
      <div style={{ color: '#00d4aa', fontWeight: 600 }}>
        {payload[0].value}ms
      </div>
      {payload[0].payload.statusCode && (
        <div style={{ color: '#8a8a9a', fontSize: '0.72rem' }}>
          Status: {payload[0].payload.statusCode}
        </div>
      )}
    </div>
  );
}

export default function ResponseChart({ results, onPeriodChange }) {
  const [period, setPeriod] = useState(24);

  const handlePeriod = (hours) => {
    setPeriod(hours);
    if (onPeriodChange) onPeriodChange(hours);
  };

  const chartData = (results || [])
    .slice()
    .reverse()
    .map(r => ({
      time: new Date(r.checkedAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      }),
      responseTime: r.responseTime,
      statusCode: r.statusCode,
    }));

  return (
    <div className="chart-container" id="response-chart">
      <div className="chart-header">
        <span className="chart-title">Response Time</span>
        <div className="chart-period-selector">
          {PERIODS.map(p => (
            <button
              key={p.hours}
              className={`chart-period-btn ${period === p.hours ? 'active' : ''}`}
              onClick={() => handlePeriod(p.hours)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {chartData.length > 0 ? (
        <ResponsiveContainer width="100%" height={220}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorRT" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#00d4aa" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#00d4aa" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.04)"
              vertical={false}
            />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 11, fill: '#5a5a6e' }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#5a5a6e' }}
              tickLine={false}
              axisLine={false}
              unit="ms"
              width={55}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="responseTime"
              stroke="#00d4aa"
              strokeWidth={2}
              fill="url(#colorRT)"
              dot={false}
              activeDot={{ r: 4, fill: '#00d4aa', strokeWidth: 0 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      ) : (
        <div style={{
          textAlign: 'center',
          padding: '40px',
          color: '#5a5a6e',
          fontSize: '0.85rem',
        }}>
          No data yet — check back after a few pings
        </div>
      )}
    </div>
  );
}
