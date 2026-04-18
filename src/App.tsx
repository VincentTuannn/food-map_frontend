import { Navigate, Route, Routes, Outlet } from 'react-router-dom';
import './shared/i18n/i18n';
import { useAppStore } from './shared/store/appStore'
import type { AuthRole } from './api/services/identity'

// --- TOURIST MODULES ---

import { ProfileTab } from './features/tourist/ProfileTab'
import { MapPage } from './features/tourist/MapPage'
import { PoiPage } from './features/tourist/PoiPage'
import { PremiumPage } from './features/tourist/PremiumPage'
import { MyToursPage } from './features/tourist/MyToursPage'
import MyTourDetailPage from './features/tourist/MyTourDetailPage'
import { SharedTourPage } from './features/tourist/SharedTourPage'
import { LoginPage } from './features/tourist/LoginPage'
import { RegisterPage } from './features/tourist/RegisterPage'
import  RoutePage  from './features/tourist/RoutePage'
import { MerchantDashboard } from './features/merchant/MerchantDashboard'
import { MerchantRegisterPage } from './features/merchant/MerchantRegisterPage'

// Wrapper: Nếu merchant chưa active chỉ cho phép thanh toán
import { useEffect, useState } from 'react'
import { getMerchantProfile } from './api/services/merchant'
import { MerchantSubscribePage } from './features/merchant/MerchantSubscribePage'
function MerchantDashboardWrapper() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    getMerchantProfile().then(setProfile).finally(() => setLoading(false))
  }, [])
  if (loading) return <div>Đang tải...</div>
  if (profile?.subscription_status !== 'ACTIVE') {
    return (
      <div >
        <h2>Tài khoản chưa được kích hoạt</h2>
        <p>Vui lòng chọn gói dịch vụ và thanh toán để mở khóa tài khoản merchant.</p>
        <MerchantSubscribePage />
      </div>
    )
  }
  return <MerchantDashboard />
}

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
import { AdminActiveUsers } from './features/admin/AdminActiveUsers'

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

function RoleRoute({ allowed }: { allowed: AuthRole[] }) {
  const token = useAppStore(s => s.userToken)
  const role = useAppStore(s => s.userRole)
  if (!token) return <Navigate to="/login" replace />
  if (!role) return <Navigate to="/login" replace />
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

      {/* Merchant Register */}
      <Route path="/merchant/register" element={<MerchantRegisterPage />} />

      {/* 2. TOURIST ROUTES */}
      <Route path="/tourist" element={<TouristAuthRoute />}>
        <Route path="start" element={<ProfileTab />} />
        <Route path="map" element={<MapPage />} />
        <Route path="route" element={<RoutePage />} />
        <Route path="poi/:poiId" element={<PoiPage />} />
        <Route path="premium" element={<PremiumPage />} />
        <Route path="tours" element={<MyToursPage />} />
        <Route path="tours/:tourId" element={<MyTourDetailPage />} />
      </Route>


      <Route path="/tour/shared/:shareToken" element={<SharedTourPage />} />

      <Route path="/merchant" element={<RoleRoute allowed={['MERCHANT']} />}>
        <Route index element={<MerchantDashboardWrapper />} />
        <Route path="*" element={<MerchantDashboardWrapper />} />
      </Route>

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
        <Route path="active-users" element={<AdminActiveUsers />} />

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