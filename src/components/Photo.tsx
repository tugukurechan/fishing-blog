export type PhotoProps = {
  /** 記事の写真フォルダの中のファイル名（例: 1.webp）。npm run photos が出力する */
  src: string;
  alt: string;
  caption?: string;
  className?: string;
};

/** 記事の写真。src は public/photos/<記事のファイル名>/ からの相対で書く */
export function Photo({ slug, src, alt, caption, className = "" }: PhotoProps & { slug: string }) {
  return (
    <figure className={`my-6 ${className}`}>
      {/* 写真は commit 前に縮小・WebP 化しており、静的サイトでは next/image の最適化が使えないため img を使う */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/photos/${slug}/${src}`}
        alt={alt}
        loading="lazy"
        decoding="async"
        className="m-0 w-full rounded-lg"
      />
      {caption && <figcaption className="mt-2 text-center text-sm text-slate-500">{caption}</figcaption>}
    </figure>
  );
}

/** 写真を2列に並べる。<Photos><Photo … /><Photo … /></Photos> */
export function Photos({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`grid grid-cols-2 gap-3 [&_figure]:my-0 ${className}`}>{children}</div>;
}
