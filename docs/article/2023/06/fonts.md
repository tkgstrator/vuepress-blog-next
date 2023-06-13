---
title: iOSアプリでのフォントの扱い方 
date: 2023-06-11
description: フォントのインストールからフォントを利用するまで
lastUpdated: true 
---

## フォント

フォントを利用するには、

1. MobileConfigを利用したプロファイル方式
2. Assets.xcassetsに埋め込むアセット方式
3. Documentsから読み込むドキュメント方式
4. iOS13以降対応したフォント方式

の四つがあります。

> 呼び方は適当なのでそこは気にしないでください。

### 各方式の比較

それぞれの大雑把な比較は以下のとおりです。

|        | プロファイル | アセット | ドキュメント | フォント         | 
| :----: | :----------: | :------: | :------: | :--------------: | 
| 権利   | 難           | 難       | 易       | 難/易               | 
| 利用   | -            | -        | -        | iOS13以降        | 
| 拡張子 | ttf, otf          | ttf      | ttf, woff, woff2      | ttf | 

#### 権利

いちばん大事なのがここで、再配布を禁止していたり商用利用が不可だったりするフォントは多数あります。

プロファイルにしろ、アセットにしろ`.mobileconfig`か`assets.xcassets`に組み込まなければいけないので、これらの方式ではすべてのフォントを自由に配布したりすることはできません。

iOSアプリにフォントを組み込む記事を検索すると日本語でも英語でもほとんどが`assets.xcassets`を利用した方法を紹介していますが、この方法は使えないわけです。

とはいえ、それぞれどのような違いがあるのかを調べてみることにしました。

#### 拡張子

ほとんどのパターンで`ttf`ないしは`otf`しかサポートしていませんが、バンドル方式は`woff`や`woff2`が利用できました。これらは圧縮率が高くてオススメです。

## テスト用アプリ

どのフォントが利用できるかは`UIFont.familyNames`を参照すればわかります。

ここに表示されないフォントはどうやってもアプリ内から利用できないので、これでフォントが利用可能になっているかどうかを判断できます。

### ContentView

```swift
struct ContentView: View {
    var body: some View {
        NavigationView(content: {
            List(content: {
                NavigationLink(destination: {
                    FontListPicker()
                }, label: {
                    Text("Font Lists")
                })
            })
        })
    }
}
```

`UIFontPickerViewController`は`SwiftUI`でそのまま利用できないので、`UIViewControllerRepresentable`を利用します。

```swift
struct FontListPicker: UIViewControllerRepresentable {
    func makeCoordinator() -> Coordinator {
        Coordinator(self)
    }

    func makeUIViewController(context: Context) -> UIFontPickerViewController {
        let controller: UIFontPickerViewController = UIFontPickerViewController()
        controller.delegate = context.coordinator
        return controller
    }

    func updateUIViewController(_ uiViewController: UIFontPickerViewController, context: Context) {
    }

    class Coordinator: NSObject, UIFontPickerViewControllerDelegate {
        private let parent: FontListPicker

        init(_ parent: FontListPicker) {
            self.parent = parent
        }

        func fontPickerViewControllerDidPickFont(_ viewController: UIFontPickerViewController) {
            guard let descriptor = viewController.selectedFontDescriptor,
                  let name: String = descriptor.fontAttributes[.family] as? String,
                  let font: UIFont = UIFont(name: name, size: UIFont.systemFontSize)
            else {
                return
            }
            UIApplication.shared.keyWindow?.rootViewController?.dismiss(animated: true)
        }
    }
}
```

これで`FontListPicker`にインストールしたフォントが表示されるようになれば利用可能、ということです。

### Capabilities

フォント方式でインストールしたフォントを利用するには`Capabilities`から`Fonts`を有効化して`Use Installed Fonts`と`Install Fonts`にチェックを入れます。

> Use Installed Fontsにチェックを入れるとバイナリにフォントが同梱されていないとInvalid BinaryでAppStore Connectから弾かれるので注意

## プロファイル方式

Apple Configuratorを使ってフォントをインストールする方式です。

iOS13以前ではこれが利用されていたようなので、どうなるのか検証してみます。

導入の方法を書いていると長いので、先駆者の方の記事を載せておきます。

[iOSにフォントをいっぱいインストールしたい](https://qiita.com/YOCKOW/items/0703134a787bffcfe49f)を読めばオリジナルフォントをインストールするのは難しくないと思います。

### 検証

で、この方式でインストールしたフォントは[Keynote](https://apps.apple.com/jp/app/keynote/id361285480)では確かに利用可能なのですが、シミュレータだと何故か反映されませんでした。

|                     | シミュレータ | iPhone/iPad | 
| :-----------------: | :----------: | :---------: | 
| Use Installed Fonts | 不要         | 不要        | 
| フォントの読み込み  | 不可         | 可          | 
| 設定画面表示        | なし         | なし        | 
| Xcode設定        | 不要        | 不要        | 

つまり、上のような結果になります。

構成プロファイルを作成するのが手間なこと以外はものすごく簡単だと思います。

### 必要なもの

さて、今回のケースだと構成プロファイルを作成するのに何が必要なのでしょうか。

1. [Apple Configurator 2](https://apps.apple.com/jp/app/id1037126344)
2. [FontForge](https://fontforge.org/en-US/downloads/)
3. スプラトゥーン用のフォント

このうちなんとApple Configurator 2はWindows版が提供されていない。つまり、この時点でWindowsユーザーは構成プロファイルを利用したフォントのインストールができないことになります。

とはいえ、構成プロファイルは単純にフォントのBase64バイナリがXMLに貼り付けられているだけなので適当にTSでコードを書けば構成プロファイルを作成するウェブサイトを作成するのは難しくないと思います。それを転送するのがまた手間ですけれど......

マージするフォントは以下のURLから手に入ります。Webで普通に公開されているのでとても楽です。2用と3用がありますが、韓国語と中国語を利用しないのであれば2用のフォントで十分です。

```zsh
https://app.splatoon2.nintendo.net/fonts/bundled/ab3ec448c2439eaed33fcf7f31b70b33.woff2 
https://app.splatoon2.nintendo.net/fonts/bundled/0e12b13c359d4803021dc4e17cecc311.woff2 
https://app.splatoon2.nintendo.net/fonts/bundled/da3c7139972a0e4e47dd8de4cacea984.woff2 
https://app.splatoon2.nintendo.net/fonts/bundled/eb82d017016045bf998cade4dac1ec22.woff2
```

四つのファイルはそれぞれスプラ1用の日本語と英語、スプラ2用の日本語と英語のフォントになっています。

日本語フォントには英語のフォントが全く含まれていないので、これらをマージしてしまえば良いことになります。

で、マージするにはFontForgeを利用するのが一番楽です。 手順は長いので割愛します。

## アセット方式

何も考えないなら一番楽なのがこれです。

ただし、アプリ自体にフォントをバンドルしなければいけない性質上、権利関係をクリアするのはほぼ不可能です。

配布不可なフォントを利用したい場合にはこの方式は使えません。

|                     | シミュレータ | iPhone/iPad | 
| :-----------------: | :----------: | :---------: | 
| Use Installed Fonts | 不要         | 不要        | 
| フォントの読み込み  | 可         | 可          | 
| 設定画面表示        | なし         | なし        | 
| Xcode設定        | 必要         | 必要        | 

## ドキュメント方式

ドキュメント方式はアプリが持つ`Documents`以下にフォントのファイルをダウンロードして、そのフォントを読み込むタイプの対応方法です。

ユーザーが勝手にフォントをダウンロードしてくるのでアプリ自体にフォントをバンドルする必要はありません。

|                     | シミュレータ | iPhone/iPad | 
| :-----------------: | :----------: | :---------: | 
| Use Installed Fonts | 不要         | 不要        | 
| フォントの読み込み  | 可         | 可          | 
| 設定画面表示        | あり         | あり        | 
| Xcode設定        | あり        | あり        | 

> アプリ自身がインストールしたフォントを利用する場合は`Use Installed Fonts`は不要だが、`Install Fonts`は必要でプロセスにインストールするだけであれば`Install Fonts`は不要

|                         | Install Fonts Yes                        | Install Fonts No                             | 
| :---------------------: | :--------------------------------------: | :------------------------------------------: | 
| Use Installed Fonts Yes | 全て利用可                               | 他のアプリでインストールしたフォントが利用可 | 
| Use Installed Fonts No  | アプリがインストールしたフォントは利用可 | .processのみ利用可                           | 

なにやらややこしいのですが、とりあえずどちらもチェックを入れて損はないです。ただし、Install FontsをYesにするのであればバイナリに必ずフォントを同梱してください。

この方式ができればめんどくさい構成プロファイルの作成が省略できて楽なのですが、この方式を導入するに当たって難しい点を挙げると、

1. [Core Text Functions](https://developer.apple.com/documentation/coretext/core_text_functions)に関するドキュメントが少ない
2. 起動時にフォントを読み込んで登録する必要がある
    - 他の二つの方式ではアプリ自体及び構成プロファイルがフォントを自動で登録してくれていましたが、本方式ではアプリ起動時に登録する必要があります
    - 多分ですが`AppDelegate`で登録しておけばよいです
3. 同一のFamilyNameを持つフォントに対する読み込み方法がわからない
    - 同一のFamilyNameを持つフォントを登録しようとすると[`CTFontManagerError.duplicatedName`](https://developer.apple.com/documentation/coretext/ctfontmanagererror/duplicatedname)で普通に怒られます
4. インストールダイアログがでない
    - 本当に謎で、端末リセット直後の一回だけでたけどそれ以後音沙汰がないです
    - 複数同時にインストールしようとするとそうなるのかもしれない
5. FamilyNameが異なるフォントがある
    - 後述します

と、ハードルがものすごく高いのですがこの方式ができれば一番楽です。なぜならフォントのURLもそのフォントが持つFamilyNameの情報も全てわかっているからです。

### FamilyName問題

かなり大きな問題で、スプラトゥーン1用の漢字フォントは`ROWDayStd`というFamilyNameが設定されているにも関わらず、ひらがなと英語のフォントは`Splatoon1`とういFamilyNameになっているからです。

つまり、単純にフォントが持っているFamilyNameで登録してしまうと漢字とひらがなが混在しているテキストに`.font()`を当てると漢字かひらがなのどちらか一方は普通のフォントで表示されてしまうという問題が発生します。これを解決するにはフォントを読み込んだときにFamilyNameを変更して登録する必要があるのですが、それをやると[`CTFontManagerError.duplicatedName`](https://developer.apple.com/documentation/coretext/ctfontmanagererror/duplicatedname)で怒られます。

SwiftUIでのフォントの読み込み方法を変えるか`CTFontManager`あたりを上手いことやる必要があると思うのですがいかんせんドキュメントが少なすぎて手探り感が半端ないです。

### インストールダイアログがでない問題

何故か端末をリセットした最初の一回だけでます。

`.process`でインストールした場合にはでてこないので、`.persistent`を指定する必要があると思います。

まだ調査不足です。

### フォント関連のメソッド解説

#### インストール

- `CTFontManagerRegisterFontsForURL(CFURL, CTFontManagerScope, UnsafeMutablePointer<Unmanaged<CFError>?>?) -> Bool`
    - 指定されたURLのフォントを指定されたパラメータで登録する
    - `CTFontManagerScope=.process`以外は登録に失敗する
- `CTFontManagerRegisterFontDescriptors(CFArray, CTFontManagerScope, Bool, ((CFArray, Bool) -> Bool)?)`
    - 指定されたフォント一覧を指定されたパラメータで登録する
    - `CTFontManagerScope=.persistent`以外は登録に失敗する
- `CTFontManagerRegisterFontsWithAssetNames(CFArray, CFBungle, CTFontManagerScope, Bool)`
    - 指定されたファミリーネーム一覧を指定されたパラメータで登録する
    - `CTFontManagerScope=.persistent`以外は登録に失敗する

#### アンインストール

- `CTFontManagerUnregisterFontDescriptors(CFArray, CTFontManagerScope, ((CFArray, Bool) -> Bool)?)`
    - 指定されたファミリーネーム一覧を指定されたパラメータで解除する

#### 取得

- `CTFontManagerCopyRegisteredFontDescriptors(CTFontManagerScope, Bool) -> CFArray`
    - 指定されたパラメータで登録されているすべてのフォントを取得して返す
    - フォント一覧取得 
- `CTFontDescriptorCopyAttribute(CTFontDescriptor, CFString) -> CFTypeRef?`
    - 指定されたフォントの指定されたパラメータを返す
    - フォントのパラメータ取得 

#### その他

- `CTFontManagerSetAutoActivationSetting(CFString?, CTFontManagerAutoActivationSetting)`
    - 指定されたバンドルIDのフォントを自動でアクティベーションする

パッと見ただけだと何がなんだかわからないと思うので解説します。

まず、フォントのインストール・アンインストールに関して二つのパラメータがあります。

それが`scope: CTFontManagerScope`と`enabled: Bool`ですが、これらは何も考えずにそれぞれ`.persistent`と`true`を指定するようにしましょう。特に`enabled=false`を指定するとえらくめんどくさいです。

#### [CTFontManagerScope](https://developer.apple.com/documentation/coretext/ctfontmanagerscope/)

フォントの影響力を表す。

- none
    - スコープなし
- process
    - 現在のプロセスでunregisteredが呼ばれるまで有効
    - アプリ終了などでプロセスがキルされるとアンインストールされる
    - 設定のフォントからインストールしたフォントが見れない
    - プロセスキルでアンインストールされる以外は構成プロファイルと似ている
- persistent
    - ユーザーのすべてのプロセスでunregisteredが呼ばれるまで有効
    - アプリを終了してもインストール状態が継続
    - 設定のフォントからインストールしたフォントが見れる
- session
    - macOSのみ有効なので今回は考慮しない
- user
    - persistentと同じ

#### Enabled

登録されているフォントのうち有効なものを返すか無効なものを返すかを表す。

`enabled=false`でフォントをインストールすると、設定画面からフォントが表示されず、かといって再度インストールしようとすると`1 files have already been registered in the specified scope.`の[エラー](https://developer.apple.com/documentation/coretext/ctfontmanagererror/alreadyregistered)が返ってくる。

`false`を設定する意味が今のところ見えないので、通常は`true`で良い。

#### [CTFontDescriptor](https://developer.apple.com/documentation/coretext/ctfontdescriptor-ni4)

登録されているフォントの情報は以下の四つ

- CTFontRegistrationUserInfoAttribute
- NSCTFontFileURLAttribute
- NSFontFamilyAttribute
- NSFontNameAttribute

これをFontForgeで確認できるフォント情報を見比べてみる。

|                                     | Splatoon 1                       | Splatoon 2                       | 
| :---------------------------------: | :------------------------------: | :------------------------------: | 
| Fontname                            | RowdyStd-EB-Kanji                | KurokaneStd-EB-Kanji             | 
| Family Name                         | FowdyStd                         | KurokaneStd                      | 
| Name For Humans                     | RowdyStd-EB-Kanji                | KurokaneStd-EB-Kanji             | 
| NSFontFamilyAttribute               | FOT-Rowdy Std EB                 | FOT-Kurokane Std EB              | 
| NSFontNameAttribute                 | RowdyStd-EB                      | KurokaneStd-EB                   | 
| CTFontRegistrationUserInfoAttribute | ab3ec448c2439eaed33fcf7f31b70b33 | da3c7139972a0e4e47dd8de4cacea984 | 
| NSCTFontFileURLAttribute            | URL                              | URL                              | 

すると何故か全然一致しないという謎の状態が発生した。

`CTFontRegistrationUserInfoAttribute`はファイル名なので、これだけを信用したほうが良い気がする。

もしくは、予めFontnameかFamily Nameがわかっているものでないと利用するのは難しいと思われる。

```swift
/// CTFontRegistrationUserInfoAttribute
CTFontDescriptorCopyAttribute(descriptor, kCTFontRegistrationUserInfoAttribute) as? String
/// NSCTFontFileURLAttribute
CTFontDescriptorCopyAttribute(descriptor, kCTFontURLAttribute) as? String
/// NSFontNameAttribute
CTFontDescriptorCopyAttribute(descriptor, kCTFontNameAttribute) as? String
/// NSFontFamilyAttribute
CTFontDescriptorCopyAttribute(descriptor, kCTFontAttributeName) as? String
```

多分上のようなコードで`CTFontDescriptor`からデータが取ってこれるが、最悪辞書なのでゴリ押しでもとれます。

### メソッド詳細

#### CTFontDescriptorCopyAttribute

`CTFontDescriptor`から安全にプロパティを取得するメソッド。使い方は先程解説した通り。

```swift
func CTFontDescriptorCopyAttribute(
    _ descriptor: CTFontDescriptor,
    _ attribute: CFString
) -> CFTypeRef?
```

#### CTFontManagerRegisterFontDescriptors

`[CTFontDescriptor]`を一括でインストールするメソッド。とはいえ`CTFontDescriptor`になっている時点で普通はインストールが完了しているはずなので、ここはまだ使い方がしっかり理解できていないと思われる。

今回のサンプルプログラムでは利用しなかった。

```swift
func CTFontManagerRegisterFontDescriptors(
    _ fontDescriptors: CFArray,
    _ scope: CTFontManagerScope,
    _ enabled: Bool,
    _ registrationHandler: ((CFArray, Bool) -> Bool)?
)
```

#### CTFontManagerRegisterFontsWithAssetNames

`Assets.xcassets`に登録されているフォントをインストールする。

```swift
func CTFontManagerRegisterFontsWithAssetNames(
    _ fontAssetNames: CFArray,
    _ bundle: CFBundle?,
    _ scope: CTFontManagerScope,
    _ enabled: Bool,
    _ registrationHandler: ((CFArray, Bool) -> Bool)?
)
```

ちょっとわかりにくいので少し解説。

- fontAssetNames
    - インストールしたいフォントのファイル名(拡張子不要)
- bundle
    - 何も考えずに`CFBundleGetMainBundle()`を指定すれば良い。

> CFBundleはNSBundleとは互換性がないようなので`Bundle.main`などは利用できない

Xcodeはビルド時にアセットの階層構造が全てなくなるのでバンドルされているファイルを取得して指定されたファイル名のフォントを取ってきているようだ。

> 端末リセット直後の初回インストール時のみダイアログが出現する。

#### [CTFontManagerUnregisterFontDescriptors](https://developer.apple.com/documentation/coretext/3227900-ctfontmanagerunregisterfontdescr/)

フォントマネージャを使ってフォントをアンインストールするメソッド。

```swift
func CTFontManagerUnregisterFontDescriptors(
    _ fontDescriptors: CFArray,
    _ scope: CTFontManagerScope,
    _ registrationHandler: ((CFArray, Bool) -> Bool)?
)
```

ここでアンインストールすべきフォントを正しくとってこないと、全てのフォントが消えます。

```swift
guard let fontDescriptors: [CTFontDescriptor] = CTFontManagerCopyRegisteredFontDescriptors(.persistent, true) as? [CTFontDescriptor]
else {
    return
}
```

のようなコードで登録されているフォントを全て取得してからフィルターをかけてアンインストールすべきフォントを正しく取得しましょう。

> なお、インストールされていないフォントをアンインストールしようとしても特にエラーはでません。

#### [CTFontManagerRegisterFontsForURL](https://developer.apple.com/documentation/coretext/1499468-ctfontmanagerregisterfontsforurl/)

指定されたURLのフォントをインストールするメソッド。ただし、かなり限定的な使い方しかできない。

```swift
func CTFontManagerRegisterFontsForURL(
    _ fontURL: CFURL,
    _ scope: CTFontManagerScope,
    _ error: UnsafeMutablePointer<Unmanaged<CFError>?>?
) -> Bool
```

URLを指定できるということはもちろん`Documents`からフォントをインストールすることもできますが`.process`以外が効きません。

実行した場合のエラーコードも載せておきます。

- `.none`
    - `Someone attempted to (un)register one or more fonts with CTFontManager using scope kCTFontManagerScopeNone.  That's not a valid scope for (un)registration, so we'll use kCTFontManagerProcess instead.  This message will not be logged again.`
- `.persistent`
    - `kCTFontManagerScopePersistent is not supported by this function.  Use API with registrationHandler block parameter.`

ちなみにプロセス実行中しか効かないので、アプリを終了すればフォントは自動的に`unregistered`されます。

よって、起動時に毎回インストールを実行する必要があります。やるなら`AppDelegate`で実行するのが良いかと思われる。

`CTFontManagerSetAutoActivationSetting`を使えば自動でインストールするようにできるかもしれないけれど、まだ未調査です。

#### [CTFontManagerCopyRegisteredFontDescriptors](https://developer.apple.com/documentation/coretext/3227895-ctfontmanagercopyregisteredfontd/)

指定されたスコープでインストールされているフォントを取ってきます。

```swift
func CTFontManagerCopyRegisteredFontDescriptors(
    _ scope: CTFontManagerScope,
    _ enabled: Bool
) -> CFArray
```

返り値は`CFArray`となっていますが、実質的に`[CTFontDescriptor]`と同じです。

### 補足説明

先人の[記事](https://qiita.com/hcrane/items/a0a7a77f9d709e9692b6)に拠れば**Resource Tag**にも追加すると書いてあるが、これは結局ファイルの存在チェックにしか使えず、バンドルしているならフォントがあるのは当たり前の話であるし、バンドルしていないならそもそもResource Tagの値は設定できないので事実上やってもやらなくても良い設定になっています。

現状、書かなくてもフォントはインストールできるので特にこの手順は不要かと思います。