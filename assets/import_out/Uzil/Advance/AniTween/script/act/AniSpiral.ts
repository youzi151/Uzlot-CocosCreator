import { AniAct } from "../AniAct";

import { Mathf } from "../../../../Uzil";

export enum AniSpiral_WrapType {
	CONTINUED,
	PINGPONG
}

export class AniSpiral extends AniAct {
	
	/*== Constructor ==============================================*/

	constructor (args: Object){
		super(args);

		// 演出物件
		this._setProp(args, 'actorNode');

		// 目標
		this._setProp(args, 'target');

		// 播放類型
		this._setProp(args, 'wrapType');

		
		// 初始角度
		this._setProp(args, 'initialAngle');

		// 旋轉方向
		this._setProp(args, 'rotateNormal');

		// 旋轉速度
		this._setProp(args, 'rotateSpeed');
		
		// 旋轉加速度
		this._setProp(args, 'rotateAcceleration');

		// 半徑
		this._setProp(args, 'radius');

		// 半徑方向
		this._setProp(args, 'radiusNormal');

		// 半徑速度
		this._setProp(args, 'radiusSpeed');
		

	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/* 演出物件 */
	public actorNode : cc.Node = null;

	/* 中心目標 */
	public target : any = null;

	/* 播放類型 */
	public wrapType : AniSpiral_WrapType = -1;
	
	
	
	/* 當前角度 */
	public currentAngle : number = -1;
	
	/* 初始角度 */
	public initialAngle : number = -1;

	/* 旋轉方向 (正為 順時針) */
	public rotateNormal : number = 1;
	
	/* 速度 */
	public rotateSpeed : number = 0;
	public rotateAcceleration : number = 0;


	/* 半徑 */
	public radius : number = 1;
	/* 半徑增長方向 */
	public radiusNormal : number = 1;
	/* 半徑速度 */
	public radiusSpeed : number = 0;


	/* 曲線資料 */
	public curve : Object = null;

	

	/*== Event ====================================================*/

	/*== Public Function ==========================================*/

	/*== 基本功能 =================*/

	/*== 其他功能 =================*/
	
	/*== Public Function ==========================================*/
	
	/*== Protected Function =======================================*/

	/* 播放 */
	protected _update (dt: number) : void {
		if (!this.isPlaying) return;

		// 演出節點
		const node: cc.Node = this.actorNode;

		// 目標位置
		const targetPos: cc.Vec2 = this._getTargetLocalPos();
		
		// 位置
		const nodePos: cc.Vec2 = node.getPosition();
		
		//== 依照動態類型 ===========

		// 加速
		this.rotateSpeed += this.rotateAcceleration * this.rotateNormal * dt;

		// 旋轉角度
		this.currentAngle += (this.rotateSpeed * this.rotateNormal) * dt;
	
		// 離心距離
		this.radius += this.radiusSpeed * this.radiusNormal * dt;

		// 乘上離心距離
		let vector = Mathf.angleToVec2(this.currentAngle);
		let pos = targetPos.add(vector.normalize().mul(this.radius));

		// 設置位置
		node.setPosition(pos);
	}

	/* 播放 */
	protected _play () : void {

		// 角度=============
		let angle = this.initialAngle;
		let diff: cc.Vec2 = this._getTargetLocalPos().sub(this.actorNode.position);

		// 若不指定 則 自動取得當前
		if (angle <= -1) {
			angle = cc.Vec2.UP.signAngle(diff);
			angle = cc.misc.radiansToDegrees(angle);
			this.initialAngle = angle;
		}

		this.currentAngle = angle;

		// 離心距離==========

		// 若不指定 則 自動取得當前
		if (this.radius <= -1) {
			this.radius = diff.mag();
		}

	}

	/* 停止 */
	protected _stop () : void {
		
	}

	/* 暫停 */
	protected _pause () : void {
		
	}

	/* 恢復 */
	protected _resume () : void {
		
	}

	/*== Private Function =========================================*/

	/* 取得目標位置 */
	private _getTargetWorldPos () {
	
		if (this.target instanceof cc.Node){
			let locator: cc.Node = this.target;
			let worldPos = locator.parent.convertToWorldSpaceAR(locator.getPosition());
			return worldPos;
		}
		
		else if (this.target instanceof cc.Vec2){
			// 若是在編輯器中，要把對的先轉換成錯的世界座標
			return this._getFixedWorldPos(this.target);
		}

	}

	private _getTargetLocalPos () {
		let worldPos: cc.Vec2 = this._getTargetWorldPos();
		const targetPos: cc.Vec2 = this.actorNode.parent.convertToNodeSpaceAR(worldPos);
		return targetPos;
	}
	

}
