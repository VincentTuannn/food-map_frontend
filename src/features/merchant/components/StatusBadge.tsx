export function StatusBadge({ status }: { status: string }) {
  const cls = status === 'ACTIVE' ? 'badge-active' : status === 'PENDING' ? 'badge-pending' : 'badge-inactive'
  return <span className={`badge ${cls}`}>{status}</span>
}
