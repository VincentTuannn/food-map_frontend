
// import { useEffect, useMemo, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAppStore, type Language } from '../../shared/store/appStore'
// import { AppShell } from '../../shared/ui/AppShell'
// import { useT } from '../../shared/i18n/useT'
// import QRCode from '../../shared/ui/QRCode'
// import { getTourPois, getTours, type Tour, type TourPoi } from '../../api/services/tours'
// import { getUserProfile, type UserProfile } from '../../api/services/user'
// import { logTrackingEvent } from '../../api/services/trackingLogs'

// export function ProfileTab() {
//   const nav = useNavigate()
//   const setTourCode = useAppStore((s) => s.setTourCode)
//   const showToast = useAppStore((s) => s.showToast)
//   const userToken = useAppStore((s) => s.userToken)
//   const setUserToken = useAppStore((s) => s.setUserToken)
//   const language = useAppStore((s) => s.language)
//   const setLanguage = useAppStore((s) => s.setLanguage)
//   const t = useT()

//   const [code, setCode] = useState('')
//   const [radius, setRadius] = useState(50000)
//   const [showQr, setShowQr] = useState(false)
//   const setRadiusMeters = useAppStore((s) => s.setRadiusMeters)
//   const [tours, setTours] = useState<Tour[]>([])
//   const [selectedTourId, setSelectedTourId] = useState<string>('')
//   const [tourPois, setTourPois] = useState<TourPoi[]>([])
//   const [isLoadingTours, setIsLoadingTours] = useState(false)
//   const [isLoadingTourPois, setIsLoadingTourPois] = useState(false)
//   const [profile, setProfile] = useState<UserProfile | undefined>(undefined)
//   const [isLoadingProfile, setIsLoadingProfile] = useState(false)
//   const [showProfileModal, setShowProfileModal] = useState(false)
//   const [showDeviceModal, setShowDeviceModal] = useState(false)

//   // Loading Ngôn ngữ
//   const [isLangLoading, setIsLangLoading] = useState(false)
//   const [langProgress, setLangProgress] = useState(0)

//   const canGeo = useMemo(() => 'geolocation' in navigator, [])

//   // Thu thập toàn bộ thông tin thiết bị
//   const deviceInfo = useMemo(() => {
//     if (typeof window === 'undefined') return null;
//     return {
//       userAgent: navigator.userAgent,
//       platform: navigator.platform || (navigator as any).userAgentData?.platform || 'Không xác định',
//       vendor: navigator.vendor || 'Không xác định',
//       language: navigator.language,
//       screen: `${window.screen.width} x ${window.screen.height}`,
//       cores: navigator.hardwareConcurrency || 'Không xác định',
//       memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : 'Không xác định',
//       connection: (navigator as any).connection ? (navigator as any).connection.effectiveType : 'Không xác định',
//     }
//   }, [])

//   // 1. Fetch Profile
//   useEffect(() => {
//     if (!userToken) return
//     setIsLoadingProfile(true)
//     getUserProfile()
//       .then((data) => setProfile(data))
//       .catch(() => setProfile(undefined))
//       .finally(() => setIsLoadingProfile(false))
//   }, [userToken])

//   // 2. Fetch Tours
//   useEffect(() => {
//     setIsLoadingTours(true)
//     getTours()
//       .then((items) => {
//         setTours(items || [])
//         if (items?.length) {
//           const first = items[0]
//           setSelectedTourId(first.id)
//           setCode(first.code ?? first.id)
//         }
//       })
//       .catch(() => showToast({ title: 'Không tải được danh sách tour' }))
//       .finally(() => setIsLoadingTours(false))
//   }, [showToast])

//   // 3. Fetch POIs khi chọn Tour
//   useEffect(() => {
//     if (!selectedTourId) { setTourPois([]); return }
//     setIsLoadingTourPois(true)
//     getTourPois(selectedTourId)
//       .then((items) => setTourPois(items || []))
//       .catch(() => showToast({ title: 'Không tải được POI trong tour' }))
//       .finally(() => setIsLoadingTourPois(false))
//     logTrackingEvent({ event: 'tour_select', tourId: selectedTourId }).catch(() => undefined)
//   }, [selectedTourId, showToast])

//   // 4. Hàm xin quyền vị trí
//   async function requestLocation() {
//     if (!canGeo) {
//       showToast({ title: t('tourist.start.noGpsTitle') || 'Lỗi', message: t('tourist.start.noGpsDesc') || 'Không hỗ trợ GPS' })
//       return
//     }
//     navigator.geolocation.getCurrentPosition(
//       () => {
//         showToast({ title: t('tourist.start.gpsOkTitle') || 'Thành công', message: t('tourist.start.gpsOkDesc') || 'Đã bật định vị' })
//         nav('/tourist/map')
//       },
//       () => showToast({ title: t('tourist.start.gpsDeniedTitle') || 'Từ chối', message: t('tourist.start.gpsDeniedDesc') || 'Vui lòng cấp quyền' }),
//       { enableHighAccuracy: true, timeout: 10_000 },
//     )
//   }

//   // 5. Hàm đổi ngôn ngữ (Có thanh loading ảo)
//   const handleLanguageChange = (newLang: string) => {
//     if (newLang === language) return;
//     setIsLangLoading(true);
//     setLangProgress(0);

//     let progress = 0;
//     const interval = setInterval(() => {
//       progress += Math.floor(Math.random() * 20) + 10; // Tăng random 10-30%
//       if (progress >= 100) {
//         clearInterval(interval);
//         setLangProgress(100);
//         setTimeout(() => {
//         setLanguage(newLang as Language);
//         localStorage.setItem('language', newLang);
//         setIsLangLoading(false);
//         setLangProgress(0);
//         showToast({ title: 'Chuyển đổi ngôn ngữ thành công!' });
//       }, 300);
//       } else {
//         setLangProgress(progress);
//       }
//     }, 150);
//   }

//   // Xử lý tên hiển thị
//   const displayName = profile?.name || profile?.email || 'Khách'
//   const initials = displayName
//     .split(' ').filter(Boolean).slice(0, 2)
//     .map((p) => p[0]?.toUpperCase()).join('')

//   return (
//     <AppShell>
//       {/* Container cuộn chính - Thêm pb-28 để không bị BottomNav chèn */}
//       <div className="min-h-[100dvh] pb-28 bg-gradient-to-br from-orange-50 via-amber-100 to-sky-100 flex flex-col items-center py-0 px-0">
        
//         {/* Banner */}
//         <div className="w-full bg-gradient-to-r from-orange-200 via-amber-100 to-sky-100 py-8 px-4 md:px-0 flex flex-col items-center text-center shadow-md mb-6 relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-40 h-40 bg-white/40 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
//           <div className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-2 z-10">Food Tour · Hồ Chí Minh</div>
//           <h1 className="text-3xl md:text-4xl font-extrabold text-amber-800 mb-2 leading-tight z-10">
//             Mỗi con hẻm<br />
//             <span className="text-sky-600 italic">là một câu chuyện</span>
//           </h1>
//           <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto mb-4 z-10">
//             {t('tourist.start.subtitle') || 'Đi một vòng, nghe một câu chuyện, khám phá một hương vị.'}
//           </p>
//           <div className="flex flex-wrap gap-3 justify-center z-10">
//             <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-full shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5" onClick={requestLocation}>
//               📍 {t('tourist.start.requestLocation') || 'Cấp quyền vị trí'}
//             </button>
//             <button className="bg-white/80 backdrop-blur-md hover:bg-sky-50 text-sky-700 font-bold py-2.5 px-6 rounded-full border border-sky-200 shadow transition-all hover:-translate-y-0.5" onClick={() => nav('/tourist/map')}>
//               {t('tourist.start.openMap') || 'Mở Map'}
//             </button>
//           </div>
//         </div>

//         {/* Main content grid */}
//         <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-6">
          
//           {/* Left Column */}
//           <div className="flex flex-col gap-6">
            
//             {/* Profile Card */}
//             <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col gap-3">
//               <div className="flex items-center gap-4 mb-2">
//                 <button className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 via-orange-100 to-sky-100 text-2xl font-extrabold text-amber-700 flex items-center justify-center border-2 border-amber-300 shadow" onClick={() => setShowProfileModal(true)} type="button">
//                   {isLoadingProfile ? '…' : initials}
//                 </button>
//                 <div>
//                   <div className="font-bold text-lg text-amber-800">{isLoadingProfile ? 'Đang tải…' : displayName}</div>
//                   <div className="text-gray-500 text-sm">{profile?.email ?? 'Chưa đăng nhập'}</div>
//                 </div>
//               </div>
//               <div className="flex gap-2 flex-wrap mt-2">
//                 <button className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm" onClick={() => setShowProfileModal(true)}>
//                   Xem hồ sơ
//                 </button>
//                 {profile?.language && <span className="bg-sky-100 text-sky-700 px-4 py-2.5 rounded-xl text-sm font-semibold border border-sky-200 flex items-center">{profile.language}</span>}
//               </div>
//             </div>

//             {/* Language & App Info */}
//             <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col gap-5 relative overflow-hidden">
              
//               {/* Progress bar loading ngôn ngữ */}
//               {isLangLoading && (
//                 <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
//                   <div className="h-full bg-amber-500 transition-all duration-150 ease-linear" style={{ width: `${langProgress}%` }}></div>
//                 </div>
//               )}

//               {/* Ngôn ngữ */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <span className="text-xl">🌐</span>
//                   <span className="font-bold text-amber-800">Ngôn ngữ</span>
//                 </div>
//                 <select
//                   className="bg-white border border-amber-200 rounded-xl px-4 py-2 text-sm text-amber-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm disabled:opacity-50"
//                   value={language || 'vi'}
//                   onChange={(e) => handleLanguageChange(e.target.value)}
//                   disabled={isLangLoading}
//                 >
//                   <option value="vi">Tiếng Việt</option>
//                   <option value="en">English</option>
//                   <option value="ja">日本語</option>
//                   <option value="ko">한국어</option>
//                   <option value="zh">中文</option>
//                   <option value="fr">Français</option>
//                 </select>
//               </div>

//               <hr className="border-gray-200/60" />

//               {/* Phiên bản */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <span className="text-xl">ℹ️</span>
//                   <span className="font-bold text-amber-800">Phiên bản ứng dụng</span>
//                 </div>
//                 <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">v1.2.0 (Beta)</span>
//               </div>

//               <hr className="border-gray-200/60" />

//               {/* Thiết bị */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <span className="text-xl">💻</span>
//                   <span className="font-bold text-amber-800">Thông tin thiết bị</span>
//                 </div>
//                 <button
//                   onClick={() => setShowDeviceModal(true)}
//                   className="text-sky-600 font-bold text-sm bg-sky-50 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors"
//                 >
//                   Xem chi tiết
//                 </button>
//               </div>
//             </div>

//             {/* Merchant Ads */}
//             <div className="rounded-3xl bg-gradient-to-br from-sky-100 via-orange-50 to-amber-100 border border-white/60 shadow-lg p-6 flex flex-col gap-2 items-center text-center relative overflow-hidden">
//               <div className="absolute -right-6 -bottom-6 text-9xl opacity-10">🏬</div>
//               <div className="z-10 flex flex-col items-center">
//                 <div className="text-2xl font-extrabold text-sky-800 mb-1">🎉 Ưu đãi đối tác</div>
//                 <div className="text-gray-600 text-sm mb-4">Đưa quán ăn của bạn lên bản đồ Food Tour, tiếp cận hàng ngàn khách du lịch mỗi ngày!</div>
//                 <button className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-sky-500/30 transition-all">Đăng ký ngay</button>
//               </div>
//             </div>
//           </div>

//           {/* Right Column */}
//           <div className="flex flex-col gap-6">
            
//             {/* Radius Setting */}
//             <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col gap-3">
//               <div className="font-bold text-amber-800 text-lg flex items-center gap-2"><span className="text-xl">🎯</span> Bán kính kích hoạt (m)</div>
//               <label className="text-xs text-gray-500">Khoảng cách quét địa điểm tự động (Dữ liệu đang test nên để lớn: 50.000m)</label>
//               <div className="flex gap-2 mt-1">
//                 <input
//                   type="number"
//                   className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-gray-700"
//                   min={20} max={300}
//                   value={radius}
//                   onChange={(e) => setRadius(Number(e.target.value))}
//                 />
//                 <button
//                   className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-5 rounded-xl shadow transition-all"
//                   onClick={() => { setRadiusMeters(radius); showToast({ title: t('tourist.start.radiusSet', { radius }) || `Đã lưu bán kính ${radius}m` }); }}
//                 >
//                   Áp dụng
//                 </button>
//               </div>
//             </div>

//             {/* QR & Tour Code */}
//             <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col gap-3 flex-1">
//               <div className="font-bold text-amber-800 text-lg flex items-center gap-2 mb-1"><span className="text-xl">🗺️</span> Cấu hình Tour & Mã QR</div>
              
//               {isLoadingTours ? (
//                  <div className="text-sm text-gray-500 mb-2 animate-pulse">Đang tải danh sách tour...</div>
//               ) : (
//                 <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 mb-1 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-gray-700" value={selectedTourId} onChange={(e) => { const nextId = e.target.value; setSelectedTourId(nextId); const matched = tours.find((item) => item.id === nextId); if (matched) setCode(matched.code ?? matched.id); }}>
//                   <option value="">Chọn tour để tham gia…</option>
//                   {tours.map((tour) => (<option key={tour.id} value={tour.id}>{tour.name ?? tour.code ?? tour.id}</option>))}
//                 </select>
//               )}
              
//               <input className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 mb-2 focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('tourist.start.example') || 'Nhập mã tour chia sẻ…'} />
              
//               <div className="flex gap-3 mb-2">
//                 <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex-1" onClick={() => { setTourCode(code.trim() || undefined); showToast({ title: t('tourist.start.tourSavedTitle') || 'Đã lưu tour', message: 'Bạn có thể bắt đầu hành trình' }); logTrackingEvent({ event: 'tour_save', tourId: selectedTourId, meta: { code: code.trim() } }).catch(() => undefined); }}>
//                   Lưu Tour
//                 </button>
//                 <button className="bg-white/80 hover:bg-sky-50 text-sky-700 font-bold py-3 px-4 rounded-xl border border-sky-200 shadow-sm transition-all flex-1 flex items-center justify-center gap-2" onClick={() => setShowQr((s) => !s)}>
//                   {showQr ? '✕ Ẩn QR' : '📷 Quét / Tạo QR'}
//                 </button>
//               </div>

//               {showQr && code.trim() && (
//                 <div className="flex justify-center p-5 bg-white rounded-2xl border border-gray-100 my-2 shadow-inner animate-in fade-in zoom-in duration-200">
//                   <QRCode value={code.trim()} size={180} />
//                 </div>
//               )}

//               {(isLoadingTourPois || tourPois.length > 0) && <hr className="my-3 border-gray-200/60" />}
              
//               {isLoadingTourPois && <div className="text-sm text-gray-500 flex items-center gap-2">⏳ Đang tải danh sách địa điểm...</div>}
//               {!isLoadingTourPois && tourPois.length > 0 && (
//                 <div className="flex flex-col gap-2 overflow-y-auto pr-1" style={{ maxHeight: '250px' }}>
//                   {tourPois.map((poi) => (
//                     <div className="flex justify-between items-center p-3 bg-white/60 hover:bg-white border border-white rounded-xl shadow-sm transition-colors" key={poi.id}>
//                       <span className="font-bold text-sm text-gray-800">{poi.name ?? poi.id}</span>
//                       <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md font-bold">Thứ tự #{poi.order ?? '-'}</span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//               {!isLoadingTourPois && selectedTourId && tourPois.length === 0 && (
//                 <div className="text-sm text-gray-500 mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100">Chưa có POI nào cho tour này.</div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* ----------------- MODALS ----------------- */}

//         {/* 1. Modal Thông tin Thiết bị */}
//         {showDeviceModal && (
//           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDeviceModal(false)}>
//             <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50" onClick={(e) => e.stopPropagation()}>
//               <div className="bg-gradient-to-br from-sky-400 to-blue-600 p-6 text-center relative">
//                 <button className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors" onClick={() => setShowDeviceModal(false)}>✕</button>
//                 <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl mb-3 shadow-inner">💻</div>
//                 <div className="text-xl font-bold text-white">Cấu hình thiết bị</div>
//               </div>
//               <div className="p-2 max-h-[50vh] overflow-y-auto">
//                 <div className="flex flex-col gap-1 p-4">
//                   {deviceInfo && Object.entries(deviceInfo).map(([key, value]) => (
//                     <div className="flex flex-col border-b border-gray-100 py-3 last:border-0" key={key}>
//                       <span className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">{key}</span>
//                       <span className="text-sm font-medium text-gray-700 break-words">{value as React.ReactNode}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div className="p-4 bg-gray-50/80 border-t border-gray-100">
//                 <button className="w-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all shadow-sm" onClick={() => setShowDeviceModal(false)}>
//                   Đóng chi tiết
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* 2. Modal Profile */}
//         {showProfileModal && (
//           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" onClick={() => setShowProfileModal(false)}>
//             <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/50" onClick={(e) => e.stopPropagation()}>
//               <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-center relative">
//                 <button className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 p-1.5 rounded-full" onClick={() => setShowProfileModal(false)}>✕</button>
//                 <div className="mx-auto w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl font-extrabold text-amber-600 mb-3 shadow-xl border-4 border-amber-200">
//                   {initials}
//                 </div>
//                 <div className="text-xl font-bold text-white">{profile?.name ?? displayName}</div>
//                 <div className="text-amber-100 text-sm font-medium">{profile?.email ?? 'Chưa có email'}</div>
//               </div>

//               <div className="p-6">
//                 <div className="flex flex-col gap-4">
//                   {[
//                     { label: 'Tên hiển thị', val: profile?.name ?? '—' },
//                     { label: 'Email', val: profile?.email ?? '—' },
//                     { label: 'Số điện thoại', val: profile?.phone ?? '—' },
//                     { label: 'Ngôn ngữ', val: profile?.language ?? language?.toUpperCase() ?? '—' },
//                   ].map((row) => (
//                     <div className="flex justify-between border-b border-gray-100 pb-3" key={row.label}>
//                       <span className="text-gray-500 text-sm">{row.label}</span>
//                       <span className="font-bold text-gray-800 text-sm">{row.val}</span>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-8 flex gap-3">
//                   {userToken && (
//                     <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-all shadow-sm border border-red-100" onClick={() => { setUserToken(undefined); setShowProfileModal(false) }}>
//                       Đăng xuất
//                     </button>
//                   )}
//                   <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all shadow-sm" onClick={() => setShowProfileModal(false)}>
//                     Đóng
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </AppShell>
//   )
// }


// import { useEffect, useMemo, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAppStore, type Language } from '../../shared/store/appStore'
// import { AppShell } from '../../shared/ui/AppShell'
// import { useT } from '../../shared/i18n/useT'
// import QRCode from '../../shared/ui/QRCode'
// import { getTourPois, getTours, type Tour, type TourPoi } from '../../api/services/tours'
// import { getUserProfile, type UserProfile } from '../../api/services/user'
// import { logTrackingEvent } from '../../api/services/trackingLogs'
// import type { I18nKey } from '../../shared/i18n/translations'

// export function ProfileTab() {
//   const nav = useNavigate()
//   const setTourCode = useAppStore((s) => s.setTourCode)
//   const showToast = useAppStore((s) => s.showToast)
//   const userToken = useAppStore((s) => s.userToken)
//   const setUserToken = useAppStore((s) => s.setUserToken)
//   const language = useAppStore((s) => s.language)
//   const setLanguage = useAppStore((s) => s.setLanguage)
//   const t = useT()

//   const [code, setCode] = useState('')
//   const [radius, setRadius] = useState(50000)
//   const [showQr, setShowQr] = useState(false)
//   const setRadiusMeters = useAppStore((s) => s.setRadiusMeters)
//   const [tours, setTours] = useState<Tour[]>([])
//   const [selectedTourId, setSelectedTourId] = useState<string>('')
//   const [tourPois, setTourPois] = useState<TourPoi[]>([])
//   const [isLoadingTours, setIsLoadingTours] = useState(false)
//   const [isLoadingTourPois, setIsLoadingTourPois] = useState(false)
//   const [profile, setProfile] = useState<UserProfile | undefined>(undefined)
//   const [isLoadingProfile, setIsLoadingProfile] = useState(false)
//   const [showProfileModal, setShowProfileModal] = useState(false)
//   const [showDeviceModal, setShowDeviceModal] = useState(false)

//   // Loading Ngôn ngữ
//   const [isLangLoading, setIsLangLoading] = useState(false)
//   const [langProgress, setLangProgress] = useState(0)

//   const canGeo = useMemo(() => 'geolocation' in navigator, [])

//   // Thu thập toàn bộ thông tin thiết bị
//   const deviceInfo = useMemo(() => {
//     if (typeof window === 'undefined') return null;
//     return {
//       userAgent: navigator.userAgent,
//       platform: navigator.platform || (navigator as any).userAgentData?.platform || t('profile.device.unknown' as I18nKey) || 'Không xác định',
//       vendor: navigator.vendor || t('profile.device.unknown' as I18nKey) || 'Không xác định',
//       language: navigator.language,
//       screen: `${window.screen.width} x ${window.screen.height}`,
//       cores: navigator.hardwareConcurrency || t('profile.device.unknown' as I18nKey) || 'Không xác định',
//       memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : t('profile.device.unknown' as I18nKey) || 'Không xác định',
//       connection: (navigator as any).connection ? (navigator as any).connection.effectiveType : t('profile.device.unknown' as I18nKey) || 'Không xác định',
//     }
//   }, [t])

//   // 1. Fetch Profile
//   useEffect(() => {
//     if (!userToken) return
//     setIsLoadingProfile(true)
//     getUserProfile()
//       .then((data) => setProfile(data))
//       .catch(() => setProfile(undefined))
//       .finally(() => setIsLoadingProfile(false))
//   }, [userToken])

//   // 2. Fetch Tours
//   useEffect(() => {
//     setIsLoadingTours(true)
//     getTours()
//       .then((items) => {
//         setTours(items || [])
//         if (items?.length) {
//           const first = items[0]
//           setSelectedTourId(first.id)
//           setCode(first.code ?? first.id)
//         }
//       })
//       .catch(() => showToast({ title: t('profile.toast.load_tour_error' as I18nKey) || 'Không tải được danh sách tour' }))
//       .finally(() => setIsLoadingTours(false))
//   }, [showToast, t])

//   // 3. Fetch POIs khi chọn Tour
//   useEffect(() => {
//     if (!selectedTourId) { setTourPois([]); return }
//     setIsLoadingTourPois(true)
//     getTourPois(selectedTourId)
//       .then((items) => setTourPois(items || []))
//       .catch(() => showToast({ title: t('profile.toast.load_poi_error' as I18nKey) || 'Không tải được POI trong tour' }))
//       .finally(() => setIsLoadingTourPois(false))
//     logTrackingEvent({ event: 'tour_select', tourId: selectedTourId }).catch(() => undefined)
//   }, [selectedTourId, showToast, t])

//   // 4. Hàm xin quyền vị trí
//   async function requestLocation() {
//     if (!canGeo) {
//       showToast({ title: t('tourist.start.noGpsTitle') || 'Lỗi', message: t('tourist.start.noGpsDesc') || 'Không hỗ trợ GPS' })
//       return
//     }
//     navigator.geolocation.getCurrentPosition(
//       () => {
//         showToast({ title: t('tourist.start.gpsOkTitle') || 'Thành công', message: t('tourist.start.gpsOkDesc') || 'Đã bật định vị' })
//         nav('/tourist/map')
//       },
//       () => showToast({ title: t('tourist.start.gpsDeniedTitle') || 'Từ chối', message: t('tourist.start.gpsDeniedDesc') || 'Vui lòng cấp quyền' }),
//       { enableHighAccuracy: true, timeout: 10_000 },
//     )
//   }

//   // 5. Hàm đổi ngôn ngữ (Có thanh loading ảo)
//   const handleLanguageChange = (newLang: string) => {
//     if (newLang === language) return;
//     setIsLangLoading(true);
//     setLangProgress(0);

//     let progress = 0;
//     const interval = setInterval(() => {
//       progress += Math.floor(Math.random() * 20) + 10;
//       if (progress >= 100) {
//         clearInterval(interval);
//         setLangProgress(100);
//         setTimeout(() => {
//         setLanguage(newLang as Language);
//         localStorage.setItem('language', newLang);
//         setIsLangLoading(false);
//         setLangProgress(0);
//         showToast({ title: t('profile.toast.lang_changed' as I18nKey) || 'Chuyển đổi ngôn ngữ thành công!' });
//       }, 300);
//       } else {
//         setLangProgress(progress);
//       }
//     }, 150);
//   }

//   // Xử lý tên hiển thị
//   const displayName = profile?.name || profile?.email || t('profile.guest' as I18nKey) || 'Khách'
//   const initials = displayName
//     .split(' ').filter(Boolean).slice(0, 2)
//     .map((p) => p[0]?.toUpperCase()).join('')

//   return (
//     <AppShell>
//       {/* Container cuộn chính */}
//       <div className="min-h-[100dvh] pb-28 bg-gradient-to-br from-orange-50 via-amber-100 to-sky-100 flex flex-col items-center py-0 px-0">
        
//         {/* Banner */}
//         <div className="w-full bg-gradient-to-r from-orange-200 via-amber-100 to-sky-100 py-8 px-4 md:px-0 flex flex-col items-center text-center shadow-md mb-6 relative overflow-hidden">
//           <div className="absolute top-0 right-0 w-40 h-40 bg-white/40 rounded-full blur-3xl -translate-y-10 translate-x-10"></div>
//           <div className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-2 z-10">{t('profile.banner.tag' as I18nKey) || 'Food Tour · Hồ Chí Minh'}</div>
//           <h1 className="text-3xl md:text-4xl font-extrabold text-amber-800 mb-2 leading-tight z-10">
//             {t('profile.banner.title1' as I18nKey) || 'Mỗi con hẻm'}<br />
//             <span className="text-sky-600 italic">{t('profile.banner.title2' as I18nKey) || 'là một câu chuyện'}</span>
//           </h1>
//           <p className="text-base md:text-lg text-gray-600 max-w-xl mx-auto mb-4 z-10">
//             {t('tourist.start.subtitle') || 'Đi một vòng, nghe một câu chuyện, khám phá một hương vị.'}
//           </p>
//           <div className="flex flex-wrap gap-3 justify-center z-10">
//             <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2.5 px-6 rounded-full shadow-lg shadow-amber-500/30 transition-all hover:-translate-y-0.5" onClick={requestLocation}>
//               📍 {t('tourist.start.requestLocation') || 'Cấp quyền vị trí'}
//             </button>
//             <button className="bg-white/80 backdrop-blur-md hover:bg-sky-50 text-sky-700 font-bold py-2.5 px-6 rounded-full border border-sky-200 shadow transition-all hover:-translate-y-0.5" onClick={() => nav('/tourist/map')}>
//               {t('tourist.start.openMap') || 'Mở Map'}
//             </button>
//           </div>
//         </div>

//         {/* Main content grid */}
//         <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 px-4 md:px-6">
          
//           {/* Left Column */}
//           <div className="flex flex-col gap-6">
            
//             {/* Profile Card */}
//             <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col gap-3">
//               <div className="flex items-center gap-4 mb-2">
//                 <button className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-200 via-orange-100 to-sky-100 text-2xl font-extrabold text-amber-700 flex items-center justify-center border-2 border-amber-300 shadow" onClick={() => setShowProfileModal(true)} type="button">
//                   {isLoadingProfile ? '…' : initials}
//                 </button>
//                 <div>
//                   <div className="font-bold text-lg text-amber-800">{isLoadingProfile ? (t('profile.loading' as I18nKey) || 'Đang tải…') : displayName}</div>
//                   <div className="text-gray-500 text-sm">{profile?.email ?? (t('profile.not_logged_in' as I18nKey) || 'Chưa đăng nhập')}</div>
//                 </div>
//               </div>
//               <div className="flex gap-2 flex-wrap mt-2">
//                 <button className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-all shadow-sm" onClick={() => setShowProfileModal(true)}>
//                   {t('profile.view_profile' as I18nKey) || 'Xem hồ sơ'}
//                 </button>
//                 {profile?.language && <span className="bg-sky-100 text-sky-700 px-4 py-2.5 rounded-xl text-sm font-semibold border border-sky-200 flex items-center">{profile.language}</span>}
//               </div>
//             </div>

//             {/* Language & App Info */}
//             <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col gap-5 relative overflow-hidden">
              
//               {isLangLoading && (
//                 <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
//                   <div className="h-full bg-amber-500 transition-all duration-150 ease-linear" style={{ width: `${langProgress}%` }}></div>
//                 </div>
//               )}

//               {/* Ngôn ngữ */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <span className="text-xl">🌐</span>
//                   <span className="font-bold text-amber-800">{t('profile.language_setting' as I18nKey) || 'Ngôn ngữ'}</span>
//                 </div>
//                 <select
//                   className="bg-white border border-amber-200 rounded-xl px-4 py-2 text-sm text-amber-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm disabled:opacity-50"
//                   value={language || 'vi'}
//                   onChange={(e) => handleLanguageChange(e.target.value)}
//                   disabled={isLangLoading}
//                 >
//                   <option value="vi">Tiếng Việt</option>
//                   <option value="en">English</option>
//                   <option value="ja">日本語</option>
//                   <option value="ko">한국어</option>
//                   <option value="zh">中文</option>
//                   <option value="fr">Français</option>
//                 </select>
//               </div>

//               <hr className="border-gray-200/60" />

//               {/* Phiên bản */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <span className="text-xl">ℹ️</span>
//                   <span className="font-bold text-amber-800">{t('profile.app_version' as I18nKey) || 'Phiên bản ứng dụng'}</span>
//                 </div>
//                 <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">v1.2.0 (Beta)</span>
//               </div>

//               <hr className="border-gray-200/60" />

//               {/* Thiết bị */}
//               <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-3">
//                   <span className="text-xl">💻</span>
//                   <span className="font-bold text-amber-800">{t('profile.device_info' as I18nKey) || 'Thông tin thiết bị'}</span>
//                 </div>
//                 <button
//                   onClick={() => setShowDeviceModal(true)}
//                   className="text-sky-600 font-bold text-sm bg-sky-50 px-3 py-1.5 rounded-lg hover:bg-sky-100 transition-colors"
//                 >
//                   {t('profile.view_details' as I18nKey) || 'Xem chi tiết'}
//                 </button>
//               </div>
//             </div>

//             {/* Merchant Ads */}
//             <div className="rounded-3xl bg-gradient-to-br from-sky-100 via-orange-50 to-amber-100 border border-white/60 shadow-lg p-6 flex flex-col gap-2 items-center text-center relative overflow-hidden">
//               <div className="absolute -right-6 -bottom-6 text-9xl opacity-10">🏬</div>
//               <div className="z-10 flex flex-col items-center">
//                 <div className="text-2xl font-extrabold text-sky-800 mb-1">{t('profile.ads.title' as I18nKey) || '🎉 Ưu đãi đối tác'}</div>
//                 <div className="text-gray-600 text-sm mb-4">{t('profile.ads.desc' as I18nKey) || 'Đưa quán ăn của bạn lên bản đồ Food Tour, tiếp cận hàng ngàn khách du lịch mỗi ngày!'}</div>
//                 <button className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-sky-500/30 transition-all">{t('profile.ads.register' as I18nKey) || 'Đăng ký ngay'}</button>
//               </div>
//             </div>
//           </div>

//           {/* Right Column */}
//           <div className="flex flex-col gap-6">
            
//             {/* Radius Setting */}
//             <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col gap-3">
//               <div className="font-bold text-amber-800 text-lg flex items-center gap-2"><span className="text-xl">🎯</span> {t('profile.radius.title' as I18nKey) || 'Bán kính kích hoạt (m)'}</div>
//               <label className="text-xs text-gray-500">{t('profile.radius.desc' as I18nKey) || 'Khoảng cách quét địa điểm tự động (Dữ liệu đang test nên để lớn: 50.000m)'}</label>
//               <div className="flex gap-2 mt-1">
//                 <input
//                   type="number"
//                   className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-gray-700"
//                   min={20} max={300}
//                   value={radius}
//                   onChange={(e) => setRadius(Number(e.target.value))}
//                 />
//                 <button
//                   className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-5 rounded-xl shadow transition-all"
//                   onClick={() => { setRadiusMeters(radius); showToast({ title: t('tourist.start.radiusSet', { radius }) || `Đã lưu bán kính ${radius}m` }); }}
//                 >
//                   {t('profile.radius.apply' as I18nKey) || 'Áp dụng'}
//                 </button>
//               </div>
//             </div>

//             {/* QR & Tour Code */}
//             <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col gap-3 flex-1">
//               <div className="font-bold text-amber-800 text-lg flex items-center gap-2 mb-1"><span className="text-xl">🗺️</span> {t('profile.tour.config_title' as I18nKey) || 'Cấu hình Tour & Mã QR'}</div>
              
//               {isLoadingTours ? (
//                  <div className="text-sm text-gray-500 mb-2 animate-pulse">{t('profile.tour.loading_list' as I18nKey) || 'Đang tải danh sách tour...'}</div>
//               ) : (
//                 <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 mb-1 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-gray-700" value={selectedTourId} onChange={(e) => { const nextId = e.target.value; setSelectedTourId(nextId); const matched = tours.find((item) => item.id === nextId); if (matched) setCode(matched.code ?? matched.id); }}>
//                   <option value="">{t('profile.tour.select_prompt' as I18nKey) || 'Chọn tour để tham gia…'}</option>
//                   {tours.map((tour) => (<option key={tour.id} value={tour.id}>{tour.name ?? tour.code ?? tour.id}</option>))}
//                 </select>
//               )}
              
//               <input className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 mb-2 focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('tourist.start.example' as I18nKey) || 'Nhập mã tour chia sẻ…'} />
              
//               <div className="flex gap-3 mb-2">
//                 <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex-1" onClick={() => { setTourCode(code.trim() || undefined); showToast({ title: t('tourist.start.tourSavedTitle' as I18nKey) || 'Đã lưu tour', message: t('profile.tour.can_start' as I18nKey) || 'Bạn có thể bắt đầu hành trình' }); logTrackingEvent({ event: 'tour_save', tourId: selectedTourId, meta: { code: code.trim() } }).catch(() => undefined); }}>
//                   {t('profile.tour.save' as I18nKey) || 'Lưu Tour'}
//                 </button>
//                 <button className="bg-white/80 hover:bg-sky-50 text-sky-700 font-bold py-3 px-4 rounded-xl border border-sky-200 shadow-sm transition-all flex-1 flex items-center justify-center gap-2" onClick={() => setShowQr((s) => !s)}>
//                   {showQr ? (t('profile.tour.hide_qr' as I18nKey) || '✕ Ẩn QR') : (t('profile.tour.scan_qr' as I18nKey) || '📷 Quét / Tạo QR')}
//                 </button>
//               </div>

//               {showQr && code.trim() && (
//                 <div className="flex justify-center p-5 bg-white rounded-2xl border border-gray-100 my-2 shadow-inner animate-in fade-in zoom-in duration-200">
//                   <QRCode value={code.trim()} size={180} />
//                 </div>
//               )}

//               {(isLoadingTourPois || tourPois.length > 0) && <hr className="my-3 border-gray-200/60" />}
              
//               {isLoadingTourPois && <div className="text-sm text-gray-500 flex items-center gap-2">⏳ {t('profile.tour.loading_poi' as I18nKey) || 'Đang tải danh sách địa điểm...'}</div>}
//               {!isLoadingTourPois && tourPois.length > 0 && (
//                 <div className="flex flex-col gap-2 overflow-y-auto pr-1" style={{ maxHeight: '250px' }}>
//                   {tourPois.map((poi) => (
//                     <div className="flex justify-between items-center p-3 bg-white/60 hover:bg-white border border-white rounded-xl shadow-sm transition-colors" key={poi.id}>
//                       <span className="font-bold text-sm text-gray-800">{poi.name ?? poi.id}</span>
//                       <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md font-bold">{t('profile.tour.order' as I18nKey) || 'Thứ tự #'}{poi.order ?? '-'}</span>
//                     </div>
//                   ))}
//                 </div>
//               )}
//               {!isLoadingTourPois && selectedTourId && tourPois.length === 0 && (
//                 <div className="text-sm text-gray-500 mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100">{t('profile.tour.no_poi' as I18nKey) || 'Chưa có POI nào cho tour này.'}</div>
//               )}
//             </div>
//           </div>
//         </div>

//         {/* ----------------- MODALS ----------------- */}

//         {/* 1. Modal Thông tin Thiết bị */}
//         {showDeviceModal && (
//           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDeviceModal(false)}>
//             <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50" onClick={(e) => e.stopPropagation()}>
//               <div className="bg-gradient-to-br from-sky-400 to-blue-600 p-6 text-center relative">
//                 <button className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors" onClick={() => setShowDeviceModal(false)}>✕</button>
//                 <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl mb-3 shadow-inner">💻</div>
//                 <div className="text-xl font-bold text-white">{t('profile.device.title' as I18nKey) || 'Cấu hình thiết bị'}</div>
//               </div>
//               <div className="p-2 max-h-[50vh] overflow-y-auto">
//                 <div className="flex flex-col gap-1 p-4">
//                   {deviceInfo && Object.entries(deviceInfo).map(([key, value]) => (
//                     <div className="flex flex-col border-b border-gray-100 py-3 last:border-0" key={key}>
//                       <span className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">{t(`profile.device.${key}` as I18nKey) || key}</span>
//                       <span className="text-sm font-medium text-gray-700 break-words">{value as React.ReactNode}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//               <div className="p-4 bg-gray-50/80 border-t border-gray-100">
//                 <button className="w-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all shadow-sm" onClick={() => setShowDeviceModal(false)}>
//                   {t('profile.device.close' as I18nKey) || 'Đóng chi tiết'}
//                 </button>
//               </div>
//             </div>
//           </div>
//         )}

//         {/* 2. Modal Profile */}
//         {showProfileModal && (
//           <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" onClick={() => setShowProfileModal(false)}>
//             <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/50" onClick={(e) => e.stopPropagation()}>
//               <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-center relative">
//                 <button className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 p-1.5 rounded-full" onClick={() => setShowProfileModal(false)}>✕</button>
//                 <div className="mx-auto w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl font-extrabold text-amber-600 mb-3 shadow-xl border-4 border-amber-200">
//                   {initials}
//                 </div>
//                 <div className="text-xl font-bold text-white">{profile?.name ?? displayName}</div>
//                 <div className="text-amber-100 text-sm font-medium">{profile?.email ?? (t('profile.modal.no_email' as I18nKey) || 'Chưa có email')}</div>
//               </div>

//               <div className="p-6">
//                 <div className="flex flex-col gap-4">
//                   {[
//                     { label: t('profile.modal.display_name' as I18nKey) || 'Tên hiển thị', val: profile?.name ?? '—' },
//                     { label: t('profile.modal.email' as I18nKey) || 'Email', val: profile?.email ?? '—' },
//                     { label: t('profile.modal.phone' as I18nKey) || 'Số điện thoại', val: profile?.phone ?? '—' },
//                     { label: t('profile.modal.lang' as I18nKey) || 'Ngôn ngữ', val: profile?.language ?? language?.toUpperCase() ?? '—' },
//                   ].map((row) => (
//                     <div className="flex justify-between border-b border-gray-100 pb-3" key={row.label}>
//                       <span className="text-gray-500 text-sm">{row.label}</span>
//                       <span className="font-bold text-gray-800 text-sm">{row.val}</span>
//                     </div>
//                   ))}
//                 </div>

//                 <div className="mt-8 flex gap-3">
//                   {userToken && (
//                     <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-all shadow-sm border border-red-100" onClick={() => { setUserToken(undefined); setShowProfileModal(false) }}>
//                       {t('profile.modal.logout' as I18nKey) || 'Đăng xuất'}
//                     </button>
//                   )}
//                   <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all shadow-sm" onClick={() => setShowProfileModal(false)}>
//                     {t('common.close' as I18nKey) || 'Đóng'}
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </div>
//         )}

//       </div>
//     </AppShell>
//   )
// }



import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next' // IMPORT CỦA i18next

import { useAppStore, type Language } from '../../shared/store/appStore'
import { AppShell } from '../../shared/ui/AppShell'
import QRCode from '../../shared/ui/QRCode'
import { getTourPois, getTours, type Tour, type TourPoi } from '../../api/services/tours'
import { getUserProfile, type UserProfile } from '../../api/services/user'
import { logTrackingEvent } from '../../api/services/trackingLogs'
import  i18n  from '../../shared/i18n/i18n' 

export function ProfileTab() {
  const nav = useNavigate()
  
  // SỬ DỤNG HOOK CỦA i18next
  const { t,  } = useTranslation() 

  const setTourCode = useAppStore((s) => s.setTourCode)
  const showToast = useAppStore((s) => s.showToast)
  const userToken = useAppStore((s) => s.userToken)
  const setUserToken = useAppStore((s) => s.setUserToken)
  const language = useAppStore((s) => s.language)
  const setLanguage = useAppStore((s) => s.setLanguage)

  const [code, setCode] = useState('')
  const [radius, setRadius] = useState(50000)
  const [showQr, setShowQr] = useState(false)
  const setRadiusMeters = useAppStore((s) => s.setRadiusMeters)
  const [tours, setTours] = useState<Tour[]>([])
  const [selectedTourId, setSelectedTourId] = useState<string>('')
  const [tourPois, setTourPois] = useState<TourPoi[]>([])
  const [isLoadingTours, setIsLoadingTours] = useState(false)
  const [isLoadingTourPois, setIsLoadingTourPois] = useState(false)
  const [profile, setProfile] = useState<UserProfile | undefined>(undefined)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)
  const [showDeviceModal, setShowDeviceModal] = useState(false)

  const [isLangLoading, setIsLangLoading] = useState(false)
  const [langProgress, setLangProgress] = useState(0)

  const canGeo = useMemo(() => 'geolocation' in navigator, [])

  const deviceInfo = useMemo(() => {
    if (typeof window === 'undefined') return null;
    return {
      userAgent: navigator.userAgent,
      platform: navigator.platform || (navigator as any).userAgentData?.platform || t('profile.device.unknown', 'Không xác định'),
      vendor: navigator.vendor || t('profile.device.unknown', 'Không xác định'),
      language: navigator.language,
      screen: `${window.screen.width} x ${window.screen.height}`,
      cores: navigator.hardwareConcurrency || t('profile.device.unknown', 'Không xác định'),
      memory: (navigator as any).deviceMemory ? `${(navigator as any).deviceMemory} GB` : t('profile.device.unknown', 'Không xác định'),
      connection: (navigator as any).connection ? (navigator as any).connection.effectiveType : t('profile.device.unknown', 'Không xác định'),
    }
  }, [t])

  useEffect(() => {
    if (!userToken) return
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
        setTours(items || [])
        if (items?.length) {
          const first = items[0]
          setSelectedTourId(first.id)
          setCode(first.code ?? first.id)
        }
      })
      .catch(() => showToast({ title: t('profile.toast.load_tour_error', 'Không tải được danh sách tour') }))
      .finally(() => setIsLoadingTours(false))
  }, [showToast, t])

  useEffect(() => {
    if (!selectedTourId) { setTourPois([]); return }
    setIsLoadingTourPois(true)
    getTourPois(selectedTourId)
      .then((items) => setTourPois(items || []))
      .catch(() => showToast({ title: t('profile.toast.load_poi_error', 'Không tải được POI trong tour') }))
      .finally(() => setIsLoadingTourPois(false))
    logTrackingEvent({ event: 'tour_select', tourId: selectedTourId }).catch(() => undefined)
  }, [selectedTourId, showToast, t])

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

  // --- HÀM CHANGE LANGUAGE ĐÃ SỬA CỦA I18NEXT ---
  const handleLanguageChange = (newLang: string) => {
    if (newLang === language) return;
    setIsLangLoading(true);
    setLangProgress(0);

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 20) + 10;
      if (progress >= 100) {
        clearInterval(interval);
        setLangProgress(100);
        setTimeout(() => {
          // Gọi hàm của i18next để đổi text trên UI ngay lập tức
          i18n.changeLanguage(newLang);
          
          // Cập nhật state Global để gọi Audio/API khác
          setLanguage(newLang as Language);
          localStorage.setItem('i18nextLng', newLang); // chuẩn của i18next
          
          setIsLangLoading(false);
          setLangProgress(0);
          showToast({ title: t('profile.toast.lang_changed', 'Chuyển đổi ngôn ngữ thành công!') });
        }, 300);
      } else {
        setLangProgress(progress);
      }
    }, 150);
  }

  const displayName = profile?.name || profile?.email || t('profile.guest', 'Khách')
  const initials = displayName.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')

  return (
    <AppShell>
      <div className="min-h-[100dvh] pb-28 bg-gradient-to-br from-orange-50 via-amber-100 to-sky-100 flex flex-col items-center py-0 px-0">
        
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
                {/* Ở đây bạn lấy ngôn ngữ hiển thị từ i18n */}
                {i18n.language && <span className="bg-sky-100 text-sky-700 px-4 py-2.5 rounded-xl text-sm font-semibold border border-sky-200 flex items-center uppercase">{i18n.language}</span>}
              </div>
            </div>

            {/* Language & App Info */}
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col gap-5 relative overflow-hidden">
              
              {isLangLoading && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-100">
                  <div className="h-full bg-amber-500 transition-all duration-150 ease-linear" style={{ width: `${langProgress}%` }}></div>
                </div>
              )}

              {/* Ngôn ngữ */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">🌐</span>
                  <span className="font-bold text-amber-800">{t('profile.language_setting', 'Ngôn ngữ')}</span>
                </div>
                <select 
                  className="bg-white border border-amber-200 rounded-xl px-4 py-2 text-sm text-amber-800 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-sm disabled:opacity-50" 
                  value={i18n.language || 'vi-VN'}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  disabled={isLangLoading}
                >
                  <option value="vi-VN">Tiếng Việt</option>
                  <option value="en-US">English</option>
                  <option value="ja-JP">日本語</option>
                  <option value="ko-KR">한국어</option>
                  <option value="zh-Hans-CN">中文</option>
                </select>
              </div>

              <hr className="border-gray-200/60" />

              {/* Phiên bản */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xl">ℹ️</span>
                  <span className="font-bold text-amber-800">{t('profile.app_version', 'Phiên bản ứng dụng')}</span>
                </div>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">v1.2.0 (Beta)</span>
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

            {/* Merchant Ads */}
            <div className="rounded-3xl bg-gradient-to-br from-sky-100 via-orange-50 to-amber-100 border border-white/60 shadow-lg p-6 flex flex-col gap-2 items-center text-center relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 text-9xl opacity-10">🏬</div>
              <div className="z-10 flex flex-col items-center">
                <div className="text-2xl font-extrabold text-sky-800 mb-1">{t('profile.ads.title', '🎉 Ưu đãi đối tác')}</div>
                <div className="text-gray-600 text-sm mb-4">{t('profile.ads.desc', 'Đưa quán ăn của bạn lên bản đồ Food Tour, tiếp cận hàng ngàn khách du lịch mỗi ngày!')}</div>
                <button className="bg-sky-500 hover:bg-sky-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-sky-500/30 transition-all">{t('profile.ads.register', 'Đăng ký ngay')}</button>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="flex flex-col gap-6">
            
            {/* Radius Setting */}
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col gap-3">
              <div className="font-bold text-amber-800 text-lg flex items-center gap-2"><span className="text-xl">🎯</span> {t('profile.radius.title', 'Bán kính kích hoạt (m)')}</div>
              <label className="text-xs text-gray-500">{t('profile.radius.desc', 'Khoảng cách quét địa điểm tự động')}</label>
              <div className="flex gap-2 mt-1">
                <input 
                  type="number" 
                  className="flex-1 bg-white border border-gray-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-gray-700" 
                  min={20} max={300} 
                  value={radius} 
                  onChange={(e) => setRadius(Number(e.target.value))} 
                />
                <button 
                  className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-2 px-5 rounded-xl shadow transition-all" 
                  onClick={() => {
                  setRadiusMeters(radius);
                  showToast({
                    title: t('tourist.start.radiusSet', `Đã lưu bán kính ${radius}m`, { radius })
                  });
                }}
                >
                  {t('profile.radius.apply', 'Áp dụng')}
                </button>
              </div>
            </div>

            {/* QR & Tour Code */}
            <div className="rounded-3xl bg-white/70 backdrop-blur-xl border border-white/60 shadow-lg p-6 flex flex-col gap-3 flex-1">
              <div className="font-bold text-amber-800 text-lg flex items-center gap-2 mb-1"><span className="text-xl">🗺️</span> {t('profile.tour.config_title', 'Cấu hình Tour & Mã QR')}</div>
              
              {isLoadingTours ? (
                 <div className="text-sm text-gray-500 mb-2 animate-pulse">{t('profile.tour.loading_list', 'Đang tải danh sách tour...')}</div>
              ) : (
                <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 mb-1 focus:outline-none focus:ring-2 focus:ring-amber-500 font-medium text-gray-700" value={selectedTourId} onChange={(e) => { const nextId = e.target.value; setSelectedTourId(nextId); const matched = tours.find((item) => item.id === nextId); if (matched) setCode(matched.code ?? matched.id); }}>
                  <option value="">{t('profile.tour.select_prompt', 'Chọn tour để tham gia…')}</option>
                  {tours.map((tour) => (<option key={tour.id} value={tour.id}>{tour.name ?? tour.code ?? tour.id}</option>))}
                </select>
              )}
              
              <input className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 mb-2 focus:outline-none focus:ring-2 focus:ring-amber-500 text-gray-700" value={code} onChange={(e) => setCode(e.target.value)} placeholder={t('tourist.start.example', 'Nhập mã tour chia sẻ…')} />
              
              <div className="flex gap-3 mb-2">
                <button className="bg-amber-500 hover:bg-amber-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-all flex-1" onClick={() => { setTourCode(code.trim() || undefined); showToast({ title: t('tourist.start.tourSavedTitle', 'Đã lưu tour'), message: t('profile.tour.can_start', 'Bạn có thể bắt đầu hành trình') }); logTrackingEvent({ event: 'tour_save', tourId: selectedTourId, meta: { code: code.trim() } }).catch(() => undefined); }}>
                  {t('profile.tour.save', 'Lưu Tour')}
                </button>
                <button className="bg-white/80 hover:bg-sky-50 text-sky-700 font-bold py-3 px-4 rounded-xl border border-sky-200 shadow-sm transition-all flex-1 flex items-center justify-center gap-2" onClick={() => setShowQr((s) => !s)}>
                  {showQr ? t('profile.tour.hide_qr', '✕ Ẩn QR') : t('profile.tour.scan_qr', '📷 Quét / Tạo QR')}
                </button>
              </div>

              {showQr && code.trim() && (
                <div className="flex justify-center p-5 bg-white rounded-2xl border border-gray-100 my-2 shadow-inner animate-in fade-in zoom-in duration-200">
                  <QRCode value={code.trim()} size={180} />
                </div>
              )}

              {(isLoadingTourPois || tourPois.length > 0) && <hr className="my-3 border-gray-200/60" />}
              
              {isLoadingTourPois && <div className="text-sm text-gray-500 flex items-center gap-2">⏳ {t('profile.tour.loading_poi', 'Đang tải danh sách địa điểm...')}</div>}
              {!isLoadingTourPois && tourPois.length > 0 && (
                <div className="flex flex-col gap-2 overflow-y-auto pr-1" style={{ maxHeight: '250px' }}>
                  {tourPois.map((poi) => (
                    <div className="flex justify-between items-center p-3 bg-white/60 hover:bg-white border border-white rounded-xl shadow-sm transition-colors" key={poi.id}>
                      <span className="font-bold text-sm text-gray-800">{poi.name ?? poi.id}</span>
                      <span className="text-xs bg-amber-100 text-amber-800 px-2.5 py-1 rounded-md font-bold">{t('profile.tour.order', 'Thứ tự #')}{poi.order ?? '-'}</span>
                    </div>
                  ))}
                </div>
              )}
              {!isLoadingTourPois && selectedTourId && tourPois.length === 0 && (
                <div className="text-sm text-gray-500 mt-2 bg-gray-50 p-3 rounded-xl border border-gray-100">{t('profile.tour.no_poi', 'Chưa có POI nào cho tour này.')}</div>
              )}
            </div>
          </div>
        </div>

        {/* ----------------- MODALS ----------------- */}

        {/* 1. Modal Thông tin Thiết bị */}
        {showDeviceModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowDeviceModal(false)}>
            <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-white/50" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-br from-sky-400 to-blue-600 p-6 text-center relative">
                <button className="absolute top-4 right-4 text-white/70 hover:text-white bg-black/10 hover:bg-black/20 p-2 rounded-full transition-colors" onClick={() => setShowDeviceModal(false)}>✕</button>
                <div className="mx-auto w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-3xl mb-3 shadow-inner">💻</div>
                <div className="text-xl font-bold text-white">{t('profile.device.title', 'Cấu hình thiết bị')}</div>
              </div>
              <div className="p-2 max-h-[50vh] overflow-y-auto">
                <div className="flex flex-col gap-1 p-4">
                  {deviceInfo && Object.entries(deviceInfo).map(([key, value]) => (
                    <div className="flex flex-col border-b border-gray-100 py-3 last:border-0" key={key}>
                      <span className="text-xs font-bold text-sky-600 uppercase tracking-wider mb-1">{key}</span>
                      <span className="text-sm font-medium text-gray-700 break-words">{value as React.ReactNode}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="p-4 bg-gray-50/80 border-t border-gray-100">
                <button className="w-full bg-white hover:bg-gray-100 border border-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all shadow-sm" onClick={() => setShowDeviceModal(false)}>
                  {t('profile.device.close', 'Đóng chi tiết')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. Modal Profile */}
        {showProfileModal && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" role="dialog" aria-modal="true" onClick={() => setShowProfileModal(false)}>
            <div className="bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden border border-white/50" onClick={(e) => e.stopPropagation()}>
              <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-6 text-center relative">
                <button className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/10 p-1.5 rounded-full" onClick={() => setShowProfileModal(false)}>✕</button>
                <div className="mx-auto w-20 h-20 rounded-full bg-white flex items-center justify-center text-3xl font-extrabold text-amber-600 mb-3 shadow-xl border-4 border-amber-200">
                  {initials}
                </div>
                <div className="text-xl font-bold text-white">{profile?.name ?? displayName}</div>
                <div className="text-amber-100 text-sm font-medium">{profile?.email ?? t('profile.modal.no_email', 'Chưa có email')}</div>
              </div>

              <div className="p-6">
                <div className="flex flex-col gap-4">
                  {[
                    { label: t('profile.modal.display_name', 'Tên hiển thị'), val: profile?.name ?? '—' },
                    { label: t('profile.modal.email', 'Email'), val: profile?.email ?? '—' },
                    { label: t('profile.modal.phone', 'Số điện thoại'), val: profile?.phone ?? '—' },
                    { label: t('profile.modal.lang', 'Ngôn ngữ'), val: profile?.language ?? i18n.language?.toUpperCase() ?? '—' },
                  ].map((row) => (
                    <div className="flex justify-between border-b border-gray-100 pb-3" key={row.label}>
                      <span className="text-gray-500 text-sm">{row.label}</span>
                      <span className="font-bold text-gray-800 text-sm">{row.val}</span>
                    </div>
                  ))}
                </div>

                <div className="mt-8 flex gap-3">
                  {userToken && (
                    <button className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 rounded-xl transition-all shadow-sm border border-red-100" onClick={() => { setUserToken(undefined); setShowProfileModal(false) }}>
                      {t('profile.modal.logout', 'Đăng xuất')}
                    </button>
                  )}
                  <button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold py-3 rounded-xl transition-all shadow-sm" onClick={() => setShowProfileModal(false)}>
                    {t('common.close', 'Đóng')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppShell>
  )
}