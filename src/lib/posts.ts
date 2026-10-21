import { access, readdir, readFile } from "node:fs/promises";
import path from "node:path";
import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import type { PostListItem } from "./filter";
import { parsePostMeta, sortByDateDesc, type PostMeta } from "./postMeta";
import { findFirstPhoto, makeExcerpt, makeSearchText } from "./postText";

// ビルド時だけ読む（静的サイトなので、公開後に読み込むことはない）
const POSTS_DIR = path.join(process.cwd(), "content", "posts");
const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");
const SLUG = /^[a-z0-9-]+$/;

type PostModule = {
  default: ComponentType<{ components?: MDXComponents }>;
  frontmatter?: unknown;
};

export async function getSlugs(): Promise<string[]> {
  const files = await readdir(POSTS_DIR);
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => {
      const slug = f.slice(0, -".mdx".length);
      // URL と写真のフォルダ名になるので、英小文字・数字・ハイフンだけにする
      if (!SLUG.test(slug)) throw new Error(`content/posts/${f}: ファイル名は英小文字・数字・ハイフンだけにしてください`);
      return slug;
    });
}

export async function getPost(slug: string) {
  const mod = (await import(`@content/posts/${slug}.mdx`)) as PostModule;
  return { meta: parsePostMeta(slug, mod.frontmatter), Content: mod.default };
}

export async function getAllPosts(): Promise<PostMeta[]> {
  const slugs = await getSlugs();
  const posts = await Promise.all(slugs.map(async (slug) => (await getPost(slug)).meta));
  return sortByDateDesc(posts);
}

function readSource(slug: string): Promise<string> {
  return readFile(path.join(POSTS_DIR, `${slug}.mdx`), "utf8");
}

/** 一覧に出すもの。本文の書き出しと、cover（なければ本文の最初の写真）を足す */
export async function getPostListItems(): Promise<PostListItem[]> {
  const items = await Promise.all(
    (await getAllPosts()).map(async (meta) => {
      const source = await readSource(meta.slug);
      const cover = meta.cover ?? findFirstPhoto(source);
      if (cover) {
        // 写真の付け忘れ・ファイル名の書き間違いは、一覧の画像が切れる前にビルドで止める
        await access(path.join(PHOTOS_DIR, meta.slug, cover)).catch(() => {
          throw new Error(`content/posts/${meta.slug}.mdx: 写真 public/photos/${meta.slug}/${cover} がありません`);
        });
      }
      return {
        ...meta,
        excerpt: meta.summary ?? makeExcerpt(source),
        coverUrl: cover && `/photos/${meta.slug}/${cover}`,
      };
    }),
  );
  return sortByDateDesc(items);
}

/** 検索用の本文（slug → 文章）。/search.json として出力し、検索したときだけ読み込む */
export async function getSearchIndex(): Promise<Record<string, string>> {
  const slugs = await getSlugs();
  const entries = await Promise.all(slugs.map(async (slug) => [slug, makeSearchText(await readSource(slug))] as const));
  return Object.fromEntries(entries);
}
