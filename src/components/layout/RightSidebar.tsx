import React, { useRef } from 'react';
import { 
  Search, 
  TrendingUp, 
  Users, 
  UserPlus, 
  UserCheck, 
  ArrowRight,
  Command,
  HelpCircle,
  Check
} from 'lucide-react';
import { useCirclyStore } from '../../store/useCirclyStore';
import { TRENDING_TAGS } from '../../services/mockData';

export const RightSidebar: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    setCurrentView, 
    users, 
    currentUserId, 
    toggleFollow,
    addToast
  } = useCirclyStore();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Pick up to 3 suggested users that are not the current user
  const suggestedUsers = users
    .filter((u) => u.id !== currentUserId)
    .slice(0, 3);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentView('explore', { searchQuery: searchQuery.trim() });
    }
  };

  const handleTagClick = (tag: string) => {
    setSearchQuery(tag);
    setCurrentView('explore', { searchQuery: tag });
  };

  return (
    <aside className="hidden lg:flex flex-col justify-between w-80 xl:w-92 2xl:w-96 shrink-0 h-full py-6 pl-4 xl:pl-6 select-none border-l border-[#E2ECE7] dark:border-[#1F2E29]/60 bg-[#F4F8F6]/80 dark:bg-[#0B110F]/40 overflow-hidden transition-colors">
      
      {/* Scrollable Main Widgets Area */}
      <div className="space-y-4 overflow-y-auto pr-1 flex-1 pb-3">
        {/* 1. Global Search Bar Widget */}
        <form onSubmit={handleSearchSubmit} className="relative w-full">
          <div className="relative flex items-center group">
            <Search className="w-4 h-4 text-[#6E8B7F] dark:text-[#8BA49B] absolute left-3.5 group-focus-within:text-emerald-500 dark:group-focus-within:text-emerald-400 transition-colors pointer-events-none" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search loops, #tags, or creators..."
              className="w-full bg-white dark:bg-[#121A17] border border-[#E2ECE7] dark:border-[#1F2E29] hover:border-emerald-500/30 dark:hover:border-[#2D423B] focus:border-emerald-500/50 text-sm text-[#0B1612] dark:text-[#F2FBF7] placeholder-[#6E8B7F] dark:placeholder-[#5B756C] pl-10 pr-12 py-2.5 rounded-xl focus:outline-none transition-colors cursor-text"
            />
            <div 
              onClick={() => searchInputRef.current?.focus()}
              className="absolute right-3 flex items-center gap-1 text-[10px] text-[#6E8B7F] dark:text-[#5B756C] font-mono px-1.5 py-0.5 rounded-md bg-[#EEF7F3] dark:bg-[#0B110F] border border-[#E2ECE7] dark:border-[#1F2E29] cursor-pointer hover:text-emerald-500 dark:hover:text-emerald-400 hover:border-emerald-500/30 transition-colors"
            >
              <Command className="w-2.5 h-2.5" /> K
            </div>
          </div>
        </form>

        {/* 2. Trending Circles / Tags Widget */}
        <div className="rounded-xl bg-white/90 dark:bg-[#121A17]/70 border border-[#E2ECE7] dark:border-[#1F2E29] p-4.5 backdrop-glass">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h3 className="text-xs font-bold text-[#0B1612] dark:text-[#F2FBF7] uppercase tracking-wider">
                Trending Topics
              </h3>
            </div>
            <button
              onClick={() => setCurrentView('explore')}
              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-0.5 transition-all cursor-pointer active:scale-95"
            >
              <span>Explore</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-1.5">
            {TRENDING_TAGS.slice(0, 4).map((item) => (
              <button
                key={item.tag}
                onClick={() => handleTagClick(item.tag)}
                className="w-full p-2.5 rounded-lg hover:bg-emerald-50/60 dark:hover:bg-[#16221E] text-left transition-all flex items-center justify-between group cursor-pointer active:scale-[0.98]"
              >
                <div>
                  <p className="text-xs font-bold text-[#1F3029] dark:text-[#CBDDD5] group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                    {item.tag}
                  </p>
                  <p className="text-[10px] text-[#6E8B7F] dark:text-[#5B756C] mt-0.5">{item.count}</p>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 font-semibold transition-all flex items-center gap-1">
                  <span>View</span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 3. Who to Follow / Suggested Connections */}
        <div className="rounded-xl bg-white/90 dark:bg-[#121A17]/70 border border-[#E2ECE7] dark:border-[#1F2E29] p-4.5 backdrop-glass">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h3 className="text-xs font-bold text-[#0B1612] dark:text-[#F2FBF7] uppercase tracking-wider">
                Circles to Join
              </h3>
            </div>
            <button
              onClick={() => setCurrentView('explore')}
              className="text-[11px] font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-all cursor-pointer active:scale-95"
            >
              See all
            </button>
          </div>

          <div className="space-y-3">
            {suggestedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between gap-2.5">
                <div
                  onClick={() => setCurrentView('profile', { profileUserId: user.id })}
                  className="flex items-center gap-2.5 min-w-0 cursor-pointer group flex-1 active:opacity-85 transition-opacity"
                >
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-[#E2ECE7] dark:ring-[#1F2E29] group-hover:ring-emerald-400/60 transition-all"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1">
                      <p className="text-xs font-bold text-[#0B1612] dark:text-[#F2FBF7] truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                        {user.fullName}
                      </p>
                      {user.badge && (
                        <span className="text-[9px] px-1 py-0.5 rounded-sm bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-medium inline-flex items-center justify-center">
                          <Check className="w-2.5 h-2.5" />
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-[#6E8B7F] dark:text-[#8BA49B] truncate">@{user.username}</p>
                  </div>
                </div>

                <button
                  onClick={() => toggleFollow(user.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer active:scale-95 ${
                    user.isFollowing
                      ? 'border border-[#E2ECE7] dark:border-[#1F2E29] bg-white dark:bg-[#0B110F] text-[#476357] dark:text-[#8BA49B] hover:text-rose-500 dark:hover:text-rose-400 hover:border-rose-500/40'
                      : 'bg-emerald-500 text-white dark:text-black hover:bg-emerald-400'
                  }`}
                >
                  {user.isFollowing ? (
                    <>
                      <UserCheck className="w-3 h-3 text-emerald-500 dark:text-emerald-400" />
                      <span>In Circle</span>
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-3 h-3" />
                      <span>Join</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4. Sticky Bottom Footer */}
      <div className="pt-3.5 mt-auto border-t border-[#E2ECE7] dark:border-[#1F2E29]/60 px-2 flex items-center justify-between text-[11px] text-[#6E8B7F] dark:text-[#5B756C] shrink-0 bg-white/80 dark:bg-[#0B110F]/80 backdrop-glass">
        <div className="flex items-center gap-3">
          <span 
            onClick={() => setCurrentView('feed')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors active:scale-95"
          >
            Circly Web
          </span>
          <span>•</span>
          <span 
            onClick={() => addToast('Circly stores data in your local session', 'info')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors active:scale-95"
          >
            Privacy
          </span>
          <span>•</span>
          <span 
            onClick={() => addToast('Shortcuts: [N] New Loop, [Esc] Close Modal, [/] Search', 'info')}
            className="hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors active:scale-95"
          >
            Shortcuts
          </span>
        </div>
        <span>© 2026</span>
      </div>

    </aside>
  );
};
