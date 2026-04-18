import { useState, useEffect } from 'react';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

export function AdminMerchants() {
  const showToast = useAppStore((s) => s.showToast);
  
  // States dữ liệu
  const [merchants, setMerchants] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // States Chi tiết & Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedMerchant, setSelectedMerchant] = useState<any>(null);

  // States Bộ lọc
  const [filterSub, setFilterSub] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // 1. Tải danh sách Merchants
  const loadMerchants = async () => {
    setIsFetching(true);
    try {
      // ✅ ĐÃ SỬA LỖI: Truyền đúng thứ tự (searchTerm trước, filterSub sau)
      const res = await adminApi.getMerchants(searchTerm, filterSub);
      setMerchants(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      showToast({ title: '❌ Lỗi tải danh sách đối tác' });
    } finally {
      setIsFetching(false);
    }
  };

  // ✅ TUYỆT CHIÊU DEBOUNCE: Tự động tải lại data khi gõ chữ hoặc đổi bộ lọc
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      loadMerchants();
    }, 500); // Đợi 500ms sau khi ngừng thao tác mới gọi API

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, filterSub]); // Chạy lại mỗi khi ô tìm kiếm hoặc dropdown thay đổi

  // 2. Cập nhật trạng thái Hội viên (PATCH /merchants/:id/status)
  const handleUpdateSubscription = async (id: string, newStatus: string) => {
    setIsProcessing(true);
    try {
      await adminApi.updateMerchant(id, newStatus as any);
      showToast({ title: `✅ Đã cập nhật trạng thái: ${newStatus}` });
      setIsModalOpen(false);
      loadMerchants();
    } catch (error) {
      showToast({ title: '❌ Cập nhật trạng thái thất bại' });
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Xóa vĩnh viễn Merchant
  const handleDeleteMerchant = async (id: string) => {
    if (!window.confirm('⚠️ CẢNH BÁO: Xóa đối tác sẽ xóa toàn bộ địa điểm (POIs) và dữ liệu liên quan. Bạn có chắc chắn?')) return;
    try {
      await adminApi.deleteMerchant(id);
      setMerchants(prev => prev.filter(m => m.id !== id));
      showToast({ title: '🗑️ Đã xóa đối tác vĩnh viễn' });
    } catch (error) {
      showToast({ title: '❌ Lỗi khi thực hiện xóa' });
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* HEADER & FILTER */}
      <div className="card cardPad mb-5">
        <h2 className="mb-5 text-[#8B7355] text-2xl font-extrabold">🤝 Đối tác (Merchants)</h2>
        <div className="flex gap-3">
          <input 
            className="input flex-1" placeholder="Tìm theo Tên hoặc Email (Tự động tìm)..."
            value={searchTerm} 
            onChange={e => setSearchTerm(e.target.value)}
          />
          <select 
            className="select w-52" 
            value={filterSub} 
            onChange={e => setFilterSub(e.target.value)}
          >
            <option value="">Tất cả trạng thái gói</option>
            <option value="ACTIVE">✅ Đang hoạt động (Active)</option>
            <option value="SUSPENDED">⚠️ Tạm ngưng (Suspended)</option>
            <option value="INACTIVE">⚪ Ngừng kích hoạt (Inactive)</option>
          </select>
        </div>
      </div>

      {/* MERCHANTS TABLE */}
      <div className="card cardPad">
        <table className="w-full border-collapse text-[#8B7355] text-left">
          <thead>
            <tr className="text-[#666] border-b border-[#333]">
              <th className="p-3">Đối tác / Đại diện</th>
              <th className="p-3">Tình trạng Hội viên</th>
              <th className="p-3">Doanh thu (Ước tính)</th>
              <th className="p-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr><td colSpan={4} className="text-center p-10">⏳ Đang truy xuất danh sách...</td></tr>
            ) : merchants.length === 0 ? (
              <tr><td colSpan={4} className="text-center p-10 text-[#666]">Không tìm thấy đối tác nào.</td></tr>
            ) : merchants.map(m => (
              <tr key={m.id} className="border-b border-[#222]">
                <td className="p-3">
                  <div className="font-bold text-brand">{m.business_name || 'N/A'}</div>
                  <div className="text-xs text-[#aaa]">{m.email}</div>
                </td>
                <td className="p-3">
                  <span className={`text-[10px] font-extrabold px-2 py-1 rounded ${m.subscription_status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'}`}>
                    {m.subscription_status}
                  </span>
                </td>
                <td className="p-3 font-semibold">
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(m.total_revenue || 0)}
                </td>
                <td className="p-3 text-right">
                  <button className="btn btnGhost text-xs" onClick={() => { setSelectedMerchant(m); setIsModalOpen(true); }}>👁️ Chi tiết</button>
                  <button className="btn text-[#ff4d4f]" onClick={() => handleDeleteMerchant(m.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CHI TIẾT & CẬP NHẬT TRẠNG THÁI (isModalOpen) */}
      {isModalOpen && selectedMerchant && (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-80">
          <div className="w-[500px] bg-[#1E1E2D] rounded-xl border border-[#444] overflow-hidden">
            <div className="rowBetween px-6 py-5 border-b border-[#333]">
              <h3 className="m-0 text-white">Hồ sơ Đối tác</h3>
              <button onClick={() => setIsModalOpen(false)} className="bg-none border-none text-white text-2xl">✕</button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-5 mb-6">
                <div className="bg-[#151521] p-4 rounded-lg text-center">
                  <div className="text-xs text-[#888] mb-1.5">Số lượng POIs</div>
                  <div className="text-white text-2xl font-extrabold">{selectedMerchant.poi_count || 0}</div>
                </div>
                <div className="bg-[#151521] p-4 rounded-lg text-center">
                  <div className="text-xs text-[#888] mb-1.5">Doanh thu tổng</div>
                  <div className="text-green-500 text-xl font-extrabold">{new Intl.NumberFormat('vi-VN').format(selectedMerchant.total_revenue || 0)}đ</div>
                </div>
              </div>
              <div className="mb-5">
                <label className="text-[#aaa] text-sm block mb-2.5">Thay đổi trạng thái hội viên:</label>
                <div className="flex gap-2.5">
                  {['ACTIVE', 'SUSPENDED', 'INACTIVE'].map(status => (
                    <button
                      key={status}
                      disabled={isProcessing}
                      className={`btn flex-1 text-[11px] ${selectedMerchant.subscription_status === status ? 'bg-brand text-white border-none' : 'bg-[#2A2A3C] text-white border-none'}`}
                      onClick={() => handleUpdateSubscription(selectedMerchant.id, status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              <div className="text-[#555] text-[11px] italic">
                * Lưu ý: Trạng thái SUSPENDED sẽ tạm ẩn tất cả các POIs của đối tác này khỏi ứng dụng người dùng.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}