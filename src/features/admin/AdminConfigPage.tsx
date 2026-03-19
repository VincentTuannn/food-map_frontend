import { useAppStore } from '../../shared/store/appStore'

export function AdminConfigPage() {
  const radius = useAppStore((s) => s.radiusMeters)
  const setRadius = useAppStore((s) => s.setRadiusMeters)

  return (
    <div className="card cardPad" style={{ background: 'rgba(255,255,255,0.06)' }}>
      <div style={{ fontWeight: 900, marginBottom: 8 }}>Cấu hình hệ thống (frontend demo)</div>
      <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 10 }}>
        Thực tế admin config từ backend; ở demo này mình dùng state để mô phỏng trigger_radius mặc định.
      </div>
      <div className="row">
        <input
          className="input"
          type="number"
          min={20}
          max={500}
          value={radius}
          onChange={(e) => setRadius(Number(e.target.value))}
        />
        <span className="pill">meters</span>
      </div>
    </div>
  )
}

