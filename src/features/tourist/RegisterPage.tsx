import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { registerUser, loginUser } from '../../api/services/auth'
import { useAppStore } from '../../shared/store/appStore'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const nav = useNavigate()
  const setUserToken = useAppStore((s) => s.setUserToken)
  const setUserRole = useAppStore((s) => s.setUserRole)
  const showToast = useAppStore((s) => s.showToast)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !phoneNumber || !password || !confirmPassword) {
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
      const res = await registerUser(email, phoneNumber, password)
      if (res.success) {
        // Auto login after register
        const loginRes = await loginUser(email, password)
        if (loginRes.success && loginRes.data?.token) {
          setUserToken(loginRes.data.token)
          setUserRole('USER')
          showToast({ title: 'Đăng ký thành công!' })
          nav('/tourist/start')
        } else {
          nav('/login')
        }
      } else {
        console.error('Đăng ký thất bại từ server:', res)
        setErrorMsg('Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.')
      }
    } catch (err: any) {
      console.error('Lỗi ngoại lệ khi đăng ký:', err)
      
      let msg = 'Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau.'
      if (err?.status === 400) {
        msg = 'Email hoặc số điện thoại có thể đã được sử dụng hoặc không hợp lệ.'
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
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#faf7f2] py-8 px-4 font-sans relative">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-128px] right-[-128px] w-[384px] h-[384px] rounded-full bg-orange-100/60" />
        <div className="absolute bottom-[-96px] left-[-96px] w-[288px] h-[288px] rounded-full bg-amber-100/70" />
      </div>

      <main className="w-full max-w-md mx-auto relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#FF5533] flex items-center justify-center text-white font-bold text-lg font-syne">FT</div>
          <div>
            <p className="font-bold text-base text-[#222] leading-tight font-syne">FoodTour</p>
            <p className="text-[11px] text-[#bbb] tracking-widest uppercase font-syne">Admin & Partner</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl px-8 py-10 sm:px-10 sm:py-12 border border-gray-100">
          <h2 className="text-2xl font-extrabold text-center mb-2 text-[#222] font-syne">Tạo tài khoản</h2>
          <p className="text-center text-[13px] text-[#bbb] mb-7">Khám phá ẩm thực cùng FoodTour!</p>

          {errorMsg && (
            <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-600 rounded-lg px-4 py-2.5 mb-4 text-sm font-medium">
              <span className="mt-0.5">⚠</span>
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleRegister} className="flex flex-col gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#555] mb-1">Email</label>
              <input
                type="email"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                placeholder="example@mail.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#555] mb-1">Số điện thoại</label>
              <input
                type="number"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                placeholder="0123456789"
                value={phoneNumber}
                onChange={e => setPhoneNumber(e.target.value)}
                autoComplete="tel"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#555] mb-1">Mật khẩu</label>
              <input
                type="password"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                placeholder="Tối thiểu 6 ký tự"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[#555] mb-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-base text-gray-800 outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition"
                placeholder="Nhập lại mật khẩu"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>

            <button
              type="submit"
              className="mt-2 h-11 rounded-xl bg-[#FF5533] hover:bg-orange-500 text-white font-bold text-base shadow transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                  Đang xử lý...
                </span>
              ) : 'Đăng ký'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-[#faf7f2] text-center text-[13px]">
            <span className="text-[#bbb]">Đã có tài khoản? </span>
            <Link to="/login" className="text-[#FF5533] font-medium underline">Đăng nhập ngay</Link>
          </div>
        </div>

        <p className="text-center text-xs text-[#bbb] mt-8">© 2025 FoodTour · Khám phá ẩm thực Việt</p>
      </main>
    </div>
  )
}
