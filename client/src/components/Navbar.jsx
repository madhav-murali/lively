export default function Navbar({ onAddClick, monitorsCount }) {
  return (
    <nav className="navbar" id="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">L</div>
        <span className="navbar-title">Lively</span>
      </div>

      <div className="navbar-actions">
        <div className="navbar-status">
          <span className="pulse-dot"></span>
          <span>Monitoring {monitorsCount} site{monitorsCount !== 1 ? 's' : ''}</span>
        </div>
        <button
          className="btn btn-primary"
          onClick={onAddClick}
          id="add-monitor-btn"
        >
          <span>＋</span> Add Monitor
        </button>
      </div>
    </nav>
  );
}
