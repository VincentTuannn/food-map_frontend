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
      const res = await adminApi.getMerchants(filterSub, searchTerm);
      setMerchants(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      showToast({ title: '❌ Lỗi tải danh sách đối tác' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { loadMerchants(); }, [filterSub]);

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
    <div style={{ animation: 'fadeIn 0.3s' }}>
      {/* HEADER & FILTER */}
      <div className="card cardPad" style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: 24, fontWeight: 800 }}>🤝 Đối tác (Merchants)</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <input 
            className="input" placeholder="Tìm theo Tên hoặc Email..." 
            style={{ flex: 1 }}
            value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadMerchants()}
          />
          <select className="select" style={{ width: 200 }} value={filterSub} onChange={e => setFilterSub(e.target.value)}>
            <option value="">Tất cả trạng thái gói</option>
            <option value="ACTIVE">✅ Đang hoạt động (Active)</option>
            <option value="SUSPENDED">⚠️ Tạm ngưng (Suspended)</option>
            <option value="INACTIVE">⚪ Ngừng kích hoạt (Inactive)</option>
          </select>
          <button className="btn btnPrimary" onClick={loadMerchants}>Tìm kiếm</button>
        </div>
      </div>

      {/* MERCHANTS TABLE */}
      <div className="card cardPad">
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: '#666', borderBottom: '1px solid #333' }}>
              <th style={{ padding: 12 }}>Đối tác / Đại diện</th>
              <th style={{ padding: 12 }}>Tình trạng Hội viên</th>
              <th style={{ padding: 12 }}>Doanh thu (Ước tính)</th>
              <th style={{ padding: 12, textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (<tr><td colSpan={4} style={{ textAlign: 'center', padding: 40 }}>⏳ Đang truy xuất danh sách...</td></tr>) : 
             merchants.map(m => (
              <tr key={m.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700, color: 'var(--brand)' }}>{m.business_name || 'N/A'}</div>
                  <div style={{ fontSize: 12, color: '#aaa' }}>{m.email}</div>
                </td>
                <td style={{ padding: 12 }}>
                  <span style={{ 
                    fontSize: 10, fontWeight: 800, padding: '4px 8px', borderRadius: 4,
                    background: m.subscription_status === 'ACTIVE' ? 'rgba(0,200,83,0.1)' : 'rgba(255,59,48,0.1)',
                    color: m.subscription_status === 'ACTIVE' ? '#00C853' : '#FF3B30'
                  }}>
                    {m.subscription_status}
                  </span>
                </td>
                <td style={{ padding: 12, fontWeight: 600 }}>
                   {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(m.total_revenue || 0)}
                </td>
                <td style={{ padding: 12, textAlign: 'right' }}>
                  <button className="btn btnGhost" style={{ fontSize: 12 }} onClick={() => { setSelectedMerchant(m); setIsModalOpen(true); }}>👁️ Chi tiết</button>
                  <button className="btn" style={{ color: '#ff4d4f' }} onClick={() => handleDeleteMerchant(m.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CHI TIẾT & CẬP NHẬT TRẠNG THÁI (isModalOpen) */}
      {isModalOpen && selectedMerchant && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: 500, background: '#1E1E2D', borderRadius: 12, border: '1px solid #444', overflow: 'hidden' }}>
            <div className="rowBetween" style={{ padding: '20px 24px', borderBottom: '1px solid #333' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>Hồ sơ Đối tác</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20 }}>✕</button>
            </div>
            
            <div style={{ padding: 24 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 25 }}>
                <div style={{ background: '#151521', padding: 15, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ color: '#888', fontSize: 12, marginBottom: 5 }}>Số lượng POIs</div>
                  <div style={{ color: '#fff', fontSize: 24, fontWeight: 800 }}>{selectedMerchant.poi_count || 0}</div>
                </div>
                <div style={{ background: '#151521', padding: 15, borderRadius: 8, textAlign: 'center' }}>
                  <div style={{ color: '#888', fontSize: 12, marginBottom: 5 }}>Doanh thu tổng</div>
                  <div style={{ color: '#00C853', fontSize: 20, fontWeight: 800 }}>{new Intl.NumberFormat('vi-VN').format(selectedMerchant.total_revenue || 0)}đ</div>
                </div>
              </div>

              <div style={{ marginBottom: 20 }}>
                <label style={{ color: '#aaa', fontSize: 13, display: 'block', marginBottom: 10 }}>Thay đổi trạng thái hội viên:</label>
                <div style={{ display: 'flex', gap: 10 }}>
                  {['ACTIVE', 'SUSPENDED', 'INACTIVE'].map(status => (
                    <button 
                      key={status}
                      disabled={isProcessing}
                      className="btn"
                      style={{ 
                        flex: 1, fontSize: 11,
                        background: selectedMerchant.subscription_status === status ? 'var(--brand)' : '#2A2A3C',
                        color: '#fff', border: 'none'
                      }}
                      onClick={() => handleUpdateSubscription(selectedMerchant.id, status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
              
              <div style={{ color: '#555', fontSize: 11, fontStyle: 'italic' }}>
                * Lưu ý: Trạng thái SUSPENDED sẽ tạm ẩn tất cả các POIs của đối tác này khỏi ứng dụng người dùng.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}