import { Mathf } from "../../../../Uzil/Uzil";
import { ReelColData } from "./ReelColData";


export class ReelStripData  {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 格 資料 */
	public get cols () : ReelColData[] {
		return this._cols;
	};
	private _cols : ReelColData[] = [];

	/** 總長度 */
	public get totalLength () : number {
		return this._totalLength;
	};
	private _totalLength : number = 0;

	/** 最小位置 */
	public get min () : number {
		return this._min;
	};
	private _min : number = null;

	/** 最大位置 */
	public get max () : number {
		return this._max;
	};
	private _max : number = null;

	/** 範圍 */
	public get loopRange () : number[] {
		return this._loopRange;
	};
	private _loopRange : number[] = [0, 0]

	/** 每格區塊大小 */
	public blockPerCol_forAnim : number = 1;

	/** 範圍查詢快取 */
	public triggerRangeCache = {};
	public triggerPosCache = {};

	/*== Event ====================================================*/

	/*== Public Function ==========================================*/

	/** 取得 副本 */
	public getCopy () : ReelStripData {
		let newOne = new ReelStripData();
		newOne._cols = this._cols.map((each)=>{
			return each.getCopy();
		});
		newOne._totalLength = this._totalLength;

		newOne._min = this._min;
		newOne._max = this._max;
		newOne._loopRange = this._loopRange;

		newOne.blockPerCol_forAnim = this.blockPerCol_forAnim;
		return newOne;
	}
	
	/** 設置 格資料 */
	public setCols (cols: ReelColData[]) {

		this._cols = cols;
		
		if (this._cols.length <= 0) return;

		this._min = null;
		this._max = null;

		// 從 每個 格資料 的 顯示範圍,觸發範圍 取得 最小與最大位置
		for (let each of this._cols) {

			let min = each.pos;
			let max = each.pos;

			let displayRange = each.getDisplayRange();
			if (displayRange[0] < min) min = displayRange[0];
			if (displayRange[1] > max) max = displayRange[1];

			let triggerRange = each.getTriggerRange();
			if (triggerRange[0] < min) min = triggerRange[0];
			if (triggerRange[1] > max) max = triggerRange[1];

			if (this._min == null || min < this._min) this._min = min;
			if (this._max == null || max > this._max) this._max = max;
		}

		// 總長度
		this._totalLength = this._max - this._min;

		this._loopRange = [this._min, this._max];
	}

	/** 取得 格 */
	public getColByIdx (idx: number) {
		for (let each of this._cols) {
			if (each.idx == idx) return each;
		}
		cc.error("getColByIdx FIALED:",idx, this._cols)
		return null;
	}

	/** 取得 格 以 位置 與 顯示範圍 */
	public getColByDisplayPos (pos: number, firstCheck: ReelColData[] = null) : ReelColData {
		let res = this.getColsByDisplayPos(pos, firstCheck);
		if (res.length == 0) return null;
		return res[0];
	}
	public getColsByDisplayPos (pos: number, firstCheck: ReelColData[] = null) : ReelColData[] {
		pos = Mathf.loop(pos, this.min, this.max);

		let checked = [];
		let result = [];

		
		// 設置 檢查行為
		let check = (list: ReelColData[])=>{

			// 每個要檢查的
			for (let each of list) {

				// 若 已在結果中 或 檢查過 則 忽略
				if (result.indexOf(each) != -1) continue;
				if (checked.indexOf(each) != -1) continue;

				// 若 檢查對象的位置 剛好在 指定位置 上
				let displayRange = each.getDisplayRange();
				
				// 若 指定位置 在 檢查對象的範圍 中 則
				if (Mathf.isInRangeLoop(pos, displayRange, [this.min, this.max])) {
					// 加入結果
					result.push(each);
				}

				// 已檢查過
				checked.push(each);
			}
		}

		// 若 優先檢查列表 存在 則 檢查
		if (firstCheck != null) {
			check(firstCheck);
		}

		// 檢查 所有格
		check(this._cols);
		
		// 快取 搜尋條件 與 結果
		return result;
	}

	/** 取得 格 以 位置 與 觸發範圍 */
	public getColByTriggerPos (pos: number, firstCheck: ReelColData[] = null) : ReelColData {
		let res = this.getColsByTriggerPos(pos, firstCheck);
		if (res.length == 0) return null;
		return res[0];
	}
	public getColsByTriggerPos (pos: number, firstCheck: ReelColData[] = null) : ReelColData[] {
		let cache = this.triggerPosCache[pos];
		if (cache != null) {
			return cache;
		}

		pos = Mathf.loop(pos, this.min, this.max);

		let checked = [];
		let result = [];

		// 設置 檢查行為
		let check = (list: ReelColData[])=>{
			
			// 每個要檢查的
			for (let each of list) {
	
				// 若 已在結果中 或 檢查過 則 忽略
				if (result.indexOf(each) != -1) continue;
				if (checked.indexOf(each) != -1) continue;

				// 若 檢查對象的位置 剛好在 指定位置 上
				if (each.pos == pos) {
					// 加入結果
					result.push(each);

				}
				// 否則
				else {

					// 取得 檢查對象的範圍
					let triggerRange = each.getTriggerRange();

					// 若 指定位置 在 檢查對象的範圍 中 則
					if (Mathf.isInRangeLoop(pos, triggerRange, [this.min, this.max])) {
						// 加入結果
						result.push(each);
					}

				}

				// 已檢查過
				checked.push(each);
			}
		}

		// 若 優先檢查列表 存在 則 檢查
		if (firstCheck != null) {
			check(firstCheck);
		}
	
		// 檢查 所有格
		check(this._cols);

		// 快取 搜尋條件 與 結果
		this.triggerPosCache[pos] = result;

		return result;
	}
	
	/** 取得 格 以 範圍 與 觸發範圍 */
	public getColsByTriggerRange (start: number, end: number, basePosForSort: number = null) : ReelColData[] {
		// let key = start.toString()+"-"+end.toString();
		// let cache = this.triggerPosCache[key];
		// if (cache != null) {
		// 	return cache;
		// }
		
		let result = [];

		// 每個要檢查的
		for (let eachColData of this._cols) {

			// 若 已在結果中 或 檢查過 則 忽略
			if (result.indexOf(eachColData) != -1) continue;

			// 若 檢查對象的位置 剛好在 範圍線上
			if (eachColData.pos == start || eachColData.pos == end) {

				result.push(eachColData);
			}
			// 否則
			else {

				// 取得 檢查對象的範圍
				let triggerRange = eachColData.getTriggerRange();
				
				// 若 檢查對象的範圍 與 指定範圍 相交 則
				if (Mathf.isRangeIntersectLoop([start, end], triggerRange, this.loopRange)) {
					// 加入結果
					result.push(eachColData);
				}

			}
		}

		// 若存在 排序用基本位置 則 排序
		if (basePosForSort != null) {

			// 格序號 : 最近距離的偏移
			let colIdx2NearestOffset = new Map<number, number>();
			
			for (let each of result) {
				// 尋找最近距離的偏移
				let distances : number[] = Mathf.getOffsetsLoop(basePosForSort, each.pos, this.min, this.max);
				let distance = Mathf.minAbs(...distances);

				colIdx2NearestOffset.set(each.idx, distance);
			}

			// 以 最近距離的偏移 排序
			result.sort((a, b)=>{
				return colIdx2NearestOffset.get(a.idx) - colIdx2NearestOffset.get(b.idx);
			});
		}

		// 快取 搜尋條件 與 結果
		// this.triggerRangeCache[key] = result;
		
		return result;
	}

	/*== Private Function =========================================*/

}
