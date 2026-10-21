/** 記事の先頭（frontmatter）に書く釣果の項目 */
export type PostMeta = {
  slug: string;
  title: string;
  /** 釣行日（YYYY-MM-DD） */
  date: string;
  /** 釣り場。「○○港」くらいの粒度にし、細かい場所は書かない（D-03） */
  spot: string;
  /** 釣れた魚・狙った魚。坊主の日は空でよい */
  fish: string[];
  /** 自由に付ける目印（例: 夜釣り、ルアー、自己記録）。一覧で絞り込める */
  tags: string[];
  weather?: string;
  tide?: string;
  /** 一覧に出す短い説明。書かなければ本文の書き出しを出す */
  summary?: string;
  /** 一覧に出す写真（例: 2.webp）。書かなければ本文の最初の <Photo> */
  cover?: string;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;
const PHOTO_FILE = /^[a-z0-9-]+\.webp$/;

function optionalText(data: Record<string, unknown>, key: string, where: string): string | undefined {
  const value = data[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !value.trim()) throw new Error(`${where}: ${key} は文字列で書いてください`);
  return value;
}

function textList(data: Record<string, unknown>, key: string, where: string, example: string): string[] {
  const value = data[key] ?? [];
  if (!Array.isArray(value) || value.some((v) => typeof v !== "string" || !v.trim())) {
    throw new Error(`${where}: ${key} は ${example} のように書いてください`);
  }
  return value;
}

function requiredText(data: Record<string, unknown>, key: string, where: string): string {
  const value = optionalText(data, key, where);
  if (value === undefined) throw new Error(`${where}: ${key} がありません`);
  return value;
}

/**
 * 記事の frontmatter を確かめて PostMeta にする。
 * 書き間違いはビルドを止めて、どの記事のどの項目かを出す（公開してから気づくより早い）。
 */
export function parsePostMeta(slug: string, frontmatter: unknown): PostMeta {
  const where = `content/posts/${slug}.mdx`;
  if (typeof frontmatter !== "object" || frontmatter === null) {
    throw new Error(`${where}: 先頭に --- で囲んだ項目（title・date・spot・fish）を書いてください`);
  }
  const data = frontmatter as Record<string, unknown>;

  const date = requiredText(data, "date", where);
  if (!DATE.test(date) || Number.isNaN(Date.parse(date))) {
    throw new Error(`${where}: date は 2026-10-20 のように書いてください`);
  }

  const cover = optionalText(data, "cover", where);
  if (cover !== undefined && !PHOTO_FILE.test(cover)) {
    throw new Error(`${where}: cover は 1.webp のように、写真フォルダの中のファイル名で書いてください`);
  }

  return {
    slug,
    title: requiredText(data, "title", where),
    date,
    spot: requiredText(data, "spot", where),
    fish: textList(data, "fish", where, "[シーバス, アジ]"),
    tags: textList(data, "tags", where, "[夜釣り, ルアー]"),
    weather: optionalText(data, "weather", where),
    tide: optionalText(data, "tide", where),
    summary: optionalText(data, "summary", where),
    cover,
  };
}

/** 新しい釣行から順に並べる。同じ日は slug の順 */
export function sortByDateDesc<T extends PostMeta>(posts: T[]): T[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}
