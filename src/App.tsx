import { Navigate, Route, Routes, Outlet } from 'react-router-dom'
import { useAppStore } from './shared/store/appStore'
import type { AuthRole } from './api/services/identity'

// --- TOURIST MODULES ---

import { StartPage } from './features/tourist/StartPage'
import { MapPage } from './features/tourist/MapPage'
import { PoiPage } from './features/tourist/PoiPage'
import { PremiumPage } from './features/tourist/PremiumPage'
import { MyToursPage } from './features/tourist/MyToursPage'
import { MyTourDetailPage } from './features/tourist/MyTourDetailPage'
import { SharedTourPage } from './features/tourist/SharedTourPage'
import { LoginPage } from './features/tourist/LoginPage'
import { RegisterPage } from './features/tourist/RegisterPage'

import { MerchantDashboard } from './features/merchant/MerchantDashboard'
import { MerchantLoginPage } from './features/merchant/MerchantLoginPage'
import { MerchantRegisterPage } from './features/merchant/MerchantRegisterPage'

// --- ADMIN MODULES ---
import { AdminLoginPage } from './features/admin/AdminLoginPage'
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
  const role = useAppStore(s => s.userRole)
  if (!token) return <Navigate to="/login" replace />
  if (role && role !== 'USER') return <Navigate to={resolveHomeByRole(role)} replace />
  return <Outlet />
}

function resolveHomeByRole(role: AuthRole) {
  if (role === 'MERCHANT') return '/merchant'
  if (role === 'ADMIN') return '/admin'
  return '/tourist/start'
}

function RoleRoute({ allowed, fallback = "/login" }: { allowed: AuthRole[], fallback?: string }) {
  const token = useAppStore(s => s.userToken)
  const role = useAppStore(s => s.userRole)
  if (!token) return <Navigate to={fallback} replace />
  if (!role) return <Navigate to={fallback} replace />
  if (!allowed.includes(role)) return <Navigate to={resolveHomeByRole(role)} replace />
  return <Outlet />
}

export function App() {
  return (
    <Routes>
      {/* 1. MẶC ĐỊNH */}
      <Route path="/" element={<Navigate to="/tourist/start" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      
      {/* SEPARATE AUTH ROUTES */}
      <Route path="/admin/login" element={<AdminLoginPage />} />
      <Route path="/merchant/login" element={<MerchantLoginPage />} />
      <Route path="/merchant/register" element={<MerchantRegisterPage />} />

      {/* 2. TOURIST ROUTES */}
      <Route path="/tourist" element={<TouristAuthRoute />}>
        <Route path="start" element={<StartPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="poi/:poiId" element={<PoiPage />} />
        <Route path="premium" element={<PremiumPage />} />
        <Route path="tours" element={<MyToursPage />} />
        <Route path="tours/:tourId" element={<MyTourDetailPage />} />
      </Route>


      <Route path="/tour/shared/:shareToken" element={<SharedTourPage />} />

      <Route path="/merchant" element={<RoleRoute allowed={['MERCHANT']} fallback="/merchant/login" />}>
        <Route index element={<MerchantDashboard />} />
        <Route path="*" element={<MerchantDashboard />} />
      </Route>

      <Route path="/admin" element={<RoleRoute allowed={['ADMIN']} fallback="/admin/login" />}>
        <Route element={<AdminLayout />}>
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
      </Route>

      {/* 5. CÁC ĐIỀU HƯỚNG CŨ (COMPATIBILITY) */}
      <Route path="/start" element={<Navigate to="/tourist/start" replace />} />
      <Route path="/map" element={<Navigate to="/tourist/map" replace />} />
      <Route path="/poi/:poiId" element={<PoiPage />} />
      <Route path="/premium" element={<Navigate to="/tourist/premium" replace />} />
      <Route path="/tour/shared/:shareToken" element={<SharedTourPage />} />

      {/* 6. NOT FOUND */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}