import React from 'react';
import { Bookmark } from 'lucide-react';
import { useCirclyStore } from '../../store/useCirclyStore';
import { ThreadCard } from '../feed/ThreadCard';

export const BookmarksView: React.FC = () => {
  const { posts, setCurrentView } = useCirclyStore();
  const bookmarkedPosts = posts.filter((p) => p.isBookmarked);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="px-4 py-3.5 border-b border-[#E2ECE7] dark:border-[#1F2E29] flex items-center justify-between sticky top-0 bg-white/90 dark:bg-[#0B110F]/90 backdrop-glass z-20 transition-colors">
        <div className="flex items-center gap-2.5">
          <Bookmark className="w-4 h-4 text-amber-500 dark:text-amber-400 fill-amber-500 dark:fill-amber-400" />
          <h1 className="font-bold text-sm text-[#0B1612] dark:text-[#F2FBF7]">Saved Loops</h1>
        </div>
        <span className="text-xs text-[#6E8B7F] dark:text-[#8BA49B]">
          {bookmarkedPosts.length} saved
        </span>
      </div>

      {/* List */}
      <div className="divide-y divide-[#E2ECE7] dark:divide-[#1F2E29]/60">
        {bookmarkedPosts.length === 0 ? (
          <div className="py-20 text-center text-[#6E8B7F] dark:text-[#5B756C] px-4">
            <Bookmark className="w-8 h-8 text-[#CBDDD5] dark:text-[#1F2E29] mx-auto mb-3" />
            <p className="text-sm font-semibold text-[#0B1612] dark:text-[#8BA49B]">No saved loops yet</p>
            <p className="text-xs text-[#6E8B7F] dark:text-[#5B756C] mt-1 max-w-xs mx-auto">
              Tap the bookmark icon on any thought in your feed to save it for later reflection.
            </p>
            <button
              onClick={() => setCurrentView('feed')}
              className="mt-4 px-4 py-2 rounded-lg bg-emerald-500 text-white dark:text-black text-xs font-bold hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              Browse Feed
            </button>
          </div>
        ) : (
          bookmarkedPosts.map((post) => <ThreadCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};
