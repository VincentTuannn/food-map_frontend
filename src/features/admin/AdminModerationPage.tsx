import { useAppStore } from '../../shared/store/appStore'

export function AdminModerationPage() {
  const showToast = useAppStore((s) => s.showToast)
  return (
    <div className="grid2">
      <div className="card cardPad" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Duyệt POI mới</div>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          Backend cung cấp danh sách POI pending. Frontend hiển thị map + ảnh + thông tin để duyệt.
        </div>
        <div style={{ height: 10 }} />
        <button className="btn" onClick={() => showToast({ title: 'TODO: Fetch pending POIs' })}>
          Tải danh sách pending
        </button>
      </div>

      <div className="card cardPad" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div style={{ fontWeight: 900, marginBottom: 8 }}>Kiểm duyệt nội dung Audio/Text</div>
        <div style={{ color: 'var(--muted)', fontSize: 13 }}>
          Hiển thị script/audio metadata theo ngôn ngữ, approve/reject để tránh sai lệch thông tin.
        </div>
        <div style={{ height: 10 }} />
        <button className="btn" onClick={() => showToast({ title: 'TODO: Moderation queue' })}>
          Mở moderation queue
        </button>
      </div>
    </div>
  )
}

