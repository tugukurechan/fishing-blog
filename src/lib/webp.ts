/**
 * WebP ファイルに入っているメタデータのチャンク（EXIF・XMP）を返す。
 * 位置情報は EXIF に入るため、公開する写真ではこれが空でなければならない。
 */
export function findMetadataChunks(file: Uint8Array): string[] {
  const text = (start: number, end: number) => String.fromCharCode(...file.subarray(start, end));
  if (file.length < 12 || text(0, 4) !== "RIFF" || text(8, 12) !== "WEBP") {
    throw new Error("WebP ではありません");
  }
  const view = new DataView(file.buffer, file.byteOffset, file.byteLength);
  const found: string[] = [];
  // RIFF のチャンクは「4文字の種類＋4バイトの長さ＋中身（偶数バイトにそろえる）」が続く
  for (let offset = 12; offset + 8 <= file.length; ) {
    const kind = text(offset, offset + 4);
    const size = view.getUint32(offset + 4, true);
    if (kind === "EXIF" || kind === "XMP ") found.push(kind.trim());
    offset += 8 + size + (size % 2);
  }
  return found;
}
