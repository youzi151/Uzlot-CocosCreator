import { AniAct } from "../AniAct";

import { BezierData, Mathf } from "../../../../Uzil";

/* 動態類型 */
export enum AniGoto_MoveType {
	SPEED,
	DURATION,
	// CURVE
}


export class AniGoto extends AniAct {
	
	/*== Constructor ==============================================*/

	constructor (args: Object){
		super(args);

		// 目標
		this._setProp(args, 'actorNode');

		// 目標位置
		this._setProp(args, 'target');

		// 動態類型
		this._setProp(args, 'moveType');

		// 速度
		this._setProp(args, 'speed');
		
		// 加速度
		if (args['acceleration'] != undefined){
			this.speed_acceleration = args['acceleration'];
		}
		
		// 曲線
		this._setProp(args, 'curve');
		
		// 持續時間
		this._setProp(args, 'duration');

		// 緩動
		this._setProp(args, 'easeInOut');
		
		// 曲線控制點
		this._setProp(args, 'curvePoint');
		
		// 曲線控制點長度
		this._setProp(args, 'curveLength');

	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/* 演出物件 */
	public actorNode : cc.Node = null;

	
	/*== 目標 ============================================ */
	
	/* 目標 */
	public target : any = null;

	/*== 動態 ============================================ */
	
	/* 動態類型 */
	public moveType : AniGoto_MoveType = AniGoto_MoveType.DURATION;
	
	/*== SPEED ====================== */
	
	/* 速度 */
	public speed : number = 500;
	
	/* 加速度 */
	public speed_acceleration : number = 0;

	
	
	/*== DURATION ====================== */
	
	/* 持續時間 */
	public duration : number = 1;
	/* 已執行時間 */
	private _runnedTime : number = 0;
	
	/* 原始位置 */
	private _orinPos : cc.Vec2 = cc.Vec2.ZERO;
	
	/* 緩動 */
	public easeInOut : Array<number> = [];

	/* 曲線控制點位置 */
	public curvePoint : any = null;
	private _curveBezier = null;

	/* 曲線長度 */
	public curveLength : number = 5;

	/* 緩動 */
	private _easeBezier : BezierData = null;
	
	/*== CURVE ========================= */
	
	// public curve : Object = null;
	
	/*== Event ====================================================*/

	/*== Public Function ==========================================*/

	/*== 基本功能 =================*/

	/*== 其他功能 =================*/
	
	/*== Public Function ==========================================*/
	
	/*== Protected Function =======================================*/

	/* 播放 */
	protected _update (dt: number) : void {
		if (!this.isPlaying) return;

		const self = this;
		
		// 演出節點
		const node: cc.Node = this.actorNode;
		// 目標位置
		let targetWP = this._getTargetWorldPos();

		const targetPos: cc.Vec2 = this._getLocalPos(this._getTargetWorldPos(), node.parent);
		
		//== 依照動態類型 ===========

		//== 速度 ==
		if (this.moveType == AniGoto_MoveType.SPEED) {
			
			// 加速度
			this.speed += this.speed_acceleration * dt;

			// 位置
			let position: cc.Vec2 = node.position;

			// 若過於相近 則 視為停止、速度歸零
			let diff = targetPos.sub(position);
			if (diff.mag() < 5){
				this.stop();
				return;
			}

			// 取得新位置
			let toPos = Mathf.moveTowardV2(position, targetPos, this.speed * dt);

			// 設置位置
			node.setPosition(toPos);


		}
		
		//== 時間 ==
		else if (this.moveType == AniGoto_MoveType.DURATION) {



			// 當前百分比
			let percent = this._runnedTime / this.duration;

			if (this._easeBezier){
				percent = this._easeBezier.compute(percent);
			}

			let newPos = Mathf.lerpV2(this._orinPos, targetPos, percent);

			// 曲線
			// (function () {
			// 	if (self.curvePoint != null){
	
			// 		let pointPos : cc.Vec2;
			// 		if (self.curvePoint instanceof cc.Node){
			// 			pointPos = self._getLocalPos(self._getWorldPos(self.curvePoint), self.actorNode.parent);
			// 		}else if (self.curvePoint instanceof cc.Vec2){
			// 			pointPos = self.curvePoint;
			// 		}else {
			// 			return;
			// 		}
										
			// 		let targetDiff = targetPos.sub(node.position);
			// 		let pointDiff = pointPos.sub(node.position);
			// 		let direction = targetDiff.normalize();
	
			// 		let point = new cc.Vec2(
			// 			Math.abs(pointDiff.x / targetDiff.x),
			// 			Math.abs(pointDiff.y / targetDiff.y),
			// 		);
			
			// 		let length = self.curveLength / targetDiff.mag();
			// 		cc.log("len")
			// 		let m1 = point.sub(direction.neg().mul(length));
			// 		let m2 = point.add(direction.mul(length));
			// 		// m1.x = cc.misc.clamp01(m1.x);
			// 		// m1.y = cc.misc.clamp01(m1.y);
			// 		// m2.x = cc.misc.clamp01(m2.x);
			// 		// m2.y = cc.misc.clamp01(m2.y);

			// 		cc.log(m1);
			// 		cc.log(m2);
				
						
			// 		self._curveBezier = Bezier(m1.x, m1.y, m2.x, m2.y);
	
			// 		// NOTE 非正確算法
			// 		let x = (newPos.x - node.position.x) / targetDiff.x;
			// 		cc.log(newPos.y);
			// 		newPos.y = (targetDiff.y * self._curveBezier(x)) + node.position.y;
			// 		// (newPos.y-node.position.y)/targetDiff.y == self._curveBezier(x);
			// 		cc.log(newPos.y)
			// 	}
			// })();


			// 位置
			node.setPosition(newPos);
			
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

		// TODO
		// else if (this.moveType == AniGoto_MoveType.CURVE) {
		// 	
		// }
		
	}

	/* 播放 */
	protected _play () : void {
		this._runnedTime = 0;
		this._orinPos = this.actorNode.position;

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

	/* 取得目標世界位置 */
	private _getTargetWorldPos () {
		
		// 若 目標 是 節點
		if (this.target instanceof cc.Node) {
			return this._getWorldPos(this.target);
		}
		
		// 若 目標 是 座標
		else if (this.target instanceof cc.Vec2) {
			// 若是在編輯器中，要把對的先轉換成錯的世界座標
			return this._getFixedWorldPos(this.target);
		}
		
	}
	
	/* 取得世界位置 */
	private _getWorldPos (node) {
		return node.parent.convertToWorldSpaceAR(node.position);
	}

	/* 取得在地位置 */
	private _getLocalPos (worldPos: cc.Vec2, parent: cc.Node) {
		const targetPos: cc.Vec2 = parent.convertToNodeSpaceAR(worldPos);
		return targetPos;
	}


}
