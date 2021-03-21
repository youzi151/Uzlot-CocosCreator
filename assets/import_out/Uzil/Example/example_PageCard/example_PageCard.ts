import { PageCtrl } from "../../Uzil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Example_PageCard extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {}

	start () {
		PageCtrl.get().GoPage("page1");
		cc.log("show page1");

		this.scheduleOnce(()=>{
			PageCtrl.get().GoPage("page2");
			cc.log("show page2");
		}, 3);

		this.scheduleOnce(()=>{
			PageCtrl.get().GoPage("page3");
			cc.log("show page3");
		}, 6);

		this.scheduleOnce(()=>{
			PageCtrl.get().HidePage("page3");
			cc.log("hide page3");
			PageCtrl.get("another").GoPage("page3");
			cc.log("show another scope page3");
		}, 9);
	}

	update (dt) {
		
		
	}

	
	/*== Public Function ==========================================*/

	/* 呼叫 */
	// public call (var1: Function, var2: number) : void {

	// }
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

