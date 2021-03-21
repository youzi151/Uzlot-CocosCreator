import { ReelRowViewPass, ReelColObj } from "../../index_Reel";
import { ColMiddle } from "../Data/ColMiddle";
import { ReelColData } from "../Data/ReelColData";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ReelRowViewPass_Idle extends ReelRowViewPass {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	@property(cc.Vec2)
	public position : cc.Vec2 = new cc.Vec2(0, 0)

	@property(cc.Vec2)
	public scale : cc.Vec2 = new cc.Vec2(1, 1);

	@property()
	public isSkew : boolean = false;

	@property(cc.Vec2)
	public skew : cc.Vec2 = cc.Vec2.ZERO;

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	// start () {}

	// update (dt) {}

	
	/*== Public Function ==========================================*/

	/*== Protected Function =======================================*/

	/**
	 * 通過通道
	 * @param passArgs 參數
	 */
	protected _pass (passArgs: any) : any {

		let colObjs : Array<ReelColObj> = passArgs.colObjs;
		let colMiddle : ColMiddle = passArgs.colMiddle;
		let colData : ReelColData = passArgs.colData;
		
		
		colObjs.forEach((each)=>{
			
			//== 傾斜 =============
			if (this.isSkew) {
				each.setSkew(this.skew);
			}

			//== 位置 =============
			each.setPosition(this.position);

			//== 縮放 =============
			let args = colMiddle.getArgs(each);
			let scale = args["scale"];
			if (scale == null) {
				scale = this.scale;
			}
			each.setScale(scale);
		});

		return passArgs;
	}

	/*== Private Function =========================================*/


}

