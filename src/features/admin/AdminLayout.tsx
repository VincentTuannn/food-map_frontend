
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';


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
      navigate('/admin/login');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex bg-[var(--bg)] text-[var(--admin-main-text)] font-sora">
      {/* SIDEBAR TOGGLE BUTTON (mobile) */}
      {/* SIDEBAR TOGGLE BUTTON (mobile) */}
      <button
        className="fixed top-4 left-4 z-[120] hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-[var(--panel)] shadow-[var(--admin-sidebar-shadow)] border-none cursor-pointer"
        aria-label="Mở menu"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="text-[1.7rem] text-[var(--brand)]">☰</span>
      </button>

      {/* SIDEBAR */}
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-screen z-[110] flex flex-col bg-[var(--admin-sidebar-bg)] text-[var(--admin-sidebar-text)] shadow-[var(--admin-sidebar-shadow)] border-r border-[var(--admin-sidebar-border)] transition-all duration-300 ease-[cubic-bezier(.4,1,.4,1)] w-[210px] md:w-[64vw] md:max-w-[180px] md:transform ${sidebarOpen ? 'md:translate-x-0' : 'md:-translate-x-[120%]'}`}
      >
        <div className="px-5 pt-7 pb-4 text-[1.15rem] font-extrabold text-[var(--admin-sidebar-active)] tracking-wide border-b border-[var(--admin-sidebar-border)] text-left shadow-sm md:text-[13px] md:px-2 md:pt-3 md:pb-2 md:text-center md:shadow-none">
          VĨNH KHÁNH ADMIN
        </div>
        <nav className="flex-1 flex flex-col gap-2 pt-4 overflow-y-auto">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={`/admin/${item.path}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-[10px] text-[15px] font-semibold transition-colors duration-150 no-underline ${isActive ? 'bg-[var(--admin-sidebar-active)] text-white font-bold shadow-sm' : 'text-[var(--admin-sidebar-muted)] hover:bg-[var(--admin-sidebar-hover)] hover:text-white'} md:text-[13px] md:px-2 md:py-2 md:gap-2`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-[1.3rem] w-7 text-center md:text-[1.1rem] md:w-[22px]">{item.icon}</span>
              <span className="whitespace-nowrap overflow-hidden text-ellipsis md:text-[13px]">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-5 border-t border-[var(--admin-sidebar-border)]">
          <button
            className="w-full py-2 bg-[rgba(255,77,79,0.08)] text-[var(--danger)] border border-[rgba(255,77,79,0.18)] rounded-lg font-bold text-[15px] transition-colors duration-150 hover:bg-[rgba(255,77,79,0.18)] hover:text-white"
            onClick={handleLogout}
          >
            🚪 Đăng xuất
          </button>
        </div>
        {/* Nút đóng sidebar trên mobile */}
        <button
          className="hidden md:block absolute top-3.5 right-3.5 bg-none border-none text-[var(--brand)] text-2xl cursor-pointer z-[130]"
          aria-label="Đóng menu"
          onClick={() => setSidebarOpen(false)}
        >
          ×
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-h-screen ml-[210px] p-9 md:ml-0 md:p-4 transition-all duration-200 text-[var(--admin-main-text)]">
        <Outlet />
      </main>
    </div>
  );
}