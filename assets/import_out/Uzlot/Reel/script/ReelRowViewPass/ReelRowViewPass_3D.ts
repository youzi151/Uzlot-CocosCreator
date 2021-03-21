import { ReelRowViewPass, ReelColObj } from "../../index_Reel";
import { ColMiddle } from "../Data/ColMiddle";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ReelRowViewPass_3D extends ReelRowViewPass {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	@property(cc.Vec2)
	public offsetFactor : cc.Vec2 = new cc.Vec2(15, -40)

	@property(cc.Vec2)
	public scaleFactor : cc.Vec2 = new cc.Vec2(0, 0.5);

	@property(cc.Vec2)
	public skewFactor : cc.Vec2 = new cc.Vec2(3.5, 0);

	@property(cc.Vec2)
	public offset : cc.Vec2 = new cc.Vec2(-10, 0)

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
		let rollDir = passArgs.rollDir;

		let pos = passArgs.pos;
		
		colObjs.forEach((eachObj)=>{

			let eachPos = pos;

			let args = colMiddle.getArgs(eachObj);

			let offsetBase = args["offsetBase"];
			if (offsetBase != null) {
				eachPos += offsetBase;
			}

			let offset = args["offset"];
			if (offset != null) {
				eachPos += offset;
			}

			
			// 純量
			let mag = eachPos;
			let absMag = Math.abs(mag);

			//== 傾斜 =============
			let newSkew = this.skewFactor.mul(rollDir).mul(mag);
			// 設置 縮放
			eachObj.setSkew(newSkew);


			//== 位置 =============
			let lastPos = eachObj.getPosition();
			let posMag = lastPos.y > 0? 1:-1;
			let posOffset = new cc.Vec2(
				this.offset.x + this.offsetFactor.x * absMag * absMag, // 左右 不受mag正負
				this.offset.y + this.offsetFactor.y * absMag * absMag * posMag * -rollDir,// 上下 受mag正負影響
			);
			let newPos = eachObj.getPosition().add(posOffset);
			eachObj.setPosition(newPos);


			//== 縮放 =============
			let newScale = new cc.Vec2(1,1).sub(this.scaleFactor.mul(absMag*absMag*0.5));
			if (newScale.x < 0) newScale.x = 0;
			if (newScale.y < 0) newScale.y = 0;
			// 設置 縮放
			eachObj.setScale(newScale);

			
		});


		return passArgs;
	}

	/*== Private Function =========================================*/


}

