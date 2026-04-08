import { NavLink, Outlet } from 'react-router-dom';

// [1] CẤU HÌNH MENU: Quản lý tập trung các mục điều hướng
const MENU_ITEMS = [
  { path: '/admin', label: '📊 Tổng quan', end: true },
  { path: '/admin/moderation', label: '📍 Duyệt địa điểm' },
  { path: '/admin/users', label: '👥 Users & Merchants' },
  { path: '/admin/config', label: '⚙️ Cấu hình hệ thống' },
  { path: '/admin/finance', label: '💰 Đối soát dòng tiền' },
];

export function AdminLayout() {
  // [2] STYLE DYNAMICS: Hàm xử lý class hoạt động cho NavLink
  const getNavClass = (isActive: boolean) => {
    return `btn ${isActive ? 'btnPrimary' : 'btnGhost'}`;
  };

  const navItemStyle = {
    width: '100%',
    textAlign: 'left' as const,
    justifyContent: 'flex-start',
    textDecoration: 'none',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    border: 'none',
    padding: '10px 16px',
    fontWeight: 600,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'var(--bg)', overflow: 'hidden' }}>
      
      {/* HEADER: Thanh điều hướng trên cùng */}
      <header className="rowBetween" style={{ 
        height: '64px', 
        background: 'var(--panel)', 
        borderBottom: '1px solid var(--border)',
        padding: '0 24px', 
        zIndex: 10
      }}>
        <div className="row" style={{ gap: 12 }}>
          <div style={{ fontSize: 20, fontWeight: 900, color: 'var(--brand)', letterSpacing: '0.5px' }}>
            Vĩnh Khánh Tour Guide
          </div>
          <span className="pill" style={{ background: 'var(--bg)', borderColor: 'var(--border)' }}>
            Admin Console
          </span>
        </div>
        
        {/* Vị trí dự phòng cho Avatar hoặc Nút Đăng xuất */}
        <div className="btn btnGhost" style={{ fontSize: 14 }}>🚪 Đăng xuất</div>
      </header>

      {/* THÂN TRANG: Chia Sidebar và Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        
        {/* SIDEBAR: Menu điều hướng bên trái */}
        <aside style={{ 
          width: '260px', 
          background: 'var(--panel)', 
          borderRight: '1px solid var(--border)',
          padding: '24px 16px', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: '6px'
        }}>
          <div style={{ color: 'var(--muted)', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: 12, paddingLeft: 8 }}>
            Menu Quản Trị
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {MENU_ITEMS.map((item) => (
              <NavLink 
                key={item.path}
                to={item.path} 
                end={item.end}
                className={({ isActive }) => getNavClass(isActive)} 
                style={navItemStyle}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          {/* Thông tin phiên bản ở cuối Sidebar */}
          <div style={{ marginTop: 'auto', padding: '16px 8px', fontSize: 12, color: 'var(--muted)', borderTop: '1px solid var(--border)' }}>
            v1.0.0-UI
          </div>
        </aside>

        {/* MAIN CONTENT: Vùng hiển thị các trang con thông qua Outlet */}
        <main style={{ flex: 1, padding: '32px', overflowY: 'auto', background: 'var(--bg)' }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}