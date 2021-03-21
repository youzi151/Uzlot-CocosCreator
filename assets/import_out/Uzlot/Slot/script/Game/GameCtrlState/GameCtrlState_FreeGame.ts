import { State, Invoker, EventData, Async, Mathf } from "../../../../../Uzil/Uzil";
import { GameCtrl, ReelTask } from "../../../index_Slot";
import { ReelRule, OddsTable, SymbolCode } from "../../../../Rule/index_Rule";
import { SpinPostProc } from "../SpinPostProc";
import { ReelColData } from "../../../../Reel/index_Reel";
import { SpinPreProc } from "../SpinPreProc";
import { NetMod, ResultData, SpinResultData } from "../../../../Net/index_Net";
import FeatureGameFadePanel from "../../../../FeatureGame/Fade/FeatureGameFadePanel";
import FeatureGameResultPanel from "../../../../FeatureGame/Result/FeatureGameResultPanel";
import { SlotUtil } from "../../Util/SlotUtil";

const {ccclass, property} = cc._decorator;

const valuesUser : string = "GameCtrlState";
const valuesPriority : number = 0;

@ccclass
export class GameCtrlState_FreeGame extends State {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 遊戲 控制 */
	private _gameCtrl : GameCtrl = null;

	/** 註冊事件名稱 */
	private _eventName : string = 'regFrom_state_normal';

	/** 瞇牌特效 */
	@property(cc.Node)
	public omenFX : cc.Node = null;

	/** Scatter底板 */
	@property(cc.Node)
	public scatterBGs : cc.Node[] = [];

	/** 結果 前置處理 */
	@property(SpinPreProc)
	public preProcList : SpinPreProc[] = [];

	/** 結果 後處理 */
	@property(SpinPostProc)
	public postProcList : SpinPostProc[] = [];

	/** 基本輪序號 (蒐集盤面結果用) */
	@property({type:cc.Integer})
	public baseResultReelIdxs : number[] = [0, 1, 2, 3, 4];

	/** 額外輪序號 (蒐集盤面結果用)*/
	@property({type:cc.Integer})
	public extraResultReelIdxs : number[] = [5];

	/** 結果 */
	public freeGameResults : ResultData[] = [];
	public currentResult : ResultData = null;

	/** 下一滾動間隔秒數 */
	@property()
	public autoReSpinDelay_sec : number = 1.5;

	@property(FeatureGameFadePanel)
	public fadePanel_enter : FeatureGameFadePanel = null;

	@property(FeatureGameResultPanel)
	public fadePanel_exit : FeatureGameResultPanel = null;

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/
	
	/*== 基本功能 =================*/

	/*== Protected Function =======================================*/

	/**
	 * 初始化
	 * @param user 使用者
	 */
	protected _init (user: any) : void {
		this._gameCtrl = user;
		
		// 關閉 Scatter背景
		for (let each of this.scatterBGs) {
			if (each == null) continue;
			each.active = false;
		}

		// 關閉 瞇牌特效
		this.omenFX.active = false;
	}

	/** 進入狀態 */
	protected _onEnter () : void {
		let self = this;

		let gameCtrl = this._gameCtrl;
		let spinCtrl = gameCtrl.spinCtrl;
		let spinUI = spinCtrl.spinUI;
		let reelCtrl = gameCtrl.reelCtrl;
		let drawCtrl = gameCtrl.drawCtrl;

		
		// 設置盤面範圍
		for (let row = 0; row < reelCtrl.reelContainer.reels.length; row++) {
			let reel = reelCtrl.reelContainer.getReel(row);
			reel.setResultRange(ReelRule.resultRange[row]);
		}

		// 取得/設置 滾輪表
		gameCtrl.stripTable = gameCtrl.netMod.getStripTable("free");
		reelCtrl.setStrip(gameCtrl.stripTable, true);
		// 轉移到隨機停輪位置
		reelCtrl.reelContainer.shift(SlotUtil.getRandomStopPos(gameCtrl.stripTable));

		// 阻擋所有操作
		spinUI.lockInput({all:true}, "freegame", 1000);

		// 特殊處理 : 當 自動滾動開啟
		let isAutoBeforeFreeGame = false;
		if (spinCtrl.stateCtrl.currentState.stateName == "auto") {
			spinCtrl.stateCtrl.go("normal");
			isAutoBeforeFreeGame = true;
		}

		// 取得FreeGame結果
		this.freeGameResults = gameCtrl.spinResult.getFreeResults();

		// 統計贏分
		let totalFreeGameWins = 0;
		for (let each of this.freeGameResults) {
			totalFreeGameWins += each.totalWinBonus;
		}

		// Scatter連續次數
		let scatterCombo = 0;

		// 是否瞇牌中
		let isOmening = false;

		// 設置 結束瞇牌 行為
		let callEndOmen = ()=>{
			if (isOmening == false) return;
			isOmening = false;

			// 繼續 陸續滾動
			reelCtrl.resume();
		};

		// 當 滾動
		spinCtrl.onSpin.add((evt)=>{

			// 取得 下一個 FreeGame結果
			self.currentResult = self.freeGameResults.shift();
			
			// 滾動 並 取得是否成功
			let isSuccess = self._gameCtrl.spinEachResult(self.currentResult);
			if (isSuccess == false) {
				evt.stop();
				return;
			}

			// 切換至 滾動中
			spinCtrl.spinUI.setSpinning(true, valuesUser, valuesPriority);

			// 清空 贏分
			gameCtrl.wallet.setWin(0);
			
			// 關閉 Scatter背景
			for (let each of this.scatterBGs) {
				if (each == null) continue;
				each.active = false;
			}

			// 呼叫準備好停輪
			self._gameCtrl.readyStop();

		}).name(self._eventName).sort(0);

		
		/** 當 開始 停輪 */
		self._gameCtrl.reelCtrl.onStopBegin.add(()=>{

			// 前置處理 ===================
			let spinResult : SpinResultData = self._gameCtrl.spinResult;
			let result : ResultData = self.currentResult;
			
			// 要 進行處理的資料
			let data : Object = {
				/* 遊戲 控制 */
				"gameCtrl" : gameCtrl,
				/* 總滾動結果 */
				"spinResult" : spinResult,
				/* 該次滾動結果 */
				"result" : result,
				/* 鎖住所有 操作 */
				"lockInput" : ()=>{
					spinUI.lockInput({all:true}, valuesUser, valuesPriority);
				}
			};

			for (let eachProc of self.preProcList) {
				// 執行 並 試著取得 新資料
				let newData = eachProc.process(data);
					
				// 若 新資料 存在 則 覆蓋
				if (newData != null) {
					data = newData;
				}
			}

			for (let eachReel of reelCtrl.reelContainer.reels) {
				for (let eachRow of eachReel.reelRows) {
					// eachRow.update(0);
					eachRow.view.render();
				}
			}

			// 取出 結果
			spinResult = data["spinResult"];
			
			// 紀錄結果
			gameCtrl.spinResult = spinResult;

			// 再次 設置停輪位置
			reelCtrl.setStopPos(result.stopPosList);

		}).name(self._eventName);


		// 當 操作 滾動停下
		spinCtrl.onStop.add(()=>{

			if (self._gameCtrl.isReadyStop() == false) return;

			// 呼叫 停止滾動
			self._gameCtrl.stop();
			
		}).name(self._eventName);


		// 當 每輪停輪
		reelCtrl.onEachStopStart.add((event, stopTask: ReelTask)=>{
			return; // 關閉瞇牌
			
			// 停輪序號
			let reelIdx = stopTask.reelIdx;

			// 檢查該輪有無 scatter
			let result = self._gameCtrl.spinResult;
			let reelResult = ReelRule.getResultInRange(self._gameCtrl.reelCtrl.getStrip(), result.getMainResult().stopPosList);

			// 是否在瞇牌範圍
			let isInOmenRange = reelIdx > 0 && reelIdx < 3;
			// 是否存在Scatter
			let isScatterExist = false;
			for (let each of reelResult[reelIdx]) {
				if (each.symbol == SymbolCode.SC) {
					isScatterExist = true;
					break;
				}
			}

			// 若 在瞇牌範圍中 且 存在Scatter
			if (isInOmenRange && isScatterExist) {
				
				// 增加Scatter連續數量
				scatterCombo++;

				// 註冊 當 該輪 停倫完畢 後
				reelCtrl.onEachStopDone.add((evt: EventData, stopTask : ReelTask)=>{
					if (stopTask.reelIdx != reelIdx) return; // 若 非該輪 則 返回

					// 開啟 Scatter背景
					let scatterBG = self.scatterBGs[reelIdx];
					if (scatterBG != null) {
						scatterBG.active = true;
					}

					// 移除自己
					evt.removeListener();
				});

				// 若 Scatter連續數量 > 1
				if (scatterCombo > 1) {
					
					// 暫停 陸續停輪
					reelCtrl.pause();

					// 當 該輪 停倫完畢 後
					reelCtrl.onEachStopDone.add((evt: EventData, stopTask : ReelTask)=>{	
						if (stopTask.reelIdx != reelIdx) return; // 若 非該輪 則 返回

						// 開啟 瞇牌特效
						self.omenFX.active = true;
						
						// 設置 瞇牌特效 位置
						// let pos = reelCtrl.reelContainer.getReel(reelIdx).getReelRow().view.node.
						self.omenFX.setPosition(self.omenFX.parent.convertToNodeSpaceAR(reelCtrl.reelContainer.getReel(reelIdx+1).getWorldPos()));

						// 註冊 當 該輪的下一輪 停輪完畢 後
						reelCtrl.onEachStopDone.add((evt: EventData, stopTask: ReelTask)=>{
							if (stopTask.reelIdx != (reelIdx+1)) return; // 若 非該輪下一輪 則 返回

							// 關閉 瞇牌特效
							self.omenFX.active = false;

							// 移除自己
							evt.removeListener();
						});

						// 移除自己
						evt.removeListener();
					});

					// 瞇牌時間
					let continueDelay = 2;

					// 若為快速模式 則 改變瞇牌時間
					if (gameCtrl.isTurbo) {
						continueDelay = 0.5;
					}

					// 開啟 正在瞇牌中
					isOmening = true;
					
					// 數秒後 結束瞇牌
					Invoker.once(()=>{
						callEndOmen();
					}, continueDelay).tag("GameCtrlState_Free_omeing");
				}
			}


		}).name(self._eventName);

		// 當 全部停輪
		reelCtrl.onAllStopDone.add(async ()=>{
			
			// Debug : 印出 結果
			// cc.log(self._gameCtrl.spinResult.getMainResult().stopPosList);

			// 清空 Scatter連續次數
			scatterCombo = 0;

			// 停止 瞇牌
			callEndOmen();

			// 關閉 瞇牌特效
			self.omenFX.active = false;

			// 取消 結束瞇牌 排程
			Invoker.cancel("GameCtrlState_Free_omeing");

			// 放棄控制 滾動中
			spinCtrl.spinUI.setSpinning(null, valuesUser, valuesPriority);

			// 取得盤面
			let spinResult = self._gameCtrl.spinResult;

			let result = self.currentResult;
			
			let reelResult : ReelColData[][] = []; 

			let resultReelIdxs = this.baseResultReelIdxs.concat(this.extraResultReelIdxs);

			for (let row = 0; row < resultReelIdxs.length; row++) {
				let baseResultReelIdx =  resultReelIdxs[row];
				let reel = reelCtrl.reelContainer.getReel(baseResultReelIdx);

				let range = reel.getResultRange();
				range = [
					Mathf.addAbs(range[0], -0.0001),
					Mathf.addAbs(range[1], -0.0001)
				];

				let resultColsInReel = reel.getResultInRange(range[0], range[1]);

				if (resultColsInReel.length == 0) continue;
				
				let resInReel = [];

				// 只取 第一層
				let cols = resultColsInReel[0];
				// 的 所有 格
				for (let col of cols) {
					resInReel.push(col.getCopy());
				}

				reelResult.push(resInReel);

			}
			
			reelResult = reelResult.map((colsInRow)=>{
				return colsInRow.filter((col)=>{
					return col.tags.indexOf("resultable") != -1;
				});
			});

			// 後處理 ===================

			// 要 進行處理的資料
			let data = {
				/* 遊戲 控制 */
				"gameCtrl" : gameCtrl,
				/* 總滾動結果 */
				"spinResult" : spinResult,
				/* 該次滾動結果 */
				"result" : result,
				/* 盤面結果 */
				"reelResult" : reelResult,
				/* 鎖住所有 操作 */
				"lockInput" : ()=>{
					spinUI.lockInput({all:true}, valuesUser, valuesPriority);
				}
			};

			// 開始後處理
			await (()=>{ return new Promise((res, rej)=>{
				Async.eachSeries(
					self.postProcList, 
					
					async (each, cb)=>{

						// 執行 並 試著取得 新資料
						let newData = await each.process(data);
						
						// 若 新資料 存在 則 覆蓋
						if (newData != null) {
							data = newData;
						}

						// 下一個 後處理
						cb();
					}, 

					()=>{
						res();
					}
				);
			})})();

			reelResult = data["reelResult"];

			// 放棄所有 操作
			spinUI.lockInput({all:null}, valuesUser, valuesPriority);
		
			// =========================

			// 播放開獎 且 當 完成開獎 後...
			drawCtrl.play(
				{
					totalBet: spinResult.totalBet,
					result: result,
					reelResult: reelResult,
					oddsTable: OddsTable["free"]
				}, 
				()=>{

					// 設置 可用分數
					gameCtrl.wallet.setBalance(gameCtrl.spinResult.currentCredit);

					// 呼叫 準備好下一次滾動
					gameCtrl.readyNextSpin();

				}
			);

		}).name(self._eventName).sort(100);


		// 當準備好像一個滾動
		gameCtrl.onReadyNextSpin.add(()=>{

			if (self.freeGameResults.length <= 0) {


				// 顯示 結算轉場
				self.fadePanel_exit.show({
					wins: totalFreeGameWins
				});
					
				
				// 當 結算轉場 點擊
				self.fadePanel_exit.onClick.addOnce(()=>{

					// 隱藏轉場
					self.fadePanel_exit.hide(()=>{

						// 回歸主遊戲
						self._gameCtrl.stateCtrl.go("normal");

						// 解除操作鎖定
						spinUI.lockInput({all:null}, "freegame");

						// 若 FreeGame 以前 有開啟自動滾動 則 還原 自動滾動
						if (isAutoBeforeFreeGame) {
							spinCtrl.stateCtrl.go("auto");
						}

					});
		
				});

			} else {
				
				// 停隔數秒 自動續滾
				Invoker.once(()=>{

					// 若 不可以再滾動 則 停止自動
					if (gameCtrl.isSpinable() == false) {
						cc.log("gameCtrl.isSpinable() == false");
						return;
					}

					// 開啟 滾動, 關閉 停輪
					spinCtrl.lockInput({with: ["stop"], without: ["spin"]}, valuesUser, valuesPriority);
					
					spinCtrl.spin();

				}, self.autoReSpinDelay_sec).tag(self._eventName);
			
			}
		}).name(self._eventName);


		// 顯示轉場
		this.fadePanel_enter.show();

		// 當轉場被點擊
		this.fadePanel_enter.onClick.addOnce(()=>{

			// 隱藏轉場 並 滾動
			self.fadePanel_enter.hide(()=>{
				spinCtrl.spin();
			});

		});


	}

	/**
	 * 更新
	 * @param dt 每幀時間
	 */
	protected _onUpdate (dt: number) : void {
		
	}

	/** 離開狀態 */
	protected _onExit () : void {

		// 關閉 Scatter背景
		for (let each of this.scatterBGs) {
			if (each == null) continue;
			each.active = false;
		}

		let gameCtrl = this._gameCtrl;
		let spinCtrl = gameCtrl.spinCtrl;
		let reelCtrl = gameCtrl.reelCtrl;

		spinCtrl.onSpin.remove(this._eventName);
		spinCtrl.onStop.remove(this._eventName);

		reelCtrl.onStopBegin.remove(this._eventName);
		reelCtrl.onEachStopStart.remove(this._eventName);
		reelCtrl.onAllStopDone.remove(this._eventName);
		
		gameCtrl.onReadyNextSpin.remove(this._eventName);
	}

	/*== Private Function =========================================*/

}
