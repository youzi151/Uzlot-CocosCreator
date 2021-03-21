import { ReelRowViewPass } from "../../index_Reel";
import { ReelColObj } from "../ReelColObj";
import { ColMiddle } from "../Data/ColMiddle";
import { Mathf } from "../../../../Uzil/Uzil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ReelRowViewPass_Blurs extends ReelRowViewPass {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/**
	 * 定義 模糊方向
	 * (x: +右 -左, y: +下 -上) 
	 */
	@property(cc.Vec2)
	public blurDir : cc.Vec2 = new cc.Vec2(0, 1);
	
	@property(cc.Vec2)
	public blurMax : cc.Vec2 = new cc.Vec2(10, 10);

	@property(cc.Vec2)
	public lengthPerUnit : cc.Vec2 = new cc.Vec2(1, 1);
	

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

		let self = this;

		let colObjs : Array<ReelColObj> = passArgs.colObjs;
		
		let dir;
		if (passArgs.lastPos != null) {
			dir = passArgs.pos - passArgs.lastPos;
		} else {
			dir = 0;
		}

		let blur : cc.Vec2 = self.blurDir.normalize().scale(new cc.Vec2(1/this.lengthPerUnit.x, 1/this.lengthPerUnit.x)).mul(dir);
		blur.x = Mathf.clamp(blur.x, -this.blurMax.x, this.blurMax.x);
		blur.y = Mathf.clamp(blur.y, -this.blurMax.y, this.blurMax.y);

		// 設置 位置
		colObjs.forEach((each)=>{
			each.setBlur(blur);
		});

		return passArgs;
	}

	/*== Private Function =========================================*/


}

