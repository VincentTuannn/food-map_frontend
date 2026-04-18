
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
      navigate('/login');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-slate-900 via-slate-800 to-amber-100 text-gray-100 font-sora">
      {/* SIDEBAR TOGGLE BUTTON (mobile) */}
      {/* SIDEBAR TOGGLE BUTTON (mobile) */}
      <button
        className="fixed top-4 left-4 z-50 hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-white/10 shadow-lg border-none cursor-pointer"
        aria-label="Mở menu"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="text-2xl text-orange-500">☰</span>
      </button>

      {/* SIDEBAR */}
      {/* SIDEBAR */}
      <aside
        className={`fixed left-0 top-0 h-screen z-40 flex flex-col bg-slate-900 text-white shadow-2xl border-r border-slate-800 transition-all duration-300 ease-[cubic-bezier(.4,1,.4,1)] w-[210px] md:w-[64vw] md:max-w-[180px] md:transform ${sidebarOpen ? 'md:translate-x-0' : 'md:-translate-x-[120%]'}`}
      >
        <div className="px-5 pt-7 pb-4 text-lg font-extrabold text-orange-500 tracking-wide border-b border-slate-800 text-left shadow-sm md:text-[13px] md:px-2 md:pt-3 md:pb-2 md:text-center md:shadow-none">
          VĨNH KHÁNH ADMIN
        </div>
        <nav className="flex-1 flex flex-col gap-2 pt-4 overflow-y-auto">
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={`/admin/${item.path}`}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-[15px] font-semibold transition-colors duration-150 no-underline ${isActive ? 'bg-orange-500 text-white font-bold shadow' : 'text-gray-400 hover:bg-orange-400/20 hover:text-white'} md:text-[13px] md:px-2 md:py-2 md:gap-2`
              }
              onClick={() => setSidebarOpen(false)}
            >
              <span className="text-xl w-7 text-center md:text-base md:w-[22px]">{item.icon}</span>
              <span className="whitespace-nowrap overflow-hidden text-ellipsis md:text-[13px]">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-5 border-t border-slate-800">
          <button
            className="w-full py-2 bg-red-100 text-red-600 border border-red-200 rounded-lg font-bold text-[15px] transition-colors duration-150 hover:bg-red-500 hover:text-white"
            onClick={handleLogout}
          >
            🚪 Đăng xuất
          </button>
        </div>
        {/* Nút đóng sidebar trên mobile */}
        <button
          className="hidden md:block absolute top-3.5 right-3.5 bg-none border-none text-orange-500 text-2xl cursor-pointer z-50"
          aria-label="Đóng menu"
          onClick={() => setSidebarOpen(false)}
        >
          ×
        </button>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 min-h-screen ml-[210px] p-9 md:ml-0 md:p-4 transition-all duration-200 text-gray-100">
        <Outlet />
      </main>
    </div>
  );
}