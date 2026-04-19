import { useState, useEffect, useCallback } from 'react';
import { api } from '../utils/api';
import MonitorCard from './MonitorCard';
import AddMonitorModal from './AddMonitorModal';

export default function Dashboard({ onSelectMonitor }) {
  const [monitors, setMonitors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  const fetchMonitors = useCallback(async () => {
    try {
      const data = await api.getMonitors();
      setMonitors(data);
    } catch (err) {
      console.error('Failed to fetch monitors:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMonitors();
    const interval = setInterval(fetchMonitors, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, [fetchMonitors]);

  const handleAddMonitor = async (formData) => {
    await api.createMonitor(formData);
    addToast(`Added "${formData.name}" to monitoring`);
    fetchMonitors();
  };

  const handlePingNow = async (id) => {
    try {
      await api.pingNow(id);
      addToast('Ping sent!');
      setTimeout(fetchMonitors, 1000);
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handlePause = async (id, isActive) => {
    try {
      await api.updateMonitor(id, { isActive: !isActive });
      addToast(isActive ? 'Monitor paused' : 'Monitor resumed');
      fetchMonitors();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete monitor "${name}"? This cannot be undone.`)) return;
    try {
      await api.deleteMonitor(id);
      addToast(`Deleted "${name}"`);
      fetchMonitors();
    } catch (err) {
      addToast(err.message, 'error');
    }
  };

  // Summary stats
  const totalMonitors = monitors.length;
  const upCount = monitors.filter(m => m.lastStatus === 'up').length;
  const downCount = monitors.filter(m => m.lastStatus === 'down').length;
  const avgRT = monitors.filter(m => m.avgResponseTime !== null);
  const avgResponseTime = avgRT.length > 0
    ? Math.round(avgRT.reduce((sum, m) => sum + m.avgResponseTime, 0) / avgRT.length)
    : null;

  return (
    <>
      {/* Summary Stats */}
      <div className="summary-bar" id="summary-bar">
        <div className="summary-stat">
          <div className="summary-stat-label">Total Monitors</div>
          <div className="summary-stat-value neutral">{totalMonitors}</div>
        </div>
        <div className="summary-stat">
          <div className="summary-stat-label">Services Up</div>
          <div className="summary-stat-value up">{upCount}</div>
          <div className="summary-stat-sub">
            {totalMonitors > 0 ? `${((upCount / totalMonitors) * 100).toFixed(0)}% healthy` : ''}
          </div>
        </div>
        <div className="summary-stat">
          <div className="summary-stat-label">Services Down</div>
          <div className={`summary-stat-value ${downCount > 0 ? 'down' : 'up'}`}>
            {downCount}
          </div>
        </div>
        <div className="summary-stat">
          <div className="summary-stat-label">Avg Response</div>
          <div className="summary-stat-value neutral">
            {avgResponseTime !== null ? `${avgResponseTime}ms` : '—'}
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="dashboard" id="dashboard">
        <div className="dashboard-header">
          <span className="dashboard-title">Monitors</span>
          <button
            className="btn btn-primary"
            onClick={() => setShowModal(true)}
            id="add-monitor-dashboard-btn"
          >
            ＋ Add Monitor
          </button>
        </div>

        {loading ? (
          <div className="monitors-grid">
            {[1, 2, 3].map(i => (
              <div key={i} className="monitor-card" style={{ minHeight: '180px' }}>
                <div className="skeleton" style={{ height: '20px', width: '60%', marginBottom: '8px' }}></div>
                <div className="skeleton" style={{ height: '14px', width: '80%', marginBottom: '16px' }}></div>
                <div className="skeleton" style={{ height: '50px', width: '100%' }}></div>
              </div>
            ))}
          </div>
        ) : monitors.length === 0 ? (
          <div className="empty-state" id="empty-state">
            <div className="empty-state-icon">📡</div>
            <h3>No monitors yet</h3>
            <p>Add your first URL to start monitoring its uptime and response time.</p>
            <button
              className="btn btn-primary"
              onClick={() => setShowModal(true)}
            >
              ＋ Add Your First Monitor
            </button>
          </div>
        ) : (
          <div className="monitors-grid">
            {monitors.map(monitor => (
              <MonitorCard
                key={monitor._id}
                monitor={monitor}
                onClick={onSelectMonitor}
                onPingNow={handlePingNow}
                onPause={handlePause}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>

      {/* Add Monitor Modal */}
      {showModal && (
        <AddMonitorModal
          onClose={() => setShowModal(false)}
          onSubmit={handleAddMonitor}
        />
      )}

      {/* Toast Notifications */}
      {toasts.length > 0 && (
        <div className="toast-container">
          {toasts.map(t => (
            <div key={t.id} className={`toast ${t.type}`}>
              {t.type === 'success' ? '✓' : '✗'} {t.message}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
