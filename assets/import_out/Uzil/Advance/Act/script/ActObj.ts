import { Event } from "../../../../Uzil/Uzil";

const {ccclass, property} = cc._decorator;


@ccclass
export class ActObj extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 辨識 */
	@property()
	public id : string = "";

	/** 是否播放中 */
	public isPlaying : boolean = false;
	
	/*== Event ====================================================*/

	/** 當 播放結束 */
	public onDone : Event = new Event();

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

	}

	/** 停止 */
	public stop (args: any = null) : void {
		
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}