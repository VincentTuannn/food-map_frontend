import { useState, useEffect } from 'react';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

export function AdminTransactions() {
  const showToast = useAppStore((s) => s.showToast);
  
  // States dữ liệu
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // States bộ lọc
  const [filters, setFilters] = useState({
    status: '',
    actor_type: '',
  });

  // 1. Tải dữ liệu giao dịch
  const loadTransactions = async () => {
    setIsFetching(true);
    try {
      const res = await adminApi.getTransactions(filters.status, filters.actor_type);
      setTransactions(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      showToast({ title: '❌ Lỗi tải dữ liệu dòng tiền' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, [filters.status, filters.actor_type]);

  // Hàm định dạng số tiền (Ví dụ: 100.000đ)
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
  };

  // Hàm hiển thị Badge trạng thái
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'SUCCESS': return { color: '#00C853', bg: 'rgba(0, 200, 83, 0.1)', text: 'Thành công' };
      case 'FAILED': return { color: '#FF3B30', bg: 'rgba(255, 59, 48, 0.1)', text: 'Thất bại' };
      case 'PENDING': return { color: '#FFCC00', bg: 'rgba(255, 204, 0, 0.1)', text: 'Đang xử lý' };
      default: return { color: '#888', bg: 'rgba(255, 255, 255, 0.05)', text: status };
    }
  };

  return (
    <div className="animate-fadeIn">
      {/* HEADER & FILTER */}
      <div className="card cardPad mb-5">
        <h2 className="mb-5 text-[#8B7355] text-2xl font-extrabold">💰 Đối soát dòng tiền</h2>
        <div className="flex gap-4 flex-wrap">
          <div className="flex-1 min-w-[200px]">
            <label className="text-[#888] text-xs block mb-1.5">Đối tượng</label>
            <select
              className="select w-full"
              value={filters.actor_type}
              onChange={e => setFilters({ ...filters, actor_type: e.target.value })}
            >
              <option value="">Tất cả đối tượng</option>
              <option value="USER">Khách du lịch (User)</option>
              <option value="MERCHANT">Đối tác (Merchant)</option>
            </select>
          </div>
          <div className="flex-1 min-w-[200px]">
            <label className="text-[#888] text-xs block mb-1.5">Trạng thái</label>
            <select
              className="select w-full"
              value={filters.status}
              onChange={e => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công</option>
              <option value="PENDING">Đang chờ</option>
              <option value="FAILED">Thất bại</option>
            </select>
          </div>
          <div className="flex items-end">
            <button className="btn btnGhost" onClick={loadTransactions}>🔄 Làm mới</button>
          </div>
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <div className="card cardPad">
        <table className="w-full border-collapse text-white text-left">
          <thead>
            <tr className="text-[#666] border-b border-[#333]">
              <th className="py-4 px-2.5">Mã giao dịch</th>
              <th className="py-4 px-2.5">Đối tượng</th>
              <th className="py-4 px-2.5">Số tiền</th>
              <th className="py-4 px-2.5">Ngày thực hiện</th>
              <th className="py-4 px-2.5 text-center">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr><td colSpan={5} className="text-center py-10 text-[#888]">⏳ Đang tải dữ liệu giao dịch...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-[#888]">Không có giao dịch nào được tìm thấy.</td></tr>
            ) : (
              transactions.map((item) => {
                const s = getStatusStyle(item.status);
                return (
                  <tr key={item.id} className="border-b border-[#222]">
                    <td className="py-4 px-2.5">
                      <code className="text-[#C77DFF] text-xs">#{item.id.slice(0, 8).toUpperCase()}</code>
                    </td>
                    <td className="py-4 px-2.5">
                      <div className="font-semibold">{item.actor_type}</div>
                      <div className="text-[11px] text-[#555]">{item.user?.email || item.merchant?.email || 'N/A'}</div>
                    </td>
                    <td className={`py-4 px-2.5 font-extrabold ${item.status === 'SUCCESS' ? 'text-green-600' : 'text-white'}`}>{formatCurrency(item.amount)}</td>
                    <td className="py-4 px-2.5 text-[#aaa] text-sm">{new Date(item.created_at || item.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="py-4 px-2.5 text-center">
                      <span className="px-3 py-1 rounded-full text-[11px] font-bold" style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}33` }}>{s.text}</span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}