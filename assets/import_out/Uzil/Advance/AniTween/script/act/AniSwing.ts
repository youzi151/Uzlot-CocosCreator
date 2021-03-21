import { AniAct } from "../AniAct";

import { BezierData, Mathf } from "../../../../Uzil";

export class AniSwing extends AniAct {
	
	/*== Constructor ==============================================*/

	constructor (args: Object){
		super(args);

		// 目標
		this._setProp(args, 'actorNode');

		// 角度列表
		this._setProp(args, 'angles');

		// 速度
		this._setProp(args, 'speed');
		
		// 緩動
		this._setProp(args, 'easeInOut');
		
		// 持續時間
		this._setProp(args, 'duration');
	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/* 演出物件 */
	public actorNode : cc.Node = null;

	/* 角度列表 */
	public angles : Array<number> = [];

	/* 當前角度序號 */
	private _currentAngleIdx : number = -1;

	/* 下一個方向 */
	private _nextNormal : number = 1;

	/* 當前角度 */
	public currentAngle : number = -1;


	/* 速度 */
	public speed : number = 0;
	
	/* 緩動 */
	public easeInOut : Array<number> = [];
	private _easeBezier : BezierData = null;


	/* 曲線資料 */
	public curve : Object = null;
	
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

		// 若已達目標 則 前往下一個角度
		if (node.rotation == targetAngle){

			let next = this._currentAngleIdx + this._nextNormal;

			
			// 超過 則 反轉
			if (next >= this.angles.length || next < 0){
				this._nextNormal *= -1;
			}
			
			// 推進序號
			this._currentAngleIdx += this._nextNormal;

			// 取得 目標角度
			targetAngle = this._getTargetAngle();
		}

		// 上一個角度
		let lastAngle = this._getLastAngle();

		// 設置 新的 當前角度
		this.currentAngle = Mathf.moveToward(this.currentAngle, targetAngle, this.speed * dt);
		
		let newRot = this.currentAngle;

		// 若 緩動 存在
		if (this._easeBezier){

			// 取得百分比
			let currentPercent = 1 - ((targetAngle - this.currentAngle) / (targetAngle - lastAngle));
	
			// 透過 緩動取得真實角度
			let easePercent = this._easeBezier.compute(currentPercent);
			let easedAngle = cc.misc.lerp(lastAngle, targetAngle, easePercent);
			
			newRot = easedAngle;
		}
		
		// 改變角度
		node.rotation = newRot;

		// 持續時間計算
		if (this.duration > 0){

			// 增加 已執行時間
			this._runnedTime += dt;
			// 若 超出持續時間 則 停止
			if (this._runnedTime >= this.duration) {
				this.stop();
			}

		}

	}

	/* 播放 */
	protected _play () : void {
		// 初始化 ===========

		// 已執行時間
		this._runnedTime = 0;

		// 序號
		this._currentAngleIdx = 0;

		// 當前角度
		this.currentAngle = this._getTargetAngle();

		// 設當前序號 為 第二個
		this._currentAngleIdx = 1;

		// 緩動
		let ease = this._getEase(this.easeInOut);
		if (ease){
			this._easeBezier = BezierData.easyBezier(ease[0], ease[1], ease[2], ease[3]);
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

	/* 取得當前目標角度 */
	private _getTargetAngle () {
		if (this.angles.length == 0) return 0;
		return this.angles[this._currentAngleIdx];
	}

	/* 取得前一個角度 */
	private _getLastAngle () {
		if (this.angles.length == 0) return 0;
		let idx = this._currentAngleIdx - this._nextNormal;
		// if (idx < 0) idx = this.angles.length - 1;
		return this.angles[idx];
	}

}
