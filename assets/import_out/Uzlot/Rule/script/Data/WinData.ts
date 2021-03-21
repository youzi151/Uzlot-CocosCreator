// 中獎線資料
export class WinData {

    /** 中獎結果代號 (暫) (例如line線號) */
	code : number = 0;
	
    /** 中獎圖標編號 */
    symbol : number = 0;

    /** 中獎圖標有幾個 */
    count : number = 0;

    /** 此中獎線金額 */
    winBonus : number = 0;
    
	/** 路徑 */
    path : Array<any> = [];
    
    /** 取得副本 */
    public getCopy () : WinData {
        let newOne = new WinData();
        newOne.code = this.code;
        newOne.symbol = this.symbol;
        newOne.count = this.count;
        newOne.winBonus = this.winBonus;
        newOne.path = this.path.slice();
        return newOne;
    }
}