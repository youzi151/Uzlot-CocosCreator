import { Comparer } from "../../../../Uzil";

// ===================================================
// 動畫條件
// 
// 功能：
// 1.條件判定
// 

export class AnimCondition {
	
	/*== Constructor ==============================================*/

	/**
	 * 建構子
	 * @param key 要比對的變數的鍵值
	 * @param comparer 比較子
	 * @param val 比較值
	 */
	constructor (key: string, comparer: string, val: any) {
		this.parameterKey = key;
		this.comparer = comparer;
		this.toCompare = val;
	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 比較數值 */
	public toCompare : any = 0;

	/** 比較運算 */
	public comparer : string = Comparer.EQUAL;

	/** 要比較的變數 */
	public parameterKey : string = "";
	
	/*== Event ====================================================*/

	/*== Public Function ==========================================*/
	
	/**
	 * 是否通過
	 * @param parameter 要被比較的參數集
	 */
	public isPass (parameter: Object) : boolean {
		let key = this.parameterKey;
		if (!key || key == "") return false; 
		let param = parameter[key];
		// cc.log("param["+param+"]  "+this.comparer+"  tocompare["+this.toCompare+"] ? ");
		if (param == null || param == undefined) return false;
		
		let res = this._compare(param, this.toCompare, this.comparer);
		return res;
	}

	/*== 基本功能 =================*/

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

	/** 比較 */
	protected _compare(a: any, b: any, comparer: string) {
		switch (comparer) {
			case Comparer.EQUAL:
				return a == b || JSON.parse(a) == JSON.parse(b);
			case Comparer.NOT_EQUAL:
				return a != b || JSON.parse(a) != JSON.parse(b);;
			case Comparer.GREATER:
				return a > b;
			case Comparer.GREATER_EQUAL:
				return a >= b;
			case Comparer.LESS:
				return a < b;
			case Comparer.LESS_EQUAL:
				return a <= b;
		}
		return false;
	}

}
