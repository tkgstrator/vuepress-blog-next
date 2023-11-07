---
title: スマートフォン向けアプリのリバースエンジニアリング備忘録 
date: 2023-10-25
description: iOS向けアプリのリバースエンジニアリングに必要な知識やツールなどをメモします
---

## リバースエンジニアリング

### iOS

iOSのアプリは以下のような構造になっています。

`XXXXXX/Payload/XXXXXX/XXXXXX`がAArch64形式実行ファイルになっています。

```zsh
XXXXXXX/
└── Payload/
    └── XXXXXX/
        ├── XXXXXX
        ├── Assets.car
        ├── Settings.bundle
        ├── Localizable.strings
        ├── Info.plist
        ├── PkgInfo
        ├── _CodeSignature/
        │   └── CodeResources
        └── Frameworks/
```

利用されているFrameworkを解析したい場合は`Frameworks`内のバイナリを参照します。

### Android

Androidのアプリは以下のような構造になっています。

```zsh
XXXXXXX/
├── AndroidManifest.xml
├── META-INF
├── res/
├── classes.dex
└── resource.arsc
```

`XXXXXX/classes.dex`が中間言語になっています。

## バイナリのダンプ

### iOS

[Fridaを利用した方法](https://tkgstrator.work/article/2023/08/frida.html)がおそらく簡単です。

拡張子をZIPに変えて展開し、Payloadフォルダ内のパッケージ内のバイナリを取得します。ライブラリはFrameworks内にあるので、こちらも解析することができます。

### Android

適当にAPKをダウンロードしてきます。

拡張子をZIPに変えて展開しても良いですが、AndroidManifest.xmlなどがバイナリエンコードされているので専用のツールを使うほうが良いです。

[apktool](https://github.com/iBotPeaches/Apktool/)が便利なのでこれを使います。

## デコンパイラ一覧

iOSアプリはほぼ全てがAArch64対応なので単純にデコンパイラに突っ込むだけで解析できます。

- [IDA Free](https://hex-rays.com/ida-pro/ )
    - Windows/Linux/macOS
    - x86/x64であればこれで事足りることも多い
- [IDA Pro](https://hex-rays.com/ida-pro/)
    - Windows/Linux/macOS
    - [選ばれし者にもたらされる快楽、至福、絶対的優位性](https://hackmd.io/@K-atc/HkV9t7chW)
- [Ghidra](https://ghidra-sre.org/)
    - Windows/Linux/macOS
    - NSAが開発したツール
    - Javaで動くのでプラットフォームの制約とは基本的に無縁
    - UIがダサい以外は多分便利
- [Binary Ninja](https://binary.ninja)
    - Windows/Linux/macOS
    - デコンパイラもある
- [Hopper Disassembler](https://www.hopperapp.com)
    - Linux/macOS
    - 貧乏人向けのIDA Pro
    - 構造体のアノテーション機能がない

### Android

Javaで動作するのでどのプラットフォームでも動くのが強み。

- [JADX](https://github.com/skylot/jadx)
- [JD-GUI](https://java-decompiler.github.io/)

