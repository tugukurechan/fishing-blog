import type { NextConfig } from "next";
import createMDX from "@next/mdx";

// 記事から HTML を前もって作る静的サイト（docs/decisions.md D-01）。サーバーは持たない。
const nextConfig: NextConfig = {
  output: "export",
  pageExtensions: ["ts", "tsx", "mdx"],
  // 写真は commit 前に scripts/photos.mjs で縮小・変換しているので、Next.js の画像最適化は使わない
  images: { unoptimized: true },
};

// Turbopack では remark プラグインを名前（文字列）で渡す
const withMDX = createMDX({
  options: {
    remarkPlugins: ["remark-gfm", "remark-frontmatter", "remark-mdx-frontmatter"],
  },
});

export default withMDX(nextConfig);
