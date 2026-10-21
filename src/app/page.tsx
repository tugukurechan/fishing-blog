import Link from "next/link";
import { PostInfo } from "@/components/PostInfo";
import { getAllPosts } from "@/lib/posts";

export default async function Home() {
  const posts = await getAllPosts();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="sr-only">釣行の記録</h1>
      <ul className="flex flex-col gap-4">
        {posts.map((post) => (
          <li key={post.slug}>
            <Link
              href={`/posts/${post.slug}`}
              className="block rounded-xl border border-slate-200 bg-white p-4 transition hover:border-sky-300"
            >
              <h2 className="text-lg font-bold">{post.title}</h2>
              {post.summary && <p className="mt-1 text-sm text-slate-600">{post.summary}</p>}
              <div className="mt-3">
                <PostInfo post={post} />
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
