import { fmtRating } from '../merchantHelpers'
import type { Poi, Promotion } from '../merchantTypes'
import { StatusBadge } from '../components/StatusBadge'

export function OverviewSection({ pois, promotions }: { pois: Poi[]; promotions: Promotion[] }) {
  const activePois = pois.filter((p) => p.status === 'ACTIVE').length
  const avgRating = pois.length
    ? (pois.reduce((s, p) => s + Number(p.average_rating || 0), 0) / pois.length).toFixed(1)
    : '—'
  const activePromos = promotions.filter((p) => new Date(p.end_time) > new Date()).length

  const bars = [40, 65, 50, 80, 72, 90, 60]
  const dayLabels = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']
  const maxBar = Math.max(...bars)

  return (
    <>
      <div className="md-stagger">
        <div className="md-grid-4">
          {[
            { icon: '📍', label: 'POI đang hoạt động', val: activePois, sub: `/ ${pois.length} tổng` },
            { icon: '⭐', label: 'Đánh giá TB', val: avgRating, sub: 'Từ các review' },
            { icon: '🎟', label: 'Khuyến mãi đang chạy', val: activePromos, sub: 'Hiện tại' },
            { icon: '👥', label: 'Lượt ghé thăm hôm nay', val: '—', sub: 'Analytics realtime' },
          ].map((s) => (
            <div className="md-stat" key={s.label}>
              <div className="md-stat-icon">{s.icon}</div>
              <div className="md-stat-label">{s.label}</div>
              <div className="md-stat-val">{s.val}</div>
              <div className="md-stat-sub">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="md-grid-2 md-section-gap">
          <div className="md-card">
            <div className="md-card-header">
              <div>
                <div className="md-card-label">Lượt nghe audio</div>
                <div className="md-card-title">Tuần này</div>
              </div>
              <span className="badge badge-active">+18% ↑</span>
            </div>
            <div className="bar-chart" style={{ marginBottom: 24 }}>
              {bars.map((v, i) => (
                <div key={i} className="bar" style={{ height: `${(v / maxBar) * 100}%` }}>
                  <span className="bar-label">{dayLabels[i]}</span>
                </div>
              ))}
            </div>
            <div className="md-card-sub" style={{ marginTop: 8 }}>Tổng: <strong>547</strong> lượt nghe trong 7 ngày</div>
          </div>

          <div className="md-card">
            <div className="md-card-label">Địa điểm</div>
            <div className="md-card-title" style={{ marginBottom: 14 }}>POI của bạn</div>
            {pois.length === 0 && <div className="md-empty"><div className="md-empty-icon">📍</div>Chưa có POI nào</div>}
            {pois.slice(0, 4).map((p) => (
              <div key={p.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 13 }}>{p.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>⭐ {fmtRating(p.average_rating)} · {p.trigger_radius}m radius</div>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
            {pois.length > 4 && <div className="md-card-sub" style={{ marginTop: 10 }}>+{pois.length - 4} địa điểm khác</div>}
          </div>
        </div>
      </div>
    </>
  )
}
