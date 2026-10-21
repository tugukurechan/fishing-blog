import { mkdtemp, readdir, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import sharp from "sharp";
import { afterAll, describe, expect, it } from "vitest";
import { convertPhoto, MAX_WIDTH } from "../../scripts/photos.mjs";
import { findMetadataChunks } from "./webp";

const PHOTOS_DIR = path.join(process.cwd(), "public", "photos");

async function listFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true, recursive: true });
  return entries.filter((e) => e.isFile()).map((e) => path.join(e.parentPath, e.name));
}

// sharp は読んだファイルを開いたまま覚えておくため、Windows では後片付けで消せなくなる
sharp.cache(false);
const tmp = await mkdtemp(path.join(tmpdir(), "photos-test-"));
afterAll(() => rm(tmp, { recursive: true, force: true }));

/** スマホの写真に見立てて、位置情報（GPS）入りの大きな JPEG を作る */
let count = 0;
async function phonePhoto() {
  const file = path.join(tmp, `phone-${++count}.jpg`);
  await sharp({ create: { width: 4000, height: 3000, channels: 3, background: "#2b6cb0" } })
    .jpeg()
    .withExif({ IFD3: { GPSLatitudeRef: "N", GPSLatitude: "35/1 40/1 0/1" } })
    .toFile(file);
  return file;
}

describe("convertPhoto", () => {
  it("shrinks the photo and removes the location", async () => {
    const input = await phonePhoto();
    expect((await sharp(input).metadata()).exif).toBeDefined();

    const output = path.join(tmp, "1.webp");
    await convertPhoto(input, output);

    const meta = await sharp(output).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(MAX_WIDTH);
    expect(meta.exif).toBeUndefined();
    expect(findMetadataChunks(await readFile(output))).toEqual([]);
  });
});

describe("findMetadataChunks", () => {
  it("finds the EXIF that the conversion is meant to remove", async () => {
    const withExif = await sharp(await phonePhoto()).webp().keepExif().toBuffer();
    expect(findMetadataChunks(withExif)).toContain("EXIF");
  });
});

// commit された写真がすべて変換済みかを CI で確かめる（元の写真をそのまま入れてしまうのを防ぐ）
describe("photos in public/photos", () => {
  it("are all WebP without location or other metadata", async () => {
    for (const file of await listFiles(PHOTOS_DIR)) {
      if (path.basename(file) === ".gitkeep") continue;
      const where = path.relative(process.cwd(), file);
      expect(path.extname(file), `${where} は npm run photos で変換してください`).toBe(".webp");
      expect(findMetadataChunks(await readFile(file)), `${where} にメタデータが残っています`).toEqual([]);
    }
  });
});
