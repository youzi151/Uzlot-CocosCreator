import { Event } from "../../../Uzil";


export class AniAct {
	
	/*== Constructor ==============================================*/

	constructor (args: Object) {

		this._setProp(args, 'timeScale');
		this._setProp(args, 'rootNode');
	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/* 是否播放中 */
	public isPlaying : boolean = false;

	/* 時間比例 */
	public timeScale : number = 1;
	
	/* 參考根容器 */
	public rootNode : cc.Node = null;

	/*== Event ====================================================*/

	/* 當演出開始 */
	public onStart : Event = new Event();

	/* 當演出結束 */
	public onEnd : Event = new Event();

	public testNum : number = 5;

	/*== Public Function ==========================================*/

	public update (dt: number) : void {
		if (!this.isPlaying) return;

		this._update(dt * this.timeScale);
	}

	/* 執行 */
	public play () : void {
		this.isPlaying = true;
		this._play();

		this.onStart.call();
	}

	/* 停止 */
	public stop () : void {

		this.isPlaying = false;
		
		this._stop();

		this.onEnd.call();
	}

	/* 暫停 */
	public pause () : void {
		this.isPlaying = false;
		this._pause();
	}

	/* 恢復 */
	public resume () : void {
		this.isPlaying = true;
		this._resume();
	}

	/*== 基本功能 =================*/

	/*== 其他功能 =================*/

	/*== Protected Function =======================================*/

	// 自定義 ==========================

	/* 播放 */
	protected _update (dt: number) : void {
		this.testNum -= dt;
		if (this.testNum > 0) return;
		this.stop();
	}

	/* 播放 */
	protected _play () : void {

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


	// 公用 ============================

	protected _setProp(args: Object, key: string){
		if (args[key] == undefined) return;
		this[key] = args[key];
	}

	protected _getRoot (_node: cc.Node) : cc.Node {
		let node = _node;
		let scene = cc.director.getScene();

		let tryTime = 100;
		while (node.parent != scene){

			node = node.parent;

			if (tryTime-- < 0) return node;
		}
		return node;
	}

	protected _getFixedWorldPos (worldPos: cc.Vec2) : cc.Vec2 {
		if (CC_EDITOR && this.rootNode){
			return this.rootNode.convertToWorldSpaceAR(worldPos);
		}else{
			return worldPos;
		}
	}

	protected _getEase (inOutArray) {
		let ease = null;
		if (inOutArray.length == 1){
			ease = [inOutArray[0], 0, 1-inOutArray[0], 1];
		} else if (inOutArray.length == 2){
			ease = [inOutArray[0], 0, 1-inOutArray[1], 1];
		} else if (inOutArray.length == 4){
			ease = [inOutArray[0], inOutArray[1], 1-inOutArray[2], 1-inOutArray[3]];
		}
		
		return ease;
	}

	/*== Private Function =========================================*/

}
