# Unity版 MR Piano

Unity Editorで動かす3D版ピアノの土台です。

この環境ではUnity本体が見つからなかったため、まずはUnityプロジェクトとして開ける最小構成と、ブラウザ版の設計に対応するC#スクリプトを用意しています。

## 開き方

1. Unity Hubを開く。
2. `Add project from disk` を選ぶ。
3. このフォルダ `piano/unity/` を選ぶ。
4. Unity `2022.3.62f3` または同じ2022 LTS系で開く。

このPCにはUnity Hub `3.18.0` とUnity Editor `2022.3.62f3` を入れています。初回起動時はUnity Hubでログインし、Personalライセンスを有効化する必要があります。

## 最初のシーン作成手順

Unityで開いたら、空のシーンで以下を作ります。

1. `PianoRoot` という空GameObjectを作る。
2. `PianoLayoutBuilder` を追加する。
3. `PianoSoundEngine` を追加する。
4. `PianoInputRouter` を追加する。
5. `KeyboardInputProvider` を追加する。
6. `VirtualFingertipInputProvider` を追加する。
7. `PianoInputRouter` に `PianoSoundEngine` と `PianoLayoutBuilder` を接続する。
8. `KeyboardInputProvider` と `VirtualFingertipInputProvider` に `PianoInputRouter` を接続する。
9. Playすると、3D鍵盤が生成され、PCキーボードで音が鳴る。

## 現在できること

- 1オクターブの3D鍵盤生成
- 白鍵/黒鍵のCollider生成
- PCキーボード入力
- 仮想指先の押し込み判定
- AudioSourceによる簡易シンセ音

## Quest 3入手後に追加するもの

- Meta XR SDK
- HandTrackingInputProvider
- パススルーMR
- 空間アンカー
- 実機レイテンシ調整
