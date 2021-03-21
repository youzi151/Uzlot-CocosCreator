import { ActObj } from "../../../Uzil/Uzil";
import { ReelColObj } from "../../Reel/index_Reel";

const {ccclass, property} = cc._decorator;

@ccclass
export class ActObj_SymbolBlink extends ActObj {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 閃爍頻率 */
	public blinkFrequency_sec : number = 0.3;
	private _time : number = 0;

	private _colObj : ReelColObj = null;

	private _isShow : boolean = true;
	
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
		if (!this.isPlaying) return;

		this._time += dt;
		
		if (this._time > this.blinkFrequency_sec) {

			this._time = 0;
			this._isShow = !this._isShow;
			
			if (this._colObj != null) {
				this._colObj.setSpriteActive(this._isShow, "ActObj_SymbolBlink", 10);
			}
		}
		
	}
	
	/*== Public Function ==========================================*/

	/** 演出 */
	public play (args: any = null) : void {
		if (this.isPlaying) return;
		this.isPlaying = true;

		this._time = 0;
		
		if (this._colObj != null) {
			this._isShow = this._colObj.sprite.node.active;
		}

	}

	/** 停止 */
	public stop () : void {
		if (!this.isPlaying) return;
		this.isPlaying = false;
		
		if (this._colObj != null) {
			this._colObj.setSpriteActive(null, "ActObj_SymbolBlink");
		}

		this._time = 0;
		this._isShow = true;

		this.onDone.call();
	}

	/** 設置 要演出的 圖標格物件 */
	public setColObj (colObj: ReelColObj) {
		this._colObj = colObj;
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	

}