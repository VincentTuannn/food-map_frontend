import { useState, useEffect } from 'react';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

export function AdminActiveUsers() {
  const showToast = useAppStore((s) => s.showToast);
  
  const [activeUsersStats, setActiveUsersStats] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);

  const loadData = async () => {
    setIsFetching(true);
    try {
      const res = await adminApi.getActiveUsers();
      if (res.success && res.data) {
        setActiveUsersStats(res.data);
      }
    } catch (error) {
      showToast({ title: '❌ Lỗi tải thiết bị trực tuyến' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    loadData();
    // Auto-refresh mỗi 30 giây
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      <div className="card cardPad" style={{ marginBottom: 20 }}>
        <div className="rowBetween">
          <div>
            <h2 style={{ margin: 0, color: '#8B7355', fontSize: 24, fontWeight: 800 }}>🟢 Thiết bị đang hoạt động</h2>
            <p style={{ color: '#888', marginTop: 5, fontSize: 14 }}>Danh sách các người dùng có tương tác với hệ thống hệ thống trong 5 phút qua.</p>
          </div>
          <button className="btn btnPrimary" onClick={loadData}>
            🔄 Làm mới
          </button>
        </div>
      </div>

      {/* THÔNG KÊ NHANH */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 20, marginBottom: 20 }}>
          <div className="card cardPad" style={{ borderLeft: '4px solid #00E676' }}>
              <div style={{ color: '#888', fontSize: 13, fontWeight: 600 }}>Tất cả</div>
              <div style={{ color: '#00E676', fontSize: 24, fontWeight: 900 }}>{activeUsersStats?.count || 0}</div>
          </div>
          <div className="card cardPad" style={{ borderLeft: '4px solid #7B2CBF' }}>
              <div style={{ color: '#888', fontSize: 13, fontWeight: 600 }}>User</div>
              <div style={{ color: '#7B2CBF', fontSize: 24, fontWeight: 900 }}>{activeUsersStats?.breakdown?.USER || 0}</div>
          </div>
          <div className="card cardPad" style={{ borderLeft: '4px solid #9D4EDD' }}>
              <div style={{ color: '#888', fontSize: 13, fontWeight: 600 }}>Merchant</div>
              <div style={{ color: '#9D4EDD', fontSize: 24, fontWeight: 900 }}>{activeUsersStats?.breakdown?.MERCHANT || 0}</div>
          </div>
          <div className="card cardPad" style={{ borderLeft: '4px solid #ff4d4f' }}>
              <div style={{ color: '#888', fontSize: 13, fontWeight: 600 }}>Admin</div>
              <div style={{ color: '#ff4d4f', fontSize: 24, fontWeight: 900 }}>{activeUsersStats?.breakdown?.ADMIN || 0}</div>
          </div>
      </div>

      {/* DANH SÁCH CHI TIẾT */}
      <div className="card cardPad">
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#8B7355', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: '#666', borderBottom: '1px solid #333' }}>
              <th style={{ padding: 12 }}>Người dùng / ID</th>
              <th style={{ padding: 12 }}>Vai trò</th>
              <th style={{ padding: 12 }}>Thiết bị</th>
              <th style={{ padding: 12 }}>Tương tác cuối</th>
              <th style={{ padding: 12, textAlign: 'right' }}>Thời lượng</th>
            </tr>
          </thead>
          <tbody>
            {isFetching && !activeUsersStats ? (<tr><td colSpan={5} style={{ textAlign: 'center', padding: 40 }}>⏳ Đang tải...</td></tr>) : 
             !activeUsersStats?.users || activeUsersStats.users.length === 0 ? (<tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: '#666' }}>Không có người dùng nào đang hoạt động.</td></tr>) :
             activeUsersStats.users.map((u: any, idx: number) => (
              <tr key={idx} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700 }}>{u.email}</div>
                  <div style={{ fontSize: 11, color: '#555' }}>ID: {u.id}</div>
                </td>
                <td style={{ padding: 12 }}>
                  <span className="pill" style={{ background: '#2A2A3C', color: '#aaa', fontSize: 10 }}>{u.role?.toUpperCase() || 'USER'}</span>
                </td>
                <td style={{ padding: 12 }}>
                  <div style={{ fontSize: 13 }}>{u.device_id || 'Web / Unknown'}</div>
                </td>
                <td style={{ padding: 12 }}>
                  <div style={{ fontSize: 13, color: '#8B7355' }}>{new Date(u.last_seen).toLocaleTimeString('vi-VN')}</div>
                </td>
                <td style={{ padding: 12, textAlign: 'right', fontWeight: 'bold' }}>
                  {u.duration_minutes} phút
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
