import { NavLink } from 'react-router-dom'
import { useT } from '../i18n/useT'

function tabClass(isActive: boolean) {
  return `navLink ${isActive ? 'navLinkActive' : ''}`
}

export function BottomNav() {
  const t = useT()
  return (
    <nav className="bottomNav" aria-label="Bottom navigation">
      <div className="bottomNavInner" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
        <NavLink to="/tourist/map" className={({ isActive }) => tabClass(isActive)}>
          <span style={{ fontSize: 16 }}>🗺️</span>
          {t('nav.map')}
        </NavLink>
        <NavLink to="/tourist/premium" className={({ isActive }) => tabClass(isActive)}>
          <span style={{ fontSize: 16 }}>✨</span>
          {t('nav.premium')}
        </NavLink>
        <NavLink to="/tourist/start" className={({ isActive }) => tabClass(isActive)}>
          <span style={{ fontSize: 16 }}>👤</span>
          {t('nav.start')}
        </NavLink>
      </div>
    </nav>
  )
}
