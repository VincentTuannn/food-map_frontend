import { useEffect, useState } from 'react'
import { updateMerchantProfile, type MerchantProfile } from '../../../api/services/merchant'
import { StatusBadge } from '../components/StatusBadge'

export function ProfileSection({
  profile,
  setProfile,
  toast,
  onLogout,
}: {
  profile: MerchantProfile | null
  setProfile: (p: MerchantProfile) => void
  toast: (m: string) => void
  onLogout: () => void
}) {
  const [form, setForm] = useState({ business_name: profile?.business_name ?? '', email: profile?.email ?? '' })
  const [saving, setSaving] = useState(false)
  const [changePw, setChangePw] = useState(false)

  useEffect(() => { if (profile) setForm({ business_name: profile.business_name ?? '', email: profile.email ?? '' }) }, [profile])

  const save = async () => {
    setSaving(true)
    try {
      const updated = await updateMerchantProfile(form)
      setProfile(updated as MerchantProfile)
      toast('Đã cập nhật hồ sơ')
    } catch {
      toast('Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const initials = (form.business_name || 'M').split(' ').slice(0, 2).map((w) => w[0]?.toUpperCase()).join('')

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Profile Card */}
      <div className="rounded-2xl bg-white/5 border border-[#f3f3f3] shadow p-7 flex flex-col gap-4">
        <div className="flex gap-4 items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-800 to-amber-900 grid place-items-center font-playfair text-2xl text-[#FFF9F0] font-bold flex-shrink-0">{initials}</div>
          <div>
            <div className="font-playfair text-lg font-semibold text-white">{form.business_name || 'Tên quán ăn'}</div>
            <div className="text-xs text-[#bbb] mt-1">{form.email}</div>
            <StatusBadge status={profile?.subscription_status ?? 'ACTIVE'} />
          </div>
        </div>
        <div className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-2">Thông tin cơ bản</div>
        <form className="flex flex-col gap-4 mt-2">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#8B7355]">Tên thương hiệu / Quán ăn</label>
            <input className="rounded-lg border border-[#E8D9C5] px-4 py-2 bg-white/80 text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-amber-400" value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#8B7355]">Email đăng nhập</label>
            <input className="rounded-lg border border-[#E8D9C5] px-4 py-2 bg-white/80 text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-amber-400" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} type="email" />
          </div>
          <div className="flex gap-2 mt-2">
            <button type="button" className="rounded-full bg-amber-500 text-white font-bold px-6 py-2 hover:bg-amber-600 transition" onClick={save} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
          </div>
        </form>
      </div>

      {/* Security & Account Card */}
      <div className="rounded-2xl bg-white/5 border border-[#f3f3f3] shadow p-7 flex flex-col gap-4">
        <div className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-2">Bảo mật</div>
        <div className="font-playfair text-lg font-semibold text-white mb-1">Đổi mật khẩu</div>
        <div className="text-sm text-[#bbb] mb-4">Sử dụng mật khẩu mạnh ít nhất 8 ký tự.</div>
        {changePw ? (
          <form className="flex flex-col gap-3">
            {['Mật khẩu hiện tại', 'Mật khẩu mới', 'Xác nhận mật khẩu mới'].map((l) => (
              <div className="flex flex-col gap-1" key={l}>
                <label className="text-xs font-semibold text-[#8B7355]">{l}</label>
                <input className="rounded-lg border border-[#E8D9C5] px-4 py-2 bg-white/80 text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-amber-400" type="password" />
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <button type="button" className="rounded-full bg-amber-500 text-white font-bold px-6 py-2 hover:bg-amber-600 transition">Đổi mật khẩu</button>
              <button type="button" className="rounded-full bg-white text-[#8B7355] border border-[#E8D9C5] px-6 py-2 hover:bg-[#F5EDE0] transition" onClick={() => setChangePw(false)}>Huỷ</button>
            </div>
          </form>
        ) : (
          <button className="rounded-full bg-white text-[#8B7355] border border-[#E8D9C5] px-6 py-2 hover:bg-[#F5EDE0] transition" onClick={() => setChangePw(true)}>🔒 Thay đổi mật khẩu</button>
        )}
        <div className="my-6 h-px bg-[#E8D9C5]" />
        <div className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-2">Tài khoản</div>
        <div className="text-sm text-[#bbb] mb-4">ID: <code className="text-xs bg-[#f5f5f5] px-2 py-1 rounded">{profile?.id ?? '—'}</code></div>
        <button className="rounded-full bg-red-500 text-white font-bold px-6 py-2 hover:bg-red-600 transition" onClick={onLogout}>Đăng xuất</button>
      </div>
    </div>
  )
}
