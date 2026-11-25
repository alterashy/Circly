import React from 'react';
import { Users } from 'lucide-react';
import { useCirclyStore } from '../../store/useCirclyStore';
import { FeedTabs } from './FeedTabs';
import { InlineComposer } from './InlineComposer';
import { ThreadCard } from './ThreadCard';

export const FeedView: React.FC = () => {
  const { posts, feedTab, getUserById, currentUserId, setFeedTab, setCurrentView } = useCirclyStore();

  const filteredPosts = posts.filter((post) => {
    if (feedTab === 'forYou') return true;
    if (feedTab === 'following') {
      const author = getUserById(post.userId);
      return author.isFollowing || post.userId === currentUserId || post.isReposted;
    }
    return true;
  });

  return (
    <div className="w-full">
      {/* Top Tabs */}
      <FeedTabs />

      {/* Quick Composer */}
      <InlineComposer />

      {/* Stream */}
      <div className="divide-y divide-[#E2ECE7] dark:divide-[#1F2E29]/60">
        {filteredPosts.length === 0 ? (
          <div className="py-20 text-center text-[#6E8B7F] dark:text-[#5B756C] px-4">
            <Users className="w-8 h-8 text-[#CBDDD5] dark:text-[#1F2E29] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#0B1612] dark:text-[#8BA49B]">Your circle feed is quiet</p>
            <p className="text-xs text-[#6E8B7F] dark:text-[#5B756C] mt-1 max-w-xs mx-auto">
              Follow more creators in Explore or switch to the "For You" stream to discover fresh ideas.
            </p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button
                onClick={() => setFeedTab('forYou')}
                className="px-4 py-2 rounded-lg bg-emerald-500 text-white dark:text-black text-xs font-bold hover:bg-emerald-400 transition-all cursor-pointer active:scale-95"
              >
                Switch to For You
              </button>
              <button
                onClick={() => setCurrentView('explore')}
                className="px-4 py-2 rounded-lg border border-[#E2ECE7] dark:border-[#1F2E29] bg-white dark:bg-[#121A17] text-xs font-bold text-[#0B1612] dark:text-[#F2FBF7] hover:bg-emerald-50 dark:hover:bg-[#16221E] transition-all cursor-pointer active:scale-95"
              >
                Discover People
              </button>
            </div>
          </div>
        ) : (
          filteredPosts.map((post) => <ThreadCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};
