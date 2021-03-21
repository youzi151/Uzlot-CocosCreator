import { Animator, ActObj } from "../../../Uzil/Uzil";
import { ReelColObj } from "../../Reel/index_Reel";

const {ccclass, property} = cc._decorator;

@ccclass
export class ActObj_SymbolAnim extends ActObj {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 動畫 */
	@property(Animator)
	public anim : Animator = null;

	/** 動畫狀態名稱 */
	public animStateName : string = "default";

	private _colObj : ReelColObj = null;
	
	/*== Event ====================================================*/

	/** 當XX */
	// public onXX : Event = new Event();
	
	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {

	}

	start () {
		
	}

	update (dt) {
		
	}
	
	/*== Public Function ==========================================*/

	/** 演出 */
	public play (args: any = null) : void {
		if (this.isPlaying) return;
		this.isPlaying = true;

		if (this._colObj != null) {
			
			this._colObj.goAnim(this.animStateName);

		}

	}

	/** 停止 */
	public stop () : void {
		if (!this.isPlaying) return;
		this.isPlaying = false;
		
		if (this._colObj != null) {
			
			this._colObj.goAnim(null);
			
		}

		this.onDone.call();
	}

	/** 設置 要演出的 圖標格物件 */
	public setColObj (colObj: ReelColObj) {
		this._colObj = colObj;
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	

}