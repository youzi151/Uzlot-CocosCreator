import { AniAct } from "../AniAct";

/* 動態類型 */
export enum AniMove_MoveType {
	VELOCITY,
	// CURVE
}

export class AniMove extends AniAct {
	
	/*== Constructor ==============================================*/

	constructor (args: Object){
		super(args);

		// 演出物件
		this._setProp(args, "actorNode");

		// 動態類型
		this._setProp(args, "moveType");

		// 速度
		if (args['velocity']){
			this.velocity = args['velocity'];
		}
		
		// 加速度
		if (args['acceleration']){
			this.acceleration = args['acceleration'];
		}
		
		// 持續時間
		if (args['duration']){
			this.duration = args['duration'];
		}

	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/* 演出物件 */
	public actorNode : cc.Node = null;

	/* 動態類型 */
	public moveType : AniMove_MoveType = AniMove_MoveType.VELOCITY;

	/* 速度 */
	public velocity : cc.Vec2 = cc.Vec2.ZERO;
	
	/* 加速度 */
	public acceleration : cc.Vec2 = cc.Vec2.ZERO;
	
	/* 曲線資料 */
	// public curve : Object = null;
	
	/* 持續時間 */
	public duration : number = 5;
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

		const node: cc.Node = this.actorNode;

		//== 依照動態類型 =========================

		// 速度 ===
		if (this.moveType == AniMove_MoveType.VELOCITY){

			// 速度
			this.velocity.addSelf(this.acceleration.mul(dt));

			// 位置
			let position: cc.Vec2 = node.position;
			position.addSelf(this.velocity.mul(dt));
			node.setPosition(position);

		}

		// TODO 
		// 曲線 ===
		// else if (this.moveType == AniMove_MoveType.CURVE){
		
		// }



		// 持續時間 ==============================
		if (this.duration > 0){

			this._runnedTime += dt;
			if (this._runnedTime >= this.duration) {
				this.stop();
			}
			
		}
	}

	/* 播放 */
	protected _play () : void {
		this._runnedTime = 0;
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

}
