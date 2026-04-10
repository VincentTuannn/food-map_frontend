import { useState, useEffect } from 'react';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

export function AdminAccounts() {
  const showToast = useAppStore((s) => s.showToast);
  
  // States quản lý danh sách và trạng thái tải
  const [admins, setAdmins] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // States quản lý Modal (Đúng tên biến isModalOpen bạn yêu cầu)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAdmin, setNewAdmin] = useState({ email: '', password: '' });

  // 1. Hàm tải danh sách Admin từ hệ thống
  const loadAdmins = async () => {
    setIsFetching(true);
    try {
      const res = await adminApi.getUsers('admin');
      setAdmins(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      showToast({ title: '❌ Lỗi tải danh sách Quản trị viên' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { loadAdmins(); }, []);

  // 2. Xử lý Tạo Admin mới (POST /create-admin)
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Kiểm tra nhanh trước khi gửi
    if (!newAdmin.email || !newAdmin.password) {
      showToast({ title: '⚠️ Vui lòng điền đầy đủ thông tin' });
      return;
    }

    setIsProcessing(true);
    try {
      // Gọi API tạo Admin
      await adminApi.createAdmin(newAdmin);
      
      showToast({ title: '👑 Đã cấp quyền Admin thành công!' });
      setIsModalOpen(false); // Đóng modal
      setNewAdmin({ email: '', password: '' }); // Reset form
      loadAdmins(); // Tải lại danh sách để hiện người mới
    } catch (error: any) {
      // Hiển thị lỗi từ Backend (Ví dụ: Email đã tồn tại)
      const msg = error.response?.data?.error || error.message || 'Lỗi không xác định';
      showToast({ title: `❌ Thất bại: ${msg}` });
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Xử lý Thu hồi quyền (Xóa tài khoản Admin)
  const handleDelete = async (id: string) => {
    if (!window.confirm('⚠️ Bạn có chắc muốn thu hồi quyền Quản trị của tài khoản này?')) return;
    try {
      await adminApi.deleteUser(id);
      setAdmins(prev => prev.filter(a => a.id !== id));
      showToast({ title: '🗑️ Đã thu hồi quyền thành công' });
    } catch (error) {
      showToast({ title: '❌ Lỗi khi thực hiện xóa' });
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      {/* PHẦN TIÊU ĐỀ VÀ NÚT TẠO */}
      <div className="card cardPad" style={{ marginBottom: 20 }}>
        <div className="rowBetween">
          <div>
            <h2 style={{ margin: 0, color: '#8B7355', fontSize: 24, fontWeight: 800 }}>🛡️ Quyền lực đặc biệt</h2>
            <p style={{ color: '#888', marginTop: 5, fontSize: 14 }}>Tạo và quản lý các tài khoản Quản trị viên hệ thống.</p>
          </div>
          <button className="btn btnPrimary" onClick={() => setIsModalOpen(true)}>
            + Tạo Quản trị viên mới
          </button>
        </div>
      </div>

      {/* DANH SÁCH ADMIN */}
      <div className="card cardPad">
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#8B7355', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: '#666', borderBottom: '1px solid #333' }}>
              <th style={{ padding: '15px 10px' }}>STT</th>
              <th style={{ padding: '15px 10px' }}>Email Quản trị</th>
              <th style={{ padding: '15px 10px' }}>Ngày tham gia</th>
              <th style={{ padding: '15px 10px', textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: 40, color: '#888' }}>⏳ Đang tải danh sách Admin...</td></tr>
            ) : (
              admins.map((admin, index) => (
                <tr key={admin.id} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '15px 10px' }}>{index + 1}</td>
                  <td style={{ padding: '15px 10px', fontWeight: 700 }}>{admin.email}</td>
                  <td style={{ padding: '15px 10px', color: '#aaa' }}>
                    {new Date(admin.created_at || admin.createdAt).toLocaleDateString('vi-VN')}
                  </td>
                  <td style={{ padding: '15px 10px', textAlign: 'right' }}>
                    <button 
                      className="btn" 
                      style={{ color: '#ff4d4f', border: '1px solid rgba(255, 77, 79, 0.2)' }}
                      onClick={() => handleDelete(admin.id)}
                    >
                      Thu hồi
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL TẠO ADMIN (HIỆN GIỮA MÀN HÌNH) */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.85)' }}>
          <div style={{ width: 400, background: '#1E1E2D', borderRadius: 12, border: '1px solid #333', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
            <div className="rowBetween" style={{ padding: '20px 24px', borderBottom: '1px solid #333', background: '#252538' }}>
              <h3 style={{ margin: 0, color: '#fff', fontSize: 18 }}>👑 Cấp quyền Admin</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: 20 }}>✕</button>
            </div>
            
            <form onSubmit={handleCreate} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Email đăng nhập</label>
                <input 
                  required type="email" className="input" placeholder="nhan.admin@vinhkhanh.com"
                  value={newAdmin.email} onChange={e => setNewAdmin({...newAdmin, email: e.target.value})}
                  autoFocus
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Mật khẩu</label>
                <input 
                  required type="password" className="input" placeholder="••••••••"
                  value={newAdmin.password} onChange={e => setNewAdmin({...newAdmin, password: e.target.value})}
                />
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btnPrimary" style={{ flex: 2 }} disabled={isProcessing}>
                  {isProcessing ? 'Đang khởi tạo...' : 'Xác nhận cấp quyền'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}