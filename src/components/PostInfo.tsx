import type { PostMeta } from "@/lib/postMeta";

export function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

/** 釣行日・釣り場・魚種などを並べる。一覧と記事の先頭で使う */
export function PostInfo({ post }: { post: PostMeta }) {
  const conditions = [post.weather, post.tide].filter(Boolean).join(" / ");
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span>{post.spot}</span>
      {conditions && <span>{conditions}</span>}
      {post.fish.length > 0 ? (
        <span className="flex gap-1">
          {post.fish.map((f) => (
            <span key={f} className="rounded-full bg-sky-100 px-2 py-0.5 text-xs font-medium text-sky-800">
              {f}
            </span>
          ))}
        </span>
      ) : (
        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">釣果なし</span>
      )}
    </div>
  );
}
