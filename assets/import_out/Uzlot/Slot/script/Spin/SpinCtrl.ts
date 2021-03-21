import { Event, StateCtrl } from "../../../../Uzil/Uzil";
import { GameCtrl, SpinUI } from "../../index_Slot";

const {ccclass, property} = cc._decorator;

@ccclass
export class SpinCtrl extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 狀態 控制 */
	@property(StateCtrl)
	public stateCtrl : StateCtrl = null;

	/** 遊戲 控制 */
	public gameCtrl : GameCtrl = null;

	/* UI */
	@property(SpinUI)
	public spinUI : SpinUI = null;

	private _isTurboOn : boolean = false;

	/*== Event ====================================================*/

	/** 當 滾動 */
	public onSpin : Event = new Event();

	/** 當 停輪 */
	public onStop : Event = new Event();

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		let self = this;

		// 初始化 狀態控制
		self.stateCtrl.init(self);
	}

	start () {
		
	}

	update (dt) {
		
		
	}

	/*== Event Function ===========================================*/
	
	/*== Public Function ==========================================*/
	

	/** 滾動 */
	public spin () : void {
		this.onSpin.call();
	}

	/** 停輪 */
	 public stop () : void {
		this.onStop.call();
	}

	/**
	 * 鎖住操作
	 * @param options 
	 */
	 public lockInput (options: {with?:string[], without?:string[], all?:boolean}, user: string = null, priority: number = 0) : void {
		 this.spinUI.lockInput(options, user, priority);
	}

	
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

