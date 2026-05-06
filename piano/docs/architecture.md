# 設計メモ

## 基本方針

MRピアノは、あとからUnity/Quest実装へ移せるように、小さなシステムに分けて考えます。

重要なのは、入力、音、鍵盤の見た目を密結合にしすぎないことです。指で押した場合でも、キーボードで押した場合でも、最終的には同じ「キーが押された」「キーが離された」というイベントに変換します。

## システム

### Piano Layout

鍵盤の定義を担当します。

含めるもの:

- キーID
- 音名
- MIDIノート番号
- 周波数
- 白鍵/黒鍵
- 位置とサイズ

初期ターゲット:

- C4からC5まで
- 白鍵8個
- 黒鍵5個
- 1オクターブ + 上のC

### Input

ユーザー操作をキー入力に変換します。

現在のプロトタイプ入力:

- PCキーボード
- マウス/タッチ
- 仮想指先
- `Air / Touch / Press` の押し込み深度

将来のMR入力:

- 手の指先座標
- 鍵盤上の当たり判定エリア
- 押し込み深度のしきい値
- 横から触れた場合の除外

### Sound

低遅延で音を鳴らす部分です。

現在:

- Web Audio API
- oscillatorによる簡易音源
- 短いattack/release
- 同時発音

Unity移行後:

- AudioSourceプール
- サンプルベースのピアノ音源
- 軽量シンセ
- 必要ならMIDI出力

### Feedback

弾いた感触を視覚的に返す部分です。

現在:

- 鍵盤の色変更
- 鍵盤の押し下げ表示
- 指先ホバー
- 深度メーター

将来:

- 物理的な鍵盤沈み込み
- 光る鍵盤
- 練習モード
- 可能ならハプティック代替表現

## Unity移行案

次のフェーズで `piano/unity/` を作り、Unity Editor上でMRピアノの土台を作ります。

ブラウザ版では、Unityへ移しやすいように `script.js` を以下の役割に分けています。

- `PianoModel`: 鍵盤データと検索
- `PianoSoundEngine`: 音の再生と停止
- `PianoView`: 鍵盤DOMの描画と見た目の状態
- `PianoController`: キー押下/解放イベントの中心
- `FingertipInput`: 仮想指先、深度、ホバー、押下判定
- `PrototypeApp`: 入力イベントの接続とモード管理

想定コンポーネント:

- `PianoKey`
- `PianoLayoutBuilder`
- `PianoInputRouter`
- `KeyboardInputProvider`
- `VirtualFingertipInputProvider`
- `HandTrackingInputProvider`
- `PianoSoundEngine`

大事な境界:

入力プロバイダーは「どのキーが押されたか/離されたか」だけを通知します。音の再生や鍵盤アニメーションは、別のシステムが受け持ちます。
