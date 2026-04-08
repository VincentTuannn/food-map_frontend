import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppStore } from '../../shared/store/appStore'
import { loginUser } from '../../api/services/auth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const nav = useNavigate()
  const setUserToken = useAppStore((s) => s.setUserToken)
  const showToast = useAppStore((s) => s.showToast)

  const handleLogin = async (e: React.FormEvent) => {
    //Kiểm tra xem method chạy chưa
    console.log('Attempting login with:', { email, password: password ? '***' : '' })
    e.preventDefault()
    if (!email || !password) {
      setErrorMsg('Vui lòng nhập email và mật khẩu')
      return
    }

    setErrorMsg('')
    setLoading(true)
    try {
      const res = await loginUser(email, password)
      console.log('Login response:', res) 
      if (res.success && res.data?.token) {
        setUserToken(res.data.token)
        showToast({ title: 'Đăng nhập thành công!' })
        nav('/tourist/start') // Or map
      } else {
        setErrorMsg('Đăng nhập thất bại: ' + JSON.stringify(res))
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Lỗi kết nối đến máy chủ')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="layout">
      <main className="main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', padding: 16 }}>
        <div className="card cardPad">
          <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: 24, fontWeight: 800 }}>Đăng Nhập</h2>
          
          {errorMsg && (
            <div style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4f', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Email</div>
              <input 
                type="email" 
                className="input" 
                placeholder="Ví dụ: example@mail.com"
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

            <button type="submit" className="btn btnPrimary" disabled={loading} style={{ height: 44, marginTop: 10 }}>
              {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
            <span style={{ color: 'var(--muted)' }}>Chưa có tài khoản? </span>
            <Link to="/register" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 600 }}>Tạo tài khoản</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
