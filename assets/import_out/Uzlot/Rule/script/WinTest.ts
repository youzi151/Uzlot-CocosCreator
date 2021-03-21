// import { XX } from "../index_XX";

import { WinsRule } from "./WinsRule";
import { OddsTable } from "./const/OddsTable";

const {ccclass, property} = cc._decorator;


@ccclass
export class WinTest extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** XX */
	@property()
	public XX : string = "";
	
	/*== Event ====================================================*/

	/** 當XX */
	// public onXX : Event = new Event();


	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {

	}

	start () {
		cc.log(WinsRule.getWinDataList_Line(
			10,
			[
				[1, 0, 0],
				[1, 0, 0],
				[1, 0, 0],
				[1, 0, 0],
				[1, 0, 0]
			],
			OddsTable["main"],
			false
		));
	}

	update (dt) {
		
		
	}
	
	/*== Public Function ==========================================*/
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}