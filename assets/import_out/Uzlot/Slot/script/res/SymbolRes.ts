import { SymbolCode } from "../../../Rule/index_Rule";

const {ccclass, property} = cc._decorator;

/** 提供介面設置 */
@ccclass('SymbolResEach')
class SymbolResEach {
	/** 代號 */
	@property({type:cc.Enum(SymbolCode)})
	public symbol : SymbolCode = SymbolCode.NONE;

	/** 圖片 */
	@property()
	public spriteID : string = "";
}

@ccclass
export class SymbolRes extends cc.Component {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	public static instance = null;
	public static Get (symbol: SymbolCode) : string {
		if (SymbolRes.instance == null) return null;
		if (symbol == SymbolCode.NONE) return null;

		let symRes = SymbolRes.instance;

		return symRes.get(symbol);
	}

	/*== Member ===================================================*/

	/** 欲設置的圖標代號與圖標ID */
	@property(SymbolResEach)
	public symbols : SymbolResEach[] = [];

	/** 註冊資訊 */
	private _symbol2spID : Map<SymbolCode, string> = new Map<SymbolCode, string>();

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/
	
	onLoad () {
		if (SymbolRes.instance == null) {
			SymbolRes.instance = this;
		}

		let symRes = SymbolRes.instance;

		// 註冊
		for (let each of this.symbols) {

			if (each.symbol == SymbolCode.NONE) continue;

			// 多語系 讀取
			symRes._symbol2spID.set(each.symbol, each.spriteID);
			// cc.log("[SymbolRes]: reg:",each.symbol," with ",each.spriteID);
		}

		// cc.log("[SymbolRes]: inited.");
	}

	/*== Public Function ==========================================*/
	
	/*== 基本功能 =================*/

	/** 取得圖標 */
	public get (symbol: SymbolCode) : string {
		let symRes = SymbolRes.instance;

		if (symRes._symbol2spID.has(symbol) == false) {
			return null;
		}

		return symRes._symbol2spID.get(symbol);
	}

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

}
