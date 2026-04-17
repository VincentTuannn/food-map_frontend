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
      <div className="min-h-[90vh] flex flex-col items-center justify-center py-10 px-2 sm:px-0 bg-gradient-to-br from-purple-100 via-blue-50 to-cyan-100">
        <div className="w-full max-w-xl mx-auto rounded-3xl bg-white/70 backdrop-blur-2xl shadow-[0_8px_32px_rgba(139,92,246,0.10)] border border-white/60 p-8 sm:p-10 flex flex-col gap-8">
          {/* Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="text-2xl sm:text-3xl font-extrabold text-purple-700 drop-shadow-sm mb-1 flex items-center gap-2">
                <span className="inline-block bg-gradient-to-br from-purple-200 via-blue-100 to-cyan-100 rounded-full px-2 py-1 text-purple-600 text-lg mr-1">★</span>
                {t('tourist.premium.title')}
              </div>
              <div className="text-gray-500 text-sm sm:text-base font-medium">
                {t('tourist.premium.subtitle')}
              </div>
            </div>
            <span className="bg-gradient-to-br from-purple-100 via-blue-100 to-cyan-100 text-purple-700 font-bold px-4 py-1 rounded-full text-xs shadow-sm border border-purple-200 animate-pulse">
              {t('tourist.premium.paymentMock')}
            </span>
          </div>

          {/* Plans */}
          <div className="grid gap-5">
            {PLANS.map((p) => (
              <button
                key={p.id}
                className={`relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 w-full px-6 py-5 rounded-2xl border-2 transition-all duration-300 shadow-md backdrop-blur-lg text-left focus:outline-none
                  ${selected === p.id
                    ? 'border-purple-500 bg-white/90 shadow-purple-200 scale-[1.03]'
                    : 'border-white/60 bg-white/60 hover:border-purple-400 hover:bg-white/80'}
                `}
                onClick={() => setSelected(p.id)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-black text-purple-700 text-lg sm:text-xl drop-shadow">{p.name}</span>
                    {selected === p.id && <span className="ml-2 px-2 py-0.5 rounded-full bg-purple-500 text-white text-xs font-bold animate-fade-in">{t('tourist.premium.selected' as I18nKey)}</span>}
                  </div>
                  <div className="text-gray-500 text-sm sm:text-base font-medium flex flex-wrap gap-1">
                    {p.perks.map((perk, i) => (
                      <span key={i} className="inline-block mr-1 last:mr-0">{perk}{i < p.perks.length - 1 && <span className="text-purple-300">·</span>}</span>
                    ))}
                  </div>
                </div>
                <span className="shrink-0 bg-gradient-to-br from-purple-400 via-blue-400 to-cyan-400 text-white font-extrabold px-5 py-2 rounded-full text-lg shadow-lg border-2 border-white/70">
                  {p.price}
                </span>
                {selected === p.id && (
                  <span className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1 shadow-md animate-bounce">
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <button
              className="flex-1 bg-gradient-to-br from-purple-500 via-blue-500 to-cyan-500 hover:from-purple-600 hover:via-blue-600 hover:to-cyan-600 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-purple-600/30 text-lg flex items-center justify-center gap-2"
              onClick={handlePay}
            >
              <svg width="22" height="22" fill="none" viewBox="0 0 24 24" className="inline-block"><path d="M12 19v-7m0 0V5m0 7h7m-7 0H5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              {t('tourist.premium.buyNow')}
            </button>
            <button
              className="flex-1 bg-white/80 hover:bg-purple-50 text-purple-700 font-bold py-3 rounded-xl transition-all border border-purple-200 shadow"
              onClick={() => showToast({ title: t('tourist.premium.restoreDemo') })}
            >
              {t('tourist.premium.restore')}
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  )
}

