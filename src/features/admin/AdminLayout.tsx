import { NavLink, Outlet } from 'react-router-dom'
import { AppShell } from '../../shared/ui/AppShell'

function navClass(isActive: boolean) {
  return `btn ${isActive ? 'btnPrimary' : ''}`
}

export function AdminLayout() {
  return (
    <AppShell showBottomNav={false}>
      <div className="card cardPad">
        <div className="rowBetween">
          <div>
            <div style={{ fontSize: 18, fontWeight: 900 }}>Admin Console</div>
            <div style={{ color: 'var(--muted)', fontSize: 13 }}>
              Khu điều phối & kiểm soát hệ thống. UI skeleton (frontend-only).
            </div>
          </div>
          <span className="pill">/admin</span>
        </div>

        <div className="hr" />

        <div className="row" style={{ flexWrap: 'wrap' }}>
          <NavLink to="/admin" end className={({ isActive }) => navClass(isActive)}>
            Tổng quan
          </NavLink>
          <NavLink to="/admin/moderation" className={({ isActive }) => navClass(isActive)}>
            Moderation
          </NavLink>
          <NavLink to="/admin/users" className={({ isActive }) => navClass(isActive)}>
            Users & Merchants
          </NavLink>
          <NavLink to="/admin/config" className={({ isActive }) => navClass(isActive)}>
            Config
          </NavLink>
          <NavLink to="/admin/finance" className={({ isActive }) => navClass(isActive)}>
            Finance
          </NavLink>
        </div>

        <div style={{ height: 12 }} />
        <Outlet />
      </div>
    </AppShell>
  )
}

