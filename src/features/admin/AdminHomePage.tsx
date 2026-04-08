import { useState } from 'react';

export function AdminHomePage() {
  // [1] STATE: Khởi tạo giá trị mặc định cho các chỉ số
  const [stats] = useState({
    pendingPois: 0,
    trackingEvents: 0,
    revenue: 0,
    totalUsers: 0
  });

  // [2] HANDLER: Vị trí sẽ đặt logic gọi API đồng bộ dữ liệu sau này
  const fetchDashboardData = () => {
    console.log("Hành động: Làm mới Dashboard");
  };

  // UI Component con cho các thẻ số liệu
  const StatCard = ({ title, value, icon, color }: { title: string, value: string | number, icon: string, color: string }) => (
    <div className="card cardPad rowBetween" style={{ borderLeft: `4px solid ${color}`, cursor: 'default' }}>
      <div>
        <div style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', marginBottom: 8 }}>
          {title}
        </div>
        <div style={{ fontSize: 32, fontWeight: 900, color: 'var(--text)' }}>
          {value}
        </div>
      </div>
      <div style={{ fontSize: 36, opacity: 0.8 }}>
        {icon}
      </div>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s ease-in-out' }}>
      
      {/* HEADER: Tiêu đề và nút điều khiển */}
      <div className="rowBetween">
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, margin: 0, color: 'var(--text)' }}>
            Tổng quan vận hành
          </h2>
          <p style={{ color: 'var(--muted)', margin: '6px 0 0 0', fontSize: 14 }}>
            Giám sát trạng thái hệ thống Vĩnh Khánh Tour Guide theo thời gian thực.
          </p>
        </div>
        <button className="btn btnPrimary" onClick={fetchDashboardData}>
          🔄 Làm mới
        </button>
      </div>

      {/* GRID: Các thẻ số liệu thống kê nhanh */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
        <StatCard title="POI Chờ duyệt" value={stats.pendingPois} icon="📍" color="var(--danger)" />
        <StatCard title="Log Tracking" value={stats.trackingEvents} icon="📡" color="#3b82f6" /> 
        <StatCard title="Doanh thu tạm" value={`${stats.revenue.toLocaleString()} ₫`} icon="💰" color="var(--ok)" />
        <StatCard title="Tổng Users" value={stats.totalUsers} icon="👥" color="var(--brand)" />
      </div>

      {/* FOOTER: Khu vực hiển thị nhật ký hệ thống */}
      <div className="card cardPad">
        <h3 style={{ fontSize: 16, margin: '0 0 16px 0', color: 'var(--text)', fontWeight: 700 }}>
          Hoạt động hệ thống gần đây
        </h3>
        
        {/* [3] LOG CONSOLE: Hiển thị trạng thái chờ kết nối mặc định */}
        <div style={{ 
          height: 200, 
          background: 'var(--bg)', 
          border: '1px solid var(--border)',
          borderRadius: 8, 
          padding: 16,
          fontFamily: 'monospace',
          fontSize: 13,
          overflowY: 'auto'
        }}>
          <div style={{ color: 'var(--muted)' }}>
            Hệ thống đang sẵn sàng. Đang chờ kết nối dữ liệu API...
          </div>
        </div>
      </div>

    </div>
  );
}