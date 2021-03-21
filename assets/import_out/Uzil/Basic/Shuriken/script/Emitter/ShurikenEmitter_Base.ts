import { Mathf, RandomRange } from "../../../../Uzil";
import { ShurikenEmitter, Shuriken } from "../../index_Shuriken";

export class ShurikenEmitter_Base extends ShurikenEmitter {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 來源定位點 */
	public emitFrom : cc.Node | cc.Vec2;

	/** 初始位置 */
	public emitX : RandomRange = new RandomRange(0);
	public emitY : RandomRange = new RandomRange(0);

	/** 初始速度 */
	public emitSpeed : RandomRange = new RandomRange(0);
	public emitSpeed_z : number = 1;

	/** 重力 */
	public gravity : cc.Vec3 = new cc.Vec3(0, 0);

	/** 角度範圍 */
	public emitAngle : RandomRange = new RandomRange(0, 359);

	/** 初始旋轉 */
	public emitRotation : RandomRange = new RandomRange(0, 359);
	/** 初始旋轉速度 */
	public emitRotateSpeed : RandomRange = new RandomRange(0);

	/** 初始縮放大小 */
	public emitScale : RandomRange = new RandomRange(1);
	/** 初始縮放速度 */
	public emitScaleSpeed : RandomRange = new RandomRange(1);

	/** 初始動畫時間 */
	public emitAnimTime : RandomRange = new RandomRange(0);

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/

	/**
	 * 呼叫
	 * @param shuriken 粒子
	 */
	public emit (shuriken: Shuriken) : void {
		
		// 初始位置
		let pos : cc.Vec2 = this._getEmitPos();
		shuriken.setPosition(new cc.Vec3(
			pos.x,
			pos.y,
			0
		));

		// let container = this.system.getContainer();
		// if (container) {
		// 	shuriken.node.parent = container;
		// }
		
		//== 位移 ========================

		// 隨機發射角度
		// 位移向量
		let angle = this._getEmitAngle();

		// 設置初始速度
		shuriken.velocity = Mathf.toVec3(Mathf.angleToVec2(angle).mul(this.emitSpeed.getFloat()));
		shuriken.velocity.z = this.emitSpeed_z;

		shuriken.gravity = Mathf.toVec3(this.gravity);

		//== 旋轉 ========================

		// 隨機初始旋轉
		shuriken.node.setRotation(this._getEmitRotate());

		// 隨機旋轉速度
		shuriken.rotateSpeed = this.emitRotateSpeed.getFloat();

		//== 尺寸 ========================

		// 隨機初始縮放
		shuriken.setScale(Mathf.toVec2(this.emitScale.getFloat()));

		// 隨機縮放速度
		shuriken.scaleSpeed = Mathf.toVec2(this.emitScaleSpeed.getFloat());

		//== 動畫時間 =====================
		shuriken.setAnimTime(this.emitAnimTime.getFloat());
		
	}
	
	/*== Protected Function =======================================*/

	/**
	 * 取得發射位置
	 * @returns 發射位置
	 */
	protected _getEmitPos () : cc.Vec2 {
		return new cc.Vec2(this.emitX.random(), this.emitY.random());
	}

	/**
	 * 取得發射角度
	 * @returns 發射角度
	 */
	protected _getEmitAngle () : number {
		let angleRange = Mathf.angleDelta(this.emitAngle.min, this.emitAngle.max, true);
		return cc.misc.lerp(this.emitAngle.min, this.emitAngle.min + angleRange, Math.random());
	}

	/**
	 * 取得發射時旋轉
	 * @returns 發射時旋轉
	 */
	protected _getEmitRotate () : number {
		let angleRange = Mathf.angleDelta(this.emitRotation.min, this.emitRotation.max, true);
		return cc.misc.lerp(this.emitRotation.min, this.emitRotation.min + angleRange, Math.random());
	}




	/*== Private Function =========================================*/


}

