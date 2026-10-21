import type { Metadata, Viewport } from "next";
import Link from "next/link";
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

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="ja" className="h-full antialiased">
      <body className="flex min-h-full flex-col">
        <header className="bg-sky-700 text-white">
          <div className="mx-auto flex h-14 w-full max-w-2xl items-center px-4">
            <Link href="/" className="text-lg font-bold tracking-wide">
              {SITE_NAME}
            </Link>
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
