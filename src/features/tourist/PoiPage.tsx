import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { POIS } from '../../shared/mock/pois'
import { useAppStore } from '../../shared/store/appStore'
import { AppShell } from '../../shared/ui/AppShell'

export function PoiPage() {
  const nav = useNavigate()
  const { poiId } = useParams()
  const language = useAppStore((s) => s.language)
  const showToast = useAppStore((s) => s.showToast)

  const poi = useMemo(() => POIS.find((p) => p.id === poiId), [poiId])

  if (!poi) {
    return (
      <AppShell>
        <div className="card cardPad">
          <div style={{ fontWeight: 800 }}>Không tìm thấy POI</div>
          <div style={{ color: 'var(--muted)', marginTop: 6 }}>ID: {poiId}</div>
          <div style={{ height: 12 }} />
          <button className="btn btnPrimary" onClick={() => nav('/tourist/map')}>
            Quay lại Map
          </button>
        </div>
      </AppShell>
    )
  }

  const desc = language === 'vi' ? poi.short.vi : language === 'ja' ? poi.short.ja : poi.short.en

  return (
    <AppShell>
      <div className="card cardPad">
        <div className="rowBetween">
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{poi.name}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>{desc}</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
            <span className="pill">⭐ {poi.rating.toFixed(1)}</span>
            <span className="pill">{'₫'.repeat(poi.priceLevel)}</span>
          </div>
        </div>

        <div className="hr" />

        <div className="grid2">
          <div className="card cardPad">
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Menu nổi bật</div>
            <div style={{ display: 'grid', gap: 8 }}>
              {poi.menuHighlights.map((x) => (
                <div key={x} className="pill" style={{ justifyContent: 'space-between' }}>
                  <span>{x}</span>
                  <span style={{ opacity: 0.85 }}>→</span>
                </div>
              ))}
            </div>
            <div style={{ height: 10 }} />
            <button
              className="btn"
              onClick={() => showToast({ title: 'Xem menu (demo)', message: 'Thực tế mở trang menu / PDF / in-app.' })}
            >
              Xem toàn bộ menu
            </button>
          </div>

          <div className="card cardPad">
            <div style={{ fontWeight: 900, marginBottom: 8 }}>Khuyến mãi / Voucher</div>
            {poi.voucher ? (
              <>
                <div className="pill" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <span>
                    <strong style={{ color: 'var(--text)' }}>{poi.voucher.code}</strong> · {poi.voucher.description}
                  </span>
                  <span style={{ opacity: 0.85 }}>⏳ {poi.voucher.expiresAt}</span>
                </div>
                <div style={{ height: 10 }} />
                <button
                  className="btn btnPrimary"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(poi.voucher!.code)
                      showToast({ title: 'Đã copy mã', message: poi.voucher!.code })
                    } catch {
                      showToast({ title: 'Copy thất bại', message: poi.voucher!.code })
                    }
                  }}
                >
                  Copy mã giảm giá
                </button>
              </>
            ) : (
              <div style={{ color: 'var(--muted)' }}>Hiện chưa có voucher.</div>
            )}

            <div style={{ height: 10 }} />
            <button
              className="btn"
              onClick={() => showToast({ title: 'Điều hướng (demo)', message: 'Thực tế deep-link Google Maps/Apple Maps.' })}
            >
              Điều hướng đến đây
            </button>
          </div>
        </div>

        <div className="hr" />

        <div className="card cardPad">
          <div className="rowBetween">
            <div style={{ fontWeight: 900 }}>Reviews</div>
            <button className="btn" onClick={() => showToast({ title: 'Viết review (demo)' })}>
              Viết review
            </button>
          </div>
          <div style={{ height: 10 }} />
          <div style={{ display: 'grid', gap: 10 }}>
            {poi.reviews.map((r, idx) => (
              <div key={idx} className="card cardPad" style={{ background: 'rgba(255,255,255,0.06)' }}>
                <div className="rowBetween">
                  <div style={{ fontWeight: 800 }}>{r.author}</div>
                  <span className="pill">⭐ {r.stars}/5</span>
                </div>
                <div style={{ color: 'var(--muted)', marginTop: 6 }}>{r.text}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  )
}

