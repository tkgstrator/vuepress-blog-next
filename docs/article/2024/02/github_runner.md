---
title: GitHub RunnerをDockerで動かす 
date: 2024-02-02
description: 
category:
  - Programming
tag:
  - macOS
  - Docker
---

## GitHub Runner

GitHub Runnerをself-hostedで動作させることは以前少し紹介したのでそれを多少改良したものになる。

個人的にGitHub Runnerの最も良くないところだと考えているのは何故かシェルスクリプトで動かすことを前提としているところだった。

シェルスクリプトで動かすとなると、待機させておきたいRunnerの数だけターミナルを起動しないといけないし、何らかの理由でコケたときに復帰させるのがめんどくさい。

じゃあDockerで動かしてDocker composeで管理してしまえばいいじゃんとなった。

### Docker

Dockerを使えば全部解決かというとそうではない。

基本的に良いことばかりだが、良くない点としてはmacOS(Apple Silicon?)でDockerを動かすとネイティブに比べてやたらと遅くなってしまうという問題がある。

これはx264をエンコードしたときにも感じたのだが、本来の実力の75%くらいしか出せないと思って良い。

とはいえ、ものすごく重い処理でなければこの差がはっきりと出るような場面はなさそうだ。

もう一つの問題点はmacOS自体をコンテナとして利用できなくなる点である。

例えばiOS向けのアプリのビルドはmacOSでしかできないが、Dockerで動かすとUbuntuなどになってしまうためXcodeが利用できずに詰んでしまう。

というか、Dockerで結局Ubuntuで実行するなら最初から公式の無料のRunnerを使えばいいじゃないかという話になってしまう。

なので、macOS上でわざわざUbuntuのGitHub RunnerをDockerで動かす意味があるかというと、殆どない。プライベートレポジトリで何らかの理由でガンガンActionsを回して無料分では足りませんというときくらいだろう。

無料のRunnerはスペックがそこまで高くないのでSelf-hostedの構成のPCで回したいというのならわかるが、macOSの場合は先程も述べたようにDockerを経由するとパフォーマンスが落ちるのでそこの恩恵も小さい。それなら最初からUbuntu上でDockerを動かせば良い。

というわけで何の意味があるのかよくわからないが(Dockerで自分自身を参照できればよいのだが)、とりあえず実装してみることにした。

### イメージ

[tcardonne/github-runner](https://hub.docker.com/r/tcardonne/github-runner)というイメージがDocker Hub上に見つかったが三年前なので古い。

ないなら作るかと思ったが[myoung34/github-runner](https://hub.docker.com/r/myoung34/github-runner)を見つけたのでこちらを利用する。

