import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Send, Heart, Image as ImageIcon } from 'lucide-react';
import { useCirclyStore } from '../../store/useCirclyStore';
import { ThreadCard } from '../feed/ThreadCard';

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

export const ThreadDetailModal: React.FC = () => {
  const { 
    activeThreadDetailId, 
    closeThreadDetail, 
    posts, 
    getUserById, 
    getCurrentUser,
    addReply,
    toggleLikeReply,
    setCurrentView 
  } = useCirclyStore();

  const [replyInput, setReplyInput] = useState('');
  const [replyMediaUrl, setReplyMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);

  if (!activeThreadDetailId) return null;

  const currentPost = posts.find((p) => p.id === activeThreadDetailId);
  const currentUser = getCurrentUser();

  if (!currentPost) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-glass">
        <div className="bg-white dark:bg-[#121A17] p-6 rounded-2xl border border-[#E2ECE7] dark:border-[#1F2E29] text-center">
          <p className="text-sm text-[#6E8B7F] dark:text-[#8BA49B] mb-3">Thread not found or was removed.</p>
          <button onClick={closeThreadDetail} className="px-4 py-2 bg-emerald-500 text-white dark:text-black text-xs font-bold rounded-xl cursor-pointer">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const postAuthor = getUserById(currentPost.userId);
  const replies = currentPost.replies || [];

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyInput.trim()) return;

    addReply(currentPost.id, replyInput.trim(), replyMediaUrl || null);
    setReplyInput('');
    setReplyMediaUrl('');
    setShowMediaInput(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 dark:bg-black/85 backdrop-glass">
      <motion.div
        initial={{ opacity: 0, y: 25, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.98 }}
        className="w-full max-w-2xl bg-white dark:bg-[#0B110F] border border-[#E2ECE7] dark:border-[#1F2E29] rounded-2xl flex flex-col max-h-[92vh] overflow-hidden transition-colors"
      >
        {/* Top Bar */}
        <div className="px-5 py-3.5 border-b border-[#E2ECE7] dark:border-[#1F2E29] bg-white/90 dark:bg-[#121A17]/80 backdrop-glass flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={closeThreadDetail}
              className="p-1.5 rounded-lg text-[#6E8B7F] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] hover:bg-emerald-50 dark:hover:bg-[#16221E] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <span className="font-bold text-sm text-[#0B1612] dark:text-[#F2FBF7]">Loop Conversation</span>
          </div>

          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            {replies.length} {replies.length === 1 ? 'reply' : 'replies'}
          </span>
        </div>

        {/* Scrollable Conversation Chain */}
        <div className="overflow-y-auto flex-1 divide-y divide-[#E2ECE7] dark:divide-[#1F2E29]/60">
          
          {/* Main Thread Post */}
          <div className="bg-white dark:bg-[#121A17]/30">
            <ThreadCard post={currentPost} isDetailView={true} showConnector={replies.length > 0} />
          </div>

          {/* Replies Section */}
          <div className="p-4 space-y-4">
            <h3 className="text-xs font-semibold text-[#6E8B7F] dark:text-[#8BA49B] uppercase tracking-wider pl-1">
              Replies & Perspectives
            </h3>

            {replies.length === 0 ? (
              <div className="py-8 text-center text-[#6E8B7F] dark:text-[#5B756C]">
                <p className="text-sm font-medium">No replies yet in this loop.</p>
                <p className="text-xs text-[#6E8B7F] dark:text-[#8BA49B] mt-1">Be the first to share your perspective below!</p>
              </div>
            ) : (
              <div className="space-y-3.5">
                {replies.map((reply) => {
                  const replyAuthor = getUserById(reply.userId);
                  return (
                    <div
                      key={reply.id}
                      className="p-3.5 rounded-xl bg-[#F9FCFA] dark:bg-[#121A17] border border-[#E2ECE7] dark:border-[#1F2E29]/70 flex gap-3 hover:border-emerald-500/30 transition-colors"
                    >
                      <img
                        src={replyAuthor.avatar}
                        alt={replyAuthor.fullName}
                        onClick={() => {
                          closeThreadDetail();
                          setCurrentView('profile', { profileUserId: replyAuthor.id });
                        }}
                        className="w-8 h-8 rounded-full object-cover ring-1 ring-[#E2ECE7] dark:ring-[#1F2E29] cursor-pointer"
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span 
                              onClick={() => {
                                closeThreadDetail();
                                setCurrentView('profile', { profileUserId: replyAuthor.id });
                              }}
                              className="font-bold text-xs text-[#0B1612] dark:text-[#F2FBF7] hover:underline cursor-pointer"
                            >
                              {replyAuthor.fullName}
                            </span>
                            <span className="text-[11px] text-[#6E8B7F] dark:text-[#8BA49B]">@{replyAuthor.username}</span>
                          </div>
                          <span className="text-[11px] text-[#6E8B7F] dark:text-[#5B756C]">{formatTimeAgo(reply.createdAt)}</span>
                        </div>

                        <p className="text-xs leading-relaxed text-[#2D423B] dark:text-[#CBDDD5] whitespace-pre-line mb-2">
                          {reply.content}
                        </p>

                        {reply.mediaUrl && (
                          <div className="mb-2 rounded-xl overflow-hidden border border-[#E2ECE7] dark:border-[#1F2E29]">
                            <img src={reply.mediaUrl} alt="Reply media" className="w-full max-h-48 object-cover" />
                          </div>
                        )}

                        <div className="flex items-center gap-4">
                          <button
                            onClick={() => toggleLikeReply(currentPost.id, reply.id)}
                            className={`flex items-center gap-1 text-[11px] transition-colors cursor-pointer ${
                              reply.isLiked ? 'text-rose-500 font-semibold' : 'text-[#6E8B7F] dark:text-[#8BA49B] hover:text-rose-500'
                            }`}
                          >
                            <Heart className={`w-3.5 h-3.5 ${reply.isLiked ? 'fill-current stroke-rose-500' : ''}`} />
                            <span>{reply.likesCount > 0 ? reply.likesCount : ''}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Quick Reply Bar at bottom */}
        <form onSubmit={handleSendReply} className="p-3 border-t border-[#E2ECE7] dark:border-[#1F2E29] bg-white dark:bg-[#121A17] space-y-2 transition-colors">
          {showMediaInput && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#F4F8F6] dark:bg-[#0B110F] border border-[#E2ECE7] dark:border-[#1F2E29]">
              <input
                type="text"
                value={replyMediaUrl}
                onChange={(e) => setReplyMediaUrl(e.target.value)}
                placeholder="Image URL..."
                className="w-full bg-transparent text-xs text-[#0B1612] dark:text-[#F2FBF7] placeholder-[#94ADA2] dark:placeholder-[#5B756C] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowMediaInput(false)}
                className="text-xs text-[#6E8B7F] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] cursor-pointer"
              >
                Close
              </button>
            </div>
          )}

          <div className="flex items-center gap-2">
            <img
              src={currentUser.avatar}
              alt={currentUser.fullName}
              className="w-8 h-8 rounded-full object-cover ring-1 ring-emerald-400/40 shrink-0"
            />
            <input
              type="text"
              value={replyInput}
              onChange={(e) => setReplyInput(e.target.value)}
              placeholder={`Reply to @${postAuthor.username}...`}
              className="flex-1 bg-[#F4F8F6] dark:bg-[#0B110F] border border-[#E2ECE7] dark:border-[#1F2E29] text-xs text-[#0B1612] dark:text-[#F2FBF7] placeholder-[#94ADA2] dark:placeholder-[#5B756C] px-3.5 py-2.5 rounded-lg focus:outline-none focus:border-emerald-500/50"
            />
            <button
              type="button"
              onClick={() => setShowMediaInput(!showMediaInput)}
              className="p-2 rounded-lg text-[#6E8B7F] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] hover:bg-emerald-50 dark:hover:bg-[#16221E] transition-colors cursor-pointer"
              title="Add Image URL"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="submit"
              disabled={!replyInput.trim()}
              className={`p-2.5 rounded-lg transition-all cursor-pointer ${
                replyInput.trim()
                  ? 'bg-emerald-500 text-white dark:text-black hover:bg-emerald-400 font-bold active:scale-95'
                  : 'bg-[#E2ECE7] dark:bg-[#1F2E29] text-[#94ADA2] dark:text-[#5B756C] cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>

      </motion.div>
    </div>
  );
};
