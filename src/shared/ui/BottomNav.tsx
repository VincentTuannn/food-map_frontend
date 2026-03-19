import { NavLink } from 'react-router-dom'

function tabClass(isActive: boolean) {
  return `navLink ${isActive ? 'navLinkActive' : ''}`
}

export function BottomNav() {
  return (
    <nav className="bottomNav" aria-label="Bottom navigation">
      <div className="bottomNavInner">
        <NavLink to="/tourist/map" className={({ isActive }) => tabClass(isActive)}>
          <span style={{ fontSize: 16 }}>🗺️</span>
          Map
        </NavLink>
        <NavLink to="/tourist/poi/pho-minh" className={({ isActive }) => tabClass(isActive)}>
          <span style={{ fontSize: 16 }}>📍</span>
          POI
        </NavLink>
        <NavLink to="/tourist/premium" className={({ isActive }) => tabClass(isActive)}>
          <span style={{ fontSize: 16 }}>✨</span>
          Premium
        </NavLink>
        <NavLink to="/tourist/start" className={({ isActive }) => tabClass(isActive)}>
          <span style={{ fontSize: 16 }}>👤</span>
          Start
        </NavLink>
      </div>
    </nav>
  )
}

