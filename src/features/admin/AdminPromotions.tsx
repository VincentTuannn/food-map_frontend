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
    <div className="animate-fadeIn">
      {/* HEADER SECTION */}
      <div className="card cardPad mb-5">
        <div className="rowBetween">
          <div>
            <h2 className="m-0 text-[#8B7355] text-2xl font-extrabold">🎁 Quản lý Khuyến mãi</h2>
            <p className="text-[#888] mt-1 text-base">Theo dõi và kiểm soát các mã giảm giá từ Đối tác (Merchant) trên toàn hệ thống.</p>
          </div>
          <button className="btn btnGhost" onClick={loadPromotions} disabled={isFetching}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* PROMOTIONS LIST SECTION */}
      <div className="grid gap-5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', display: 'grid' }}>
        {isFetching ? (
          <div className="card cardPad col-span-full text-center text-[#888]">⏳ Đang truy vấn danh sách mã giảm giá...</div>
        ) : promotions.length === 0 ? (
          <div className="card cardPad col-span-full text-center text-[#888]">Hiện chưa có mã khuyến mãi nào đang hoạt động.</div>
        ) : (
          promotions.map((promo) => (
            <div key={promo.id} className="card cardPad bg-[#1E1E2D] border border-[#333] relative overflow-hidden">
              {/* Trang trí mã code */}
              <div className="absolute top-2.5 -right-6 bg-[#7B2CBF] text-white py-1 px-8 rotate-45 text-[10px] font-extrabold shadow-md">
                PROMO
              </div>

              <div className="mb-4">
                <div className="text-xs text-[#C77DFF] font-bold uppercase">Code: {promo.code}</div>
                <h3 className="my-1 text-white text-lg">Giảm {promo.discount_value}{promo.discount_type === 'PERCENT' ? '%' : 'đ'}</h3>
                <div className="text-sm text-[#aaa]">📍 Áp dụng tại: <b>{promo.poi?.name || 'Toàn hệ thống'}</b></div>
              </div>

              <div className="py-2 border-y border-[#2A2A3C] mb-4 text-xs text-[#666] flex justify-between">
                <span>Hết hạn: {new Date(promo.end_date).toLocaleDateString('vi-VN')}</span>
                <span>Lượt dùng: {promo.usage_count || 0}</span>
              </div>

              <div className="rowBetween">
                <div className="text-[11px] text-[#444]">ID: {promo.id.slice(0, 8)}...</div>
                <button
                  className="btn text-[#ff4d4f] py-1.5 px-2.5 text-xs border border-[#ff4d4f33]"
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