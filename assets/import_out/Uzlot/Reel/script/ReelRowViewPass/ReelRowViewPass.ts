
const {ccclass, property} = cc._decorator;

@ccclass
export class ReelRowViewPass extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** ID */
	@property()
	public passID : string = "";

	/** 是否啟用 */
	@property()
	public isEnabled : boolean = true;

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	// start () {}

	// update (dt) {}

	
	/*== Public Function ==========================================*/

	/**
	 * 通過通道
	 * @param passArgs 參數
	 */
	public pass (passArgs: any) : any {
		if (this.isEnabled) {
			return this._pass(passArgs);
		} else {
			return passArgs;
		}
	}
	
	/*== Protected Function =======================================*/

	protected _pass (args: any) : any {

	}

	/*== Private Function =========================================*/


}

