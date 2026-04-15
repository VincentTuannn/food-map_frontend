// import { useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAppStore } from '../../shared/store/appStore'
// import { AppShell } from '../../shared/ui/AppShell'
// import { registerMerchant } from '../../api/services/merchant'

// export function MerchantRegisterPage() {
//   const [form, setForm] = useState({ email: '', password: '', name: '' })
//   const [loading, setLoading] = useState(false)
//   const showToast = useAppStore((s) => s.showToast)
//   const navigate = useNavigate()

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value })
//   }

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setLoading(true)
//     try {
//       await registerMerchant(form)
//       showToast({ title: 'Đăng ký thành công', message: 'Vui lòng thanh toán để kích hoạt tài khoản.' })
//       navigate('/merchant/login')
//     } catch (err: any) {
//       showToast({ title: 'Đăng ký thất bại', message: err?.message || 'Lỗi không xác định' })
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <AppShell>
//       <form className="card cardPad" onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '40px auto' }}>
//         <h2>Đăng ký Merchant</h2>
//         <input name="name" placeholder="Tên doanh nghiệp" value={form.name} onChange={handleChange} required />
//         <input name="email" type="email" placeholder="Email" value={form.email} onChange={handleChange} required />
//         <input name="password" type="password" placeholder="Mật khẩu" value={form.password} onChange={handleChange} required />
//         <button className="btn btnPrimary" type="submit" disabled={loading}>{loading ? 'Đang đăng ký...' : 'Đăng ký'}</button>
//       </form>
//     </AppShell>
//   )
// }




import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAppStore } from '../../shared/store/appStore'
import { registerMerchant } from '../../api/services/merchant'

export function MerchantRegisterPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showPw, setShowPw] = useState(false)

  const showToast = useAppStore((s) => s.showToast)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setErrorMsg('')
  }

  const validate = () => {
    if (!form.name.trim()) return 'Vui lòng nhập tên doanh nghiệp'
    if (!form.email.trim()) return 'Vui lòng nhập email'
    if (form.password.length < 6) return 'Mật khẩu tối thiểu 6 ký tự'
    if (form.password !== form.confirmPassword) return 'Mật khẩu xác nhận không khớp'
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const err = validate()
    if (err) { setErrorMsg(err); return }

    setLoading(true)
    try {
      // API nhận: { name, email, password }
      // Backend nên tạo tài khoản với subscription_status = 'INACTIVE'
      await registerMerchant({
        business_name: form.name,
        email: form.email,
        password: form.password,
      })
      showToast({
        title: 'Đăng ký thành công!',
        message: 'Vui lòng đăng nhập và kích hoạt tài khoản để bắt đầu.',
      })
      navigate('/login')
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Lỗi không xác định'
      setErrorMsg(msg)
    } finally {
      setLoading(false)
    }
  }

  const fields = [
    {
      name: 'name',
      label: 'Tên doanh nghiệp',
      type: 'text',
      placeholder: 'VD: Phở 10 Lý Quốc Sư',
      icon: '🏪',
    },
    {
      name: 'email',
      label: 'Email doanh nghiệp',
      type: 'email',
      placeholder: 'example@business.com',
      icon: '✉',
    },
  ]

  return (
    <div
      style={{ minHeight: '100vh', background: '#faf7f2', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16, fontFamily: 'DM Sans, sans-serif' }}
    >
      {/* Background decoration */}
      {/* Background decoration */}
      <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
        <div style={{ position: 'absolute', top: -128, left: -128, width: 384, height: 384, borderRadius: '50%', background: 'rgba(255,165,0,0.12)' }} />
        <div style={{ position: 'absolute', bottom: -96, right: -96, width: 288, height: 288, borderRadius: '50%', background: 'rgba(255,193,7,0.18)' }} />
      </div>

      <div style={{ position: 'relative', width: '100%', maxWidth: 440 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 32 }}>
          <div style={{ width: 40, height: 40, borderRadius: 12, background: '#FF5533', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: 15, fontFamily: 'Syne, sans-serif' }}>FT</div>
          <div>
            <p style={{ fontWeight: 'bold', fontSize: 16, color: '#222', lineHeight: 1.1, fontFamily: 'Syne, sans-serif' }}>FoodTour</p>
            <p style={{ fontSize: 11, color: '#bbb', letterSpacing: 2, textTransform: 'uppercase' }}>Đối tác quán ăn</p>
          </div>
        </div>

        {/* Card */}
        <div style={{ background: '#fff', borderRadius: 18, border: '1px solid #f3f3f3', boxShadow: '0 2px 8px 0 #0001', padding: 32 }}>
          <h1 style={{ fontSize: 22, fontWeight: 'bold', color: '#222', marginBottom: 4, fontFamily: 'Syne, sans-serif' }}>Đăng ký Merchant</h1>
          <p style={{ fontSize: 13, color: '#bbb', marginBottom: 24 }}>Đưa quán ăn của bạn lên bản đồ ẩm thực</p>

          {/* Info banner */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 12, padding: '12px 16px', marginBottom: 24 }}>
            <span style={{ fontSize: 18, flexShrink: 0, marginTop: 2 }}>ℹ</span>
            <div>
              <p style={{ fontSize: 13, fontWeight: 500, color: '#ad6800' }}>Lưu ý sau khi đăng ký</p>
              <p style={{ fontSize: 12.5, color: '#ad8b00', marginTop: 2 }}>Tài khoản cần được kích hoạt bằng gói đăng ký trả phí trước khi sử dụng.</p>
            </div>
          </div>

          {/* Error */}
          {errorMsg && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, background: '#fff0f0', border: '1px solid #ffd6d6', color: '#e53935', borderRadius: 12, padding: '12px 16px', marginBottom: 20, fontSize: 13 }}>
              <span style={{ marginTop: 2, flexShrink: 0 }}>⚠</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Text fields */}
            {fields.map((f) => (
              <div key={f.name}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>{f.label}</label>
                <div style={{ position: 'relative' }}>
                  <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>{f.icon}</span>
                  <input
                    name={f.name}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.name as keyof typeof form]}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', border: '1px solid #eee', borderRadius: 12, padding: '10px 16px 10px 38px', fontSize: 14, color: '#333', outline: 'none', marginBottom: 0 }}
                  />
                </div>
              </div>
            ))}

            {/* Password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>Mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔒</span>
                <input
                  name="password"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Tối thiểu 6 ký tự"
                  value={form.password}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', border: '1px solid #eee', borderRadius: 12, padding: '10px 16px 10px 38px', fontSize: 14, color: '#333', outline: 'none', marginBottom: 0, paddingRight: 44 }}
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

            {/* Confirm password */}
            <div>
              <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#555', marginBottom: 6 }}>Xác nhận mật khẩu</label>
              <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 15 }}>🔒</span>
                <input
                  name="confirmPassword"
                  type={showPw ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  required
                  style={{ width: '100%', border: '1px solid #eee', borderRadius: 12, padding: '10px 16px 10px 38px', fontSize: 14, color: '#333', outline: 'none', marginBottom: 0, borderColor: form.confirmPassword && form.confirmPassword !== form.password ? '#ffb3b3' : '#eee' }}
                />
              </div>
              {form.confirmPassword && form.confirmPassword !== form.password && (
                <p style={{ fontSize: 12, color: '#ff4d4f', marginTop: 4 }}>Mật khẩu không khớp</p>
              )}
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
                  Đang tạo tài khoản...
                </span>
              ) : 'Tạo tài khoản Merchant'}
            </button>
          </form>

          {/* Footer */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #faf7f2', textAlign: 'center', fontSize: 13 }}>
            <span style={{ color: '#bbb' }}>Đã có tài khoản? </span>
            <Link to="/login" style={{ color: '#FF5533', fontWeight: 500, textDecoration: 'underline' }}>
              Đăng nhập
            </Link>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: 12, color: '#bbb', marginTop: 24 }}>
          © 2025 FoodTour · Khám phá ẩm thực Việt
        </p>
      </div>
    </div>
  )
}