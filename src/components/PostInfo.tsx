import Link from "next/link";
import { toQueryString, type Filters } from "@/lib/filter";
import type { PostMeta } from "@/lib/postMeta";

export function formatDate(date: string) {
  const [y, m, d] = date.split("-").map(Number);
  return `${y}年${m}月${d}日`;
}

const CHIP = "rounded-full px-2 py-0.5 text-xs font-medium";
const FISH_CHIP = `${CHIP} bg-sky-100 text-sky-800`;
const TAG_CHIP = `${CHIP} bg-slate-100 text-slate-600`;

/**
 * 釣行日・釣り場・魚種・タグなどを並べる。一覧と記事の先頭で使う。
 * linked のときは、押すとその条件で一覧を絞り込む（一覧のカードは全体がリンクなので付けない）
 */
export function PostInfo({ post, linked = false }: { post: PostMeta; linked?: boolean }) {
  const conditions = [post.weather, post.tide].filter(Boolean).join(" / ");

  const item = (key: string, filter: Partial<Filters>, className: string, children: React.ReactNode) =>
    linked ? (
      <Link key={key} href={`/${toQueryString(filter)}`} className={`${className} hover:underline`}>
        {children}
      </Link>
    ) : (
      <span key={key} className={className}>
        {children}
      </span>
    );

  return (
    <div className="flex flex-col gap-2 text-sm text-slate-500">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        <time dateTime={post.date}>{formatDate(post.date)}</time>
        {item("spot", { spot: post.spot }, "", post.spot)}
        {conditions && <span>{conditions}</span>}
      </div>
      <div className="flex flex-wrap gap-1">
        {post.fish.length > 0 ? (
          post.fish.map((f) => item(`fish-${f}`, { fish: f }, FISH_CHIP, f))
        ) : (
          <span className={TAG_CHIP}>釣果なし</span>
        )}
        {post.tags.map((t) => item(`tag-${t}`, { tag: t }, TAG_CHIP, `#${t}`))}
      </div>
    </div>
  );
}
