import { Navigate, Route, Routes, Outlet } from 'react-router-dom'
import { useAppStore } from './shared/store/appStore'
import type { AuthRole } from './api/services/identity'
import { StartPage } from './features/tourist/StartPage'
import { MapPage } from './features/tourist/MapPage'
import { PoiPage } from './features/tourist/PoiPage'
import { PremiumPage } from './features/tourist/PremiumPage'
import { MyToursPage } from './features/tourist/MyToursPage'
import { MyTourDetailPage } from './features/tourist/MyTourDetailPage'
import { SharedTourPage } from './features/tourist/SharedTourPage'
import { LoginPage } from './features/tourist/LoginPage'
import { RegisterPage } from './features/tourist/RegisterPage'
import { NotFoundPage } from './shared/ui/NotFoundPage'
import { MerchantDashboard } from './features/merchant/MerchantDashboard'
import { AdminLayout } from './features/admin/AdminLayout'
import { AdminHomePage } from './features/admin/AdminHomePage'
import { AdminModerationPage } from './features/admin/AdminModerationPage'
import { AdminUsersPage } from './features/admin/AdminUsersPage'
import { AdminConfigPage } from './features/admin/AdminConfigPage'
import { AdminFinancePage } from './features/admin/AdminFinancePage'

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
      {/* New actor-based routes */}
      <Route path="/" element={<Navigate to="/tourist/start" replace />} />

      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/tourist" element={<TouristAuthRoute />}>
        <Route path="start" element={<StartPage />} />
        <Route path="map" element={<MapPage />} />
        <Route path="poi/:poiId" element={<PoiPage />} />
        <Route path="premium" element={<PremiumPage />} />
        <Route path="tours" element={<MyToursPage />} />
        <Route path="tours/:tourId" element={<MyTourDetailPage />} />
      </Route>

      <Route path="/tour/shared/:shareToken" element={<SharedTourPage />} />

      <Route path="/merchant" element={<RoleRoute allowed={['MERCHANT']} />}>
        <Route index element={<MerchantDashboard />} />
        <Route path="*" element={<MerchantDashboard />} />
      </Route>

      <Route path="/admin" element={<RoleRoute allowed={['ADMIN']} />}>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminHomePage />} />
          <Route path="moderation" element={<AdminModerationPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="config" element={<AdminConfigPage />} />
          <Route path="finance" element={<AdminFinancePage />} />
        </Route>
      </Route>

      {/* Backward-compat redirects (old demo URLs) */}
      <Route path="/start" element={<Navigate to="/tourist/start" replace />} />
      <Route path="/map" element={<Navigate to="/tourist/map" replace />} />
      <Route path="/poi/:poiId" element={<PoiPage />} />
      <Route path="/premium" element={<Navigate to="/tourist/premium" replace />} />
      <Route path="/tour/shared/:shareToken" element={<SharedTourPage />} />

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

