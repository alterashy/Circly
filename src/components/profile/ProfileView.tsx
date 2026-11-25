import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  Globe, 
  Repeat2, 
  MessageCircle, 
  Layers,
  UserCheck,
  UserPlus,
  Share2,
  Check
} from 'lucide-react';
import { useCirclyStore } from '../../store/useCirclyStore';
import { ThreadCard } from '../feed/ThreadCard';
import { Post, Reply } from '../../types';

interface UserReplyItem {
  parentPost: Post;
  reply: Reply;
}

export const ProfileView: React.FC = () => {
  const { 
    profileUserId, 
    setCurrentView, 
    openFollowList,
    getUserById, 
    currentUserId, 
    toggleFollow, 
    posts, 
    addToast 
  } = useCirclyStore();

  const [activeTab, setActiveTab] = useState<'loops' | 'replies' | 'reposts'>('loops');
  const [isCopied, setIsCopied] = useState(false);

  const user = getUserById(profileUserId);
  const isSelf = user.id === currentUserId;

  const userLoops = posts.filter((p) => p.userId === user.id);
  const userReposts = posts.filter((p) => p.isReposted && (p.userId === user.id || isSelf));

  const userReplies: UserReplyItem[] = [];
  posts.forEach((post) => {
    (post.replies || []).forEach((reply) => {
      if (reply.userId === user.id) {
        userReplies.push({ parentPost: post, reply });
      }
    });
  });

  const handleShareProfile = () => {
    setIsCopied(true);
    navigator.clipboard?.writeText(window.location.href);
    addToast(`Copied @${user.username}'s profile link`, 'info');
    setTimeout(() => setIsCopied(false), 2000);
  };

  const tabs = [
    { id: 'loops' as const, label: 'Loops', count: userLoops.length, icon: Layers },
    { id: 'replies' as const, label: 'Replies', count: userReplies.length, icon: MessageCircle },
    { id: 'reposts' as const, label: 'Reposts', count: userReposts.length, icon: Repeat2 },
  ];

  return (
    <div className="w-full">
      {/* Top Bar navigation */}
      <div className="px-4 py-3 border-b border-[#E2ECE7] dark:border-[#1F2E29] flex items-center justify-between sticky top-0 bg-white/90 dark:bg-[#0B110F]/90 backdrop-glass z-20 transition-colors">
        <button
          onClick={() => setCurrentView('feed')}
          className="flex items-center gap-2 text-xs font-semibold text-[#476357] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to feed</span>
        </button>

        <button
          onClick={handleShareProfile}
          className="p-1.5 rounded-lg border border-[#E2ECE7] dark:border-[#1F2E29] text-[#476357] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#F2FBF7] transition-colors cursor-pointer"
          title="Share profile"
        >
          {isCopied ? <Check className="w-4 h-4 text-emerald-500 dark:text-emerald-400" /> : <Share2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Profile Header Hero */}
      <div className="p-6 border-b border-[#E2ECE7] dark:border-[#1F2E29] bg-white/50 dark:bg-transparent">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-[#0B1612] dark:text-[#F2FBF7] tracking-tight">{user.fullName}</h1>
              {user.badge && (
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25">
                  {user.badge}
                </span>
              )}
            </div>
            <p className="text-sm text-[#6E8B7F] dark:text-[#8BA49B] mt-0.5">@{user.username}</p>
          </div>

          <img
            src={user.avatar}
            alt={user.fullName}
            className="w-20 h-20 rounded-full object-cover ring-2 ring-emerald-500/60 dark:ring-emerald-400/60"
          />
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-sm text-[#1F3029] dark:text-[#CBDDD5] leading-relaxed mt-4 whitespace-pre-line">
            {user.bio}
          </p>
        )}

        {/* Website & Meta */}
        <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-[#6E8B7F] dark:text-[#8BA49B]">
          {user.website && (
            <a
              href={user.website}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 hover:underline"
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{user.website.replace(/^https?:\/\//, '')}</span>
            </a>
          )}
          <button
            onClick={() => openFollowList(user.id, 'followers')}
            className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer group py-0.5"
            title={`View ${user.fullName}'s followers`}
          >
            <span className="font-bold text-[#0B1612] dark:text-[#F2FBF7] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {user.followersCount.toLocaleString()}
            </span>
            <span className="group-hover:underline">followers</span>
          </button>
          <button
            onClick={() => openFollowList(user.id, 'following')}
            className="flex items-center gap-1 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer group py-0.5"
            title={`View who ${user.fullName} is following`}
          >
            <span className="font-bold text-[#0B1612] dark:text-[#F2FBF7] group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
              {user.followingCount.toLocaleString()}
            </span>
            <span className="group-hover:underline">following</span>
          </button>
        </div>

        {/* Action Button: Follow / Edit */}
        <div className="mt-5">
          {isSelf ? (
            <div className="w-full py-2.5 rounded-lg border border-[#E2ECE7] dark:border-[#1F2E29] bg-[#F4F8F6] dark:bg-[#121A17] text-center text-xs font-semibold text-[#476357] dark:text-[#8BA49B]">
              Logged in as You (Current Persona)
            </div>
          ) : (
            <button
              onClick={() => toggleFollow(user.id)}
              className={`w-full py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                user.isFollowing
                  ? 'border border-[#E2ECE7] dark:border-[#1F2E29] bg-white dark:bg-[#121A17] text-[#0B1612] dark:text-[#F2FBF7] hover:border-rose-500/50 hover:text-rose-500 dark:hover:text-rose-400'
                  : 'bg-emerald-500 text-white dark:text-black hover:bg-emerald-400 active:scale-98'
              }`}
            >
              {user.isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4 text-emerald-500 dark:text-emerald-400" />
                  <span>In Your Circle (Following)</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Join @{user.username}'s Circle</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[#E2ECE7] dark:border-[#1F2E29] bg-white dark:bg-[#0B110F]">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex-1 py-3 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isActive ? 'text-[#0B1612] dark:text-[#F2FBF7]' : 'text-[#6E8B7F] dark:text-[#8BA49B] hover:text-[#0B1612] dark:hover:text-[#CBDDD5]'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
              <span>{tab.label}</span>
              <span className="text-[10px] text-[#6E8B7F] dark:text-[#5B756C] font-normal">({tab.count})</span>
              {isActive && (
                <motion.div
                  layoutId="profileTabUnderline"
                  className="absolute bottom-0 left-8 right-8 h-0.5 bg-linear-to-r from-emerald-500 to-teal-400 dark:from-emerald-400 dark:to-teal-400 rounded-full"
                  transition={{ type: 'spring', stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Feed Content */}
      <div className="divide-y divide-[#E2ECE7] dark:divide-[#1F2E29]/60">
        {activeTab === 'loops' && (
          userLoops.length === 0 ? (
            <div className="py-12 text-center text-[#6E8B7F] dark:text-[#5B756C]">
              <p className="text-sm font-medium">No loops published yet</p>
            </div>
          ) : (
            userLoops.map((post) => <ThreadCard key={post.id} post={post} />)
          )
        )}

        {activeTab === 'replies' && (
          userReplies.length === 0 ? (
            <div className="py-12 text-center text-[#6E8B7F] dark:text-[#5B756C]">
              <p className="text-sm font-medium">No replies recorded</p>
            </div>
          ) : (
            userReplies.map(({ parentPost, reply }) => (
              <div key={reply.id} className="p-4 hover:bg-emerald-50/30 dark:hover:bg-[#121A17]/40 transition-colors">
                <div className="text-[11px] text-[#6E8B7F] dark:text-[#8BA49B] mb-2 flex items-center gap-1">
                  <span>Replied to</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    @{getUserById(parentPost.userId).username}'s loop
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-[#F4F8F6] dark:bg-[#121A17] border border-[#E2ECE7] dark:border-[#1F2E29] text-xs text-[#1F3029] dark:text-[#CBDDD5]">
                  "{reply.content}"
                </div>
              </div>
            ))
          )
        )}

        {activeTab === 'reposts' && (
          userReposts.length === 0 ? (
            <div className="py-12 text-center text-[#6E8B7F] dark:text-[#5B756C]">
              <p className="text-sm font-medium">No re-looped thoughts yet</p>
            </div>
          ) : (
            userReposts.map((post) => (
              <div key={post.id} className="relative">
                <div className="px-4 pt-2.5 text-[11px] text-teal-600 dark:text-teal-400 font-semibold flex items-center gap-1.5">
                  <Repeat2 className="w-3.5 h-3.5" />
                  <span>Re-looped by @{user.username}</span>
                </div>
                <ThreadCard post={post} />
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
};
