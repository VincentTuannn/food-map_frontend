import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerMerchant } from '../../api/services/auth'
import { loginUser } from '../../api/services/auth'
import { useAppStore } from '../../shared/store/appStore'

export function MerchantRegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [businessName, setBusinessName] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const nav = useNavigate()
  const setUserToken = useAppStore((s) => s.setUserToken)
  const setUserRole = useAppStore((s) => s.setUserRole)
  const showToast = useAppStore((s) => s.showToast)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !businessName || !password || !confirmPassword) {
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
      const res = await registerMerchant(email, businessName, password)
      if (res.success) {
        // Auto login after register
        const loginRes = await loginUser(email, password)
        if (loginRes.success && loginRes.data?.token) {
          setUserToken(loginRes.data.token)
          setUserRole('MERCHANT')
          showToast({ title: 'Đăng ký đối tác thành công!' })
          nav('/merchant')
        } else {
          nav('/merchant/login')
        }
      } else {
        console.error('Đăng ký merchant thất bại từ server:', res)
        setErrorMsg('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
      }
    } catch (err: any) {
      console.error('Lỗi ngoại lệ khi đăng ký merchant:', err)
      
      let msg = 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.'
      if (err?.status === 400) {
        msg = 'Email có thể đã được sử dụng hoặc dữ liệu không hợp lệ.'
      }
      
      // Override with direct validation msg if present
      if (err?.details?.details?.[0]?.msg) {
        msg = err.details.details[0].msg
      } else if (err?.details?.error) {
        msg = err.details.error
      }
      
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="layout">
      <main className="main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', padding: 16 }}>
        <div className="card cardPad" style={{ borderTop: '4px solid #10b981', maxWidth: 400, margin: '0 auto', width: '100%' }}>
          <h2 style={{ textAlign: 'center', marginBottom: 8, fontSize: 24, fontWeight: 800 }}>Tạo Tài Khoản Đối Tác</h2>
          <p style={{ textAlign: 'center', color: 'var(--muted)', marginBottom: 24, fontSize: 14 }}>Nhập thông tin quán của bạn</p>

          {errorMsg && (
            <div style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4f', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Tên cửa hàng/quán ăn</div>
              <input
                type="text"
                className="input"
                placeholder="Ví dụ: Phở Bát Đàn"
                value={businessName}
                onChange={e => setBusinessName(e.target.value)}
              />
            </div>

            <div>
              <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Email định danh</div>
              <input
                type="email"
                className="input"
                placeholder="Ví dụ: merchant@example.com"
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

            <button type="submit" className="btn btnPrimary" disabled={loading} style={{ height: 44, marginTop: 10, background: '#10b981' }}>
              {loading ? 'Đang xử lý...' : 'Đăng Ký Đối Tác'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
            <span style={{ color: 'var(--muted)' }}>Đã có tài khoản? </span>
            <Link to="/merchant/login" style={{ color: '#10b981', textDecoration: 'none', fontWeight: 600 }}>Đăng nhập ngay</Link>
          </div>
        </div>
      </main>
    </div>
  )
}
