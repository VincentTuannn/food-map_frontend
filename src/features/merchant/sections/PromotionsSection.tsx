import { useState } from 'react'
import { createMerchantPromotion, deletePromotion, updatePromotion } from '../../../api/services/merchant'
import { fmtDate } from '../merchantHelpers'
import type { Poi, Promotion } from '../merchantTypes'

type PromotionForm = {
  poi_id: string
  title: string
  discount_type: 'PERCENTAGE' | 'FIXED'
  discount_value: string
  max_usage: string
  start_time: string
  end_time: string
}

export function PromotionsSection({ pois, promotions, setPromotions, toast }: { pois: Poi[]; promotions: Promotion[]; setPromotions: (p: Promotion[]) => void; toast: (m: string) => void }) {
  const [showForm, setShowForm] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const blank: PromotionForm = { poi_id: '', title: '', discount_type: 'PERCENTAGE', discount_value: '', max_usage: '', start_time: '', end_time: '' }
  const [form, setForm] = useState<PromotionForm>(blank)
  const [saving, setSaving] = useState(false)

  const openNew = () => { setForm(blank); setEditId(null); setShowForm(true) }
  const openEdit = (p: Promotion) => {
    setForm({ poi_id: p.poi_id, title: p.title, discount_type: p.discount_type, discount_value: String(p.discount_value), max_usage: String(p.max_usage), start_time: p.start_time.slice(0, 16), end_time: p.end_time.slice(0, 16) })
    setEditId(p.id); setShowForm(true)
  }

  const save = async () => {
    if (!form.title.trim() || !form.poi_id) return
    setSaving(true)
    try {
      const body = { ...form, discount_value: Number(form.discount_value), max_usage: Number(form.max_usage) }
      if (editId) {
        const updated = await updatePromotion(editId, body)
        setPromotions(promotions.map((p) => (p.id === editId ? updated as Promotion : p)))
        toast('Đã cập nhật khuyến mãi')
      } else {
        const created = await createMerchantPromotion(body)
        setPromotions([...promotions, created as Promotion])
        toast('Đã tạo khuyến mãi mới')
      }
      setShowForm(false)
    } catch {
      toast('Có lỗi xảy ra')
    } finally {
      setSaving(false)
    }
  }

  const del = async (id: string) => {
    if (!confirm('Xoá khuyến mãi này?')) return
    try {
      await deletePromotion(id)
      setPromotions(promotions.filter((p) => p.id !== id))
      toast('Đã xoá')
    } catch {
      toast('Không thể xoá')
    }
  }

  const isActive = (p: Promotion) => new Date(p.start_time) <= new Date() && new Date(p.end_time) >= new Date()

  return (
    <>
      <div className="md-stagger">
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-primary" onClick={openNew}>+ Tạo khuyến mãi</button>
        </div>

        {showForm && (
          <div className="md-card md-form-card">
            <div className="md-card-label">{editId ? 'Chỉnh sửa' : 'Tạo mới'}</div>
            <div className="md-card-title" style={{ marginBottom: 18 }}>Chiến dịch E-voucher</div>
            <div className="md-form">
              <div className="md-field">
                <label className="md-label">Địa điểm *</label>
                <select className="md-select" value={form.poi_id} onChange={(e) => setForm({ ...form, poi_id: e.target.value })}>
                  <option value="">— Chọn POI —</option>
                  {pois.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="md-field">
                <label className="md-label">Tên chương trình *</label>
                <input className="md-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Ví dụ: Giảm 20% cuối tuần" />
              </div>
              <div className="md-grid-2">
                <div className="md-field">
                  <label className="md-label">Loại giảm giá</label>
                  <select className="md-select" value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value as 'PERCENTAGE' | 'FIXED' })}>
                    <option value="PERCENTAGE">Phần trăm (%)</option>
                    <option value="FIXED">Số tiền cố định (VNĐ)</option>
                  </select>
                </div>
                <div className="md-field">
                  <label className="md-label">Giá trị giảm *</label>
                  <input className="md-input" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} type="number" min={0} placeholder={form.discount_type === 'PERCENTAGE' ? '20' : '50000'} />
                </div>
              </div>
              <div className="md-field">
                <label className="md-label">Số lượng voucher tối đa</label>
                <input className="md-input" value={form.max_usage} onChange={(e) => setForm({ ...form, max_usage: e.target.value })} type="number" min={1} placeholder="100" />
              </div>
              <div className="md-grid-2">
                <div className="md-field">
                  <label className="md-label">Bắt đầu</label>
                  <input className="md-input" value={form.start_time} onChange={(e) => setForm({ ...form, start_time: e.target.value })} type="datetime-local" />
                </div>
                <div className="md-field">
                  <label className="md-label">Kết thúc</label>
                  <input className="md-input" value={form.end_time} onChange={(e) => setForm({ ...form, end_time: e.target.value })} type="datetime-local" />
                </div>
              </div>
              <div className="md-row">
                <button className="btn-primary" onClick={save} disabled={saving}>{saving ? 'Đang lưu…' : 'Lưu'}</button>
                <button className="btn-secondary" onClick={() => setShowForm(false)}>Huỷ</button>
              </div>
            </div>
          </div>
        )}

        <div className="md-card" style={{ padding: 0, overflow: 'hidden' }}>
          {promotions.length === 0
            ? <div className="md-empty"><div className="md-empty-icon">🎟</div>Chưa có khuyến mãi nào</div>
            : (
              <div className="md-table-wrap">
                <table className="md-table">
                  <thead>
                    <tr>
                      <th>Tên chương trình</th>
                      <th>Loại</th>
                      <th>Giá trị</th>
                      <th>Giới hạn</th>
                      <th>Thời gian</th>
                      <th>Trạng thái</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {promotions.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 500 }}>{p.title}</td>
                        <td><span className={`badge ${p.discount_type === 'PERCENTAGE' ? 'badge-pct' : 'badge-fixed'}`}>{p.discount_type}</span></td>
                        <td>{p.discount_type === 'PERCENTAGE' ? `${p.discount_value}%` : `${p.discount_value.toLocaleString('vi-VN')}đ`}</td>
                        <td>{p.max_usage}</td>
                        <td style={{ color: 'var(--muted)', fontSize: 11 }}>{fmtDate(p.start_time)} — {fmtDate(p.end_time)}</td>
                        <td><span className={`badge ${isActive(p) ? 'badge-active' : 'badge-inactive'}`}>{isActive(p) ? 'RUNNING' : 'ENDED'}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            <button className="btn-icon" onClick={() => openEdit(p)}>✏️</button>
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
