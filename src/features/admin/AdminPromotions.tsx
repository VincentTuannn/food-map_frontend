import { useState, useEffect } from 'react';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

export function AdminPromotions() {
  const showToast = useAppStore((s) => s.showToast);
  
  // States dữ liệu
  const [promotions, setPromotions] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // 1. Tải danh sách Khuyến mãi
  const loadPromotions = async () => {
    setIsFetching(true);
    try {
      const res = await adminApi.getPromotions();
      // Khớp dữ liệu trả về từ Backend
      setPromotions(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      showToast({ title: '❌ Lỗi tải danh sách khuyến mãi' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadPromotions();
  }, []);

  // 2. Xử lý Xóa Khuyến mãi (DELETE /promotions/:id)
  const handleDelete = async (id: string) => {
    if (!window.confirm('⚠️ Bạn có chắc chắn muốn xóa mã khuyến mãi này? Người dùng sẽ không thể sử dụng mã này nữa.')) return;
    
    setIsProcessing(true);
    try {
      await adminApi.deletePromotion(id);
      showToast({ title: '🗑️ Đã xóa mã khuyến mãi thành công' });
      // Cập nhật danh sách tại chỗ để tối ưu UI
      setPromotions(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      showToast({ title: '❌ Lỗi khi xóa khuyến mãi' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      {/* HEADER SECTION */}
      <div className="card cardPad" style={{ marginBottom: 20 }}>
        <div className="rowBetween">
          <div>
            <h2 style={{ margin: 0, color: '#fff', fontSize: 24, fontWeight: 800 }}>🎁 Quản lý Khuyến mãi</h2>
            <p style={{ color: '#888', marginTop: 5, fontSize: 14 }}>
              Theo dõi và kiểm soát các mã giảm giá từ Đối tác (Merchant) trên toàn hệ thống.
            </p>
          </div>
          <button className="btn btnGhost" onClick={loadPromotions} disabled={isFetching}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* PROMOTIONS LIST SECTION */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
        {isFetching ? (
          <div className="card cardPad" style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>
            ⏳ Đang truy vấn danh sách mã giảm giá...
          </div>
        ) : promotions.length === 0 ? (
          <div className="card cardPad" style={{ gridColumn: '1/-1', textAlign: 'center', color: '#888' }}>
            Hiện chưa có mã khuyến mãi nào đang hoạt động.
          </div>
        ) : (
          promotions.map((promo) => (
            <div key={promo.id} className="card cardPad" style={{ 
              background: '#1E1E2D', 
              border: '1px solid #333',
              position: 'relative',
              overflow: 'hidden'
            }}>
              {/* Trang trí mã code */}
              <div style={{ 
                position: 'absolute', top: 10, right: -25, background: '#7B2CBF', 
                color: '#fff', padding: '5px 30px', transform: 'rotate(45deg)',
                fontSize: 10, fontWeight: 900, boxShadow: '0 2px 5px rgba(0,0,0,0.5)'
              }}>
                PROMO
              </div>

              <div style={{ marginBottom: 15 }}>
                <div style={{ fontSize: 12, color: '#C77DFF', fontWeight: 700, textTransform: 'uppercase' }}>
                  Code: {promo.code}
                </div>
                <h3 style={{ margin: '5px 0', color: '#fff', fontSize: 18 }}>
                  Giảm {promo.discount_value}{promo.discount_type === 'PERCENT' ? '%' : 'đ'}
                </h3>
                <div style={{ fontSize: 13, color: '#aaa' }}>
                  📍 Áp dụng tại: <b>{promo.poi?.name || 'Toàn hệ thống'}</b>
                </div>
              </div>

              <div style={{ 
                padding: '10px 0', borderTop: '1px solid #2A2A3C', borderBottom: '1px solid #2A2A3C',
                marginBottom: 15, fontSize: 12, color: '#666', display: 'flex', justifyContent: 'space-between'
              }}>
                <span>Hết hạn: {new Date(promo.end_date).toLocaleDateString('vi-VN')}</span>
                <span>Lượt dùng: {promo.usage_count || 0}</span>
              </div>

              <div className="rowBetween">
                <div style={{ fontSize: 11, color: '#444' }}>
                  ID: {promo.id.slice(0, 8)}...
                </div>
                <button 
                  className="btn" 
                  style={{ color: '#ff4d4f', padding: '5px 10px', fontSize: 12, border: '1px solid rgba(255, 77, 79, 0.2)' }}
                  onClick={() => handleDelete(promo.id)}
                  disabled={isProcessing}
                >
                  🗑️ Gỡ bỏ mã
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}