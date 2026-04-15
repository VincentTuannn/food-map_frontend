import { useState } from 'react'
import { useAppStore } from '../../shared/store/appStore'
import { AppShell } from '../../shared/ui/AppShell'
import { useT } from '../../shared/i18n/useT'

import { payPremium } from '../../api/services/payment'
import type { I18nKey } from '../../shared/i18n/translations'

type Plan = { id: string; name: string; price: string; perks: string[] }

export function PremiumPage() {
  const showToast = useAppStore((s) => s.showToast)
  const t = useT()
  const [selected, setSelected] = useState<string>('pro-tour')

  const userId = 'mock-user-id' // TODO: Lấy userId thực tế từ store/auth nếu có
  const handlePay = async () => {
    try {
      const res = await payPremium(userId, selected)
      if (res.success) {
        showToast({ title: t('tourist.premium.paySuccess' as I18nKey), message: `Plan: ${selected}` })
      } else {
        showToast({ title: t('tourist.premium.payFailed' as I18nKey), message: res.message })
      }
    } catch (e) {
      showToast({ title: t('tourist.premium.payFailed' as I18nKey), message: (e as any)?.message || 'Error' })
    }
  }

  const PLANS: Plan[] = [
    {
      id: 'pro-tour',
      name: t('tourist.premium.plan1.name'),
      price: '49.000đ',
      perks: t('tourist.premium.plan1.perks').split('|'),
    },
    {
      id: 'celebrity-voice',
      name: t('tourist.premium.plan2.name'),
      price: '79.000đ',
      perks: t('tourist.premium.plan2.perks').split('|'),
    },
    {
      id: 'ai-voice',
      name: t('tourist.premium.plan3.name'),
      price: '29.000đ',
      perks: t('tourist.premium.plan3.perks').split('|'),
    },
  ]

  return (
    <AppShell>
      <div className="card cardPad">
        <div className="rowBetween">
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>{t('tourist.premium.title')}</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>
              {t('tourist.premium.subtitle')}
            </div>
          </div>
          <span className="pill">{t('tourist.premium.paymentMock')}</span>
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
              onClick={handlePay}
            >
              {t('tourist.premium.buyNow')}
            </button>
          <button className="btn" onClick={() => showToast({ title: t('tourist.premium.restoreDemo') })}>
            {t('tourist.premium.restore')}
          </button>
        </div>
      </div>
    </AppShell>
  )
}

