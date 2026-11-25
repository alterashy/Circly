import React, { useState } from 'react';
import { Heart, MessageCircle, Repeat2, UserPlus, Bell } from 'lucide-react';
import { useCirclyStore } from '../../store/useCirclyStore';

const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return 'now';
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
};

export const ActivityView: React.FC = () => {
  const { activities, getUserById, setCurrentView, openThreadDetail } = useCirclyStore();
  const [filter, setFilter] = useState<'all' | 'likes' | 'replies' | 'follows'>('all');

  const filteredActivities = activities.filter((act) => {
    if (filter === 'all') return true;
    if (filter === 'likes') return act.type === 'like';
    if (filter === 'replies') return act.type === 'reply';
    if (filter === 'follows') return act.type === 'follow';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400" />;
      case 'reply':
        return <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />;
      case 'repost':
        return <Repeat2 className="w-3.5 h-3.5 text-teal-400" />;
      case 'follow':
        return <UserPlus className="w-3.5 h-3.5 text-amber-400" />;
      default:
        return <Bell className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full">
      {/* Activity Filter Header */}
      <div className="p-4 border-b border-[#E2ECE7] dark:border-[#1F2E29] sticky top-0 bg-white/90 dark:bg-[#0B110F]/90 backdrop-glass z-20 transition-colors">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {[
            { id: 'all' as const, label: 'All Activity' },
            { id: 'likes' as const, label: 'Likes' },
            { id: 'replies' as const, label: 'Replies' },
            { id: 'follows' as const, label: 'Follows' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                filter === tab.id
                  ? 'bg-emerald-500 text-white dark:text-black'
                  : 'bg-white dark:bg-[#121A17] border border-[#E2ECE7] dark:border-[#1F2E29] text-[#6E8B7F] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] hover:bg-emerald-50/50 dark:hover:bg-[#16221E]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Stream */}
      <div className="divide-y divide-[#E2ECE7] dark:divide-[#1F2E29]/60">
        {filteredActivities.length === 0 ? (
          <div className="py-16 text-center text-[#6E8B7F] dark:text-[#5B756C]">
            <p className="text-sm font-medium">No activity in this category</p>
          </div>
        ) : (
          filteredActivities.map((act) => {
            const actor = getUserById(act.userId);
            return (
              <div
                key={act.id}
                onClick={() => {
                  if (act.targetPostId) {
                    openThreadDetail(act.targetPostId);
                  } else {
                    setCurrentView('profile', { profileUserId: actor.id });
                  }
                }}
                className="p-4 flex items-center justify-between gap-3 hover:bg-emerald-50/50 dark:hover:bg-[#121A17]/40 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={actor.avatar}
                      alt={actor.fullName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-[#E2ECE7] dark:ring-[#1F2E29]"
                    />
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-white dark:bg-[#121A17] border border-[#E2ECE7] dark:border-[#1F2E29] flex items-center justify-center">
                      {getIcon(act.type)}
                    </div>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs text-[#0B1612] dark:text-[#F2FBF7] leading-snug">
                      <span className="font-bold hover:underline">{actor.fullName}</span>{' '}
                      <span className="text-[#6E8B7F] dark:text-[#8BA49B]">{act.snippet}</span>
                    </p>
                    <span className="text-[11px] text-[#6E8B7F] dark:text-[#5B756C] mt-0.5 inline-block">
                      {formatTimeAgo(act.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
