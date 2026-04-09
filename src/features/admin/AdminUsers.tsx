import { useState, useEffect } from 'react';
import { adminApi } from '../../api/services/admin';
import { useAppStore } from '../../shared/store/appStore';

export function AdminUsers() {
  const showToast = useAppStore((s) => s.showToast);
  
  // States dữ liệu
  const [users, setUsers] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // States Chi tiết & Modal (Dùng isModalOpen)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  // States Bộ lọc
  const [filterPremium, setFilterPremium] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Tải danh sách Users
  const loadUsers = async () => {
    setIsFetching(true);
    try {
      // Backend dùng query role='user' để lấy khách du lịch
      const res = await adminApi.getUsers('user', searchQuery);
      setUsers(Array.isArray(res) ? res : res?.data || []);
    } catch (error) {
      showToast({ title: '❌ Lỗi tải danh sách người dùng' });
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => { loadUsers(); }, [searchQuery]);

  // 2. Cập nhật trạng thái/quyền lợi (PATCH /users/:id/status)
  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    setIsProcessing(true);
    try {
      const updateData = {
        role: selectedUser.role,
        is_premium: Boolean(selectedUser.is_premium),
        current_tier: selectedUser.current_tier
      };
      
      await adminApi.updateUser(selectedUser.id, updateData);
      showToast({ title: '✅ Cập nhật quyền lợi thành công!' });
      setIsModalOpen(false);
      loadUsers();
    } catch (error) {
      showToast({ title: '❌ Cập nhật thất bại' });
    } finally {
      setIsProcessing(false);
    }
  };

  // 3. Xóa người dùng (DELETE)
  const handleDeleteUser = async (id: string) => {
    if (!window.confirm('⚠️ Xóa vĩnh viễn người dùng này? Mọi đánh giá và voucher của họ cũng sẽ bị ảnh hưởng.')) return;
    try {
      await adminApi.deleteUser(id);
      setUsers(prev => prev.filter(u => u.id !== id));
      showToast({ title: '🗑️ Đã xóa người dùng thành công' });
    } catch (error) {
      showToast({ title: '❌ Lỗi khi xóa người dùng' });
    }
  };

  return (
    <div style={{ animation: 'fadeIn 0.3s' }}>
      {/* HEADER & FILTER */}
      <div className="card cardPad" style={{ marginBottom: 20 }}>
        <h2 style={{ margin: '0 0 20px 0', color: '#fff', fontSize: 24, fontWeight: 800 }}>👤 Khách du lịch</h2>
        <div style={{ display: 'flex', gap: 12 }}>
          <input 
            className="input" placeholder="Tìm theo Email hoặc SĐT..." 
            style={{ flex: 1 }}
            value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          />
          <select 
            className="select" style={{ width: 180 }} 
            value={filterPremium} onChange={e => setFilterPremium(e.target.value)}
          >
            <option value="">Tất cả hạng</option>
            <option value="true">★ Premium</option>
            <option value="false">⚪ Free User</option>
          </select>
          <button className="btn btnPrimary" onClick={loadUsers}>Tìm kiếm</button>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="card cardPad">
        <table style={{ width: '100%', borderCollapse: 'collapse', color: '#fff', textAlign: 'left' }}>
          <thead>
            <tr style={{ color: '#666', borderBottom: '1px solid #333' }}>
              <th style={{ padding: 12 }}>Người dùng</th>
              <th style={{ padding: 12 }}>Phân hạng</th>
              <th style={{ padding: 12 }}>Trạng thái</th>
              <th style={{ padding: 12, textAlign: 'right' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {isFetching ? (<tr><td colSpan={4} style={{ textAlign: 'center', padding: 40 }}>⏳ Đang tải...</td></tr>) : 
             users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid #222' }}>
                <td style={{ padding: 12 }}>
                  <div style={{ fontWeight: 700 }}>{u.email}</div>
                  <div style={{ fontSize: 12, color: '#555' }}>{u.phone || 'Chưa cập nhật SĐT'}</div>
                </td>
                <td style={{ padding: 12 }}>
                  <div style={{ fontSize: 13 }}>{u.current_tier || 'Standard'}</div>
                  <div style={{ fontSize: 11, color: u.is_premium ? '#FFD700' : '#444' }}>
                    {u.is_premium ? '★ Premium Member' : 'Thành viên thường'}
                  </div>
                </td>
                <td style={{ padding: 12 }}>
                  <span className="pill" style={{ background: '#2A2A3C', color: '#aaa', fontSize: 10 }}>{u.role.toUpperCase()}</span>
                </td>
                <td style={{ padding: 12, textAlign: 'right' }}>
                  <button className="btn btnGhost" style={{ fontSize: 12 }} onClick={() => { setSelectedUser(u); setIsModalOpen(true); }}>✏️ Quản lý</button>
                  <button className="btn" style={{ color: '#ff4d4f' }} onClick={() => handleDeleteUser(u.id)}>🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL CẬP NHẬT QUYỀN LỢI (isModalOpen) */}
      {isModalOpen && selectedUser && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.8)' }}>
          <div style={{ width: 450, background: '#1E1E2D', borderRadius: 12, border: '1px solid #444', overflow: 'hidden' }}>
            <div className="rowBetween" style={{ padding: '20px 24px', borderBottom: '1px solid #333' }}>
              <h3 style={{ margin: 0, color: '#fff' }}>Quản lý đặc quyền</h3>
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 20 }}>✕</button>
            </div>
            
            <form onSubmit={handleUpdateUser} style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ background: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, fontSize: 13, color: '#888' }}>
                Đang chỉnh sửa cho: <b>{selectedUser.email}</b>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Cấp bậc (Tier)</label>
                <input 
                  className="input" placeholder="Standard / VIP / Gold..."
                  value={selectedUser.current_tier || ''} 
                  onChange={e => setSelectedUser({...selectedUser, current_tier: e.target.value})}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontSize: 13, color: '#aaa' }}>Vai trò hệ thống</label>
                <select 
                  className="select" 
                  value={selectedUser.role} 
                  onChange={e => setSelectedUser({...selectedUser, role: e.target.value})}
                >
                  <option value="user">Khách du lịch (User)</option>
                  <option value="admin">Quản trị viên (Admin)</option>
                </select>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', padding: '10px 0' }}>
                <input 
                  type="checkbox" style={{ width: 18, height: 18 }}
                  checked={selectedUser.is_premium || false}
                  onChange={e => setSelectedUser({...selectedUser, is_premium: e.target.checked})}
                />
                <span style={{ color: '#fff', fontWeight: 600 }}>Kích hoạt gói Premium</span>
              </label>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <button type="button" className="btn" style={{ flex: 1 }} onClick={() => setIsModalOpen(false)}>Hủy</button>
                <button type="submit" className="btn btnPrimary" style={{ flex: 2 }} disabled={isProcessing}>
                  {isProcessing ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}