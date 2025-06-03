# Arduino LED Controller

🎛️ **イージング関数を用いたLEDアニメーション制御アプリケーション**

Arduino搭載のLEDストリップを高度なイージング関数で制御し、美しく滑らかなアニメーションを作成できるWebアプリケーションです。

![Arduino LED Controller](https://img.shields.io/badge/Arduino-LED%20Controller-00979C?style=for-the-badge&logo=arduino&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-15.3.3-000000?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-19.0.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)

## ✨ 主な機能

### 🎨 **カラー設定**
- **デュアルカラー**: 開始色と終了色を自由に設定
- **カラーピッカー**: 直感的なカラー選択UI
- **リアルタイムプレビュー**: 色の変更が即座に反映

### ⚡ **アニメーション制御**
- **継続時間調整**: 0.5秒〜10秒の範囲で設定可能
- **ウェーブ遅延**: LEDストリップ上での波のような効果
- **多彩なイージング**: 10種類以上のプリセット関数

### 📈 **イージング関数**
- **プリセット関数**: Linear、Ease In/Out、Quad、Cubic など
- **カスタムベジェ**: 独自のベジェ曲線を4つの数値で定義
- **制御点可視化**: ベジェ曲線の構造を視覚的に理解
- **リアルタイム描画**: アニメーション進行をグラフで確認

### 🔌 **Arduino連携**
- **WiFi接続**: IPアドレスによる無線通信
- **リアルタイム制御**: 設定変更を即座にArduinoに送信
- **状態監視**: 接続状態とデータ送信状況を表示

### 📊 **ビジュアライザー**
- **正方形グラフ**: イージング曲線を美しく表示
- **制御点表示**: ベジェ曲線の制御点とアンカーポイント
- **プログレス表示**: アニメーション進行度の可視化
- **座標情報**: 現在位置の詳細数値表示

## 🚀 技術スタック

### **フロントエンド**
- **Next.js 15.3.3**: モダンなReactフレームワーク
- **React 19.0.0**: 最新のReactライブラリ
- **TypeScript**: 型安全な開発環境
- **Tailwind CSS 4.0**: ユーティリティファーストCSS

### **UI/UX**
- **Radix UI**: アクセシブルなUIコンポーネント
- **Lucide React**: 美しいアイコンライブラリ
- **react-colorful**: 軽量なカラーピッカー
- **shadcn/ui**: モダンなUIコンポーネントシステム

### **Arduino側**
- **WiFi通信**: HTTP APIによるデータ受信
- **LEDストリップ制御**: WS2812B/NeoPixel対応
- **イージング実装**: 高精度な数学関数

## 📦 インストール

### **必要な環境**
- Node.js 18.0.0 以上
- npm または yarn, bun
- Arduino IDE（ハードウェア制御用）

### **セットアップ手順**

1. **リポジトリのクローン**
```bash
git clone https://github.com/yourusername/arduino-led-controller.git
cd arduino-led-controller
```