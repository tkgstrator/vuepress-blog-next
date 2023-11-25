---
title: Frida Playgroundで実践練習をする
date: 2023-11-26
description: Frida Playgroundを使ってアプリの動的解析の実戦経験を積んでみました 
category:
  - Tech
tag:
  - macOS
  - iOS
  - Jailbreak
---

## Frida Playground

[Frida ios playground](https://github.com/NVISOsecurity/frida-ios-playground)

から実戦経験が積めます。

[インストール用のIPAも配布](https://github.com/NVISOsecurity/frida-ios-playground/releases/tag/v1.0)されているのでSideloadlyでちゃちゃっとインストールしてしまいましょう。

## Challenges

早速簡単な方から解いていきます。

適当にインストールしたせいでBundle IDがわからないので調べます。

```zsh
$ frida-ps -Ua
 PID  Name                    Identifier              
----  ----------------------  ------------------------
2069  AppStore                com.apple.AppStore      
2060  Nintendo Switch Online  com.nintendo.znca       
3130  Playground              eu.nviso.fridaplayground
2033  Search                  com.apple.Spotlight     
1993  Settings                com.apple.Preferences   
2039  Sileo                   org.coolstar.SileoStore 
2068  palera1nLoader          com.samiiau.loader   
```

というわけで`eu.nviso.fridaplayground`という値であることがわかりました。

### 1.01 Print parameter(int)

ボタンを押すとトリガーとなって秘密の値が整数値で保存されるので、その値を覗き見しましょうという問題。

Hopper Disassemblerで静的解析をするとメソッド名が`-[VulnerableVault setSecretInt:]`とわかりました。

わかったのでこのメソッドをHookするコードをfrida-traceで生成します。

```zsh
frida-trace -Uf eu.nviso.fridaplayground -m "-[VulnerableVault setSecretInt:]"
```

生成されたコードを編集して、

```ts
onEnter(log, args, state) {
  log(`-[VulnerableVault setSecretInt:${args[2]}]`);
}
```

とすると、

```zsh
  2735 ms  -[VulnerableVault setSecretInt:0x2a]
  5580 ms  -[VulnerableVault setSecretInt:0x2a]
  5862 ms  -[VulnerableVault setSecretInt:0x2a]
```

実行されるたびに`0x2a`が指定されているのがわかります。よって答えは`42`となります。

### 1.02 Print parameter(NSNumber)

```zsh
frida-trace -Uf eu.nviso.fridaplayground -m "-[VulnerableVault setSecretNumber:]"
```

を実行してみます。

そして単純に先程と同じように`args[2]`の中身を覗いてみると、

```zsh
4128 ms  -[VulnerableVault setSecretNumber:0xb4982075a0073cf5]
6770 ms  -[VulnerableVault setSecretNumber:0xb4982075a0073cf5]
6953 ms  -[VulnerableVault setSecretNumber:0xb4982075a0073cf5]
```

実行ごとに同じ値が出力されるのは先程と同じですが、やけに値が大きいです。

更に、再度起動して実行してみると、

```zsh
  2818 ms  -[VulnerableVault setSecretNumber:0x9014183a86167f29]
  3614 ms  -[VulnerableVault setSecretNumber:0x9014183a86167f29]
  3833 ms  -[VulnerableVault setSecretNumber:0x9014183a86167f29]
```

というように値が変わってしまいました。

これは、値ではなくポインタと考えるべきでしょう。今回はNSNumberが入っているとわかっているので、ドキュメントを見てみます。

[NSNumber](https://developer.apple.com/documentation/foundation/nsnumber)の資料を見るとNSNumberは`An object wrapper for primitive scalar numeric values`とあるのでオブジェクトであることがわかります。

先頭にNSとついているのは全てObjective-Cなので、

```ts
onEnter(log, args, state) {
  log(`-[VulnerableVault setSecretNumber:${new ObjC.Object(args[2])}]`);
}
```

としてObjective-Cのオブジェクトにキャストしてみます。

```zsh
  3031 ms  -[VulnerableVault setSecretNumber:42]
  3697 ms  -[VulnerableVault setSecretNumber:42]
  3979 ms  -[VulnerableVault setSecretNumber:42]
```

すると答えが`42`であることがわかりました。

### 1.03 Print parameter(NSString)

```zsh
frida-trace -Uf eu.nviso.fridaplayground -m "-[VulnerableVault setSecretString:]"
```

として今度は文字列を表示させてみます。

```ts
onEnter(log, args, state) {
  log(`-[VulnerableVault setSecretString:${args[2]}]`);
}
```

すると今度は以前の二つと違って押すたびに値が変わってしまいました。

```zsh
  5332 ms  -[VulnerableVault setSecretString:0x28327bfc0]
  6037 ms  -[VulnerableVault setSecretString:0x28320d740]
  6250 ms  -[VulnerableVault setSecretString:0x283202010]
```

なぜポインタが変わったのかは謎なのですが、とりあえずNSStringもObjective-Cのオブジェクトなので、

```ts
onEnter(log, args, state) {
  log(`-[VulnerableVault setSecretString:${new ObjC.Object(args[2])}]`);
}
```

としてみます。

```zsh
  2835 ms  -[VulnerableVault setSecretString:The Answer to Life, The Universe, And Everything]
  5466 ms  -[VulnerableVault setSecretString:The Answer to Life, The Universe, And Everything]
  5651 ms  -[VulnerableVault setSecretString:The Answer to Life, The Universe, And Everything]
```

すると答えは`The Answer to Life, The Universe, And Everything`とわかりました。

### 1.04 Replace parameter

次はボタンを押すと`winIfTrue`というメソッドに常にFalseが返されているものをTrueを返すようにするという問題です。

で、ここまで使ってきたfrida-traceではメソッドの流れを追えるだけで関数の返り値を返すような機能はついていません。

そこで次は別のアプローチを取ります。というか、これまでの三問もその解き方をすることが可能でした。

```ts
const VulnerableVault = ObjC.classes.VulnerableVault; 

function solve104() {
    const method = VulnerableVault['- winIfTrue:'];
    Interceptor.attach(method.implementation, {
        onEnter: function (args) {
            console.log(args[2])
        },
    })
}
```

試しにこのようなコードを書いて、`scripts/vulnerable.js`とします。

これの実行方法は、

```zsh
$ frida -l scripts/vulnerable.js -Uf eu.nviso.fridaplayground
     ____
    / _  |   Frida 16.1.7 - A world-class dynamic instrumentation toolkit
   | (_| |
    > _  |   Commands:
   /_/ |_|       help      -> Displays the help system
   . . . .       object?   -> Display information about 'object'
   . . . .       exit/quit -> Exit
   . . . .
   . . . .   More info at https://frida.re/docs/home/
   . . . .
   . . . .   Connected to iPhone (id=480a9329aa853b4346fd87728802db31d653b0aa)
Spawned `eu.nviso.fridaplayground`. Resuming main thread!               
[iPhone::eu.nviso.fridaplayground ]-> solve104()
```

で、起動したら実行したい関数を実行します。

その後、ボタンを押してみると、

```zsh
0x0
0x0
0x0
```

と表示されました。つまり、メソッドの引数として常にFalseが渡されています。

ここに0x1を入れればいいのですが、どうすれば良いでしょうか？

#### 0x1を代入する

```ts
function solve104() {
    const method = VulnerableVault['- winIfTrue:'];
    Interceptor.attach(method.implementation, {
        onEnter: function (args) {
            args[2] = 1;
        },
    })
}
```

これは上手くいきません。`Error: expected a pointer`というエラーが表示されます。

#### trueを代入する

```ts
function solve104() {
    const method = VulnerableVault['- winIfTrue:'];
    Interceptor.attach(method.implementation, {
        onEnter: function (args) {
            args[2] = true;
        },
    })
}
```

これも同様のエラーがでます。`args[2]`はポインタなのでポインタに値を入れることはできません。

そこで`NativePointer`を返す`ptr`を利用します。

```ts
function ptr(value: string | number): NativePointer
Short-hand for new NativePointer(value).
```

文字列または数値が入れられるとのことなので代入してみましょう。

#### ptr(0x1)

```ts
function solve104() {
    const method = VulnerableVault['- winIfTrue:'];
    Interceptor.attach(method.implementation, {
        onEnter: function (args) {
            args[2] = ptr(0x1);
        },
    })
}
```

何故かこれだとランタイムエラーはでないのですが、クリアになりませんでした。

> 理由は検討中

#### ptr('0x1')

```ts
function solve104() {
    const method = VulnerableVault['- winIfTrue:'];
    Interceptor.attach(method.implementation, {
        onEnter: function (args) {
            args[2] = ptr('0x1');
        },
    })
}
```

文字列を入れるとクリアできました。なお、0x0以外の値は何を入れてもTrue扱いなので`0x2`とかでも通ります。

### 1.05 Print return value(string)

今度は返り値の文字列を見ろという問題です。

いろいろ解法はあるのですが、一番簡単なのは静的解析です。

```zsh
                     -[VulnerableVault getSecretString]:
0000000100005e30         adr        x0, #0x100010d08
0000000100005e34         nop
0000000100005e38         ret
```

メソッドを見ると単に0x100010d08の値を返しているだけであることがわかります。

この場合、答えの文字列はバイナリに書き込まれていて単にそのアドレスを返しているだけであると考えるべきでしょう。

となれば、0x100010d08に何が書き込まれているかを見るだけです。

```zsh
                     cfstring_VulnerableVault_g3n3r_t3dStr1ng:
0000000100010d08         dq         0x0000000100024508, 0x00000000000007c8, 0x000000010000d019, 0x000000000000001f ; "VulnerableVault_g3n3r@t3dStr1ng", DATA XREF=-[VulnerableVault getSecretString]
```

とあるので、答えは`VulnerableVault_g3n3r@t3dStr1ng`であることがわかりました。

ただ、これではfridaの練習にならないのでそちらでも対応します。

この関数は引数を取らないのでメソッドの最後の`:`が不要になります。

> というか`:`って引数があるかどうかを意味していたんですね（今更

```zsh
frida-trace -Uf eu.nviso.fridaplayground -m "-[VulnerableVault getSecretString]"
```

として、今回は引数がないので`onEnter`をみても意味がないので`onLeave`を変更します。

```ts
onLeave(log, retval, state) {
  log(`-[VulnerableVault getSecretString] => ${new ObjC.Object(retval)}`);
}
```

静的解析から返り値が[CFString](https://developer.apple.com/documentation/corefoundation/cfstring-rfh)であるとわかっているので、やはり`new ObjC.Object()`でキャストします。

返り値に入ってる`x0`の値をインスタンスにすれば良いので上のコードになるわけですね。

```zsh
  4281 ms  -[VulnerableVault getSecretString] => VulnerableVault_g3n3r@t3dStr1ng
```

こうして、同じ結果が得られました。

### 1.06 Replace return value

メソッドが常にFalseを返すのでTrueを返すようにしなさいという問題です。



### 1.07 Print return value(bytearray)

次はBytearrayを表示せよとの問題です。

BytearrayとはSwiftでいうところの`[UInt8]`で、暗号化のときなどによく出てきます。アプリ解析において暗号化は避けて通れない道なのでしっかりと勉強します。

まずは静的解析でコードを読んでみます。

```zsh
                     -[VulnerableVault getSecretKey]:
0000000100005ee8         sub        sp, sp, #0x30defined at 0x10000c8f4 (instance method), DATA XREF=0x10000c8f4
0000000100005eec         stp        fp, lr, [sp, #0x20]
0000000100005ef0         add        fp, sp, #0x20
0000000100005ef4         nop
0000000100005ef8         ldr        x8, =___stack_chk_guard
0000000100005efc         ldr        x8, [x8]
0000000100005f00         stur       x8, [fp, var_8]
0000000100005f04         adr        x8, #0x10000ca78                            ; "$3cr3T8yt34rr4yGsjeb"
0000000100005f08         nop
0000000100005f0c         ldr        x9, [x8]
0000000100005f10         str        x9, [sp, #0x20 + var_18]
0000000100005f14         ldur       x8, [x8, #0x7]
0000000100005f18         stur       x8, [sp, #0x20 + var_11]
0000000100005f1c         nop
0000000100005f20         ldr        x0, =_OBJC_CLASS_$_NSData
0000000100005f24         nop
0000000100005f28         ldr        x1, =aDatawithbytesl
0000000100005f2c         add        x2, sp, #0x8
0000000100005f30         mov        w3, #0xf
0000000100005f34         bl         imp___stubs__objc_msgSend
0000000100005f38         mov        fp, fp
0000000100005f3c         bl         imp___stubs__objc_retainAutoreleasedReturnValue
0000000100005f40         ldur       x8, [fp, var_8]
0000000100005f44         nop
0000000100005f48         ldr        x9, =___stack_chk_guard
0000000100005f4c         ldr        x9, [x9]
0000000100005f50         cmp        x9, x8
0000000100005f54         b.ne       loc_100005f64
0000000100005f58         ldp        fp, lr, [sp, #0x20]
0000000100005f5c         add        sp, sp, #0x30
0000000100005f60         b          imp___stubs__objc_autoreleaseReturnValue
```

よくわからない感じですが、答えは`$3cr3T8yt34rr4yGsjeb`とわかります。

どこにもリターンがなくて変な感じがするのですが、このメソッド自体は指定されたポインタにバッファのポインタか何かを書き込むだけで何も返さないのだともいます。

だからよくわからない`imp___stubs__objc_autoreleaseReturnValue`もvoidのreturnみたいなものなんじゃないかと思っておきます。

こちらも引数がないので`onEnter`をhookする方法は使えません。

```ts
onLeave(log, retval, state) {
  const object = new ObjC.Object(retval);
  log(`-[VulnerableVault getSecretKey] => ${object}`);
  log(`-[VulnerableVault getSecretKey] => ${object.bytes()}`);
  log(`-[VulnerableVault getSecretKey] => ${object.bytes().readUtf8String(object.length())}`);
}
```

のように書いてみます。

```zsh
  9572 ms  -[VulnerableVault getSecretKey]
  9572 ms  -[VulnerableVault getSecretKey] => {length = 15, bytes = 0x243363723354387974333472723479}
  9572 ms  -[VulnerableVault getSecretKey] => 0x281310530
  9572 ms  -[VulnerableVault getSecretKey] => $3cr3T8yt34rr4y
```

すると、静的解析から得られた結果と同じ`$3cr3T8yt34rr4y`が得られました。
