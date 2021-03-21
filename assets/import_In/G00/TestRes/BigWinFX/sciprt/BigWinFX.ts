import { Shuriken, ShurikenSystem } from "../../../../Uzil/Uzil";
import { CountingNumber, Event } from "../../../../Uzil/Uzil";

const {ccclass, property} = cc._decorator;

const _eventName = "bigWinFX";

@ccclass
export default class BigWinFX extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 數字 */
	@property(CountingNumber)
	public countingNum : CountingNumber = null;

	@property(cc.Node)
	public blackBG : cc.Node = null;

	@property(cc.Node)
	public coinShurikens : cc.Node[] = [];

	public isPlaying : boolean = false;
	
	/*== Event ====================================================*/

	public onExit : Event = new Event();

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {

		this.node.active = false;

	}

	start () {
		
	}

	update (dt) {
		
		
	}

	
	/*== Public Function ==========================================*/

	/** 播放 */
	public play (data: Object) : void {
		let wins = data["wins"];
		let onCountDone = data["onCountDone"];
		let onExit = data["onExit"];


		// 設置 播放中
		this.isPlaying = true;
		
		// 開啟此物件
		this.node.active = true;

		// 重置數字
		this.countingNum.resetNum(0);

		// 設置 目標數字為 贏分
		this.countingNum.goto(wins);

		for (let each of this.coinShurikens) {
			let shurikenSys : ShurikenSystem = each.getComponent("ShurikenComponent").shurikenSystem;
			shurikenSys.clear();
			shurikenSys.resume();
		}
		
		// 若有傳入 當計數完畢 則 轉註冊
		if (onCountDone != undefined) {
			this.countingNum.onDone.remove(_eventName);
			this.countingNum.onDone.addOnce(onCountDone).name(_eventName)
		}

		// 若有傳入 當離開 則 轉註冊
		if (onExit != undefined) {
			this.onExit.remove(_eventName);
			this.onExit.addOnce(onExit).name(_eventName);
		}
	}
	
	public stop () : void {
		this.isPlaying = false;
		this.node.active = false;
		this.onExit.call();

		this.countingNum.onDone.remove(_eventName);
		this.onExit.remove(_eventName);
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

