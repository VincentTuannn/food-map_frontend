import { useCallback, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMerchantPois, getMerchantProfile, getMerchantPromotions, type MerchantProfile } from '../../api/services/merchant'
import { useAppStore } from '../../shared/store/appStore'
import type { Poi, Promotion } from './merchantTypes'
import { SECTIONS } from './merchantConstants'
import { Toast } from './components/Toast'
import { OverviewSection } from './sections/OverviewSection'
import { PoisSection } from './sections/PoisSection'
import { ContentSection } from './sections/ContentSection'
import { PromotionsSection } from './sections/PromotionsSection'
import { AnalyticsSection } from './sections/AnalyticsSection'
import { FinanceSection } from './sections/FinanceSection'
import { ProfileSection } from './sections/ProfileSection'
import './merchantStyle.css'

export function MerchantDashboard() {
  const navigate = useNavigate()
  const setUserToken = useAppStore((s) => s.setUserToken)
  const setUserRole = useAppStore((s) => s.setUserRole)
  const [section, setSection] = useState('overview')
  const [profile, setProfile] = useState<MerchantProfile | null>(null)
  const [pois, setPois] = useState<Poi[]>([])
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  const toast = useCallback((m: string) => setToastMsg(m), [])
  const handleLogout = useCallback(() => {
    setUserToken(undefined)
    setUserRole(undefined)
    navigate('/merchant/login')
  }, [navigate, setUserRole, setUserToken])

  useEffect(() => {
    getMerchantProfile().then((d) => setProfile(d as MerchantProfile)).catch(() => { })
    getMerchantPois().then((d) => setPois(d as Poi[])).catch(() => { })
    getMerchantPromotions().then((d) => setPromotions(d as Promotion[])).catch(() => { })
  }, [])

  const pageTitles: Record<string, string> = {
    overview: 'Tổng quan',
    pois: 'Quản lý địa điểm (POI)',
    content: 'Nội dung & TTS',
    promotions: 'Khuyến mãi',
    analytics: 'Phân tích & Báo cáo',
    finance: 'Tài chính & Gói dịch vụ',
    profile: 'Hồ sơ merchant',
  }

  const mobileSections = SECTIONS.slice(0, 5)

  return (
    <>
      <div className="md-root">
        <aside className="md-sidebar">
          <div className="md-logo">
            <div className="md-logo-eyebrow">Food Tour HCM</div>
            <div className="md-logo-name">{profile?.business_name ?? 'Merchant Portal'}</div>
          </div>
          <nav className="md-nav">
            <div className="md-nav-section">Chính</div>
            {SECTIONS.map((s) => (
              <button key={s.id} className={`md-nav-item${section === s.id ? ' active' : ''}`} onClick={() => setSection(s.id)}>
                <span className="md-nav-icon">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>
          <div className="md-sidebar-footer">
            <div className="md-sub-badge"><div className="md-sub-dot" />{profile?.subscription_status ?? 'ACTIVE'}</div>
          </div>
        </aside>

        <main className="md-main">
          <div className="md-topbar">
            <div className="md-page-title">{pageTitles[section]}</div>
            <div className="md-topbar-actions">
              <button className="btn-secondary" style={{ fontSize: 12 }} onClick={() => setSection('profile')}>
                {profile?.business_name?.slice(0, 12) ?? 'Hồ sơ'} ▾
              </button>
            </div>
          </div>

          <div className="md-content">
            {section === 'overview' && <OverviewSection pois={pois} promotions={promotions} />}
            {section === 'pois' && <PoisSection pois={pois} setPois={setPois} toast={toast} />}
            {section === 'content' && <ContentSection pois={pois} toast={toast} />}
            {section === 'promotions' && (
              <PromotionsSection pois={pois} promotions={promotions} setPromotions={setPromotions} toast={toast} />
            )}
            {section === 'analytics' && <AnalyticsSection />}
            {section === 'finance' && <FinanceSection profile={profile} />}
            {section === 'profile' && (
              <ProfileSection profile={profile} setProfile={setProfile} toast={toast} onLogout={handleLogout} />
            )}
          </div>
        </main>

        <div className="md-mobile-bar">
          {mobileSections.map((s) => (
            <button key={s.id} className={`md-mobile-tab${section === s.id ? ' active' : ''}`} onClick={() => setSection(s.id)}>
              <span className="md-mobile-tab-icon">{s.icon}</span>
              {s.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>

      {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg(null)} />}
    </>
  )
}

export default MerchantDashboard
