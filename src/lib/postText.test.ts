import { describe, expect, it } from "vitest";
import { findFirstPhoto, makeExcerpt, makeSearchText } from "./postText";

const source = `---
title: 朝マヅメに1本
date: 2026-10-20
---

今日は**○○港**に行ってきた。[潮見表](https://example.com)では中潮。

## 状況

<CatchCard fish="シーバス" size="62cm" bait="ミノー 12cm" />

<Photos>
  <Photo src="3.webp" alt="a > b" caption="朝焼け" />
  <Photo src="4.webp" alt="" />
</Photos>

<p className="text-2xl font-bold">62cm！自己記録更新！</p>

| | |
|---|---|
| ロッド | 9.6ft ML |
`;

describe("makeExcerpt", () => {
  it("returns the opening text without frontmatter, markdown marks, headings, components or tables", () => {
    expect(makeExcerpt(source)).toBe("今日は○○港に行ってきた。潮見表では中潮。 62cm！自己記録更新！");
  });

  it("cuts long text and marks it with an ellipsis", () => {
    expect(makeExcerpt("あいうえおかきくけこ", 5)).toBe("あいうえお…");
  });
});

describe("makeSearchText", () => {
  it("keeps headings and table cells so they can be searched", () => {
    const text = makeSearchText(source);
    expect(text).toContain("状況");
    expect(text).toContain("9.6ft ML");
    expect(text).not.toContain("CatchCard");
    expect(text).not.toContain("title:");
  });
});

describe("findFirstPhoto", () => {
  it("finds the first <Photo> in the body", () => {
    expect(findFirstPhoto(source)).toBe("3.webp");
  });

  it("returns undefined when the post has no photo", () => {
    expect(findFirstPhoto("本文だけ")).toBeUndefined();
  });
});
