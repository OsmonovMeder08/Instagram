import React from 'react';
import { Home, Search, PlusSquare, Heart, User, Camera } from 'lucide-react';

interface NavigationProps {
  currentView: string;
  onViewChange: (view: string) => void;
  userAvatar?: string;
}

export function Navigation({ currentView, onViewChange, userAvatar }: NavigationProps) {
  const navItems = [
    { id: 'feed', icon: Home, label: 'Главная' },
    { id: 'search', icon: Search, label: 'Поиск' },
    { id: 'create', icon: PlusSquare, label: 'Создать' },
    { id: 'stories', icon: Camera, label: 'Истории' },
    { id: 'notifications', icon: Heart, label: 'Уведомления' },
    { id: 'profile', icon: User, label: 'Профиль' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 md:top-0 md:bottom-auto md:left-0 md:w-64 md:h-screen md:border-r md:border-t-0">
      {/* Desktop Header */}
      <div className="hidden md:block p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          Instagram
        </h1>
      </div>

      {/* Navigation Items */}
      <div className="flex md:flex-col md:space-y-2 md:p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              className={`flex-1 md:flex-none flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 p-3 md:p-3 md:rounded-lg transition-colors ${
                isActive
                  ? 'text-blue-600 md:bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 md:hover:bg-gray-50'
              }`}
            >
              {item.id === 'profile' && userAvatar ? (
                <img
                  src={userAvatar}
                  alt="Profile"
                  className={`w-6 h-6 rounded-full ${isActive ? 'ring-2 ring-blue-600' : ''}`}
                />
              ) : (
                <Icon size={24} />
              )}
              <span className="text-xs md:text-base hidden md:block">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}