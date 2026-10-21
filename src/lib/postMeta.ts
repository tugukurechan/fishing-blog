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
  weather?: string;
  tide?: string;
  /** 一覧に出す短い説明 */
  summary?: string;
};

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function optionalText(data: Record<string, unknown>, key: string, where: string): string | undefined {
  const value = data[key];
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !value.trim()) throw new Error(`${where}: ${key} は文字列で書いてください`);
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

  const fish = data.fish ?? [];
  if (!Array.isArray(fish) || fish.some((f) => typeof f !== "string" || !f.trim())) {
    throw new Error(`${where}: fish は [シーバス, アジ] のように書いてください`);
  }

  return {
    slug,
    title: requiredText(data, "title", where),
    date,
    spot: requiredText(data, "spot", where),
    fish,
    weather: optionalText(data, "weather", where),
    tide: optionalText(data, "tide", where),
    summary: optionalText(data, "summary", where),
  };
}

/** 新しい釣行から順に並べる。同じ日は slug の順 */
export function sortByDateDesc(posts: PostMeta[]): PostMeta[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));
}
