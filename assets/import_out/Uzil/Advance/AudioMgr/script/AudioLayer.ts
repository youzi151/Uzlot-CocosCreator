import { AudioMgr, AudioObj } from "../index_AudioMgr";

export class AudioLayer {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** ID */
	public id : string = "";

	/** ID 與 音效物件 */
	public audios : Array<string> = [];

	/** 優先度 */
	// 值越大，越優先
	public priority : number = 5;

	/** 音量 */
	public get volume () {
		return this._volume;
	}
	public set volume (val) {
		this.vol(val);
	}
	private _volume : number = -1;//-1: 不設置
	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {
		
	}

	update (dt) {
		
		
	}

	
	/*== Public Function ==========================================*/

	/** 移除圖層 */
	public delete () : void {
		let toRm = [];
		for (let each of this.audios) {
			toRm.push(each);
		}
		for (let each of toRm) {
			this.remove(each);
		}
	}

	/** 取得 */
	public get (id: string) : AudioObj {
		for (let each of this.audios) {
			if (each != id) continue;
			return AudioMgr.audio(each);
		}
		return null;
	}

	/** 新增 */
	public add (id: string) : AudioLayer {
		if (this.audios.indexOf(id) != -1) return this;
		
		let audioObj = AudioMgr.audio(id);
		if (!audioObj) return this;

		this.audios.push(id);

		audioObj.addLayer(this.id);

		return this;
	}

	/** 轉移 */
	// 與新增不同，會將該Audio從原本該Audio所屬的Layer中移除
	public move (id: string) : AudioLayer {
		let audioObj = AudioMgr.audio(id);
		if (!audioObj) return this;

		for (let layerID of audioObj.layers) {
			let layer = AudioMgr.layer(layerID);
			if (layer){
				layer.remove(id);
			}
		}

		return this.add(id);
	}
	
	/** 移除 */
	public remove (id: string) : void {
		let idx = this.audios.indexOf(id);
		if (idx == -1) return;

		// 讓 音效物件 移除 圖層
		let audio = this.get(id);
		audio.removeLayer(this.id);

		// 圖層 移除 音效
		this.audios.splice(idx, 1);
	}

	/** 音量 */
	public vol (vol: number) : AudioLayer {
		this._volume = vol;
		this.eachAudio((audio)=>{
			audio.updateVolume();
		});
		return this;
	}

	/** 優先度 */
	public prio (priority: number) : AudioLayer {
		this.priority = priority;
		this.eachAudio((audio)=>{
			audio.updateLayers();
		});
		return this;
	}

	/** 播放 */
	public play () : void {
		this.eachAudio((audio)=>{
			audio.pause();
		});
	}

	/** 暫停 */
	public pause () : void {
		this.eachAudio((audio)=>{
			audio.pause();
		});
	}

	/** 恢復 */
	public resume (id: string) : void {
		this.eachAudio((audio)=>{
			audio.resume();
		});
	}

	/** 停止 */
	public stop (id: string) : void {
		this.eachAudio((audio)=>{
			audio.stop();
		});
	}

	/** 每個音效 */
	public eachAudio (fn: (item: AudioObj)=>void) {
		for (let each of this.audios) {
			let audio = AudioMgr.audio(each);
			if (!audio) continue;
			fn(audio);
		}
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

