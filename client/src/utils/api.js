const API_BASE = '/api';

async function request(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  const res = await fetch(url, config);

  if (!res.ok) {
    const data = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(data.error || `Request failed: ${res.status}`);
  }

  return res.json();
}

export const api = {
  // Monitors
  getMonitors: () => request('/monitors'),
  getMonitor: (id) => request(`/monitors/${id}`),
  createMonitor: (data) => request('/monitors', { method: 'POST', body: data }),
  updateMonitor: (id, data) => request(`/monitors/${id}`, { method: 'PATCH', body: data }),
  deleteMonitor: (id) => request(`/monitors/${id}`, { method: 'DELETE' }),
  pingNow: (id) => request(`/monitors/${id}/ping`, { method: 'POST' }),

  // Results
  getResults: (id, hours = 24) => request(`/monitors/${id}/results?hours=${hours}`),
  getStats: (id, hours = 24) => request(`/monitors/${id}/stats?hours=${hours}`),
  getDailyUptime: (id, days = 90) => request(`/monitors/${id}/daily-uptime?days=${days}`),
  getIncidents: (id) => request(`/monitors/${id}/incidents`),
};
