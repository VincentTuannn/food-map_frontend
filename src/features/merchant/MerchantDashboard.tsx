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

      <div className="flex min-h-screen bg-[#181820]">
        {/* Sidebar */}
        <aside className="hidden md:flex flex-col w-64 bg-[#23232e] border-r border-[#2a2a3c] py-6 px-0">
          <div className="flex flex-col items-center mb-8">
            <div className="uppercase text-[10px] tracking-[2.5px] text-[#f59e0b] mb-1 font-bold">Food Tour HCM</div>
            <div className="font-playfair text-lg text-[#FFF9F0] font-semibold">{profile?.business_name ?? 'Merchant Portal'}</div>
          </div>
          <nav className="flex-1 px-2">
            <div className="text-[10px] tracking-[2px] uppercase text-[#fff9f04d] px-5 mb-1">Chính</div>
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                className={`flex items-center gap-2 w-full px-5 py-2.5 rounded-lg mb-1 text-sm transition font-medium ${section === s.id ? 'bg-[#f59e0b2e] text-[#f59e0b] font-semibold' : 'text-[#fff9f0b3] hover:bg-[#fff9f00d] hover:text-[#fff9f0]'}`}
                onClick={() => setSection(s.id)}
              >
                <span className="text-base w-5 text-center">{s.icon}</span>
                {s.label}
              </button>
            ))}
          </nav>
          <div className="mt-auto px-5 pt-6 border-t border-[#fff9f014]">
            <div className="inline-flex items-center gap-2 text-xs font-medium text-[#f59e0b]">
              <span className="inline-block w-2 h-2 rounded-full bg-[#f59e0b]"></span>
              {profile?.subscription_status ?? 'ACTIVE'}
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center justify-between px-8 py-6 border-b border-[#23232e] bg-[#181820]">
            <div className="font-playfair text-xl font-semibold text-[#FFF9F0]">{pageTitles[section]}</div>
            <div className="flex gap-2">
              <button className="btn-secondary text-xs" onClick={() => setSection('profile')}>
                {profile?.business_name?.slice(0, 12) ?? 'Hồ sơ'} ▾
              </button>
            </div>
          </div>
          <div className="flex-1 px-8 py-7 flex flex-col gap-8 bg-[#181820]">
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

        {/* Mobile bar */}
        <div className="fixed md:hidden bottom-0 left-0 right-0 z-50 flex bg-[#23232e] border-t border-[#2a2a3c]">
          {mobileSections.map((s) => (
            <button
              key={s.id}
              className={`flex-1 flex flex-col items-center py-2 ${section === s.id ? 'text-[#f59e0b]' : 'text-[#fff9f0b3]'}`}
              onClick={() => setSection(s.id)}
            >
              <span className="text-lg mb-1">{s.icon}</span>
              <span className="text-xs font-medium">{s.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>
      </div>

      {toastMsg && <Toast msg={toastMsg} onDone={() => setToastMsg(null)} />}
    </>
  )
}

export default MerchantDashboard
