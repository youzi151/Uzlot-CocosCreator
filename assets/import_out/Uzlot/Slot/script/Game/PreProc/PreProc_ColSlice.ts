import { Invoker } from "../../../../../Uzil/Uzil";
import { ResultData } from "../../../../Net/index_Net";
import { ColMiddle, ReelColData, ReelRowObj } from "../../../../Reel/index_Reel";
import { SlotUtil } from "../../Util/SlotUtil";
import { GameCtrl } from "../GameCtrl";
import { SpinPreProc } from "../SpinPreProc";

const {ccclass, property} = cc._decorator;

/*
 * 此方法預計廢除，改為像是Megaways一樣的做法，
 * 直接改變滾輪表本身，再做停輪。較為簡單不易出錯。
 */

@ccclass
export class PreProc_ColSlice extends SpinPreProc {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 預計銷毀 */
	private _prepareToDestroyExColSet : {reelRow:ReelRowObj, middle:ColMiddle, row: number, col:number}[] = [];
	private _toDestroyExColSet : {reelRow:ReelRowObj, middle:ColMiddle, row: number, col:number}[] = [];

	/** 最後一次使用的 邊界格中介 */
	private _lastBorderMiddle : Array<ColMiddle> = [];

	/** 額外格資料 池 */
	private _colDataMap : Map<number, Map<number, ReelColData>> = new Map<number, Map<number, ReelColData>>();
	
	/*== Event ====================================================*/
	
	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {
		
	}

	update (dt) {
		
		
	}

	/*== Public Function ==========================================*/

	/** 呼叫 */
	public process (data: Object) : Object {

		if (this.isEnabled == false) return;
		
		// 準備資料 ===========================

		let gameCtrl : GameCtrl = data["gameCtrl"];
		let result : ResultData = data["result"];
		
		let reelCtrl = gameCtrl.reelCtrl;
		
		//=====================================

		// cc.log("=colSlice start===========");

		// 處理之前的殘餘=======================

		// 開啟所有之前關掉的 邊界Col
		for (let each of this._lastBorderMiddle) {
			delete each.args["isActive"];
			each.data.addTag("resultable");
		}
		this._lastBorderMiddle = [];

		// 銷毀上上次不用的
		for (let toDestroy of this._toDestroyExColSet) {

			let stripData = toDestroy.reelRow.stripData;

			toDestroy.reelRow.view.destroyMiddle(toDestroy.middle);

			toDestroy.reelRow.view.setInView(toDestroy.col, false);

			// 取得 現有 格資料 並 移除
			let existIdx = stripData.cols.findIndex((each)=>{
				return each.idx == toDestroy.col;
			});
			if (existIdx != -1) stripData.cols.splice(existIdx, 1);

			SlotUtil.recoveryExColIdx(toDestroy.row, toDestroy.col);

		}
		// 關閉所有之前開啟的 額外Col
		for (let each of this._prepareToDestroyExColSet) {

			let middle = each.middle;
			let reelRow = each.reelRow;

			// 若該中介 已經顯示中
			if (middle.isAnyObjActive()){
				// 標示為關閉
				middle.args["isActive"] = false;
			} 
			// 否則
			else {
				
				// XXX:仍然有問題

				// 下一幀 關閉
				Invoker.once(()=>{
					middle.args["isActive"] = false;
				}, 0.1);
				
			}
			
			middle.data.removeTag("resultable");
		}

		// 填入 下一次 要 銷毀的
		this._toDestroyExColSet = this._prepareToDestroyExColSet.slice();
		this._prepareToDestroyExColSet = [];
		
		// 檢查並替換版面=======================

		// 停輪位置的每一輪
		for (let reelIdx = 0; reelIdx < result.stopPosList.length; reelIdx++) {

			// 軌道
			let reelRow = reelCtrl.reelContainer.getReel(reelIdx).getReelRow();

			// 顯示器
			let view = reelRow.view;

			// 每個停輪位置
			let eachStopPos = result.stopPosList[reelIdx];

			// 滾輪表
			let stripData = reelRow.stripData;

			// 上下邊界
			let border_up = eachStopPos - 3;
			let border_down = eachStopPos + 3;

			// 上下邊界的格
			let borderCol_up = reelRow.stripData.getColByTriggerPos(border_up);
			let borderCol_down = reelRow.stripData.getColByTriggerPos(border_down);

			let borderCols = [borderCol_up, borderCol_down];
			
			// 切割範圍
			let colSliceInfos = SlotUtil.getColSliceInfo([stripData.min, stripData.max], [border_up, border_down], borderCols);


			// 每個資訊 (上方格 與 下方格)
			for (let idx = 0; idx < colSliceInfos.length; idx++) {

				let sliced = 0;
				
				let eachSliceInfo = colSliceInfos[idx];

				// 邊界上方範圍 與 邊界下方範圍
				for (let range of eachSliceInfo) {
					
					
					// 範圍中心位置
					let length = Math.abs(range[0]-range[1]);
					
					if (length == 0) continue;

					sliced += 1;
					
					// 請求 空的額外格IDX
					let extraCol_idx = SlotUtil.requestExColIdx(reelIdx);
					
					// 請求額外格資料
					let extraCol : ReelColData = this._requestColData(reelIdx, extraCol_idx);
	
					let sliceRangePos = (range[0]+range[1])/2;
					extraCol.pos = sliceRangePos;
					let relativeRange = [sliceRangePos - range[0], range[1]-sliceRangePos]
					extraCol.displayRange_relative = [relativeRange[0], relativeRange[1]];
					extraCol.triggerRange_relative = [relativeRange[0], relativeRange[1]];

					// 所屬格
					let extraCol_parentCol : ReelColData;

					// 與上下邊界格距離
					let toUp = sliceRangePos-borderCol_up.pos;
					let toDown = sliceRangePos-borderCol_down.pos;
					// 若 離 上邊界格 距離較近
					if (Math.abs(toUp) < Math.abs(toDown)) {
						// 設置 偏移量 與 所屬格 為 上邊界格
						extraCol_parentCol = borderCol_up;
					} else {
						// 設置 偏移量 與 所屬格 為 下邊界格
						extraCol_parentCol = borderCol_down;
					}

				
					// 設置 圖標
					extraCol.symbol = extraCol_parentCol.symbol;

					extraCol.sizeLevel = Math.round(length);

					// 設置 標記
					extraCol.addTag("temp"); // 暫時
					extraCol.addTag("resultable"); // 可被結算

					// 取得中介
					let middle = view.requestMiddle(extraCol);
					// 設置 所屬格、開啟、偏移量、尺寸
					middle.args["activeConflict"] = [extraCol_parentCol.idx];

					// 改 加入新的格資料
					stripData.cols.push(extraCol);

					// 設為 已經畫面中 (直到下次渲染才顯示, 避免突然出現)
					view.setInView(extraCol_idx, true);
					
					// 加入 下一次要銷毀的額外格中
					this._prepareToDestroyExColSet.push({
						middle: middle,
						row: reelIdx,
						reelRow: reelRow,
						col:extraCol_idx
					});
				}
				
				// 若有切出額外格
				if (sliced > 0) {

					// 取得 原本邊界格
					let borderCol = borderCols[idx];
					
					// 暫時移除 可結算 標籤
					borderCol.removeTag("resultable");

					// 取得中介
					let borderCol_middle = view.requestMiddle(borderCol);

					// 標記為關閉 (則離開view後會關閉, 且再次入view時不會顯示)
					borderCol_middle.args["isActive"] = false;

					// 加入 最後一次的邊界格中介
					this._lastBorderMiddle.push(borderCol_middle);
					
				}
			}

			// 設置滾輪表 並 刷新中介
			view.setStrip(stripData);

			// 渲染 (確保 額外格/邊界格 的 InView 有正確更新)
			view.render();

			// 當準備好下一次滾動時 重新打開 邊界格
			gameCtrl.onReadyNextSpin.addOnce(()=>{
				
				for (let each of this._lastBorderMiddle) {
					each.args["isActive"] = true;
				}
				
				view.setStrip(stripData);
			});

		}
		
		// cc.log("=colSlice end===========");

		return data;
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	private _requestColData (row: number, col: number) : ReelColData {
		let res;

		let colsMap;
		if (this._colDataMap.has(row)) {
			colsMap = this._colDataMap.get(row);
		} else {
			colsMap = new Map<number, ReelColData>();
		}

		if (colsMap.has(col)) {
			res = colsMap.get(col);
		} else {
			res = new ReelColData();
			res.idx = col;
			colsMap.set(col, res);
		}

		return res;
	}

}

