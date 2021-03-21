import { Animator, ActObj } from "../../../Uzil/Uzil";
import { ReelColObj } from "../../Reel/index_Reel";
import { Prefab2NodeMgr } from "../../Slot/index_Slot";

const {ccclass, property} = cc._decorator;

@ccclass
export class ActObj_AnimOnCol extends ActObj {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 動畫 */
	public anim : Animator = null;

	/** 動畫狀態名稱 */
	public animStateName : string = "default";

	public prefabResID : string = null;

	private _colObj : ReelColObj = null;
	
	/*== Event ====================================================*/

	/** 當XX */
	// public onXX : Event = new Event();
	
	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {

	}

	start () {
		
	}

	update (dt) {
		
	}
	
	/*== Public Function ==========================================*/

	/** 演出 */
	public play (args: any = null) : void {
		if (this.isPlaying) return;
		this.isPlaying = true;

		if (this._colObj != null) {
			
			let node = this._requestAnimNode(this.prefabResID);

			if (node != null) {

				node.active = true;
				this._colObj.addFX(node);
				
				this.anim = node.getComponent("Animator");

				if (this.anim != null) {
					this.anim.play(this.animStateName);
				}
			}

		}

	}

	/** 停止 */
	public stop () : void {
		if (!this.isPlaying) return;
		this.isPlaying = false;

		if (this.anim != null) {
			this._colObj.removeFx(this.anim.node);
			this._recoveryAnimNode(this.anim);
		}

		this.onDone.call();
	}

	/** 設置 要演出的 圖標格物件 */
	public setColObj (colObj: ReelColObj) {
		this._colObj = colObj;
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	private _requestAnimNode (prefabResID) : cc.Node {
		if (prefabResID == null) return null;
		let node = Prefab2NodeMgr.request(prefabResID);
		return node;
	}

	private _recoveryAnimNode (anim: Animator) : void {
		anim.stop();
		anim.node.active = false;
		anim.node.setParent(cc.director.getScene());
		Prefab2NodeMgr.recovery(anim.node);
	}

}