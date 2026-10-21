import type { PostMeta } from "./postMeta";

/** 一覧に出す1件。本文から作った書き出しと写真を足したもの */
export type PostListItem = PostMeta & {
  /** summary があればそれ、なければ本文の書き出し */
  excerpt: string;
  /** 一覧に出す写真の URL */
  coverUrl?: string;
};

/** 一覧の絞り込み条件。URL の ?q=&fish=&spot=&tag=&year= にそのまま対応する */
export type Filters = {
  q: string;
  fish: string;
  spot: string;
  tag: string;
  year: string;
};

export const FILTER_KEYS = ["q", "fish", "spot", "tag", "year"] as const satisfies readonly (keyof Filters)[];

export const FILTER_LABELS: Record<Exclude<keyof Filters, "q">, string> = {
  fish: "魚種",
  spot: "釣り場",
  tag: "タグ",
  year: "年",
};

export function parseFilters(params: { get(key: string): string | null }): Filters {
  const read = (key: keyof Filters) => params.get(key)?.trim() ?? "";
  return { q: read("q"), fish: read("fish"), spot: read("spot"), tag: read("tag"), year: read("year") };
}

/** 空でない条件だけを URL のクエリにする（例: ?fish=シーバス&q=河口） */
export function toQueryString(filters: Partial<Filters>): string {
  const params = new URLSearchParams();
  for (const key of FILTER_KEYS) {
    const value = filters[key]?.trim();
    if (value) params.set(key, value);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

export function hasFilters(filters: Filters): boolean {
  return FILTER_KEYS.some((key) => filters[key] !== "");
}

/**
 * 検索で比べるための形にそろえる。全角・半角、大文字・小文字、ひらがな・カタカナの違いを無視する
 * （「しーばす」「ｼｰﾊﾞｽ」でもシーバスが見つかる）
 */
export function normalize(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[ァ-ヶ]/g, (c) => String.fromCharCode(c.charCodeAt(0) - 0x60));
}

/** 魚種・釣り場・タグ・年の一覧と件数。ヘッダーの絞り込みの選択肢に使う */
export type Facets = Record<Exclude<keyof Filters, "q">, { value: string; count: number }[]>;

export function collectFacets(posts: PostMeta[]): Facets {
  const count = (values: string[]) => {
    const counts = new Map<string, number>();
    for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
    return [...counts].map(([value, count]) => ({ value, count }));
  };
  const byCount = (a: { value: string; count: number }, b: { value: string; count: number }) =>
    b.count - a.count || a.value.localeCompare(b.value, "ja");

  return {
    fish: count(posts.flatMap((p) => p.fish)).sort(byCount),
    spot: count(posts.map((p) => p.spot)).sort(byCount),
    tag: count(posts.flatMap((p) => p.tags)).sort(byCount),
    year: count(posts.map((p) => p.date.slice(0, 4))).sort((a, b) => b.value.localeCompare(a.value)),
  };
}

/**
 * 条件に合う記事だけを返す（並び順は変えない）。
 * q は空白で区切った語がすべて含まれる記事。bodies（slug → 本文）があれば本文も探す。
 */
export function filterPosts<T extends PostListItem>(posts: T[], filters: Filters, bodies?: Map<string, string>): T[] {
  const words = normalize(filters.q).split(/\s+/).filter(Boolean);

  return posts.filter((post) => {
    if (filters.fish && !post.fish.includes(filters.fish)) return false;
    if (filters.spot && post.spot !== filters.spot) return false;
    if (filters.tag && !post.tags.includes(filters.tag)) return false;
    if (filters.year && !post.date.startsWith(`${filters.year}-`)) return false;
    if (words.length === 0) return true;

    const haystack = normalize(
      [post.title, post.spot, post.weather, post.tide, post.excerpt, ...post.fish, ...post.tags, bodies?.get(post.slug)]
        .filter(Boolean)
        .join(" "),
    );
    return words.every((w) => haystack.includes(w));
  });
}
