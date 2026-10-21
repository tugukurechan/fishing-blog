import { describe, expect, it } from "vitest";
import { collectFacets, filterPosts, normalize, parseFilters, toQueryString, type PostListItem } from "./filter";

const post = (slug: string, over: Partial<PostListItem> = {}): PostListItem => ({
  slug,
  title: slug,
  date: "2026-10-20",
  spot: "○○港",
  fish: [],
  tags: [],
  excerpt: "",
  ...over,
});

const posts = [
  post("a", { title: "朝マヅメに1本", fish: ["シーバス"], tags: ["ルアー"], date: "2026-10-20" }),
  post("b", { spot: "△△川 河口", fish: ["シーバス", "チヌ"], tags: ["夜釣り"], date: "2026-05-01" }),
  post("c", { excerpt: "今日はアジを狙ったけど坊主", date: "2025-12-01" }),
];

const none = parseFilters(new URLSearchParams());
const slugs = (list: PostListItem[]) => list.map((p) => p.slug);

describe("filterPosts", () => {
  it("returns every post in the same order when there are no conditions", () => {
    expect(slugs(filterPosts(posts, none))).toEqual(["a", "b", "c"]);
  });

  it("narrows by fish, spot, tag and year", () => {
    expect(slugs(filterPosts(posts, { ...none, fish: "シーバス" }))).toEqual(["a", "b"]);
    expect(slugs(filterPosts(posts, { ...none, spot: "△△川 河口" }))).toEqual(["b"]);
    expect(slugs(filterPosts(posts, { ...none, tag: "夜釣り" }))).toEqual(["b"]);
    expect(slugs(filterPosts(posts, { ...none, year: "2025" }))).toEqual(["c"]);
    expect(slugs(filterPosts(posts, { ...none, fish: "シーバス", tag: "ルアー" }))).toEqual(["a"]);
  });

  it("searches title, excerpt and fish, ignoring kana and width differences", () => {
    expect(slugs(filterPosts(posts, { ...none, q: "しーばす" }))).toEqual(["a", "b"]);
    expect(slugs(filterPosts(posts, { ...none, q: "ｱｼﾞ" }))).toEqual(["c"]);
    expect(slugs(filterPosts(posts, { ...none, q: "シーバス 河口" }))).toEqual(["b"]);
  });

  it("also searches the post body once the search index is loaded", () => {
    const bodies = new Map([["a", "ミノー 12cm で釣れた"]]);
    expect(slugs(filterPosts(posts, { ...none, q: "ミノー" }))).toEqual([]);
    expect(slugs(filterPosts(posts, { ...none, q: "ミノー" }, bodies))).toEqual(["a"]);
  });
});

describe("collectFacets", () => {
  it("lists values with counts, most used first, and years newest first", () => {
    const facets = collectFacets(posts);
    expect(facets.fish).toEqual([
      { value: "シーバス", count: 2 },
      { value: "チヌ", count: 1 },
    ]);
    expect(facets.year.map((y) => y.value)).toEqual(["2026", "2025"]);
  });
});

describe("query strings", () => {
  it("writes only the conditions that are set and reads them back", () => {
    const query = toQueryString({ ...none, fish: "シーバス", q: " 河口 " });
    expect(query).toBe("?q=%E6%B2%B3%E5%8F%A3&fish=%E3%82%B7%E3%83%BC%E3%83%90%E3%82%B9");
    expect(parseFilters(new URLSearchParams(query))).toEqual({ ...none, fish: "シーバス", q: "河口" });
    expect(toQueryString(none)).toBe("");
  });

  it("normalizes katakana to hiragana and full-width to half-width", () => {
    expect(normalize("シーバスＡＢＣ")).toBe("しーばすabc");
  });
});
