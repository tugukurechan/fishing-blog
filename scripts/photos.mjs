// 写真をブログ用に変換して public/photos/<記事のファイル名>/ に置く（docs/decisions.md D-02）
//   npm run photos -- <記事のファイル名> <写真> [<写真> ...]
// 横幅を縮めて WebP にし、位置情報（GPS）を含むメタデータをすべて消す。
// git は消したファイルも履歴に残すので、元の写真は commit せず、必ずこれを通してから入れる。
import { mkdir, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

export const MAX_WIDTH = 1600;
const QUALITY = 80;

/** 1枚を変換する。sharp は withMetadata() を呼ばない限りメタデータを書き出さない */
export async function convertPhoto(input, output) {
  return sharp(input)
    .rotate() // 縦向きの情報はメタデータと一緒に消えるので、先に画素へ反映する
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .webp({ quality: QUALITY })
    .toFile(output);
}

async function nextNumber(dir) {
  const names = await readdir(dir).catch(() => []);
  const numbers = names.map((n) => Number.parseInt(n, 10)).filter(Number.isInteger);
  return numbers.length ? Math.max(...numbers) + 1 : 1;
}

async function main([slug, ...inputs]) {
  if (!slug || !/^[a-z0-9-]+$/.test(slug) || inputs.length === 0) {
    console.error("使い方: npm run photos -- <記事のファイル名（.mdx を除く）> <写真> [<写真> ...]");
    process.exit(1);
  }
  const dir = path.join("public", "photos", slug);
  await mkdir(dir, { recursive: true });

  let n = await nextNumber(dir);
  const lines = [];
  for (const input of inputs) {
    const name = `${n++}.webp`;
    const info = await convertPhoto(input, path.join(dir, name));
    console.log(`${input} → ${path.join(dir, name)}（${info.width}×${info.height}, ${Math.round(info.size / 1024)}KB）`);
    lines.push(`<Photo src="${name}" alt="" />`);
  }
  console.log("\n記事に貼る:\n" + lines.join("\n"));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  await main(process.argv.slice(2));
}
