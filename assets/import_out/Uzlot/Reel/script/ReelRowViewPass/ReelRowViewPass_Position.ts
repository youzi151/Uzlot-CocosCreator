import { ReelRowViewPass } from "../../index_Reel";
import { ReelColObj } from "../ReelColObj";
import { ColMiddle } from "../Data/ColMiddle";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ReelRowViewPass_Position extends ReelRowViewPass {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/**
	 * 定義 滾動方向
	 * (x: +右 -左, y: +下 -上) 
	 */
	@property(cc.Vec2)
	public rollDirection : cc.Vec2 = new cc.Vec2(0, 1);

	/** 定義 每格尺寸 */
	@property()
	public colSize : number = 200;

	/** 定義 每格間隔 */
	@property()
	public colSpacing : number = 20;

	/** 每格尺寸+間距 */
	public get colDistance () : number {
		return this.colSize+this.colSpacing;
	};

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

		// 滾輪基準位置
		let reelPos = passArgs.reelPos;
		
		let pos = passArgs.pos;

		// 設置 位置
		colObjs.forEach((each)=>{

			let eachPos = pos;

			let args = colMiddle.getArgs(each);


			// 偏移基準
			let offsetBase = args["offsetBase"];
			if (offsetBase != null) {
				eachPos += offsetBase;
			}

			// 偏移
			let offset = args["offset"];
			if (offset != null) {
				eachPos += offset;
			}

			// 計算 純量
			let newPosMag = eachPos * this.colDistance;

			// 計算 位置 (純量*方向)
			let newPos = this.rollDirection.mul(rollDir).normalize().mul(newPosMag);

			

			each.setPosition(reelPos.add(newPos));
		});

		passArgs.rollDir = this.rollDirection.y * rollDir;

		return passArgs;
	}

	/*== Private Function =========================================*/


}

