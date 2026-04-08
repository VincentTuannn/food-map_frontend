import { useState } from 'react';
import { useAppStore } from '../../shared/store/appStore';

export function AdminConfigPage() {
  const showToast = useAppStore((s) => s.showToast);

  // [1] State quản lý dữ liệu nhập liệu tại chỗ
  const [triggerRadius, setTriggerRadius] = useState<number>(80);

  // [2] Hàm xử lý sự kiện (Vị trí để ghép nối API sau này)
  const handleSaveConfig = () => {
    showToast({ title: '✅ Giao diện: Đã xác nhận thay đổi!' });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, animation: 'fadeIn 0.3s' }}>
      
      {/* Tiêu đề trang */}
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 4px 0', color: 'var(--text)' }}>
          Cấu hình hệ thống
        </h2>
        <div style={{ color: 'var(--muted)', fontSize: 14 }}>
          Thiết lập các thông số môi trường và thuật toán không gian.
        </div>
      </div>

      <div className="grid2">
        
        {/* CARD 1: CẤU HÌNH BÁN KÍNH AUDIO */}
        <div className="card cardPad" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 18, fontWeight: 800, margin: '0 0 4px 0', color: 'var(--brand)' }}>
              📍 Bán kính kích hoạt Audio
            </h3>
            <div style={{ fontSize: 13, color: 'var(--muted)' }}>
              Khoảng cách (mét) tối đa để phát âm thanh tự động.
            </div>
          </div>

          <div className="row">
            {/* [3] Ràng buộc dữ liệu đồng bộ giữa thanh kéo và ô nhập */}
            <input 
              type="range" 
              min="1" max="80" step="5"
              value={triggerRadius}
              onChange={(e) => setTriggerRadius(Number(e.target.value))}
              style={{ flex: 1, accentColor: 'var(--brand)' }}
            />
            
            <div className="row" style={{ background: 'var(--panel)', padding: '4px 12px', borderRadius: 12 }}>
              <input 
                type="number" 
                value={triggerRadius}
                onChange={(e) => setTriggerRadius(Number(e.target.value))}
                style={{ 
                  width: 50, background: 'transparent', border: 'none', 
                  color: 'inherit', fontSize: 16, fontWeight: 800, 
                  outline: 'none', textAlign: 'center' 
                }}
              />
              <span style={{ color: 'var(--muted)', fontSize: 14 }}>m</span>
            </div>
          </div>

          {/* Mô phỏng radar trực quan bằng CSS Dynamic Style */}
          <div className="mapFake" style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, borderRadius: 12 }}>
            <div style={{ position: 'absolute', zIndex: 10, fontSize: 24 }}>🚶</div>
            
            <div style={{
              width: triggerRadius * 2.5,
              height: triggerRadius * 2.5,
              background: 'rgba(124, 58, 237, 0.15)',
              border: '2px dashed var(--brand)',
              borderRadius: '50%',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)' 
            }} />
          </div>

          <button className="btn btnPrimary" onClick={handleSaveConfig}>
            💾 Lưu cấu hình Không gian
          </button>
        </div>
      </div>
    </div>
  );
}