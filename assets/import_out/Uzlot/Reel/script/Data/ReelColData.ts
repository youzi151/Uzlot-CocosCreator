import { SymbolCode } from "../../../Rule/index_Rule";


export class ReelColData  {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 序號 */
	public idx : number = null;

	/**	圖標代號 */
	public symbol : SymbolCode = SymbolCode.NONE;

	/** 位置 */
	public pos : number = 0;

	/** 尺寸級別 */
	public sizeLevel : number = 1;
	
	/** 顯示圖層 */
	public displayLayer : number = 0;

	/** 標籤 */
	public tags : Array<string> = [];

	/** 顯示區 相對範圍 */
	// 相對位置 -1, +1...等等
	public displayRange_relative : number[] = [0, 0];

	/** 判定區 相對範圍 */
	// 相對位置 -1, +1...等等
	public triggerRange_relative : number[] = [0, 0];


	/*== Event ====================================================*/

	/*== Public Function ==========================================*/
	
	/** 取得顯示區的實際位置 */
	public getDisplayRange (orinPos: number = null) : Array<number> {
		if (orinPos == null) {
			orinPos = this.pos;
		}
		return [
			orinPos - this.displayRange_relative[0],
			orinPos + this.displayRange_relative[1],
		];
	}
	

	/** 取得觸發區的實際位置 */
	public getTriggerRange (orinPos: number = null) : Array<number> {
		if (orinPos == null) {
			orinPos = this.pos;
		}
		return [
			orinPos - this.triggerRange_relative[0],
			orinPos + this.triggerRange_relative[1],
		];
	}

	/** 取得觸發區總長度 */
	public getTriggerLength () : number {
		return this.triggerRange_relative[0] + this.triggerRange_relative[1];
	}

	/** 取得 副本 */
	public getCopy () : ReelColData {
		let newOne = new ReelColData();
		newOne.idx = this.idx;
		newOne.symbol = this.symbol;
		newOne.pos = this.pos;
		newOne.sizeLevel = this.sizeLevel;
		newOne.displayLayer = this.displayLayer;
		newOne.displayRange_relative = this.displayRange_relative;
		newOne.triggerRange_relative = this.triggerRange_relative;
		newOne.tags = this.tags.slice();
		return newOne;
	}

	/** 新增 標籤 */
	public addTag (...tags: string[]) {
		for (let tag of tags) {
			if (this.tags.indexOf(tag) != -1) return;
			this.tags.push(tag);
		}
	}

	/** 移除 標籤 */
	public removeTag (...tags: string[]) {
		for (let tag of tags) {
			let idx = this.tags.indexOf(tag);
			if (idx == -1) return;
			this.tags.splice(idx, 1);
		}
	}

	/*== Private Function =========================================*/

}
