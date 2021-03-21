import { ActObj } from "../../index_Act";
import { Animator } from "../../../../Uzil";

const {ccclass, property} = cc._decorator;

@ccclass
export class ActObj_Anim extends ActObj {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	
	/** 動畫 */
	@property(Animator)
	public anim : Animator = null;
	
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

		let self = this;

		self.anim.onComplete.addOnce(()=>{
			self.stop();
		}).name(this.id+"_anim_OnComplete");

	}

	/** 停止 */
	public stop () : void {
		if (!this.isPlaying) return;
		this.isPlaying = false;
		
		this.anim.onComplete.remove(this.id+"_anim_OnComplete");

		this.onDone.call();
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	

}