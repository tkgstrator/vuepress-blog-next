---
title: "[Hack] サーモンランで非改造機とできることできないこと"
date: 2020-01-08
description: 改造機と非改造機の通信でできることとできないことリスト
category:
  - Nintendo
  - Hack
tag:
  - Salmon Run
---

## できること

### クマサン印のスロッシャーの使用

クマサン印のスロッシャーはモデルが読み込まれないので何故か落ちません。

その代わり非改造機からはイカちゃんが何も持っていないように見えますし、射撃したインクも見えないのでちょっとやりにくいかもしれません。

### ノルマの変更

ノルマはホストだけが管理しているので変更しても落ちませんし、他のプレイヤーから見てもちゃんとノルマが変わっているように見えます。

また、クリア判定もホストが管理しているようなので本来ノルマが 10 のものを 20 に変更して 15 納品した場合、クライアント側も失敗した判定になります。

つまり、クリアしたかしてないかはホストだけが管理し、その結果をクライアントに送信しているようです。

### スペシャルの変更

イカスフィア・アメフラシ・インクアーマー・ナイスダマ・マルチミサイルのスペシャルは使うことができます。

ただ、イカスフィアとアメフラシとマルチミサイルはサーモンラン用のパラメータがないためにものすごく弱いので実質使い物になりません。

特に、アメフラシはアメが降らないので意味がありません。

また、なんのスペシャルが割り当てられたかはホストから決められるので、改造機であってもクライアントになった場合は通常のスペシャルが割り当てられます。

### 金イクラドロップ数の変更

金イクラがいくつドロップしたか（位置も？）はホストが管理しているので、金イクラ数を変更するとそれがクライアントにも反映されます。

ただ、クライアント側からは無から金イクラが飛び出てきたように見えるそうです。

### WAVE の変更

発生する WAVE の組み合わせを変える SeedHack と、WAVE そのものを変える方法があり、どちらもエラー落ちなしにゲームが進行します。

特に SeedHack は完全にクライアントとの同期が取れているので普通にプレイしているのと変わりません。

WAVE そのものを強制的に変更する方法は同期ズレが発生し、クライアント側からはさまざまな奇妙な現象が見られます。

|   イベント   |              同期ズレの効果              |
| :----------: | :--------------------------------------: |
|   ラッシュ   |        キンシャケの移動速度が遅い        |
| カンケツセン | カンケツセンがなく、キンシャケが見えない |
|    グリル    |             コジャケがいない             |
|      霧      |        昼間なのにキンシャケがいる        |
|   ハコビヤ   |    ハコビヤとシャケコプターが見えない    |
|   ドスコイ   |              大砲がでてくる              |

潮の高さを強制的に変更すると、プレイヤーが水没しているように見えたり、海の中のコンテナに納品しにいったりといろいろめんどくさいことが発生します。

### オオモノ出現数の変更

オオモノの数を増やすとこれはキチンと反映されます。

また、ザコシャケについても出現数を 0 にするとザコシャケが全くわかなくなります。

ただし、何故か霧イベントだけはザコシャケ（ドスコイもコジャケもでないが）が出現してしまいます。

## できないこと

### スロッシャー以外のクマブキの使用

クライアント側がモデルの読み込みで落ちるので、イカ状態を解除した瞬間に通信エラーで落ちます。

ずーっとイカ状態なら問題ありませんが、納品するときにもイカ化が解除されるのでこのタイミングで落ちます。

### その他未リリースブキの使用

コラボ系の亜種ブキもサーモンランでは開放されていないので、使用した瞬間に落ちます。

### いくつかの未解禁スペシャルの使用

ウルトラハンコとバブルランチャーは発動した瞬間に落ちます。

それ以外については「できること」の項目で解説しているのでそちらをどうぞ。

### 出現するオオモノの制限

カタパッドをでなくするみたいな変更は出現するオオモノにズレが生じて通信エラーで落ちます。

### オオモノパラメータの変更

移動速度などを変えると位置ズレが発生しますが、こちらは通信エラーにならないようです。

どうも移動速度系は反映されないみたいで、ハコビヤの母艦の体力の変更などはそのまま反映されます。

### Map ファイルの変更

オブジェクトの位置などを変えると同期ズレからエラーが発生し、ゲームが強制終了してしまいます。

ただ、落ちるのがホストの方なのでエラーチェックを回避するようなパッチを当てられれば回避できるかもしれません。

## まとめ

備忘録としてまとめたのですが、果たして他の方に需要があるのかどうかはかなり疑問が残ります。

最近ちょっとアセンブラ解析の熱がもどってきたので（せっかく 5.1.0 もリリースされたことですし）、また少しコード開発に取り組むかもしれません。

そんなことより新型 HHKB 発売されたので誰か買ってください！！！