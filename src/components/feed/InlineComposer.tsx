import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { useCirclyStore } from '../../store/useCirclyStore';

export const InlineComposer: React.FC = () => {
  const { getCurrentUser, createPost, openComposer, setCurrentView } = useCirclyStore();
  const currentUser = getCurrentUser();
  const [content, setContent] = useState('');

  const handleQuickSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;
    createPost({ content: content.trim() });
    setContent('');
  };

  return (
    <div className="p-4 border-b border-[#E2ECE7] dark:border-[#1F2E29] bg-white dark:bg-[#0B110F] transition-colors">
      <form onSubmit={handleQuickSubmit} className="flex gap-3">
        <img
          src={currentUser.avatar}
          alt={currentUser.fullName}
          onClick={() => setCurrentView('profile', { profileUserId: currentUser.id })}
          className="w-10 h-10 rounded-full object-cover ring-1 ring-emerald-500/40 dark:ring-emerald-400/40 shrink-0 cursor-pointer hover:ring-emerald-500 active:scale-95 transition-all"
        />
        <div className="flex-1 min-w-0 space-y-2">
          <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start a loop..."
            className="w-full bg-transparent text-sm text-[#0B1612] dark:text-[#F2FBF7] placeholder-[#6E8B7F] dark:placeholder-[#5B756C] focus:outline-none"
          />
          <div className="flex items-center justify-between pt-2 border-t border-[#E2ECE7] dark:border-[#1F2E29]/50">
            <button
              type="button"
              onClick={() => openComposer()}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 dark:hover:text-emerald-300 flex items-center gap-1.5 font-medium cursor-pointer"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Add image or multi-part loop</span>
            </button>

            <button
              type="submit"
              disabled={!content.trim()}
              className={`px-4 py-1.5 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                content.trim()
                  ? 'bg-emerald-500 text-white dark:text-black hover:bg-emerald-400 active:scale-95'
                  : 'bg-[#E2ECE7] dark:bg-[#1F2E29] text-[#6E8B7F] dark:text-[#5B756C] cursor-not-allowed'
              }`}
            >
              Post
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
