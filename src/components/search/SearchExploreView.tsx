import React from 'react';
import { Search, TrendingUp, Users, UserPlus, UserCheck } from 'lucide-react';
import { useCirclyStore } from '../../store/useCirclyStore';
import { TRENDING_TAGS } from '../../services/mockData';
import { ThreadCard } from '../feed/ThreadCard';

export const SearchExploreView: React.FC = () => {
  const { 
    searchQuery, 
    setSearchQuery, 
    posts, 
    users, 
    currentUserId, 
    toggleFollow, 
    setCurrentView 
  } = useCirclyStore();

  const filteredPosts = searchQuery.trim()
    ? posts.filter((p) =>
        p.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const suggestedUsers = users.filter((u) => u.id !== currentUserId);

  return (
    <div className="w-full">
      {/* Search Input Bar */}
      <div className="p-4 border-b border-[#E2ECE7] dark:border-[#1F2E29] sticky top-0 bg-white/90 dark:bg-[#0B110F]/90 backdrop-glass z-20 transition-colors">
        <div className="relative flex items-center">
          <Search className="w-4 h-4 text-[#6E8B7F] dark:text-[#8BA49B] absolute left-3.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, topics (#buildinpublic), or creators..."
            className="w-full bg-[#F4F8F6] dark:bg-[#121A17] border border-[#E2ECE7] dark:border-[#1F2E29] text-sm text-[#0B1612] dark:text-[#F2FBF7] placeholder-[#6E8B7F] dark:placeholder-[#5B756C] pl-10 pr-4 py-2.5 rounded-xl focus:outline-none focus:border-emerald-500/50 transition-colors"
            autoFocus
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 text-xs text-[#6E8B7F] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] cursor-pointer"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* If search query exists, show matching results */}
      {searchQuery.trim() ? (
        <div>
          <div className="px-4 py-3 bg-emerald-50/50 dark:bg-[#121A17]/40 border-b border-[#E2ECE7] dark:border-[#1F2E29] text-xs text-[#6E8B7F] dark:text-[#8BA49B]">
            Found {filteredPosts.length} loops matching <span className="text-emerald-600 dark:text-emerald-400 font-semibold">"{searchQuery}"</span>
          </div>

          {filteredPosts.length === 0 ? (
            <div className="py-16 text-center text-[#6E8B7F] dark:text-[#5B756C]">
              <p className="text-sm font-medium">No loops match your search</p>
              <p className="text-xs text-[#6E8B7F] dark:text-[#8BA49B] mt-1">Try exploring trending tags below</p>
            </div>
          ) : (
            <div className="divide-y divide-[#E2ECE7] dark:divide-[#1F2E29]/60">
              {filteredPosts.map((post) => (
                <ThreadCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Default Explore Page Content */
        <div className="p-4 space-y-6">
          
          {/* Trending Topics / Hashtags */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <h2 className="text-xs font-bold text-[#6E8B7F] dark:text-[#8BA49B] uppercase tracking-wider">
                Trending in Circly
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {TRENDING_TAGS.map((item) => (
                <button
                  key={item.tag}
                  onClick={() => setSearchQuery(item.tag)}
                  className="p-3 rounded-xl bg-white dark:bg-[#121A17] border border-[#E2ECE7] dark:border-[#1F2E29] text-left hover:border-emerald-500/40 hover:bg-emerald-50/60 dark:hover:bg-[#16221E] transition-all group cursor-pointer"
                >
                  <p className="text-sm font-bold text-[#0B1612] dark:text-[#F2FBF7] group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                    {item.tag}
                  </p>
                  <p className="text-[11px] text-[#6E8B7F] dark:text-[#5B756C] mt-0.5">{item.count}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Suggested Creators */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-1">
              <Users className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              <h2 className="text-xs font-bold text-[#6E8B7F] dark:text-[#8BA49B] uppercase tracking-wider">
                People to Add to Your Circle
              </h2>
            </div>

            <div className="space-y-2.5">
              {suggestedUsers.map((user) => (
                <div
                  key={user.id}
                  className="p-3.5 rounded-xl bg-white dark:bg-[#121A17] border border-[#E2ECE7] dark:border-[#1F2E29] flex items-center justify-between gap-3 hover:border-emerald-500/30 transition-colors"
                >
                  <div
                    onClick={() => setCurrentView('profile', { profileUserId: user.id })}
                    className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                  >
                    <img
                      src={user.avatar}
                      alt={user.fullName}
                      className="w-10 h-10 rounded-full object-cover ring-1 ring-[#E2ECE7] dark:ring-[#1F2E29]"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-xs text-[#0B1612] dark:text-[#F2FBF7] hover:underline truncate">
                          {user.fullName}
                        </span>
                        {user.badge && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
                            {user.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#6E8B7F] dark:text-[#8BA49B] truncate">@{user.username}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleFollow(user.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                      user.isFollowing
                        ? 'border border-[#E2ECE7] dark:border-[#1F2E29] bg-white dark:bg-[#0B110F] text-[#476357] dark:text-[#8BA49B] hover:text-rose-500 dark:hover:text-rose-400'
                        : 'bg-emerald-500 text-white dark:text-black hover:bg-emerald-400'
                    }`}
                  >
                    {user.isFollowing ? (
                      <>
                        <UserCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                        <span>Following</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-3.5 h-3.5" />
                        <span>Follow</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
