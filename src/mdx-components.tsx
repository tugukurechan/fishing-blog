import type { MDXComponents } from "mdx/types";
import { CatchCard } from "@/components/CatchCard";
import { Photos } from "@/components/Photo";

// 記事の中で import せずに使える部品。写真の <Photo> は記事ごとのフォルダを知る必要があるので、記事ページで渡す
const components: MDXComponents = {
  CatchCard,
  Photos,
};

export function useMDXComponents(): MDXComponents {
  return components;
}
