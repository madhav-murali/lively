export default function StatusBadge({ status }) {
  const label = status === 'up' ? 'Operational' : status === 'down' ? 'Down' : 'Pending';

  return (
    <span className={`status-badge ${status}`} id={`status-badge-${status}`}>
      <span className="dot"></span>
      {label}
    </span>
  );
}
