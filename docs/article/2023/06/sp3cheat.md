---
title: スプラトゥーン3で公開されているパッチを確認する 
date: 2023-06-20
description: IPSwitch向けのパッチを確かめてみることにしました
category:
  - Nintendo
  - Hack
tag:
  - Splatoon3
  - IPSwitch
---

## IPSwitch

IPSwitchはニンテンドースイッチで動作するexefs形式のパッチファイルを提供するためのツールです。

具体的にはパッチが載ったテキストからパッチファイルを自動で作成してくれます。

なお、パッチが効くのはLFSの仕組み上、ゲームを起動した瞬間ですのでゲームプレイ中にパッチの有効・無効を切り替えることはできません。

### スプラトゥーン3向け

[GitHubで公開されている](https://github.com/Coxxs/public-pchtxt/blob/main/SPL3_PUBLIC_4.0.2.pchtxt)のでそれをそのまま貼り付けます。

```
@nsobid-D5184D7605B44068D4B09FB619BB3DA8CC32F20F
# Spl 3 4.0.2

@flag offset_shift 0x100

// [!]  All patches are NOT online safe, **use them only in emummc**, 
//      and keep emummc offline forever, otherwise your console will
//      be banned.
//      If you are playing with your friends (LDN/LAN), make sure 
//      their consoles are in isolated emummc as well.
//
// <3 Special thanks to Shadow & Takaharu

// Offline Lobby + Grizzco [Coxxs]
@enabled
033E3B1C 00000191010180523DD77D17C0035FD6
0339AAB0 00E000916100805258FB7E17C0035FD6
0514A59C "nope"
033FE5DC 2B010054

// Allow saving offline [Coxxs]
@disabled
02F728E4 1F2003D5
02F72904 1F2003D5
02F72910 1F2003D5
02F7291C 1F2003D51F2003D51F2003D51F2003D5

// Always Lan [Takaharu]
@disabled 
02FA9730 28008052

// Quick Lan [Coxxs]
@enabled 
033B469C 1F050071

// One Player Shoal v2 [Coxxs]
@enabled
03A1BADC 1F010071
03B98944 1F050071
03B98968 08008052
0332DE50 1F2003D5
0334207C 1F2003D5
02DF67C8 7F9E0F71
02DF71CC 1F2003D5

// Allow Hazard Level 200+ (Shoal) [Coxxs]
@enabled
03A1A754 08328052

// Allow Tricolor (Shoal / Recon) [Coxxs]
@enabled
03B92EC0 C9008052
05FFECB4 05000000

// Shoal Splatfest (Night + Bgm) [Coxxs] 
@disabled
032DD52C E9008052
032DD848 21008052
032DFCD8 1F2003D5

// Either = Charlie Team [Coxxs]
@disabled
032DA4AC 1F2003D5
02DE1F5C BF110071
02DE2194 02008052

// Allow 10 Players [Coxxs]
@disabled
0333E53C 490180D24901C0F2

// Match duration = 1s [Coxxs]
@disabled
032DFD30 29008052
032DFD14 2A008052
032DFD44 28008052

// Match duration = 1min [Coxxs]
@disabled
032DFD30 89078052
032DFD14 AA088052
032DFD44 88078052

// Match duration = 10min [Coxxs]
@disabled
032DFD30 094B8052
032DFD14 0A4B8052
032DFD44 084B8052

// Shoal 10x [Coxxs]
@enabled
032E1B00 28008052
032E1AD8 1F2003D5

// Shoal 100x [Coxxs]
@disabled
032E1B00 48008052
032E1AD8 1F2003D5

// Shoal 333x [Coxxs]
@disabled
032E1B00 68008052
032E1AD8 1F2003D5

// Offline Splatfest / Big Run [Coxxs]
@enabled
0368558C 2900805209D100B9
032B9DBC 00008052
03684DE8 00008052
03612C68 1F2003D5
03612F58 1F2003D5
03685394 08008052
0514A59C "nope"

// Splatfest (Sneak Peek)
@disabled
02FDCF44 4C008052AC0A00B9

// Splatfest (First Half)
@disabled
02FDCF44 6C008052AC0A00B9

// Splatfest (Second Half)
@enabled
02FDCF44 8C008052AC0A00B9

// Splatfest (After)
@disabled
02FDCF44 AC008052AC0A00B9

// Big Run
@disabled
02FDCF44 2C008052AC0A00B9
02FDCD1C 4D008052
02FDCD24 0D2000B9

// Salmon Run - Big Run
@disabled
032DEB10 88008052
032DEB18 88008052
032DEB08 88008052
032DDEB0 88008052
032DD0CC 88008052

// Salmon Run - Pair
@disabled
032DEB10 A8008052
032DEB18 A8008052
032DEB08 A8008052
032DDEB0 A8008052
032DD0CC A8008052

// Salmon Run - UnderGround
@disabled
032DEB10 C8008052
032DEB18 C8008052
032DEB08 C8008052
032DDEB0 C8008052
032DD0CC C8008052

// Salmon Run - Contest
@disabled
032DEB10 E8008052
032DEB18 E8008052
032DEB08 E8008052
032DDEB0 E8008052
032DD0CC E8008052

// Sunset [Coxxs]
@disabled
0116D030 200080D2C0035FD6

// Night [Coxxs]
@disabled
0116D030 400080D2C0035FD6
```

いろいろありますが、名前がややこしくて結局どれが何をできるのかわからないので一つずつチェックしていこうと思います。

## それぞれのパッチの効果

なお、ニンテンドースイッチオンライン未連携、90DNSを導入して任天堂のサーバーに繋がらない状態で検証を行っています。

### Offline Lobby + Grizzco

ロビー及びクマサン商会に遷移した際に`Connecting to the Internet`が表示されなくなる。

> オフライン状態でもロビー及びクマサン商会に入ることができるようになります。

レギュラーマッチを開始しようとすると通信エラーが発生します

### Always Lan

イカッチャに入ると自動でLan Playになります

> 切り替える手間が省けるので楽になります

### Quick Lan

イカッチャでのLocal PlayとLan Playの切り替えの待ち時間がなくなります。

> Always Lanがあればこっちは不要説もあります

### One Player Shoal v2

人数が足りていなくてもイカッチャでゲームを開始することができるようになります。

> ボタン自体はグレーアウトしたままなのですが、押す事ができるようになっています。

### Allow Hazard Level 200+

プライベートバイトではキケン度200%の上限がありますが、その制限が解除できます。

> 見かけ上、400%くらいまで選べるようになっていますが内部的には333%以降は反映されません

### Offline Splatfest / Big Run

クマサン商会がビッグラン状態になります。

> 以下のBig Runのコードとの併用が必須です

### Big Run

ブート画面がビッグラン開催中状態になります。

> オフライン専用機の場合、上の`Offline Splatfest / Big Run`との併用が必須です

### Salmon Run - Big Run
