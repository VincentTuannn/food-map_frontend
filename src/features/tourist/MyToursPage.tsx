import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { AppShell } from '../../shared/ui/AppShell'
import { useAppStore } from '../../shared/store/appStore'
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
        showToast({ title: t('mytours.toast.name_required', 'Vui lòng nhập tên tour') })
      return
    }
    setIsSaving(true)
    try {
      await createMyTour({ name: name.trim(), description: description.trim() || undefined, visibility })
      setName('')
      setDescription('')
      setVisibility('PRIVATE')
      loadTours()
        showToast({ title: t('mytours.toast.create_success', '✨ Đã tạo tour thành công') })
    } catch {
        showToast({ title: t('mytours.toast.create_error', 'Tạo tour thất bại') })
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
      showToast({ title: t('mytours.toast.name_required', 'Vui lòng nhập tên tour') })
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
            <div className="mt-header-eyebrow">{t('mytours.header.eyebrow', 'Quản lý hành trình')}</div>
            <h1 className="mt-header-title">{t('mytours.header.title', 'Tour của tôi')}</h1>
            <p className="mt-header-sub">
              {t('mytours.header.sub', 'Tạo lộ trình khám phá ẩm thực riêng, chia sẻ với bạn bè và lưu lại những hành trình yêu thích.')}
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
              📋 {t('mytours.tab.mine', 'Tour của tôi')}
            </button>
            <button
              className={`mt-tab ${tab === 'saved' ? 'mt-tab-active' : ''}`}
              onClick={() => setTab('saved')}
            >
              ⭐ {t('mytours.tab.saved', 'Tour đã lưu')}
            </button>
          </div>

          {/* Create Tour Form - Only for "mine" tab */}
          {tab === 'mine' && (
            <div className="mt-create-card">
              <div className="mt-create-title">✨ {t('mytours.create.title', 'Tạo tour mới')}</div>
              <div className="mt-create-sub">{t('mytours.create.sub', 'Xây dựng hành trình khám phá ẩm thực của riêng bạn')}</div>

              <div className="mt-form-group">
                <label className="mt-label">{t('mytours.create.name_label', 'Tên tour')}</label>
                <input
                  className="mt-input"
                  placeholder={t('mytours.create.name_placeholder', 'Ví dụ: Hành trình phở Hà Nội')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="mt-form-group">
                <label className="mt-label">{t('mytours.create.desc_label', 'Mô tả (tùy chọn)')}</label>
                <textarea
                  className="mt-textarea"
                  placeholder={t('mytours.create.desc_placeholder', 'Chia sẻ đôi điều về hành trình này...')}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="mt-form-group">
                <label className="mt-label">{t('mytours.create.visibility_label', 'Trạng thái')}</label>
                <select
                  className="mt-select"
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as TourVisibility)}
                >
                  <option value="PRIVATE">🔒 {t('mytours.create.private', 'Riêng tư - Chỉ mình tôi')}</option>
                  <option value="PUBLIC">🌍 {t('mytours.create.public', 'Công khai - Mọi người đều thấy')}</option>
                  <option value="UNLISTED">🔗 {t('mytours.create.unlisted', 'Không công khai - Ai có link mới xem được')}</option>
                </select>
              </div>

              <button
                className="mt-btn mt-btn-primary mt-btn-block"
                onClick={handleCreate}
                disabled={isSaving}
              >
                {isSaving ? t('mytours.create.loading', '⏳ Đang tạo...') : t('mytours.create.button', '🚀 Tạo tour ngay')}
              </button>
            </div>
          )}

          {/* Toolbar */}
          <div className="mt-toolbar">
            <div className="mt-search">
              <span className="mt-search-icon">🔎</span>
              <input
                className="mt-search-input"
                placeholder={t('mytours.search.placeholder', 'Tìm tour theo tên hoặc mô tả...')}
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
                <option value="all">{t('mytours.filter.all', 'Tất cả trạng thái')}</option>
                <option value="PRIVATE">{t('mytours.filter.private', 'Riêng tư')}</option>
                <option value="PUBLIC">{t('mytours.filter.public', 'Công khai')}</option>
                <option value="UNLISTED">{t('mytours.filter.unlisted', 'Không công khai')}</option>
              </select>
              <select
                className="mt-filter-select"
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as 'updated' | 'name')}
              >
                <option value="updated">🕐 {t('mytours.filter.updated', 'Mới cập nhật')}</option>
                <option value="name">📝 {t('mytours.filter.name', 'Theo tên')}</option>
              </select>
              <span className="mt-stats">{t('mytours.tour_count', { count: filteredTours.length, defaultValue: '{{count}} tour' })}</span>
            </div>
          </div>

          {/* Tour List */}
          {isLoading && (
            <div className="mt-loading">
              <div>{t('mytours.loading', '⏳ Đang tải danh sách tour...')}</div>
            </div>
          )}

          {!isLoading && filteredTours.length === 0 && (
            <div className="mt-empty">
              <div className="mt-empty-icon">🗺️</div>
              <div className="mt-empty-text">{tab === 'mine'
                ? t('mytours.empty.mine', 'Bạn chưa có tour nào. Hãy tạo tour mới bên trên.')
                : t('mytours.empty.saved', 'Bạn chưa lưu tour nào. Hãy khám phá và lưu lại những tour yêu thích.')}
              </div>
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
                      <div className="mt-tour-name">{tour.name ?? t('mytours.no_name', 'Tour không tên')}</div>
                      {tour.visibility && (
                        <span className="mt-visibility-badge">
                          {tour.visibility === 'PRIVATE' && `🔒 ${t('mytours.visibility.private', 'Riêng tư')}`}
                          {tour.visibility === 'PUBLIC' && `🌍 ${t('mytours.visibility.public', 'Công khai')}`}
                          {tour.visibility === 'UNLISTED' && `🔗 ${t('mytours.visibility.unlisted', 'Không công khai')}`}
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-tour-desc">
                      {tour.description ?? t('mytours.no_desc', 'Chưa có mô tả')}
                    </div>
                    
                    <div className="mt-tour-meta">
                      <span className="mt-meta-tag">📍 {poiCount} {t('mytours.poi', 'điểm đến')}</span>
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
                          📝 {t('mytours.manage_tour', 'Quản lý tour')}
                        </button>
                      ) : (
                        <button
                          className="mt-btn mt-btn-primary"
                          onClick={() => openMapForTour(tour, 'saved', false)}
                        >
                          🗺️ {t('mytours.open_map', 'Mở bản đồ')}
                        </button>
                      )}

                      <button
                        className="mt-btn mt-btn-secondary"
                        onClick={() => openMapForTour(tour, tab === 'mine' ? 'mine' : 'saved', true)}
                      >
                        🧭 {t('mytours.directions', 'Chỉ đường')}
                      </button>

                      {link && (
                        <button
                          className="mt-btn mt-btn-secondary"
                          onClick={() => setPreviewId(isPreviewOpen ? null : tour.id)}
                        >
                          {isPreviewOpen ? t('mytours.hide_share', '🔒 Ẩn chia sẻ') : t('mytours.preview_share', '📤 Chia sẻ')}
                        </button>
                      )}
                      
                      {tab === 'mine' && (
                        <button
                          className="mt-btn mt-btn-danger"
                          onClick={async () => {
                            if (confirm(t('mytours.delete_confirm', 'Bạn có chắc muốn xóa tour này?'))) {
                              try {
                                await deleteMyTour(tour.id)
                                loadTours()
                                showToast({ title: t('mytours.toast.delete_success', '🗑️ Đã xóa tour') })
                              } catch {
                                showToast({ title: t('mytours.toast.delete_error', 'Xóa tour thất bại') })
                              }
                            }
                          }}
                        >
                          {t('mytours.delete', '🗑️ Xóa')}
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