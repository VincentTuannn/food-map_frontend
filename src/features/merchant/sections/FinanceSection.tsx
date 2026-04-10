import type { MerchantProfile } from '../../../api/services/merchant'
import { StatusBadge } from '../components/StatusBadge'

export function FinanceSection({ profile }: { profile: MerchantProfile | null }) {
  const plans = [
    { name: 'Starter', price: '199.000', period: '/tháng', features: ['5 POI', '1.000 TTS credits', 'Basic analytics', 'Email support'], featured: false },
    { name: 'Growth', price: '599.000', period: '/tháng', features: ['20 POI', '5.000 TTS credits', 'Full analytics + heatmap', 'Push notification', 'Priority support'], featured: true },
    { name: 'Enterprise', price: 'Liên hệ', period: '', features: ['Không giới hạn POI', 'TTS credits không giới hạn', 'API riêng', 'Account manager', 'SLA 99.9%'], featured: false },
  ]

  return (
    <>
      <div className="md-stagger">
        <div className="md-card">
          <div className="md-card-label">Gói hiện tại</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="md-card-title">Growth Plan</div>
              <div className="md-card-sub">Gia hạn tự động vào ngày 15/05/2025</div>
            </div>
            <StatusBadge status={profile?.subscription_status ?? 'ACTIVE'} />
          </div>
        </div>

        <div className="md-grid-3 md-section-gap">
          {plans.map((plan) => (
            <div key={plan.name} className={`tier-card${plan.featured ? ' featured' : ''}`}>
              {plan.featured && <div className="badge badge-pending" style={{ marginBottom: 10 }}>Phổ biến nhất</div>}
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--muted)' }}>{plan.name}</div>
              <div className="tier-price">{plan.price}<span style={{ fontSize: 14, fontWeight: 400, color: 'var(--muted)' }}>đ</span></div>
              {plan.period && <div className="tier-period">{plan.period}</div>}
              <ul className="tier-features">
                {plan.features.map((f) => <li key={f}>{f}</li>)}
              </ul>
              <button className={plan.featured ? 'btn-primary' : 'btn-secondary'} style={{ width: '100%' }}>
                {plan.featured ? 'Gói hiện tại' : 'Chọn gói'}
              </button>
            </div>
          ))}
        </div>

        <div className="md-card md-section-gap">
          <div className="md-card-label">Quảng cáo</div>
          <div className="md-card-title" style={{ marginBottom: 6 }}>Sponsored POI</div>
          <div className="md-card-sub" style={{ marginBottom: 18 }}>Nạp tiền để ưu tiên hiển thị POI của bạn trên bản đồ khi khách ở gần.</div>
          <div className="md-grid-2">
            <div className="md-field">
              <label className="md-label">Số tiền nạp (VNĐ)</label>
              <input className="md-input" type="number" placeholder="100000" />
            </div>
            <div className="md-field">
              <label className="md-label">Phương thức thanh toán</label>
              <select className="md-select">
                <option>MoMo</option>
                <option>VNPay</option>
                <option>Thẻ quốc tế (Stripe)</option>
              </select>
            </div>
          </div>
          <button className="btn-primary" style={{ marginTop: 14 }}>💳 Nạp tiền ngay</button>
        </div>
      </div>
    </>
  )
}
