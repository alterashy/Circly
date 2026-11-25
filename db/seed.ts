import type { InStatement } from '@libsql/client';
import { db } from '../server/db';
import {
  INITIAL_USERS,
  INITIAL_FOLLOW_GRAPH,
  INITIAL_POSTS,
  INITIAL_ACTIVITIES,
} from '../src/services/mockData';

export async function seedDatabase(reset = false) {
  const statements: InStatement[] = [];

  if (reset) {
    statements.push(
      'DELETE FROM activities',
      'DELETE FROM follows',
      'DELETE FROM bookmarks',
      'DELETE FROM reposts',
      'DELETE FROM likes',
      'DELETE FROM posts',
      'DELETE FROM users'
    );
  }

  for (const u of INITIAL_USERS) {
    statements.push({
      sql: `INSERT OR IGNORE INTO users (id, username, full_name, avatar, bio, website, badge, followers_count, following_count)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        u.id,
        u.username,
        u.fullName,
        u.avatar,
        u.bio,
        u.website ?? '',
        u.badge ?? '',
        u.followersCount,
        u.followingCount,
      ],
    });
  }

  for (const [followerId, followingIds] of Object.entries(INITIAL_FOLLOW_GRAPH)) {
    for (const followingId of followingIds) {
      statements.push({
        sql: `INSERT OR IGNORE INTO follows (follower_id, following_id) VALUES (?, ?)`,
        args: [followerId, followingId],
      });
    }
  }

  const defaultActorId = 'usr_current';

  for (const post of INITIAL_POSTS) {
    statements.push({
      sql: `INSERT OR IGNORE INTO posts (id, user_id, parent_id, root_thread_id, sequence_index, content, media_url, likes_count, reposts_count, replies_count, created_at)
            VALUES (?, ?, NULL, NULL, 0, ?, ?, ?, ?, ?, ?)`,
      args: [
        post.id,
        post.userId,
        post.content,
        post.mediaUrl ?? null,
        post.likesCount,
        post.repostsCount,
        post.repliesCount,
        post.createdAt,
      ],
    });

    if (post.isLiked) {
      statements.push({
        sql: `INSERT OR IGNORE INTO likes (user_id, post_id) VALUES (?, ?)`,
        args: [defaultActorId, post.id],
      });
    }
    if (post.isReposted) {
      statements.push({
        sql: `INSERT OR IGNORE INTO reposts (user_id, post_id) VALUES (?, ?)`,
        args: [defaultActorId, post.id],
      });
    }
    if (post.isBookmarked) {
      statements.push({
        sql: `INSERT OR IGNORE INTO bookmarks (user_id, post_id) VALUES (?, ?)`,
        args: [defaultActorId, post.id],
      });
    }

    (post.chainedPosts ?? []).forEach((cp, index) => {
      statements.push({
        sql: `INSERT OR IGNORE INTO posts (id, user_id, parent_id, root_thread_id, sequence_index, content, media_url, created_at)
              VALUES (?, ?, NULL, ?, ?, ?, ?, ?)`,
        args: [
          cp.id,
          post.userId,
          post.id,
          index + 1,
          cp.content,
          cp.mediaUrl ?? null,
          post.createdAt,
        ],
      });
    });

    for (const reply of post.replies ?? []) {
      statements.push({
        sql: `INSERT OR IGNORE INTO posts (id, user_id, parent_id, root_thread_id, sequence_index, content, media_url, likes_count, created_at)
              VALUES (?, ?, ?, NULL, 0, ?, ?, ?, ?)`,
        args: [
          reply.id,
          reply.userId,
          post.id,
          reply.content,
          reply.mediaUrl ?? null,
          reply.likesCount,
          reply.createdAt,
        ],
      });
      if (reply.isLiked) {
        statements.push({
          sql: `INSERT OR IGNORE INTO likes (user_id, post_id) VALUES (?, ?)`,
          args: [defaultActorId, reply.id],
        });
      }
    }
  }

  for (const act of INITIAL_ACTIVITIES) {
    statements.push({
      sql: `INSERT OR IGNORE INTO activities (id, user_id, type, target_post_id, snippet, created_at)
            VALUES (?, ?, ?, ?, ?, ?)`,
      args: [
        act.id,
        act.userId,
        act.type,
        act.targetPostId ?? null,
        act.snippet,
        act.createdAt,
      ],
    });
  }

  await db.batch(statements, 'write');
}

const isDirectRun = process.argv[1]?.endsWith('seed.ts');
if (isDirectRun) {
  seedDatabase(false)
    .then(() => {
      console.log('Turso database seeded successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
