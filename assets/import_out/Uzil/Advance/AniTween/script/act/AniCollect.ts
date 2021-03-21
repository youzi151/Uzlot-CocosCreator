import { AniAct } from "../AniAct";

import { BezierData, Mathf } from "../../../../Uzil";

/* 動態類型 */
export enum AniCollect_MoveType {
	SPEED,
	DURATION,
}

export class AniCollect extends AniAct {
	
	/*== Constructor ==============================================*/

	constructor (args: Object){
		super(args);

		// 演出物件
		this._setProp(args, 'actors');

		// 目標
		this._setProp(args, 'target');

		// 動態類型
		this._setProp(args, 'moveType');

		// 半徑
		this._setProp(args, 'areaRadius');

		// 速度
		this._setProp(args, 'speed');
		this._setProp(args, 'acceleration');
		
		// 緩動
		this._setProp(args, 'easeInOut');

		// 持續時間
		this._setProp(args, 'duration');
	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/* 演出物件 */
	public actors : Array<cc.Node> = [];
	private _actorInfos : Array<any> = [];

	/* 目標 */
	public target : any = null;

	/* 目標位置 區域半徑 */
	public areaRadius : number = 0;

	/* 動態類型 */
	public moveType : AniCollect_MoveType = AniCollect_MoveType.SPEED;

	/* 速度 */
	public speed : number = 0;
	public acceleration : number = 0;
	
	/* 持續時間 */
	public duration : number = 5;
	/* 已執行的時間 */
	private _runnedTime : number = 0;

	/* 緩動 */
	public easeInOut : Array<number> = [0];
	public _easeBezier : BezierData = null;


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

		let isDone = true;

		//== 依照動態類型 ===========
		
		// 動態類型：速度
		if (this.moveType == AniCollect_MoveType.SPEED) {
		
			// 加速度
			this.speed += this.acceleration * dt;

			// 取得每一個演出物件資訊
			for (let each of this._getAllActorInfo()){

				// 取得 目標位置
				let targetPos: cc.Vec2 = each.targetPos;
				// 若尚未定義 則 定義
				if (!targetPos) {
					targetPos = this._getTargetLocalPos(each.node.parent);
					each.targetPos = targetPos;
				}
				
				// 欲移動的新位置
				let newPos = Mathf.moveTowardV2(each.pos, targetPos, this.speed * dt);
				
				// 設置新位置
				each.node.setPosition(newPos);

				// 若 尚未抵達 目標位置 則 設尚未完成
				if (newPos.equals(targetPos) == false){
					isDone = false;
				}

			}


		// 動態類型：時間
		} else if (this.moveType == AniCollect_MoveType.DURATION) {


			for (let each of this._getAllActorInfo()){

				// 目標位置
				let targetPos: cc.Vec2 = each['targetPos'];
				if (!targetPos) {
					targetPos = this._getTargetLocalPos(each.node.parent);
					each.targetPos = targetPos;
				}
				
				// 移動
				each.percent = Mathf.moveToward(each.percent, 1, this.speed * dt);
				let easePercent = this._easeBezier.compute(each.percent);
				let newPos = Mathf.lerpV2(each.orinPos, targetPos, easePercent);

				each.node.setPosition(newPos);

				if (newPos.equals(targetPos) == false){
					isDone = false;
				}

			}
			
		}

		// 若已經完成 則 停止運作
		if (isDone){
			this.stop();
		}

	}

	/* 播放 */
	protected _play () : void {
		
		//== 依照動態類型 ===========

		// 速度============
		if (this.moveType == AniCollect_MoveType.SPEED){
			// this.speed = this.speed;
		}

		// 時間============
		else if (this.moveType == AniCollect_MoveType.DURATION) {
			this.speed = 1 / this.duration;
		}

		// 初始化 演出物件資訊
		this._actorInfos = [];
		for (let each of this.actors){
			this._actorInfos.push({
				// 節點
				'node': each,
				// 原始位置
				'orinPos': each.position,
				// 百分比進度
				'percent': 0,
			});
		}

		// 初始化 緩動
		let ease = this._getEase(this.easeInOut);
		if (ease){
			this._easeBezier = BezierData.easyBezier(ease[0],ease[1],ease[2],ease[3]);
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
	private _getTargetWorldPos (isArea: boolean = true) {
		// 若 目標 為 節點
		if (this.target instanceof cc.Node) {

			let locator = this.target;
			let pos = locator.position;
			
			// 若為 區域內隨機 則 偏移位置
			if (isArea) {
				let size = locator.getContentSize();
				let left   = 0 - (size.width  * locator.anchorX);
				let right  = 0 + (size.width  * (1-locator.anchorX));
				let top    = 0 + (size.height * (1-locator.anchorY));
				let bottom = 0 - (size.height * locator.anchorY);
				
				pos.x += cc.misc.lerp(left, right, Math.random());
				pos.y += cc.misc.lerp(bottom, top, Math.random());
			}
	
			// 取得世界座標
			let worldPos = locator.parent.convertToWorldSpaceAR(pos);
			return worldPos;

		}
		
		// 若 目標 為 座標
		else if (this.target instanceof cc.Vec2) {
			
			let pos = this.target.clone();
			
			// 若為 區域內隨機 則
			if (isArea) {
				// 取隨機角度 轉換 為 向量
				let offset = Mathf.angleToVec2(359 * Math.random());
				// 乘上 區域半徑
				offset = offset.normalize().mul(this.areaRadius);
				
				// 偏移
				pos.addSelf(offset);
			}

			// 若是在編輯器中，要把對的先轉換成錯的世界座標
			return this._getFixedWorldPos(pos);
		}
	}

	/* 取得目標在地位置 */
	private _getTargetLocalPos (parent: cc.Node) {
		let worldPos: cc.Vec2 = this._getTargetWorldPos();
		const targetPos: cc.Vec2 = parent.convertToNodeSpaceAR(worldPos);
		return targetPos;
	}

	/* 取得節點世界座標 */
	private _getWorldPosByNode (node:cc.Node) {
		return node.parent.convertToWorldSpaceAR(node.getPosition());
	}

	/* 取得所有成員資訊 */
	private _getAllActorInfo () {

		// 取得世界座標位置
		let targetPos = this._getTargetWorldPos();
		
		// 每個演出物件
		for (let each of this.actors){

			// 演出物件的世界座標
			let eachPos = this._getWorldPosByNode(each);

			// 與目標的距離
			let distance = targetPos.sub(eachPos);
			
			// 在現存資訊中 更新資訊
			for (let eachInfo of this._actorInfos){

				if (eachInfo.node == each){
					// 位置
					eachInfo['pos'] = each.position;
					// 世界位置
					eachInfo['worldPos'] = eachPos;
					// 與目標距離
					eachInfo['distance'] = distance;
				}
			}
		}

		return this._actorInfos;
	}

		
}
