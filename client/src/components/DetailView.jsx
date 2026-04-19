import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import StatusBadge from './StatusBadge';
import UptimeBar from './UptimeBar';
import ResponseChart from './ResponseChart';
import IncidentLog from './IncidentLog';

export default function DetailView({ monitorId, onBack }) {
  const [monitor, setMonitor] = useState(null);
  const [results, setResults] = useState([]);
  const [dailyUptime, setDailyUptime] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (hours = 24) => {
    try {
      const [mon, res, daily, inc, st] = await Promise.all([
        api.getMonitor(monitorId),
        api.getResults(monitorId, hours),
        api.getDailyUptime(monitorId),
        api.getIncidents(monitorId),
        api.getStats(monitorId, hours),
      ]);
      setMonitor(mon);
      setResults(res);
      setDailyUptime(daily);
      setIncidents(inc);
      setStats(st);
    } catch (err) {
      console.error('Failed to fetch monitor details:', err);
    } finally {
      setLoading(false);
    }
  }, [monitorId]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => fetchData(), 30000);
    return () => clearInterval(interval);
  }, [fetchData]);

  const handlePeriodChange = (hours) => {
    api.getResults(monitorId, hours).then(setResults).catch(console.error);
    api.getStats(monitorId, hours).then(setStats).catch(console.error);
  };

  if (loading) {
    return (
      <div className="detail-view">
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Loading...
        </div>
      </div>
    );
  }

  if (!monitor) {
    return (
      <div className="detail-view">
        <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          Monitor not found
        </div>
      </div>
    );
  }

  return (
    <div className="detail-view" id="detail-view">
      <div className="detail-header">
        <div className="detail-back" onClick={onBack}>
          ← Back
        </div>
        <div className="detail-info">
          <h1>
            {monitor.name}
            <span style={{ marginLeft: '12px', verticalAlign: 'middle' }}>
              <StatusBadge status={monitor.lastStatus || 'pending'} />
            </span>
          </h1>
          <div className="monitor-url">{monitor.url}</div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="detail-stats">
        {stats && (
          <>
            <div className="summary-stat">
              <div className="summary-stat-label">Uptime</div>
              <div className={`summary-stat-value ${stats.uptime >= 99 ? 'up' : stats.uptime >= 95 ? '' : 'down'}`}>
                {stats.uptime !== null ? `${stats.uptime}%` : '—'}
              </div>
            </div>
            <div className="summary-stat">
              <div className="summary-stat-label">Avg Response</div>
              <div className="summary-stat-value neutral">
                {stats.avgResponseTime !== null ? `${stats.avgResponseTime}ms` : '—'}
              </div>
            </div>
            <div className="summary-stat">
              <div className="summary-stat-label">Min / Max</div>
              <div className="summary-stat-value neutral" style={{ fontSize: '1.2rem' }}>
                {stats.minResponseTime !== null
                  ? `${stats.minResponseTime} / ${stats.maxResponseTime}ms`
                  : '—'}
              </div>
            </div>
            <div className="summary-stat">
              <div className="summary-stat-label">Incidents</div>
              <div className={`summary-stat-value ${stats.incidents > 0 ? 'down' : 'up'}`}>
                {stats.incidents}
              </div>
            </div>
            <div className="summary-stat">
              <div className="summary-stat-label">Total Pings</div>
              <div className="summary-stat-value neutral">{stats.totalPings}</div>
            </div>
          </>
        )}

        {/* Multi-range uptime */}
        {monitor.uptimeStats && (
          <>
            {Object.entries(monitor.uptimeStats).map(([range, uptime]) => (
              <div className="summary-stat" key={range}>
                <div className="summary-stat-label">Uptime ({range})</div>
                <div className={`summary-stat-value ${
                  uptime === null ? 'neutral' : uptime >= 99 ? 'up' : uptime >= 95 ? '' : 'down'
                }`}>
                  {uptime !== null ? `${uptime}%` : '—'}
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Uptime bar */}
      <UptimeBar data={dailyUptime} />

      {/* Response time chart */}
      <ResponseChart
        results={results}
        onPeriodChange={handlePeriodChange}
      />

      {/* Incident log */}
      <IncidentLog incidents={incidents} />
    </div>
  );
}
