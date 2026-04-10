import { useState, useEffect } from 'react';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

export function AdminTracking() {
  const showToast = useAppStore((s) => s.showToast);
  
  // States dữ liệu
  const [logs, setLogs] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  // States bộ lọc (Sửa lại để hoạt động thực tế)
  const [filters, setFilters] = useState({
    event_type: '',
    date_from: '',
    date_to: ''
  });

  // 1. Tải dữ liệu gốc từ Server (Chỉ tải 1 lần để tối ưu)
  const loadLogs = async () => {
    setIsFetching(true);
    try {
      // Gọi API lấy toàn bộ log
      const res = await adminApi.getTrackingLogs(''); 
      const data = Array.isArray(res) ? res : res?.data || [];
      setLogs(data);
    } catch (error) {
      showToast({ title: '❌ Lỗi kết nối nhật ký hệ thống' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  // ✅ CHỨC NĂNG LỌC CHÍNH: Đây là nơi xử lý logic "hoạt động" của trang
  const filteredLogs = logs.filter((log) => {
    // A. Lọc theo Loại sự kiện
    if (filters.event_type && log.event_type !== filters.event_type) return false;

    // B. Xử lý thời gian để so sánh (Đưa tất cả về mốc 00:00:00 để so sánh chính xác ngày)
    const logDateRaw = new Date(log.created_at || log.createdAt);
    if (isNaN(logDateRaw.getTime())) return true; // Bỏ qua nếu data lỗi

    const logTime = new Date(logDateRaw.getFullYear(), logDateRaw.getMonth(), logDateRaw.getDate()).getTime();

    // C. Lọc "Từ ngày"
    if (filters.date_from) {
      const fromDate = new Date(filters.date_from);
      const fromTime = new Date(fromDate.getFullYear(), fromDate.getMonth(), fromDate.getDate()).getTime();
      if (logTime < fromTime) return false;
    }

    // D. Lọc "Đến ngày"
    if (filters.date_to) {
      const toDate = new Date(filters.date_to);
      const toTime = new Date(toDate.getFullYear(), toDate.getMonth(), toDate.getDate()).getTime();
      if (logTime > toTime) return false;
    }

    return true;
  });

  // UI hiển thị Badge cho từng loại log
  const getEventBadge = (type: string) => {
    const config: any = {
      'LOGIN': { bg: '#E8F5E9', color: '#2E7D32', text: 'ĐĂNG NHẬP' },
      'CREATE': { bg: '#E3F2FD', color: '#1565C0', text: 'TẠO MỚI' },
      'UPDATE': { bg: '#FFF3E0', color: '#EF6C00', text: 'CẬP NHẬT' },
      'DELETE': { bg: '#FFEBEE', color: '#C62828', text: 'XÓA DỮ LIỆU' },
      'DEFAULT': { bg: '#F5F5F5', color: '#757575', text: type }
    };
    const style = config[type] || config['DEFAULT'];
    return (
      <span style={{ 
        padding: '4px 10px', borderRadius: 6, fontSize: 10, fontWeight: 800,
        background: style.bg, color: style.color, border: `1px solid ${style.color}44`
      }}>
        {style.text}
      </span>
    );
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      {/* KHỐI BỘ LỌC CẢI TIẾN */}
      <div className="card cardPad" style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: 22, fontWeight: 800 }}>🛡️ Nhật ký hệ thống</h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 15 }}>
          <div>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 8 }}>Loại sự kiện</label>
            <select 
              className="input" 
              style={{ width: '100%', background: '#151521' }}
              value={filters.event_type}
              onChange={(e) => setFilters({...filters, event_type: e.target.value})}
            >
              <option value="">-- Tất cả sự kiện --</option>
              <option value="LOGIN">Đăng nhập (LOGIN)</option>
              <option value="CREATE">Tạo mới (CREATE)</option>
              <option value="UPDATE">Cập nhật (UPDATE)</option>
              <option value="DELETE">Xóa dữ liệu (DELETE)</option>
            </select>
          </div>

          <div>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 8 }}>Từ ngày</label>
            <input 
              type="date" className="input" style={{ width: '100%' }}
              value={filters.date_from}
              onChange={(e) => setFilters({...filters, date_from: e.target.value})}
            />
          </div>

          <div>
            <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 8 }}>Đến ngày</label>
            <input 
              type="date" className="input" style={{ width: '100%' }}
              value={filters.date_to}
              onChange={(e) => setFilters({...filters, date_to: e.target.value})}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
            <button 
              className="btn" 
              style={{ flex: 1, background: '#2A2A3C', color: '#fff' }}
              onClick={() => setFilters({ event_type: '', date_from: '', date_to: '' })}
            >
              🔄 Reset
            </button>
            <button className="btn btnPrimary" style={{ flex: 1 }} onClick={loadLogs}>
              Tải lại
            </button>
          </div>
        </div>
      </div>

      {/* BẢNG DỮ LIỆU NHẬT KÝ */}
      <div className="card cardPad">
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff' }}>
          <thead>
            <tr style={{ textAlign: 'left', color: '#666', borderBottom: '1px solid #333' }}>
              <th style={{ padding: '15px 10px' }}>Thời gian</th>
              <th style={{ padding: '15px 10px' }}>Sự kiện</th>
              <th style={{ padding: '15px 10px' }}>Người thực hiện</th>
              <th style={{ padding: '15px 10px' }}>Chi tiết hành động</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 50, color: '#888' }}>⏳ Đang truy xuất nhật ký...</td></tr>
            ) : filteredLogs.length === 0 ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 50, color: '#888' }}>Không có dữ liệu phù hợp với bộ lọc.</td></tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} style={{ borderBottom: '1px solid #222', fontSize: 13, transition: '0.2s' }}>
                  <td style={{ padding: '15px 10px', color: '#aaa', whiteSpace: 'nowrap' }}>
                    {new Date(log.created_at || log.createdAt).toLocaleString('vi-VN')}
                  </td>
                  <td style={{ padding: '15px 10px' }}>
                    {getEventBadge(log.event_type)}
                  </td>
                  <td style={{ padding: '15px 10px' }}>
                    <div style={{ fontWeight: 700, color: '#fff' }}>{log.user?.email || 'System'}</div>
                    <div style={{ fontSize: 10, color: '#444' }}>ID: {log.user_id || 'N/A'}</div>
                  </td>
                  <td style={{ padding: '15px 10px', color: '#ddd', lineHeight: '1.5' }}>
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