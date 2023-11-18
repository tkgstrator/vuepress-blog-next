---
title: Cloudflare Tunnelでもっと簡単にサーバーを立てよう
date: 2023-11-16
description: いままではnginx proxyを利用していましたが、それすらも不要なことがわかったのでそれについて解説 
---

## 背景

[リバースプロキシを利用した何も考えずにTLS対応のサーバーを立てる方法](/article/2023/10/nginx_proxy.html)という記事を以前書いていたのですが、知人から「それ、Cloudflare Tunnel使えばもっと楽だよ」と教えていただいたので、実際に使ってみることにしました。

感想としては、神でした。

背景としては前回と同じで、

1. ウェブアプリがNodeJSでポート3030で起動中(ポート自体は何でも良い)
2. HTTPに対応してポート(80)でウェブアプリにアクセスできるようにしたい
3. TLSに対応してHTTPS(ポート443)でウェブアプリにアクセスできるようにしたい
4. TLSの更新にCloudflareのSSL/TLSを利用したい
5. IPアドレスが変更されたときにDDNSで自動的に対応したい

という内容です。

| タスク | 新手法             | 以前の記事       | 従来            | 
| ------ | ------------------ | ---------------- | --------------- | 
| 1      | NodeJS             | NodeJS           | NodeJS          | 
| 2      | Cloudflare Tunnel  | Nginx            | Nginx           | 
| 3      | Cloudflare Tunnel  | Nginx            | Nginx           | 
| 4      | Cloudflare SSL/TLS | Cloudflare Proxy | Let's encrypt   | 
| 5      | Cloudflare Tunnel  | Cloudflare DDNS  | Cloudflare DDNS | 

今回の変更によりTLS対応はウェブ上からCloudflare SSL/TLSでFull(strict)を選ぶだけでTLS対応可能、アプリ以外はCludflare Tunnelに丸投げできるというとてつもなく単純化できることがわかりました。

自宅でサーバーを立てている人なら外部からのアクセスに対してポートフォワードを設定している人もいたと思うのですが、それすらも不要。もはや詰まる所がないと言っても過言ではありません。

## Cloudflare Tunnel

Cloudflareのダッシュボードから`Access>Launch Zero Trust`を選択して別のサイトを開きます。

すると何やらまた似たようなサイトが開くので`Access>Tunnels`を開きます。開いたらそこから`Create a tunnel`を選択します。

作成したいトンネル名を決めたら何やら設定画面が表示されます。今回はDockerで動作させることを目的としているのでDockerのアイコンをクリックします。

```zsh
docker run cloudflare/cloudflared:latest tunnel --no-autoupdate run --token XXXXXXXXXXXXXXXX
```

みたいな内容が表示されます。ただ、これだとDockerでしか使えないのでこれをDocker composeで使える形に直します。

```yaml
version: '3.9'

services:
  app:
    image: tkgling/salmon_stats_app:latest
    container_name: salmon_stats_app
    restart: unless-stopped
    ports:
      - 3000:3000

  cloudflare_tunnel:
    restart: always
    image: cloudflare/cloudflared
    command: tunnel run
    environment:
      TUNNEL_TOKEN: $TUNNEL_TOKEN
```

> .envに`TUNNEL_TOKEN`の値を記載しておきましょう

このように書けばCloudflare Tunnelが`docker compose up`で立ち上がり、自動的にポートフォワードをしてくれます。

どのポートをどのポートにとばすかはWeb上で決めます。

今回は[https://api.splatnet3.com](https://api.splatnet3.com)でサービスを公開することを考えます。

### 設定

設定できるのは以下の五つですので、下のように設定します。ドメインに関してはCloudflareに登録されているものしか使えないので、使いたいドメインが未登録の場合は先に登録しましょう。

| パラメータ | 値            | 
| :--------: | :-----------: | 
| Subdomain  | api           | 
| Domain     | splatnet3.com | 
| Path       | -             | 
| Type       | HTTP          | 
| URL        | app:3000      | 

> 別の方法で既にサブドメインが登録されている場合は同じサブドメインが登録できないので事前に前の設定を消去しなさいとの警告がでます

Pathに関してはルートに設定するのであれば空っぽで大丈夫です。

URLのところが結構大事で、Cloudflare Tunnel自体がDockerの中で動いているので`localhost`は使えず、サービス名で指定することになります。

```yaml
version: '3.9'

services:
  app: #ここが大事
    image: tkgling/salmon_stats_app:latest
    container_name: salmon_stats_app
    restart: unless-stopped
    ports:
      - 3000:3000 #ここも大事
```

今回、アプリはサービス名が`app`で外部に公開しているポートが`3000`なのでHTTP://app:3030となるように修正します。

> と思ったけれど、Docker composeの中で完結しているのであればDockerfile内でEXPOSE 3000しているのであればportsで3000は公開する必要がないのでは......とも思ったのであった

あとはこれで`docker compose up -d`を実行すればサーバーが立ち上がります。余計なことは一切不要です。

記事は以上。
