import { SymbolCode } from "../../../Rule/index_Rule";
import { GameCtrl } from "./GameCtrl";

const {ccclass, property} = cc._decorator;

@ccclass
export class SpinPostProc extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	@property()
	public isEnabled : boolean = true;
	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {
		
	}

	update (dt) {
		
		
	}

	
	/*== Public Function ==========================================*/

	/** 呼叫 */
	public process (gameCtrl: GameCtrl, result: SymbolCode[][], lockInput: Function) : void {

	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

