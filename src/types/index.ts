export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  avatar: string;
  bio: string;
  website?: string;
  badge?: string;
  followersCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

export interface ChainedPost {
  id: string;
  content: string;
  mediaUrl?: string | null;
}

export interface Reply {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string | null;
  createdAt: string;
  likesCount: number;
  isLiked?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  content: string;
  mediaUrl?: string | null;
  likesCount: number;
  repostsCount: number;
  repliesCount: number;
  createdAt: string;
  isLiked?: boolean;
  isReposted?: boolean;
  isBookmarked?: boolean;
  chainedPosts?: ChainedPost[];
  replies?: Reply[];
}

export interface ActivityNotification {
  id: string;
  type: 'like' | 'reply' | 'repost' | 'follow';
  userId: string;
  targetPostId?: string;
  snippet: string;
  createdAt: string;
}

export interface TrendingTag {
  tag: string;
  count: string;
}

export interface ToastItem {
  id: string;
  message: string;
  type: 'info' | 'success' | 'error';
}

export type ViewType = 'feed' | 'explore' | 'activity' | 'bookmarks' | 'profile' | 'connections';
export type ConnectionTabType = 'followers' | 'following' | 'mutuals';
export type FeedTabType = 'forYou' | 'following';
export type ThemeMode = 'dark' | 'light';

export interface ComposerReplyTarget {
  postId: string;
  author: string;
}
