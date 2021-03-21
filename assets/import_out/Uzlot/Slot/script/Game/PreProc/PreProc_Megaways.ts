import { Mathf } from "../../../../../Uzil/Uzil";
import { ResultData } from "../../../../Net/index_Net";
import { ReelColData, ReelStripData } from "../../../../Reel/index_Reel";
import { SymbolCode } from "../../../../Rule/index_Rule";
import { GameCtrl } from "../GameCtrl";
import { SpinPreProc } from "../SpinPreProc";

const {ccclass, property} = cc._decorator;

@ccclass
export class PreProc_Megaways extends SpinPreProc {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	@property()
	public isDebug : boolean = false;

	@property({type:cc.Integer})
	public targetReelIdxs : number[] = [0, 1, 2, 3, 4];
	
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
		let result : ResultData = data["result"];
		let reelCtrl = gameCtrl.reelCtrl;

		// 原始滾輪表
		let stripTable_src : ReelStripData[] = gameCtrl.stripTable;
		
		//=====================================

		// cc.log("=megaways start===========");

		// 取得結果 =======================

		// 每輪路數
		let ways = result["ways"];
		if (!ways) return;

		// 停輪位置
		let stopPosList = result.stopPosList;

		// 改造滾輪表 =====================

		// 新的滾輪表
		let newStripTable = [];

		// 每輪
		for (let idx = 0; idx < this.targetReelIdxs.length; idx++) {
			
			let row = this.targetReelIdxs[idx];
			
			let debugRow = row+1;
			
			let reelRow = reelCtrl.reelContainer.getReel(row).getReelRow();
			let resultRange = reelRow.getResultRange();
			let resultRangeLength = reelRow.getResultRangeLength();

			// 來源滾輪表
			let srcStripData = stripTable_src[row];
			// 新的滾輪表
			let newStripData = new ReelStripData();

			// 重建停輪位置
			result.stopPosList = result.stopPosList.slice();

			// 來源滾輪表的所有格
			let srcCols = srcStripData.cols;
			// 新建立的格
			let newCols = [];

			// way數量
			let wayCount = ways[row];
			// 停輪位置
			let stopPos = stopPosList[row];

			// 格尺寸
			let colSizeLevel = resultRangeLength / wayCount;
			// 半徑
			let colSizeLevel_half = colSizeLevel / 2;

			// 重建的當前位置
			let refactorPos = srcStripData.min;

			// 取得 要改造的盤面格 =========
			let resultCols = [];

			// 停輪位置 的 鄰近格
			let nearCols = srcStripData.getColsByTriggerPos(stopPos + 0.0001/* 避免界線 */);
			let nearColAndDelta : {col: ReelColData, delta: number}[] = [];
			nearCols.forEach((each)=>{
				let delta = Math.abs(Mathf.minAbs(...Mathf.getOffsetsLoop(stopPos, each.pos, srcStripData.min, srcStripData.max)));
				nearColAndDelta.push({col:each, delta:delta});
			});		
			// 依照距離排序 取出 最近格
			nearColAndDelta.sort((a, b)=>{
				return a.delta - b.delta;
			})
			let nearestCol = nearColAndDelta[0].col;

			// 取得 停輪位置 相對百分比
			let nearestColRange = nearestCol.getTriggerRange();
			let colUpToStopPos = Mathf.getOffsetsLoop(nearestColRange[0], stopPos, srcStripData.min, srcStripData.max)[1];
			let percentPosInColRange = colUpToStopPos / nearestCol.getTriggerLength();

			let wayHalf = wayCount / 2; 
			let colCount_back = - Math.floor(wayHalf);
			let colCount_forward = Math.ceil(wayHalf);
		
			// 取 前後各格
			for (let i = colCount_back; i < colCount_forward; i++) {
				let idx = Mathf.loop(nearestCol.idx + i, 0, srcStripData.cols.length);
				resultCols.push(idx);
			}

			// cc.log("row("+(row+1)+"): resultCols:",resultCols);

			// 重新改造 滾輪表==============

			// 每格 滾輪表中的所有格
			for (let col = 0; col < srcCols.length; col++) {

				let srcCol = srcCols[col];
				let newCol = srcCol.getCopy();

				// 若在改造範圍中
				if (resultCols.indexOf(srcCol.idx) != -1) {
					newCol.sizeLevel = colSizeLevel;
					newCol.triggerRange_relative = [colSizeLevel_half, colSizeLevel_half];
					newCol.displayRange_relative = [colSizeLevel_half, colSizeLevel_half];	
				}

				// 設置 重建位置 與 該格位置
				refactorPos += newCol.triggerRange_relative[0];
				newCol.pos = refactorPos;
				refactorPos += newCol.triggerRange_relative[1];
				
				newCols.push(newCol);
			}

			newStripData.setCols(newCols);

			newStripTable.push(newStripData);

			
			// 移轉當前位置 =====

			// 當前位置
			let currentPos = reelRow.currentPos;

			
			// 取得當前格位置 的 下一個要顯示的格

			// 顯示範圍內的格
			let currentResultCols = srcStripData.getColsByTriggerRange(
				currentPos+Mathf.addAbs(resultRange[0], -0.0001),
				currentPos+Mathf.addAbs(resultRange[1], -0.0001)
			);
			// 排除未顯示
			currentResultCols = currentResultCols.filter((each)=>{
				let middle = reelRow.view.getMiddle(each.idx);
				return middle.isAnyObjActive();
			});
			
			// 暫時格 (已顯示的)
			let currentTempCols = reelRow.view.getTempColInfos().map((info)=>{
				if (info.isDisplay) return info.middle.data;
				else return null;
			}).filter((each)=>{ return each != null; });

			// 加入 暫時格
			currentResultCols = currentResultCols.concat(currentTempCols);

			// 取 當前位置 到 上緣 的 偏移距離
			let currentResultColAndOffsets : {col: ReelColData, offset: number}[] = [];
			currentResultCols.forEach((each)=>{
				let offset = Mathf.minAbs(...Mathf.getOffsetsLoop(currentPos, each.getTriggerRange()[0], srcStripData.min, srcStripData.max));
				currentResultColAndOffsets.push({
					col:each, offset:offset
				});
			})
			// 由小到大 排序
			currentResultColAndOffsets.sort((a, b)=>{
				return a.offset - b.offset;
			});

			// 偏移量 最小(最負數)的 為 最後一格
			let lastResultCol = currentResultColAndOffsets[0].col;
			// 最後一格的上緣
			let lastResultUpper = lastResultCol.getTriggerRange()[0];
			// 最後一格的上緣 到 當前位置上緣 距離
			let lastResultUpperOffsets = Mathf.getOffsetsLoop(
				lastResultUpper, currentPos + resultRange[0], srcStripData.min, srcStripData.max
			);
			
			// 最新一個要顯示的 為 最後一格 的 往前一格
			let newestColInCurrentIdx = Mathf.loop(lastResultCol.idx - 1, 0, srcStripData.cols.length);
			// 從新的滾輪表中 取出 與 舊滾輪表中 最新一個要顯示的格序號 相同 的 格
			let newestColInNew = newStripData.getColByIdx(newestColInCurrentIdx);

			// 改位置為 下一個要顯示的格 的 下緣 的 前半個盤面位置
			let newPos = Mathf.loop(newestColInNew.getTriggerRange()[1] + resultRange[1], newStripData.min, newStripData.max);

			// 加上原有偏移
			newPos = Mathf.loop(newPos + lastResultUpperOffsets[1], newStripData.min, newStripData.max);

			// 轉移位置 與 設置新滾輪表
			reelRow.shift(newPos, {
				stripData: newStripData
			});


			// 重設 停輪位置======

			// 新的停輪位置
			let nearestColInNew = newCols[nearestCol.idx];
			let newStopPos = nearestColInNew.getTriggerRange()[0] + (percentPosInColRange*nearestColInNew.getTriggerLength());
			result.stopPosList[row] = newStopPos;
			
		}

		return data;
		
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}

