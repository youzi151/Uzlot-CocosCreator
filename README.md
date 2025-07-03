# Uzlot-CocosCreator

## 簡介

老虎機公版，搭配[Uzil工具集](https://github.com/youzi151/uzil-cocoscreator2.0.x)開發。

以方便改製成各款老虎機遊戲為主，製作共通基礎功能如：滾輪、開獎、流程...等。

### 展示Demo
- [一般版](https://youzi151.github.io/ghp-uzlot-demo/nm/)
- [特殊效果版](https://youzi151.github.io/ghp-uzlot-demo/mw/)

### 特色

- 滾輪動態
  - 可讀取貝茲曲線，在一定的條件下可演出細膩的停輪效果。
  - 資料/顯示分層，滾動物件本身只控制指標位置，滾動方向與圖標間隔等由滾動顯示控制。
  - 以此方式可達到如：逆/橫向滾動、仿3D...等效果。
- 中獎邏輯
  - 依照不同中獎方式，可撰寫該規則的 讀取盤面、是否中獎、其他的邏輯。

### 基本功能

- 滾動效果
  - 滾動圖標模糊
- 中獎方式
  - Way
  - Line (進行中)
- 開獎方式
  - 一般開獎
  - ThumblingReels
- 子遊戲
  - FreeGame

## 更新紀錄

目前 v0.1.0 (2021-03-21)

詳見 [ChangeLog](CHANGELOG.md)


## 功能說明

- Slot 老虎機主要
  - 提供 遊戲流程/狀態, 中獎演出, 滾動控制...等邏輯。
- Rule 規則相關
  - 定義 WinData中獎資料。
  - 定義或提供 中獎規則與滾輪相關之邏輯。
- Reel 滾輪相關
  - 提供 滾輪相關之各種元件、使用各元件組成需要的滾輪盤面。
  - 功能分層
    - 資料：
      - ReelColData格資料：紀錄滾輪格的圖標, 尺寸, 顯示範圍...等資訊。
      - ReelStripData滾輪條資料：紀錄滾輪條中有那些滾輪格、長度...等資訊。
    - 顯示：
      - ReelColObj格物件：控制滾輪格的圖標圖片、中獎特效、模糊效果...等。
      - ReelRowObj滾輪條物件：控制滾輪條的滾動，當前指標位置、盤面範圍...等。
      - ReelRowView滾輪條顯示：控制滾輪條如何顯示，滾動方向、圖標間隔、顯示範圍...等。
- FeatureGame 特色遊戲 (子遊戲)
  - 簡單提供子遊戲(例如:FreeGame)轉場與結算畫面範本
- Net 連網相關
  - 連線相關資料的定義。
  - 連接、開獎、取得資訊...等功能之Client介面。
  - 對應不同伺服端，可新增自定義Client。
- Act 演出編排
  - 基於 Uzil.Act 的擴充，用於可彈性編排的演出。
  - 如：Repeat{ 圖標演出H1、圖標演出H2 }
- WalletUI 分數介面
  - 簡易提供 可用分數、贏分、當前下注的顯示範本。

## 使用說明

### 代碼風格

- 大括號不換行
- tab縮排
- ...其餘自行參考

## 授權使用

詳見 [License](LICENSE)

## 參考/使用 其他項目

- Uzil
  - 來源: https://gitlab.com/youzi151/uzil-cocoscreator2.0.x
  - Shader
    - Creator2.0 Shader (ericchen888)
      - 來源: https://forum.cocos.org/t/creator-2-0-shader/64755
    - 以及 其他cocos論壇上提供之代碼
  - bezierjs (Pomax)
    - 來源: https://pomax.github.io/bezierjs/
