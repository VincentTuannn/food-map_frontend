import { useEffect, useState } from 'react'
import { getMerchantAnalytics, type MerchantAnalytics } from '../../../api/services/analytics'
import { getPoiById } from '../../../api/services/poi'

export function AnalyticsSection() {
  const [data, setData] = useState<MerchantAnalytics | null>(null)
  const [poiNames, setPoiNames] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    getMerchantAnalytics()
      .then(async (res) => {
        setData(res)
        setError(null)
        // Lấy tên POI cho từng id trong heatmap
        const ids = Array.from(new Set((res.heatmap ?? []).map((p) => p.poi_id)))
        const nameMap: Record<string, string> = {}
        await Promise.all(ids.map(async (id) => {
          try {
            const poi = await getPoiById(id)
            nameMap[id] = poi.data?.name || id.slice(0, 8) + '...'
          } catch {
            nameMap[id] = id.slice(0, 8) + '...'
          }
        }))
        setPoiNames(nameMap)
      })
      .catch(() => setError('Không thể tải dữ liệu'))
      .finally(() => setLoading(false))
  }, [])

  // Tính max count để scale màu heatmap
  const getHeatColor = (count: number, max: number) => {
    if (max === 0) return '#F9F5ED'
    const v = count / max
    if (v > 0.8) return '#D97706'
    if (v > 0.6) return '#F59E0B'
    if (v > 0.4) return '#FDE68A'
    if (v > 0.2) return '#FEF3C7'
    return '#F9F5ED'
  }

  if (loading) return <div style={{padding: 32}}>Đang tải dữ liệu…</div>
  if (error) return <div style={{padding: 32, color: 'red'}}>{error}</div>

  return (
    <>
      <div className="md-stagger">
        <div className="md-grid-3">
          <div className="md-stat">
            <div className="md-stat-label">Tổng số POI</div>
            <div className="md-stat-val">{data?.total_poi ?? '—'}</div>
          </div>
          <div className="md-stat">
            <div className="md-stat-label">Tổng lượt xem</div>
            <div className="md-stat-val">{data?.total_views ?? '—'}</div>
          </div>
          <div className="md-stat">
            <div className="md-stat-label">Tổng lượt chuyển đổi</div>
            <div className="md-stat-val">{data?.total_conversions ?? '—'}</div>
          </div>
        </div>

        <div className="md-grid-2 md-section-gap">
          <div className="md-card">
            <div className="md-card-label">Heatmap</div>
            <div className="md-card-title" style={{ marginBottom: 6 }}>Vùng tập trung khách</div>
            <div className="md-card-sub" style={{ marginBottom: 16 }}>Mật độ người dùng xung quanh các POI trong 30 ngày qua</div>
            <div
              className="heatmap-grid"
              style={{
                width: '100%',
                overflowX: window.innerWidth <= 600 ? 'auto' : 'visible',
                WebkitOverflowScrolling: 'touch',
                // minWidth: 0, // removed duplicate
                maxWidth: '100%',
              }}
            >
              {(() => {
                const points = data?.heatmap ?? []
                const maxCount = points.reduce((max, p) => Math.max(max, p.count), 0)
                if (points.length === 0) return <div style={{color:'#aaa',padding:12}}>Không có dữ liệu heatmap</div>
                // Desktop/laptop: hiển thị grid tự động
                if (window.innerWidth > 600) {
                  // Desktop/laptop: grid 5 cột, padding 10px hai bên, gap 18px, vừa đủ 5 ô ngang
                  const gridCols = 5
                  const maxDesktop = 25
                  const showPoints = points.slice(0, maxDesktop)
                  const needScroll = points.length > maxDesktop
                  const containerPadding = 10
                  const gap = 18
                  const colCount = gridCols
                  // Tính chiều rộng mỗi ô để vừa khít container 100% (trừ padding và gap)
                  const totalGap = gap * (colCount - 1)
                  // Tăng thêm 3px mỗi ô: cộng thêm 15px tổng (5 ô)
                  const cellSize = `calc((100% - ${2 * containerPadding}px - ${totalGap}px + 15px) / ${colCount})`
                  return (
                    <div
                      style={{
                        overflowX: needScroll ? 'auto' : 'visible',
                        WebkitOverflowScrolling: 'touch',
                        width: '100%',
                        padding: `0 ${containerPadding}px`,
                        boxSizing: 'border-box',
                      }}
                    >
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: `repeat(${colCount}, ${cellSize})`,
                          gap,
                          justifyItems: 'center',
                          alignItems: 'center',
                          minWidth: needScroll ? 5 * 120 : undefined,
                        }}
                      >
                        {showPoints.map((p) => (
                          <div
                            key={p.poi_id}
                            className="hm-cell"
                            style={{
                              background: getHeatColor(p.count, maxCount),
                              minWidth: 90,
                              minHeight: 90,
                              maxWidth: 130,
                              maxHeight: 130,
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 17,
                              borderRadius: 13,
                              boxShadow: '0 2px 12px #0001',
                            }}
                            title={`POI: ${poiNames[p.poi_id] || p.poi_id}\nLat: ${p.lat}, Lng: ${p.lng}\nLượt: ${p.count}`}
                          >
                            <div><b>{p.count}</b></div>
                            <div style={{fontSize:14, color:'#666', textAlign:'center', wordBreak:'break-word'}}>{poiNames[p.poi_id] || p.poi_id}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                }
                // Mobile: 5x5, scroll nếu nhiều hơn
                const maxMobile = 25
                const showPoints = points.slice(0, maxMobile)
                return (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 6, minWidth: 240 }}>
                    {showPoints.map((p) => (
                      <div
                        key={p.poi_id}
                        className="hm-cell"
                        style={{ background: getHeatColor(p.count, maxCount), minWidth: 36, minHeight: 36, maxWidth: 60, maxHeight: 60, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', fontSize: 10, borderRadius: 7 }}
                        title={`POI: ${poiNames[p.poi_id] || p.poi_id}\nLat: ${p.lat}, Lng: ${p.lng}\nLượt: ${p.count}`}
                      >
                        <div><b>{p.count}</b></div>
                        <div style={{fontSize:8, color:'#666'}}>{poiNames[p.poi_id] || p.poi_id}</div>
                      </div>
                    ))}
                  </div>
                )
              })()}
            </div>
            <div style={{ marginTop: 14, display: 'flex', gap: 8, alignItems: 'center', fontSize: 11, color: 'var(--muted)' }}>
              <span>Thấp</span>
              {['#FEF3C7', '#FDE68A', '#F59E0B', '#D97706'].map((c) => <div key={c} style={{ width: 14, height: 14, borderRadius: 3, background: c }} />)}
              <span>Cao</span>
            </div>
          </div>
          {/* Tỷ lệ chuyển đổi */}
          <div className="md-card">
            <div className="md-card-label">Tỷ lệ chuyển đổi</div>
            <div className="md-card-title" style={{ marginBottom: 16 }}>Theo từng POI</div>
            <div
              style={{
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                maxWidth: '100%',
                ...(window.innerWidth <= 600 ? { minWidth: 0 } : { overflowX: 'visible' })
              }}
            >
              <div style={{ minWidth: window.innerWidth <= 600 ? 320 : undefined }}>
                {(data?.heatmap ?? []).map((p) => {
                  const name = poiNames[p.poi_id] || 'POI không tên'
                  return (
                    <div key={p.poi_id} style={{ marginBottom: 14 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 5 }}>
                        <span style={{ fontWeight: 500 }}>{name}</span>
                        <span style={{ color: 'var(--amber)', fontWeight: 600 }}>{p.count}</span>
                      </div>
                      <div style={{ height: 6, background: 'var(--amber-lt)', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{ width: `${Math.min(100, (p.count / (data?.total_views || 1)) * 100)}%`, height: '100%', background: 'var(--amber)', borderRadius: 3, transition: 'width .6s ease' }} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

