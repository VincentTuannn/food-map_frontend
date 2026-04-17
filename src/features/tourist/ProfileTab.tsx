import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Html5Qrcode } from 'html5-qrcode'

import { useAppStore, type Language } from '../../shared/store/appStore'
import { AppShell } from '../../shared/ui/AppShell'
import QRCode from '../../shared/ui/QRCode'
import { getTours } from '../../api/services/tours'
import { getUserProfile, type UserProfile } from '../../api/services/user'
import { logTrackingEvent } from '../../api/services/trackingLogs'
import i18n from '../../shared/i18n/i18n'

export function ProfileTab() {
  const nav = useNavigate()
  const { t } = useTranslation()

  // --- STORE ---
  const setTourCode = useAppStore((s) => s.setTourCode)
  const showToast = useAppStore((s) => s.showToast)
  const userToken = useAppStore((s) => s.userToken)
  const setUserToken = useAppStore((s) => s.setUserToken)
  const currentLanguage = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)
  const setRadiusMeters = useAppStore((s) => s.setRadiusMeters)

  // --- DRAFT STATES (Lưu nháp cài đặt) ---
  // Lấy radius từ cookie nếu có
  const getRadiusFromCookie = () => {
    const match = document.cookie.match(/(?:^|; )radius=([^;]*)/);
    const val = match ? decodeURIComponent(match[1]) : '';
    const num = parseInt(val, 10);
    return !isNaN(num) && num > 0 ? num : 50000;
  };
  const [draftLang, setDraftLang] = useState<string>(i18n.language || 'vi-VN')
  const [draftRadius, setDraftRadius] = useState<number>(getRadiusFromCookie())

  // --- DATA STATES ---
  const [code, setCode] = useState('')
  const [tours, setTours] = useState<any[]>([])
  const [selectedTourId, setSelectedTourId] = useState<string>('')
  // const [tourPois, setTourPois] = useState<TourPoi[]>([])
  
  const [isLoadingTours, setIsLoadingTours] = useState(false)
  // const [isLoadingTourPois, setIsLoadingTourPois] = useState(false)
  const [profile, setProfile] = useState<UserProfile | undefined>(undefined)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  
  // --- MODALS ---
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showDeviceModal, setShowDeviceModal] = useState(false)
  const [showShareQrModal, setShowShareQrModal] = useState(false)
  const [showScanQrModal, setShowScanQrModal] = useState(false)

  const canGeo = useMemo(() => typeof navigator !== 'undefined' && 'geolocation' in navigator, [])

  // --- LẤY THÔNG TIN THIẾT BỊ ---
  const deviceInfo = useMemo(() => {
    if (typeof window === 'undefined') return null;

    let deviceId = localStorage.getItem('device_uuid');
    if (!deviceId) {
      deviceId = typeof crypto.randomUUID === 'function' ? crypto.randomUUID() : 'id-' + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('device_uuid', deviceId);
    }

    const getBrowser = () => {
      const ua = navigator.userAgent?.toLowerCase() || '';
      if (ua.includes("edg/")) return "Edge";
      if (ua.includes("chrome") && !ua.includes("edg/")) return "Chrome";
      if (ua.includes("safari") && !ua.includes("chrome")) return "Safari";
      if (ua.includes("firefox")) return "Firefox";
      return "Unknown";
    };

    return [
      { label: 'Device ID', value: deviceId },
      { label: 'Platform', value: navigator.platform || 'Unknown' },
      { label: 'Browser', value: getBrowser() },
      { label: 'Vendor', value: navigator.vendor || 'Unknown' },
      { label: 'Màn hình', value: window.screen ? `${window.screen.width}x${window.screen.height}` : 'Unknown' },
      { label: 'Ngôn ngữ', value: navigator.language || 'Unknown' },
      { label: 'Múi giờ', value: Intl.DateTimeFormat().resolvedOptions().timeZone },
      { label: 'CPU', value: navigator.hardwareConcurrency ? `${navigator.hardwareConcurrency} cores` : 'Unknown' }
    ]
  }, [])

  // --- EFFECTS ---
  useEffect(() => {
    if (!userToken) {
      setProfile(undefined);
      return;
    }
    setIsLoadingProfile(true)
    getUserProfile()
      .then((data) => setProfile(data))
      .catch(() => setProfile(undefined))
      .finally(() => setIsLoadingProfile(false))
  }, [userToken])

  useEffect(() => {
    setIsLoadingTours(true)
    getTours()
      .then((items) => {
        if (!items || items.length === 0) {
          const mockTours = [
            { id: 'tour-free-01', code: 'SG-STREET-FREE', name: 'Food Tour Đường Phố Sài Gòn', isPremium: false },
            { id: 'tour-prem-02', code: 'SG-VIP-MICHELIN', name: 'Trải Nghiệm Michelin 5 Sao', isPremium: true }
          ];
          setTours(mockTours);
          setSelectedTourId(mockTours[0].id);
          setCode(mockTours[0].code);
        } else {
          setTours(items)
          const first = items[0]
          setSelectedTourId(first.id)
          setCode(first.code ?? first.id)
        }
      })
      .catch(() => showToast({ title: t('profile.toast.load_tour_error', 'Không tải được danh sách tour') }))
      .finally(() => setIsLoadingTours(false))
  }, [showToast, t])

  // --- CAMERA QR ---
  useEffect(() => {
    if (!showScanQrModal) return;
    let html5QrCode: Html5Qrcode;
    const timer = setTimeout(() => {
      html5QrCode = new Html5Qrcode("qr-reader-element");
      html5QrCode.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          setCode(decodedText);
          showToast({ title: 'Quét thành công', message: `Mã: ${decodedText}` });
          setShowScanQrModal(false);
          if (html5QrCode.isScanning) html5QrCode.stop().catch(console.error);
        },
        () => {}
      ).catch((err) => {
        console.error("Camera error:", err);
        showToast({ title: 'Lỗi Camera', message: 'Vui lòng cấp quyền sử dụng Camera.' });
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [showScanQrModal, showToast]);

  // --- HÀNH ĐỘNG ---
  async function requestLocation() {
    if (!canGeo) {
      showToast({ title: t('tourist.start.noGpsTitle', 'Lỗi'), message: t('tourist.start.noGpsDesc', 'Không hỗ trợ GPS') })
      return
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        showToast({ title: t('tourist.start.gpsOkTitle', 'Thành công'), message: t('tourist.start.gpsOkDesc', 'Đã bật định vị') })
        nav('/tourist/map')
      },
      () => showToast({ title: t('tourist.start.gpsDeniedTitle', 'Từ chối'), message: t('tourist.start.gpsDeniedDesc', 'Vui lòng cấp quyền') }),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const handleSaveTourCode = () => {
    if (!code.trim()) {
      showToast({ title: t('profile.tour.empty_code', 'Vui lòng nhập mã tour') })
      return;
    }
    setTourCode(code.trim()); 
    showToast({ title: t('tourist.start.tourSavedTitle', 'Đã lưu tour'), message: t('profile.tour.can_start', 'Bạn có thể bắt đầu hành trình') }); 
    logTrackingEvent({ event: 'tour_save', tourId: selectedTourId, meta: { code: code.trim() } }).catch(() => undefined);
  }

  // LƯU CÀI ĐẶT (Apply Drafts)
  const handleSaveSettings = () => {
    setIsSaving(true);
    // Lưu Bán kính vào store và cookie
    setRadiusMeters(draftRadius);
    document.cookie = `radius=${encodeURIComponent(draftRadius)}; path=/; max-age=2592000`;

    // Lưu Ngôn ngữ nếu có thay đổi
    if (draftLang !== currentLanguage && draftLang !== i18n.language) {
      i18n.changeLanguage(draftLang).then(() => {
        setLanguage(draftLang as Language);
        localStorage.setItem('i18nextLng', draftLang);
        document.cookie = `language=${encodeURIComponent(draftLang)}; path=/; max-age=2592000`;
      });
    } else {
      // Nếu không đổi ngôn ngữ, vẫn lưu lại
      document.cookie = `language=${encodeURIComponent(draftLang)}; path=/; max-age=2592000`;
    }

    setTimeout(() => {
      setIsSaving(false);
      showToast({ title: t('profile.save_success', 'Đã cập nhật cài đặt thành công!') });
    }, 600);
  }

  // ĐĂNG XUẤT
  const handleLogout = () => {
    setUserToken(undefined);
    setProfile(undefined);
    showToast({ title: t('profile.logout_success', 'Đã đăng xuất khỏi tài khoản') });
    // Nếu muốn đẩy về trang chủ sau khi đăng xuất thì bật dòng này:
    // nav('/');
  }

  // An toàn khi profile không có dữ liệu
  const displayName = profile?.name || profile?.email || t('profile.guest', 'Khách');
  const initials = displayName.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || 'U';

  return (
    <AppShell>
      <div className="min-h-[100dvh] pb-32 bg-gradient-to-br from-orange-50 via-amber-100 to-sky-100 flex flex-col items-center py-0 px-0">
        
        {/* Banner */}
        <div className="w-full bg-gradient-to-r from-orange-200 via-amber-100 to-sky-100 py-8 px-4 md:px-0 flex flex-col items-center text-center shadow-md mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/40 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
          <div className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-2 z-10">{t('profile.banner.tag', 'Food Tour · Hồ Chí Minh')}</div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-amber-800 mb-2 leading-tight z-10">
            {t('profile.banner.title1', 'Mỗi con hẻm')}<br />
            <span className="text-sky-600 italic">{t('profile.banner.title2', 'là một câu chuyện')}</span>
          </h1>
          <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto mb-4 z-10">
            {t('tourist.start.subtitle', 'Đi một vòng, nghe một câu chuyện, khám phá một hương vị.')}
          </p>
          <div className="flex flex-wrap gap-3 justify-center z-10">
            <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-full shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5" onClick={requestLocation}>
              📍 {t('tourist.start.requestLocation', 'Cấp quyền vị trí')}
            </button>
            <button className="bg-white/80 backdrop-blur-md hover:bg-sky-50 text-sky-700 font-bold py-2.5 px-6 rounded-full border border-sky-200 shadow transition-all hover:-translate-y-0.5" onClick={() => nav('/tourist/map')}>
              {t('tourist.start.openMap', 'Mở Map')}
            </button>
          </div>
        </div>

        {/* Main content grid */}
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-6">
          
          {/* ----- CỘT TRÁI ----- */}
          <div className="flex flex-col gap-6">
            
            {/* Profile Card */}
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col gap-3">
              <div className="flex items-center gap-4 mb-2">
                <button className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 via-orange-100 to-sky-100 text-2xl font-extrabold text-amber-700 flex items-center justify-center border-2 border-amber-300 shadow" onClick={() => setShowProfileModal(true)} type="button">
                  {isLoadingProfile ? '…' : initials}
                </button>
                <div>
                  <div className="font-bold text-lg text-amber-800">{isLoadingProfile ? t('profile.loading', 'Đang tải…') : displayName}</div>
                  <div className="text-gray-500 text-sm">{profile?.email ?? t('profile.not_logged_in', 'Chưa đăng nhập')}</div>
                </div>
              </div>
              <div className="flex gap-2 flex-wrap mt-2">
                <button className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm" onClick={() => setShowProfileModal(true)}>
                  {t('profile.view_profile', 'Xem hồ sơ')}
                </button>
                {i18n.language && <span className="bg-sky-100 text-sky-700 px-4 py-2.5 rounded-xl text-sm font-semibold border border-sky-200 flex items-center uppercase">{i18n.language}</span>}
              </div>
            </div>

            {/* Language & App Info (DRAFT MODE) */}
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col gap-5">
              
              {/* Ngôn ngữ */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌐</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-amber-800">{t('profile.language_setting', 'Ngôn ngữ')}</span>
                    {draftLang !== currentLanguage && <span className="text-[10px] text-amber-600 italic">Chưa lưu*</span>}
                  </div>
                </div>
                <select 
                  className="bg-white border border-amber-200 rounded-xl px-4 py-2 text-sm text-amber-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm disabled:opacity-50" 
                  value={draftLang}
                  onChange={(e) => setDraftLang(e.target.value)}
                >
                  <option value="vi-VN">Tiếng Việt</option>
                  <option value="en-US">English</option>
                  <option value="ja-JP">日本語</option>
                  <option value="ko-KR">한국어</option>
                  <option value="zh-Hans-CN">中文</option>
                </select>
              </div>

              <hr className="border-gray-200/60" />

              {/* Bán kính (Chuyển từ cột phải sang chung phần Cài đặt) */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 w-1/2">
                  <span className="text-xl">🎯</span>
                  <div className="flex flex-col">
                    <span className="font-bold text-amber-800">{t('profile.radius.title', 'Bán kính (m)')}</span>
                    <span className="text-[10px] text-gray-500">Kích hoạt tự động</span>
                  </div>
                </div>
                <input 
                  type="number" 
                  className="w-24 bg-white border border-gray-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-gray-700 text-center" 
                  min={20} max={300} step={10}
                  value={draftRadius} 
                  onChange={(e) => setDraftRadius(Number(e.target.value))} 
                />
              </div>

              <hr className="border-gray-200/60" />

              {/* Thiết bị */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">💻</span>
                  <span className="font-bold text-amber-800">{t('profile.device_info', 'Thông tin thiết bị')}</span>
                </div>
                <button 
                  onClick={() => setShowDeviceModal(true)}
                  className="text-sky-600 font-bold text-sm bg-sky-50 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors"
                >
                  {t('profile.view_details', 'Xem chi tiết')}
                </button>
              </div>
            </div>
          </div>

          {/* ----- CỘT PHẢI ----- */}
          <div className="flex flex-col gap-6">
            
            {/* Cấu hình Tour & Mã QR */}
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col gap-4 flex-1">
              <div className="font-bold text-amber-800 text-lg flex items-center gap-2 border-b border-gray-200/60 pb-3">
                <span className="text-xl">🗺️</span> {t('profile.tour.config_title', 'Hành trình của bạn')}
              </div>
              
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-gray-600">{t('profile.tour.select_label', 'Chọn Tour từ hệ thống')}</label>
                {isLoadingTours ? (
                  <div className="text-sm text-gray-500 animate-pulse">{t('profile.tour.loading_list', 'Đang tải danh sách tour...')}</div>
                ) : (
                  <select 
                    className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-gray-700" 
                    value={selectedTourId} 
                    onChange={(e) => { 
                      const nextId = e.target.value; 
                      setSelectedTourId(nextId); 
                      const matched = tours.find((item) => item.id === nextId); 
                      if (matched) setCode(matched.code ?? matched.id); 
                    }}
                  >
                    <option value="">{t('profile.tour.select_prompt', 'Chọn tour để tham gia…')}</option>
                    {tours.map((tour) => (
                      <option key={tour.id} value={tour.id}>
                        {tour.isPremium ? '💎 ' : '🆓 '}{tour.name ?? tour.code ?? tour.id}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="flex flex-col gap-2 mt-2">
                <label className="text-sm font-semibold text-gray-600">{t('profile.tour.manual_join', 'Tham gia bằng mã')}</label>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 w-full bg-white border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700 font-medium" 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)} 
                    placeholder="VD: SG-FOOD-2024" 
                  />
                  <button 
                    className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all whitespace-nowrap" 
                    onClick={handleSaveTourCode}
                  >
                    {t('profile.tour.join_btn', 'Tham gia')}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mt-2">
                <button 
                  className="bg-sky-50 hover:bg-sky-100 text-sky-700 font-bold py-3 px-4 rounded-xl border border-sky-200 shadow-sm transition-all flex items-center justify-center gap-2" 
                  onClick={() => setShowScanQrModal(true)}
                >
                  📷 {t('profile.tour.scan_btn', 'Quét QR')}
                </button>
                <button 
                  className="bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold py-3 px-4 rounded-xl border border-orange-200 shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50" 
                  onClick={() => setShowShareQrModal(true)}
                  disabled={!code.trim()}
                >
                  📤 {t('profile.tour.share_btn', 'Chia sẻ QR')}
                </button>
              </div>
            </div>

            {/* VÙNG HÀNH ĐỘNG: LƯU CÀI ĐẶT & ĐĂNG XUẤT */}
            <div className="flex flex-col gap-3">
              <button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/30 transition-all flex justify-center items-center gap-2 disabled:opacity-70 disabled:cursor-wait"
              >
                {isSaving ? (
                   <span className="animate-spin text-xl">⏳</span>
                ) : (
                   <span className="text-xl">💾</span>
                )}
                {isSaving ? t('common.saving', 'Đang lưu...') : t('profile.save_settings', 'Lưu Cài Đặt')}
              </button>

              {userToken && (
                <button 
                  onClick={handleLogout}
                  className="w-full bg-white hover:bg-red-50 text-red-500 font-bold py-4 rounded-2xl shadow-sm border border-red-100 transition-all flex justify-center items-center gap-2"
                >
                  <span className="text-xl">🚪</span>
                  {t('profile.logout', 'Đăng xuất tài khoản')}
                </button>
              )}
            </div>

          </div>
        </div>

        {/* ----------------- MODALS ----------------- */}

        {/* 1. Modal Thiết bị */}
        {showDeviceModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDeviceModal(false)}>
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-gray-200" onClick={(e) => e.stopPropagation()}>
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                    <span className="font-bold text-gray-700">Xem chi tiết thiết bị</span>
                </div>
                <button className="text-gray-400 hover:text-gray-600" onClick={() => setShowDeviceModal(false)}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
              </div>
              <div className="p-0 max-h-[60vh] overflow-y-auto">
                <table className="w-full text-sm text-left border-collapse">
                  <tbody>
                    {deviceInfo && deviceInfo.map((item, idx) => (
                      <tr key={idx} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition">
                        <td className="py-3 px-6 font-medium text-gray-500 w-1/3 whitespace-nowrap">{item.label}</td>
                        <td className="py-3 px-6 text-gray-800 text-right font-mono text-[13px] break-all">{item.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* 2. Modal Profile (Thu gọn do đã đưa nút Đăng xuất ra ngoài) */}
        {showProfileModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowProfileModal(false)}>
            <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/50" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-center relative">
                <button className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 w-8 h-8 flex items-center justify-center rounded-full" onClick={() => setShowProfileModal(false)}>✕</button>
                <div className="mx-auto w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl font-extrabold text-amber-600 mb-3 shadow-xl border-4 border-amber-200">
                  {initials}
                </div>
                <div className="text-xl font-bold text-white">{profile?.name ?? displayName}</div>
                <div className="text-amber-100 text-sm font-medium">{profile?.email ?? 'Chưa có email'}</div>
              </div>
              <div className="p-6">
                 <button className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl" onClick={() => setShowProfileModal(false)}>Đóng</button>
              </div>
            </div>
          </div>
        )}

        {/* 3. Modal Chia sẻ QR */}
        {showShareQrModal && code && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in zoom-in duration-200" onClick={() => setShowShareQrModal(false)}>
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden flex flex-col items-center p-8 text-center" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-2xl font-extrabold text-amber-800 mb-2">{t('profile.qr.share_title', 'Mã QR của bạn')}</h3>
              <div className="p-4 bg-white rounded-2xl border-2 border-amber-100 shadow-inner mb-6 inline-block">
                <QRCode value={code.trim()} size={220} />
              </div>
              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white font-bold py-3.5 rounded-xl transition-all shadow-md" onClick={() => setShowShareQrModal(false)}>Xong</button>
            </div>
          </div>
        )}

        {/* 4. Modal Quét QR (Khung Camera) */}
        {showScanQrModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowScanQrModal(false)}>
            <div className="w-full max-w-md flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between w-full items-center mb-6 px-2">
                <div className="text-white font-bold text-lg">{t('profile.qr.scan_title', 'Quét mã QR')}</div>
                <button className="text-white/80 hover:text-white bg-white/10 w-10 h-10 flex items-center justify-center rounded-full backdrop-blur" onClick={() => setShowScanQrModal(false)}>✕</button>
              </div>
              
              <div className="w-full max-w-[320px] aspect-square bg-black rounded-3xl border-4 border-white/20 relative overflow-hidden flex items-center justify-center shadow-2xl">
                <div id="qr-reader-element" className="w-full h-full object-cover"></div>
                <div className="absolute inset-6 border-2 border-dashed border-amber-400/80 rounded-xl pointer-events-none z-10"></div>
              </div>

              <p className="text-white/70 text-sm mt-6 text-center px-4">
                {t('profile.qr.scan_hint', 'Di chuyển camera để mã QR nằm trong khung hình')}
              </p>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}