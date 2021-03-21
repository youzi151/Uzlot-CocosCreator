import { Invoker, InvokerUpdateTask } from "../../../Uzil"; 

import { 
	AniAct,
	AniMove,
	AniGoto,
	AniSpin,
	AniSwing,
	AniLookAt,
	AniSpiral,
	AniPath,
	AniCollect,
 } from "../index_AniTween";


export class AniTween {
	
	/*== Constructor ==============================================*/

	/*== Static ===================================================*/



	/*== Member ===================================================*/

	/* 是否播放中 */
	public isPlaying : boolean = false;

	/* 當前序號 */
	public currentIdx : number = -1;
	public currentAct : AniAct = null;

	/* 演出佇列 */
	public actQueue : Array<AniAct> = [];

	private _updateTask : InvokerUpdateTask = null;

	/*== Event ====================================================*/

	/*== Public Function ==========================================*/

	public update (dt: number) : void {
		if (!this.isPlaying) return;
		this.currentAct.update(dt);
	}

	
	/*== 播放控制 =================*/

	/* 播放 */
	public play () : void {
		let self = this;
		for (let i = 0; i < self.actQueue.length; i++){
			let each : AniAct = self.actQueue[i];

			each.onEnd.remove("playNext");
			each.onEnd.add(()=>{

				self.playNext();

			}).name("playNext");
		}

		// cc.log("play");
		if (CC_EDITOR) {

		}else{
			self._updateTask = Invoker.update((dt)=>{
				self.update(dt);
			});
		}

		self.isPlaying = true;
		
		self.playNext();
	}
	/* 播放 */
	public stop () : void {
		Invoker.stop(this._updateTask);
		this.isPlaying = false;
		this.currentIdx = -1;
		// cc.log("stop");
	}
	/* 暫停 */
	public pause () : void {
		this.isPlaying = false;
	}
	/* 恢復 */
	public resume () : void {
		this.isPlaying = true;
	}

	
	/*== 播放控制 =================*/

	/* 排入 */
	public queue (act: AniAct) : AniTween {
		this.actQueue.push(act);
		return this;
	}

	/* 播放下一個 */
	public playNext () : void {
		this.currentIdx++;
		
		if (this.currentIdx >= this.actQueue.length){
			this.stop();
			return;
		}
		// cc.log("playNext");

		this.currentAct = this.actQueue[this.currentIdx];
		this.currentAct.play();
	}

	/*== 動態功能 =================*/

	public move (data) : AniTween {
		return this.queue(new AniMove(data));
	}

	public goto (data) : AniTween {
		return this.queue(new AniGoto(data));		
	}

	public spin (data) : AniTween {
		return this.queue(new AniSpin(data));
	}

	public swing (data) : AniTween {
		return this.queue(new AniSwing(data));
	}

	public lookAt (data) : AniTween {
		return this.queue(new AniLookAt(data));
	}

	public around (data) : AniTween {
		return this.spiral(data);
	}
	public spiral (data) : AniTween {
		return this.queue(new AniSpiral(data));
	}

	public path (data) : AniTween {
		return this.queue(new AniPath(data));
	}

	public collect (data) : AniTween {
		return this.queue(new AniCollect(data));
	}

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

}
