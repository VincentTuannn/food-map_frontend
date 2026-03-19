import { useAppStore } from '../../shared/store/appStore'

export function MerchantBillingPage() {
  const showToast = useAppStore((s) => s.showToast)
  return (
    <div className="grid2">
      <div className="card cardPad" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Subscription</div>
        <div className="pill" style={{ marginBottom: 10 }}>
          Gói hiện tại: Starter (demo)
        </div>
        <button className="btn btnPrimary" onClick={() => showToast({ title: 'Thanh toán subscription (demo)' })}>
          Nâng cấp gói
        </button>
      </div>

      <div className="card cardPad" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Sponsored POI</div>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 10 }}>
          Nạp tiền chạy quảng cáo để ưu tiên hiển thị trên map.
        </div>
        <button className="btn" onClick={() => showToast({ title: 'Nạp tiền ads (demo)' })}>
          Nạp tiền
        </button>
      </div>
    </div>
  )
}

