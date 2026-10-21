"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { FILTER_LABELS, filterPosts, hasFilters, parseFilters, toQueryString, type PostListItem } from "@/lib/filter";
import { PostList } from "./PostList";

// 検索用の本文は大きくなるので、検索したときに1回だけ読み込む（ページを移っても使い回す）
let searchIndex: Promise<Map<string, string>> | undefined;
function loadSearchIndex() {
  searchIndex ??= fetch("/search.json")
    .then((res) => (res.ok ? res.json() : {}))
    .then((json: Record<string, string>) => new Map(Object.entries(json)))
    .catch(() => {
      searchIndex = undefined; // 通信に失敗したら次の検索でもう一度読む
      return new Map<string, string>();
    });
  return searchIndex;
}

/** URL の条件（?q=&fish=…）で記事を絞り込んで並べる */
export function FilteredPostList({ posts }: { posts: PostListItem[] }) {
  const filters = parseFilters(useSearchParams());
  const [bodies, setBodies] = useState<Map<string, string>>();

  useEffect(() => {
    if (filters.q && !bodies) loadSearchIndex().then(setBodies);
  }, [filters.q, bodies]);

  if (!hasFilters(filters)) return <PostList posts={posts} />;

  const results = filterPosts(posts, filters, bodies);
  const active = (Object.keys(FILTER_LABELS) as (keyof typeof FILTER_LABELS)[]).filter((key) => filters[key]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
        {filters.q && (
          <RemoveChip href={`/${toQueryString({ ...filters, q: "" })}`} label="検索">
            {filters.q}
          </RemoveChip>
        )}
        {active.map((key) => (
          <RemoveChip key={key} href={`/${toQueryString({ ...filters, [key]: "" })}`} label={FILTER_LABELS[key]}>
            {key === "year" ? `${filters[key]}年` : filters[key]}
          </RemoveChip>
        ))}
        <span className="text-slate-500">{results.length}件</span>
        <Link href="/" className="ml-auto text-sky-700 underline underline-offset-2">
          条件をクリア
        </Link>
      </div>
      {results.length > 0 ? (
        <PostList posts={results} />
      ) : (
        <p className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
          条件に合う釣果はありません
        </p>
      )}
    </>
  );
}

function RemoveChip({ href, label, children }: { href: string; label: string; children: string }) {
  return (
    <Link
      href={href}
      aria-label={`${label}「${children}」を外す`}
      className="inline-flex items-center gap-1 rounded-full bg-sky-100 py-1 pl-3 pr-2 text-sky-900 hover:bg-sky-200"
    >
      <span className="text-xs text-sky-700">{label}</span>
      {children}
      <span aria-hidden className="text-sky-700">
        ×
      </span>
    </Link>
  );
}
