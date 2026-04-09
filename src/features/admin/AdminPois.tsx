import { useState, useEffect } from 'react';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

export function AdminPois() {
  const showToast = useAppStore((s) => s.showToast);
  
  // States dữ liệu
  const [pois, setPois] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // States Chi tiết & Modal (Dùng isModalOpen)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState<any>(null);

  // States Bộ lọc
  const [filterStatus, setFilterStatus] = useState('');
  const [searchName, setSearchName] = useState('');

  // 1. Tải danh sách POIs
  const loadPois = async () => {
    setIsFetching(true);
    try {
      const res = await adminApi.getPois(filterStatus, searchName);
      setPois(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      showToast({ title: '❌ Lỗi tải danh sách địa điểm' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { loadPois(); }, [filterStatus]);

  // 2. Cập nhật trạng thái (PATCH /pois/:id/status)
  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await adminApi.updatePoiStatus(id, newStatus as any);
      showToast({ title: `✅ Đã chuyển trạng thái sang ${newStatus}` });
      setIsModalOpen(false); // Đóng modal nếu đang xem chi tiết
      loadPois(); // Tải lại danh sách
    } catch (error) {
      showToast({ title: '❌ Cập nhật thất bại' });
    }
  };

  // 3. Xóa địa điểm (DELETE)
  const handleDeletePoi = async (id: string) => {
    if (!window.confirm('⚠️ Xóa vĩnh viễn địa điểm này? Hành động này sẽ xóa sạch dữ liệu liên quan.')) return;
    try {
      await adminApi.deletePoi(id);
      setPois(prev => prev.filter(p => p.id !== id));
      showToast({ title: '🗑️ Đã xóa địa điểm' });
    } catch (error) {
      showToast({ title: '❌ Lỗi khi xóa' });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return '#00C853';
      case 'PENDING': return '#FFCC00';
      case 'REJECTED': return '#FF3B30';
      default: return '#888';
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      {/* HEADER & FILTER */}
      <div className="card cardPad" style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: 24, fontWeight: 800 }}>📍 Duyệt địa điểm (POIs)</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <input 
            className="input" placeholder="Tìm tên địa điểm..." 
            style={{ flex: 1 }}
            value={searchName} onChange={e => setSearchName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && loadPois()}
          />
          <select className="select" style={{ width: 180 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="PENDING">🕒 Chờ duyệt</option>
            <option value="ACTIVE">✅ Đã duyệt</option>
            <option value="REJECTED">❌ Từ chối</option>
            <option value="INACTIVE">Ẩn</option>
          </select>
          <button className="btn btnPrimary" onClick={loadPois}>🔍 Tìm</button>
        </div>
      </div>

      {/* LIST TABLE */}
      <div className="card cardPad">
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: '#666', borderBottom: '1px solid #333' }}>
              <th style={{ padding: 12 }}>Địa điểm</th>
              <th style={{ padding: 12 }}>Chủ sở hữu (Merchant)</th>
              <th style={{ padding: 12 }}>Trạng thái</th>
              <th style={{ padding: 12, textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (<tr><td colSpan={4} style={{ textAlign: 'center', padding: 40 }}>⏳ Đang tải...</td></tr>) : 
             pois.map(poi => (
              <tr key={poi.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700 }}>{poi.name}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>Loại: {poi.category_id || 'N/A'}</div>
                </td>
                <td style={{ padding: 12, color: '#aaa' }}>{poi.Merchant?.business_name || 'N/A'}</td>
                <td style={{ padding: 12 }}>
                  <span className="pill" style={{ background: getStatusColor(poi.status), color: '#fff', fontSize: 10 }}>{poi.status}</span>
                </td>
                <td style={{ padding: 12, textAlign: 'right' }}>
                  <button className="btn btnGhost" style={{ padding: '4px 8px', fontSize: 12 }} onClick={() => { setSelectedPoi(poi); setIsModalOpen(true); }}>👁️ Xem & Duyệt</button>
                  <button className="btn" style={{ color: '#ff4d4f' }} onClick={() => handleDeletePoi(poi.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CHI TIẾT & DUYỆT (isModalOpen) */}
      {isModalOpen && selectedPoi && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: 650, background: '#1E1E2D', borderRadius: 12, border: '1px solid #444', overflow: 'hidden', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div className="rowBetween" style={{ padding: '20px 24px', borderBottom: '1px solid #333' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>Chi tiết địa điểm: {selectedPoi.name}</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20 }}>✕</button>
            </div>
            
            <div style={{ padding: 24, overflowY: 'auto', flex: 1 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
                <div>
                  <label style={{ color: '#888', fontSize: 12 }}>Tọa độ</label>
                  <div style={{ color: '#fff' }}>{selectedPoi.latitude}, {selectedPoi.longitude}</div>
                </div>
                <div>
                  <label style={{ color: '#888', fontSize: 12 }}>Cơ sở sở hữu</label>
                  <div style={{ color: 'var(--brand)' }}>{selectedPoi.Merchant?.business_name}</div>
                </div>
              </div>

              <div style={{ padding: 15, background: '#151521', borderRadius: 8, marginBottom: 20 }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#C77DFF' }}>Nội dung đa ngôn ngữ</h4>
                {selectedPoi.PoiContents?.map((content: any) => (
                  <div key={content.id} style={{ marginBottom: 10, fontSize: 13, borderBottom: '1px solid #2A2A3C', paddingBottom: 5 }}>
                    <b style={{ color: '#fff' }}>[{content.language_code}]</b>: {content.description.substring(0, 100)}...
                  </div>
                )) || 'Không có dữ liệu nội dung.'}
              </div>

              <h4 style={{ margin: '0 0 10px 0', color: '#FFCC00' }}>⭐ 5 Đánh giá mới nhất</h4>
              {selectedPoi.Reviews?.length > 0 ? selectedPoi.Reviews.map((r: any) => (
                <div key={r.id} style={{ fontSize: 12, color: '#aaa', padding: '8px 0', borderBottom: '1px dotted #333' }}>
                  <b>{r.rating} sao:</b> {r.comment}
                </div>
              )) : <div style={{ color: '#555', fontSize: 12 }}>Chưa có đánh giá nào.</div>}
            </div>

            <div style={{ padding: 24, background: '#161622', borderTop: '1px solid #333', display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
               <button className="btn" style={{ background: '#FF3B30', color: '#fff' }} onClick={() => handleUpdateStatus(selectedPoi.id, 'REJECTED')}>❌ Từ chối</button>
               <button className="btn" style={{ background: '#888', color: '#fff' }} onClick={() => handleUpdateStatus(selectedPoi.id, 'INACTIVE')}>Ẩn</button>
               <button className="btn btnPrimary" onClick={() => handleUpdateStatus(selectedPoi.id, 'ACTIVE')}>✅ Duyệt hoạt động</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}