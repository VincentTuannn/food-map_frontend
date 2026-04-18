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
    <div className="animate-fadeIn">
      {/* HEADER & FILTER */}
      <div className="card cardPad mb-5">
        <div className="rowBetween">
          <div>
            <h2 className="m-0 text-[#8B7355] text-2xl font-extrabold">⭐ Kiểm duyệt Đánh giá</h2>
            <p className="text-[#888] mt-1 text-base">Quản lý và gỡ bỏ các nội dung đánh giá vi phạm tiêu chuẩn.</p>
          </div>
          <div className="flex gap-2.5">
            <select
              className="select w-40"
              value={filters.rating}
              onChange={e => setFilters({ ...filters, rating: e.target.value })}
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
      <div className="flex flex-col gap-4">
        {isFetching ? (
          <div className="card cardPad text-center text-[#888]">⏳ Đang tải đánh giá...</div>
        ) : displayedReviews.length === 0 ? (
          <div className="card cardPad text-center text-[#888]">Không có đánh giá nào phù hợp với bộ lọc.</div>
        ) : (
          displayedReviews.map((rev) => (
            <div key={rev.id} className="card cardPad bg-[#1E1E2D] border border-[#333]">
              <div className="rowBetween">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#2A2A3C] flex items-center justify-center text-lg">👤</div>
                  <div>
                    <div className="text-white font-bold">{rev.user?.email || 'Người dùng ẩn danh'}</div>
                    <div className="text-[#FFCC00] text-xs">{renderStars(rev.rating)}</div>
                  </div>
                </div>
                <button
                  className="btn text-[#ff4d4f] border border-[#ff4d4f33] text-xs"
                  onClick={() => handleDeleteReview(rev.id)}
                  disabled={isProcessing}
                >
                  Gỡ bỏ
                </button>
              </div>
              <div className="mt-4 p-3 bg-[#151521] rounded-lg border-l-4 border-[#7B2CBF]">
                <p className="text-[#ddd] m-0 text-base italic">"{rev.comment || 'Không có nội dung bình luận.'}"</p>
              </div>
              <div className="mt-3 flex justify-between items-center">
                <div className="text-xs text-[#555]">📍 Địa điểm: <b className="text-[#aaa]">{rev.poi?.name || 'N/A'}</b></div>
                <div className="text-[11px] text-[#444]">Gửi lúc: {rev.created_at || rev.createdAt ? new Date(rev.created_at || rev.createdAt).toLocaleString('vi-VN') : 'Không rõ thời gian'}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}