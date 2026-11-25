import React from 'react';
import { motion } from 'framer-motion';
import { Compass, Users } from 'lucide-react';
import { useCirclyStore } from '../../store/useCirclyStore';
import { FeedTabType } from '../../types';

interface TabConfig {
  id: FeedTabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const FeedTabs: React.FC = () => {
  const { feedTab, setFeedTab } = useCirclyStore();

  const tabs: TabConfig[] = [
    { id: 'forYou', label: 'For You', icon: Compass },
    { id: 'following', label: 'Following', icon: Users },
  ];

  return (
    <div className="flex border-b border-[#E2ECE7] dark:border-[#1F2E29] bg-white/90 dark:bg-[#0B110F]/90 sticky top-0 z-30 backdrop-glass transition-colors">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = feedTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setFeedTab(tab.id)}
            className={`relative flex-1 py-3.5 flex items-center justify-center gap-2 text-sm font-semibold transition-colors cursor-pointer ${
              isActive ? 'text-[#0B1612] dark:text-[#F2FBF7]' : 'text-[#6E8B7F] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#CBDDD5]'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
            <span>{tab.label}</span>
            {isActive && (
              <motion.div
                layoutId="feedTabUnderline"
                className="absolute bottom-0 left-12 right-12 h-0.5 bg-linear-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-400 rounded-full"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
};
