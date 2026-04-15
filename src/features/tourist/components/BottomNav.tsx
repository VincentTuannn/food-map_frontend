// src/components/BottomNav.tsx
import React from 'react';
import { Map, Route, Download, User } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: 'map' | 'route' | 'offline' | 'profile') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'map', label: 'Bản đồ', icon: Map },
    { id: 'route', label: 'Lộ trình', icon: Route },
    { id: 'offline', label: 'Offline', icon: Download },
    { id: 'profile', label: 'Tôi', icon: User },
  ];

  return (
    <div className="bg-white border-t border-gray-200 py-2 px-4 flex justify-around items-center shadow-lg z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex flex-col items-center gap-1 py-1 px-4 transition ${isActive ? 'text-orange-500' : 'text-gray-500'}`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-xs font-medium">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default BottomNav;