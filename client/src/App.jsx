import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import DetailView from './components/DetailView';
import { api } from './utils/api';

function App() {
  const [selectedMonitorId, setSelectedMonitorId] = useState(null);
  const [monitorsCount, setMonitorsCount] = useState(0);

  // Keep navbar count in sync
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const monitors = await api.getMonitors();
        setMonitorsCount(monitors.length);
      } catch {
        // silent
      }
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [selectedMonitorId]);

  return (
    <>
      <Navbar
        monitorsCount={monitorsCount}
        onAddClick={() => setSelectedMonitorId(null)}
      />

      {selectedMonitorId ? (
        <DetailView
          monitorId={selectedMonitorId}
          onBack={() => setSelectedMonitorId(null)}
        />
      ) : (
        <Dashboard
          onSelectMonitor={(id) => setSelectedMonitorId(id)}
        />
      )}
    </>
  );
}

export default App;
