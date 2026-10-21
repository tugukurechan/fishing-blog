"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useId, useState } from "react";
import { FILTER_LABELS, parseFilters, toQueryString, type Facets, type Filters } from "@/lib/filter";

type FacetKey = keyof typeof FILTER_LABELS;
const FACET_KEYS = Object.keys(FILTER_LABELS) as FacetKey[];

const INPUT =
  "h-9 w-full rounded-lg border-0 bg-white/95 px-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-2 focus:outline-sky-300";

/** JS が読み込まれる前（と JS がないとき）の検索欄。送ると /?q=… の一覧へ */
export function SearchFormFallback() {
  return (
    <form action="/" role="search" className="flex flex-1 gap-2">
      <input type="search" name="q" placeholder="釣果を検索" aria-label="釣果を検索" className={INPUT} />
    </form>
  );
}

/**
 * ヘッダーの検索欄と絞り込み。条件は URL（/?q=&fish=&spot=&tag=&year=）に持たせるので、
 * 共有・ブラウザの戻る・再読み込みでも同じ一覧になる。一覧では入力に合わせてその場で絞り込む
 */
export function HeaderSearch({ facets }: { facets: Facets }) {
  const router = useRouter();
  const onHome = usePathname() === "/";
  const filters = parseFilters(useSearchParams());
  const panelId = useId();

  const [text, setText] = useState(filters.q);
  // 自分で URL に書いた q。URL の q がこれと違うとき（「条件をクリア」など）だけ入力欄を合わせる
  const [syncedQ, setSyncedQ] = useState(filters.q);
  if (filters.q !== syncedQ) {
    setSyncedQ(filters.q);
    setText(filters.q);
  }

  const activeCount = FACET_KEYS.filter((key) => filters[key]).length;
  const [open, setOpen] = useState(false);

  function go(next: Filters, replace = false) {
    setSyncedQ(next.q);
    const url = `/${toQueryString(next)}`;
    if (replace) router.replace(url, { scroll: false });
    else router.push(url);
  }

  // 一覧にいるときは、打ち終わって少し待ってから絞り込む
  useEffect(() => {
    if (!onHome || text.trim() === filters.q) return;
    const timer = setTimeout(() => go({ ...filters, q: text.trim() }, true), 300);
    return () => clearTimeout(timer);
  });

  return (
    <div className="flex flex-1 flex-col">
      <form
        role="search"
        className="flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          go({ ...filters, q: text.trim() });
        }}
      >
        <input
          type="search"
          name="q"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="釣果を検索"
          aria-label="釣果を検索"
          className={INPUT}
        />
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen(!open)}
          className="flex h-9 shrink-0 items-center gap-1 rounded-lg bg-sky-800 px-3 text-sm font-medium hover:bg-sky-900"
        >
          絞り込み
          {activeCount > 0 && (
            <span className="rounded-full bg-white px-1.5 text-xs font-bold text-sky-800">{activeCount}</span>
          )}
        </button>
      </form>

      {open && (
        <div id={panelId} className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {FACET_KEYS.map((key) => (
            <label key={key} className="flex flex-col gap-1 text-xs font-medium text-sky-100">
              {FILTER_LABELS[key]}
              <select
                value={filters[key]}
                onChange={(e) => go({ ...filters, q: text.trim(), [key]: e.target.value })}
                className={INPUT}
              >
                <option value="">すべて</option>
                {facets[key].map(({ value, count }) => (
                  <option key={value} value={value}>
                    {key === "year" ? `${value}年` : value}（{count}）
                  </option>
                ))}
              </select>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
