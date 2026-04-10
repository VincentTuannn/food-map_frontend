import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { AppShell } from '../../shared/ui/AppShell'
import { useAppStore } from '../../shared/store/appStore'
import { getSharedTour, type UserTour } from '../../api/services/userTours'
import { saveTour, unsaveTour, getSavedTours } from '../../api/services/userSavedTours'
import { getMyTourPois, type UserTourPoi } from '../../api/services/userTours'
import { getTourPois } from '../../api/services/tours'

export function SharedTourPage() {
  const { shareToken } = useParams()
  const nav = useNavigate()
  const showToast = useAppStore((s) => s.showToast)
  const userToken = useAppStore((s) => s.userToken)
  const [tour, setTour] = useState<UserTour | undefined>(undefined)
  const [pois, setPois] = useState<UserTourPoi[]>([])
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!shareToken) return
    setIsLoading(true)
    getSharedTour(shareToken)
      .then((res) => setTour((res as any).data ?? res))
      .catch(() => showToast({ title: 'Không tìm thấy tour' }))
      .finally(() => setIsLoading(false))
  }, [shareToken, showToast])

  useEffect(() => {
    if (!tour?.id) return
    if (tour.TourPois && tour.TourPois.length) {
      setPois(tour.TourPois)
      return
    }
    getTourPois(tour.id)
      .then((items) => setPois(items || []))
      .catch(() => {
        getMyTourPois(tour.id)
          .then((items) => setPois(items || []))
          .catch(() => setPois([]))
      })
  }, [tour?.id])

  useEffect(() => {
    if (!userToken) return
    getSavedTours()
      .then((items) => setSavedIds(new Set(items.map((t) => t.id))))
      .catch(() => setSavedIds(new Set()))
  }, [userToken])

  const tourPois = useMemo(() => {
    return [...pois].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  }, [pois])

  const poiCount = tour?.poi_count ?? tourPois.length

  const openMapForTour = (targetId?: string) => {
    if (!tour?.id) return
    const params = new URLSearchParams()
    params.set('tourId', tour.id)
    params.set('tourScope', 'saved')
    if (tour.name) params.set('tourName', tour.name)
    if (targetId) params.set('to', targetId)
    nav(`/tourist/map?${params.toString()}`)
  }

  if (!shareToken) {
    return (
      <AppShell>
        <div className="card cardPad">Không tìm thấy tour.</div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mt-root st-root">
        <div className="mt-header">
          <div className="mt-header-bg" />
          <div className="mt-header-content">
            <div className="mt-header-eyebrow">Chia sẻ hành trình</div>
            <h1 className="mt-header-title">Tour được chia sẻ</h1>
            <p className="mt-header-sub">Xem tour được gửi từ bạn bè và lưu lại để khám phá sau.</p>
            <div className="st-hero-actions">
              <button className="mt-btn mt-btn-secondary" onClick={() => nav('/tourist/tours')}>
                Tour của tôi
              </button>
              {tour?.id && (
                <button className="mt-btn mt-btn-primary" onClick={() => openMapForTour()}>
                  Mở bản đồ
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="mt-body">
          {isLoading && (
            <div className="mt-loading">
              <div>Đang tải tour...</div>
            </div>
          )}

          {!isLoading && !tour && (
            <div className="mt-empty">
              <div className="mt-empty-icon">🧭</div>
              <div className="mt-empty-text">Không tìm thấy tour.</div>
            </div>
          )}

          {!isLoading && tour && (
            <div className="mt-create-card st-summary">
              <div className="st-summary-head">
                <div>
                  <div className="st-summary-title">{tour.name ?? tour.id}</div>
                  <div className="mt-create-sub">{tour.description ?? 'Chưa có mô tả'}</div>
                </div>
                {tour.visibility && (
                  <span className="mt-visibility-badge">{tour.visibility}</span>
                )}
              </div>
              <div className="mt-tour-meta st-summary-meta">
                <span className="mt-meta-tag">{poiCount} điểm đến</span>
                {(tour.updated_at || tour.created_at) && (
                  <span className="mt-meta-tag">
                    Cập nhật: {new Date(tour.updated_at ?? tour.created_at ?? '').toLocaleDateString('vi-VN')}
                  </span>
                )}
              </div>
              <div className="mt-card-actions">
                {userToken ? (
                  savedIds.has(tour.id) ? (
                    <button
                      className="mt-btn mt-btn-secondary"
                      disabled={isSaving}
                      onClick={async () => {
                        try {
                          setIsSaving(true)
                          await unsaveTour(tour.id)
                          setSavedIds(new Set(Array.from(savedIds).filter((id) => id !== tour.id)))
                          showToast({ title: 'Đã bỏ lưu tour' })
                        } catch {
                          showToast({ title: 'Bỏ lưu thất bại' })
                        } finally {
                          setIsSaving(false)
                        }
                      }}
                    >
                      {isSaving ? 'Đang xử lý...' : 'Bỏ lưu'}
                    </button>
                  ) : (
                    <button
                      className="mt-btn mt-btn-primary"
                      disabled={isSaving}
                      onClick={async () => {
                        try {
                          setIsSaving(true)
                          await saveTour(tour.id)
                          setSavedIds(new Set([...Array.from(savedIds), tour.id]))
                          showToast({ title: 'Đã lưu tour' })
                        } catch {
                          showToast({ title: 'Lưu tour thất bại' })
                        } finally {
                          setIsSaving(false)
                        }
                      }}
                    >
                      {isSaving ? 'Đang lưu...' : 'Lưu tour'}
                    </button>
                  )
                ) : (
                  <button className="mt-btn mt-btn-primary" onClick={() => nav('/login')}>
                    Đăng nhập để lưu
                  </button>
                )}
                <button className="mt-btn mt-btn-secondary" onClick={() => openMapForTour()}>
                  Mở bản đồ
                </button>
              </div>
            </div>
          )}

          {!isLoading && tour && (
            <div className="mt-create-card">
              <div className="st-section-head">
                <div>
                  <div className="mt-create-title">Hành trình</div>
                  <div className="mt-create-sub">Các điểm dừng theo thứ tự di chuyển.</div>
                </div>
              </div>
              {tourPois.length === 0 && <div className="mt-empty-text">Chưa có POI nào.</div>}
              {tourPois.length > 0 && (
                <div className="st-poi-grid">
                  {tourPois.map((poi, idx) => {
                    const poiId = poi.poi_id ?? poi.id
                    return (
                      <div key={poi.id} className="mt-tour-card st-poi-card">
                        <div className="st-poi-row">
                          <div>
                            <div className="st-poi-title">{poi.name ?? poiId}</div>
                            <div className="st-poi-meta">Thứ tự: {poi.order_index ?? idx + 1}</div>
                          </div>
                          <span className="mt-meta-tag st-poi-tag">POI</span>
                        </div>
                        <div className="mt-card-actions st-poi-actions">
                          <button
                            className="mt-btn mt-btn-secondary"
                            onClick={() => openMapForTour(poiId)}
                          >
                            Chỉ đường
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  )
}
