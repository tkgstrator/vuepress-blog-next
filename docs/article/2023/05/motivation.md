---
title: アプリ開発の今後の方針などについて 
date: 2023-05-30
description: お気持ち表明するつもりはなかったのですが、一応書いておいたほうが良いかと思いました 
---

## アプリ開発事情について

任天堂サポートからサードパーティアプリに対する声明が発表され、App StoreおよびGoogle Playからアプリが公開が取り下げられるという事態が発生しました。

当アプリは取り下げ要請を受けていませんが、法的に問題のあるコードが含まれていないかチェックするためにアプリの公開を停止しています。

現在、アプリがApp Storeからインストールすることができないのはそれが理由です。

### 今後について

多くのアプリ開発者が開発のモチベーションを失っているので、わたしもそうなのではないかと心配されがちなのですが、実はモチベーション自体には特に変わりがありません。

こう言ってしまうとアレなのですが、そもそもスプラトゥーン3に対するモチベーションが一度として高まったことはなく、発売以来変わることなくずっと地を張っています。ある意味、常にモチベーションは高いです。

アプリには広告がついていますが、Salmon Statsのためのサーバー運営費などの維持費を合わせると高校生のおこづかいくらいの収入しかありません。よって、収入面でのモチベーションもありません。

> 収入面でのモチベーションがなかったわけではないですが、先日のビッグランで「当アプリのユーザーが全体の1%程度いること」「iOSのシェアが50%だと仮定すると仮に獲得可能な全ユーザーを取り込んでも利益として知れていること」を理由に収入面でのモチベーションもなくなってしまいました。

じゃあ何を目的にアプリ開発をしているのですかということになるのですが「モチベーションを探して開発している」というのが正直なところです。ここから少し技術的な内容になりますが、今まで触れてこなかった技術をアプリに取り込むための作業が楽しくて、アプリ開発を続けています。

例えば現状ですとアプリを自動でビルドするfastlaneやGitHub Actions, アセットを同梱せずにバイナリを配布する仕組みなどの実装が楽しくてリリースするのかどうかもわからないまま作業しています。

これは、これらのモチベーションが失われない限り、また他のより興味のある対象が現れない限り今後もしばらくは続いていくでしょう。

## アプリについて

アプリは公開を停止していますが、既にライブラリは？？？を含むスケジュールに対応済みで当アプリはオープンソースであるため誰でも利用可能です。

つまり、最新のアップデートに対応したバージョンのソースコードをダウンロードしてきてビルドすれば誰でも再びSalmonia3+を利用することができます。

> 現状、ソースコードの公開をやめてくださいとも言われていないので、DMCA違反でレポジトリが凍結されない限りは公開し続ける予定です

というわけで、本項では自力で頑張ってアプリをインストールするための方法について解説します。

### 必要なもの

- Xcode 14以降

なんとXcodeを用意するだけで大丈夫です。

> XcodeはmacOS専用です

また、追加で以下のファイルが必要になる場合があります。


- GoogleService-Info.plist
- Secrets.swift

GoogleService-Info.plistはFirestoreへの認証とフォームへのアクセスと広告の表示に使います。どれも使わないのであれば不要です。

Secrets.swiftはディスコードへのWebhookURLが載っています。以下のフォーマットを満たすファイルを作成してください。

```swift
internal let appId: String = ""
internal let appSecret: String = ""
internal let encryptionKey: String = ""
internal let discordWebhookURL: String = "https://discord.com/"
internal let discordWebhookPath: String = ""
internal let appSecretKey: String = ""
```

> なんかもう一つ必要だった気もするけど忘れました

あとはビルドすれば利用できます。アセットが必要な場合はs3sなどを利用して自分のリザルトから引っ張ってくると確実です。

### ビルド済みIPAを利用する

もしも何らかの手段（例えばmacOSを持っている知人にビルドしてもらうとか）でビルド済みIPAを手に入れることができれば、Windowsでもアプリをインストールすることはできます。

持っているパソコンがWindowsであってもmacOSであっても[AltStore](https://faq.altstore.io/getting-started/how-to-install-altstore-windows)という仕組みが便利かと思います。

これは自己署名をIPAに施すことで、App Storeを経由せずにアプリをインストールすることができる仕組みです。

ただし、これは完全に自己責任です。何かあっても一切の責任を負いません。以下、その理由。

1. アプリは一切のAppleの審査を受けていません、マルウェア等が混入している可能性があります
2. 一般ユーザーの自己署名は七日間だけ有効です、七日すぎると再署名が必要になります
    - 開発者であれば一年間使えるので便利かもですが......
    - ただし、Alt Storeを使えば自動で再署名できるのであまり不便ではないかも...
3. エンドユーザー向けではない
    - 自分でビルドするよりはハードルが低いですが、それなりにパソコンが得意な方でないと詰みます