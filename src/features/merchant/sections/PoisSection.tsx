import { useState } from 'react'
import MapView, { Marker, type ViewState } from 'react-map-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import { createMerchantPoi, deleteMerchantPoi, updateMerchantPoi } from '../../../api/services/merchant'
import { MAPBOX_TOKEN } from '../merchantConstants'
import { fmtDate, fmtRating } from '../merchantHelpers'
import type { Poi } from '../merchantTypes'
import { StatusBadge } from '../components/StatusBadge'

export function PoisSection({ pois, setPois, toast }: { pois: Poi[]; setPois: (p: Poi[]) => void; toast: (m: string) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', trigger_radius: '50' })
  const [addressQuery, setAddressQuery] = useState('')
  const [addressLabel, setAddressLabel] = useState('')
  const [coord, setCoord] = useState<{ lat: number; lng: number } | null>(null)
  const [mapView, setMapView] = useState<ViewState>({
    longitude: 106.700806,
    latitude: 10.776889,
    zoom: 14,
    bearing: 0,
    pitch: 0,
    padding: { top: 0, right: 0, bottom: 0, left: 0 },
  })
  const [geoLoading, setGeoLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  const openNew = () => {
    setForm({ name: '', trigger_radius: '50' })
    setAddressQuery('')
    setAddressLabel('')
    setCoord(null)
    setEditId(null)
    setShowForm(true)
  }

  const openEdit = (p: Poi) => {
    const nextLat = p.lat ?? p.latitude
    const nextLng = p.lng ?? p.longitude
    setForm({ name: p.name, trigger_radius: String(p.trigger_radius) })
    setAddressQuery('')
    setAddressLabel('')
    if (Number.isFinite(Number(nextLat)) && Number.isFinite(Number(nextLng))) {
      const latNum = Number(nextLat)
      const lngNum = Number(nextLng)
      setCoord({ lat: latNum, lng: lngNum })
      setMapView((v) => ({ ...v, latitude: latNum, longitude: lngNum, zoom: 15 }))
    }
    setEditId(p.id)
    setShowForm(true)
  }

  const updateCoord = (lng: number, lat: number, label?: string) => {
    setCoord({ lat, lng })
    setMapView((v) => ({ ...v, latitude: lat, longitude: lng, zoom: Math.max(v.zoom, 14) }))
    if (label) setAddressLabel(label)
  }

  const geocodeAddress = async () => {
    if (!addressQuery.trim()) return
    if (!MAPBOX_TOKEN) {
      toast('Thiếu MAPBOX token để tìm địa chỉ')
      return
    }
    setGeoLoading(true)
    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        addressQuery.trim()
      )}.json?access_token=${MAPBOX_TOKEN}&limit=1&language=vi`
      const res = await fetch(url)
      const data = await res.json()
      const feature = data?.features?.[0]
      if (feature?.center?.length === 2) {
        const [lng, lat] = feature.center as [number, number]
        updateCoord(lng, lat, feature.place_name ?? addressQuery.trim())
      } else {
        toast('Không tìm thấy địa chỉ')
      }
    } catch {
      toast('Không thể tìm địa chỉ')
    } finally {
      setGeoLoading(false)
    }
  }

  const save = async () => {
    if (!form.name.trim()) return
    if (!coord) {
      toast('Vui lòng chọn vị trí trên bản đồ hoặc nhập địa chỉ')
      return
    }
    setSaving(true)
    try {
      const body = {
        name: form.name,
        trigger_radius: Number(form.trigger_radius),
        lat: coord.lat,
        lng: coord.lng,
      }
      if (editId) {
        const updated = (await updateMerchantPoi(editId, body)) as Partial<Poi>
        setPois(pois.map((p) => (p.id === editId ? { ...p, ...updated } : p)))
        toast('Đã cập nhật POI')
      } else {
        const created = await createMerchantPoi(body)
        setPois([...pois, created as Poi])
        toast('Đã tạo POI mới')
      }
      setShowForm(false)
    } catch {
      toast('Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const del = async (id: string) => {
    if (!confirm('Xoá POI này?')) return
    try {
      await deleteMerchantPoi(id)
      setPois(pois.filter((p) => p.id !== id))
      toast('Đã xoá')
    } catch {
      toast('Không thể xoá')
    }
  }

  return (
    <>
      <div className="md-stagger">
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={openNew}>+ Thêm địa điểm</button>
        </div>

        {showForm && (
          <div className="md-card md-form-card">
            <div className="md-card-label">{editId ? 'Chỉnh sửa' : 'Tạo mới'}</div>
            <div className="md-card-title" style={{ marginBottom: 18 }}>Thông tin địa điểm</div>
            <div className="md-form">
              <div className="md-field">
                <label className="md-label">Tên địa điểm *</label>
                <input className="md-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ví dụ: Bún bò Huế Mụ Rơi" />
              </div>
              <div className="md-field">
                <label className="md-label">Địa chỉ</label>
                <div className="md-row" style={{ alignItems: 'center' }}>
                  <input className="md-input" value={addressQuery} onChange={(e) => setAddressQuery(e.target.value)} placeholder="Nhập địa chỉ để định vị" />
                  <button className="btn-secondary" onClick={geocodeAddress} disabled={geoLoading}>
                    {geoLoading ? 'Đang tìm…' : 'Tìm'}
                  </button>
                </div>
                {addressLabel && <div style={{ marginTop: 6, fontSize: 12, color: 'var(--muted)' }}>📍 {addressLabel}</div>}
              </div>
              <div className="md-map-shell">
                <div className="md-map-bar">Chọn vị trí trên bản đồ</div>
                {MAPBOX_TOKEN ? (
                  <div className="md-map">
                    <MapView
                      {...mapView}
                      onMove={(evt) => setMapView(evt.viewState)}
                      onClick={(evt) => updateCoord(evt.lngLat.lng, evt.lngLat.lat)}
                      mapStyle="mapbox://styles/mapbox/streets-v12"
                      mapboxAccessToken={MAPBOX_TOKEN}
                      style={{ width: '100%', height: '100%' }}
                    >
                      {coord && (
                        <Marker longitude={coord.lng} latitude={coord.lat} anchor="center">
                          <div className="md-marker" />
                        </Marker>
                      )}
                    </MapView>
                  </div>
                ) : (
                  <div className="md-map-fallback">Thiếu MAPBOX token để hiển thị bản đồ</div>
                )}
              </div>
              <div className="md-field">
                <label className="md-label">Bán kính kích hoạt (mét)</label>
                <input className="md-input" value={form.trigger_radius} onChange={(e) => setForm({ ...form, trigger_radius: e.target.value })} type="number" min={10} max={500} />
              </div>
              <div className="md-row">
                <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
                <button className="btn-secondary" onClick={() => setShowForm(false)}>Huỷ</button>
              </div>
            </div>
          </div>
        )}

        <div className="md-card" style={{ padding: 0, overflow: 'hidden' }}>
          {pois.length === 0
            ? <div className="md-empty"><div className="md-empty-icon">📍</div>Chưa có địa điểm nào. Hãy thêm POI đầu tiên!</div>
            : (
              <div className="md-table-wrap">
                <table className="md-table">
                  <thead>
                    <tr>
                      <th>Tên địa điểm</th>
                      <th>Trạng thái</th>
                      <th>Đánh giá</th>
                      <th>Bán kính</th>
                      <th>Ngày tạo</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {pois.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.name}</td>
                        <td><StatusBadge status={p.status} /></td>
                        <td>⭐ {fmtRating(p.average_rating)}</td>
                        <td>{p.trigger_radius}m</td>
                        <td style={{ color: 'var(--muted)' }}>{fmtDate(p.created_at)}</td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-icon" onClick={() => openEdit(p)} title="Sửa">✏️</button>
                            <button className="btn-danger" onClick={() => del(p.id)}>Xoá</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
        </div>
      </div>
    </>
  )
}
