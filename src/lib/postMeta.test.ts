import { describe, expect, it } from "vitest";
import { parsePostMeta, sortByDateDesc, type PostMeta } from "./postMeta";

const valid = { title: "朝マヅメに1本", date: "2026-10-20", spot: "○○港", fish: ["シーバス"] };

function without(key: keyof typeof valid) {
  return Object.fromEntries(Object.entries(valid).filter(([k]) => k !== key));
}

describe("parsePostMeta", () => {
  it("reads the catch fields written at the top of a post", () => {
    expect(parsePostMeta("sea-bass", { ...valid, tide: "中潮" })).toEqual({
      slug: "sea-bass",
      title: "朝マヅメに1本",
      date: "2026-10-20",
      spot: "○○港",
      fish: ["シーバス"],
      tide: "中潮",
      weather: undefined,
      summary: undefined,
    });
  });

  it("allows a day with no catch", () => {
    expect(parsePostMeta("bouzu", without("fish")).fish).toEqual([]);
  });

  it("stops the build and names the post and field when something is missing", () => {
    expect(() => parsePostMeta("sea-bass", without("spot"))).toThrow("content/posts/sea-bass.mdx: spot がありません");
  });

  it("rejects dates that are not YYYY-MM-DD", () => {
    expect(() => parsePostMeta("x", { ...valid, date: "10/20" })).toThrow("date は 2026-10-20");
    expect(() => parsePostMeta("x", { ...valid, date: "2026-13-40" })).toThrow("date は 2026-10-20");
  });

  it("rejects fish written as a single string", () => {
    expect(() => parsePostMeta("x", { ...valid, fish: "シーバス" })).toThrow("fish は");
  });

  it("asks for the header block when a post has none", () => {
    expect(() => parsePostMeta("x", undefined)).toThrow("先頭に --- で囲んだ項目");
  });
});

describe("sortByDateDesc", () => {
  it("puts the newest trip first", () => {
    const post = (slug: string, date: string): PostMeta => ({ ...valid, slug, date });
    const sorted = sortByDateDesc([post("b", "2026-01-01"), post("c", "2026-10-20"), post("a", "2026-01-01")]);
    expect(sorted.map((p) => p.slug)).toEqual(["c", "a", "b"]);
  });
});
