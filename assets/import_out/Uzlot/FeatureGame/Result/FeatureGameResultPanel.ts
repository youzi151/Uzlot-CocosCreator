import { Animator, CountingNumber, Event } from "../../../Uzil/Uzil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class FeatureGameResultPanel extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 任務列表 */
	@property(cc.Node)
	public targetNode : cc.Node = null;

	@property(Animator)
	public animator : Animator = null;
	
	/** 數字 */
	@property(CountingNumber)
	public countingNum : CountingNumber = null;

	private _eventName : string = "FeatureGameResultPanel";
	
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
	public show (data: Object, onDone: Function = null) : void {
		let self = this;

		this.targetNode.active = true;
		this.animator.play("show");

		let wins = data["wins"];
		if (wins == undefined) {

			this.countingNum.node.active = false;

		} else {

			this.countingNum.node.active = true;

			// 重置數字
			this.countingNum.resetNum(0);
	
			// 設置 目標數字為 贏分
			this.countingNum.goto(wins);
		}


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

