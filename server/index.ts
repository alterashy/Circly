import { Hono } from 'hono';
import { serve } from '@hono/node-server';
import type { InStatement } from '@libsql/client';
import { db } from './db';
import { seedDatabase } from '../db/seed';
import type { ActivityNotification, ChainedPost, Post, Reply, UserProfile } from '../src/types';

const app = new Hono();

app.get('/api/health', async (c) => {
  await db.execute('SELECT 1');
  return c.json({ ok: true });
});

app.get('/api/bootstrap', async (c) => {
  const activeUserId = c.req.query('userId') || 'usr_current';

  const [usersRes, followsRes, postsRes, likesRes, repostsRes, bookmarksRes, activitiesRes] =
    await db.batch(
      [
        'SELECT * FROM users ORDER BY rowid ASC',
        'SELECT follower_id, following_id FROM follows',
        'SELECT * FROM posts ORDER BY created_at DESC',
        { sql: 'SELECT post_id FROM likes WHERE user_id = ?', args: [activeUserId] },
        { sql: 'SELECT post_id FROM reposts WHERE user_id = ?', args: [activeUserId] },
        { sql: 'SELECT post_id FROM bookmarks WHERE user_id = ?', args: [activeUserId] },
        'SELECT * FROM activities ORDER BY created_at DESC LIMIT 50',
      ],
      'read'
    );

  const followGraph: Record<string, string[]> = {};
  for (const row of followsRes.rows) {
    const followerId = String(row.follower_id);
    const followingId = String(row.following_id);
    if (!followGraph[followerId]) followGraph[followerId] = [];
    followGraph[followerId].push(followingId);
  }

  const activeFollowingSet = new Set(followGraph[activeUserId] ?? []);
  const likedSet = new Set(likesRes.rows.map((r) => String(r.post_id)));
  const repostedSet = new Set(repostsRes.rows.map((r) => String(r.post_id)));
  const bookmarkedSet = new Set(bookmarksRes.rows.map((r) => String(r.post_id)));

  const users: UserProfile[] = usersRes.rows.map((r) => ({
    id: String(r.id),
    username: String(r.username),
    fullName: String(r.full_name),
    avatar: String(r.avatar),
    bio: String(r.bio ?? ''),
    website: r.website ? String(r.website) : undefined,
    badge: r.badge ? String(r.badge) : undefined,
    followersCount: Number(r.followers_count ?? 0),
    followingCount: Number(r.following_count ?? 0),
    isFollowing: activeFollowingSet.has(String(r.id)),
  }));

  const chainedByRoot = new Map<string, { seq: number; item: ChainedPost }[]>();
  const repliesByParent = new Map<string, Reply[]>();
  const rootRows: typeof postsRes.rows = [];

  for (const r of postsRes.rows) {
    if (r.root_thread_id) {
      const rootId = String(r.root_thread_id);
      const list = chainedByRoot.get(rootId) ?? [];
      list.push({
        seq: Number(r.sequence_index ?? 0),
        item: {
          id: String(r.id),
          content: String(r.content),
          mediaUrl: r.media_url ? String(r.media_url) : null,
        },
      });
      chainedByRoot.set(rootId, list);
    } else if (r.parent_id) {
      const parentId = String(r.parent_id);
      const list = repliesByParent.get(parentId) ?? [];
      list.push({
        id: String(r.id),
        userId: String(r.user_id),
        content: String(r.content),
        mediaUrl: r.media_url ? String(r.media_url) : null,
        createdAt: String(r.created_at),
        likesCount: Number(r.likes_count ?? 0),
        isLiked: likedSet.has(String(r.id)),
      });
      repliesByParent.set(parentId, list);
    } else {
      rootRows.push(r);
    }
  }

  const posts: Post[] = rootRows.map((r) => {
    const id = String(r.id);
    const chained = (chainedByRoot.get(id) ?? [])
      .sort((a, b) => a.seq - b.seq)
      .map((entry) => entry.item);
    const replies = (repliesByParent.get(id) ?? []).sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    );

    return {
      id,
      userId: String(r.user_id),
      content: String(r.content),
      mediaUrl: r.media_url ? String(r.media_url) : null,
      likesCount: Number(r.likes_count ?? 0),
      repostsCount: Number(r.reposts_count ?? 0),
      repliesCount: Number(r.replies_count ?? 0),
      createdAt: String(r.created_at),
      isLiked: likedSet.has(id),
      isReposted: repostedSet.has(id),
      isBookmarked: bookmarkedSet.has(id),
      chainedPosts: chained,
      replies,
    };
  });

  const activities: ActivityNotification[] = activitiesRes.rows.map((r) => ({
    id: String(r.id),
    type: String(r.type) as ActivityNotification['type'],
    userId: String(r.user_id),
    targetPostId: r.target_post_id ? String(r.target_post_id) : undefined,
    snippet: String(r.snippet),
    createdAt: String(r.created_at),
  }));

  return c.json({ users, followGraph, posts, activities });
});

app.post('/api/posts', async (c) => {
  const body = await c.req.json<{
    id: string;
    userId: string;
    content: string;
    mediaUrl?: string | null;
    createdAt: string;
    chainedPosts?: ChainedPost[];
  }>();

  const statements: InStatement[] = [
    {
      sql: `INSERT INTO posts (id, user_id, parent_id, root_thread_id, sequence_index, content, media_url, created_at)
            VALUES (?, ?, NULL, NULL, 0, ?, ?, ?)`,
      args: [body.id, body.userId, body.content, body.mediaUrl ?? null, body.createdAt],
    },
  ];

  (body.chainedPosts ?? []).forEach((cp, index) => {
    statements.push({
      sql: `INSERT INTO posts (id, user_id, parent_id, root_thread_id, sequence_index, content, media_url, created_at)
            VALUES (?, ?, NULL, ?, ?, ?, ?, ?)`,
      args: [
        cp.id,
        body.userId,
        body.id,
        index + 1,
        cp.content,
        cp.mediaUrl ?? null,
        body.createdAt,
      ],
    });
  });

  await db.batch(statements, 'write');
  return c.json({ ok: true }, 201);
});

app.post('/api/posts/:id/replies', async (c) => {
  const parentId = c.req.param('id');
  const body = await c.req.json<{
    id: string;
    userId: string;
    content: string;
    mediaUrl?: string | null;
    createdAt: string;
  }>();

  await db.batch(
    [
      {
        sql: `INSERT INTO posts (id, user_id, parent_id, root_thread_id, sequence_index, content, media_url, created_at)
              VALUES (?, ?, ?, NULL, 0, ?, ?, ?)`,
        args: [body.id, body.userId, parentId, body.content, body.mediaUrl ?? null, body.createdAt],
      },
      {
        sql: `UPDATE posts SET replies_count = replies_count + 1 WHERE id = ?`,
        args: [parentId],
      },
    ],
    'write'
  );

  return c.json({ ok: true }, 201);
});

app.post('/api/posts/:id/like', async (c) => {
  const postId = c.req.param('id');
  const { userId } = await c.req.json<{ userId: string }>();

  const existing = await db.execute({
    sql: 'SELECT 1 FROM likes WHERE user_id = ? AND post_id = ?',
    args: [userId, postId],
  });

  if (existing.rows.length > 0) {
    await db.batch(
      [
        { sql: 'DELETE FROM likes WHERE user_id = ? AND post_id = ?', args: [userId, postId] },
        { sql: 'UPDATE posts SET likes_count = MAX(0, likes_count - 1) WHERE id = ?', args: [postId] },
      ],
      'write'
    );
    return c.json({ liked: false });
  }

  await db.batch(
    [
      { sql: 'INSERT INTO likes (user_id, post_id) VALUES (?, ?)', args: [userId, postId] },
      { sql: 'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?', args: [postId] },
    ],
    'write'
  );
  return c.json({ liked: true });
});

app.post('/api/posts/:id/repost', async (c) => {
  const postId = c.req.param('id');
  const { userId } = await c.req.json<{ userId: string }>();

  const existing = await db.execute({
    sql: 'SELECT 1 FROM reposts WHERE user_id = ? AND post_id = ?',
    args: [userId, postId],
  });

  if (existing.rows.length > 0) {
    await db.batch(
      [
        { sql: 'DELETE FROM reposts WHERE user_id = ? AND post_id = ?', args: [userId, postId] },
        { sql: 'UPDATE posts SET reposts_count = MAX(0, reposts_count - 1) WHERE id = ?', args: [postId] },
      ],
      'write'
    );
    return c.json({ reposted: false });
  }

  await db.batch(
    [
      { sql: 'INSERT INTO reposts (user_id, post_id) VALUES (?, ?)', args: [userId, postId] },
      { sql: 'UPDATE posts SET reposts_count = reposts_count + 1 WHERE id = ?', args: [postId] },
    ],
    'write'
  );
  return c.json({ reposted: true });
});

app.post('/api/posts/:id/bookmark', async (c) => {
  const postId = c.req.param('id');
  const { userId } = await c.req.json<{ userId: string }>();

  const existing = await db.execute({
    sql: 'SELECT 1 FROM bookmarks WHERE user_id = ? AND post_id = ?',
    args: [userId, postId],
  });

  if (existing.rows.length > 0) {
    await db.execute({
      sql: 'DELETE FROM bookmarks WHERE user_id = ? AND post_id = ?',
      args: [userId, postId],
    });
    return c.json({ bookmarked: false });
  }

  await db.execute({
    sql: 'INSERT INTO bookmarks (user_id, post_id) VALUES (?, ?)',
    args: [userId, postId],
  });
  return c.json({ bookmarked: true });
});

app.post('/api/users/:id/follow', async (c) => {
  const targetUserId = c.req.param('id');
  const { followerId } = await c.req.json<{ followerId: string }>();

  const existing = await db.execute({
    sql: 'SELECT 1 FROM follows WHERE follower_id = ? AND following_id = ?',
    args: [followerId, targetUserId],
  });

  if (existing.rows.length > 0) {
    await db.batch(
      [
        {
          sql: 'DELETE FROM follows WHERE follower_id = ? AND following_id = ?',
          args: [followerId, targetUserId],
        },
        {
          sql: 'UPDATE users SET following_count = MAX(0, following_count - 1) WHERE id = ?',
          args: [followerId],
        },
        {
          sql: 'UPDATE users SET followers_count = MAX(0, followers_count - 1) WHERE id = ?',
          args: [targetUserId],
        },
      ],
      'write'
    );
    return c.json({ following: false });
  }

  await db.batch(
    [
      {
        sql: 'INSERT INTO follows (follower_id, following_id) VALUES (?, ?)',
        args: [followerId, targetUserId],
      },
      {
        sql: 'UPDATE users SET following_count = following_count + 1 WHERE id = ?',
        args: [followerId],
      },
      {
        sql: 'UPDATE users SET followers_count = followers_count + 1 WHERE id = ?',
        args: [targetUserId],
      },
    ],
    'write'
  );
  return c.json({ following: true });
});

app.post('/api/reset', async (c) => {
  await seedDatabase(true);
  return c.json({ ok: true });
});

const port = Number(process.env.API_PORT || 3001);
console.log(`Circly API server listening on http://localhost:${port}`);
serve({ fetch: app.fetch, port });
