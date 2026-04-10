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
    <div style={{ animation: 'fadeIn 0.3s' }}>
      {/* HEADER & FILTER */}
      <div className="card cardPad" style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#8B7355', fontSize: 24, fontWeight: 800 }}>💰 Đối soát dòng tiền</h2>
        
        <div style={{ display: 'flex', gap: 15, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 5 }}>Đối tượng</label>
            <select 
              className="select" 
              value={filters.actor_type}
              onChange={(e) => setFilters({...filters, actor_type: e.target.value})}
            >
              <option value="">Tất cả đối tượng</option>
              <option value="USER">Khách du lịch (User)</option>
              <option value="MERCHANT">Đối tác (Merchant)</option>
            </select>
          </div>

          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 5 }}>Trạng thái</label>
            <select 
              className="select" 
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">Tất cả trạng thái</option>
              <option value="SUCCESS">Thành công</option>
              <option value="PENDING">Đang chờ</option>
              <option value="FAILED">Thất bại</option>
            </select>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btnGhost" onClick={loadTransactions}>🔄 Làm mới</button>
          </div>
        </div>
      </div>

      {/* TRANSACTION TABLE */}
      <div className="card cardPad">
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: '#666', borderBottom: '1px solid #333' }}>
              <th style={{ padding: '15px 10px' }}>Mã giao dịch</th>
              <th style={{ padding: '15px 10px' }}>Đối tượng</th>
              <th style={{ padding: '15px 10px' }}>Số tiền</th>
              <th style={{ padding: '15px 10px' }}>Ngày thực hiện</th>
              <th style={{ padding: '15px 10px', textAlign: 'center' }}>Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#888' }}>⏳ Đang tải dữ liệu giao dịch...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#888' }}>Không có giao dịch nào được tìm thấy.</td></tr>
            ) : (
              transactions.map((item) => {
                const s = getStatusStyle(item.status);
                return (
                  <tr key={item.id} style={{ borderBottom: '1px solid #222' }}>
                    <td style={{ padding: '15px 10px' }}>
                      <code style={{ color: '#C77DFF', fontSize: 12 }}>#{item.id.slice(0, 8).toUpperCase()}</code>
                    </td>
                    <td style={{ padding: '15px 10px' }}>
                      <div style={{ fontWeight: 600 }}>{item.actor_type}</div>
                      <div style={{ fontSize: 11, color: '#555' }}>{item.user?.email || item.merchant?.email || 'N/A'}</div>
                    </td>
                    <td style={{ padding: '15px 10px', fontWeight: 800, color: item.status === 'SUCCESS' ? '#00C853' : '#fff' }}>
                      {formatCurrency(item.amount)}
                    </td>
                    <td style={{ padding: '15px 10px', color: '#aaa', fontSize: 13 }}>
                      {new Date(item.created_at || item.createdAt).toLocaleString('vi-VN')}
                    </td>
                    <td style={{ padding: '15px 10px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '4px 12px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                        background: s.bg, color: s.color, border: `1px solid ${s.color}33`
                      }}>
                        {s.text}
                      </span>
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