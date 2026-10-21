import Link from "next/link";
import type { PostListItem } from "@/lib/filter";
import { PostInfo } from "./PostInfo";

/** 一覧の1件。タイトル・本文の書き出し・写真を並べ、押すと記事へ */
export function PostCard({ post }: { post: PostListItem }) {
  return (
    <Link
      href={`/posts/${post.slug}`}
      className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-sky-300"
    >
      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-bold leading-snug">{post.title}</h2>
        {post.excerpt && <p className="mt-1 line-clamp-3 text-sm text-slate-600">{post.excerpt}</p>}
        <div className="mt-3">
          <PostInfo post={post} />
        </div>
      </div>
      {post.coverUrl && (
        // 写真は commit 前に縮小・WebP 化しており、静的サイトでは next/image の最適化が使えないため img を使う
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className="size-24 shrink-0 rounded-lg bg-slate-100 object-cover sm:size-36"
        />
      )}
    </Link>
  );
}

export function PostList({ posts }: { posts: PostListItem[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {posts.map((post) => (
        <li key={post.slug}>
          <PostCard post={post} />
        </li>
      ))}
    </ul>
  );
}
