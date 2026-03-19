import { useAppStore } from '../../shared/store/appStore'

export function MerchantPoisPage() {
  const showToast = useAppStore((s) => s.showToast)
  return (
    <div className="grid2">
      <div className="card cardPad" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Thiết lập POI (Point on Map)</div>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          Backend sẽ cung cấp API lưu tọa độ chính xác. Frontend sẽ chọn điểm trên bản đồ và gửi lat/lng.
        </div>
        <div style={{ height: 10 }} />
        <button className="btn" onClick={() => showToast({ title: 'TODO: Pick point on map' })}>
          Chọn điểm trên bản đồ
        </button>
      </div>

      <div className="card cardPad" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Cập nhật hồ sơ</div>
        <div style={{ display: 'grid', gap: 10 }}>
          <input className="input" placeholder="Giờ mở cửa (VD: 08:00 - 22:00)" />
          <input className="input" placeholder="Ảnh không gian (URL) - TODO upload" />
          <textarea className="textarea" placeholder="Menu nổi bật (markdown / text)" />
          <button className="btn btnPrimary" onClick={() => showToast({ title: 'Lưu (demo)' })}>
            Lưu thay đổi
          </button>
        </div>
      </div>
    </div>
  )
}

