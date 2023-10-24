---
title: Apple SiliconでVirtualBox環境を整える方法
date: 2023-10-03
description: VirtualBoxはM1/2非対応なのでそれをなんとかします
---

## VirtualBox

公式のVirtualBoxだとApple Siliconのイメージへのリンクがないのですが、ちゃんと調べたらでてくるみたいです。

> [VirtualBox 7.0.8 Beta4](https://download.virtualbox.org/virtualbox/7.0.8/VirtualBox-7.0.8_BETA4-156879-macOSArm64.dmg)


何故かベータ版なのですが、仕方ないのかもしれないです。

## [Vagrant](https://developer.hashicorp.com/vagrant/downloads?product_intent=vagrant)

VagrantはDocker以前のコンテナシステムっぽいのですが、macOSだと簡単にbrewでインストールできるのでそれを利用します。

```zsh
brew install hashicorp/tap/hashicorp-vagrant
```

## Parallels

### [Vagrant Parallels Provider](https://parallels.github.io/vagrant-parallels/docs/)

Vagrant Parallels ProviderはVagrantでのホストマシンの管理をParallelsで行えられるようにするものです。

### Parallels for Mac

注意点としてはProまたはBusinessユーザーのみがこの機能を利用できます。

> Only Pro and Business editions of Parallels Desktop for Mac are compatible with this Vagrant provider. Standard edition doesn't have a full command line functionality and can not be used with Vagrant.


```zsh
vagrant plugin install vagrant-parallels
```

とコマンドを入力すると
```zsh
Installing the 'vagrant-parallels' plugin. This can take a few minutes...
Fetching nokogiri-1.15.4-arm64-darwin.gem
Fetching vagrant-parallels-2.4.0.gem
Installed the plugin 'vagrant-parallels (2.4.0)'!
```