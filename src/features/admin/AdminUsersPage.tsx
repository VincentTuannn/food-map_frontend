import { useState } from 'react';
import { useAppStore } from '../../shared/store/appStore';

export function AdminUsersPage() {
  const showToast = useAppStore((s) => s.showToast);

  // [1] STATE: Quản lý Tab hiện tại (Khách du lịch / Đối tác Merchant)
  const [activeTab, setActiveTab] = useState<'users' | 'merchants'>('users');
  
  // [2] DATA STATE: Nơi sẽ chứa dữ liệu thật sau khi gọi API
  // Hiện tại để mảng rỗng để thiết kế trạng thái "Chưa có dữ liệu" (Empty State)
  const [users] = useState<any[]>([]);

  // Hàm helper render nút Tab chuyên nghiệp
  const TabButton = ({ id, label, count }: { id: 'users' | 'merchants'; label: string; count: number }) => {
    const isActive = activeTab === id;
    return (
      <button
        onClick={() => setActiveTab(id)}
        className="btn"
        style={{
          padding: '10px 20px',
          background: isActive ? 'rgba(124, 58, 237, 0.1)' : 'transparent',
          color: isActive ? 'var(--brand)' : 'var(--muted)',
          borderColor: isActive ? 'var(--brand)' : 'var(--border)',
          fontWeight: isActive ? 700 : 500,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}
      >
        {label}
        <span style={{ 
          background: isActive ? 'var(--brand)' : 'var(--panel)', 
          color: isActive ? '#fff' : 'var(--muted)',
          padding: '2px 8px', borderRadius: '12px', fontSize: '11px' 
        }}>
          {count}
        </span>
      </button>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, animation: 'fadeIn 0.3s' }}>
      
      {/* HEADER: Tiêu đề và Thanh chuyển Tab */}
      <div>
        <h2 style={{ fontSize: 24, fontWeight: 900, margin: '0 0 8px 0', color: 'var(--text)' }}>
          Quản trị thành viên
        </h2>
        <p style={{ color: 'var(--muted)', margin: '0 0 20px 0', fontSize: 14 }}>
          Quản lý tài khoản khách hàng và đối tác doanh nghiệp trên hệ thống.
        </p>

        <div className="row" style={{ borderBottom: '1px solid var(--border)', paddingBottom: 15, gap: 12 }}>
          <TabButton id="users" label="🧑‍💻 Khách du lịch" count={0} />
          <TabButton id="merchants" label="🏪 Đối tác Merchant" count={0} />
        </div>
      </div>

      {/* BODY: Danh sách bảng dữ liệu */}
      <div className="card cardPad" style={{ minHeight: 400 }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ color: 'var(--muted)', borderBottom: '1px solid var(--border)', textAlign: 'left' }}>
                <th style={{ padding: 12 }}>Tài khoản / Email</th>
                <th style={{ padding: 12 }}>{activeTab === 'users' ? 'Hạng thành viên' : 'Gói dịch vụ'}</th>
                <th style={{ padding: 12 }}>{activeTab === 'users' ? 'Điểm tích lũy' : 'Gian hàng'}</th>
                <th style={{ padding: 12 }}>Trạng thái</th>
                <th style={{ padding: 12, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {/* [3] EMPTY STATE: Hiển thị khi mảng dữ liệu trống */}
              {users.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: 80 }}>
                    <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                    <div style={{ color: 'var(--muted)', fontWeight: 500 }}>
                      Chưa có dữ liệu thành viên để hiển thị.
                    </div>
                    <button 
                      className="btn btnGhost" 
                      style={{ marginTop: 16, fontSize: 13 }}
                      onClick={() => showToast({ title: 'Đang kết nối API...' })}
                    >
                      🔄 Thử tải lại dữ liệu
                    </button>
                  </td>
                </tr>
              ) : (
                /* [4] VỊ TRÍ RENDER DATA: Sau này sẽ dùng users.map(...) tại đây */
                null
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}