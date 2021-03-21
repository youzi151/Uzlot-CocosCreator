import { AudioObj, AudioLayer } from "../index_AudioMgr";
import { Uzil } from "../../../Uzil";

const {ccclass, property} = cc._decorator;

@ccclass
export class AudioMgr extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/** 單例 */
	public static instance = null;

	/** 取得單例 */
	public static getInstance() : AudioMgr {
		return Uzil.getComp('AudioMgr') as AudioMgr;
	}

	/** 播放 */
	public static play (id: string) : void {
		this.getInstance().play(id);
	}
	/** 暫停 */
	public static pause (id: string) : void {
		this.getInstance().pause(id);
	}
	/** 恢復 */
	public static resume (id: string) : void {
		this.getInstance().resume(id);
	}
	/** 停止 */
	public static stop (id: string) : void {
		this.getInstance().stop(id);
	}

	/** 取得音效 */
	public static audio (id: string) : AudioObj {
		return this.getInstance().get(id);
	}

	/** 取得分層 */
	public static layer (id: string) : AudioLayer {
		return this.getInstance().layer(id);
	}

	/** 移除分層 */
	public static rmlayer (id: string) : void {
		this.getInstance().removeLayer(id);
	}

	/*== Member ===================================================*/

	/** ID 與 音效物件 */
	public id2AudioObj : Map<string, AudioObj> = new Map<string, AudioObj>();

	/** ID 與 分層 */
	public id2Layer : Map<string, AudioLayer> = new Map<string, AudioLayer>();
	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {
		
	}

	update (dt) {
		
		
	}

	
	/*== Public Function ==========================================*/


	/** 註冊 */
	public register (id: string, audioObj: AudioObj) : void {
		this.id2AudioObj.set(id, audioObj);
	}

	/** 取得 */
	public get (id: string) : AudioObj {
		if (this.id2AudioObj.has(id) == false) return null;
		return this.id2AudioObj.get(id);
	}
	
	/** 播放 */
	public play (id: string) : void {
		let audioObj = this.get(id);
		if (audioObj) {
			audioObj.play();
		}
	}

	/** 暫停 */
	public pause (id: string) : void {
		let audioObj = this.get(id);
		if (audioObj) {
			audioObj.pause();
		}
	}

	/** 恢復 */
	public resume (id: string) : void {
		let audioObj = this.get(id);
		if (audioObj) {
			audioObj.resume();
		}
	}

	/** 停止 */
	public stop (id: string) : void {
		let audioObj = this.get(id);
		if (audioObj) {
			audioObj.stop();
		}
	}
	
	/** 取得分層 */
	public layer (id: string) : AudioLayer {
		if (this.id2Layer.has(id) == false) {
			let layer = new AudioLayer();
			layer.id = id;
			this.id2Layer.set(id, layer);
		}
		return this.id2Layer.get(id);
	}

	
	/** 移除分層 */
	public removeLayer (id: string) {
		if (this.id2Layer.has(id) == false) return;
		
		let layer = this.layer(id);
		layer.delete();

		this.id2Layer.delete(id);
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

