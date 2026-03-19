import { Navigate, Route, Routes } from 'react-router-dom'
import { StartPage } from './features/tourist/StartPage'
import { MapPage } from './features/tourist/MapPage'
import { PoiPage } from './features/tourist/PoiPage'
import { PremiumPage } from './features/tourist/PremiumPage'
import { NotFoundPage } from './shared/ui/NotFoundPage'
import { MerchantLayout } from './features/merchant/MerchantLayout'
import { MerchantHomePage } from './features/merchant/MerchantHomePage'
import { MerchantPoisPage } from './features/merchant/MerchantPoisPage'
import { MerchantPromotionsPage } from './features/merchant/MerchantPromotionsPage'
import { MerchantAnalyticsPage } from './features/merchant/MerchantAnalyticsPage'
import { MerchantBillingPage } from './features/merchant/MerchantBillingPage'
import { AdminLayout } from './features/admin/AdminLayout'
import { AdminHomePage } from './features/admin/AdminHomePage'
import { AdminModerationPage } from './features/admin/AdminModerationPage'
import { AdminUsersPage } from './features/admin/AdminUsersPage'
import { AdminConfigPage } from './features/admin/AdminConfigPage'
import { AdminFinancePage } from './features/admin/AdminFinancePage'

export function App() {
  return (
    <Routes>
      {/* New actor-based routes */}
      <Route path="/" element={<Navigate to="/tourist/start" replace />} />

      <Route path="/tourist/start" element={<StartPage />} />
      <Route path="/tourist/map" element={<MapPage />} />
      <Route path="/tourist/poi/:poiId" element={<PoiPage />} />
      <Route path="/tourist/premium" element={<PremiumPage />} />

      <Route path="/merchant" element={<MerchantLayout />}>
        <Route index element={<MerchantHomePage />} />
        <Route path="pois" element={<MerchantPoisPage />} />
        <Route path="promotions" element={<MerchantPromotionsPage />} />
        <Route path="analytics" element={<MerchantAnalyticsPage />} />
        <Route path="billing" element={<MerchantBillingPage />} />
      </Route>

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminHomePage />} />
        <Route path="moderation" element={<AdminModerationPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="config" element={<AdminConfigPage />} />
        <Route path="finance" element={<AdminFinancePage />} />
      </Route>

      {/* Backward-compat redirects (old demo URLs) */}
      <Route path="/start" element={<Navigate to="/tourist/start" replace />} />
      <Route path="/map" element={<Navigate to="/tourist/map" replace />} />
      <Route path="/poi/:poiId" element={<PoiPage />} />
      <Route path="/premium" element={<Navigate to="/tourist/premium" replace />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

