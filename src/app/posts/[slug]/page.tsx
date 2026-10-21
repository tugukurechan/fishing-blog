import type { Metadata } from "next";
import Link from "next/link";
import { Photo, type PhotoProps } from "@/components/Photo";
import { PostInfo } from "@/components/PostInfo";
import { getPost, getSlugs } from "@/lib/posts";

// 記事はビルド時にすべて HTML にする。ない記事は 404
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getSlugs()).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/posts/[slug]">): Promise<Metadata> {
  const { meta } = await getPost((await params).slug);
  return { title: meta.title, description: meta.summary };
}

export default async function PostPage({ params }: PageProps<"/posts/[slug]">) {
  const { slug } = await params;
  const { meta, Content } = await getPost(slug);

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <article>
        <header className="mb-8">
          <h1 className="text-2xl font-bold leading-snug">{meta.title}</h1>
          <div className="mt-3">
            <PostInfo post={meta} />
          </div>
        </header>
        <div className="prose prose-slate max-w-none prose-headings:font-bold prose-a:text-sky-700">
          <Content components={{ Photo: (props: PhotoProps) => <Photo {...props} slug={slug} /> }} />
        </div>
      </article>
      <Link href="/" className="mt-12 inline-block text-sm text-sky-700 underline underline-offset-2">
        記事の一覧へ
      </Link>
    </main>
  );
}
