import { NavLink, useLocation } from 'react-router-dom';
import { Map, Route, Sparkles, User } from 'lucide-react';

const tabs = [
  { id: 'map', label: 'Bản đồ', icon: Map, to: '/tourist/map' },
  { id: 'route', label: 'Lộ trình', icon: Route, to: '/tourist/route' },
  { id: 'premium', label: 'Premium', icon: Sparkles, to: '/tourist/premium' },
  { id: 'profile', label: 'Tôi', icon: User, to: '/tourist/start' },
];

function getActiveTab(pathname: string) {
  if (pathname.startsWith('/tourist/map')) return 'map';
  if (pathname.startsWith('/tourist/route') || pathname.startsWith('/tourist/my-tours')) return 'route';
  if (pathname.startsWith('/tourist/premium')) return 'premium';
  if (pathname.startsWith('/tourist/start')) return 'profile';
  return 'map';
}

const BottomNav = () => {
  const location = useLocation();
  const activeTab = getActiveTab(location.pathname);
  return (
    <nav className="fixed h-21.25 bottom-0 left-0 right-0 bg-white/90 border-t border-gray-200 py-2 px-2 flex justify-around items-center shadow-lg z-50 backdrop-blur-md">
      <div className='mx-auto w-full max-w-2xl lg:max-w-4xl flex items-center justify-between px-4 pt-2 pb-3'>
        {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <NavLink
            key={tab.id}
            to={tab.to}
            className={({ isActive: navActive }) =>
              `flex flex-col items-center gap-1 py-1 px-3 rounded-lg transition-all duration-150 ${isActive || navActive ? 'text-orange-500 bg-orange-50 shadow font-bold scale-105' : 'text-gray-500 hover:text-orange-400'} `
            }
            aria-label={tab.label}
          >
            <Icon size={32} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-xs font-medium">{tab.label}</span>
          </NavLink>
        );
      })}
      </div>
    </nav>
  );
};

export default BottomNav;
