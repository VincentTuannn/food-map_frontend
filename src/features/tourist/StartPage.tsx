import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppStore } from '../../shared/store/appStore'
import { AppShell } from '../../shared/ui/AppShell'
import { useT } from '../../shared/i18n/useT'
import QRCode from '../../shared/ui/QRCode'
import { type Tour, type TourPoi } from '../../api/services/tours'
import { getUserProfile, type UserProfile } from '../../api/services/user'
import { logTrackingEvent } from '../../api/services/trackingLogs'

// Đổi tên component cho phù hợp tab "Cá nhân"
export function ProfileTab() {
  const nav = useNavigate()
  const setTourCode = useAppStore((s) => s.setTourCode)
  const showToast = useAppStore((s) => s.showToast)
  const userToken = useAppStore((s) => s.userToken)
  const setUserToken = useAppStore((s) => s.setUserToken)
  const t = useT()

  const [code, setCode] = useState('')
  const [radius, setRadius] = useState(50000)
  const [showQr, setShowQr] = useState(false)
  const setRadiusMeters = useAppStore((s) => s.setRadiusMeters)
  const [tours] = useState<Tour[]>([])
  const [selectedTourId, setSelectedTourId] = useState<string>('')
  const [tourPois] = useState<TourPoi[]>([])
  const [isLoadingTourPois] = useState(false)
  const [profile, setProfile] = useState<UserProfile | undefined>(undefined)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const canGeo = useMemo(() => 'geolocation' in navigator, [])

  useEffect(() => {
    if (!userToken) return;
    setIsLoadingProfile(true);
    getUserProfile()
      .then((data) => setProfile(data))
      .catch(() => setProfile(undefined))
      .finally(() => setIsLoadingProfile(false));
  }, [userToken]);

  // Helper for initials and display name
  const displayName = profile?.name || 'Khách';
  const initials = (profile?.name || 'K').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);

  // Dummy requestLocation handler (should be implemented as needed)
  const requestLocation = () => {
    if (canGeo) {
      navigator.geolocation.getCurrentPosition(
        () => showToast({ title: 'Đã cấp quyền vị trí!' }),
        () => showToast({ title: 'Không thể lấy vị trí.' })
      );
    } else {
      showToast({ title: 'Thiết bị không hỗ trợ định vị.' });
    }
  };

  return (
    <AppShell>
      <div className="min-h-dvh bg-linear-to-br from-orange-50 via-amber-100 to-sky-100 flex flex-col items-center py-0 px-0">
        {/* Banner */}
        <div className="w-full bg-linear-to-r from-orange-200 via-amber-100 to-sky-100 py-8 px-4 md:px-0 flex flex-col items-center text-center shadow-md mb-6">
          <div className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-2">Food Tour · Hồ Chí Minh</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-amber-800 mb-2 leading-tight">
            Mỗi con hẻm<br />
            <span className="text-sky-600 italic">là một câu chuyện</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto mb-4">
            {t('tourist.start.subtitle') || 'Đi một vòng, nghe một câu chuyện, khám phá một hương vị.'}
          </p>
          <div className="flex flex-wrap gap-3 justify-center">
            <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-5 rounded-full shadow transition-all" onClick={requestLocation}>
              📍 {t('tourist.start.requestLocation') || 'Cấp quyền vị trí'}
            </button>
            <button className="bg-white/80 hover:bg-sky-100 text-sky-700 font-bold py-2 px-5 rounded-full border border-sky-200 shadow transition-all" onClick={() => nav('/tourist/map')}>
              {t('tourist.start.openMap') || 'Mở Map'}
            </button>
          </div>
        </div>

        {/* Main content grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-0">
          {/* Left: Profile, Settings, App Info, Device Info, Merchant Ads */}
          <div className="flex flex-col gap-6">
            {/* Profile Card */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col gap-3">
              <div className="flex items-center gap-4 mb-2">
                <button className="w-16 h-16 rounded-full bg-linear-to-br from-amber-200 via-orange-100 to-sky-100 text-2xl font-extrabold text-amber-700 flex items-center justify-center border-2 border-amber-300 shadow" onClick={() => setShowProfileModal(true)} type="button">
                  {isLoadingProfile ? '…' : initials}
                </button>
                <div>
                  <div className="font-bold text-lg text-amber-800">{isLoadingProfile ? 'Đang tải…' : displayName}</div>
                  <div className="text-gray-500 text-sm">{profile?.email ?? 'Chưa đăng nhập'}</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap">
                <button className="bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold px-4 py-2 rounded-full transition-all" onClick={() => setShowProfileModal(true)}>
                  Xem hồ sơ
                </button>
                {profile?.language && <span className="bg-sky-100 text-sky-700 px-3 py-1 rounded-full text-xs font-semibold border border-sky-200">{profile.language}</span>}
              </div>
            </div>

            {/* Language Setting & App Info */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">🌐</span>
                <span className="font-bold text-amber-700">Ngôn ngữ</span>
                <select className="ml-auto bg-white/80 border border-amber-200 rounded-full px-3 py-1 text-sm text-amber-700 focus:outline-none" value={profile?.language || ''}>
                  <option value="">Tiếng Việt</option>
                  <option value="en">English</option>
                  <option value="ja">日本語</option>
                  <option value="ko">한국어</option>
                  <option value="zh">中文</option>
                  <option value="fr">Français</option>
                </select>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">ℹ️</span>
                <span className="font-bold text-amber-700">Phiên bản ứng dụng</span>
                <span className="ml-auto text-gray-500 text-sm">v1.0.0</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-lg">💻</span>
                <span className="font-bold text-amber-700">Thiết bị</span>
                <span className="ml-auto text-gray-500 text-sm">{navigator.userAgent}</span>
              </div>
            </div>

            {/* Merchant Ads */}
            <div className="rounded-3xl bg-linear-to-br from-sky-100 via-orange-50 to-amber-100 border border-white/60 shadow p-6 flex flex-col gap-2 items-center text-center">
              <div className="text-2xl font-extrabold text-sky-700 mb-1">🎉 Ưu đãi đối tác</div>
              <div className="text-gray-600 text-sm mb-2">Khám phá các gói quảng cáo hấp dẫn dành cho merchant/đối tác của FoodMap!</div>
              <button className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-2 rounded-full shadow transition-all">Xem gói quảng cáo</button>
            </div>
          </div>

          {/* Right: Radius, QR, Tour, Settings */}
          <div className="flex flex-col gap-6">
            {/* Radius Setting */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow p-6 flex flex-col gap-3">
              <div className="font-bold text-amber-700 mb-1">Bán kính kích hoạt</div>
              <label className="text-sm text-gray-600">Bán kính (m) (Đang test nên chọn 50000 nhé vì Data chưa nhiều)</label>
              <input type="number" className="sp-input mt-1" min={20} max={300} value={radius} onChange={(e) => setRadius(Number(e.target.value))} />
              <div className="text-xs text-gray-400 mb-2">Từ 20m đến 300m</div>
              <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-5 rounded-full shadow transition-all w-fit" onClick={() => { setRadiusMeters(radius); showToast({ title: t('tourist.start.radiusSet', { radius }) || `Đã đặt bán kính ${radius}m` }); }}>
                {t('tourist.start.apply') || 'Áp dụng'}
              </button>
            </div>

            {/* QR & Tour Code */}
            <div className="rounded-3xl bg-white/80 backdrop-blur-xl border border-white/60 shadow p-6 flex flex-col gap-3">
              <div className="font-bold text-amber-700 mb-1">Tour & Mã QR</div>
              <select className="sp-select mb-2" value={selectedTourId} onChange={(e) => { const nextId = e.target.value; setSelectedTourId(nextId); const matched = tours.find((item) => item.id === nextId); if (matched) setCode(matched.code ?? matched.id); }}>
                <option value="">Chọn tour…</option>
                {tours.map((tour) => (<option key={tour.id} value={tour.id}>{tour.name ?? tour.code ?? tour.id}</option>))}
              </select>
              <input className="sp-input mb-2" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('tourist.start.example') || 'Nhập mã tour…'} />
              <div className="flex gap-2 mb-2">
                <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-4 rounded-full shadow transition-all" onClick={() => { setTourCode(code.trim() || undefined); showToast({ title: t('tourist.start.tourSavedTitle') || 'Đã lưu tour', message: t('tourist.start.tourSavedDesc') }); logTrackingEvent({ event: 'tour_save', tourId: selectedTourId, meta: { code: code.trim() } }).catch(() => undefined); }}>
                  {t('tourist.start.saveTour') || 'Lưu tour'}
                </button>
                <button className="bg-white/80 hover:bg-sky-100 text-sky-700 font-bold py-2 px-4 rounded-full border border-sky-200 shadow transition-all" onClick={() => setShowQr((s) => !s)}>
                  {showQr ? '✕ Ẩn QR' : '⬛ Tạo QR'}
                </button>
              </div>
              {showQr && code.trim() && (
                <div className="flex justify-center"><QRCode value={code.trim()} size={160} /></div>
              )}
              {(isLoadingTourPois || tourPois.length > 0) && <div className="sp-divider" />}
              {isLoadingTourPois && <div className="sp-loading">Đang tải danh sách POI…</div>}
              {!isLoadingTourPois && tourPois.length > 0 && (
                <div className="sp-poi-list">
                  {tourPois.map((poi) => (
                    <div className="sp-poi-row" key={poi.id}>
                      <span className="sp-poi-name">{poi.name ?? poi.id}</span>
                      <span className="sp-poi-badge">#{poi.order ?? '-'}</span>
                    </div>
                  ))}
                </div>
              )}
              {!isLoadingTourPois && selectedTourId && tourPois.length === 0 && (
                <div className="sp-loading mt-2">Chưa có POI nào cho tour này.</div>
              )}
            </div>
          </div>
        </div>

        {/* Profile Modal (unchanged) */}
        {showProfileModal && (
          <div className="sp-modal-backdrop" role="dialog" aria-modal="true">
            <div className="sp-modal" onClick={(e) => e.stopPropagation()}>
              <div className="sp-modal-header">
                <button className="sp-modal-close" onClick={() => setShowProfileModal(false)}>✕</button>
                <div className="sp-modal-avatar">{initials}</div>
                <div className="sp-modal-name">{profile?.name ?? displayName}</div>
                <div className="sp-modal-email">{profile?.email ?? 'Chưa có email'}</div>
              </div>
              <div className="sp-modal-body">
                {[
                  { label: 'Tên', val: profile?.name ?? '—' },
                  { label: 'Email', val: profile?.email ?? '—' },
                  { label: 'Điện thoại', val: profile?.phone ?? '—' },
                  { label: 'Ngôn ngữ', val: profile?.language ?? '—' },
                ].map((row) => (
                  <div className="sp-meta-row" key={row.label}>
                    <span className="sp-meta-label">{row.label}</span>
                    <span className="sp-meta-val">{row.val}</span>
                  </div>
                ))}
              </div>
              <div className="sp-modal-footer">
                {userToken && (
                  <button className="sp-btn-danger" onClick={() => { setUserToken(undefined); setShowProfileModal(false) }}>
                    Đăng xuất
                  </button>
                )}
                    <button className="sp-btn" onClick={() => setShowProfileModal(false)}>Đóng</button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </AppShell>
      );
}