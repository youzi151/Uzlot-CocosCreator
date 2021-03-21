import { Animator, Event } from "../../../Uzil/Uzil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FeatureGameFadePanel extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 任務列表 */
	@property(cc.Node)
	public targetNode : cc.Node = null;

	@property(Animator)
	public animator : Animator = null;

	private _eventName : string = "FeatureGameFadePanel";
	
	/*== Event ====================================================*/

	/** 當顯示 */
	public onShow : Event = new Event();

	/** 當隱藏 */
	public onHide : Event = new Event();

	/** 當點擊 */
	public onClick : Event = new Event();

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		this.targetNode.active = false;
	}

	start () {
		
	}

	update (dt) {
		
		
	}

	/** 當點擊 */
	public onClick_call () : void {
		this.onClick.call();
	}
	
	/*== Public Function ==========================================*/

	/** 顯示 */
	public show (onDone: Function = null) : void {
		let self = this;

		this.targetNode.active = true;
		this.animator.play("show");

		this.animator.onComplete.remove(this._eventName);
		this.animator.onComplete.addOnce(()=>{
			self.onHide.call();
		}).name(this._eventName);

		if (onDone != null) {
			this.onShow.addOnce(()=>{
				onDone();
			});
		}

	}


	/** 隱藏 */
	public hide (onDone: Function = null) : void {
		let self = this;

		this.animator.play("hide");

		this.animator.onComplete.remove(this._eventName);
		this.animator.onComplete.addOnce(()=>{
			self.onHide.call();
			this.targetNode.active = false;
		}).name(this._eventName);

		if (onDone != null) {
			this.onHide.addOnce(()=>{
				onDone();
			});
		}

	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

