# Screenshot
The extension for [Xcratch](https://xcratch.github.io/)

This is an extension to save screenshots as images in costumes.

# スクリーンショット
[Xcratch](https://xcratch.github.io/)用の拡張機能

これは、スクリーンショットを画像としてコスチュームに保存するための拡張機能です。

## 🌟 この拡張機能でできること

- プロジェクトの現在の画面をキャプチャし、コスチュームとして保存
- 既存の同名のコスチュームを上書きして更新

## 🔧 使用方法

1. Xcratchエディタで「拡張機能を追加」ボタンをクリック
2. 「拡張機能ローダー」を選択
3. 以下のURLを入力フィールドに貼り付け:
   ```
   https://tfabworks.github.io/xcx-screenshot/dist/screenshot.mjs
   ```
4. 「読み込む」をクリックして拡張機能を追加

## 📚 ブロックの説明

- 「スクリーンショットを[コスチューム名]として保存」: 現在の画面をキャプチャし、指定したコスチューム名で保存します。

## 💡 ヒント

- コスチューム名を指定しない場合、デフォルトの名前が使用されます。
- 同じ名前のコスチュームが既に存在する場合、上書きされます。

この拡張機能を使って、プロジェクトに動的なスクリーンショット機能を追加しましょう！


## ✨ What You Can Do With This Extension

Play [Example Project](https://xcratch.github.io/editor/#https://tfabworks.github.io/xcx-screenshot/projects/example.sb3) to look at what you can do with "Screenshot" extension.
<iframe src="https://xcratch.github.io/editor/player#https://tfabworks.github.io/xcx-screenshot/projects/example.sb3" width="540px" height="460px" allow="camera"></iframe>


## How to Use in Xcratch

This extension can be used with other extension in [Xcratch](https://xcratch.github.io/).
1. Open [Xcratch Editor](https://xcratch.github.io/editor)
2. Click 'Add Extension' button
3. Select 'Extension Loader' extension
4. Type the module URL in the input field
```
https://tfabworks.github.io/xcx-screenshot/dist/screenshot.mjs
```

## Development

### Register on the local Xcratch

Run register script to install this extension on the local Xcratch for testing.

```sh
npm run register
```

### Bundle into a Module

Run build script to bundle this extension into a module file which could be loaded on Xcratch.

```sh
npm run build
```

## 🏠 Home Page

Open this page from [https://tfabworks.github.io/xcx-screenshot/](https://tfabworks.github.io/xcx-screenshot/)


## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/tfabworks/xcx-screenshot/issues).
