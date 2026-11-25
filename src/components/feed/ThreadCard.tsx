import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Bookmark, 
  Share2, 
  Check, 
  CornerDownRight,
  Plus
} from 'lucide-react';
import { useCirclyStore } from '../../store/useCirclyStore';
import { Post } from '../../types';

interface ThreadCardProps {
  post: Post;
  isDetailView?: boolean;
  showConnector?: boolean;
}

const formatTimeAgo = (dateString: string): string => {
  if (!dateString) return 'now';
  const seconds = Math.floor((Date.now() - new Date(dateString).getTime()) / 1000);
  if (seconds < 60) return `${Math.max(1, seconds)}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
};

const renderFormattedContent = (content: string) => {
  if (!content) return null;
  const parts = content.split(/(#[a-zA-Z0-9_]+|https?:\/\/[^\s]+)/g);
  return parts.map((part, index) => {
    if (part.startsWith('#')) {
      return (
        <span key={index} className="text-emerald-400 font-medium hover:underline cursor-pointer">
          {part}
        </span>
      );
    }
    if (part.startsWith('http://') || part.startsWith('https://')) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="text-teal-400 underline underline-offset-2 hover:text-teal-300 break-all"
        >
          {part.replace(/^https?:\/\//, '')}
        </a>
      );
    }
    return part;
  });
};

export const ThreadCard: React.FC<ThreadCardProps> = ({ 
  post, 
  isDetailView = false, 
  showConnector = false 
}) => {
  const { 
    getUserById, 
    toggleLike, 
    toggleRepost, 
    toggleBookmark, 
    openThreadDetail, 
    openComposer,
    setCurrentView,
    currentUserId,
    toggleFollow,
    addToast
  } = useCirclyStore();

  const author = getUserById(post.userId);
  const isSelf = author.id === currentUserId;
  const [isCopied, setIsCopied] = useState(false);
  const [likePopping, setLikePopping] = useState(false);

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setLikePopping(true);
    toggleLike(post.id);
    setTimeout(() => setLikePopping(false), 500);
  };

  const handleRepost = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleRepost(post.id);
  };

  const handleBookmark = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleBookmark(post.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsCopied(true);
    navigator.clipboard?.writeText(window.location.href);
    addToast('Link copied to clipboard', 'info');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const navigateToProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentView('profile', { profileUserId: author.id });
  };

  const hasChainedPosts = post.chainedPosts && post.chainedPosts.length > 0;
  const replies = post.replies || [];

  return (
    <article 
      onClick={() => !isDetailView && openThreadDetail(post.id)}
      className={`relative px-4 py-4.5 border-b border-[#E2ECE7] dark:border-[#1F2E29] transition-colors ${
        !isDetailView ? 'hover:bg-emerald-50/30 dark:hover:bg-[#121A17]/40 cursor-pointer' : ''
      }`}
    >
      <div className="flex gap-3.5">
        
        {/* Left Column: Avatar + Connector line for multi-post loops */}
        <div className="flex flex-col items-center shrink-0">
          <div 
            onClick={navigateToProfile}
            className="relative group cursor-pointer"
          >
            <img
              src={author.avatar}
              alt={author.fullName}
              className="w-10 h-10 rounded-full object-cover ring-1 ring-[#E2ECE7] dark:ring-[#1F2E29] group-hover:ring-emerald-500 dark:group-hover:ring-emerald-400 transition-all"
            />
            {!isSelf && !author.isFollowing && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFollow(author.id);
                }}
                title="Add to circle"
                className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full flex items-center justify-center text-white dark:text-black hover:scale-110 active:scale-95 transition-transform cursor-pointer"
              >
                <Plus className="w-2.5 h-2.5 stroke-3" />
              </button>
            )}
          </div>

          {/* Vertical Connector Line if chained post or in detail chain */}
          {(hasChainedPosts || showConnector) && (
            <div className="w-0.5 bg-[#E2ECE7] dark:bg-[#1F2E29] my-2 grow rounded-full group-hover:bg-emerald-500/40 transition-colors" />
          )}
        </div>

        {/* Right Column: Main Content */}
        <div className="flex-1 min-w-0">
          
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-1.5 flex-wrap min-w-0">
              <span 
                onClick={navigateToProfile}
                className="font-bold text-sm text-[#0B1612] dark:text-[#F2FBF7] hover:underline cursor-pointer truncate"
              >
                {author.fullName}
              </span>
              {author.badge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  {author.badge}
                </span>
              )}
              <span 
                onClick={navigateToProfile}
                className="text-xs text-[#6E8B7F] dark:text-[#8BA49B] truncate cursor-pointer hover:text-[#0B1612] dark:hover:text-[#F2FBF7]"
              >
                @{author.username}
              </span>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-[#6E8B7F] dark:text-[#5B756C]">{formatTimeAgo(post.createdAt)}</span>
            </div>
          </div>

          {/* Post Text */}
          <p className="text-[14.5px] leading-relaxed text-[#1F3029] dark:text-[#E1ECE7] whitespace-pre-line break-words mb-3">
            {renderFormattedContent(post.content)}
          </p>

          {/* Media / Image Attachment */}
          {post.mediaUrl && (
            <div className="mb-3.5 rounded-xl overflow-hidden border border-[#E2ECE7] dark:border-[#1F2E29] bg-[#F4F8F6] dark:bg-[#0B110F]">
              <img
                src={post.mediaUrl}
                alt="Post attachment"
                className="w-full max-h-96 object-cover hover:scale-[1.01] transition-transform duration-300"
                loading="lazy"
              />
            </div>
          )}

          {/* Chained Multi-Post Preview */}
          {hasChainedPosts && (
            <div className="space-y-3 mb-3 pl-2 border-l-2 border-emerald-500/40">
              {post.chainedPosts?.map((chained, idx) => (
                <div key={chained.id || idx} className="pt-1">
                  <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 mb-1 font-semibold">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    <span>Loop part {idx + 2}</span>
                  </div>
                  <p className="text-sm text-[#334D42] dark:text-[#CBDDD5] leading-relaxed whitespace-pre-line">
                    {renderFormattedContent(chained.content)}
                  </p>
                  {chained.mediaUrl && (
                    <div className="mt-2 rounded-xl overflow-hidden border border-[#E2ECE7] dark:border-[#1F2E29]">
                      <img src={chained.mediaUrl} alt="Chained attachment" className="w-full max-h-64 object-cover" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Action Bar */}
          <div className="flex items-center justify-between pt-1 text-[#6E8B7F] dark:text-[#8BA49B] max-w-md">
            
            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-xs p-1.5 -ml-1.5 rounded-lg transition-all cursor-pointer ${
                post.isLiked
                  ? 'text-rose-500 dark:text-rose-400 font-semibold'
                  : 'hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-500/10'
              }`}
            >
              <motion.div
                animate={likePopping ? { scale: [1, 1.4, 0.9, 1.1, 1] } : { scale: 1 }}
                transition={{ duration: 0.4 }}
              >
                <Heart className={`w-4 h-4 ${post.isLiked ? 'fill-current stroke-rose-500 dark:stroke-rose-400' : ''}`} />
              </motion.div>
              <span>{post.likesCount > 0 ? post.likesCount : ''}</span>
            </button>

            {/* Reply */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (isDetailView) {
                  openComposer({ postId: post.id, author: author.username });
                } else {
                  openThreadDetail(post.id);
                }
              }}
              className="flex items-center gap-1.5 text-xs p-1.5 rounded-lg hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-all cursor-pointer"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{post.repliesCount > 0 ? post.repliesCount : ''}</span>
            </button>

            {/* Repost / Loop */}
            <button
              onClick={handleRepost}
              className={`flex items-center gap-1.5 text-xs p-1.5 rounded-lg transition-all cursor-pointer ${
                post.isReposted
                  ? 'text-teal-600 dark:text-teal-400 font-semibold'
                  : 'hover:text-teal-600 dark:hover:text-teal-400 hover:bg-teal-500/10'
              }`}
            >
              <Repeat2 className="w-4 h-4" />
              <span>{post.repostsCount > 0 ? post.repostsCount : ''}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1.5 text-xs p-1.5 rounded-lg transition-all cursor-pointer ${
                post.isBookmarked
                  ? 'text-amber-500 dark:text-amber-400 font-semibold'
                  : 'hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-500/10'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${post.isBookmarked ? 'fill-current stroke-amber-500 dark:stroke-amber-400' : ''}`} />
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-1.5 text-xs p-1.5 rounded-lg hover:text-teal-600 dark:hover:text-teal-300 hover:bg-teal-500/10 transition-all cursor-pointer"
            >
              {isCopied ? <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <Share2 className="w-4 h-4" />}
            </button>

          </div>

          {/* Social Proof Footer for Thread Previews */}
          {!isDetailView && replies.length > 0 && (
            <div 
              onClick={() => openThreadDetail(post.id)}
              className="flex items-center gap-2 mt-3 pt-2.5 border-t border-[#E2ECE7] dark:border-[#1F2E29]/60 text-xs text-[#6E8B7F] dark:text-[#8BA49B] hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer"
            >
              <div className="flex -space-x-1.5 overflow-hidden">
                {replies.slice(0, 3).map((r, i) => {
                  const replyUser = getUserById(r.userId);
                  return (
                    <img
                      key={r.id || i}
                      src={replyUser.avatar}
                      alt={replyUser.fullName}
                      className="inline-block w-4 h-4 rounded-full ring-1 ring-white dark:ring-[#0B110F] object-cover"
                    />
                  );
                })}
              </div>
              <span>
                {replies.length} {replies.length === 1 ? 'reply' : 'replies'} · View conversation
              </span>
            </div>
          )}

        </div>
      </div>
    </article>
  );
};
