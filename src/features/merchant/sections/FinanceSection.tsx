import type { MerchantProfile } from '../../../api/services/merchant'
import { StatusBadge } from '../components/StatusBadge'

import { payServiceFee } from '../../../api/services/payment'
import { useAppStore } from '../../../shared/store/appStore'
import { useState } from 'react'

export function FinanceSection({ profile }: { profile: MerchantProfile | null }) {
  const showToast = useAppStore((s) => s.showToast)
  const [amount, setAmount] = useState('')
  const merchantId = profile?.id || 'mock-merchant-id'

  const handlePayService = async () => {
    try {
      const res = await payServiceFee(merchantId, Number(amount))
      if (res.success) {
        showToast({ title: 'Thanh toán thành công', message: `Số tiền: ${amount} VNĐ` })
      } else {
        showToast({ title: 'Thanh toán thất bại', message: res.message })
      }
    } catch (e) {
      showToast({ title: 'Thanh toán thất bại', message: (e as any)?.message || 'Error' })
    }
  }
  const plans = [
    { name: 'Starter', price: '199.000', period: '/tháng', features: ['5 POI', '1.000 TTS credits', 'Basic analytics', 'Email support'], featured: false },
    { name: 'Growth', price: '599.000', period: '/tháng', features: ['20 POI', '5.000 TTS credits', 'Full analytics + heatmap', 'Push notification', 'Priority support'], featured: true },
    { name: 'Enterprise', price: 'Liên hệ', period: '', features: ['Không giới hạn POI', 'TTS credits không giới hạn', 'API riêng', 'Account manager', 'SLA 99.9%'], featured: false },
  ]

  return (
    <>
      <div className="flex flex-col gap-8">
        {/* Current Plan Card */}
        <div className="rounded-2xl bg-white/5 border border-[#f3f3f3] shadow p-7 flex flex-col gap-4">
          <div className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-2">Gói hiện tại</div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="font-playfair text-lg font-semibold text-white">Growth Plan</div>
              <div className="text-sm text-[#bbb]">Gia hạn tự động vào ngày 15/05/2025</div>
            </div>
            <StatusBadge status={profile?.subscription_status ?? 'ACTIVE'} />
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div key={plan.name} className={`rounded-2xl border shadow p-7 flex flex-col items-center gap-3 ${plan.featured ? 'border-amber-400 bg-gradient-to-br from-amber-50/10 to-amber-100/0' : 'border-[#f3f3f3] bg-white/5'}` }>
              {plan.featured && <div className="mb-2 px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 text-xs font-bold">Phổ biến nhất</div>}
              <div className="text-base font-semibold text-amber-700">{plan.name}</div>
              <div className="text-3xl font-extrabold text-[#B85C38]">{plan.price}<span className="text-base font-normal text-[#8B7355]">đ</span></div>
              {plan.period && <div className="text-xs text-[#8B7355]">{plan.period}</div>}
              <ul className="w-full mt-2 mb-4 space-y-1 text-sm text-[#4A3728]">
                {plan.features.map((f) => <li key={f} className="flex items-center gap-2"><span className="text-green-500">✔</span>{f}</li>)}
              </ul>
              <button className={`w-full rounded-full py-2.5 font-semibold transition ${plan.featured ? 'bg-amber-500 text-white hover:bg-amber-600' : 'bg-white text-[#8B7355] border border-[#E8D9C5] hover:bg-[#F5EDE0]'}`}>{plan.featured ? 'Gói hiện tại' : 'Chọn gói'}</button>
            </div>
          ))}
        </div>

        {/* Sponsored POI Card */}
        <div className="rounded-2xl bg-white/5 border border-[#f3f3f3] shadow p-7 flex flex-col gap-4">
          <div className="text-xs uppercase tracking-widest text-amber-600 font-bold mb-2">Quảng cáo</div>
          <div className="font-playfair text-lg font-semibold text-white mb-1">Sponsored POI</div>
          <div className="text-sm text-[#bbb] mb-4">Nạp tiền để ưu tiên hiển thị POI của bạn trên bản đồ khi khách ở gần.</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#8B7355]">Số tiền nạp (VNĐ)</label>
              <input className="rounded-lg border border-[#E8D9C5] px-4 py-2 bg-white/80 text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-amber-400" type="number" placeholder="100000" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-[#8B7355]">Phương thức thanh toán</label>
              <select className="rounded-lg border border-[#E8D9C5] px-4 py-2 bg-white/80 text-[#4A3728] focus:outline-none focus:ring-2 focus:ring-amber-400">
                <option>MoMo</option>
                <option>VNPay</option>
                <option>Thẻ quốc tế (Stripe)</option>
              </select>
            </div>
          </div>
          <button className="w-full rounded-full py-3 mt-2 bg-amber-500 text-white font-bold hover:bg-amber-600 transition" onClick={handlePayService}>💳 Nạp tiền ngay</button>
        </div>
      </div>
    </>
  )
}
