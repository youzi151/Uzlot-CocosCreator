import { ActObj } from "../../index_Act";
import { Async } from "../../../../Uzil";

const {ccclass, property} = cc._decorator;

@ccclass
export class ActObj_Group extends ActObj {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 演出成員 */
	@property(ActObj)
	public acts : ActObj[] = [];
	
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

		Async.each(
			self.acts, 
			(each: ActObj, next)=>{
				each.play();
				each.onDone.addOnce(next).name(self.id+"_onDone");
			}, 
			(err)=>{
				self.stop();
			}
		);
	}

	/** 停止 */
	public stop (args: any = null) : void {
		if (!this.isPlaying) return;
		this.isPlaying = false;

		let self = this;

		self.acts.forEach((each)=>{
			each.stop();
			each.onDone.remove(self.id+"_onDone");
		});
		
		this.onDone.call();
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}