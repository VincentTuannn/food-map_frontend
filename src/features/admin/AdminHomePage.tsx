export function AdminHomePage() {
  return (
    <div className="card cardPad" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div style={{ fontWeight: 900 }}>Tổng quan vận hành</div>
      <div style={{ color: 'var(--muted)', marginTop: 6 }}>
        - POI pending approval
        <br />- Volume event tracking (Kafka consumer - backend)
        <br />- Growth & revenue snapshot
      </div>
    </div>
  )
}

