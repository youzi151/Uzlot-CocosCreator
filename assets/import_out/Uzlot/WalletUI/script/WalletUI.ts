import { i18nLabelExt } from "../../Uzil/Uzil";

const {ccclass, property} = cc._decorator;

@ccclass
export class WalletUI extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 可用分數 */
	@property(i18nLabelExt)
	public balance_title : i18nLabelExt = null;
	@property(cc.Label)
	public balance_value : cc.Label = null;

	/** 贏分 */
	@property(i18nLabelExt)
	public win_title : i18nLabelExt = null;
	@property(cc.Label)
	public win_value : cc.Label = null;

	/** 總押注 */
	@property(i18nLabelExt)
	public bet_title : i18nLabelExt = null;
	@property(cc.Label)
	public bet_value : cc.Label = null;

	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {
		
	}

	update (dt) {
		
		
	}

	
	/*== Public Function ==========================================*/

	/** 設置 可用分數 */
	public setBalance (val: number) : void {
		this.balance_value.string = val.toString();
	}
	
	/** 設置 贏分 */
	public setWin (val: number) : void {
		this.win_value.string = val.toString();
	}

	/** 設置 總押注 */
	public setBet (val: number) : void {
		this.bet_value.string = val.toString();
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

