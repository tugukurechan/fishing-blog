# fishing-blog（仮の名前）

自分の釣行を記録するブログ。記事は MDX（Markdown＋部品）で書き、Next.js で静的な HTML にして公開する。

- 公開先: Cloudflare（予定）。サブドメイン `○○.tugukurechan.com` に置き、ポートフォリオ `tugukurechan.com` の作品の1つにする
- 方針と決めたこと: [docs/decisions.md](docs/decisions.md) / 進め方: [docs/plan.md](docs/plan.md)

## 開発

Node.js 22.22.2 以上。

```bash
npm install
npm run dev     # http://localhost:3000
npm test        # 記事の項目チェック・写真の検査
npm run lint
npm run build   # out/ に静的サイトができる
```

## 記事を書く

1. `content/posts/<ファイル名>.mdx` を作る。ファイル名は英小文字・数字・ハイフンだけ（例: `2026-10-20-sea-bass.mdx`）。URL は `/posts/<ファイル名>` になる
2. 先頭に釣果の項目を書き、その下に本文を Markdown で書く

```mdx
---
title: 朝マヅメに1本      # 必須
date: 2026-10-20          # 必須。釣行日
spot: ○○港               # 必須。細かい場所までは書かない
fish: [シーバス]          # 釣れた魚。坊主の日は書かなくてよい
tags: [朝マヅメ, ルアー]  # 任意。一覧で絞り込める
weather: 晴れ             # 任意
tide: 中潮                # 任意
summary: 一覧に出す説明   # 任意。書かなければ本文の書き出しを出す
cover: 2.webp             # 任意。一覧に出す写真。書かなければ本文の最初の <Photo>
---

## 状況

本文…
```

1つの記事に1回の釣行を書く。一覧は釣行日の新しい順に並ぶ。

項目の書き間違いは `npm run build`（と CI）が止めて、どの記事のどの項目かを出す。見本は `content/posts/sample-trip.mdx`。

### 記事の中で使える部品

| 部品 | 使い方 |
|---|---|
| 釣果カード | `<CatchCard fish="シーバス" size="62cm" bait="ミノー 12cm" time="5:20" />` |
| 写真 | `<Photo src="1.webp" alt="写真の説明" caption="任意の説明" />` |
| 写真を2列に並べる | `<Photos>` と `</Photos>` で `<Photo>` を囲む |

その行だけデザインを変えたいときは、HTML をそのまま書いて `className` に Tailwind のクラスを付ける。

```mdx
<p className="text-2xl font-bold text-sky-700">62cm！自己記録更新！</p>
```

部品の見た目は `src/components/` で変えられ、使っている全記事に反映される。

## 一覧の検索と絞り込み

ヘッダーの検索欄と「絞り込み」（魚種・釣り場・タグ・年）で一覧を絞り込める。条件は URL に入る（例: `/?fish=シーバス&q=河口`）ので、そのまま共有やブックマークができる。記事ページの魚種・釣り場・タグを押しても、その条件の一覧になる。

検索はタイトル・釣り場・魚種・タグ・天気・潮と本文が対象で、ひらがな/カタカナ、全角/半角の違いは無視する。本文はビルド時に `/search.json` に書き出し、検索したときだけ読み込む。

## 写真を入れる

スマホの写真は大きく、撮った場所（GPS）も入っている。**元の写真をそのまま commit しない**（消しても git の履歴に残る）。

```bash
npm run photos -- <記事のファイル名> <写真> [<写真> ...]
# 例: npm run photos -- 2026-10-20-sea-bass ~/Downloads/IMG_0001.jpg ~/Downloads/IMG_0002.jpg
```

横幅1600px の WebP にし、位置情報を含むメタデータを消して `public/photos/<記事のファイル名>/1.webp, 2.webp …` に置く。記事に貼る `<Photo>` も表示される。`public/photos` に WebP 以外やメタデータ付きの写真があると、テストが失敗する。
