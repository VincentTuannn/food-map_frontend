import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser, loginUser } from '../../api/services/auth'
import { useAppStore } from '../../shared/store/appStore'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const nav = useNavigate()
  const setUserToken = useAppStore((s) => s.setUserToken)
  const showToast = useAppStore((s) => s.showToast)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password || !confirmPassword) {
      setErrorMsg('Vui lòng điền đủ thông tin')
      return
    }
    if (password !== confirmPassword) {
      setErrorMsg('Mật khẩu nhập lại không khớp!')
      return
    }
    if (password.length < 6) {
      setErrorMsg('Mật khẩu tối thiểu 6 ký tự')
      return
    }

    setErrorMsg('')
    setLoading(true)
    try {
      const res = await registerUser(email, password)
      if (res.success) {
        // Auto login after register
        const loginRes = await loginUser(email, password)
        if (loginRes.success && loginRes.data?.token) {
           setUserToken(loginRes.data.token)
           showToast({ title: 'Đăng ký thành công!' })
           nav('/tourist/start')
        } else {
           nav('/login')
        }
      } else {
        setErrorMsg('Đăng ký thất bại: ' + JSON.stringify(res))
      }
    } catch (err: any) {
      // Typically 400 Bad Request if email exists
      if (err.status === 400) {
        setErrorMsg('Email có thể đã được sử dụng hoặc không hợp lệ.')
      } else {
        setErrorMsg(err.message || 'Lỗi kết nối đến máy chủ')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="layout">
      <main className="main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', padding: 16 }}>
        <div className="card cardPad">
          <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: 24, fontWeight: 800 }}>Tạo Tài Khoản</h2>
          
          {errorMsg && (
            <div style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4f', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Xác Nhận Mật Khẩu</div>
              <input 
                type="password" 
                className="input" 
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btnPrimary" disabled={loading} style={{ height: 44, marginTop: 10 }}>
              {loading ? 'Đang xử lý...' : 'Đăng Ký Khám Phá'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
            <span style={{ color: 'var(--muted)' }}>Đã có tài khoản? </span>
            <Link to="/login" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 600 }}>Đăng nhập ngay</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
