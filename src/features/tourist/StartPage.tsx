// import { useEffect, useMemo, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAppStore } from '../../shared/store/appStore'
// import { AppShell } from '../../shared/ui/AppShell'
// import { useT } from '../../shared/i18n/useT'
// import QRCode from '../../shared/ui/QRCode'
// import { getTourPois, getTours, type Tour, type TourPoi } from '../../api/services/tours'
// import { getUserProfile, type UserProfile } from '../../api/services/user'
// import { logTrackingEvent } from '../../api/services/trackingLogs'

// export function StartPage() {
//   const nav = useNavigate()
//   const setTourCode = useAppStore((s) => s.setTourCode)
//   const showToast = useAppStore((s) => s.showToast)
//   const userToken = useAppStore((s) => s.userToken)
//   const setUserToken = useAppStore((s) => s.setUserToken)
//   const t = useT()

//   const [code, setCode] = useState('')
//   const [radius, setRadius] = useState(80)
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

//   const canGeo = useMemo(() => 'geolocation' in navigator, [])

//   useEffect(() => {
//     if (!userToken) return
//     setIsLoadingProfile(true)
//     getUserProfile()
//       .then((data) => setProfile(data))
//       .catch(() => setProfile(undefined))
//       .finally(() => setIsLoadingProfile(false))
//   }, [userToken])

//   useEffect(() => {
//     setIsLoadingTours(true)
//     getTours()
//       .then((items) => {
//         setTours(items || [])
//         if (items?.length) {
//           const first = items[0]
//           const nextId = first.id
//           setSelectedTourId(nextId)
//           setCode(first.code ?? first.id)
//         }
//       })
//       .catch(() => showToast({ title: 'Không tải được danh sách tour' }))
//       .finally(() => setIsLoadingTours(false))
//   }, [showToast])

//   useEffect(() => {
//     if (!selectedTourId) {
//       setTourPois([])
//       return
//     }
//     setIsLoadingTourPois(true)
//     getTourPois(selectedTourId)
//       .then((items) => setTourPois(items || []))
//       .catch(() => showToast({ title: 'Không tải được POI trong tour' }))
//       .finally(() => setIsLoadingTourPois(false))
//     logTrackingEvent({ event: 'tour_select', tourId: selectedTourId }).catch(() => undefined)
//   }, [selectedTourId, showToast])

//   async function requestLocation() {
//     if (!canGeo) {
//       showToast({ title: t('tourist.start.noGpsTitle'), message: t('tourist.start.noGpsDesc') })
//       return
//     }

//     // trigger permission prompt
//     navigator.geolocation.getCurrentPosition(
//       () => {
//         showToast({ title: t('tourist.start.gpsOkTitle'), message: t('tourist.start.gpsOkDesc') })
//         nav('/tourist/map')
//       },
//       () => {
//         showToast({ title: t('tourist.start.gpsDeniedTitle'), message: t('tourist.start.gpsDeniedDesc') })
//       },
//       { enableHighAccuracy: true, timeout: 10_000 },
//     )
//   }

//   const displayName = profile?.name || profile?.email || 'Nguoi dung'
//   const initials = displayName
//     .split(' ')
//     .filter(Boolean)
//     .slice(0, 2)
//     .map((part) => part[0]?.toUpperCase())
//     .join('')

//   return (
//     <AppShell>
//       <div className="stack">
//         <div className="startHeroGrid">
//           <section className="hero">
//             <div className="heroTitle">{t('tourist.start.title')}</div>
//             <div className="heroSub">{t('tourist.start.subtitle') || 'Đi một vòng, nghe một câu chuyện, khám phá một hương vị.'}</div>
//             <div className="heroActions">
//               <button className="btn btnPrimary" onClick={requestLocation}>
//                 {t('tourist.start.requestLocation')}
//               </button>
//               <button className="btn" onClick={() => nav('/tourist/map')}>
//                 {t('tourist.start.openMap')}
//               </button>
//               <span className="badge">{t('tourist.start.pwaPill')}</span>
//             </div>
//           </section>

//           <div className="card cardPad profileCard">
//             <div className="profileHeader">
//               <button
//                 className="profileAvatar"
//                 onClick={() => setShowProfileModal(true)}
//                 aria-label="Mở hồ sơ"
//                 type="button"
//               >
//                 {isLoadingProfile ? '...' : initials}
//               </button>
//               <div className="profileInfo">
//                 <div className="profileName">{isLoadingProfile ? 'Đang tải...' : displayName}</div>
//                 <div className="profileSub">{profile?.email ?? 'Chưa có email'}</div>
//               </div>
//             </div>
//             <div className="profileActions">
//               <button className="btn btnPrimary" onClick={() => setShowProfileModal(true)}>
//                 Xem ho so
//               </button>
//               {profile?.language && <span className="pill">{profile.language}</span>}
//             </div>
//           </div>
//         </div>

//         <div className="panelGrid">
//           <div className="card cardPad">
//             <div className="sectionTitle">Tour của tôi</div>
//             <div className="sectionSub">Tạo và quản lý tour cá nhân.</div>
//             <div style={{ height: 10 }} />
//             <div className="row" style={{ flexWrap: 'wrap' }}>
//               <button className="btn btnPrimary" onClick={() => nav('/tourist/tours')}>
//                 Quản lý tour
//               </button>
//               <button className="btn" onClick={() => nav('/tourist/tours?tab=saved')}>
//                 Tour đã lưu
//               </button>
//             </div>
//           </div>
//           <div className="card cardPad">
//             <div className="sectionTitle">{t('tourist.start.tourCode')}</div>
//             <div className="sectionSub">Chọn tour va tao ma QR cho nhom.</div>
//             <div style={{ height: 10 }} />
//             <select
//               className="select"
//               value={selectedTourId}
//               onChange={(e) => {
//                 const nextId = e.target.value
//                 setSelectedTourId(nextId)
//                 const matched = tours.find((item) => item.id === nextId)
//                 if (matched) setCode(matched.code ?? matched.id)
//               }}
//             >
//               <option value="">Chon tour</option>
//               {tours.map((tour) => (
//                 <option key={tour.id} value={tour.id}>
//                   {tour.name ?? tour.code ?? tour.id}
//                 </option>
//               ))}
//             </select>
//             {isLoadingTours && (
//               <div className="sectionSub" style={{ marginTop: 8 }}>Đang tải tour...</div>
//             )}
//             <input
//               className="input"
//               value={code}
//               onChange={(e) => setCode(e.target.value)}
//               placeholder={t('tourist.start.example')}
//               style={{ marginTop: 10 }}
//             />
//             <div className="row" style={{ marginTop: 10, flexWrap: 'wrap' }}>
//               <button
//                 className="btn btnPrimary"
//                 onClick={() => {
//                   setTourCode(code.trim() || undefined)
//                   showToast({ title: t('tourist.start.tourSavedTitle'), message: t('tourist.start.tourSavedDesc') })
//                   logTrackingEvent({ event: 'tour_save', tourId: selectedTourId, meta: { code: code.trim() } }).catch(
//                     () => undefined,
//                   )
//                 }}
//               >
//                 {t('tourist.start.saveTour')}
//               </button>
//               <button className="btn" onClick={() => setShowQr((s) => !s)}>
//                 {showQr ? 'Ẩn mã QR' : 'Tạo mã QR'}
//               </button>
//             </div>
//             {showQr && code.trim() && (
//               <div style={{ marginTop: 14, background: '#fff', padding: 16, borderRadius: 14, display: 'inline-block' }}>
//                 <QRCode value={code.trim()} size={160} />
//               </div>
//             )}
//             <div style={{ height: 12 }} />
//             <div className="sectionSub" style={{ marginBottom: 8 }}>POI trong tour</div>
//             {isLoadingTourPois && (
//               <div className="sectionSub">Đang tải danh sách POI...</div>
//             )}
//             {!isLoadingTourPois && tourPois.length === 0 && (
//               <div className="sectionSub">Chưa có POI nào cho tour này.</div>
//             )}
//             {!isLoadingTourPois && tourPois.length > 0 && (
//               <div className="card cardPad" style={{ background: 'var(--panel-2)' }}>
//                 <div className="stack" style={{ gap: 8 }}>
//                   {tourPois.map((poi) => (
//                     <div key={poi.id} className="rowBetween">
//                       <div style={{ fontWeight: 600 }}>{poi.name ?? poi.id}</div>
//                       <span className="tag">#{poi.order ?? '-'}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>

//           <div className="card cardPad">
//             <div className="sectionTitle">{t('tourist.start.radius')}</div>
//             <div className="sectionSub">Điều chỉnh phạm vi tự động phát audio.</div>
//             <div style={{ height: 10 }} />
//             <div className="row" style={{ flexWrap: 'wrap' }}>
//               <input
//                 className="input"
//                 type="number"
//                 min={20}
//                 max={300}
//                 value={radius}
//                 onChange={(e) => setRadius(Number(e.target.value))}
//               />
//               <button
//                 className="btn"
//                 onClick={() => {
//                   setRadiusMeters(radius)
//                   showToast({ title: t('tourist.start.radiusSet', { radius }) })
//                 }}
//               >
//                 {t('tourist.start.apply')}
//               </button>
//             </div>
//             <div className="sectionSub" style={{ marginTop: 6 }}>
//               {t('tourist.start.radiusDesc')}
//             </div>
//             <div style={{ height: 12 }} />
//             <div className="panelCard">
//               <div className="panelIcon">📍</div>
//               <div className="panelText">
//                 <div style={{ fontWeight: 700 }}>{t('tourist.start.gps')}</div>
//                 <div className="sectionSub">{t('tourist.start.gpsDesc')}</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         <div className="panelGrid">
//           <div className="panelCard">
//             <div className="panelIcon">🗺️</div>
//             <div className="panelText">
//               <div style={{ fontWeight: 700 }}>Bản đồ thông minh</div>
//               <div className="sectionSub">Tự động gợi ý POI, theo vị trí thực.</div>
//             </div>
//           </div>
//           <div className="panelCard">
//             <div className="panelIcon">🎧</div>
//             <div className="panelText">
//               <div style={{ fontWeight: 700 }}>Audio đa ngôn ngữ</div>
//               <div className="sectionSub">Giọng đọc AI tự nhiên, phù hợp từng ngữ cảnh.</div>
//             </div>
//           </div>
//         </div>
//       </div>
//       {showProfileModal && (
//         <div className="profileModal" role="dialog" aria-modal="true">
//           <div className="profileModalBackdrop" onClick={() => setShowProfileModal(false)} />
//           <div className="profileModalContent">
//             <div className="profileModalHeader">
//               <div>
//                 <div className="sectionTitle">Thong tin ca nhan</div>
//                 <div className="sectionSub">Cap nhat thong tin tai khoan cua ban.</div>
//               </div>
//               <button className="btn btnGhost" onClick={() => setShowProfileModal(false)}>
//                 ✕
//               </button>
//             </div>
//             <div className="profileModalBody">
//               <div className="profileAvatar profileAvatarLarge">{initials}</div>
//               <div className="profileMetaList">
//                 <div className="profileMetaRow">
//                   <span className="profileLabel">Ten</span>
//                   <span>{profile?.name ?? '-'}</span>
//                 </div>
//                 <div className="profileMetaRow">
//                   <span className="profileLabel">Email</span>
//                   <span>{profile?.email ?? '-'}</span>
//                 </div>
//                 <div className="profileMetaRow">
//                   <span className="profileLabel">Dien thoai</span>
//                   <span>{profile?.phone ?? '-'}</span>
//                 </div>
//                 <div className="profileMetaRow">
//                   <span className="profileLabel">Ngon ngu</span>
//                   <span>{profile?.language ?? '-'}</span>
//                 </div>
//               </div>
//             </div>
//             <div className="profileModalFooter">
//               {userToken && (
//                 <button
//                   className="btn btnDanger"
//                   onClick={() => {
//                     setUserToken(undefined)
//                     setShowProfileModal(false)
//                   }}
//                 >
//                   Đăng xuất
//                 </button>
//               )}
//               <button className="btn" onClick={() => setShowProfileModal(false)}>
//                 Dong
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </AppShell>
//   )
// }

















// import { useEffect, useMemo, useState } from 'react'
// import { useNavigate } from 'react-router-dom'
// import { useAppStore } from '../../shared/store/appStore'
// import { AppShell } from '../../shared/ui/AppShell'
// import { useT } from '../../shared/i18n/useT'
// import QRCode from '../../shared/ui/QRCode'
// import { getTourPois, getTours, type Tour, type TourPoi } from '../../api/services/tours'
// import { getUserProfile, type UserProfile } from '../../api/services/user'
// import { logTrackingEvent } from '../../api/services/trackingLogs'

// export function StartPage() {
//   const nav = useNavigate()
//   const setTourCode = useAppStore((s) => s.setTourCode)
//   const showToast = useAppStore((s) => s.showToast)
//   const userToken = useAppStore((s) => s.userToken)
//   const setUserToken = useAppStore((s) => s.setUserToken)
//   const t = useT()

//   const [code, setCode] = useState('')
//   const [radius, setRadius] = useState(80)
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

//   const canGeo = useMemo(() => 'geolocation' in navigator, [])

//   useEffect(() => {
//     if (!userToken) return
//     setIsLoadingProfile(true)
//     getUserProfile()
//       .then((data) => setProfile(data))
//       .catch(() => setProfile(undefined))
//       .finally(() => setIsLoadingProfile(false))
//   }, [userToken])

//   useEffect(() => {
//     setIsLoadingTours(true)
//     getTours()
//       .then((items) => {
//         setTours(items || [])
//         if (items?.length) {
//           const first = items[0]
//           const nextId = first.id
//           setSelectedTourId(nextId)
//           setCode(first.code ?? first.id)
//         }
//       })
//       .catch(() => showToast({ title: 'Không tải được danh sách tour' }))
//       .finally(() => setIsLoadingTours(false))
//   }, [showToast])

//   useEffect(() => {
//     if (!selectedTourId) {
//       setTourPois([])
//       return
//     }
//     setIsLoadingTourPois(true)
//     getTourPois(selectedTourId)
//       .then((items) => setTourPois(items || []))
//       .catch(() => showToast({ title: 'Không tải được POI trong tour' }))
//       .finally(() => setIsLoadingTourPois(false))
//     logTrackingEvent({ event: 'tour_select', tourId: selectedTourId }).catch(() => undefined)
//   }, [selectedTourId, showToast])

//   async function requestLocation() {
//     if (!canGeo) {
//       showToast({ title: t('tourist.start.noGpsTitle'), message: t('tourist.start.noGpsDesc') })
//       return
//     }

//     navigator.geolocation.getCurrentPosition(
//       () => {
//         showToast({ title: t('tourist.start.gpsOkTitle'), message: t('tourist.start.gpsOkDesc') })
//         nav('/tourist/map')
//       },
//       () => {
//         showToast({ title: t('tourist.start.gpsDeniedTitle'), message: t('tourist.start.gpsDeniedDesc') })
//       },
//       { enableHighAccuracy: true, timeout: 10_000 },
//     )
//   }

//   const displayName = profile?.name || profile?.email || 'Người dùng'
//   const initials = displayName
//     .split(' ')
//     .filter(Boolean)
//     .slice(0, 2)
//     .map((part) => part[0]?.toUpperCase())
//     .join('')

//   return (
//     <AppShell>
//       <div className="start-page">
//         {/* Hero Section */}
//         <div className="hero-section">
//           <div className="hero-content">
//             <div className="hero-badge">
//               <span className="badge-icon">🎧</span>
//               <span>Audio Tour Guide</span>
//             </div>
//             <h1 className="hero-title">{t('tourist.start.title')}</h1>
//             <p className="hero-subtitle">
//               {t('tourist.start.subtitle') || 'Đi một vòng, nghe một câu chuyện, khám phá một hương vị.'}
//             </p>
//             <div className="hero-actions">
//               <button className="btn-primary-large" onClick={requestLocation}>
//                 <span className="btn-icon">📍</span>
//                 {t('tourist.start.requestLocation')}
//               </button>
//               <button className="btn-secondary-large" onClick={() => nav('/tourist/map')}>
//                 <span className="btn-icon">🗺️</span>
//                 {t('tourist.start.openMap')}
//               </button>
//             </div>
//           </div>
//         </div>

//         {/* Quick Stats */}
//         <div className="stats-grid">
//           <div className="stat-card">
//             <div className="stat-icon">🏆</div>
//             <div className="stat-content">
//               <div className="stat-value">50+</div>
//               <div className="stat-label">Điểm đến</div>
//             </div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-icon">🎙️</div>
//             <div className="stat-content">
//               <div className="stat-value">6+</div>
//               <div className="stat-label">Ngôn ngữ</div>
//             </div>
//           </div>
//           <div className="stat-card">
//             <div className="stat-icon">👥</div>
//             <div className="stat-content">
//               <div className="stat-value">10k+</div>
//               <div className="stat-label">Người dùng</div>
//             </div>
//           </div>
//         </div>

//         {/* Main Content Grid */}
//         <div className="content-grid">
//           {/* Profile Card */}
//           <div className="card profile-card">
//             <div className="card-header">
//               <div className="card-title">Hồ sơ</div>
//               <button 
//                 className="icon-btn" 
//                 onClick={() => setShowProfileModal(true)}
//                 aria-label="Mở hồ sơ"
//               >
//                 ✎
//               </button>
//             </div>
//             <div className="profile-info">
//               <div className="profile-avatar-large">
//                 {isLoadingProfile ? '...' : initials}
//               </div>
//               <div className="profile-details">
//                 <div className="profile-name">{isLoadingProfile ? 'Đang tải...' : displayName}</div>
//                 <div className="profile-email">{profile?.email ?? 'Chưa có email'}</div>
//                 {profile?.language && (
//                   <div className="profile-language-tag">{profile.language.toUpperCase()}</div>
//                 )}
//               </div>
//             </div>
//             <button 
//               className="btn-outline-full" 
//               onClick={() => setShowProfileModal(true)}
//             >
//               Xem chi tiết
//             </button>
//           </div>

//           {/* Tour Management Card */}
//           <div className="card tour-card">
//             <div className="card-header">
//               <div className="card-title">🎯 Tour của tôi</div>
//               <button className="btn-text" onClick={() => nav('/tourist/tours')}>
//                 Quản lý →
//               </button>
//             </div>
//             <div className="tour-actions">
//               <button className="btn-primary" onClick={() => nav('/tourist/tours')}>
//                 ✨ Tạo tour mới
//               </button>
//               <button className="btn-outline" onClick={() => nav('/tourist/tours?tab=saved')}>
//                 💾 Tour đã lưu
//               </button>
//             </div>
//           </div>

//           {/* QR Code Card */}
//           <div className="card qr-card">
//             <div className="card-header">
//               <div className="card-title">📱 Mã QR</div>
//               <div className="card-subtitle">Chia sẻ tour với nhóm của bạn</div>
//             </div>
            
//             <div className="tour-selector">
//               <label className="input-label">Chọn tour</label>
//               <select
//                 className="select-modern"
//                 value={selectedTourId}
//                 onChange={(e) => {
//                   const nextId = e.target.value
//                   setSelectedTourId(nextId)
//                   const matched = tours.find((item) => item.id === nextId)
//                   if (matched) setCode(matched.code ?? matched.id)
//                 }}
//               >
//                 <option value="">Chọn tour</option>
//                 {tours.map((tour) => (
//                   <option key={tour.id} value={tour.id}>
//                     {tour.name ?? tour.code ?? tour.id}
//                   </option>
//                 ))}
//               </select>
//               {isLoadingTours && (
//                 <div className="loading-indicator">Đang tải tour...</div>
//               )}
//             </div>

//             <div className="code-input-group">
//               <label className="input-label">Mã tour</label>
//               <input
//                 className="input-modern"
//                 value={code}
//                 onChange={(e) => setCode(e.target.value)}
//                 placeholder={t('tourist.start.example')}
//               />
//             </div>

//             <div className="qr-actions">
//               <button className="btn-primary" onClick={() => {
//                 setTourCode(code.trim() || undefined)
//                 showToast({ 
//                   title: t('tourist.start.tourSavedTitle'), 
//                   message: t('tourist.start.tourSavedDesc') 
//                 })
//                 logTrackingEvent({ 
//                   event: 'tour_save', 
//                   tourId: selectedTourId, 
//                   meta: { code: code.trim() } 
//                 }).catch(() => undefined)
//               }}>
//                 💾 Lưu tour
//               </button>
//               <button className="btn-outline" onClick={() => setShowQr((s) => !s)}>
//                 {showQr ? '🔒 Ẩn QR' : '📸 Tạo QR'}
//               </button>
//             </div>

//             {showQr && code.trim() && (
//               <div className="qr-display">
//                 <QRCode value={code.trim()} size={180} />
//                 <div className="qr-tip">Quét mã để tham gia tour</div>
//               </div>
//             )}
//           </div>

//           {/* Radius Settings Card */}
//           <div className="card radius-card">
//             <div className="card-header">
//               <div className="card-title">🎚️ Bán kính kích hoạt</div>
//               <div className="card-subtitle">Tự động phát audio khi đến gần</div>
//             </div>
//             <div className="radius-input-row">
//               <div className="radius-field">
//                 <label className="input-label">Bán kính (m)</label>
//                 <input
//                   className="input-modern"
//                   type="number"
//                   min={20}
//                   max={300}
//                   value={radius}
//                   onChange={(e) => setRadius(Number(e.target.value))}
//                 />
//               </div>
//               <div className="radius-hint">
//                 <div className="radius-number">{radius}</div>
//                 <div className="radius-sub">Từ 20m đến 300m</div>
//               </div>
//             </div>
//             <button
//               className="btn-primary-full"
//               onClick={() => {
//                 setRadiusMeters(radius)
//                 showToast({ title: t('tourist.start.radiusSet', { radius }) })
//               }}
//             >
//               Áp dụng
//             </button>
//           </div>

//           {/* Tour POIs Card */}
//           <div className="card pois-card">
//             <div className="card-header">
//               <div className="card-title">📍 Điểm đến trong tour</div>
//               <div className="card-subtitle">Khám phá các địa điểm hấp dẫn</div>
//             </div>
            
//             {isLoadingTourPois && (
//               <div className="loading-state">
//                 <div className="spinner"></div>
//                 <span>Đang tải điểm đến...</span>
//               </div>
//             )}
            
//             {!isLoadingTourPois && tourPois.length === 0 && (
//               <div className="empty-state">
//                 <div className="empty-icon">🗺️</div>
//                 <div className="empty-text">Chưa có điểm đến nào trong tour này</div>
//                 <button className="btn-outline-small" onClick={() => nav('/tourist/tours')}>
//                   Thêm điểm đến
//                 </button>
//               </div>
//             )}
            
//             {!isLoadingTourPois && tourPois.length > 0 && (
//               <div className="pois-list">
//                 {tourPois.map((poi, idx) => (
//                   <div key={poi.id} className="poi-item">
//                     <div className="poi-number">{idx + 1}</div>
//                     <div className="poi-info">
//                       <div className="poi-name">{poi.name ?? poi.id}</div>
//                       <div className="poi-order">Bước {poi.order ?? idx + 1}</div>
//                     </div>
//                     <div className="poi-icon">📍</div>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

//           {/* Features Card */}
//           <div className="card features-card">
//             <div className="card-header">
//               <div className="card-title">✨ Tính năng nổi bật</div>
//             </div>
//             <div className="features-grid">
//               <div className="feature-item">
//                 <div className="feature-icon">🗺️</div>
//                 <div className="feature-text">Bản đồ thông minh</div>
//                 <div className="feature-desc">Tự động gợi ý POI theo vị trí</div>
//               </div>
//               <div className="feature-item">
//                 <div className="feature-icon">🎧</div>
//                 <div className="feature-text">Audio đa ngôn ngữ</div>
//                 <div className="feature-desc">Giọng đọc AI tự nhiên</div>
//               </div>
//               <div className="feature-item">
//                 <div className="feature-icon">⚡</div>
//                 <div className="feature-text">Kích hoạt tự động</div>
//                 <div className="feature-desc">Phát audio khi đến gần</div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Profile Modal */}
//         {showProfileModal && (
//           <div className="modal-overlay" onClick={() => setShowProfileModal(false)}>
//             <div className="modal-container" onClick={(e) => e.stopPropagation()}>
//               <div className="modal-header">
//                 <h3 className="modal-title">Thông tin cá nhân</h3>
//                 <button className="modal-close" onClick={() => setShowProfileModal(false)}>✕</button>
//               </div>
//               <div className="modal-body">
//                 <div className="modal-avatar">
//                   <div className="profile-avatar-modal">{initials}</div>
//                 </div>
//                 <div className="info-list">
//                   <div className="info-row">
//                     <span className="info-label">Họ tên</span>
//                     <span className="info-value">{profile?.name ?? '-'}</span>
//                   </div>
//                   <div className="info-row">
//                     <span className="info-label">Email</span>
//                     <span className="info-value">{profile?.email ?? '-'}</span>
//                   </div>
//                   <div className="info-row">
//                     <span className="info-label">Số điện thoại</span>
//                     <span className="info-value">{profile?.phone ?? '-'}</span>
//                   </div>
//                   <div className="info-row">
//                     <span className="info-label">Ngôn ngữ</span>
//                     <span className="info-value">{profile?.language ?? '-'}</span>
//                   </div>
//                 </div>
//               </div>
//               <div className="modal-footer">
//                 {userToken && (
//                   <button className="btn-danger" onClick={() => {
//                     setUserToken(undefined)
//                     setShowProfileModal(false)
//                   }}>
//                     Đăng xuất
//                   </button>
//                 )}
//                 <button className="btn-secondary" onClick={() => setShowProfileModal(false)}>
//                   Đóng
//                 </button>
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
import { useAppStore } from '../../shared/store/appStore'
import { AppShell } from '../../shared/ui/AppShell'
import { useT } from '../../shared/i18n/useT'
import QRCode from '../../shared/ui/QRCode'
import { getTourPois, getTours, type Tour, type TourPoi } from '../../api/services/tours'
import { getUserProfile, type UserProfile } from '../../api/services/user'
import { logTrackingEvent } from '../../api/services/trackingLogs'

export function StartPage() {
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
  const [tours, setTours] = useState<Tour[]>([])
  const [selectedTourId, setSelectedTourId] = useState<string>('')
  const [tourPois, setTourPois] = useState<TourPoi[]>([])
  const [isLoadingTours, setIsLoadingTours] = useState(false)
  const [isLoadingTourPois, setIsLoadingTourPois] = useState(false)
  const [profile, setProfile] = useState<UserProfile | undefined>(undefined)
  const [isLoadingProfile, setIsLoadingProfile] = useState(false)
  const [showProfileModal, setShowProfileModal] = useState(false)

  const canGeo = useMemo(() => 'geolocation' in navigator, [])

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
      .catch(() => showToast({ title: 'Không tải được danh sách tour' }))
      .finally(() => setIsLoadingTours(false))
  }, [showToast])

  useEffect(() => {
    if (!selectedTourId) { setTourPois([]); return }
    setIsLoadingTourPois(true)
    getTourPois(selectedTourId)
      .then((items) => setTourPois(items || []))
      .catch(() => showToast({ title: 'Không tải được POI trong tour' }))
      .finally(() => setIsLoadingTourPois(false))
    logTrackingEvent({ event: 'tour_select', tourId: selectedTourId }).catch(() => undefined)
  }, [selectedTourId, showToast])

  async function requestLocation() {
    if (!canGeo) {
      showToast({ title: t('tourist.start.noGpsTitle'), message: t('tourist.start.noGpsDesc') })
      return
    }
    navigator.geolocation.getCurrentPosition(
      () => {
        showToast({ title: t('tourist.start.gpsOkTitle'), message: t('tourist.start.gpsOkDesc') })
        nav('/tourist/map')
      },
      () => showToast({ title: t('tourist.start.gpsDeniedTitle'), message: t('tourist.start.gpsDeniedDesc') }),
      { enableHighAccuracy: true, timeout: 10_000 },
    )
  }

  const displayName = profile?.name || profile?.email || 'Khách'
  const initials = displayName
    .split(' ').filter(Boolean).slice(0, 2)
    .map((p) => p[0]?.toUpperCase()).join('')

  return (
    <AppShell>
      <div className="sp-root">

        {/* ── HERO ── */}
        <section className="sp-hero">
          <div className="sp-hero-bg" />
          <div className="sp-hero-grain" />
          <div style={{ position: 'relative', zIndex: 1 }}>
            <div className="sp-hero-eyebrow">Food Tour · Hồ Chí Minh</div>
            <h1 className="sp-hero-title">
              Mỗi con hẻm<br />là một <em>câu chuyện</em>
            </h1>
            <p className="sp-hero-sub">
              {t('tourist.start.subtitle') || 'Đi một vòng, nghe một câu chuyện, khám phá một hương vị.'}
            </p>
            <div className="sp-hero-actions">
              <button className="sp-btn-primary" onClick={requestLocation}>
                📍 {t('tourist.start.requestLocation') || 'Bật định vị'}
              </button>
              <button className="sp-btn-ghost" onClick={() => nav('/tourist/map')}>
                {t('tourist.start.openMap') || 'Xem bản đồ'}
              </button>
            </div>
          </div>
          <div className="sp-hero-visual">
            <div className="sp-hero-stat-card">
              {[
                { icon: '🏪', label: 'Địa điểm', val: '240+' },
                { icon: '🎧', label: 'Ngôn ngữ', val: '6 thứ tiếng' },
                { icon: '⭐', label: 'Đánh giá', val: '4.9 / 5' },
              ].map((s) => (
                <div className="sp-stat-row" key={s.label}>
                  <div className="sp-stat-icon">{s.icon}</div>
                  <div>
                    <div className="sp-stat-label">{s.label}</div>
                    <div className="sp-stat-val">{s.val}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── BODY ── */}
        <div className="sp-body">

          {/* Row 1: Profile + My tours */}
          <div className="sp-grid-2">

            {/* Profile card */}
            <div className="sp-card sp-profile-card">
              <div className="sp-card-label">Tài khoản</div>
              <div className="sp-avatar-row">
                <button className="sp-avatar" onClick={() => setShowProfileModal(true)} type="button">
                  {isLoadingProfile ? '…' : initials}
                </button>
                <div>
                  <div className="sp-avatar-name">{isLoadingProfile ? 'Đang tải…' : displayName}</div>
                  <div className="sp-avatar-email">{profile?.email ?? 'Chưa đăng nhập'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  className="sp-btn-primary"
                  style={{ fontSize: 13, padding: '9px 18px' }}
                  onClick={() => setShowProfileModal(true)}
                >
                  Xem hồ sơ
                </button>
                {profile?.language && <span className="sp-pill">{profile.language}</span>}
              </div>
            </div>

            {/* My tours */}
            <div className="sp-card">
              <div className="sp-card-label">Cá nhân</div>
              <div className="sp-card-title">Tour của tôi</div>
              <div className="sp-card-sub">Tạo, chỉnh sửa và quản lý các tour cá nhân của bạn.</div>
              <div className="sp-row">
                <button className="sp-btn-primary" onClick={() => nav('/tourist/tours')}>
                  Quản lý tour
                </button>
                <button className="sp-btn" onClick={() => nav('/tourist/tours?tab=saved')}>
                  Tour đã lưu
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Tour selector + Radius */}
          <div className="sp-grid-2">

            {/* Tour selector */}
            <div className="sp-card">
              <div className="sp-card-label">Chia sẻ</div>
              <div className="sp-card-title">{t('tourist.start.tourCode') || 'Chọn tour & QR'}</div>
              <div className="sp-card-sub">Chọn tour và tạo mã QR để chia sẻ với nhóm.</div>

              <select
                className="sp-select"
                value={selectedTourId}
                onChange={(e) => {
                  const nextId = e.target.value
                  setSelectedTourId(nextId)
                  const matched = tours.find((item) => item.id === nextId)
                  if (matched) setCode(matched.code ?? matched.id)
                }}
              >
                <option value="">Chọn tour…</option>
                {tours.map((tour) => (
                  <option key={tour.id} value={tour.id}>{tour.name ?? tour.code ?? tour.id}</option>
                ))}
              </select>
              {isLoadingTours && <div className="sp-loading" style={{ marginTop: 6 }}>Đang tải tour…</div>}

              <input
                className="sp-input"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={t('tourist.start.example') || 'Nhập mã tour…'}
              />

              <div className="sp-row">
                <button
                  className="sp-btn-primary"
                  onClick={() => {
                    setTourCode(code.trim() || undefined)
                    showToast({ title: t('tourist.start.tourSavedTitle') || 'Đã lưu tour', message: t('tourist.start.tourSavedDesc') })
                    logTrackingEvent({ event: 'tour_save', tourId: selectedTourId, meta: { code: code.trim() } }).catch(() => undefined)
                  }}
                >
                  {t('tourist.start.saveTour') || 'Lưu tour'}
                </button>
                <button className="sp-btn" onClick={() => setShowQr((s) => !s)}>
                  {showQr ? '✕ Ẩn QR' : '⬛ Tạo QR'}
                </button>
              </div>

              {showQr && code.trim() && (
                <div className="sp-qr-wrap">
                  <QRCode value={code.trim()} size={160} />
                </div>
              )}

              {/* POI list */}
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
                <div className="sp-loading" style={{ marginTop: 6 }}>Chưa có POI nào cho tour này.</div>
              )}
            </div>

            {/* Radius */}
            <div className="sp-card">
              <div className="sp-card-label">Cấu hình</div>
              <div className="sp-card-title">{t('tourist.start.radius') || 'Bán kính kích hoạt'}</div>
              <div className="sp-card-sub">Điều chỉnh phạm vi tự động phát audio khi đến gần POI.</div>

              <div className="sp-radius-input">
                <label className="sp-input-label">Bán kính (m) (Đang test nên chọn 50000 nhé vì Data chưa nhiều)</label>
                <input
                  type="number"
                  className="sp-input"
                  min={20}
                  max={300}
                  value={radius}
                  onChange={(e) => setRadius(Number(e.target.value))}
                />
                <div className="sp-radius-meta">Từ 20m đến 300m</div>
              </div>

              <div className="sp-row" style={{ marginTop: 16 }}>
                <button
                  className="sp-btn-primary"
                  onClick={() => {
                    setRadiusMeters(radius)
                    showToast({ title: t('tourist.start.radiusSet', { radius }) || `Đã đặt bán kính ${radius}m` })
                  }}
                >
                  {t('tourist.start.apply') || 'Áp dụng'}
                </button>
              </div>

              <div className="sp-divider" />

              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ fontSize: 20 }}>📍</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{t('tourist.start.gps') || 'GPS Thực Thời'}</div>
                  <div style={{ fontSize: 12, color: 'var(--ink-muted)', marginTop: 3, lineHeight: 1.5 }}>
                    {t('tourist.start.gpsDesc') || 'Tự động phát nội dung khi bạn tiến gần địa điểm.'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Row 3: Feature pills */}
          <div className="sp-grid-3">
            {[
              { icon: '🗺️', title: 'Bản đồ thông minh', sub: 'Tự động gợi ý POI theo vị trí thực của bạn.' },
              { icon: '🎧', title: 'Audio đa ngôn ngữ', sub: 'Giọng đọc AI tự nhiên, hỗ trợ 6 ngôn ngữ.' },
              { icon: '🎟️', title: 'Voucher tức thì', sub: 'Nhận ưu đãi chớp nhoáng khi đứng gần quán.' },
            ].map((f) => (
              <div className="sp-feature-card" key={f.title}>
                <div className="sp-feature-icon">{f.icon}</div>
                <div>
                  <div className="sp-feature-title">{f.title}</div>
                  <div className="sp-feature-sub">{f.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── PROFILE MODAL ── */}
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
                  <button
                    className="sp-btn-danger"
                    onClick={() => { setUserToken(undefined); setShowProfileModal(false) }}
                  >
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
  )
}