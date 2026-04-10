import { Outlet, NavLink, useNavigate } from 'react-router-dom';

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
  // XÓA DÒNG CONST LOGOUT BỊ LỖI ĐI

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      // 1. Xóa dữ liệu đăng nhập
      localStorage.removeItem('userToken'); 
      localStorage.removeItem('userRole'); // Nếu bạn có lưu role
      
      // 2. Chuyển hướng
      navigate('/login');
      
      // 3. Reload nhẹ để reset lại toàn bộ state của app (tùy chọn)
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0D0D14', color: '#fff' }}>
      
      {/* SIDEBAR (Bên trái) */}
      <aside style={{
        width: 260,
        background: '#151521',
        borderRight: '1px solid #222',
        display: 'flex',
        flexDirection: 'column',
        position: 'fixed',
        height: '100vh'
      }}>
        <div style={{ padding: '25px 20px', fontSize: 18, fontWeight: 900, color: '#9D4EDD', borderBottom: '1px solid #222' }}>
          VĨNH KHÁNH ADMIN
        </div>

        <nav style={{ flex: 1, padding: '20px 12px', overflowY: 'auto' }}>
          {MENU_ITEMS.map((item) => (
            <NavLink
              key={item.path}
              to={`/admin/${item.path}`}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                marginBottom: 4,
                borderRadius: 8,
                textDecoration: 'none',
                fontSize: 14,
                transition: '0.2s',
                color: isActive ? '#fff' : '#A0A0B0',
                background: isActive ? '#7B2CBF' : 'transparent',
              })}
            >
              <span>{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: 20, borderTop: '1px solid #222' }}>
          <button 
            onClick={handleLogout}
            style={{
              width: '100%', padding: '10px', background: 'rgba(255, 77, 79, 0.1)',
              color: '#ff4d4f', border: '1px solid rgba(255, 77, 79, 0.2)',
              borderRadius: 8, cursor: 'pointer', fontWeight: 600
            }}
          >
            🚪 Đăng xuất
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT (Bên phải) */}
      <main style={{ flex: 1, marginLeft: 260, padding: '30px', minHeight: '100vh' }}>
        {/* Dòng này cực kỳ quan trọng: Đây là nơi 10 module sẽ hiển thị */}
        <Outlet />
      </main>

    </div>
  );
}