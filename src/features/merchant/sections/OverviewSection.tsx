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
      <div className="flex flex-col gap-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { icon: '📍', label: 'POI đang hoạt động', val: activePois, sub: `/ ${pois.length} tổng` },
            { icon: '⭐', label: 'Đánh giá TB', val: avgRating, sub: 'Từ các review' },
            { icon: '🎟', label: 'Khuyến mãi đang chạy', val: activePromos, sub: 'Hiện tại' },
            { icon: '👥', label: 'Lượt ghé thăm hôm nay', val: '—', sub: 'Analytics realtime' },
          ].map((s) => (
            <div className="rounded-2xl bg-white/5 border border-[#f3f3f3] shadow p-6 flex flex-col items-center gap-2" key={s.label}>
              <div className="text-2xl mb-1">{s.icon}</div>
              <div className="text-xs uppercase tracking-widest text-amber-600 font-bold">{s.label}</div>
              <div className="text-2xl font-extrabold text-[#B85C38]">{s.val}</div>
              <div className="text-xs text-[#8B7355]">{s.sub}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Audio listens chart */}
          <div className="rounded-2xl bg-white/5 border border-[#f3f3f3] shadow p-6 flex flex-col gap-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <div className="text-xs uppercase tracking-widest text-amber-600 font-bold">Lượt nghe audio</div>
                <div className="font-playfair text-lg font-semibold text-white">Tuần này</div>
              </div>
              <span className="inline-block px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">+18% ↑</span>
            </div>
            <div className="flex items-end gap-2 h-32 mb-6">
              {bars.map((v, i) => (
                <div key={i} className="flex flex-col items-center justify-end h-full" style={{ width: '14%' }}>
                  <div className="w-4 rounded-t-lg bg-amber-400" style={{ height: `${(v / maxBar) * 100}%` }}></div>
                  <span className="text-[10px] text-[#8B7355] mt-1">{dayLabels[i]}</span>
                </div>
              ))}
            </div>
            <div className="text-xs text-[#8B7355] mt-2">Tổng: <strong>547</strong> lượt nghe trong 7 ngày</div>
          </div>

          {/* POI list */}
          <div className="rounded-2xl bg-white/5 border border-[#f3f3f3] shadow p-6 flex flex-col gap-3">
            <div className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-2">Địa điểm</div>
            <div className="font-playfair text-lg font-semibold text-white mb-3">POI của bạn</div>
            {pois.length === 0 && <div className="flex flex-col items-center justify-center text-[#bbb] py-10"><div className="text-3xl mb-2">📍</div>Chưa có POI nào</div>}
            {pois.slice(0, 4).map((p) => (
              <div key={p.id} className="flex justify-between items-center py-2 border-b border-[#E8D9C5] last:border-b-0">
                <div>
                  <div className="font-semibold text-sm text-white">{p.name}</div>
                  <div className="text-xs text-[#8B7355]">⭐ {fmtRating(p.average_rating)} · {p.trigger_radius}m radius</div>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
            {pois.length > 4 && <div className="text-xs text-[#8B7355] mt-2">+{pois.length - 4} địa điểm khác</div>}
          </div>
        </div>
      </div>
    </>
  )
}
