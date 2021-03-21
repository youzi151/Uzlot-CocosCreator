import { Animator } from "../../Animator/index_Animator";


export class Shuriken {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 控制的物件 */
	public node : cc.Node = null;

	/** 生命 */
	public life_sec : number = 0;

	/** 位置 */
	public position : cc.Vec3 = new cc.Vec3(0, 0, 0);
	private _posV2 : cc.Vec2 = cc.Vec2.ZERO;
	private _isPosChanged : boolean = false;

	/** 重力 */
	public gravity : cc.Vec3 = cc.Vec3.ZERO;

	/** 旋轉 */
	public rotation : number = 0;
	private _isRotChanged : boolean = false;

	/** 比例 */
	public scale : cc.Vec2 = cc.Vec2.ONE;
	private _isSclChanged : boolean = false;


	/** 自身向量 */
	public velocity : cc.Vec3 = new cc.Vec3(0, 0, 0);

	/** 旋轉速度 */
	public rotateSpeed : number = 0;

	/** 縮放速度 */
	public scaleSpeed : cc.Vec2 = cc.Vec2.ZERO;

	
	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/

	/**
	 * 開啟關閉
	 * @param isActive 是否啟用
	 */
	public setActive (isActive: boolean) : void {
		this.node.active = isActive;
	}

	/**
	 * 設置 位置
	 * @param pos 位置
	 */
	public setPosition (pos: cc.Vec3) : void {
		this.position = pos;
		this._posV2.x = pos.x;
		this._posV2.y = pos.y;
		this._isPosChanged = true;
	}

	/**
	 * 設置 發射時旋轉
	 * @param rotation 發射時旋轉 
	 */
	public setRotation (rotation: number) : void {
		this.rotation = rotation;
		this._isRotChanged = true;
	}

	/**
	 * 設置 發射時縮放
	 * @param scale 
	 */
	public setScale (scale: cc.Vec2) : void {
		this.scale = scale;
		this._isSclChanged = true;
	}

	/**
	 * 設置時間
	 * @param time 時間
	 */
	public setAnimTime (time: number) : void {
		let animator : Animator = this.node.getComponent(Animator);
		if (!animator) return;

		animator.setNormalizedTime(time);
	}

	/** 自身更新 */
	public update (dt: number) : void {
		this.life_sec -= dt;
		this.velocity.addSelf(this.gravity.mul(dt));
		this.setPosition(this.position.add(this.velocity.mul(dt)));
		this.setRotation(this.rotation + (this.rotateSpeed * dt));
		this.setScale(this.scale.add(this.scaleSpeed.mul(dt)));
	} 

	/**
	 * 渲染(實際上更新控制物件)
	 * @param isForce 是否強制重新渲染
	 */
	public render (isForce: boolean = false) : void {
		
		if (isForce || this._isPosChanged){
			this.node.setPosition(this._posV2);
			this._isPosChanged = false;
		}

		if (isForce || this._isRotChanged){
			this.node.setRotation(this.rotation);
			this._isRotChanged = false;
		}

		if (isForce || this._isSclChanged){
			this.node.setScale(this.scale);
			this._isSclChanged = false;
		}
	}

	/** 比較 */
	public compare (other: Shuriken) : number {
		return this.position.z - other.position.z;
	}

	/** 
	 * 設置排序(Z軸)
	 * @param idx z軸排序
	 */
	public setOrder (idx: number) : void {
		this.node.zIndex = idx;
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

