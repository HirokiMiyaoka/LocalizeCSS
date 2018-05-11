# LocalizeCSS

最近ローカライズで思いついた頭悪い方法が、以下のようなものです。

```
<body class="jp">
  <button class="start"></button>
</body>
```

```
.start:before { content: 'Start'; display: inline; }
.jp .start:before { content: 'スタート'; }
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

# サンプル

https://hirokimiyaoka.github.io/LocalizeCSS/

デフォルトは英語で、ボタンの一つは日本語を設定したサンプルです。

なおこれを以下コマンドでビルドした場合、翻訳漏れがあるため警告が出ます。

```
npm run start -- -d default
```

