// 記事の MDX から、一覧のプレビュー文・検索用の文章・最初の写真を取り出す（ビルド時に使う）

/** JSX のタグ。属性の "..." や {...} の中の > では終わらない */
const JSX_TAG = /<\/?[A-Za-z][^>"'{}]*(?:(?:"[^"]*"|'[^']*'|\{[^}]*\})[^>"'{}]*)*\/?>/g;
const FIRST_PHOTO = /<Photo\s[^>]*?\bsrc=["']([^"']+)["']/;

/** 先頭の --- で囲んだ項目を除く */
function stripFrontmatter(source: string): string {
  return source.replace(/^﻿?---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
}

/** Markdown の記号を除いて、行ごとの文章にする */
function plainLines(source: string): { text: string; heading: boolean; table: boolean }[] {
  const body = stripFrontmatter(source)
    .replace(/```[\s\S]*?```/g, "") // コードブロック
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, "") // MDX のコメント
    .replace(JSX_TAG, " "); // <CatchCard … /> などの部品（中の文章は残す）

  return body.split(/\r?\n/).flatMap((raw) => {
    const line = raw.trim();
    if (!line || /^(import|export)\s/.test(line)) return [];
    if (/^\|?[\s:|-]+\|[\s:|-]*$/.test(line)) return []; // 表の区切り行
    const text = line
      .replace(/^#{1,6}\s+/, "")
      .replace(/^>\s?/, "")
      .replace(/^([-*+]|\d+\.)\s+/, "")
      .replace(/!\[[^\]]*\]\([^)]*\)/g, "") // 画像
      .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1") // リンクは文字だけ残す
      .replace(/[*_~`]/g, "")
      .replace(/\|/g, " ")
      .replace(/\s+/g, " ")
      .trim();
    if (!text) return [];
    return [{ text, heading: /^#{1,6}\s/.test(line), table: line.startsWith("|") }];
  });
}

/** 一覧に出す本文の書き出し。見出しと表は飛ばす */
export function makeExcerpt(source: string, maxLength = 90): string {
  const text = plainLines(source)
    .filter((l) => !l.heading && !l.table)
    .map((l) => l.text)
    .join(" ");
  const chars = Array.from(text); // 絵文字などを途中で切らない
  return chars.length > maxLength ? `${chars.slice(0, maxLength).join("")}…` : text;
}

/** 検索で引っかける本文（見出し・表も含む） */
export function makeSearchText(source: string): string {
  return plainLines(source)
    .map((l) => l.text)
    .join(" ");
}

/** 本文で最初に使っている <Photo> の src */
export function findFirstPhoto(source: string): string | undefined {
  return stripFrontmatter(source).match(FIRST_PHOTO)?.[1];
}
