import { ActObj } from "../../index_Act";

const {ccclass, property} = cc._decorator;

@ccclass
export class ActObj_Repeat extends ActObj {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 演出成員 */
	@property(ActObj)
	public acts : ActObj[] = [];

	/** 當前播放序號 */
	public currentPlayingIdx = -1;

	/** 成員ID 對應 播放時間 */
	public id2EachPlayTime_sec : Map<string, number> = new Map<string, number>();

	/** 預設每個成員播放時間 */
	public defaultEachPlayTime_sec : number = 2;


	/** 當前演出 */
	private _currentAct : ActObj = null;
	/** 當前演出的播放時間 */
	private _currentActPlayTime_sec : number = 0;
	/** 當前演出的已播放時間 */
	private _currentActPlayedTime_sec : number = 0;

	
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
		if (!this.isPlaying) return;

		if (this._currentAct == null) {
			if (this.acts.length != 0) {
				this.playNext();
			}
		}

		this._currentActPlayedTime_sec += dt;

		if (this._currentActPlayedTime_sec > this._currentActPlayTime_sec) {
			
			if (this.acts.length > 1) {
				this._currentActPlayedTime_sec = 0;
				this._currentAct.stop();
			}

		}
	}
	
	/*== Public Function ==========================================*/

	/** 演出 */
	public play (args: any = null) : void {
		if (this.isPlaying) return;
		this.isPlaying = true;

		this.playNext();
	}

	/** 停止 */
	public stop () : void {
		if (!this.isPlaying) return;
		this.isPlaying = false;

		this.currentPlayingIdx = -1;
		this._currentAct = null;
		this._currentActPlayTime_sec = 0;
		this._currentActPlayedTime_sec = 0;

		for (let each of this.acts) {
			each.stop();
		}

		this.onDone.call();
	}

	/** 增加演出 */
	public addAct (act: ActObj) : void {
		this.acts.push(act);
	}

	/** 移除演出 */
	public removeAct (act: ActObj) : void {
		this.acts.splice(this.acts.indexOf(act), 1);
		if (this.isPlaying && act == this._currentAct) {
			this.playNext();
		}
	}

	/** 播放下一個 */
	public playNext () : void {
		if (!this.isPlaying) return;
		
		let self = this;

		self.currentPlayingIdx++;
		if (self.currentPlayingIdx >= self.acts.length) {
			self.currentPlayingIdx = 0;
		}

		self._currentAct = self.acts[self.currentPlayingIdx];

		if (self._currentAct == null) {
			return;
		}

		let playTime : number = self.id2EachPlayTime_sec.get(self._currentAct.id);
		if (playTime == undefined) {
			playTime = self.defaultEachPlayTime_sec;
		}

		self._currentAct.play({
			time: playTime
		});

		self._currentActPlayTime_sec = playTime;
		self._currentActPlayedTime_sec = 0;

		self._currentAct.onDone.addOnce(()=>{
			self.playNext();
		});

	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	

}