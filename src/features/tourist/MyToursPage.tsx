// import { useEffect, useMemo, useState } from 'react'
// import { useNavigate, useSearchParams } from 'react-router-dom'
// import { AppShell } from '../../shared/ui/AppShell'
// import { useAppStore } from '../../shared/store/appStore'
// import QRCode from '../../shared/ui/QRCode'
// import {
//   createMyTour,
//   deleteMyTour,
//   getMyTours,
//   type TourVisibility,
//   type UserTour,
// } from '../../api/services/userTours'
// import { getSavedTours } from '../../api/services/userSavedTours'

// export function MyToursPage() {
//   const nav = useNavigate()
//   const [params] = useSearchParams()
//   const showToast = useAppStore((s) => s.showToast)

//   const [myTours, setMyTours] = useState<UserTour[]>([])
//   const [savedTours, setSavedTours] = useState<UserTour[]>([])
//   const [tab, setTab] = useState<'mine' | 'saved'>(params.get('tab') === 'saved' ? 'saved' : 'mine')
//   const [isLoading, setIsLoading] = useState(false)
//   const [isSaving, setIsSaving] = useState(false)
//   const [name, setName] = useState('')
//   const [description, setDescription] = useState('')
//   const [visibility, setVisibility] = useState<TourVisibility>('PRIVATE')
//   const [searchQuery, setSearchQuery] = useState('')
//   const [visibilityFilter, setVisibilityFilter] = useState<'all' | TourVisibility>('all')
//   const [sortKey, setSortKey] = useState<'updated' | 'name'>('updated')
//   const [previewId, setPreviewId] = useState<string | null>(null)

//   const tours = tab === 'mine' ? myTours : savedTours

//   const loadTours = () => {
//     setIsLoading(true)
//     Promise.all([getMyTours(), getSavedTours()])
//       .then(([mine, saved]) => {
//         setMyTours(mine || [])
//         setSavedTours(saved || [])
//       })
//       .catch(() => showToast({ title: 'Không tải được danh sách tour' }))
//       .finally(() => setIsLoading(false))
//   }

//   useEffect(() => {
//     loadTours()
//   }, [])

//   const shareLink = (tour: UserTour) => {
//     const token = tour.share_token ?? tour.shareToken
//     if (!token) return ''
//     return `${window.location.origin}/tour/shared/${token}`
//   }

//   const openMapForTour = (tour: UserTour, scope: 'mine' | 'saved') => {
//     const params = new URLSearchParams()
//     params.set('tourId', tour.id)
//     params.set('tourScope', scope)
//     if (tour.name) params.set('tourName', tour.name)
//     nav(`/tourist/map?${params.toString()}`)
//   }

//   const handleCreate = async () => {
//     if (!name.trim()) {
//       showToast({ title: 'Vui long nhap ten tour' })
//       return
//     }
//     setIsSaving(true)
//     try {
//       await createMyTour({ name: name.trim(), description: description.trim() || undefined, visibility })
//       setName('')
//       setDescription('')
//       setVisibility('PRIVATE')
//       loadTours()
//       showToast({ title: 'Đã tạo tour' })
//     } catch {
//       showToast({ title: 'Tạo tour thất bại' })
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const emptyState = useMemo(() => {
//     if (tab === 'mine') return 'Bạn chưa có tour nào. Hãy tạo tour mới bên dưới.'
//     return 'Bạn chưa lưu tour nào.'
//   }, [tab])

//   const filteredTours = useMemo(() => {
//     const q = searchQuery.trim().toLowerCase()
//     const filtered = tours.filter((tour) => {
//       if (visibilityFilter !== 'all' && tour.visibility !== visibilityFilter) return false
//       if (!q) return true
//       const nameMatch = (tour.name ?? '').toLowerCase().includes(q)
//       const descMatch = (tour.description ?? '').toLowerCase().includes(q)
//       return nameMatch || descMatch
//     })

//     const sorted = [...filtered]
//     if (sortKey === 'name') {
//       sorted.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
//     } else {
//       sorted.sort((a, b) => {
//         const aTime = new Date(a.updated_at ?? a.created_at ?? 0).getTime()
//         const bTime = new Date(b.updated_at ?? b.created_at ?? 0).getTime()
//         return bTime - aTime
//       })
//     }
//     return sorted
//   }, [tours, searchQuery, visibilityFilter, sortKey])

//   return (
//     <AppShell>
//       <div className="stack">
//         <div className="card cardPad">
//           <div className="rowBetween">
//             <div>
//               <div className="sectionTitle">Tour cá nhân</div>
//               <div className="sectionSub">Quản lý tour của bạn và tour đã lưu.</div>
//             </div>
//             <div className="row">
//               <button
//                 className={`btn ${tab === 'mine' ? 'btnPrimary' : ''}`}
//                 onClick={() => setTab('mine')}
//               >
//                 Tour của tôi
//               </button>
//               <button
//                 className={`btn ${tab === 'saved' ? 'btnPrimary' : ''}`}
//                 onClick={() => setTab('saved')}
//               >
//                 Tour đã lưu
//               </button>
//             </div>
//           </div>
//           <div style={{ height: 12 }} />
//           <div className="tourToolbar">
//             <div className="tourSearch">
//               <span>🔎</span>
//               <input
//                 className="tourSearchInput"
//                 placeholder="Tìm tour theo tên hoặc mô tả..."
//                 value={searchQuery}
//                 onChange={(e) => setSearchQuery(e.target.value)}
//               />
//             </div>
//             <div className="tourFilterRow">
//               <select
//                 className="select"
//                 value={visibilityFilter}
//                 onChange={(e) => setVisibilityFilter(e.target.value as 'all' | TourVisibility)}
//               >
//                 <option value="all">Tất cả trạng thái</option>
//                 <option value="PRIVATE">Riêng tư</option>
//                 <option value="PUBLIC">Công khai</option>
//                 <option value="UNLISTED">Không công khai</option>
//               </select>
//               <select className="select" value={sortKey} onChange={(e) => setSortKey(e.target.value as 'updated' | 'name')}>
//                 <option value="updated">Mới cập nhật</option>
//                 <option value="name">Theo tên</option>
//               </select>
//               <span className="tag">{filteredTours.length} tour</span>
//             </div>
//           </div>
//         </div>

//         {tab === 'mine' && (
//           <div className="card cardPad">
//             <div className="sectionTitle">Tạo tour mới</div>
//             <div className="sectionSub">Chọn tên tour, mô tả ngắn và trạng thái.</div>
//             <div style={{ height: 10 }} />
//             <div className="stack">
//               <input
//                 className="input"
//                 placeholder="Tên tour"
//                 value={name}
//                 onChange={(e) => setName(e.target.value)}
//               />
//               <textarea
//                 className="textarea"
//                 placeholder="Mô tả (tùy chọn)"
//                 value={description}
//                 onChange={(e) => setDescription(e.target.value)}
//               />
//               <select
//                 className="select"
//                 value={visibility}
//                 onChange={(e) => setVisibility(e.target.value as TourVisibility)}
//               >
//                 <option value="PRIVATE">Riêng tư</option>
//                 <option value="PUBLIC">Công khai</option>
//                 <option value="UNLISTED">Không công khai</option>
//               </select>
//               <button className="btn btnPrimary" onClick={handleCreate} disabled={isSaving}>
//                 {isSaving ? 'Đang tạo...' : 'Tạo tour'}
//               </button>
//             </div>
//           </div>
//         )}

//         <div className="stack">
//           {isLoading && <div className="muted">Đang tải danh sách...</div>}
//           {!isLoading && filteredTours.length === 0 && <div className="muted">{emptyState}</div>}
//           {!isLoading && filteredTours.length > 0 && (
//             <div className="tourListGrid">
//               {filteredTours.map((tour) => {
//                 const link = shareLink(tour)
//                 const isPreviewOpen = previewId === tour.id
//                 return (
//                   <div key={tour.id} className="card cardPad tourCard">
//                     <div className="rowBetween">
//                       <div>
//                         <div style={{ fontWeight: 700 }}>{tour.name ?? tour.id}</div>
//                         <div className="sectionSub">{tour.description ?? 'Chưa có mô tả'}</div>
//                       </div>
//                       {tour.visibility && <span className="pill">{tour.visibility}</span>}
//                     </div>
//                     <div className="tourMeta">
//                       <span className="tag">{tour.poi_count ?? 0} điểm dừng</span>
//                       {(tour.updated_at || tour.created_at) && (
//                         <span className="tag">{new Date(tour.updated_at ?? tour.created_at ?? '').toLocaleDateString('vi-VN')}</span>
//                       )}
//                     </div>
//                     {link && isPreviewOpen && (
//                       <div className="tourPreview">
//                         <div className="tag" style={{ wordBreak: 'break-all' }}>{link}</div>
//                         <div className="tourQrBox">
//                           <QRCode value={link} size={120} />
//                         </div>
//                       </div>
//                     )}
//                     <div className="tourCardRow" style={{ marginTop: 10 }}>
//                       {tab === 'mine' ? (
//                         <button className="btn btnPrimary" onClick={() => nav(`/tourist/tours/${tour.id}`)}>
//                           Quản lý
//                         </button>
//                       ) : (
//                         <button className="btn btnPrimary" onClick={() => openMapForTour(tour, 'saved')}>
//                           Mở bản đồ
//                         </button>
//                       )}
//                       <button className="btn" onClick={() => openMapForTour(tour, tab === 'mine' ? 'mine' : 'saved')}>
//                         Chỉ đường
//                       </button>
//                       {link && (
//                         <button className="btn" onClick={() => setPreviewId(isPreviewOpen ? null : tour.id)}>
//                           {isPreviewOpen ? 'Ẩn chia sẻ' : 'Xem trước chia sẻ'}
//                         </button>
//                       )}
//                       {tab === 'mine' && (
//                         <button
//                           className="btn btnDanger"
//                           onClick={async () => {
//                             try {
//                               await deleteMyTour(tour.id)
//                               loadTours()
//                               showToast({ title: 'Đã xoá tour' })
//                             } catch {
//                               showToast({ title: 'Xoá tour thất bại' })
//                             }
//                           }}
//                         >
//                           Xoá
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 )
//               })}
//             </div>
//           )}
//         </div>
//       </div>
//     </AppShell>
//   )
// }









import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell } from '../../shared/ui/AppShell'
import { useAppStore } from '../../shared/store/appStore'
import QRCode from '../../shared/ui/QRCode'
import {
  createMyTour,
  deleteMyTour,
  getMyTours,
  type TourVisibility,
  type UserTour,
} from '../../api/services/userTours'
import { getSavedTours } from '../../api/services/userSavedTours'

export function MyToursPage() {
  const nav = useNavigate()
  const [params] = useSearchParams()
  const showToast = useAppStore((s) => s.showToast)

  const [myTours, setMyTours] = useState<UserTour[]>([])
  const [savedTours, setSavedTours] = useState<UserTour[]>([])
  const [tab, setTab] = useState<'mine' | 'saved'>(params.get('tab') === 'saved' ? 'saved' : 'mine')
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<TourVisibility>('PRIVATE')
  const [searchQuery, setSearchQuery] = useState('')
  const [visibilityFilter, setVisibilityFilter] = useState<'all' | TourVisibility>('all')
  const [sortKey, setSortKey] = useState<'updated' | 'name'>('updated')
  const [previewId, setPreviewId] = useState<string | null>(null)

  const tours = tab === 'mine' ? myTours : savedTours

  const loadTours = () => {
    setIsLoading(true)
    Promise.all([getMyTours(), getSavedTours()])
      .then(([mine, saved]) => {
        setMyTours(mine || [])
        setSavedTours(saved || [])
      })
      .catch(() => showToast({ title: 'Không tải được danh sách tour' }))
      .finally(() => setIsLoading(false))
  }

  useEffect(() => {
    loadTours()
  }, [])

  const shareLink = (tour: UserTour) => {
    const token = tour.share_token ?? tour.shareToken
    if (!token) return ''
    return `${window.location.origin}/tour/shared/${token}`
  }

  const openMapForTour = (tour: UserTour, scope: 'mine' | 'saved', autoNav = false) => {
    const params = new URLSearchParams()
    params.set('tourId', tour.id)
    params.set('tourScope', scope)
    if (tour.name) params.set('tourName', tour.name)
    if (autoNav) params.set('nav', 'true')
    nav(`/tourist/map?${params.toString()}`)
  }

  const handleCreate = async () => {
    if (!name.trim()) {
      showToast({ title: 'Vui lòng nhập tên tour' })
      return
    }
    setIsSaving(true)
    try {
      await createMyTour({ name: name.trim(), description: description.trim() || undefined, visibility })
      setName('')
      setDescription('')
      setVisibility('PRIVATE')
      loadTours()
      showToast({ title: '✨ Đã tạo tour thành công' })
    } catch {
      showToast({ title: 'Tạo tour thất bại' })
    } finally {
      setIsSaving(false)
    }
  }

  const emptyState = useMemo(() => {
    if (tab === 'mine') return 'Bạn chưa có tour nào. Hãy tạo tour mới bên trên.'
    return 'Bạn chưa lưu tour nào. Hãy khám phá và lưu lại những tour yêu thích.'
  }, [tab])

  const filteredTours = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const filtered = tours.filter((tour) => {
      if (visibilityFilter !== 'all' && tour.visibility !== visibilityFilter) return false
      if (!q) return true
      const nameMatch = (tour.name ?? '').toLowerCase().includes(q)
      const descMatch = (tour.description ?? '').toLowerCase().includes(q)
      return nameMatch || descMatch
    })

    const sorted = [...filtered]
    if (sortKey === 'name') {
      sorted.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''))
    } else {
      sorted.sort((a, b) => {
        const aTime = new Date(a.updated_at ?? a.created_at ?? 0).getTime()
        const bTime = new Date(b.updated_at ?? b.created_at ?? 0).getTime()
        return bTime - aTime
      })
    }
    return sorted
  }, [tours, searchQuery, visibilityFilter, sortKey])

  return (
    <AppShell>
      <div className="mt-root">
        {/* Header */}
        <div className="mt-header">
          <div className="mt-header-bg" />
          <div className="mt-header-content">
            <div className="mt-header-eyebrow">Quản lý hành trình</div>
            <h1 className="mt-header-title">Tour của tôi</h1>
            <p className="mt-header-sub">
              Tạo lộ trình khám phá ẩm thực riêng, chia sẻ với bạn bè và lưu lại những hành trình yêu thích.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="mt-body">
          {/* Tabs */}
          <div className="mt-tabs">
            <button
              className={`mt-tab ${tab === 'mine' ? 'mt-tab-active' : ''}`}
              onClick={() => setTab('mine')}
            >
              📋 Tour của tôi
            </button>
            <button
              className={`mt-tab ${tab === 'saved' ? 'mt-tab-active' : ''}`}
              onClick={() => setTab('saved')}
            >
              ⭐ Tour đã lưu
            </button>
          </div>

          {/* Create Tour Form - Only for "mine" tab */}
          {tab === 'mine' && (
            <div className="mt-create-card">
              <div className="mt-create-title">✨ Tạo tour mới</div>
              <div className="mt-create-sub">Xây dựng hành trình khám phá ẩm thực của riêng bạn</div>
              
              <div className="mt-form-group">
                <label className="mt-label">Tên tour</label>
                <input
                  className="mt-input"
                  placeholder="Ví dụ: Hành trình phở Hà Nội"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              
              <div className="mt-form-group">
                <label className="mt-label">Mô tả (tùy chọn)</label>
                <textarea
                  className="mt-textarea"
                  placeholder="Chia sẻ đôi điều về hành trình này..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              
              <div className="mt-form-group">
                <label className="mt-label">Trạng thái</label>
                <select
                  className="mt-select"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as TourVisibility)}
                >
                  <option value="PRIVATE">🔒 Riêng tư - Chỉ mình tôi</option>
                  <option value="PUBLIC">🌍 Công khai - Mọi người đều thấy</option>
                  <option value="UNLISTED">🔗 Không công khai - Ai có link mới xem được</option>
                </select>
              </div>
              
              <button
                className="mt-btn mt-btn-primary mt-btn-block"
                onClick={handleCreate}
                disabled={isSaving}
              >
                {isSaving ? '⏳ Đang tạo...' : '🚀 Tạo tour ngay'}
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="mt-toolbar">
            <div className="mt-search">
              <span className="mt-search-icon">🔎</span>
              <input
                className="mt-search-input"
                placeholder="Tìm tour theo tên hoặc mô tả..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="mt-filters">
              <select
                className="mt-filter-select"
                value={visibilityFilter}
                onChange={(e) => setVisibilityFilter(e.target.value as 'all' | TourVisibility)}
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="PRIVATE">Riêng tư</option>
                <option value="PUBLIC">Công khai</option>
                <option value="UNLISTED">Không công khai</option>
              </select>
              <select
                className="mt-filter-select"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as 'updated' | 'name')}
              >
                <option value="updated">🕐 Mới cập nhật</option>
                <option value="name">📝 Theo tên</option>
              </select>
              <span className="mt-stats">{filteredTours.length} tour</span>
            </div>
          </div>

          {/* Tour List */}
          {isLoading && (
            <div className="mt-loading">
              <div>⏳ Đang tải danh sách tour...</div>
            </div>
          )}

          {!isLoading && filteredTours.length === 0 && (
            <div className="mt-empty">
              <div className="mt-empty-icon">🗺️</div>
              <div className="mt-empty-text">{emptyState}</div>
            </div>
          )}

          {!isLoading && filteredTours.length > 0 && (
            <div className="mt-grid">
              {filteredTours.map((tour) => {
                const link = shareLink(tour)
                const isPreviewOpen = previewId === tour.id
                const poiCount = (tour as any).poi_count ?? (tour as any).TourPois?.length ?? 0
                
                return (
                  <div key={tour.id} className="mt-tour-card">
                    <div className="mt-tour-header">
                      <div className="mt-tour-name">{tour.name ?? 'Tour không tên'}</div>
                      {tour.visibility && (
                        <span className="mt-visibility-badge">
                          {tour.visibility === 'PRIVATE' && '🔒 Riêng tư'}
                          {tour.visibility === 'PUBLIC' && '🌍 Công khai'}
                          {tour.visibility === 'UNLISTED' && '🔗 Không công khai'}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-tour-desc">
                      {tour.description ?? 'Chưa có mô tả'}
                    </div>
                    
                    <div className="mt-tour-meta">
                      <span className="mt-meta-tag">📍 {poiCount} điểm đến</span>
                      {(tour.updated_at || tour.created_at) && (
                        <span className="mt-meta-tag">
                          📅 {new Date(tour.updated_at ?? tour.created_at ?? '').toLocaleDateString('vi-VN')}
                        </span>
                      )}
                    </div>

                    {link && isPreviewOpen && (
                      <div className="mt-preview">
                        <div className="mt-preview-link">{link}</div>
                        <div className="mt-qr-box">
                          <QRCode value={link} size={120} />
                        </div>
                      </div>
                    )}

                    <div className="mt-card-actions">
                      {tab === 'mine' ? (
                        <button
                          className="mt-btn mt-btn-primary"
                          onClick={() => nav(`/tourist/tours/${tour.id}`)}
                        >
                          📝 Quản lý tour
                        </button>
                      ) : (
                        <button
                          className="mt-btn mt-btn-primary"
                          onClick={() => openMapForTour(tour, 'saved', false)}
                        >
                          🗺️ Mở bản đồ
                        </button>
                      )}
                      
                      <button
                        className="mt-btn mt-btn-secondary"
                        onClick={() => openMapForTour(tour, tab === 'mine' ? 'mine' : 'saved', true)}
                      >
                        🧭 Chỉ đường
                      </button>
                      
                      {link && (
                        <button
                          className="mt-btn mt-btn-secondary"
                          onClick={() => setPreviewId(isPreviewOpen ? null : tour.id)}
                        >
                          {isPreviewOpen ? '🔒 Ẩn chia sẻ' : '📤 Chia sẻ'}
                        </button>
                      )}
                      
                      {tab === 'mine' && (
                        <button
                          className="mt-btn mt-btn-danger"
                          onClick={async () => {
                            if (confirm('Bạn có chắc muốn xóa tour này?')) {
                              try {
                                await deleteMyTour(tour.id)
                                loadTours()
                                showToast({ title: '🗑️ Đã xóa tour' })
                              } catch {
                                showToast({ title: 'Xóa tour thất bại' })
                              }
                            }
                          }}
                        >
                          🗑️ Xóa
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}