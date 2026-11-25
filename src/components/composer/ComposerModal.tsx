import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  X, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Globe, 
  Link2
} from 'lucide-react';
import { useCirclyStore } from '../../store/useCirclyStore';

interface ChainedDraft {
  content: string;
  mediaUrl: string;
}

export const ComposerModal: React.FC = () => {
  const { 
    isComposerOpen, 
    closeComposer, 
    createPost, 
    addReply,
    getCurrentUser, 
    composerReplyTarget 
  } = useCirclyStore();

  const currentUser = getCurrentUser();

  const [mainContent, setMainContent] = useState('');
  const [mainMediaUrl, setMainMediaUrl] = useState('');
  const [isAddingImage, setIsAddingImage] = useState(false);
  const [chainedPosts, setChainedPosts] = useState<ChainedDraft[]>([]);

  const MAX_CHARS = 500;
  const isReply = Boolean(composerReplyTarget?.postId);

  const handleAddChain = () => {
    setChainedPosts([...chainedPosts, { content: '', mediaUrl: '' }]);
  };

  const handleUpdateChain = (index: number, field: keyof ChainedDraft, value: string) => {
    const updated = [...chainedPosts];
    updated[index][field] = value;
    setChainedPosts(updated);
  };

  const handleRemoveChain = (index: number) => {
    setChainedPosts(chainedPosts.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mainContent.trim()) return;

    if (isReply && composerReplyTarget) {
      addReply(composerReplyTarget.postId, mainContent.trim(), mainMediaUrl || null);
    } else {
      createPost({
        content: mainContent.trim(),
        mediaUrl: mainMediaUrl || null,
        chainedPosts: chainedPosts.filter((c) => c.content.trim().length > 0),
      });
    }

    setMainContent('');
    setMainMediaUrl('');
    setChainedPosts([]);
    setIsAddingImage(false);
  };

  if (!isComposerOpen) return null;

  const charCount = mainContent.length;
  const charPercent = Math.min(100, (charCount / MAX_CHARS) * 100);
  const isOverLimit = charCount > MAX_CHARS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/75 backdrop-glass">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="w-full max-w-xl bg-white dark:bg-[#121A17] border border-[#E2ECE7] dark:border-[#1F2E29] rounded-2xl overflow-hidden flex flex-col max-h-[90vh] transition-colors"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#E2ECE7] dark:border-[#1F2E29] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#0B1612] dark:text-[#F2FBF7]">
              {isReply ? `Reply to @${composerReplyTarget?.author}` : 'New Loop'}
            </span>
            <span className="text-[11px] px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
              {isReply ? 'Discussion' : 'Original Thought'}
            </span>
          </div>
          <button
            onClick={closeComposer}
            className="p-1.5 rounded-lg text-[#6E8B7F] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] hover:bg-emerald-50 dark:hover:bg-[#16221E] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          
          {/* Main Post Section */}
          <div className="flex gap-3.5">
            <div className="flex flex-col items-center shrink-0">
              <img
                src={currentUser.avatar}
                alt={currentUser.fullName}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-emerald-400/40"
              />
              {(!isReply && chainedPosts.length > 0) && (
                <div className="w-0.5 bg-emerald-500/40 my-2 grow rounded-full" />
              )}
            </div>

            <div className="flex-1 min-w-0 space-y-2">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-[#0B1612] dark:text-[#F2FBF7]">{currentUser.fullName}</span>
                <span className="text-xs text-[#6E8B7F] dark:text-[#8BA49B]">@{currentUser.username}</span>
              </div>

              <textarea
                value={mainContent}
                onChange={(e) => setMainContent(e.target.value)}
                placeholder={isReply ? 'Share your perspective...' : "What's on your mind?"}
                rows={4}
                className="w-full bg-transparent text-[#0B1612] dark:text-[#F2FBF7] placeholder-[#94ADA2] dark:placeholder-[#5B756C] text-sm resize-none focus:outline-none leading-relaxed"
                autoFocus
              />

              {/* Image URL Input Drawer */}
              {isAddingImage && (
                <div className="p-2.5 rounded-lg bg-[#F4F8F6] dark:bg-[#0B110F] border border-[#E2ECE7] dark:border-[#1F2E29] flex items-center gap-2">
                  <Link2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <input
                    type="text"
                    value={mainMediaUrl}
                    onChange={(e) => setMainMediaUrl(e.target.value)}
                    placeholder="Paste image URL (e.g. https://...)"
                    className="w-full bg-transparent text-xs text-[#0B1612] dark:text-[#F2FBF7] placeholder-[#94ADA2] dark:placeholder-[#5B756C] focus:outline-none"
                  />
                  {mainMediaUrl && (
                    <button
                      type="button"
                      onClick={() => setMainMediaUrl('')}
                      className="text-[#6E8B7F] dark:text-[#8BA49B] hover:text-rose-500 text-xs cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>
              )}

              {/* Image Preview */}
              {mainMediaUrl && (
                <div className="relative rounded-xl overflow-hidden border border-[#E2ECE7] dark:border-[#1F2E29] bg-[#F4F8F6] dark:bg-[#0B110F] group max-h-56">
                  <img
                    src={mainMediaUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setMainMediaUrl('')}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Chained Sub-Posts (if multi-post thread) */}
          {!isReply && chainedPosts.map((chain, index) => (
            <div key={index} className="flex gap-3.5 pt-2">
              <div className="flex flex-col items-center shrink-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.fullName}
                  className="w-8 h-8 rounded-full object-cover ring-1 ring-[#E2ECE7] dark:ring-[#1F2E29]"
                />
                {index < chainedPosts.length - 1 && (
                  <div className="w-0.5 bg-emerald-500/40 my-2 grow rounded-full" />
                )}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    Thread Part {index + 2}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveChain(index)}
                    className="text-[#6E8B7F] dark:text-[#8BA49B] hover:text-rose-500 p-1 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <textarea
                  value={chain.content}
                  onChange={(e) => handleUpdateChain(index, 'content', e.target.value)}
                  placeholder="Continue your thought..."
                  rows={2}
                  className="w-full bg-transparent text-[#0B1612] dark:text-[#F2FBF7] placeholder-[#94ADA2] dark:placeholder-[#5B756C] text-sm resize-none focus:outline-none leading-relaxed"
                />
              </div>
            </div>
          ))}

          {/* Add to Loop Button (Only for new threads) */}
          {!isReply && (
            <div className="pl-14">
              <button
                type="button"
                onClick={handleAddChain}
                className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-semibold py-1 px-2.5 rounded-lg hover:bg-emerald-500/10 transition-colors cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add to loop</span>
              </button>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-[#E2ECE7] dark:border-[#1F2E29] bg-[#F9FCFA] dark:bg-[#0E1513] flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setIsAddingImage(!isAddingImage)}
              className={`p-2 rounded-lg transition-colors cursor-pointer ${
                isAddingImage || mainMediaUrl
                  ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                  : 'text-[#6E8B7F] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] hover:bg-emerald-50 dark:hover:bg-[#16221E]'
              }`}
              title="Attach Image"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <span className="text-[11px] text-[#6E8B7F] dark:text-[#5B756C] hidden sm:inline-flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> Anyone in Circly can reply
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Circular Progress Meter */}
            <div className="relative w-6 h-6 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-[#E2ECE7] dark:text-[#1F2E29]"
                  strokeWidth="3"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className={isOverLimit ? 'text-rose-500' : 'text-emerald-500 dark:text-emerald-400'}
                  strokeDasharray={`${charPercent}, 100`}
                  strokeWidth="3"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={!mainContent.trim() || isOverLimit}
              className={`px-5 py-2 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                !mainContent.trim() || isOverLimit
                  ? 'bg-[#E2ECE7] dark:bg-[#1F2E29] text-[#94ADA2] dark:text-[#5B756C] cursor-not-allowed'
                  : 'bg-linear-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-white dark:text-black active:scale-95'
              }`}
            >
              {isReply ? 'Reply' : 'Post Loop'}
            </button>
          </div>
        </div>

      </motion.div>
    </div>
  );
};
