import { CountingNumber } from "../../../Uzil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Example_CountingNumber extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 任務列表 */
	@property(CountingNumber)
	public countingNum : CountingNumber = null;

	@property()
	public testGoto : number = 0;
	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {
		this.countingNum.resetNum(0);
		this.countingNum.goto(this.testGoto);
		
	}

	update (dt) {
		
		
	}

	
	/*== Public Function ==========================================*/

	/** 呼叫 */
	// public call (var1: Function, var2: number) : void {

	// }
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

