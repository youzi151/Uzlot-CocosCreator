import { Mathf, RandomRange } from "../../../../Uzil";
import { ShurikenEmitter_Base } from "../../index_Shuriken";

export class ShurikenEmitter_Circle extends ShurikenEmitter_Base {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 半徑 */
	public raidus : RandomRange = new RandomRange(0);
	
	/** 角度 */
	public angle : RandomRange = new RandomRange(0, 359);

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/
	
	/*== Public Function ==========================================*/
	
	/*== Protected Function =======================================*/

	/**
	 * 取得發射位置
	 * @returns 發射位置
	 */
	protected _getEmitPos () : cc.Vec2 {

		// 隨機長度
		let radius = this.raidus.random();

		// 隨機角度
		let angleRange = Mathf.angleDelta(this.angle.min, this.angle.max, /* isClockWise */true);
		let angle = Mathf.lerp(this.angle.min, this.angle.min + angleRange, Math.random());

		return Mathf.angleToVec2(angle).mul(radius); 
	}

	/*== Private Function =========================================*/


}

