import { Navigate, Route, Routes, Outlet } from 'react-router-dom'
import { useAppStore } from './shared/store/appStore'

// --- TOURIST MODULES ---
import { StartPage } from './features/tourist/StartPage'
import { MapPage } from './features/tourist/MapPage'
import { PoiPage } from './features/tourist/PoiPage'
import { PremiumPage } from './features/tourist/PremiumPage'
import { LoginPage } from './features/tourist/LoginPage'
import { RegisterPage } from './features/tourist/RegisterPage'

// --- MERCHANT MODULES ---
import { MerchantLayout } from './features/merchant/MerchantLayout'
import { MerchantHomePage } from './features/merchant/MerchantHomePage'
import { MerchantPoisPage } from './features/merchant/MerchantPoisPage'
import { MerchantPromotionsPage } from './features/merchant/MerchantPromotionsPage'
import { MerchantAnalyticsPage } from './features/merchant/MerchantAnalyticsPage'
import { MerchantBillingPage } from './features/merchant/MerchantBillingPage'

// --- ADMIN MODULES ---
import { AdminLayout } from './features/admin/AdminLayout'
import { AdminDashboard } from './features/admin/AdminDashboard'
import { AdminUsers } from './features/admin/AdminUsers'
import { AdminMerchants } from './features/admin/AdminMerchants'
import { AdminAccounts } from './features/admin/AdminAccounts'
import { AdminPois } from './features/admin/AdminPois'
import { AdminReviews } from './features/admin/AdminReviews'
import { AdminTours } from './features/admin/AdminTours'
import { AdminPromotions } from './features/admin/AdminPromotions'
import { AdminTransactions } from './features/admin/AdminTransactions'
import { AdminTracking } from './features/admin/AdminTracking'

// --- SHARED ---
import { NotFoundPage } from './shared/ui/NotFoundPage'

// Kiểm tra đăng nhập Tourist
function TouristAuthRoute() {
  const token = useAppStore(s => s.userToken)
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}

export function App() {
  return (
    <Routes>
      {/* 1. MẶC ĐỊNH */}
      <Route path="/" element={<Navigate to="/tourist/start" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* 2. TOURIST ROUTES */}
      <Route path="/tourist" element={<TouristAuthRoute />}>
        <Route path="start" element={<StartPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="poi/:poiId" element={<PoiPage />} />
        <Route path="premium" element={<PremiumPage />} />
      </Route>

      {/* 3. MERCHANT ROUTES */}
      <Route path="/merchant" element={<MerchantLayout />}>
        <Route index element={<MerchantHomePage />} />
        <Route path="pois" element={<MerchantPoisPage />} />
        <Route path="promotions" element={<MerchantPromotionsPage />} />
        <Route path="analytics" element={<MerchantAnalyticsPage />} />
        <Route path="billing" element={<MerchantBillingPage />} />
      </Route>

      {/* 4. ADMIN ROUTES */}
      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="merchants" element={<AdminMerchants />} />
        <Route path="accounts" element={<AdminAccounts />} />
        <Route path="pois" element={<AdminPois />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="tours" element={<AdminTours />} />
        <Route path="promotions" element={<AdminPromotions />} />
        <Route path="transactions" element={<AdminTransactions />} />
        <Route path="tracking" element={<AdminTracking />} />
      </Route>

      {/* 5. CÁC ĐIỀU HƯỚNG CŨ (COMPATIBILITY) */}
      <Route path="/start" element={<Navigate to="/tourist/start" replace />} />
      <Route path="/map" element={<Navigate to="/tourist/map" replace />} />
      <Route path="/poi/:poiId" element={<PoiPage />} />

      {/* 6. NOT FOUND */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}