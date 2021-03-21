
export class SpinResultData {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 總贏分 */
	public totalBonus : number = 0;

	/** 總下注 */
	public totalBet : number = 0;

	/**	當前籌碼 */
	public currentCredit : number = 0;

	/** 結果清單 */
	public resultTable : Map<string, ResultData[]> = new Map<string, ResultData[]>();

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/

	/** 取得主要結果 */
	public getMainResult () : ResultData {
		return this.resultTable.get("main")[0];
	}

	/** 取得FreeGame結果 */
	public getFreeResults () : ResultData[] {
		return this.resultTable.get("free");
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}

/**
 * 每輪轉動的結果
 */
export class ResultData {
	
	/** 停倫位置 */
	stopPosList : number[] = [];
	
	/** 總中獎金額 */
	totalWinBonus : number = 0;

	/** 註記 */
	tags : string[] = [];
	
}