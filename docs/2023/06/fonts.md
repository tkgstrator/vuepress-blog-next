---
title: iOSアプリでのフォントの扱い方 
publish_date: 2023-06-11
description: フォントのインストールからフォントを利用するまで 
---

## フォント

フォントを利用するには、

1. MobileConfigを利用したプロファイル方式
2. Assets.xcassetsに埋め込むアセット方式
3. Bundleから読み込むバンドル方式
4. iOS13以降対応したフォント方式

の四つがあります。

> 呼び方は適当なのでそこは気にしないでください。

### 各方式の比較

それぞれの大雑把な比較は以下のとおりです。

|        | プロファイル | アセット | バンドル | フォント         | 
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

> 試したところ、この方法は完全に`Fonts`からインストールしたフォントにしか有効でないようだ

## Mobile Config

Apple Configuratorを使ってフォントをインストールする方式です。

iOS13以前ではこれが利用されていたようなので、どうなるのか検証してみます。

導入の方法を書いていると長いので、先駆者の方の記事を載せておきます。

[iOSにフォントをいっぱいインストールしたい](https://qiita.com/YOCKOW/items/0703134a787bffcfe49f)を読めばオリジナルフォントをインストールするのは難しくないと思います。

### 検証

で、この方式でインストールしたフォントは[Keynote](https://apps.apple.com/jp/app/keynote/id361285480)では確かに利用可能なのですが、シミュレータ