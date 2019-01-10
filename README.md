# LocalizeCSS

最近ローカライズで思いついた頭悪い方法が、以下のようなものです。

```
<body lang="jp">
  <button class="start"></button>
</body>
```

```
/* デフォルトで指定された値 */
.start:before { content: 'Start'; display: inline; }
/* <body lang="ja"> の時のみ中身が上書きされる */
body[lang="jp"] .start:before { content: 'スタート'; }
```

例えば以下のように使えるかなと。

* デフォルトは常に読み込む
* JSで`navigator.language`とかで言語を取得して、それをファイル名に組み込んだCSSを動的に読み込む
* 他の言語指定時には別のファイルも動的に読み込む

で、最近これを手書きで作るのも辛くなってきたので、せっかくならツール化しておこうかなと。
手順としては、規定のフォルダに突っ込んだCSV的なものをCSSにして出力できれば十分かなと。

# 使い方

## 用意するファイル

## コマンド


`npm i HirokiMiyaoka/LocalizeCSS` でインストールした場合

```
node node_modules/localizecss/dest/localizecss.js [OPTIONS...] [SRC] [DEST]
```

オプションは以下

* `-h`
* `--help`
    * ヘルプを表示します。
* `-i`
* `--ignore`
    * 無視する最初の行数を指定します。省略時は0。
    * 1を指定すると1行目を無視します。
* `-d`
* `--default`
    * デフォルトのローカライズを指定します。省略時は未指定になります。
    * これを指定するとチェックが有効になり、他のファイルで足りない項目がある場合は出力されます。
* `[SRC]`
    * CSVの格納されたディレクトリです。省略時は `localize/` になります。
* `[DEST]`
    * CSSの出力先ディレクトリです。省略時は `docs/localize/` になります。

# サンプル

https://hirokimiyaoka.github.io/LocalizeCSS/

デフォルトは英語で、ボタンの一つは日本語を設定したサンプルです。

なおこれを以下コマンドでビルドした場合、翻訳漏れがあるため警告が出ます。

```
npm run start -- -d default
```

