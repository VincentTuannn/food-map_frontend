import { useState, useEffect } from 'react';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

export function AdminReviews() {
  const showToast = useAppStore((s) => s.showToast);
  
  // States dữ liệu
  const [reviews, setReviews] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // States bộ lọc
  const [filters, setFilters] = useState({
    rating: '',
    poi_id: '',
    user_id: ''
  });

  // 1. Tải danh sách Đánh giá
  const loadReviews = async () => {
    setIsFetching(true);
    try {
      const res = await adminApi.getReviews(); 
      setReviews(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      showToast({ title: '❌ Lỗi tải danh sách đánh giá' });
    } finally {
      setIsFetching(false);
    }
  };

  // ✅ SỬA LỖI SPAM API: Chỉ tải dữ liệu 1 lần khi mở trang
  useEffect(() => {
    loadReviews();
  }, []);

  // 2. Xử lý Xóa đánh giá vi phạm (DELETE /reviews/:id)
  const handleDeleteReview = async (id: string) => {
    if (!window.confirm('⚠️ Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.')) return;
    
    setIsProcessing(true);
    try {
      await adminApi.deleteReview(id);
      showToast({ title: '🗑️ Đã xóa đánh giá vi phạm' });
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (error) {
      showToast({ title: '❌ Không thể xóa đánh giá này' });
    } finally {
      setIsProcessing(false);
    }
  };

  // Hàm hiển thị sao vàng
  const renderStars = (rating: number) => {
    return '⭐'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  // ✅ TUYỆT CHIÊU LỌC FRONTEND: Lọc danh sách ngay trên giao diện
  const displayedReviews = reviews.filter((rev) => {
    if (!filters.rating) return true; // Nếu chọn "Tất cả số sao", hiển thị hết
    return String(rev.rating) === filters.rating; // So sánh bằng chữ để đảm bảo khớp 100%
  });

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      {/* HEADER & FILTER */}
      <div className="card cardPad" style={{ marginBottom: 20 }}>
        <div className="rowBetween">
          <div>
            <h2 style={{ margin: 0, color: '#8B7355', fontSize: 24, fontWeight: 800 }}>⭐ Kiểm duyệt Đánh giá</h2>
            <p style={{ color: '#888', marginTop: 5, fontSize: 14 }}>Quản lý và gỡ bỏ các nội dung đánh giá vi phạm tiêu chuẩn.</p>
          </div>
          
          <div style={{ display: 'flex', gap: 10 }}>
            <select 
              className="select" 
              style={{ width: 150 }}
              value={filters.rating}
              onChange={(e) => setFilters({...filters, rating: e.target.value})}
            >
              <option value="">Tất cả số sao</option>
              <option value="5">5 sao ⭐⭐⭐⭐⭐</option>
              <option value="4">4 sao ⭐⭐⭐⭐</option>
              <option value="3">3 sao ⭐⭐⭐</option>
              <option value="2">2 sao ⭐⭐</option>
              <option value="1">1 sao ⭐</option>
            </select>
            <button className="btn btnGhost" onClick={loadReviews}>🔄 Làm mới</button>
          </div>
        </div>
      </div>

      {/* REVIEWS LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 15 }}>
        {isFetching ? (
          <div className="card cardPad" style={{ textAlign: 'center', color: '#888' }}>⏳ Đang tải đánh giá...</div>
        ) : displayedReviews.length === 0 ? (
          <div className="card cardPad" style={{ textAlign: 'center', color: '#888' }}>Không có đánh giá nào phù hợp với bộ lọc.</div>
        ) : (
          displayedReviews.map((rev) => (
            <div key={rev.id} className="card cardPad" style={{ background: '#1E1E2D', border: '1px solid #333' }}>
              <div className="rowBetween">
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#2A2A3C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    👤
                  </div>
                  <div>
                    <div style={{ color: '#fff', fontWeight: 700 }}>{rev.user?.email || 'Người dùng ẩn danh'}</div>
                    <div style={{ color: '#FFCC00', fontSize: 12 }}>{renderStars(rev.rating)}</div>
                  </div>
                </div>
                <button 
                  className="btn" 
                  style={{ color: '#ff4d4f', border: '1px solid rgba(255, 77, 79, 0.2)', fontSize: 12 }}
                  onClick={() => handleDeleteReview(rev.id)}
                  disabled={isProcessing}
                >
                  Gỡ bỏ
                </button>
              </div>

              <div style={{ marginTop: 15, padding: '12px', background: '#151521', borderRadius: 8, borderLeft: '3px solid #7B2CBF' }}>
                <p style={{ color: '#ddd', margin: 0, fontSize: 14, fontStyle: 'italic' }}>"{rev.comment || 'Không có nội dung bình luận.'}"</p>
              </div>

              <div style={{ marginTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 12, color: '#555' }}>
                  📍 Địa điểm: <b style={{ color: '#aaa' }}>{rev.poi?.name || 'N/A'}</b>
                </div>
                <div style={{ fontSize: 11, color: '#444' }}>
                  Gửi lúc: {rev.created_at || rev.createdAt ? new Date(rev.created_at || rev.createdAt).toLocaleString('vi-VN') : 'Không rõ thời gian'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}