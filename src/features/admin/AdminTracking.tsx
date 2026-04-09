import { useState, useEffect } from 'react';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

export function AdminTracking() {
  const showToast = useAppStore((s) => s.showToast);
  
  // States dữ liệu
  const [logs, setLogs] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // States bộ lọc (Filter)
  const [filters, setFilters] = useState({
    event_type: '',
    user_id: '',
    date_from: '',
    date_to: ''
  });

  // 1. Hàm tải dữ liệu nhật ký
  const loadLogs = async () => {
    setIsFetching(true);
    try {
      // Gọi API với các tham số lọc
      const res = await adminApi.getTrackingLogs(filters.event_type); 
      // Lưu ý: Nếu admin.ts của bạn đã hỗ trợ truyền object filter, hãy truyền cả filters vào
      setLogs(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      showToast({ title: '❌ Lỗi tải nhật ký hệ thống' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, [filters.event_type]); // Tải lại khi đổi loại sự kiện

  // Hàm hỗ trợ hiển thị màu sắc cho từng loại sự kiện
  const getEventBadge = (type: string) => {
    const styles: any = {
      'LOGIN': { bg: 'rgba(76, 175, 80, 0.1)', color: '#4caf50' },
      'DELETE': { bg: 'rgba(244, 67, 54, 0.1)', color: '#f44336' },
      'UPDATE': { bg: 'rgba(255, 152, 0, 0.1)', color: '#ff9800' },
      'CREATE': { bg: 'rgba(33, 150, 243, 0.1)', color: '#2196f3' },
      'DEFAULT': { bg: 'rgba(158, 158, 158, 0.1)', color: '#9e9e9e' }
    };
    const style = styles[type] || styles['DEFAULT'];
    return (
      <span style={{ 
        padding: '4px 8px', borderRadius: 4, fontSize: 11, fontWeight: 700,
        background: style.bg, color: style.color, border: `1px solid ${style.color}33`
      }}>
        {type}
      </span>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      {/* HEADER & FILTER SECTION */}
      <div className="card cardPad" style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: 24, fontWeight: 800 }}>🛡️ Nhật ký hệ thống</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 15 }}>
          <div>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 5 }}>Loại sự kiện</label>
            <select 
              className="input" 
              style={{ width: '100%', background: '#151521' }}
              value={filters.event_type}
              onChange={(e) => setFilters({...filters, event_type: e.target.value})}
            >
              <option value="">Tất cả sự kiện</option>
              <option value="LOGIN">Đăng nhập</option>
              <option value="CREATE">Tạo mới</option>
              <option value="UPDATE">Cập nhật</option>
              <option value="DELETE">Xóa dữ liệu</option>
            </select>
          </div>

          <div>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 5 }}>Từ ngày</label>
            <input 
              type="date" className="input" style={{ width: '100%' }}
              onChange={(e) => setFilters({...filters, date_from: e.target.value})}
            />
          </div>

          <div>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 5 }}>Đến ngày</label>
            <input 
              type="date" className="input" style={{ width: '100%' }}
              onChange={(e) => setFilters({...filters, date_to: e.target.value})}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button className="btn btnPrimary" style={{ width: '100%' }} onClick={loadLogs}>
              🔍 Lọc dữ liệu
            </button>
          </div>
        </div>
      </div>

      {/* LOGS TABLE SECTION */}
      <div className="card cardPad">
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: '#666', borderBottom: '1px solid #333' }}>
              <th style={{ padding: '15px 10px', width: 180 }}>Thời gian</th>
              <th style={{ padding: '15px 10px', width: 120 }}>Sự kiện</th>
              <th style={{ padding: '15px 10px', width: 200 }}>Người thực hiện</th>
              <th style={{ padding: '15px 10px' }}>Chi tiết hành động</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#888' }}>⌛ Đang truy xuất nhật ký...</td></tr>
            ) : logs.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#888' }}>Không tìm thấy nhật ký nào phù hợp.</td></tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #222', fontSize: 13 }}>
                  <td style={{ padding: '15px 10px', color: '#aaa' }}>
                    {new Date(log.created_at).toLocaleString('vi-VN')}
                  </td>
                  <td style={{ padding: '15px 10px' }}>
                    {getEventBadge(log.event_type)}
                  </td>
                  <td style={{ padding: '15px 10px' }}>
                    <div style={{ fontWeight: 600 }}>{log.user?.email || 'N/A'}</div>
                    <div style={{ fontSize: 10, color: '#444' }}>ID: {log.user_id}</div>
                  </td>
                  <td style={{ padding: '15px 10px', color: '#ddd' }}>
                    {log.description}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}