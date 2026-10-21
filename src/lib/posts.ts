import { readdir } from "node:fs/promises";
import path from "node:path";
import type { ComponentType } from "react";
import type { MDXComponents } from "mdx/types";
import { parsePostMeta, sortByDateDesc, type PostMeta } from "./postMeta";

// ビルド時だけ読む（静的サイトなので、公開後に読み込むことはない）
const POSTS_DIR = path.join(process.cwd(), "content", "posts");
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
