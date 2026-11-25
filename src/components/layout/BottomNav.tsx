import React from 'react';
import { Home, Search, Heart, Bookmark, User } from 'lucide-react';
import { useCirclyStore } from '../../store/useCirclyStore';
import { ViewType } from '../../types';

interface BottomNavItem {
  id: ViewType;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  payload?: { profileUserId?: string };
}

export const BottomNav: React.FC = () => {
  const { currentView, setCurrentView, currentUserId } = useCirclyStore();

  const navItems: BottomNavItem[] = [
    { id: 'feed', icon: Home, label: 'Feed' },
    { id: 'explore', icon: Search, label: 'Search' },
    { id: 'activity', icon: Heart, label: 'Activity' },
    { id: 'bookmarks', icon: Bookmark, label: 'Bookmarks' },
    { id: 'profile', icon: User, label: 'Profile', payload: { profileUserId: currentUserId } },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0B110F]/95 backdrop-glass border-t border-[#E2ECE7] dark:border-[#1F2E29] px-4 py-2 flex items-center justify-around transition-colors">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => setCurrentView(item.id, item.payload || {})}
            className={`flex flex-col items-center gap-1 p-2 transition-all cursor-pointer active:scale-90 ${
              isActive ? 'text-emerald-600 dark:text-emerald-400' : 'text-[#6E8B7F] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7]'
            }`}
          >
            <Icon className={`w-5 h-5 ${isActive ? 'stroke-2.5' : 'stroke-2'}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
