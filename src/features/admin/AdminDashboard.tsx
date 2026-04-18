import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

export function AdminDashboard() {
  const showToast = useAppStore((s) => s.showToast);
  const navigate = useNavigate(); // Hook dùng để chuyển trang
  const [stats, setStats] = useState<any>(null);
  const [isFetching, setIsFetching] = useState(true);

  // === Active Users: real-time count with auto-refresh ===
  const [activeUsersCount, setActiveUsersCount] = useState<number>(0);

  const loadDashboard = async () => {
    setIsFetching(true);
    try {
      const res = await adminApi.getDashboardStats();
      
      if (res.success && res.data) {
        setStats({
          totalUsers: res.data.users || 0,
          totalMerchants: res.data.merchants || 0,
          totalPois: res.data.pois || 0,
          totalRevenue: res.data.revenue || 0, 
          totalReviews: res.data.reviews || 0,
          totalTours: res.data.tours || 0,
          totalPromotions: res.data.promotions || 0,
          totalTransactions: res.data.transactions || 0,
          newPoisLast7Days: res.data.newPoisLast7Days || 0,
          
          // Xử lý mảng trạng thái Địa điểm
          poisByStatus: (res.data.poi_statuses || []).reduce((acc: any, curr: any) => {
            acc[curr.status] = curr.count;
            return acc;
          }, {}),

          // Xử lý mảng trạng thái Đối tác (Đã fix lỗi chữ undefined)
          merchantsByStatus: (res.data.merchant_statuses || []).reduce((acc: any, curr: any) => {
            const statusName = curr.subscription_status || curr.status || 'Khác';
            acc[statusName] = curr.count;
            return acc;
          }, {})
        });
      } else {
         setStats(null);
      }
    } catch (error) {
      showToast({ title: '❌ Không thể tải dữ liệu thống kê' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { loadDashboard(); }, []);

  // Auto-refresh active users count every 30 seconds
  useEffect(() => {
    const fetchActiveUsers = async () => {
      try {
        const res = await adminApi.getActiveUsers();
        if (res.success && res.data) {
          setActiveUsersCount(res.data.count || 0);
        }
      } catch { /* silent */ }
    };
    fetchActiveUsers();
    const interval = setInterval(fetchActiveUsers, 30000);
    return () => clearInterval(interval);
  }, []);

  if (isFetching) return <div style={{ color: '#888', textAlign: 'center', padding: 50 }}>⏳ Đang tổng hợp số liệu hệ thống...</div>;

  // Thành phần thẻ chỉ số nhỏ (Đã thêm tính năng Click chuyển trang)
  const StatCard = ({ title, value, icon, color, path }: any) => (
    <div 
      className="card cardPad" 
      onClick={() => path && navigate(path)}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: 20, 
        borderLeft: `4px solid ${color}`,
        cursor: path ? 'pointer' : 'default', // Hiện hình bàn tay nếu có link
      }}
    >
      <div style={{ fontSize: 32, background: `${color}22`, padding: 10, borderRadius: 12 }}>{icon}</div>
      <div>
        <div style={{ color: '#888', fontSize: 13, fontWeight: 600 }}>{title}</div>
        <div style={{ color: '#8B7355', fontSize: 24, fontWeight: 900 }}>{value?.toLocaleString() || 0}</div>
      </div>
    </div>
  );

  return (
    <div style={{ animation: 'fadeIn 0.4s', display: 'flex', flexDirection: 'column', gap: 24 }}>
      
      {/* 1. HÀNG ĐẦU: CÁC CON SỐ TỔNG QUÁT (Đã gắn link) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
        <StatCard title="Đang hoạt động" value={activeUsersCount} icon="🟢" color="#00E676" />
        <StatCard title="Tổng Doanh thu" value={stats?.totalRevenue} icon="💰" color="#00C853" path="/admin/transactions" />
        <StatCard title="Khách du lịch" value={stats?.totalUsers} icon="👥" color="#7B2CBF" path="/admin/users" />
        <StatCard title="Đối tác (Merchant)" value={stats?.totalMerchants} icon="🏪" color="#9D4EDD" path="/admin/merchants" />
        <StatCard title="Địa điểm (POIs)" value={stats?.totalPois} icon="📍" color="#C77DFF" path="/admin/pois" />
      </div>

      {/* 2. HÀNG GIỮA: CHI TIẾT TRẠNG THÁI & TƯƠNG TÁC */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
        
        {/* Thống kê POIs theo trạng thái */}
        <div className="card cardPad">
          <h3 style={{ color: '#8B7355', margin: '0 0 15px 0', fontSize: 16 }}>📊 Trạng thái Địa điểm</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {Object.entries(stats?.poisByStatus || {}).length > 0 ? (
               Object.entries(stats?.poisByStatus || {}).map(([status, count]: any) => (
                <div key={status} className="rowBetween" style={{ fontSize: 14 }}>
                  <span style={{ color: '#aaa' }}>{status}</span>
                  <b style={{ color: '#fff' }}>{count}</b>
                </div>
              ))
            ) : (
                <div style={{ color: '#666', fontSize: 14, fontStyle: 'italic' }}>Chưa có dữ liệu trạng thái</div>
            )}
            
            <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid #222', color: 'var(--brand)', fontSize: 13 }}>
              ✨ <b>{stats?.newPoisLast7Days || 0}</b> địa điểm mới trong 7 ngày qua
            </div>
          </div>
        </div>

        {/* Thống kê Tương tác & Dữ liệu khác */}
        <div className="card cardPad">
          <h3 style={{ color: '#8B7355', margin: '0 0 15px 0', fontSize: 16 }}>📈 Chỉ số tương tác</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
            <div style={{ background: '#151521', padding: 12, borderRadius: 8 }}>
              <div style={{ color: '#666', fontSize: 11 }}>Đánh giá</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{stats?.totalReviews}</div>
            </div>
            <div style={{ background: '#151521', padding: 12, borderRadius: 8 }}>
              <div style={{ color: '#666', fontSize: 11 }}>Tuyến đường</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{stats?.totalTours}</div>
            </div>
            <div style={{ background: '#151521', padding: 12, borderRadius: 8 }}>
              <div style={{ color: '#666', fontSize: 11 }}>Khuyến mãi</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{stats?.totalPromotions}</div>
            </div>
            <div style={{ background: '#151521', padding: 12, borderRadius: 8 }}>
              <div style={{ color: '#666', fontSize: 11 }}>Giao dịch</div>
              <div style={{ color: '#fff', fontSize: 18, fontWeight: 700 }}>{stats?.totalTransactions}</div>
            </div>
          </div>
        </div>

        {/* Trạng thái Đối tác */}
        <div className="card cardPad">
          <h3 style={{ color: '#8B7355', margin: '0 0 15px 0', fontSize: 16 }}>🛡️ Tình trạng Đối tác</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {Object.entries(stats?.merchantsByStatus || {}).length > 0 ? (
               Object.entries(stats?.merchantsByStatus || {}).map(([status, count]: any) => (
                 <div key={status} style={{ flex: 1, minWidth: '40%', background: '#151521', padding: 10, borderRadius: 8, border: '1px solid #222' }}>
                   <div style={{ color: '#555', fontSize: 10, fontWeight: 800 }}>{status}</div>
                   <div style={{ color: status === 'ACTIVE' ? '#00C853' : '#FF3B30', fontSize: 20, fontWeight: 900 }}>{count}</div>
                 </div>
               ))
            ) : (
                <div style={{ color: '#666', fontSize: 14, fontStyle: 'italic' }}>Chưa có dữ liệu trạng thái</div>
            )}
          </div>
        </div>

      </div>

      {/* 3. NÚT LÀM MỚI NHANH */}
      <div style={{ textAlign: 'right' }}>
        <button className="btn btnGhost" onClick={loadDashboard} style={{ fontSize: 12 }}>
          Cập nhật dữ liệu lúc: {new Date().toLocaleTimeString()} 🔄
        </button>
      </div>

    </div>
  );
}