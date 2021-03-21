import { Mathf, RandomRange, UniqID } from "../../../../Uzil/Uzil";
import { ReelColData, ReelStripData } from "../../../Reel/index_Reel";

export class SlotUtil {

	/**
	 * 取得隨機停輪位置
	 * @param stripTable 
	 */
	public static getRandomStopPos (stripTable: ReelStripData[]) : number[] {

		let stopCols = []

		for (let idx = 0; idx < stripTable.length; idx++) {	
			let reelStrip = stripTable[idx];
			let random = new RandomRange(0, reelStrip.cols.length-1).getInt();
			stopCols.push(reelStrip.cols[random].pos);
		}

		return stopCols;
	}

	/**
	 * 請求 額外格序號
	 * @param reelIdx 輪軸序號
	 */
	public static requestExColIdx (reelIdx: number) : number {
		let raw = UniqID.get("exCol_reel_"+reelIdx).request();
		let res = -1 + ( raw * -1);
		return res;
	}

	/**
	 * 回收 額外格序號
	 * @param reelIdx 輪軸序號
	 */
	public static recoveryExColIdx (reelIdx: number, idx: number) {
		let toRelease = (idx+1) * -1;
		let uniqID = UniqID.get("exCol_reel_"+reelIdx);
		uniqID.release(toRelease);
	}

	/** 取得盤面結果副本 */
	public static getReelResultCopy (reelResult: ReelColData[][]) {
		let newOne = [];
		for (let row of reelResult) {
			let newOneInRow = [];
			for (let col of row) {
				newOneInRow.push(col.getCopy());
			}
			newOne.push(newOneInRow);
		}
		return newOne;
	}


	/**
	 * 取得切割資訊
	 * @param stripRange_minMax 滾輪表範圍
	 * @param viewRange_minMax 顯示範圍(切割界線)
	 * @param colDatas 格資料
	 */
	public static getColSliceInfo (stripRange_minMax: number[], viewRange_minMax:number[], _colDatas: ReelColData | ReelColData[]) : number[][] | number[][][] {
		let strip_min = stripRange_minMax[0];
		let strip_max = stripRange_minMax[1];
		let strip_length = strip_max - strip_min;
		
		let view_min = viewRange_minMax[0];
		let view_max = viewRange_minMax[1];

		let res = [];
		let colDatas =  Array.isArray(_colDatas) ? _colDatas : [_colDatas];

		for (let colData of colDatas) {

			let colTrigger = colData.getTriggerRange();
			let col_min = colTrigger[0];
			let col_max = colTrigger[1];
			
			let cut_min = view_min;
			let cut_max = view_max;

			let eachRes = [];

			// 若 迴圈範圍 重疊
			if (Mathf.isRangeIntersectLoop(colTrigger, [cut_min, cut_max], [strip_min, strip_max])) {

				// 切割範圍
				eachRes = Mathf.sliceRange(col_min, col_max, cut_min, cut_max);
				
				// 若結果為0 則 依照 切割起點 與 目標格起點 的 關係
				if (eachRes.length == 0) {
					// 若 切割起點 < 目標格起點
					if (cut_min < col_min) {
						// 切割範圍 推進 總長度後 重新切割
						eachRes = Mathf.sliceRange(col_min, col_max, cut_min+strip_length, cut_max+strip_length);
					} else if (cut_min > col_min) {
						// 切割範圍 後退 總長度後 重新切割
						eachRes = Mathf.sliceRange(col_min, col_max, cut_min-strip_length, cut_max-strip_length);
					}
				}
				
			}

			
			res.push(eachRes);

		}

		// 若 無結果
		if (res.length == 0) return null;

		// 若只有一個結果
		if (res.length == 1) return res[0];

		return res;
	}

}