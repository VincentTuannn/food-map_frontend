import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppStore } from '../../shared/store/appStore'
import { loginUser } from '../../api/services/auth'

export function MerchantLoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const nav = useNavigate()
  const setUserToken = useAppStore((s) => s.setUserToken)
  const setUserRole = useAppStore((s) => s.setUserRole)
  const showToast = useAppStore((s) => s.showToast)

  const normalizeRole = (role?: string) => {
    const upper = role?.toUpperCase()
    if (upper === 'ADMIN') return 'ADMIN'
    if (upper === 'MERCHANT') return 'MERCHANT'
    return 'USER'
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập email và mật khẩu')
      return
    }

    setErrorMsg('')
    setLoading(true)
    try {
      const res: any = await loginUser(email, password);
      if (res.success && res.data?.token) {
        const roleFromUser = res.data.user?.role;
        const role = res.data.role ?? roleFromUser;
        const normalizedRole = res.data.merchant ? 'MERCHANT' : normalizeRole(role);
        
        if (normalizedRole !== 'MERCHANT') {
          setErrorMsg('Tài khoản này không phải là đối tác Merchant');
          return;
        }

        const token = res.data.token;
        localStorage.setItem('userToken', token);
        localStorage.setItem('userRole', normalizedRole);
        setUserToken(token);
        setUserRole(normalizedRole);

        showToast({ title: 'Đăng nhập đối tác thành công!' });
        nav('/merchant');
      } else {
        setErrorMsg('Đăng nhập thất bại: ' + (res.message || 'Không có token'));
      }
    } catch (error: any) {
      console.error('Lỗi ngoại lệ khi đăng nhập:', error)
      let msg = error instanceof Error ? error.message : 'Vui lòng thử lại';
      
      if (error?.details?.error) {
        msg = error.details.error;
      } else if (error?.details?.message) {
        msg = error.details.message;
      }
      
      if (error?.status === 401) {
        msg = 'Tài khoản không tồn tại hoặc sai mật khẩu';
      }
      
      setErrorMsg(msg);
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="layout">
      <main className="main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', padding: 16 }}>
        <div className="card cardPad" style={{ borderTop: '4px solid #10b981', maxWidth: 400, margin: '0 auto', width: '100%' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 8, fontSize: 24, fontWeight: 800 }}>Dành Cho Đối Tác</h2>
          <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 24, fontSize: 14 }}>Tham gia hệ thống Food Map để quản lý quán của bạn</p>
          
          {errorMsg && (
            <div style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4f', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Email đối tác</div>
              <input 
                type="email" 
                className="input" 
                placeholder="merchant@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Mật Khẩu</div>
              <input 
                type="password" 
                className="input" 
                placeholder="********"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btnPrimary" disabled={loading} style={{ height: 44, marginTop: 10, background: '#10b981' }}>
              {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
            <span style={{ color: 'var(--muted)' }}>Chưa cấu hình quán? </span>
            <Link to="/merchant/register" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>Tạo tài khoản Đối tác</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
