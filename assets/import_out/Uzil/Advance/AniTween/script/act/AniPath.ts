import { AniAct } from "../AniAct";

import { Mathf } from "../../../../Uzil";

/* 動態類型 */
export enum AniPath_MoveType {
	/* 速度 */ SPEED,
	/* 時間 */ DURATION,
	// /* 曲線 */ CURVE 
}

export enum AniPath_WrapType {
	/* 迴圈 */ LOOP,
	/* 折返 */ PINGPONG,
	/* 單次 */ ONCE
}

export class AniPath extends AniAct {
	
	/*== Constructor ==============================================*/

	constructor (args: Object){
		super(args);

		// 演出物件
		this._setProp(args, 'actorNode');

		// 路徑列表
		if (args['path']){
			this.path = args['path'].slice();
		}

		// 路徑是否關閉
		this._setProp(args, 'isPathClosure');
	
		// 動態類型
		this._setProp(args, 'moveType');

		// 播放類型
		this._setProp(args, 'wrapType');

		// 速度
		this._setProp(args, 'speed');
		
		// 持續時間
		this._setProp(args, 'duration');
	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/* 演出物件 */
	public actorNode : cc.Node = null;

	/* 路徑點列表 */
	public path : Array<any> = [];

	/* 路徑是否關閉 */
	public isPathClosure : boolean = true;

	/* 當前路徑序號 */
	private _currentPathIdx : number = -1;

	/* 下一個方向 */
	private _nextPathNormal : number = 1;

	/* 動態類型 */
	public moveType : AniPath_MoveType = AniPath_MoveType.SPEED;

	/* 播放類型 */
	public wrapType : AniPath_WrapType = AniPath_WrapType.LOOP;


	/* 速度 */
	public speed : number = 0;
	
	/* 持續時間 */
	public duration : number = 5;
	/* 已執行的時間 */
	private _runnedTime : number = 0;


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
		const nodePos: cc.Vec2 = node.position;
		
		//== 依照動態類型 ===========

		//== 速度 ==
		if (this.moveType == AniPath_MoveType.SPEED) {
			
			// 取得新位置
			let toPos = Mathf.moveTowardV2(nodePos, targetPos, this.speed * dt);
			
			// 設置位置
			node.setPosition(toPos);

		}
		
		//== 時間 ==
		else if (this.moveType == AniPath_MoveType.DURATION) {

			// 取得新位置
			let toPos = Mathf.moveTowardV2(nodePos, targetPos, this.speed * dt);
			
			// 設置位置
			node.setPosition(toPos);

		}
		// TODO 
		// else if (this.moveType == AniPath_MoveType.CURVE) {
			
		// }

		// 若目標已達位置
		if (node.position.equals(targetPos)){

			// 推進序號
			this._currentPathIdx += this._nextPathNormal;

			// 若 循環模式 為 迴圈
			if (this.wrapType == AniPath_WrapType.LOOP){
				
				// 若 序號已達上限 
				if (this._currentPathIdx >= this._getPathCount()) {
					
					// 若 封閉路徑 則 序號歸零
					if (this.isPathClosure){
						this._currentPathIdx = 0;
					}
					
					// 非封閉路徑 則 回歸初始位置 並 設序號為第二個路徑點
					else{
						node.setPosition(this._getTargetLocalPos(0));
						this._currentPathIdx = 1;
					}
				}
			}

			// 若 循環模式 為 折返
			else if (this.wrapType == AniPath_WrapType.PINGPONG) {

				// 若 序號已達上限 或 達到下限
				if (this._currentPathIdx >= this._getPathCount() || this._currentPathIdx < 0){
					// 反轉 序號推進方向
					this._nextPathNormal *= -1;
					// 推進序號
					this._currentPathIdx += this._nextPathNormal;
				}
			}

			// 若 循環模式 為 折返
			else if (this.wrapType == AniPath_WrapType.ONCE) {
				
				// 若 序號已達上限 則 停止
				if (this._currentPathIdx >= this._getPathCount()){
					this.stop();
				}
			}
		}


	}

	/* 播放 */
	protected _play () : void {
		
		// 初始化 ===========

		// 推進方向
		this._nextPathNormal = 1;
		// 當前序號
		this._currentPathIdx = 0;
		// 以執行時間
		this._runnedTime = 0;
		
		// 若為 封閉路徑 則 將初始路徑點 設為 最後路徑點
		if (this.isPathClosure) {
			if (this.path.length > 0){
				this.path.push(this.path[0]);	
			}
		}

		
		//== 依照動態類型 ===========
		
		//== 速度 ==
		if (this.moveType == AniPath_MoveType.SPEED) {


		}
		
		//== 時間 ==
		else if (this.moveType == AniPath_MoveType.DURATION) {

			let length: number = this._getPathLength();
			
			this.speed = this._getSpeed(length, /* acc */0, this.duration);

		}

		// 設 演出物件位置 為 第一個路徑點
		this.actorNode.setPosition(this._getTargetLocalPos(0));

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
	private _getTargetWorldPos (idx: number = -1) {
		if (idx == -1){
			idx = this._currentPathIdx;
		}

		let target = this.path[idx];
		if (target == null) return cc.Vec2.ZERO;

		// 若 目標 為 節點
		if (target instanceof cc.Node) {
			let worldPos = target.parent.convertToWorldSpaceAR(target.position);
			return worldPos;
		}

		// 若 目標 為 座標
		else if (target instanceof cc.Vec2) {
			// 若是在編輯器中，要把對的先轉換成錯的世界座標
			return this._getFixedWorldPos(target);
		}

	}

	/* 取得目標在地位置 */
	private _getTargetLocalPos (idx: number = -1) {
		let worldPos: cc.Vec2 = this._getTargetWorldPos(idx);
		const targetPos: cc.Vec2 = this.actorNode.parent.convertToNodeSpaceAR(worldPos);

		return targetPos;
	}

	/* 取得路徑數量 */
	private _getPathCount () {
		return this.path.length;
	}

	/* 取得路徑長度 */
	private _getPathLength () {
		if (this.path.length <= 0) return 0;

		let res = 0;
		let lastPos = this._getTargetWorldPos(0);
		
		for (let i = 1; i < this.path.length; i++){
			let nextPos = this._getTargetWorldPos(i);
			res += nextPos.sub(lastPos).mag();
			lastPos = nextPos;
		}
		
		return res;

	}

	/* 取得速度 */
	private _getSpeed (diff: number, acceleration: number, duration: number) {
		let at2 = acceleration * Math.pow(duration, 2);
		return (diff - at2/2) / this.duration;
	}

}
