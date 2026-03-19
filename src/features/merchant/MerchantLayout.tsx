import { NavLink, Outlet } from 'react-router-dom'
import { AppShell } from '../../shared/ui/AppShell'

function navClass(isActive: boolean) {
  return `btn ${isActive ? 'btnPrimary' : ''}`
}

export function MerchantLayout() {
  return (
    <AppShell showBottomNav={false}>
      <div className="card cardPad">
        <div className="rowBetween">
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>Merchant Console</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>
              Khu quản trị cho Quán ăn (B2B). UI skeleton để bạn phát triển dần.
            </div>
          </div>
          <span className="pill">/merchant</span>
        </div>

        <div className="hr" />

        <div className="row" style={{ flexWrap: 'wrap' }}>
          <NavLink to="/merchant" end className={({ isActive }) => navClass(isActive)}>
            Tổng quan
          </NavLink>
          <NavLink to="/merchant/pois" className={({ isActive }) => navClass(isActive)}>
            POI & Profile
          </NavLink>
          <NavLink to="/merchant/promotions" className={({ isActive }) => navClass(isActive)}>
            Promotions
          </NavLink>
          <NavLink to="/merchant/analytics" className={({ isActive }) => navClass(isActive)}>
            Analytics
          </NavLink>
          <NavLink to="/merchant/billing" className={({ isActive }) => navClass(isActive)}>
            Billing
          </NavLink>
        </div>

        <div style={{ height: 12 }} />
        <Outlet />
      </div>
    </AppShell>
  )
}

