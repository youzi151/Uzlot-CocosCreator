import { StateCtrl, Event, Time, Mathf } from "../../../../Uzil/Uzil";
import { ReelContainer, ReelState, ReelStripData } from "../../../Reel/index_Reel";
import { ReelRule, SymbolCode } from "../../../Rule/index_Rule";
import { GameCtrl } from "../Game/GameCtrl";

const {ccclass, property} = cc._decorator;

/** 
 * 滾輪任務
 * 用於將 停輪或滾動 的所需資訊 錄入排程中
 */
export class ReelTask {
	public reelIdx : number = -1;
	public delay_sec : number = 0;
	public delayLeft_sec : number = 0;
}


/**
 * 滾輪控制器
 * 
 */
@ccclass
export class ReelCtrl extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/*== 元件 ===================================*/

	/** 滾輪容器 */
	@property(ReelContainer)
	public reelContainer : ReelContainer = null;

	/** 狀態控制 */
	@property(StateCtrl)
	public stateCtrl : StateCtrl = null;

	/** 遊戲 控制 */
	public gameCtrl : GameCtrl = null;

	/*== 屬性 ===================================*/

	/** 是否可以滾動 */
	public isSpinable : boolean = true;

	/** 是否滾動中 */
	public isSpinning : boolean = false;
	
	/** 是否暫停中 */
	public isPause : boolean = false;
	
	/** 是否手動停輪 */
	public isManualStop : boolean = false;

	/** 是否 開始滾動 被呼叫過 */
	public isSpinBeginCall : boolean = false;

	/** 是否 開始停輪 被呼叫過 */
	public isStopBeginCall : boolean = false;

	/*== 滾輪/停輪 ===============================*/

	/** 停輪位置 */
	public stopPosList : number[] = null;
	
	/** 下個滾輪的軸 */
	private _nextSpinReelIdx : number = 0;
	/** 等候滾輪 */
	private _waitToSpinTasks : ReelTask[] = [];

	/** 下個停輪的軸 */
	private _nextStopReelIdx : number = 0;
	/** 等候停輪 */
	private _waitToStopTasks : ReelTask[] = [];

	/*== Event ====================================================*/

	/** 當 請求滾動 */
	public onRequestSpin : Event = new Event();

	/** 當 請求停輪 */
	public onRequestStop : Event = new Event();

	/** 當 實際停輪 */
	public onStopBegin : Event = new Event();

	/** 當 每輪滾動開始 */
	public onEachSpinStart : Event = new Event();

	/** 當 每輪停輪開始 */
	public onEachStopStart : Event = new Event()

	/** 當 每輪停輪結束 */
	public onEachStopDone : Event = new Event();

	/** 當 所有停輪 */
	public onAllStopDone : Event = new Event();

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {
		let self = this;

		let roller = this.reelContainer;

		// 初始化 狀態控制
		this.stateCtrl.init(this);
		
		// 註冊 當全部停輪完畢時
		roller.onAllStopDone.add(()=>{
			// 關閉 滾動中
			self.turnSpinning(false);
			
			// 結束 手動停輪
			self.isManualStop = false;

			// 清除停輪任務
			self._waitToStopTasks.splice(0, self._waitToStopTasks.length);

			// 呼叫事件
			self.onAllStopDone.call();
		});

		// 註冊 當每輪滾動開始
		roller.onSpin.add((event, reelIdx)=>{
			self.onEachSpinStart.call(reelIdx);
		});

	}


	/*
	##     ## ########  ########     ###    ######## ######## 
	##     ## ##     ## ##     ##   ## ##      ##    ##       
	##     ## ##     ## ##     ##  ##   ##     ##    ##       
	##     ## ########  ##     ## ##     ##    ##    ######   
	##     ## ##        ##     ## #########    ##    ##       
	##     ## ##        ##     ## ##     ##    ##    ##       
	 #######  ##        ########  ##     ##    ##    ######## 
	*/


	update (_dt) {
		let dt = _dt * Time.timeScale;

		// 若 暫停 則 不執行
		if (this.isPause) return;

		let self = this;

		/**
		 * 用兩層檢查，是因為有可能在前一輪開始滾動/停輪後，後一輪的剩餘時間又被例如事件或其他地方改變
		 * 並且 要在檢查之後才推進時間，卻又不能在剩餘時間被改變後又推進時間
		 */


		// 檢查 所有滾動任務，若倒數完畢 則 執行
		let spinTask = this._waitToSpinTasks.slice();
		let onTimeSpinTask : ReelTask[] = [];
		for (let each of spinTask) {
			// 先檢查
			if (each.delayLeft_sec <= 0) {
				onTimeSpinTask.push(each);
			}
			// 再推進時間
			each.delayLeft_sec -= dt;
		}
		for (let each of onTimeSpinTask) {
			// 再檢查一次
			if (each.delayLeft_sec > 0) continue;

			// 若 中途暫停 則 返回
			if (this.isPause) return;
			
			// 滾動
			let reel = this.reelContainer.reels[each.reelIdx];
			reel.spin();

			// 移除
			let taskIdx = this._waitToSpinTasks.indexOf(each);
			this._waitToSpinTasks.splice(taskIdx, 1);
		}

		// 檢查 所有停輪任務，若倒數完畢 則 執行
		let stopTask = this._waitToStopTasks.slice();
		let onTimeStopTask : ReelTask[] = [];
		for (let each of stopTask) {
			// 先檢查
			if (each.delayLeft_sec <= 0) {
				onTimeStopTask.push(each);
			}

			// 再推進時間
			each.delayLeft_sec -= dt;
		}
		for (let eachTask of onTimeStopTask) {

			// 再檢查一次
			if (eachTask.delayLeft_sec > 0) continue;

			// 若 中途暫停 則 返回
			if (this.isPause) return;

			// 若 等候滾動中
			let isWaitSpin = false;
			for (let eachSpinTask of this._waitToSpinTasks) {
				if (eachSpinTask.reelIdx == eachTask.reelIdx) {
					isWaitSpin = true;
					break;
				}
			}
			if (isWaitSpin) continue;
			
			// 停輪
			let reel = this.reelContainer.reels[eachTask.reelIdx];
			let stopPos = this.stopPosList[eachTask.reelIdx];
			
			// 呼叫 當每輪停輪 開始
			self.onEachStopStart.call(eachTask);
			
			// 當該輪停輪完成
			reel.onStopDone.addOnce(()=>{
				// 呼叫 當每輪停輪 完成
				self.onEachStopDone.call(eachTask);
			});

			// 呼叫停輪
			reel.stop(stopPos);


			// 移除
			let taskIdx = this._waitToStopTasks.indexOf(eachTask);
			this._waitToStopTasks.splice(taskIdx, 1);
		}

	}

	/*== Event Function ===========================================*/
	
	/*== Public Function ==========================================*/

	public canSpin () : boolean {

		if (this.isSpinning) return false;
		if (this.isSpinable == false) return false;

		return true;
	}

	/*
	 ######  ######## ########     ######  ######## ########  #### ########  
	##    ## ##          ##       ##    ##    ##    ##     ##  ##  ##     ## 
	##       ##          ##       ##          ##    ##     ##  ##  ##     ## 
	 ######  ######      ##        ######     ##    ########   ##  ########  
	      ## ##          ##             ##    ##    ##   ##    ##  ##        
	##    ## ##          ##       ##    ##    ##    ##    ##   ##  ##        
	 ######  ########    ##        ######     ##    ##     ## #### ##        
	*/

	/**
	 * 設置滾輪表
	 * @param strip 滾輪表陣列
	 */
	public setStrip (stripDatas: ReelStripData[], isShift: boolean = false) : void {
		this.reelContainer.setStrip(stripDatas, isShift);
	}

	/** 取得 滾輪表 */
	public getStrip () : ReelStripData[] {
		return this.reelContainer.getStrip();
	}

	/*
	 ######  ########  #### ##    ##
	##    ## ##     ##  ##  ###   ##
	##       ##     ##  ##  ####  ##
	 ######  ########   ##  ## ## ##
	      ## ##         ##  ##  ####
	##    ## ##         ##  ##   ###
	 ######  ##        #### ##    ##
	*/

	/**
	 * 請求滾動
	 */
	public requestSpin () : void {
		this.onRequestSpin.call();
	}

	/**
	 * 滾動所有
	 * @param reelDelay_sec 每輪延遲
	 */
	public spinAll (reelDelay_sec: number = 0) : ReelTask[] {
		let tasks = [];
		for (let row = 0; row < this.reelContainer.reels.length; row++) {
			let task = this.spin(row, row * reelDelay_sec);
			tasks.push(task);
		}

		// 開始滾動
		this.spinBegin();
		
		return tasks;
	}

	/**
	 * 滾動
	 * @param reelIdx 指定輪軸序號
	 * @param reelDelay_sec 執行延遲
	 */
	public spin (reelIdx: number = -1, reelDelay_sec: number = 0) : ReelTask {
		// cc.log("_spinAll");
	
		// 目標輪軸序號
		let targetReelIdx = reelIdx;

		// 若 指定為 下一輪
		if (reelIdx == -1) {
			// 指定為當前的下一輪
			targetReelIdx = this._nextSpinReelIdx;
		}
		if (targetReelIdx < 0 || targetReelIdx > this.reelContainer.reels.length-1) return null;
		
		// 檢查
		let reel = this.reelContainer.reels[targetReelIdx];
		if (reel.state != ReelState.IDLE) return null;

		// 設 下個滾動輪軸序號
		this._nextSpinReelIdx = targetReelIdx + 1;


		// 建立任務
		let task : ReelTask = {
			"reelIdx": targetReelIdx,
			"delay_sec": reelDelay_sec,
			"delayLeft_sec" : reelDelay_sec,
		};
		
		// 加入 滾輪任務列表
		this.setSpinTask(targetReelIdx, task);

		// 設置 已開始滾動
		this.isSpinning = true;

		// 開始滾動
		this.spinBegin();

		return task;
	}

	/*
	 ######  ########  #######  ########  
	##    ##    ##    ##     ## ##     ## 
	##          ##    ##     ## ##     ## 
	 ######     ##    ##     ## ########  
	      ##    ##    ##     ## ##        
	##    ##    ##    ##     ## ##        
	 ######     ##     #######  ##        
	*/

	/**
	 * 設置 停輪位置
	 * @param stopPos 
	 */
	public setStopPos (stopPos: number[]) {
		this.stopPosList = stopPos;
	}

	/** 請求停輪 */
	public requestStop () : void {
		this.onRequestStop.call();
	}

	/** 當 開始停輪 */
	public spinBegin () : void {
		let self = this;
		
		if (self.isSpinBeginCall) return;
		self.isSpinBeginCall = true;

		self.reelContainer.onStopDone.addOnce(()=>{
			self.isSpinBeginCall = false;
		});

		self.isStopBeginCall = false;
	}


	/** 當 開始停輪 */
	public stopBegin () : void {
		if (this.isStopBeginCall) return;
		this.isStopBeginCall = true;

		this.onStopBegin.call();
	}

	/**
	 * 停輪
	 * @param reelIdx 指定輪軸序號
	 * @param reelDelay_sec 執行延遲
	 */
	public stop (reelIdx: number, reelDelay_sec: number) : ReelTask {
		// cc.log("_stopAll");
		
		// 目標輪軸序號
		let targetReelIdx = reelIdx;

		// 若 無指定 則 視為 指定下一輪
		if (reelIdx == -1) {
			targetReelIdx = this._nextStopReelIdx;
		}
		// 範圍檢查
		if (targetReelIdx < 0 || targetReelIdx > this.reelContainer.reels.length-1) return null;

		// 目標輪軸
		let reel = this.reelContainer.reels[targetReelIdx];

		// 是否 有 還在等待滾動的輪
		let isWaitSpin = false;

		// 每一個 滾動任務
		for (let eachSpinTask of this._waitToSpinTasks) {

			// 若目標輪 在 還在等待滾動的輪 中
			if (eachSpinTask.reelIdx == targetReelIdx) {
				// 設置 有 還在等待滾動的輪
				isWaitSpin = true;
				break;
			}
		}

		// 若 不是滾動中 且 沒有還在等候滾動的輪 則 返回
		if (reel.state != ReelState.ROLLING && !isWaitSpin) return null;

		// 設 下個滾動輪軸序號
		this._nextStopReelIdx = targetReelIdx + 1;

		// 建立任務
		let task : ReelTask = {
			"reelIdx": targetReelIdx,
			"delay_sec": reelDelay_sec,
			"delayLeft_sec" : reelDelay_sec,
		};

		// 加入 滾輪任務列表
		this.setStopTask(targetReelIdx, task);

	}

	/** 立刻停輪所有 */
	public stopAllNow () : void {
		// 清除 任務
		this._waitToSpinTasks.splice(0, this._waitToSpinTasks.length);
		this._waitToStopTasks.splice(0, this._waitToStopTasks.length);

		this.reelContainer.setPos(this.stopPosList);
		let reels = this.reelContainer.reels;

		let length = Mathf.min(reels.length, this.stopPosList.length);

		// 若有 輪軸 是停止的 則 先呼叫滾動
		for (let reel of reels) {
			if (reel.state == ReelState.IDLE) {
				reel.spin();
			}
		}

		// 逐個停輪
		for (let reelIdx = 0; reelIdx < length; reelIdx++) {
			let reel = reels[reelIdx];
			let stopCol = this.stopPosList[reelIdx];
			reel.stopNow(stopCol);
		}
	}

	/**
	 * 立刻停輪
	 * @param reelIdx 指定輪
	 */
	public stopNow (reelIdx: number) : void {
		// 清除 任務
		let spinTask = this.getSpinTask(reelIdx);
		if (spinTask) {
			this._waitToSpinTasks.splice(this._waitToSpinTasks.indexOf(spinTask), 1);
		}
		let stopTask = this.getStopTask(reelIdx);
		if (stopTask) {
			this._waitToStopTasks.splice(this._waitToStopTasks.indexOf(stopTask), 1);
		}

		let reel = this.reelContainer.getReel(reelIdx);
		let stopCol = this.stopPosList[reelIdx];
		
		if (reel.isRolling) {
			this.onEachStopStart.call(stopTask);
			reel.stopNow(stopCol);
			// this.onEachStopDone.call(stopTask); // 已由他處註冊呼叫
		}
	}

	/*
	########     ###    ##     ##  ######  ########       ########  ########  ######  ##     ## ##     ## ######## 
	##     ##   ## ##   ##     ## ##    ## ##             ##     ## ##       ##    ## ##     ## ###   ### ##       
	##     ##  ##   ##  ##     ## ##       ##             ##     ## ##       ##       ##     ## #### #### ##       
	########  ##     ## ##     ##  ######  ######         ########  ######    ######  ##     ## ## ### ## ######   
	##        ######### ##     ##       ## ##             ##   ##   ##             ## ##     ## ##     ## ##       
	##        ##     ## ##     ## ##    ## ##             ##    ##  ##       ##    ## ##     ## ##     ## ##       
	##        ##     ##  #######   ######  ########       ##     ## ########  ######   #######  ##     ## ######## 
	*/

	/** 暫停 */
	public pause () : void {
		this.isPause = true;
	}

	/** 復原 */
	public resume () : void {
		this.isPause = false;
	}




	/*
	########    ###     ######  ##    ## 
	   ##      ## ##   ##    ## ##   ##  
	   ##     ##   ##  ##       ##  ##   
	   ##    ##     ##  ######  #####    
	   ##    #########       ## ##  ##   
	   ##    ##     ## ##    ## ##   ##  
	   ##    ##     ##  ######  ##    ## 
	*/


	/**
	 * 設置 滾動任務
	 * @param reelIdx 指定輪軸序號
	 * @param task 任務資料
	 */
	public setSpinTask (reelIdx: number, task: ReelTask) : void {
		for (let idx = 0; idx < this._waitToSpinTasks.length; idx++) {
			
			let each = this._waitToSpinTasks[idx];
			
			if (each.reelIdx == reelIdx) {
				this._waitToSpinTasks.splice(idx, 1, task);
				return;
			}
		}

		// cc.log("addSpinTask:", reelIdx);
		this._waitToSpinTasks.push(task);
	}

	/**
	 * 設置 滾動任務
	 * @param reelIdx 指定輪軸序號
	 * @param task 任務資料
	 */
	public setStopTask (reelIdx: number, task: ReelTask) : void {
		for (let idx = 0; idx < this._waitToStopTasks.length; idx++) {
			
			let each = this._waitToStopTasks[idx];
			
			if (each.reelIdx == reelIdx) {
				this._waitToStopTasks.splice(idx, 1, task);
				return;
			}
		}

		// cc.log("addStopTask:", reelIdx);
		this._waitToStopTasks.push(task);
	}

	/** 取得 滾動任務 */
	public getSpinTasks () : ReelTask[] {
		return this._waitToSpinTasks;
	}
	/**
	 * 取得 滾動任務
	 * @param reelIdx 指定輪
	 */
	public getSpinTask (reelIdx) : ReelTask {
		for (let each of this._waitToSpinTasks) {
			if (each.reelIdx == reelIdx) return each;
		}
		return null;
	}

	/** 取得 停輪任務 */
	public getStopTasks () : ReelTask[] {
		return this._waitToStopTasks;
	}
	/**
	 * 取得 停輪任務
	 * @param reelIdx 指定輪
	 */
	public getStopTask (reelIdx: number) : ReelTask {
		for (let each of this._waitToStopTasks) {
			if (each.reelIdx == reelIdx) return each;
		}
		return null;
	}

	/**
	 * 輪軸 是否 已排入滾動任務
	 * @param reelIdx 指定輪
	 */
	public isReelInSpinTask (reelIdx: number) : boolean {
		
		let reel = this.reelContainer.getReel(reelIdx);
		if (!reel) return false;

		for (let each of this._waitToSpinTasks) {
			if (each.reelIdx == reelIdx) {
				return true;
			}
		}

		return false;
	}

	/**
	 * 輪軸 是否 已排入停輪任務
	 * @param reelIdx 指定輪
	 */
	public isReelInStopTask (reelIdx: number) : boolean {
		
		let reel = this.reelContainer.getReel(reelIdx);
		if (!reel) return false;

		for (let each of this._waitToStopTasks) {
			if (each.reelIdx == reelIdx) {
				return true;
			}
		}

		return false;
	}


	/*
	 ######  ########    ###    ######## ######## 
	##    ##    ##      ## ##      ##    ##       
	##          ##     ##   ##     ##    ##       
	 ######     ##    ##     ##    ##    ######   
	      ##    ##    #########    ##    ##       
	##    ##    ##    ##     ##    ##    ##       
	 ######     ##    ##     ##    ##    ######## 
	*/

	/**
	 * 設置 快速模式
	 * @param isTurbo 
	 */
	public setTurbo (isTurbo: boolean) : void {
		if (isTurbo) {
			this.stateCtrl.go("turbo");
		} else {
			this.stateCtrl.go("normal");
		}
	}


	/*
	 #######  ######## ##     ## ######## ########   ######  
	##     ##    ##    ##     ## ##       ##     ## ##    ## 
	##     ##    ##    ##     ## ##       ##     ## ##       
	##     ##    ##    ######### ######   ########   ######  
	##     ##    ##    ##     ## ##       ##   ##         ## 
	##     ##    ##    ##     ## ##       ##    ##  ##    ## 
	 #######     ##    ##     ## ######## ##     ##  ######  
	*/

	/**
	 * 輪軸 是否 已排入停輪任務
	 * @param reelIdx 
	 */
	public isReelSpinning (reelIdx: number) : boolean {
		let reel = this.reelContainer.getReel(reelIdx);
		if (!reel) return false;
		return reel.isRolling();
	}

	/**
	 * 觸發 手動停輪 屬性
	 * @param isManualStop 是否標記為手動停輪
	 */
	public turnManualStop (isManualStop: boolean = true) : void {
		this.isManualStop = isManualStop;
	}

	/**
	 * 觸發 滾動中 屬性 
	 */
	public turnSpinning (isSpinning: boolean = true) : void {
		this.isSpinning = isSpinning;
		if (isSpinning) {
			this.stateCtrl.lockState();
		} else {
			this.stateCtrl.unlockState();
		}
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

