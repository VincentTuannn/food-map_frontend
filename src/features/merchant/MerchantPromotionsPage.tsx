import { useAppStore } from '../../shared/store/appStore'

export function MerchantPromotionsPage() {
  const showToast = useAppStore((s) => s.showToast)
  return (
    <div className="grid2">
      <div className="card cardPad" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Tạo E-voucher</div>
        <div style={{ display: 'grid', gap: 10 }}>
          <input className="input" placeholder="Mã voucher (VD: FLASH10)" />
          <input className="input" type="number" min={1} placeholder="Số lượng giới hạn (VD: 100)" />
          <input className="input" placeholder="Thời gian chạy (VD: 17:00 - 19:00)" />
          <button className="btn btnPrimary" onClick={() => showToast({ title: 'Tạo voucher (demo)' })}>
            Tạo chiến dịch
          </button>
        </div>
      </div>

      <div className="card cardPad" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Push theo khoảng cách</div>
        <div style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 10 }}>
          PWA có thể dùng Web Push (yêu cầu HTTPS + permission). Backend sẽ bắn notification theo geofencing rule.
        </div>
        <button className="btn" onClick={() => showToast({ title: 'TODO: Web Push subscribe' })}>
          Đăng ký nhận push
        </button>
      </div>
    </div>
  )
}

