import { Mathf } from "../../../Uzil/Uzil";
import { ReelColData, ReelStripData } from "../../Reel/index_Reel";


export class ReelRule {
	
	/** 輪軸 的 每格區塊長度 (供動畫使用) */
	public static reelBlockPerCol : number = 2;

	/** 盤面範圍 */
	public static resultRange : number[][] = [
		[-3, 3],
		[-3, 3],
		[-3, 3],
		[-3, 3],
		[-3, 3],
		[-3, 3]
	];

	/** 取得盤面範圍 */
	public static getResultRange (row: number) : number[] {
		if (row < 0 || row >= this.resultRange.length) return [0, 0];
		return this.resultRange[row];
	}

	/** 取得盤面範圍長度 */
	public static getResultRangeLength (row: number) : number {
		let resultRange = ReelRule.getResultRange(row);
		return Mathf.max(...resultRange) - Mathf.min(...resultRange);
	}

	/**
	 * 取得 盤面結果 在位置上 以 滾輪表 與 停輪位置
	 * @param stripTable 滾輪表
	 * @param stopPosList 停輪位置 e.g. [1,5,13,2,1]
	 */
	public static getResult (stripTable: ReelStripData[], stopPosList: number[]) : ReelColData[][] {
		
		let result : ReelColData[][] = [];

		let resultPosList = ReelRule.resultRange;
		
		// 每一個停輪位置
		for (let row in stopPosList) {

			let stopPosInRow = stopPosList[row];
		
			let resultPosInRow = resultPosList[row];
			
			let resultOfRow : ReelColData[] = [];

			let stripData = stripTable[row];
			
			// 每一個 盤面結果
			for (let resultPos of resultPosInRow) {
				let pos = Mathf.loop(stopPosInRow + resultPos, stripData.min, stripData.max);
				let colOnPos = stripData.getColByTriggerPos(pos)
				if (colOnPos != null) {
					resultOfRow.push(colOnPos);
				}
			}

			let copy = [];
			for (let eachSrc of resultOfRow) {
				copy.push(eachSrc.getCopy());
			}

			result.push(copy);
		}

		return result;
	}

	/**
	 * 取得 盤面結果 在範圍內 以 滾輪表 與 停輪位置
	 * @param stripTable 滾輪表
	 * @param stopPosList 停輪位置 e.g. [1,5,13,2,1]
	 */
	 public static getResultInRange (stripTable: ReelStripData[], stopPosList: number[]) : ReelColData[][] {
		
		let result : ReelColData[][] = [];
		
		let resultRangeList = ReelRule.resultRange;

		// 每一個停輪位置
		for (let row in stopPosList) {

			let stopPosInRow = stopPosList[row];
		
			let resultRange = resultRangeList[row];
			
			let resultOfRow : ReelColData[] = [];

			let stripData = stripTable[row];
			
			resultOfRow = stripData.getColsByTriggerRange(
				stopPosInRow + Mathf.addAbs(resultRange[0], -0.001),
				stopPosInRow + Mathf.addAbs(resultRange[1], -0.001),
				stopPosInRow
			);

			let copy = [];
			for (let eachSrc of resultOfRow) {
				copy.push(eachSrc.getCopy());
			}

			result.push(copy);

		}

		return result;
	}




}