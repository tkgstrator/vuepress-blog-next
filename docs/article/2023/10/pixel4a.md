---
title: Pixel 4a 5GをRoot化する
date: 2023-10-24
description: Androidはあまり触ってこなかったのでRoot化の手順についてメモをします
---

## 背景

Androidの最初期にはSuperSUとかを使っていたのですが、最近はMagiskを利用する方法が一般的なようです。

これがどういうツールなのかというと、ブートローダーをアンロックしたデバイスで公式のファームウェアにパッチを当てたものをインストールすることで管理者権限を取得した状態でデバイスを起動させるような仕組みみたいです（違ったらごめんなさい）

原理としてはCFWにあたるわけですが、iOSがBootROM(Androidでいうところのブートローダー)のアンロックを認めていないのでBootROM exploitが見つからない限りCFWの起動が不可能であることに対して、Androidは公式がブートローダーのアンロック機能を実装しているという点で異なります。

このあたりは長年のiOSユーザーとしてAndroidは便利だなあと思いました。

iOSもブートローダーのアンロックを認めてくれてもいいじゃないかと思うのですが、そうするとCFWの導入及びセキュリティの低下、海賊版の横行などデメリットがあまりに大きすぎるので多分やらないと思います。やらなくてもそれなりにシェアが取れているわけですし。

## 必要なもの

- [Magisk](https://github.com/topjohnwu/Magisk/releases)
- [Factory Image(Pixel 4a 5G)](https://developers.google.com/android/images#bramble)

必要なのはMagiskとRoot化したいデバイスのFactory Imageです。今回はPixel 4a 5GをRoot化します。

なお、デバイスによってはFactory Imageが提供されていなかったりするのでマイナーなメーカーは使わずに大人しくPixelなどを使うと良いです。

### デバイスの前準備

とりあえず、まずはMagiskをインストールします。

インストール方法についてはインターネットにいくらでも記事が転がっているので割愛します。

インストールしたらデバイスをビルド番号を七回タップして開発者モードに切り替えてからUSBデバッグを有効化するのとブートローダーをアンロックします。

れでデバイスがADBを受け付けるようになり、flashbootでイメージを書き込めるようになります。

## Factory Image

一番新しいAndroid 14.0.0をRoot化したいので[14.0.0 (UP1A.231005.007, Oct 2023)](https://dl.google.com/dl/android/aosp/bramble-up1a.231005.007-factory-fc548663.zip)をダウンロードします。

ダウンロードしたファイルを解凍したディレクトリの中にimage-bramble-up1a.231005.007.zipがあるのでそれも解凍します。

```zsh
bramble-up1a.231005.007/
├── bootloader-bramble-b5-0.6-10489838.img
├── flash-all.bat
├── flash-all.sh
├── flash-base.sh
├── image-bramble-up1a.231005.007/
│   ├── android-info.txt
│   ├── boot.img
│   ├── dtbo.img
│   ├── product.img
│   ├── super_empty.img
│   ├── system_ext.img
│   ├── system_other.img
│   ├── system.img
│   ├── vbmeta_system.img
│   ├── vbmeta.img
│   ├── vendor_boot.img
│   └── vendor.img
├── image-bramble-up1a.231005.007.zip
└── radio-bramble-g7250-00264-230619-b-10346159.img
```

すると上のようなディレクトリ構成になるはずです。ちなみにディレクトリの構造自体は重要ではありません。

解凍したファイルの中にboot.imgがあればそれをGoogle Driveを利用するなり何らかの方法でデバイスからアクセスできるようにします。

### Patched Imageの作成

次にMagiskを起動してInstallを押したらboot.imgを選択します。

数分待てばパッチが当たったboot.imgが作成されるので、それを今度はパソコンにコピーします。

> 今回は`magisk_patched-26300_zIdcQ.img`というファイルが作成されました

## Platform tools

次に[ここのリンク](https://developer.android.com/studio/releases/platform-tools)からPlatform toolsをダウンロードします。

これがないとパソコンの方で`adb`コマンドが認識されません。本来であればAndroid Studioをインストールするのですが、Android Studio自体はRoot化には全く要らないので今回はコマンドラインツールだけを拝借します。

以下、macOS向けの手順なのでWindowsまたはLinuxユーザーは無視してください。

ZIPファイルを解凍してでてきたplatform-toolsをApplicationsディレクトリにコピーします。

```zsh
Applications/
└── platform-tools/
    ├── adb
    ├── etc1tool
    ├── fastboot
    ├── lib64/
    ├── make_f2fs
    ├── make_f2fs_casefold
    ├── mke2fs
    ├── mke2fs.conf
    ├── NOTICE.txt
    ├── source.properties
    └── sqlite3
```

コピーしたら`.zshrc`に以下の内容を追記します。

```zsh
export PATH="$PATH:/Applications/platform-tools"
```

その後`source ~/.zshrc`とすれば設定が読み込まれて`adb`及び`fastboot`コマンドが効くようになります。　

### ブートローダーの起動、書き込み

パッチが当たったboot.imgがあるディレクトリで以下のコマンドを入力します。

```zsh
adb reboot bootloader
fastboot flash boot magisk_patched-26300_zIdcQ.img
```

これでデバイスがブートローダーで起動し、パッチが当たった状態でデバイスが起動します。

## おまけ

知っている限り、あると便利だなと思ったRoot化デバイス専用のツールなど。

- [LSPosed](https://github.com/LSPosed/LSPosed)
  - アプリにパッチを当てることができるツール
  - iOSでいうところのTHEOSで作成したTweakのこと
- [LSPatch](https://github.com/LSPosed/LSPatch)
  - アプリにパッチを当ててそれをインストールするツール
  - 非Rootなデバイスではパッチ自体を実行できないので、パッチが当たったapkをインストールしてしまえということ
  - iOSに詳しい人だとTHEOS Jailed + Sideloadを自動でやってくれるツールと言えばわかりやすいかも
- [Shamiko](https://github.com/LSPosed/LSPosed.github.io/releases)
  - Root化検知を無効化するパッチ
  - これがないとRoot化した状態でNSOが起動しません
- [NSOk](https://github.com/Coxxs/NSOk)
  - NSOでアレができるようにするパッチ
  - 普通の使い方はできなくなるので一台デバイスを捨てる覚悟でどうぞ