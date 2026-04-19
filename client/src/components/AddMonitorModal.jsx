import { useState } from 'react';

export default function AddMonitorModal({ onClose, onSubmit }) {
  const [form, setForm] = useState({
    name: '',
    url: '',
    interval: 60,
    expectedStatusCode: 200,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: name === 'interval' || name === 'expectedStatusCode'
        ? parseInt(value, 10) || ''
        : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Basic validation
      if (!form.name.trim()) throw new Error('Name is required');
      if (!form.url.trim()) throw new Error('URL is required');

      try {
        new URL(form.url);
      } catch {
        throw new Error('Please enter a valid URL (e.g., https://example.com)');
      }

      await onSubmit(form);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose} id="add-monitor-modal">
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>Add New Monitor</h2>

        {error && (
          <div style={{
            background: 'rgba(255, 71, 87, 0.1)',
            border: '1px solid rgba(255, 71, 87, 0.2)',
            borderRadius: '8px',
            padding: '10px 14px',
            marginBottom: '16px',
            color: '#ff4757',
            fontSize: '0.82rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="monitor-name">Name</label>
            <input
              id="monitor-name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="My Website"
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="monitor-url">URL</label>
            <input
              id="monitor-url"
              name="url"
              value={form.url}
              onChange={handleChange}
              placeholder="https://example.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="monitor-interval">Check Interval (seconds)</label>
            <select
              id="monitor-interval"
              name="interval"
              value={form.interval}
              onChange={handleChange}
            >
              <option value={15}>Every 15 seconds</option>
              <option value={30}>Every 30 seconds</option>
              <option value={60}>Every 1 minute</option>
              <option value={300}>Every 5 minutes</option>
              <option value={600}>Every 10 minutes</option>
              <option value={1800}>Every 30 minutes</option>
              <option value={3600}>Every 1 hour</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="monitor-status-code">Expected Status Code</label>
            <input
              id="monitor-status-code"
              name="expectedStatusCode"
              type="number"
              value={form.expectedStatusCode}
              onChange={handleChange}
              min="100"
              max="599"
            />
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              id="submit-monitor-btn"
            >
              {loading ? 'Adding...' : 'Add Monitor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
