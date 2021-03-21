import { ActObj } from "../../index_Act";
import { Invoker } from "../../../../Uzil";

const {ccclass, property} = cc._decorator;

@ccclass
export class ActObj_Test extends ActObj {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	
	/** 訊息 */
	@property()
	public msg : string = "";
	
	/** 等待時間 */
	@property()
	public waitTime : number = 1;
	
	private _invokerTask : any = null;

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

	onDestroy () {
		Invoker.cancel(this._invokerTask);
	}
	
	/*== Public Function ==========================================*/

	/** 演出 */
	public play (args: any = null) : void {
		if (this.isPlaying) return;
		this.isPlaying = true;
		
		let self = this;

		let playTime = this.waitTime;
		if (args != null && args["playTime"] != null) {
			playTime = args["playTime"];
		}

		cc.log(this.msg);

		this._invokerTask = Invoker.once(()=>{
			self.stop();
		}, playTime);
	}

	/** 停止 */
	public stop () : void {
		if (!this.isPlaying) return;
		this.isPlaying = false;
		
		this.onDone.call();
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	

}