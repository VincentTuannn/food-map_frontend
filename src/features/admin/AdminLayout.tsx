
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import './adminStyle.css';

// Định nghĩa 10 Module chuẩn theo Backend
const MENU_ITEMS = [
  { path: 'dashboard', label: 'Tổng quan', icon: '📊' },
  { path: 'users', label: 'Khách du lịch', icon: '👤' },
  { path: 'merchants', label: 'Đối tác', icon: '🏪' },
  { path: 'accounts', label: 'Quản trị viên', icon: '👑' },
  { path: 'pois', label: 'Duyệt địa điểm', icon: '📍' },
  { path: 'reviews', label: 'Đánh giá', icon: '⭐' },
  { path: 'tours', label: 'Tuyến đường', icon: '🗺️' },
  { path: 'promotions', label: 'Khuyến mãi', icon: '🎁' },
  { path: 'transactions', label: 'Dòng tiền', icon: '💰' },
  { path: 'tracking', label: 'Nhật ký', icon: '🛡️' },
];

export function AdminLayout() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Đóng sidebar khi đổi route (mobile UX)
  useEffect(() => { setSidebarOpen(false); }, [window.location.pathname]);

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      localStorage.removeItem('userToken');
      localStorage.removeItem('userRole');
      navigate('/login');
      window.location.reload();
    }
  };

  return (
    <div className="admin-root">
      {/* SIDEBAR TOGGLE BUTTON (mobile) */}
      <button
        className="admin-sidebar-toggle"
        aria-label="Mở menu"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="admin-sidebar-toggle-icon">☰</span>
      </button>

      {/* SIDEBAR */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="admin-logo">VĨNH KHÁNH ADMIN</div>
        <nav className="admin-nav">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={`/admin/${item.path}`}
              className={({ isActive }) =>
                'admin-nav-item' + (isActive ? ' active' : '')
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="admin-nav-icon">{item.icon}</span>
              <span className="admin-nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="admin-logout-wrap">
          <button className="admin-logout" onClick={handleLogout}>
            🚪 Đăng xuất
          </button>
        </div>
        {/* Nút đóng sidebar trên mobile */}
        <button
          className="admin-sidebar-close"
          aria-label="Đóng menu"
          onClick={() => setSidebarOpen(false)}
        >
          ×
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}