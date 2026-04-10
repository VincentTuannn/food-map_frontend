import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import QRCode from '../../shared/ui/QRCode'
import { AppShell } from '../../shared/ui/AppShell'
import { useAppStore } from '../../shared/store/appStore'
import {
  addPoiToMyTour,
  getMyTour,
  removePoiFromMyTour,
  type TourVisibility,
  type UserTour,
  type UserTourPoi,
  updateMyTour,
  updateMyTourPoiOrder,
} from '../../api/services/userTours'
import { getNearbyPois } from '../../api/services/location'

export function MyTourDetailPage() {
  const { tourId } = useParams()
  const nav = useNavigate()
  const showToast = useAppStore((s) => s.showToast)
  const position = useAppStore((s) => s.position)
  const radiusMeters = useAppStore((s) => s.radiusMeters)

  const [tour, setTour] = useState<UserTour | undefined>(undefined)
  const [pois, setPois] = useState<UserTourPoi[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [visibility, setVisibility] = useState<TourVisibility>('PRIVATE')
  const [poiIdInput, setPoiIdInput] = useState('')
  const [nearbyPois, setNearbyPois] = useState<any[]>([])
  const [isLoadingNearby, setIsLoadingNearby] = useState(false)
  const [filterQuery, setFilterQuery] = useState('')
  const [filterMode, setFilterMode] = useState<'all' | 'withLocation' | 'noLocation'>('all')
  const [draggingId, setDraggingId] = useState<string | null>(null)
  const [dropId, setDropId] = useState<string | null>(null)
  const [isReordering, setIsReordering] = useState(false)
  const [hasPendingOrder, setHasPendingOrder] = useState(false)
  const [showSharePreview, setShowSharePreview] = useState(false)

  const shareToken = tour?.share_token ?? tour?.shareToken
  const shareLink = shareToken ? `${window.location.origin}/tour/shared/${shareToken}` : ''

  const loadTour = () => {
    if (!tourId) return
    setIsLoading(true)
    getMyTour(tourId)
      .then((tourRes) => {
        if (tourRes) {
          setTour(tourRes)
          setName(tourRes.name ?? '')
          setDescription(tourRes.description ?? '')
          setVisibility((tourRes.visibility ?? 'PRIVATE') as TourVisibility)
          if (tourRes.TourPois) {
            setPois(tourRes.TourPois)
          } else {
            setPois([])
          }
          setHasPendingOrder(false)
        }
      })
        .catch(() => showToast({ title: 'Không tải được tour' }))
      .finally(() => setIsLoading(false))
  }

  const nearbyCacheRef = useRef<Map<string, { ts: number; items: any[] }>>(new Map())
  const nearbyInFlightRef = useRef<Promise<void> | null>(null)
  const NEARBY_TTL_MS = 20000
  const loadNearby = () => {
    if (!position) return
    const roundedLat = Number(position.lat.toFixed(4))
    const roundedLng = Number(position.lng.toFixed(4))
    const cacheKey = `${roundedLat}:${roundedLng}:${radiusMeters}`
    const now = Date.now()

    const cached = nearbyCacheRef.current.get(cacheKey)
    if (cached && now - cached.ts < NEARBY_TTL_MS) {
      setNearbyPois(cached.items)
      return
    }
    if (nearbyInFlightRef.current) return

    setIsLoadingNearby(true)
    const req = getNearbyPois({ lat: position.lat, lng: position.lng, radiusMeters, limit: 20 })
      .then((res) => {
        nearbyCacheRef.current.set(cacheKey, { ts: Date.now(), items: res.items || [] })
        setNearbyPois(res.items || [])
      })
      .catch(() => showToast({ title: 'Không tải được POI gần đây' }))
      .finally(() => {
        nearbyInFlightRef.current = null
        setIsLoadingNearby(false)
      })

    nearbyInFlightRef.current = req.then(() => undefined)
  }

  useEffect(() => {
    loadTour()
  }, [tourId])

  useEffect(() => {
    loadNearby()
  }, [position, radiusMeters])

  const sortedPois = useMemo(() => {
    return [...pois].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
  }, [pois])

  const filteredPois = useMemo(() => {
    const q = filterQuery.trim().toLowerCase()
    return sortedPois.filter((poi) => {
      const hasLocation = Boolean(poi.lat && poi.lng)
      if (filterMode === 'withLocation' && !hasLocation) return false
      if (filterMode === 'noLocation' && hasLocation) return false
      if (!q) return true
      return (poi.name ?? poi.poi_id ?? poi.id).toLowerCase().includes(q)
    })
  }, [sortedPois, filterQuery, filterMode])

  const persistOrder = async (next: UserTourPoi[]) => {
    if (!tourId) return
    setIsReordering(true)
    try {
      const base = next.length + 1000
      for (let i = 0; i < next.length; i += 1) {
        const poi = next[i]
        const orderId = poi.poi_id ?? poi.id
        if (!orderId) continue
        await updateMyTourPoiOrder(tourId, orderId, base + i + 1)
      }
      for (let i = 0; i < next.length; i += 1) {
        const poi = next[i]
        const orderId = poi.poi_id ?? poi.id
        if (!orderId) continue
        await updateMyTourPoiOrder(tourId, orderId, i + 1)
      }
      loadTour()
      showToast({ title: 'Đã cập nhật thứ tự' })
    } catch (err: any) {
      const status = err?.status
      const details = err?.details ?? err?.message
      const detailText = typeof details === 'string' ? details : JSON.stringify(details)
      const message = detailText && detailText !== '{}' ? detailText : undefined
      showToast({
        title: status ? `Sắp xếp thất bại (${status})` : 'Sắp xếp thất bại',
        message,
      })
      loadTour()
    } finally {
      setIsReordering(false)
    }
  }

  const handleDrop = async (targetId: string) => {
    if (!draggingId || draggingId === targetId) return
    const current = [...sortedPois]
    const fromIndex = current.findIndex((item) => (item.poi_id ?? item.id) === draggingId)
    const toIndex = current.findIndex((item) => (item.poi_id ?? item.id) === targetId)
    if (fromIndex === -1 || toIndex === -1) return

    const [moved] = current.splice(fromIndex, 1)
    current.splice(toIndex, 0, moved)
    const reindexed = current.map((poi, idx) => ({
      ...poi,
      order_index: idx + 1,
    }))
    setPois(reindexed)
    setDraggingId(null)
    setDropId(null)
    setHasPendingOrder(true)
  }

  if (!tourId) {
    return (
      <AppShell>
        <div className="card cardPad">Không tìm thấy tour.</div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="mt-root td-root">
        <div className="mt-header">
          <div className="mt-header-bg" />
          <div className="mt-header-content">
            <div className="mt-header-eyebrow">Quản lý tour</div>
            <h1 className="mt-header-title">Chi tiết tour</h1>
            <p className="mt-header-sub">Quản lý điểm đến, chia sẻ và cập nhật hành trình.</p>
            <div className="td-hero-actions">
              <button className="mt-btn mt-btn-secondary" onClick={() => nav('/tourist/tours')}>
                Quay lại
              </button>
              <button
                className="mt-btn mt-btn-primary"
                onClick={() => {
                  const params = new URLSearchParams()
                  params.set('tourId', tourId)
                  params.set('tourScope', 'mine')
                  if (tour?.name) params.set('tourName', tour.name)
                  nav(`/tourist/map?${params.toString()}`)
                }}
              >
                Mở bản đồ
              </button>
            </div>
          </div>
        </div>

        <div className="mt-body">
          <div className="mt-create-card">
            <div className="td-section-head">
              <div>
                <div className="mt-create-title">Thông tin tour</div>
                <div className="mt-create-sub">Cập nhật tên, mô tả và trạng thái.</div>
              </div>
            </div>
            <div className="td-form">
              <input className="mt-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên tour" />
              <textarea
                className="mt-textarea"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả"
              />
              <select className="mt-select" value={visibility} onChange={(e) => setVisibility(e.target.value as TourVisibility)}>
                <option value="PRIVATE">Riêng tư</option>
                <option value="PUBLIC">Công khai</option>
                <option value="UNLISTED">Không công khai</option>
              </select>
              <button
                className="mt-btn mt-btn-primary mt-btn-block"
                disabled={isSaving}
                onClick={async () => {
                  try {
                    setIsSaving(true)
                    await updateMyTour(tourId, { name: name.trim(), description: description.trim() || undefined, visibility })
                    loadTour()
                    showToast({ title: 'Đã cập nhật tour' })
                  } catch {
                    showToast({ title: 'Cập nhật thất bại' })
                  } finally {
                    setIsSaving(false)
                  }
                }}
              >
                {isSaving ? 'Đang lưu...' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>

          {visibility !== 'PRIVATE' && shareLink && (
            <div className="mt-create-card">
              <div className="td-section-head">
                <div>
                  <div className="mt-create-title">Chia sẻ tour</div>
                  <div className="mt-create-sub">Gửi link hoặc QR code cho bạn bè.</div>
                </div>
                <button className="mt-btn mt-btn-secondary" onClick={() => setShowSharePreview((s) => !s)}>
                  {showSharePreview ? 'Ẩn xem trước' : 'Xem trước'}
                </button>
              </div>
              <div className="td-share-row">
                <div className="tag td-share-link">{shareLink}</div>
                <button
                  className="mt-btn mt-btn-secondary"
                  onClick={async () => {
                    await navigator.clipboard.writeText(shareLink)
                    showToast({ title: 'Đã copy link' })
                  }}
                >
                  Sao chép link
                </button>
              </div>
              {showSharePreview && (
                <div className="td-qr-box">
                  <QRCode value={shareLink} size={140} />
                </div>
              )}
            </div>
          )}

          <div className="mt-create-card">
            <div className="td-section-head">
              <div>
                <div className="mt-create-title">POI trong tour</div>
                <div className="mt-create-sub">Kéo thả để sắp xếp thứ tự • Vuốt để xóa</div>
              </div>
              <div className="td-poi-cta">
                {isReordering && <span className="mt-saving-badge">Đang lưu thứ tự...</span>}
                <button
                  className="mt-btn mt-btn-primary"
                  disabled={!hasPendingOrder || isReordering}
                  onClick={async () => {
                    await persistOrder(pois)
                    setHasPendingOrder(false)
                  }}
                >
                  Lưu thứ tự
                </button>
                {hasPendingOrder && !isReordering && (
                  <button
                    className="mt-btn mt-btn-secondary"
                    onClick={() => {
                      loadTour()
                    }}
                  >
                    Hủy thay đổi
                  </button>
                )}
              </div>
            </div>
            <div className="td-filter-row">
              <div className="tourSearch">
                <span className="search-icon">🔎</span>
                <input
                  className="tourSearchInput"
                  placeholder="Tìm POI trong tour..."
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                />
              </div>
              <div className="chipRow">
                <button
                  className={`chip ${filterMode === 'all' ? 'chipActive' : ''}`}
                  onClick={() => setFilterMode('all')}
                >
                  Tất cả
                </button>
                <button
                  className={`chip ${filterMode === 'withLocation' ? 'chipActive' : ''}`}
                  onClick={() => setFilterMode('withLocation')}
                >
                  Có tọa độ
                </button>
                <button
                  className={`chip ${filterMode === 'noLocation' ? 'chipActive' : ''}`}
                  onClick={() => setFilterMode('noLocation')}
                >
                  Thiếu tọa độ
                </button>
              </div>
            </div>
            {isLoading && <div className="mt-empty-text">Đang tải tour...</div>}
            {!isLoading && filteredPois.length === 0 && (
              <div className="mt-empty-text">Chưa có POI nào trong tour này.</div>
            )}
            {!isLoading && filteredPois.length > 0 && (
              <div className="tourPoiList td-poi-list">
                {filteredPois.map((poi, index) => {
                  const poiKey = (poi.poi_id ?? poi.id ?? String(index)) as string
                  const isDragging = draggingId === poiKey
                  return (
                    <div
                      key={poiKey}
                      className={`tourPoiItem ${isDragging ? 'dragging' : ''} ${dropId === poiKey ? 'drop-target' : ''}`}
                      draggable
                      onDragStart={(e) => {
                        e.dataTransfer.effectAllowed = 'move'
                        e.dataTransfer.setData('text/plain', poiKey)
                        setDraggingId(poiKey)
                      }}
                      onDragEnd={() => {
                        setDraggingId(null)
                        setDropId(null)
                      }}
                      onDragOver={(e) => {
                        e.preventDefault()
                        setDropId(poiKey)
                      }}
                      onDrop={async (e) => {
                        e.preventDefault()
                        await handleDrop(poiKey)
                      }}
                      onDragLeave={() => setDropId(null)}
                    >
                      <div className="tourPoiDragHandle">☰</div>

                      <div className="tourPoiInfo">
                        <div className="tourPoiTitle">{poi.name || poi.poi_id || poi.id}</div>
                        <div className="tourPoiSubtitle">Thứ tự: {poi.order_index || index + 1}</div>
                      </div>

                      <div className="tourPoiActions">
                        <button
                          className="delete-btn"
                          onClick={async () => {
                            if (!window.confirm('Bạn chắc chắn muốn xóa POI này khỏi tour?')) return
                            try {
                              await removePoiFromMyTour(tourId, poi.id)
                              loadTour()
                              showToast({ title: 'Đã xóa POI khỏi tour' })
                            } catch {
                              showToast({ title: 'Xóa thất bại' })
                            }
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="mt-create-card">
            <div className="td-section-head">
              <div>
                <div className="mt-create-title">Thêm POI vào tour</div>
                <div className="mt-create-sub">Chọn từ danh sách gần đây hoặc nhập ID.</div>
              </div>
            </div>
            <div className="td-add-row">
              <input
                className="mt-input"
                placeholder="Nhập poi_id"
                value={poiIdInput}
                onChange={(e) => setPoiIdInput(e.target.value)}
              />
              <button
                className="mt-btn mt-btn-primary"
                onClick={async () => {
                  if (!poiIdInput.trim()) return
                  try {
                    await addPoiToMyTour(tourId, poiIdInput.trim())
                    setPoiIdInput('')
                    loadTour()
                  } catch (err: any) {
                    const message = err?.details?.error || err?.message
                    showToast({ title: message || 'Thêm thất bại' })
                    loadTour()
                  }
                }}
              >
                Thêm
              </button>
            </div>

            <div className="td-divider" />
            <div className="mt-create-sub">POI gần đây</div>
            {isLoadingNearby && <div className="mt-empty-text">Đang tải POI...</div>}
            {!isLoadingNearby && nearbyPois.length === 0 && <div className="mt-empty-text">Không có POI gần đây.</div>}
            {!isLoadingNearby && nearbyPois.length > 0 && (
              <div className="td-nearby-list">
                {nearbyPois.map((poi) => (
                  <div key={poi.id} className="td-nearby-row">
                    <div>
                      <div className="td-nearby-title">{poi.name ?? poi.id}</div>
                      <div className="mt-create-sub">{poi.distanceMeters ? `${Math.round(poi.distanceMeters)}m` : ''}</div>
                    </div>
                    <button
                      className="mt-btn mt-btn-secondary"
                      onClick={async () => {
                        try {
                          await addPoiToMyTour(tourId, poi.id)
                          loadTour()
                        } catch (err: any) {
                          const message = err?.details?.error || err?.message
                          showToast({ title: message || 'Thêm thất bại' })
                          loadTour()
                        }
                      }}
                    >
                      Thêm
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  )
}
