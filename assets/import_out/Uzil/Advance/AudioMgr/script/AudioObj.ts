import { AudioMgr, AudioLayer, AudioState } from "../index_AudioMgr";

const {ccclass, property} = cc._decorator;

@ccclass
export class AudioObj extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	@property(cc.AudioSource)
	public audioSource : cc.AudioSource = null;

	/** 音效ID */
	@property()
	public audioID : string = "";

	/** 狀態 */
	public state : AudioState = AudioState.PAUSE;

	/** 所屬分層 */
	public layers : Array<string> = [];

	/** 音量 */
	public volume : number = 1;

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {

		if (this.audioSource == null) {
			this.audioSource = this.getComponent(cc.AudioSource);
			if (this.audioSource == null) return;
		}

		let isPlaying = this.audioSource.isPlaying;
		let playTime = this.audioSource.getCurrentTime();
		if (isPlaying && playTime != 0) {
			this.state = AudioState.PLAY;
		} else if (!isPlaying && playTime != 0){
			this.state = AudioState.PAUSE;
		} else {
			this.state = AudioState.STOP;
		}

		// 向總管註冊
		AudioMgr.getInstance().register(this.audioID, this);

		// 向分層註冊
		for (let each of this.layers) {
			AudioMgr.layer(each).add(this.audioID);
		}
	}

	start () {
		
	}

	update (dt) {
		
		
	}

	
	/*== Public Function ==========================================*/

	/** 新增分層 */
	public addLayer (layerID: string) : void {
		if (this.layers.indexOf(layerID) != -1) return;
		this.layers.push(layerID);
		this.updateLayers();
	}
	/** 移除分層 */
	public removeLayer (layerID: string) : void {
		let idx = this.layers.indexOf(layerID);
		if (idx == -1) return;
		this.layers.splice(idx, 1);
		this.updateLayers();
	}

	/** 音量 */
	public setVolume (vol: number) : void {
		this.volume = vol;
		this.updateVolume();
	}

	/** 取得分層音量 */
	public getLayeredVolume () : number {
		let layerdVol = -1;

		// 每個分層ID
		for (let each of this.layers) {
			// 取得分層
			let layer = AudioMgr.layer(each);
			if (!layer) continue;

			// 若音量未指定 則 忽略
			if (layer.volume == -1) continue;
			
			// 取得首個分層的指定音量
			layerdVol = layer.volume;
			break;
		}
		// cc.log("layerdVol:"+layerdVol);
		return layerdVol;
	}

	/** 播放 */
	public play () : void {
		this.audioSource.play();
		this.state = AudioState.PLAY;
	}

	/** 暫停 */
	public pause () : void {
		this.audioSource.pause();
		this.state = AudioState.PAUSE;
	}

	/** 恢復 */
	public resume () : void {
		if (this.audioSource.isPlaying) {
			this.audioSource.resume();
		} else {
			this.audioSource.play();
		}
		this.state = AudioState.PLAY;
	}

	/** 停止 */
	public stop () : void {
		this.audioSource.stop();
		this.state = AudioState.STOP;
	}
	
	/** 刷新分層資訊 */
	public updateLayers () : void {
		// 暫存
		let id2Layers = new Map<string, AudioLayer>();
		// 從暫存中取得 或 取得
		let getLayer = (id)=>{

			if (id2Layers.has(id)) {
				return id2Layers.get(id);
			}

			let layer = AudioMgr.layer(id);
			if (layer == null) return null;

			id2Layers.set(id, layer);

			return layer;
		};
	
		this.layers.sort((a,b)=>{
			let aLayer = getLayer(a);
			let bLayer = getLayer(b);
			if (!aLayer) return 1;
			if (!bLayer) return -1;
			return bLayer.priority - aLayer.priority
		});

		this.updateVolume();
	}

	/** 刷新音量 */
	public updateVolume () : void {
		let newVol = 1;
		
		// 若音效物件本身有指定音量 則 加乘
		if (this.volume != -1) {
			newVol *= this.volume;
		}
		
		// 若分層有指定音量 則 加乘
		let layeredVolume = this.getLayeredVolume();
		if (layeredVolume != -1) {
			newVol *= layeredVolume;
		}

		// cc.log("newVol:"+newVol+" / this.volume:"+this.volume+" / layeredVolume:"+layeredVolume);
		
		// 設置音量
		this.audioSource.volume = newVol;
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	
}

