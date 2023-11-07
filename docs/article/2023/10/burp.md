---
title: Burp SuiteでiOSの通信内容をキャプチャする 
date: 2023-10-24
description: FiddlerがiOS向けだと利用できないのでBurp Suiteで代用します 
---

## [Burp Suite](https://portswigger.net/burp)

Burp SuiteはWebアプリケーションのセキュリティや侵入テストに使用されてるJavaアプリケーションです。

### Fiddlerとの比較

Fiddlerも似たような機能を有するアプリケーションですが、無料のFiddler ClassicはmacOS非対応でUIなどが一新されたFiddler Everywhereは月額12ドルもかかります。

1年間のアップデートで買い切り$100とかであれば良かったのですが、サブスク形式は個人的にはあまり好きではないのでできればFiddler Everywhere以外の選択肢を探していました。

| アプリケーション        | macOS  | 値段           | 
| :---------------------: | :----: | :------------: | 
| Fiddler Classic         | 非対応 | 無料           | 
| Fiddler Everywhere      | 対応   | 月額2000円ほど | 
| Burp Suite Professional | 対応   | 67500円ほど    | 
| Burp Suite Community    | 対応   | 無料           | 

大雑把に比較するとこんな感じで、macOSに対応しているBurp Suite Communityがかなり魅力的に感じます。

とはいえ、Fiddlerとは操作性が違うのでその辺りを慣れるために記事を書くことにしました。

## セットアップ

Burp Suiteが起動したらProxyのタブを選択し、Proxy listenersのところに127.0.0.1:8080の項目があると思うのでEditを押します。

Edit proxy listenerが開いたらBindingのタブからBind to addressをAll interfacesに変更します。

ここまでできればパソコンのローカルIPアドレスを調べて、ポート8080にアクセスします。

私の環境ではパソコンのローカルIPは192.168.1.15でしたのでアクセスするべきURLは[http://192.168.1.15:8080](http://192.168.1.15:8080)になります。

アクセスしたら右上のCA Certificateをタップしてプロファイルをダウンロードし、設定からインストールします。このあたりは詳しく書いてくれている記事があるので詳細は割愛します。

> [iOSネイティブアプリのhttp通信の内容を確認する](https://qiita.com/fnm0131/items/53298e5dd3c367b84d41)などがわかりやすいと思います
