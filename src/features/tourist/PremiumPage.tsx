import { useState } from 'react'
import { useAppStore } from '../../shared/store/appStore'
import { AppShell } from '../../shared/ui/AppShell'

type Plan = { id: string; name: string; price: string; perks: string[] }

const PLANS: Plan[] = [
  {
    id: 'pro-tour',
    name: 'Pro Tour',
    price: '49.000đ',
    perks: ['Mở khóa POI nâng cao', 'Offline cache (audio/text)', 'Không quảng cáo'],
  },
  {
    id: 'celebrity-voice',
    name: 'Celebrity Voice',
    price: '79.000đ',
    perks: ['Giọng đọc chất lượng cao', 'Tự động phát khi vào bán kính', 'Ưu tiên tải nhanh'],
  },
  {
    id: 'ai-voice',
    name: 'AI Voice+',
    price: '29.000đ',
    perks: ['TTS đa ngôn ngữ', 'Tùy chỉnh tốc độ/giọng', 'Chất lượng ổn định'],
  },
]

export function PremiumPage() {
  const showToast = useAppStore((s) => s.showToast)
  const [selected, setSelected] = useState<string>('pro-tour')

  return (
    <AppShell>
      <div className="card cardPad">
        <div className="rowBetween">
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>Premium</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>
              UI demo cho luồng thanh toán. Tích hợp cổng thanh toán sẽ làm ở backend + redirect.
            </div>
          </div>
          <span className="pill">Payment (mock)</span>
        </div>

        <div className="hr" />

        <div style={{ display: 'grid', gap: 10 }}>
          {PLANS.map((p) => (
            <button
              key={p.id}
              className={`btn ${selected === p.id ? 'btnPrimary' : ''}`}
              style={{ textAlign: 'left' }}
              onClick={() => setSelected(p.id)}
            >
              <div className="rowBetween">
                <div>
                  <div style={{ fontWeight: 900 }}>{p.name}</div>
                  <div style={{ color: 'var(--muted)', fontSize: 13 }}>{p.perks.join(' · ')}</div>
                </div>
                <span className="pill">{p.price}</span>
              </div>
            </button>
          ))}
        </div>

        <div style={{ height: 12 }} />

        <div className="row">
          <button
            className="btn btnPrimary"
            onClick={() => showToast({ title: 'Thanh toán (demo)', message: `Plan: ${selected}` })}
          >
            Mua ngay
          </button>
          <button className="btn" onClick={() => showToast({ title: 'Khôi phục giao dịch (demo)' })}>
            Restore
          </button>
        </div>
      </div>
    </AppShell>
  )
}

