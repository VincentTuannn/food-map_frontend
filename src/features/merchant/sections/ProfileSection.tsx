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
    <div className="md-grid-2 md-stagger">
      <div className="md-card">
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 22 }}>
          <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg,#92400E,#78350F)', display: 'grid', placeItems: 'center', fontFamily: "'Playfair Display',serif", fontSize: 22, color: '#FFF9F0', flexShrink: 0 }}>{initials}</div>
          <div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 18, fontWeight: 600 }}>{form.business_name || 'Tên quán ăn'}</div>
            <div style={{ fontSize: 12, color: 'var(--muted)', marginTop: 3 }}>{form.email}</div>
            <StatusBadge status={profile?.subscription_status ?? 'ACTIVE'} />
          </div>
        </div>

        <div className="md-card-label">Thông tin cơ bản</div>
        <div className="md-form" style={{ marginTop: 10 }}>
          <div className="md-field">
            <label className="md-label">Tên thương hiệu / Quán ăn</label>
            <input className="md-input" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} />
          </div>
          <div className="md-field">
            <label className="md-label">Email đăng nhập</label>
            <input className="md-input" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" />
          </div>
          <div className="md-row">
            <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu thay đổi'}</button>
          </div>
        </div>
      </div>

      <div className="md-card">
        <div className="md-card-label">Bảo mật</div>
        <div className="md-card-title" style={{ marginBottom: 6 }}>Đổi mật khẩu</div>
        <div className="md-card-sub" style={{ marginBottom: 18 }}>Sử dụng mật khẩu mạnh ít nhất 8 ký tự.</div>
        {changePw
          ? (
            <div className="md-form">
              {['Mật khẩu hiện tại', 'Mật khẩu mới', 'Xác nhận mật khẩu mới'].map((l) => (
                <div className="md-field" key={l}>
                  <label className="md-label">{l}</label>
                  <input className="md-input" type="password" />
                </div>
              ))}
              <div className="md-row">
                <button className="btn-primary">Đổi mật khẩu</button>
                <button className="btn-secondary" onClick={() => setChangePw(false)}>Huỷ</button>
              </div>
            </div>
          )
          : <button className="btn-secondary" onClick={() => setChangePw(true)}>🔒 Thay đổi mật khẩu</button>
        }
        <div className="md-divider" style={{ margin: '22px 0' }} />
        <div className="md-card-label">Tài khoản</div>
        <div className="md-card-sub" style={{ margin: '8px 0 14px' }}>ID: <code style={{ fontSize: 11, background: 'var(--smoke)', padding: '2px 6px', borderRadius: 4 }}>{profile?.id ?? '—'}</code></div>
        <button className="btn-danger" onClick={onLogout}>Đăng xuất</button>
      </div>
    </div>
  )
}
