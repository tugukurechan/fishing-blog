import { Suspense } from "react";
import { FilteredPostList } from "@/components/FilteredPostList";
import { PostList } from "@/components/PostList";
import { getPostListItems } from "@/lib/posts";

export default async function Home() {
  const posts = await getPostListItems();

  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-8">
      <h1 className="sr-only">釣行の記録</h1>
      {/* 絞り込みの条件は URL から読むので、ビルド時の HTML には全件（新しい順）を入れておく */}
      <Suspense fallback={<PostList posts={posts} />}>
        <FilteredPostList posts={posts} />
      </Suspense>
    </main>
  );
}
