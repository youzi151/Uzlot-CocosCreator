import { AniAct } from "../AniAct";

import { Mathf } from "../../../../Uzil";

export class AniLookAt extends AniAct {
	
	/*== Constructor ==============================================*/

	constructor (args: Object) {
		super(args);

		// 演出物件
		this._setProp(args, 'actorNode');

		// 目標
		this._setProp(args, 'target');
		
		// 速度
		this._setProp(args, 'speed');
		
		// 加速度
		this._setProp(args, 'acceleration');
		
		// 持續時間
		this._setProp(args, 'duration');
	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/* 演出物件 */
	public actorNode : cc.Node = null;

	/* 注視目標 */
	public target : any = null;

	/* 速度 */
	private _speed : number = 0;
	private _initialSpeed : number = 0;
	public set speed (val) {
		this._initialSpeed = val;
		this._speed = val;
	}
	public get speed () {
		return this._speed;
	}
	
	/* 加速度 */
	public acceleration : number = 0;
	
	/* 持續時間 */
	public duration : number = -1;
	/* 已執行的時間 */
	private _runnedTime : number = 0;

	/*== Event ====================================================*/

	/*== Public Function ==========================================*/

	/*== 基本功能 =================*/

	/*== 其他功能 =================*/
	
	/*== Public Function ==========================================*/
	
	/*== Protected Function =======================================*/

	/* 播放 */
	protected _update (dt: number) : void {
		if (!this.isPlaying) return;

		// 目標節點
		const node: cc.Node = this.actorNode;
	
		// 當前目標角度
		let targetAngle = this._getTargetAngle();

		// 加速度
		this._speed += this.acceleration * dt;

		// 改變角度
		node.rotation = Mathf.rotateToward(node.rotation, targetAngle, this._speed * dt);

		// 若已經抵達指定角度
		if (node.rotation == targetAngle) {
			// 速度歸零
			this._speed = 0;

		}
		// 若 尚未抵達 則 回歸初始速度
		else {
			this._speed = this._initialSpeed;
		}
		
		// 持續時間
		if (this.duration > 0) {
			
			this._runnedTime += dt;
			
			if (this._runnedTime >= this.duration) {
				this.stop();
			}

		} else {

		}
	}

	/* 播放 */
	protected _play () : void {
		this._runnedTime = 0;
		this.speed = this._initialSpeed;
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
	private _getTargetPos () {
		// 若 目標 為 節點
		if (this.target instanceof cc.Node) {
		
			return this.target.parent.convertToWorldSpaceAR(this.target.position);
		
		}
		
		// 若 目標 為 座標
		else if (this.target instanceof cc.Vec2) {

			// 若是在編輯器中，要把對的先轉換成錯的世界座標
			return this._getFixedWorldPos(this.target);

		}
		return cc.Vec2.ZERO;
	}

	/* 取得自身位置 */
	private _getSelfPos () {
		return this.actorNode.parent.convertToWorldSpaceAR(this.actorNode.position);
	}

	/* 取得對目標的角度 */
	private _getTargetAngle () {
		
		const selfPos = this._getSelfPos();
		const targetPos = this._getTargetPos();

		// 將 自身至目標 與 上方 的夾角 轉換為 欲旋轉之角度
		let angle = targetPos.sub(selfPos).signAngle(cc.Vec2.UP);
		angle = cc.misc.radiansToDegrees(angle);

		// 修正角度
		angle = Mathf.validAngle(angle);

		return angle;
	}
}
