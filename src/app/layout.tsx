import type { Metadata, Viewport } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { HeaderSearch, SearchFormFallback } from "@/components/HeaderSearch";
import { collectFacets } from "@/lib/filter";
import { getAllPosts } from "@/lib/posts";
import { SITE_DESCRIPTION, SITE_NAME } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: SITE_NAME, template: `%s | ${SITE_NAME}` },
  description: SITE_DESCRIPTION,
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0369a1",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // 絞り込みの選択肢（魚種・釣り場・タグ・年）はビルド時に全記事から集める
  const facets = collectFacets(await getAllPosts());

  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="bg-sky-700 text-white">
          <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-start">
            <Link href="/" className="shrink-0 text-lg font-bold leading-9 tracking-wide">
              {SITE_NAME}
            </Link>
            {/* 検索の条件は URL から読むので、ビルド時は JS なしでも使える検索欄を出しておく */}
            <Suspense fallback={<SearchFormFallback />}>
              <HeaderSearch facets={facets} />
            </Suspense>
          </div>
        </header>
        <div className="flex-1">{children}</div>
        <footer className="border-t border-slate-200">
          <p className="mx-auto w-full max-w-2xl px-4 py-6 text-center text-xs text-slate-500">
            made by @tugukurechan
          </p>
        </footer>
      </body>
    </html>
  );
}
