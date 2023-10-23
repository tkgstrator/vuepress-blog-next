---
title: リバースプロキシを利用した何も考えずにTLS対応のサーバーを立てる方法 
date: 2023-10-23
description: Dockerのイメージを利用して何も考えずにHTTPS対応のサーバーを立てる方法を考えます 
---

## 背景

以下のような利用を想定しています。

1. ウェブアプリがNodeJSでポート3030で起動中(ポート自体は何でも良い)
2. HTTPに対応してポート(80)でウェブアプリにアクセスできるようにしたい
3. TLSに対応してHTTPS(ポート443)でウェブアプリにアクセスできるようにしたい
4. TLSの更新にCloudflareのSSL/TLSを利用したい
5. IPアドレスが変更されたときにDDNSで自動的に対応したい

SSL/TLS対応はLet's encryptを使うのが有名ですが、地味にめんどくさいのでCloudflareの機能で代用しようというわけです。

### 必要なもの

SSL/TLS対応はDockerイメージを利用しないので、必要なものは以下の三つです。ウェブアプリのDockerイメージについては自分で作成してください。

1. [jwilder/nginx-proxy](https://hub.docker.com/r/jwilder/nginx-proxy)
    - リバースプロキシを可能にします
2. [oznu/cloudflare-ddns](https://hub.docker.com/r/oznu/cloudflare-ddns/)
    - 定期的にCloudflareにDDNSの通知を飛ばします
3. ウェブアプリ

### docker compose

以下のようなYAMLファイルを作成します。

```yaml
version: '3.9'

services:
  app:
    image: xxxxxx/xxxxxx:latest
    container_name: app
    ports:
      - $VIRTUAL_PORT:$VIRTUAL_PORT
    environment:
      VIRTUAL_HOST: $VIRTUAL_HOST
    restart: unless-stopped

  nginx_proxy:
    image: jwilder/nginx-proxy
    container_name: nginx_proxy
    ports:
      - 80:80
    volumes:
      - /var/run/docker.sock:/tmp/docker.sock:ro
    environment:
      ENABLE_IPV6: true
      TRUST_DOWNSTREAM_PROXY: true

  cloudflare_ddns:
    image: oznu/cloudflare-ddns:latest
    container_name: ddns
    restart: always
    environment:
      API_KEY: $API_KEY
      ZONE: $ZONE
      SUBDOMAIN: $SUBDOMAIN
      PROXIED: $PROXIED
      RRTYPE: $RRTYPE
    network_mode: 'host'
    depends_on:
      nginx_proxy:
        condition: service_started
```

必要となる環境変数は以下の通り。

```zsh
# Nginx
VIRTUAL_PORT=
VIRTUAL_HOST=

# Cloudflare DDNS
API_KEY=
ZONE=
SUBDOMAIN=
PROXIED=
RRTYPE=
```

| キー名       | 意味                           | 設定する値の例       | 
| :----------: | :----------------------------: | :------------------: | 
| VIRTUAL_PORT | ウェブアプリが利用するポート   | 3030                 | 
| VIRTUAL_HOST | 利用したいドメイン名           | docs.tkgstrator.work | 
| API_KEY      | CloudflareのAPIキー            | -                    | 
| ZONE         | ホスト名                       | tkgstrator.work      | 
| SUBDOMAIN    | サブドメイン                   | docs                 | 
| PROXIED      | プロクシを利用するか           | trueまたはfalse      | 
| RRTYPE       | IPv4かIPv6のどちらを利用するか | AまたはAAAA          | 


ZONEとSUBDOMAINの値はVIRTUAL_HOSTと一致しなければいけません。

設定が正しく反映されているかは`docker compose config`で確認できます。

## 起動

この状態で起動してみます。

```zsh
docker compose up
```

### 動作確認

今回は以下の設定を利用しました。

```zsh
VIRTUAL_PORT=3030
VIRTUAL_HOST=api.splatnet3.com
ZONE=splatnet3.com
SUBDOMAIN=api
API_PROXIED=true
API_RRTYPE=AAAA
```

AAAA(IPv6)に対応させているのはIPv6ではNAT越えを考えずに単にグローバルIDを指定するだけで良いこと(ルーターでのポートフォワーディングが不要)が理由です。何か制約があるわけではないのであればAAAAを指定したほうが良いです。

また、CloudflareによるHTTPS化に対応させるためには`API_PROXIED=true`を指定する必要があります。これを設定することでCloudflareまでのアクセスはHTTPSで保護され、Cloudflareから実際のサーバーまでの通信はProxyが適用されます。

よって、アクセスして動作確認をするURLは以下の五つです。

> ローカルIPのものは当たり前ですがローカルでしか繋がりません

1. [http://localhost:3030/docs](http://localhost:3030/docs)
    - ウェブアプリの起動確認
2. [http://api.splatnet3.com:3030/docs]([http://api.splatnet3.com:3030/docs)
    - DDNSの動作確認
3. [http://localhost/docs](http://localhost/docs)
    - Nginx Proxyの動作確認
    - 多分これは繋がらないと思う(理由はよくわかっていない)
4. [http://api.splatnet3.com/docs](http://api.splatnet3.com/docs)
    - DDNS + Nginx Proxyの動作確認

4が繋がったらDDNSとNginx Proxyが正しく動いているので最後にHTTPS対応の処理を行います。

Google Chromeなどでは自動でHTTPSにリダイレクトされる機能があるかもしれないので何らかの方法で直接プロトコルを指定して叩くと良いかもです。

### Cloudflareの設定

Cloudflareのウェブサイトからドメインを選択しSSL/TLSの項目を変更します。

Overviewの項目でYour SSL/TLS encryption modeの設定で、

- Off(not secure)
- Flexible
- Full
- Full(strict)

があると思うのですが`Flexible`を選択します。もしもサーバー自体がSSL/TLSに対応している場合はFullを選択して良いのですが、今回はウェブサーバー自体でSSLを設定していないのでFlexibleを選択します。

最後にHTTPSに対応したURLを開いて通信が正常に行えることを確認します。

5. [https://api.splatnet3.com/docs](https://api.splatnet3.com/docs)
    - DDNS + Nginx Proxy + TLSの動作確認

記事は以上。