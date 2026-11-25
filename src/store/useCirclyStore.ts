import { create } from 'zustand';
import confetti from 'canvas-confetti';
import { 
  UserProfile, 
  Post, 
  ActivityNotification, 
  ToastItem, 
  ViewType, 
  ConnectionTabType,
  FeedTabType, 
  ThemeMode,
  ComposerReplyTarget,
  ChainedPost
} from '../types';
import { INITIAL_USERS, INITIAL_FOLLOW_GRAPH, INITIAL_POSTS, INITIAL_ACTIVITIES } from '../services/mockData';

const STORAGE_KEY_POSTS = 'circly_posts_v1';
const STORAGE_KEY_USERS = 'circly_users_v1';
const STORAGE_KEY_FOLLOWS = 'circly_follows_v1';
const STORAGE_KEY_THEME = 'circly_theme_v1';
const STORAGE_KEY_USER_ID = 'circly_current_user_id';

async function apiRequest(url: string, options?: RequestInit) {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    throw new Error(`API error: ${res.status}`);
  }
  return res.json();
}

const getStoredData = <T>(key: string, fallback: T): T => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (e) {
    return fallback;
  }
};

interface CirclyStoreState {
  theme: ThemeMode;
  currentView: ViewType;
  feedTab: FeedTabType;
  profileUserId: string;
  connectionsUserId: string;
  connectionsTab: ConnectionTabType;
  activeThreadDetailId: string | null;
  isComposerOpen: boolean;
  composerReplyTarget: ComposerReplyTarget | null;
  searchQuery: string;
  users: UserProfile[];
  followGraph: Record<string, string[]>;
  currentUserId: string;
  posts: Post[];
  activities: ActivityNotification[];
  toasts: ToastItem[];

  // Actions
  initFromServer: (userId?: string) => Promise<void>;
  setTheme: (theme: ThemeMode) => void;
  setCurrentView: (view: ViewType, payload?: { 
    profileUserId?: string; 
    searchQuery?: string;
    connectionsUserId?: string;
    connectionsTab?: ConnectionTabType;
  }) => void;
  openFollowList: (userId: string, tab?: ConnectionTabType) => void;
  setConnectionsTab: (tab: ConnectionTabType) => void;
  setFeedTab: (feedTab: FeedTabType) => void;
  setSearchQuery: (query: string) => void;
  switchUser: (userId: string) => void;
  getCurrentUser: () => UserProfile;
  getUserById: (id: string) => UserProfile;
  getFollowers: (userId: string) => UserProfile[];
  getFollowing: (userId: string) => UserProfile[];
  getMutuals: (userId: string) => UserProfile[];
  isUserFollowing: (followerId: string, targetId: string) => boolean;
  toggleFollow: (targetUserId: string) => void;
  createPost: (params: { content: string; mediaUrl?: string | null; chainedPosts?: { content: string; mediaUrl?: string | null }[] }) => void;
  addReply: (parentPostId: string, content: string, mediaUrl?: string | null) => void;
  toggleLike: (postId: string) => void;
  toggleLikeReply: (postId: string, replyId: string) => void;
  toggleRepost: (postId: string) => void;
  toggleBookmark: (postId: string) => void;
  openComposer: (replyTarget?: ComposerReplyTarget | null) => void;
  closeComposer: () => void;
  openThreadDetail: (postId: string) => void;
  closeThreadDetail: () => void;
  addToast: (message: string, type?: 'info' | 'success' | 'error') => void;
  removeToast: (id: string) => void;
  resetToDefaultData: () => void;
}

export const useCirclyStore = create<CirclyStoreState>((set, get) => {
  const initialUserId = localStorage.getItem(STORAGE_KEY_USER_ID) || 'usr_current';
  const initialFollowGraph = getStoredData<Record<string, string[]>>(STORAGE_KEY_FOLLOWS, INITIAL_FOLLOW_GRAPH);
  const rawUsers = getStoredData<UserProfile[]>(STORAGE_KEY_USERS, INITIAL_USERS);
  
  // Hydrate isFollowing relative to current user
  const initialUsers = rawUsers.map((u) => ({
    ...u,
    isFollowing: (initialFollowGraph[initialUserId] || []).includes(u.id),
  }));

  return {
    theme: (localStorage.getItem(STORAGE_KEY_THEME) as ThemeMode) || 'dark',
    currentView: 'feed',
    feedTab: 'forYou',
    profileUserId: initialUserId,
    connectionsUserId: initialUserId,
    connectionsTab: 'followers',
    activeThreadDetailId: null,
    isComposerOpen: false,
    composerReplyTarget: null,
    searchQuery: '',

    users: initialUsers,
    followGraph: initialFollowGraph,
    currentUserId: initialUserId,

    posts: getStoredData<Post[]>(STORAGE_KEY_POSTS, INITIAL_POSTS),
    activities: INITIAL_ACTIVITIES,
    toasts: [],

    initFromServer: async (userId?: string) => {
      const targetUserId = userId || get().currentUserId;
      try {
        const data = await apiRequest(`/api/bootstrap?userId=${encodeURIComponent(targetUserId)}`);
        if (data?.users && data?.posts) {
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(data.users));
          localStorage.setItem(STORAGE_KEY_FOLLOWS, JSON.stringify(data.followGraph));
          localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(data.posts));
          set({
            users: data.users,
            followGraph: data.followGraph,
            posts: data.posts,
            activities: data.activities ?? INITIAL_ACTIVITIES,
          });
        }
      } catch (err) {
        console.warn('Turso API unavailable, using local cached state:', err);
      }
    },

    setTheme: (theme: ThemeMode) => {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
      document.documentElement.classList.toggle('dark', theme === 'dark');
      set({ theme });
    },

    setCurrentView: (view: ViewType, payload = {}) => {
      set({
        currentView: view,
        ...(payload.profileUserId && { profileUserId: payload.profileUserId }),
        ...(payload.searchQuery !== undefined && { searchQuery: payload.searchQuery }),
        ...(payload.connectionsUserId && { connectionsUserId: payload.connectionsUserId }),
        ...(payload.connectionsTab && { connectionsTab: payload.connectionsTab }),
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    openFollowList: (userId: string, tab: ConnectionTabType = 'followers') => {
      set({
        currentView: 'connections',
        connectionsUserId: userId,
        connectionsTab: tab,
      });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    setConnectionsTab: (tab: ConnectionTabType) => set({ connectionsTab: tab }),

    setFeedTab: (feedTab: FeedTabType) => set({ feedTab }),

    setSearchQuery: (query: string) => set({ searchQuery: query }),

    switchUser: (userId: string) => {
      localStorage.setItem(STORAGE_KEY_USER_ID, userId);
      const { followGraph, users } = get();
      const currentFollowing = followGraph[userId] || [];
      const updatedUsers = users.map((u) => ({
        ...u,
        isFollowing: currentFollowing.includes(u.id),
      }));

      set({ 
        currentUserId: userId,
        users: updatedUsers
      });
      get().addToast(`Switched account to ${get().getCurrentUser()?.fullName}`, 'info');
      void get().initFromServer(userId);
    },

    getCurrentUser: (): UserProfile => {
      const { users, currentUserId } = get();
      return users.find((u) => u.id === currentUserId) || users[0];
    },

    getUserById: (id: string): UserProfile => {
      const { users } = get();
      return (
        users.find((u) => u.id === id) || {
          id,
          username: 'unknown',
          fullName: 'Circly User',
          avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          bio: 'Circly community member',
          followersCount: 0,
          followingCount: 0,
        }
      );
    },

    isUserFollowing: (followerId: string, targetId: string): boolean => {
      const { followGraph } = get();
      return (followGraph[followerId] || []).includes(targetId);
    },

    getFollowers: (userId: string): UserProfile[] => {
      const { followGraph, users } = get();
      const followerIds: string[] = [];
      Object.entries(followGraph).forEach(([followerId, followingList]) => {
        if (followingList.includes(userId)) {
          followerIds.push(followerId);
        }
      });
      return users.filter((u) => followerIds.includes(u.id) && u.id !== userId);
    },

    getFollowing: (userId: string): UserProfile[] => {
      const { followGraph, users } = get();
      const followingIds = followGraph[userId] || [];
      return users.filter((u) => followingIds.includes(u.id) && u.id !== userId);
    },

    getMutuals: (userId: string): UserProfile[] => {
      const { followGraph, users } = get();
      const userFollowing = followGraph[userId] || [];
      const mutualIds: string[] = [];
      userFollowing.forEach((targetId) => {
        if ((followGraph[targetId] || []).includes(userId)) {
          mutualIds.push(targetId);
        }
      });
      return users.filter((u) => mutualIds.includes(u.id) && u.id !== userId);
    },

    toggleFollow: (targetUserId: string) => {
      const { users, currentUserId, followGraph } = get();
      if (targetUserId === currentUserId) return;

      const userFollowing = followGraph[currentUserId] || [];
      const isCurrentlyFollowing = userFollowing.includes(targetUserId);

      const nextFollowing = isCurrentlyFollowing
        ? userFollowing.filter((id) => id !== targetUserId)
        : [...userFollowing, targetUserId];

      const updatedFollowGraph = {
        ...followGraph,
        [currentUserId]: nextFollowing,
      };

      const updatedUsers = users.map((u) => {
        if (u.id === targetUserId) {
          const nextState = !isCurrentlyFollowing;
          return {
            ...u,
            isFollowing: nextState,
            followersCount: Math.max(0, u.followersCount + (nextState ? 1 : -1)),
          };
        }
        if (u.id === currentUserId) {
          return {
            ...u,
            followingCount: Math.max(0, u.followingCount + (!isCurrentlyFollowing ? 1 : -1)),
          };
        }
        return u;
      });

      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updatedUsers));
      localStorage.setItem(STORAGE_KEY_FOLLOWS, JSON.stringify(updatedFollowGraph));
      set({ users: updatedUsers, followGraph: updatedFollowGraph });

      void apiRequest(`/api/users/${encodeURIComponent(targetUserId)}/follow`, {
        method: 'POST',
        body: JSON.stringify({ followerId: currentUserId }),
      }).catch((err) => console.error('Failed to sync follow to Turso:', err));

      const targetUser = updatedUsers.find((u) => u.id === targetUserId);
      if (targetUser) {
        get().addToast(
          !isCurrentlyFollowing
            ? `Added @${targetUser.username} to your circle`
            : `Removed @${targetUser.username} from your circle`,
          'success'
        );
      }
    },

  createPost: ({ content, mediaUrl = null, chainedPosts = [] }) => {
    const currentUser = get().getCurrentUser();
    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: currentUser.id,
      content,
      mediaUrl: mediaUrl || null,
      likesCount: 0,
      repostsCount: 0,
      repliesCount: 0,
      createdAt: new Date().toISOString(),
      isLiked: false,
      isReposted: false,
      isBookmarked: false,
      chainedPosts: chainedPosts.map((cp, idx) => ({
        id: `chain_${Date.now()}_${idx}`,
        content: cp.content,
        mediaUrl: cp.mediaUrl || null,
      })),
      replies: [],
    };

    const updatedPosts = [newPost, ...get().posts];
    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updatedPosts));
    set({ posts: updatedPosts, isComposerOpen: false });

    void apiRequest('/api/posts', {
      method: 'POST',
      body: JSON.stringify({
        id: newPost.id,
        userId: newPost.userId,
        content: newPost.content,
        mediaUrl: newPost.mediaUrl,
        createdAt: newPost.createdAt,
        chainedPosts: newPost.chainedPosts,
      }),
    }).catch((err) => console.error('Failed to persist post to Turso:', err));

    // Celebration confetti
    try {
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.85 },
        colors: ['#10B981', '#06D6A0', '#FAFCFB'],
      });
    } catch (e) {}

    get().addToast('Loop published to your circle', 'success');
  },

  addReply: (parentPostId: string, content: string, mediaUrl: string | null = null) => {
    const currentUser = get().getCurrentUser();
    const newReply = {
      id: `rep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      userId: currentUser.id,
      content,
      mediaUrl: mediaUrl || null,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      isLiked: false,
    };

    const updatedPosts = get().posts.map((post) => {
      if (post.id === parentPostId) {
        return {
          ...post,
          repliesCount: (post.repliesCount || 0) + 1,
          replies: [...(post.replies || []), newReply],
        };
      }
      return post;
    });

    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updatedPosts));
    set({ posts: updatedPosts });
    get().addToast('Reply added to loop', 'success');

    void apiRequest(`/api/posts/${encodeURIComponent(parentPostId)}/replies`, {
      method: 'POST',
      body: JSON.stringify(newReply),
    }).catch((err) => console.error('Failed to persist reply to Turso:', err));
  },

  toggleLike: (postId: string) => {
    const currentUserId = get().currentUserId;
    const updatedPosts = get().posts.map((post) => {
      if (post.id === postId) {
        const nextLiked = !post.isLiked;
        return {
          ...post,
          isLiked: nextLiked,
          likesCount: post.likesCount + (nextLiked ? 1 : -1),
        };
      }
      return post;
    });

    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updatedPosts));
    set({ posts: updatedPosts });

    void apiRequest(`/api/posts/${encodeURIComponent(postId)}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId: currentUserId }),
    }).catch((err) => console.error('Failed to sync like to Turso:', err));
  },

  toggleLikeReply: (postId: string, replyId: string) => {
    const currentUserId = get().currentUserId;
    const updatedPosts = get().posts.map((post) => {
      if (post.id === postId && post.replies) {
        const updatedReplies = post.replies.map((reply) => {
          if (reply.id === replyId) {
            const nextLiked = !reply.isLiked;
            return {
              ...reply,
              isLiked: nextLiked,
              likesCount: (reply.likesCount || 0) + (nextLiked ? 1 : -1),
            };
          }
          return reply;
        });
        return { ...post, replies: updatedReplies };
      }
      return post;
    });

    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updatedPosts));
    set({ posts: updatedPosts });

    void apiRequest(`/api/posts/${encodeURIComponent(replyId)}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId: currentUserId }),
    }).catch((err) => console.error('Failed to sync reply like to Turso:', err));
  },

  toggleRepost: (postId: string) => {
    const currentUserId = get().currentUserId;
    const updatedPosts = get().posts.map((post) => {
      if (post.id === postId) {
        const nextReposted = !post.isReposted;
        return {
          ...post,
          isReposted: nextReposted,
          repostsCount: post.repostsCount + (nextReposted ? 1 : -1),
        };
      }
      return post;
    });

    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updatedPosts));
    set({ posts: updatedPosts });

    void apiRequest(`/api/posts/${encodeURIComponent(postId)}/repost`, {
      method: 'POST',
      body: JSON.stringify({ userId: currentUserId }),
    }).catch((err) => console.error('Failed to sync repost to Turso:', err));

    const post = updatedPosts.find((p) => p.id === postId);
    if (post) {
      get().addToast(
        post.isReposted ? 'Thought re-looped to your followers' : 'Removed from your loops',
        'info'
      );
    }
  },

  toggleBookmark: (postId: string) => {
    const currentUserId = get().currentUserId;
    const updatedPosts = get().posts.map((post) => {
      if (post.id === postId) {
        const nextBookmarked = !post.isBookmarked;
        return {
          ...post,
          isBookmarked: nextBookmarked,
        };
      }
      return post;
    });

    localStorage.setItem(STORAGE_KEY_POSTS, JSON.stringify(updatedPosts));
    set({ posts: updatedPosts });

    void apiRequest(`/api/posts/${encodeURIComponent(postId)}/bookmark`, {
      method: 'POST',
      body: JSON.stringify({ userId: currentUserId }),
    }).catch((err) => console.error('Failed to sync bookmark to Turso:', err));

    const post = updatedPosts.find((p) => p.id === postId);
    if (post) {
      get().addToast(
        post.isBookmarked ? 'Saved to Bookmarks' : 'Removed from Bookmarks',
        'info'
      );
    }
  },

  openComposer: (replyTarget: ComposerReplyTarget | null = null) => {
    set({ isComposerOpen: true, composerReplyTarget: replyTarget });
  },

  closeComposer: () => {
    set({ isComposerOpen: false, composerReplyTarget: null });
  },

  openThreadDetail: (postId: string) => {
    set({ activeThreadDetailId: postId });
  },

  closeThreadDetail: () => {
    set({ activeThreadDetailId: null });
  },

  addToast: (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const id = `toast_${Date.now()}_${Math.random()}`;
    const newToast: ToastItem = { id, message, type };
    set((state) => ({ toasts: [...state.toasts, newToast] }));

    setTimeout(() => {
      get().removeToast(id);
    }, 3200);
  },

  removeToast: (id: string) => {
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
  },

    resetToDefaultData: () => {
      localStorage.removeItem(STORAGE_KEY_POSTS);
      localStorage.removeItem(STORAGE_KEY_USERS);
      localStorage.removeItem(STORAGE_KEY_FOLLOWS);
      set({
        posts: INITIAL_POSTS,
        users: INITIAL_USERS,
        followGraph: INITIAL_FOLLOW_GRAPH,
        activities: INITIAL_ACTIVITIES,
      });
      get().addToast('Reset community feed to default seed data', 'info');
      void apiRequest('/api/reset', { method: 'POST' })
        .then(() => get().initFromServer())
        .catch((err) => console.error('Failed to reset Turso database:', err));
    },
  };
});
