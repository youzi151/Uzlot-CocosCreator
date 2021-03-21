import { Event, Invoker } from "../../../Uzil/Uzil";

const {ccclass, property} = cc._decorator;

@ccclass
export class PauseResumeTool extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	@property(cc.Node)
	public resumeBtnNode : cc.Node = null;

	/*== Event ====================================================*/

	public static onStep : Event = new Event();
	public static onResume : Event = new Event();
	public static onPause : Event = new Event();
	public static onKeyDown : Event = new Event();

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		let self = this;

		this.resumeBtnNode.active = false;

		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (evt)=>{

			if (evt.keyCode == cc.macro.KEY.t) {
				self.step();
			}

			if (evt.keyCode == cc.macro.KEY.r) {
				if (cc.director.isPaused()) {
					self.resume();
				} else {
					self.pause();
				}
			}

			PauseResumeTool.onKeyDown.call(evt.keyCode);
		});
	}

	start () {
		
	}

	update (dt) {
		
		
	}

	
	/*== Public Function ==========================================*/

	/** 暫停 */
	public pause () : void {
		cc.director.pause();
		if (this.resumeBtnNode) this.resumeBtnNode.active = true;
		PauseResumeTool.onPause.call();
	}

	/** 復原 */
	public resume () : void {
		cc.director.resume();
		if (this.resumeBtnNode) this.resumeBtnNode.active = false;
		PauseResumeTool.onResume.call();
	}

	/** 暫停 */
	public step () : void {
		cc.director.resume();
		if (this.resumeBtnNode) this.resumeBtnNode.active = true;
		Invoker.once(()=>{
			cc.director.pause();
		}, 0);
		PauseResumeTool.onStep.call();
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

