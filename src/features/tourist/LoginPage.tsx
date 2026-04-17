// import { useState } from 'react'
// import { useNavigate, Link } from 'react-router-dom'
// import { useAppStore } from '../../shared/store/appStore'
// import { loginUser } from '../../api/services/auth'

// export function LoginPage() {
//   const [email, setEmail] = useState('')
//   const [password, setPassword] = useState('')
//   const [loading, setLoading] = useState(false)
//   const [errorMsg, setErrorMsg] = useState('')

//   const nav = useNavigate()
//   const setUserToken = useAppStore((s) => s.setUserToken)
//   const setUserRole = useAppStore((s) => s.setUserRole)
//   const showToast = useAppStore((s) => s.showToast)

//   const normalizeRole = (role?: string) => {
//     const upper = role?.toUpperCase()
//     if (upper === 'ADMIN') return 'ADMIN'
//     if (upper === 'MERCHANT') return 'MERCHANT'
//     return 'USER'
//   }

//   const resolveHome = (role?: string) => {
//     const normalized = normalizeRole(role)
//     if (normalized === 'MERCHANT') return '/merchant'
//     if (normalized === 'ADMIN') return '/admin'
//     return '/tourist/start'
//   }

//   const handleLogin = async (e: React.FormEvent) => {
//     e.preventDefault()
//     if (!email || !password) {
//       setErrorMsg('Vui lòng nhập email và mật khẩu')
//       return
//     }

//     setErrorMsg('')
//     setLoading(true)
//     try {
//       const res: any = await loginUser(email, password);
//       if (res.success && res.data?.token) {
//         // Lấy role ưu tiên merchant, sau đó đến role trả về
//         const roleFromUser = res.data.user?.role;
//         const role = res.data.role ?? roleFromUser;
//         const normalizedRole = res.data.merchant ? 'MERCHANT' : normalizeRole(role);
//         const token = res.data.token;

//         // Lưu vào localStorage và store
//         localStorage.setItem('userToken', token);
//         localStorage.setItem('userRole', normalizedRole);
//         setUserToken(token);
//         setUserRole(normalizedRole);

//         showToast({ title: 'Đăng nhập thành công!' });
//         nav(resolveHome(normalizedRole));
//       } else {
//         setErrorMsg('Đăng nhập thất bại: ' + (res.message || 'Không có token'));
//       }
//     } catch (error) {
//       setErrorMsg('Lỗi đăng nhập: ' + (error instanceof Error ? error.message : 'Vui lòng thử lại'));
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="layout">
//       <main className="main" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', justifyContent: 'center', padding: 16 }}>
//         <div className="card cardPad">
//           <h2 style={{ textAlign: 'center', marginBottom: 24, fontSize: 24, fontWeight: 800 }}>Đăng Nhập</h2>

//           {errorMsg && (
//             <div style={{ background: 'rgba(255, 0, 0, 0.1)', color: '#ff4d4f', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
//               {errorMsg}
//             </div>
//           )}

//           <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
//             <div>
//               <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Email</div>
//               <input
//                 type="email"
//                 className="input"
//                 placeholder="Ví dụ: example@mail.com"
//                 value={email}
//                 onChange={e => setEmail(e.target.value)}
//               />
//             </div>

//             <div>
//               <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 13 }}>Mật Khẩu</div>
//               <input
//                 type="password"
//                 className="input"
//                 placeholder="********"
//                 value={password}
//                 onChange={e => setPassword(e.target.value)}
//               />
//             </div>

//             <button type="submit" className="btn btnPrimary" disabled={loading} style={{ height: 44, marginTop: 10 }}>
//               {loading ? 'Đang xử lý...' : 'Đăng Nhập'}
//             </button>
//           </form>

//           <div style={{ textAlign: 'center', marginTop: 24, fontSize: 14 }}>
//             <span style={{ color: 'var(--muted)' }}>Chưa có tài khoản? </span>
//             <Link to="/register" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 600 }}>Tạo tài khoản</Link>
//           </div>
//         </div>
//       </main>
//     </div>
//   )
// }




import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppStore } from '../../shared/store/appStore'
import { loginUser } from '../../api/services/auth'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showPw, setShowPw] = useState(false)

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

  const resolveHome = (role?: string) => {
    const normalized = normalizeRole(role)
    if (normalized === 'MERCHANT') return '/merchant'
    if (normalized === 'ADMIN') return '/admin'
    return '/tourist/start'
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
      const res: any = await loginUser(email, password)
      if (res.success && res.data?.token) {
        const roleFromUser = res.data.user?.role
        const role = res.data.role ?? roleFromUser
        const normalizedRole = res.data.merchant ? 'MERCHANT' : normalizeRole(role)
        const token = res.data.token

        localStorage.setItem('userToken', token)
        localStorage.setItem('userRole', normalizedRole)
        setUserToken(token)
        setUserRole(normalizedRole)

        showToast({ title: 'Đăng nhập thành công!' })
        nav(resolveHome(normalizedRole))
      } else {
        setErrorMsg('Đăng nhập thất bại: ' + (res.message || 'Không có token'))
      }
    } catch (error) {
      setErrorMsg('Lỗi đăng nhập: ' + (error instanceof Error ? error.message : 'Vui lòng thử lại'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#faf7f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'DM Sans, sans-serif' }}>

      {/* Background decoration */}
      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -128, right: -128, width: 384, height: 384, borderRadius: '50%', background: 'rgba(255,165,0,0.15)' }} />
        <div style={{ position: 'absolute', bottom: -96, left: -96, width: 288, height: 288, borderRadius: '50%', background: 'rgba(255,193,7,0.18)' }} />
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FF5533', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 15, fontFamily: 'Syne, sans-serif' }}>FT</div>
          <div>
            <p style={{ fontWeight: 'bold', fontSize: 16, color: '#222', lineHeight: 1.1, fontFamily: 'Syne, sans-serif' }}>FoodTour</p>
            <p style={{ fontSize: 11, color: '#bbb', letterSpacing: 2, textTransform: 'uppercase' }}>Admin & Partner</p>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #f3f3f3', boxShadow: '0 2px 8px 0 #0001', padding: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 4, fontFamily: 'Syne, sans-serif' }}>Đăng nhập</h1>
          <p style={{ fontSize: 13, color: '#bbb', marginBottom: 28 }}>Chào mừng bạn quay lại!</p>

          {/* Error */}
          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fff0f0', border: '1px solid #ffd6d6', color: '#e53935', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
              <span style={{ marginTop: 2, flexShrink: 0 }}>⚠</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>Email</label>
              <input
                type="email"
                placeholder="example@mail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', border: '1px solid #eee', borderRadius: 12, padding: '10px 16px', fontSize: 14, color: '#333', outline: 'none', marginBottom: 0 }}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ width: '100%', border: '1px solid #eee', borderRadius: 12, padding: '10px 16px', fontSize: 14, color: '#333', outline: 'none', marginBottom: 0, paddingRight: 44 }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: '#bbb', background: 'none', border: 'none', fontSize: 13, cursor: 'pointer' }}
                >
                  {showPw ? '🙈' : '👁'}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{ marginTop: 8, width: '100%', background: '#FF5533', color: '#fff', fontWeight: 500, fontSize: 14, padding: '12px 0', borderRadius: 12, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, transition: 'background 0.2s' }}
            >
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span style={{ width: 16, height: 16, border: '2px solid #fff3', borderTop: '2px solid #fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 1s linear infinite' }} />
                  Đang xử lý...
                </span>
              ) : 'Đăng nhập'}
            </button>
          </form>

          {/* Footer links */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #faf7f2', textAlign: 'center', fontSize: 13 }}>
            <div>
              <span style={{ color: '#bbb' }}>Chưa có tài khoản? </span>
              <Link to="/register" style={{ color: '#FF5533', fontWeight: 500, textDecoration: 'underline' }}>Tạo tài khoản</Link>
            </div>
            <div style={{ marginTop: 8 }}>
              <span style={{ color: '#bbb' }}>Là đối tác quán ăn? </span>
              <Link to="/merchant/register" style={{ color: '#FF5533', fontWeight: 500, textDecoration: 'underline' }}>Đăng ký Merchant</Link>
            </div>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 24 }}>
          © 2025 FoodTour · Khám phá ẩm thực Việt
        </p>
      </div>
    </div>
  )
}