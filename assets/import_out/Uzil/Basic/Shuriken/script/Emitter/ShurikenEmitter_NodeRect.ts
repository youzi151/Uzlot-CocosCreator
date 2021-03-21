import { ShurikenEmitter_Base } from "../../index_Shuriken";

export class ShurikenEmitter_NodeRect extends ShurikenEmitter_Base {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/
	
	/*== Public Function ==========================================*/
	
	/*== Protected Function =======================================*/

	/**
	 * 取得發射位置
	 * @returns 發射位置
	 */
	protected _getEmitPos () : cc.Vec2 {
		let res = new cc.Vec2();
		
		let rootNode = this.system.getContainer();

		let left   = 0 - (rootNode.width  * rootNode.anchorX       );
		let right  = 0 + (rootNode.width  * (1 - rootNode.anchorX) );
		let top    = 0 + (rootNode.height * (1 - rootNode.anchorY) );
		let bottom = 0 - (rootNode.height * rootNode.anchorY       );
		
		res.x = cc.misc.lerp(left,   right, Math.random());
		res.y = cc.misc.lerp(bottom, top,   Math.random());

		return res;
	}

	/*== Private Function =========================================*/


}

