import { Mathf } from "../../../../../Uzil/Uzil";
import { ReelStripData } from "../../../../Reel/index_Reel";
import { GameCtrl } from "../GameCtrl";
import { SpinPreProc } from "../SpinPreProc";

const {ccclass, property} = cc._decorator;

@ccclass
export class PreProc_Reset extends SpinPreProc {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	@property({type:cc.Integer})
	public targetReelIdxs : number[] = [0, 1, 2, 3, 4];

	private _lastStripData : ReelStripData = null;
	
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
	public process (data: Object) {

		if (this.isEnabled == false) return;
		
		// 準備資料 ===========================

		let gameCtrl : GameCtrl = data["gameCtrl"];
		
		let reelCtrl = gameCtrl.reelCtrl;

		// 原始滾輪表
		let stripTable_src : ReelStripData[] = gameCtrl.stripTable;
		
		//=====================================

		// cc.log("=RESET StripData===========");

		// 取得結果 =======================

		let currentStripTable = reelCtrl.getStrip();

		// 復原滾輪表 =====================

		// 每輪
		for (let idx = 0; idx < this.targetReelIdxs.length; idx++) {
			
			let row = this.targetReelIdxs[idx];

			let reelRow = reelCtrl.reelContainer.getReel(row).getReelRow();

			let resultRange = reelRow.getResultRange();
			
			// 當前滾輪表
			let currentStripData = currentStripTable[row];
			if (currentStripData == this._lastStripData) continue;

			// 來源滾輪表
			let srcStripData = stripTable_src[row];
			let newStripData = srcStripData.getCopy();
			this._lastStripData = newStripData;
			
			// 移轉當前位置 =====

			// 當前位置
			let currentPos = reelRow.currentPos;

			// 取得當前格位置 的 下一個要顯示的格
			let currentResultCols = currentStripData.getColsByTriggerRange(
				currentPos+Mathf.addAbs(resultRange[0], -0.0001), 
				currentPos+Mathf.addAbs(resultRange[1], -0.0001)
			);
			// 排除未顯示
			currentResultCols = currentResultCols.filter((each)=>{
				let middle = reelRow.view.getMiddle(each.idx);
				return middle.isAnyObjActive();
			});

			// 暫存格 (已經顯示的)
			let currentTempCols = reelRow.view.getTempColInfos().map((info)=>{
				if (info.isDisplay) return info.middle.data;
				else return null;
			}).filter((each)=>{ return each != null; });
			
			// 加入 暫時格
			currentResultCols = currentResultCols.concat(currentTempCols);


			let currentResultCol_sort = [];

			// 取 當前位置 到 上緣 的 偏移距離
			currentResultCols.forEach((each, idx)=>{
				let offset = Mathf.minAbs(...Mathf.getOffsetsLoop(currentPos, each.getTriggerRange()[0], currentStripData.min, currentStripData.max));
				currentResultCol_sort.push({
					col:each, offset:offset
				});
			})
			
			// 由小到大 排序
			currentResultCol_sort.sort((a, b)=>{
				return a.offset - b.offset;
			});

			// 偏移量 最小(最負數)的 為 最後一格
			let lastResultCol = currentResultCol_sort[0].col;
			// 最後一格的上緣
			let lastResultUpper = lastResultCol.getTriggerRange()[0];
			// 最後一格的上緣 到 當前位置上緣 距離
			let lastResultUpperOffsets = Mathf.getOffsetsLoop(lastResultUpper, currentPos + resultRange[0], currentStripData.min, currentStripData.max);

			// 最新一個要顯示的 為 最後一格 的 往前一格
			let newestColInCurrentIdx = Mathf.loop(lastResultCol.idx - 1, 0, currentStripData.cols.length);
			// 從新的滾輪表中 取出 與 舊滾輪表中 最新一個要顯示的格序號 相同 的 格
			let newestColInNew = srcStripData.getColByIdx(newestColInCurrentIdx);

			// 改位置為 下一個要顯示的格 的 下緣 的 前半個盤面位置
			let newPos = Mathf.loop(newestColInNew.getTriggerRange()[1] + resultRange[1], srcStripData.min, srcStripData.max);

			// 加上原有偏移
			newPos = Mathf.loop(newPos + lastResultUpperOffsets[1], srcStripData.min, srcStripData.max);
		

			// 轉移位置 與 設置新滾輪表
			reelRow.shift(newPos, {
				stripData: newStripData
			});

		}
			
		return data;
		
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}

