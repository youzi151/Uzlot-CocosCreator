import { AniAct } from "../AniAct";


export class AniSpin extends AniAct {
	
	/*== Constructor ==============================================*/

	constructor (args: Object){
		super(args);

		// 目標
		this._setProp(args, 'actorNode');
		
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

	/* 速度 */
	public speed : number = 0;
	
	/* 加速度 */
	public acceleration : number = 0;
	
	/* 曲線資料 */
	public curve : Object = null;
	
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

		// 目標節點
		const node: cc.Node = this.actorNode;

		// 加速度
		this.speed += this.acceleration * dt;

		// 速度
		node.rotation += this.speed * dt;

		// 持續時間
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
