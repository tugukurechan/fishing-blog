import { getSearchIndex } from "@/lib/posts";

// 検索用の本文をビルド時に /search.json として出力する（静的サイトなので GET だけ）
export const dynamic = "force-static";

export async function GET() {
  return Response.json(await getSearchIndex());
}
