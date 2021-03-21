import {
	CurveData, Invoker, InvokerTask, Mathf,
	ActObj_Repeat, ActObj_Group
} from "../../../../../Uzil/Uzil";

import { SlotUtil } from "../../Util/SlotUtil";
import { WinData, WinsRule } from "../../../../Rule/index_Rule";
import { ColMiddle, ReelColData, ReelColObj, ReelObj, ReelRowObj } from "../../../../Reel/index_Reel";
import { ActObj_SymbolAnim, ActObj_SymbolBlink, ActObj_AnimOnCol } from "../../../../Act/index_Act_Uzlot";

import { DrawMethod } from "./DrawMethod";

import BigWinFX from "../../../../../../import_In/G00/TestRes/BigWinFX/sciprt/BigWinFX";


const {ccclass, property} = cc._decorator;

const valuesUser : string = "DrawMethod_TumblingReels";
const valuesPriority : number = 20;

@ccclass
export class DrawMethod_TumblingReel extends DrawMethod {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	@property()
	public isDebug : boolean = false;

	/** 基本輪序號 */
	@property({type:cc.Integer})
	public baseResultReelIdxs : number[] = [0, 1, 2, 3, 4];

	/** 額外輪序號 */
	@property({type:cc.Integer})
	public extraResultReelIdxs : number[] = [5];

	/** 開獎演出 */
	@property(ActObj_Repeat)
	public drawAct : ActObj_Repeat = null;

	/** 大獎特效 */
	@property(BigWinFX)
	public bigWinFX : BigWinFX = null;

	/** 大獎分數門檻 */
	@property()
	public bigWinScoreGate : number = 100;

	/** 每種贏分的顯示時間間隔 */
	@property()
	public eachWinDataInterval_sec : number = 1;

	/** 墜落速度 */
	@property()
	public dropSpeed : number = 8;
	@property({type:cc.Float})
	public dropSpeed_tweak : number[] = [];

	/** 墜落間隔延遲 */
	@property()
	public dropDelay : number = 0.1;

	/** 墜落曲線 */
	@property(cc.JsonAsset)
	public dropCurve_json : cc.JsonAsset = null;
	private _dropCurve : CurveData = new CurveData();

	/** 是否跳過 */
	private _isSkipOnce : boolean = false;

	private _waitTask : InvokerTask;


	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/

	onLoad () {
		
	}
	
	/** 進入狀態 */
	public async play (data: Object) {
		let self = this;

		if (this.isDebug) cc.log("==TumblingReels==============");
		
		// 快捷==
		let drawCtrl = this._drawCtrl;
		let gameCtrl = drawCtrl.gameCtrl;
		let reelCtrl = gameCtrl.reelCtrl;


		// 取出資料==
		
		// 總下注
		let totalBet = data["totalBet"];
		// 滾動結果
		let result = data["result"];
		cc.log(result)
		// 盤面結果
		let reelResult : ReelColData[][] = data["reelResult"];
		// 賠率表
		let oddsTable = data["oddsTable"];
		// 可墜落格資料
		let dropColDatas = result["dropColDatas"];
		dropColDatas = dropColDatas.slice();
		cc.log("dropColDatas", dropColDatas)

		//==

		// 贏分
		let wins = 0;

		// 鎖住操作
		gameCtrl.spinCtrl.spinUI.setSpinning(true, "DrawMethod_TumblingReels", 100);
		gameCtrl.spinCtrl.lockInput({with: ["spin", "stop"]}, "DrawMethod_TumblingReels", 100);

		// 每輪 對應 使用到的ColData
		let reelRow2UsedColDatas = new Map<ReelRowObj, ReelColData[]>();
		// 被隱藏的ColObj
		let hidedObjs : ReelColObj[] = [];

		// 快捷 ReelRow
		let reelRows : ReelRowObj[] = [];
		for (let row = 0; row < reelResult.length; row++) {
			let reelRow = reelCtrl.reelContainer.getReel(row).getReelRow();
			reelRows.push(reelRow);
		}

		// 等候
		let wait = async (sec)=>{
			return new Promise<void>((res, rej)=>{
				if (self._isSkipOnce) {
					res();
				} else {
					self._waitTask = Invoker.once(res, sec);
				}
			});
		};


		// 演出開獎 (判定盤面>消除中獎>墜落新格)
		let playDraw;
		playDraw = async (reelResult: ReelColData[][])=>{ 
			return new Promise(async(res, rej)=>{


			// 把 額外輪 轉化 到 基本輪 中 ==========

			// 原本的結果 分為 ↓
			// 額外輪結果
			let extraReelResult = reelResult.slice(this.baseResultReelIdxs.length, this.baseResultReelIdxs.length+this.extraResultReelIdxs.length); 
			// 基本輪結果
			let baseReelResult = reelResult.slice(0, this.baseResultReelIdxs.length);

			// 處理 贏分 ===========================

			// 建立贏分資訊
			let winDatas = WinsRule.getWinDataList_Way(totalBet, baseReelResult, oddsTable, {
				"extraReelResult": extraReelResult
			});

			// 若 無中獎 則 結束開獎
			if (winDatas.length == 0) {
				res(null);
				return;
			}

			// 依照贏分資料 取得 所有中獎的格

			// 中獎的格 <輪<格>>
			let winCols : Array<Array<number>> = [];

			// 每個贏分資料
			for (let winData of winDatas) {
				// 每個贏分路徑(輪軸)
				for (let row = 0; row < winData.path.length; row++) {
					
					// 取用或建立 該輪的 中獎的格 
					let rowRes;
					if (winCols.length < row+1) {
						rowRes = [];
						winCols.push(rowRes);
					} else {
						rowRes = winCols[row];
					}
					
					// 該輪 的 中獎格
					let cols = winData.path[row];
					for (let col of cols) {
						if (rowRes.indexOf(col) == -1) {
							rowRes.push(col);
						}
					}
				}

				wins += winData.winBonus;
			}

			// cc.log("wins:"+wins, winDatas);

			// 播放 圖標贏分特效 ==================================

			self._playAllWin(winDatas);

			gameCtrl.wallet.setWin(wins);

			// 等候 ==============================================
			await wait(self.eachWinDataInterval_sec);


			// 消除 已經中獎 ======================================

			// 所有 中獎格的ColObj
			let winColObjs : ReelColObj[] = [];

			// 每一個中獎的格
			for (let row = 0; row < winCols.length; row++) {
				
				let reelRow = reelRows[row];
				
				let cols = winCols[row];

				// 該輪中 每個中獎的格
				for (let idx = 0; idx < cols.length; idx++) {

					let col = cols[idx];
					let colData = reelRow.stripData.getColByIdx(col);
					let middle = reelRow.view.requestMiddle(colData);

					// 設置 執行期參數 隱藏
					for (let each of middle.objs) {
						middle.setRuntimeArgs(each, "draw", 100, {
							isActive: false
						});
					}
					
					// 將 該中獎格序號的所屬Middle的ColObj加入 中獎格的ColObj
					winColObjs = winColObjs.concat(middle.objs);
					
				}
			}

			// 每個 中獎格的ColObj
			for (let each of winColObjs) {
				// 設置 關閉
				each.setActive(false);
				// 設置 關閉 (開獎標記)
				each.setActive(false, "draw", 100);

				// 加入 隱藏的物件
				hidedObjs.push(each);
			}

			// 替換格/加入新格 並 墜落 =============================

			// 新的盤面結果
			let newReelResult = [];
			for (let eachRow of reelResult) {
				let newRow = [];
				for (let each of eachRow) {
					newRow.push(each);
				}
				newReelResult.push(newRow);
			}

			// cc.log(reelResult)

			// 每輪 預計要改動的
			let toModify = [];
			// 每輪 最下方位置
			let downestPoses = [];
			// 每輪 仍然存在的 未中獎的格
			let stillExist = [];

			// 每一輪 盤面結果 取得 由下往上 第一個中獎格後 的所有格
			for (let row = 0; row < reelResult.length; row++) {

				let reelRow = reelRows[row];
				let stripData = reelRow.stripData;
				let resultRange = reelRow.getResultRange();
				
				// 新的盤面結果
				let newResultInRow = [];
				newReelResult[row] = newResultInRow;
			
				// 該輪 中獎的格 (若沒有該輪 則 以空[]代替)
				let winColsInRow;
				if (row < winCols.length) {
					winColsInRow = winCols[row];
				} else {
					winColsInRow = [];
				}
				
				// 該輪 要修改的對象
				let toModifyInRow = [];
				toModify[row] = toModifyInRow;
				
				// 該輪 仍然存在的 未中獎的格
				let stillExistInRow = [];
				stillExist[row] = stillExistInRow;

				// 最下方位置 加入 空
				downestPoses.push(null);
				let downestPos = reelRows[row].currentPos + resultRange[1];

				// 該輪的盤面結果
				let colsInRow : ReelColData[] = reelResult[row];

				// 是否已經有中獎
				let hasWin = false;

				// 由下往上 所有格
				for (let col = colsInRow.length-1; col >= 0; col--) {
					
					let colData = colsInRow[col];
					let colIdx = colData.idx;
					
					// 是否中獎 為 該輪 中獎的格 中 是否有該格序號
					let isWin = winColsInRow.indexOf(colIdx) != -1;

					// 若尚未中獎 且 該格未中獎 則 
					if (!hasWin && !isWin) {
						// 放回結果
						newResultInRow.unshift(colData);
						// 忽略此格
						continue;
					}

					// 若 中獎
					if (isWin) {
						// 若 尚未中獎
						if (!hasWin) {
							// 改為已經中過獎
							hasWin = true;
							// 設置 最下方位置
							let colRangeDown = colData.getTriggerRange()[1];
							
							if (downestPos != colRangeDown) {
								
								let offsets = Mathf.getOffsetsLoop(downestPos, colRangeDown, stripData.min, stripData.max);
								let offset = Mathf.minAbs(...offsets);
								if (offset < 0) {
									downestPos = colRangeDown;
								}

							}
						}
					} 

					// 若 沒中獎
					else {
						// 加入到 仍然存在(且需要墜落)的格中
						stillExistInRow.push(colIdx);
					}

					// 加入 預計要改動的
					toModifyInRow.push({
						col: colIdx,
						isWin: isWin
					});

					// 設置 最下方位置
					downestPoses[row] = downestPos;
				}
			}

			// 剩餘的墜落任務
			let leftDropTask = 0;

			// 重新讀取曲線
			this._dropCurve.init(this.dropCurve_json.json);

			// 每一個要修改的格
			for (let row = 0; row < toModify.length; row++) {

				let _row = row;
				
				// 該輪中 所有要修改的格
				let toModifyInRow = toModify[row];
				// 若 該輪 沒有 則 忽略
				if (toModifyInRow.length == 0) continue;

				// 該輪的 新的盤面結果
				let newReelResultInRow = newReelResult[row];
			
				// 快捷
				let reelRow = reelRows[row];
				let stripData = reelRow.stripData;
				let view = reelRow.view;

				// 上方顯示邊界 實際位置
				let borderUpPos = Mathf.loop(reelRow.currentPos - view.displayRange_back, stripData.min, stripData.max);

				// 墜落 最底部 實際位置
				let downestPos = downestPoses[row];

				// 若 最下方位置 與 上方邊界位置 距離 超過 滾輪長度 則
				if (Math.abs(downestPos - borderUpPos) > stripData.totalLength) {
					// 最下方位置 減去 滾輪總長度
					downestPos -= stripData.totalLength;
				}
				// 若 上方邊界位置 超過 最下方位置 則 
				if (borderUpPos > downestPos) {
					// 最下方位置 增加 滾輪總長度
					downestPos += stripData.totalLength;
				}

				// 已使用的空間
				let usedSpace_down = 0;
				
				// 已使用的新格空間
				let usedSpace_upper = 0;

				// 新的墜落格的起始位置
				let newColStartPos = borderUpPos;

				// 該輪 尚未中獎的格
				let stillExistInRow : number[] = stillExist[row];

				// 墜落數量
				let dropCount : number = 0;

				// 當 最底下往上推已使用空間後 仍然 在 頂部位置 以下
				while ((downestPos - usedSpace_down) > borderUpPos) {
				
					// 請求一個 新的 額外格序號
					let colIdx = SlotUtil.requestExColIdx(row);
					
					// 額外格
					let colData : ReelColData;
					// 要處理的中介Middle
					let toHandleMiddle;

					// 墜落起始位置
					let fromPos;
					// 墜落目標位置
					let targetPos;
					
					// 若 還有實際存在但未中獎的 取用 副本
					if (stillExistInRow.length > 0) {
						let src_idx = stillExistInRow.shift();
						let src_colData = stripData.getColByIdx(src_idx);
						
						// 新格資料 為 來源的副本
						colData = src_colData.getCopy();

						// 要處理的中介 為 所屬格為來源格的所有中介
						toHandleMiddle = view.requestMiddle(src_colData);

						// 設 新格 為 顯示中
						view.setInView(colIdx, true);
						
						// 起始位置 為 來源格位置
						fromPos = src_colData.pos;

						// 若該已存在格的上緣位置 在 新的墜落格的起始位置 之上 則 取代
						let src_colTopPos = src_colData.getTriggerRange()[0];
						let offsets = Mathf.getOffsetsLoop(newColStartPos, src_colTopPos, stripData.min, stripData.max);
						let offset = Mathf.minAbs(...offsets);

						if (offset < 0) {
							newColStartPos = src_colTopPos;
						}
					}
					// 否則 從 預備墜落列表中取得
					else {

						// 來源 從 預備墜落列表中 取出
						let src_colData = dropColDatas[row].pop();
						// cc.log("row:"+row, dropColDatas[row], "in", dropColDatas);

						// Test
						// if (!src_colData)
						// 	src_colData = this._test_requestDropCol(row+1);

						// 新格資料 為 來源的副本
						colData = src_colData.getCopy();

						// 起始位置 為 新的墜落格的起始位置 再往上 "存在格超出上邊界的距離" 再往上 "已使用的新格空間" 再往上 "該格的下半部長度"
						fromPos = newColStartPos - usedSpace_upper - colData.triggerRange_relative[1];

						usedSpace_upper += colData.getTriggerLength();

					}

					// 該格 加入 "暫時", "可結算" 標籤
					colData.addTag("temp", "resultable");

					// 該格長度
					let colLength = colData.getTriggerLength();			

					// 目標位置 為 最下方位置 往上(已使用的空間) 再往上 該格的下邊長
					targetPos = (downestPos - usedSpace_down) - colData.triggerRange_relative[1];
					if (targetPos < fromPos) targetPos += stripData.totalLength;

					// 設置 新格

					// 序號
					colData.idx = colIdx;
					// 位置
					colData.pos = Mathf.loop(targetPos, stripData.min, stripData.max);
					
					// 將 新格資料 加入滾輪表資料 
					stripData.cols.push(colData);

					// 新的盤面結果 從首端 加入新的額外格ColData
					newReelResultInRow.unshift(colData);
					
					// 下方 已經使用空間 增加 該格的長度
					usedSpace_down += colLength;

					// 移交 Middle的Obj 給 新的ColData ==

					// 以 該格資料 請求 一個新的中介
					let newMiddle = view.requestMiddle(colData);

					// 處理交接
					if (toHandleMiddle != null) {		
						// 交接 ColObj
						let toTrasfer = toHandleMiddle.objs;
						toHandleMiddle.objs = [];
						newMiddle.objs = toTrasfer;

						// 取得 要處理的中介 的 參數
						let oldArgs = toHandleMiddle.getArgs();
						// 消除偏移 (在新的格中會由純pos代替)
						delete oldArgs["offset"];
						
						// 交接參數
						newMiddle.args = oldArgs;
						
						// 消除並更新 要處理的中介 的 執行期暫時參數
						toHandleMiddle.delRuntimeArgs(null, "temp");
						toHandleMiddle.updateRuntimeArgs();
					}

					// 在 新的中介 中 增加 偏移基準 參數 為 從 目標位置 向 起始位置 的 距離
					let dropStartVal = Mathf.getOffsetsLoop(targetPos, fromPos, stripData.min, stripData.max)[0];
					newMiddle.args["offsetBase"] = dropStartVal;

					// 使用過的ColData
					let usedColDatas;
					if (reelRow2UsedColDatas.has(reelRow)) {
						usedColDatas = reelRow2UsedColDatas.get(reelRow);
					} else {
						usedColDatas = [];
						reelRow2UsedColDatas.set(reelRow, usedColDatas);
					}
					if (usedColDatas.indexOf(colData) == -1) {
						usedColDatas.push(colData);
					}
				
					// 設置 墜落任務
					let dropTask;
					let dropTime = 0;
					let dropSpeed_tweak = self.dropSpeed_tweak[row];
					if (!dropSpeed_tweak) dropSpeed_tweak = 0;
					let dropSpeed = self.dropSpeed + dropSpeed_tweak;
					let dropTotalTime = Math.abs(dropStartVal) / (dropSpeed / stripData.blockPerCol_forAnim);
					dropTotalTime += self.dropDelay * dropCount;

					dropTask = Invoker.update((dt)=>{

						dropTime += dt;
						let dropPercent = Mathf.clamp(dropTime / dropTotalTime, 0, 1);
						let valPercent_reverse = self._dropCurve.getVal(dropPercent * self._dropCurve.length);
						let newOffset = Mathf.lerp(dropStartVal, 0, 1-valPercent_reverse);

						if (self._isSkipOnce) {
							newOffset = 0;
						}

						// 設置 偏移 參數
						newMiddle.args["offsetBase"] = newOffset;
						
						// 渲染
						view.render();

						// 若 新的偏移 為 0 (已達目標位置)
						if (newOffset == 0) {

							// 停止墜落
							Invoker.stop(dropTask);

							// 刪除 偏移基準 參數
							delete newMiddle.args["offsetBase"];

							// 減少 待完成墜落任務
							leftDropTask--;
							// 若 已經全部執行完畢
							if (leftDropTask <= 0) {
								// 呼叫 此次盤面 開獎完成的回呼
								res(newReelResult);
							}
						}
					});

					// 增加 待完成墜落任務 計數
					leftDropTask++;

					dropCount++;
					
				}

			}

		})};

		// 檢視是否有無再中獎 ==================================

		let lastReelResult;
		while (reelResult != null) {
			lastReelResult = reelResult;
			reelResult = await playDraw(reelResult);
		}

		
		let lastTopCol = [];
		for (let each of lastReelResult) {
			lastTopCol.push(each[0]);
		}

		// 轉移位置、交接格物件 ================================

		// 每一輪
		for (let row = 0; row < reelRows.length; row++) {
		
			let reelRow = reelRows[row];
			let stripData = reelRow.stripData;
			let resultRange = reelRow.getResultRange();
			
			// 若 該輪 沒有 已經使用過的格資料 則 忽略
			if (reelRow2UsedColDatas.has(reelRow) == false) continue;

			// 使用過的格資料
			let usedColDatas = reelRow2UsedColDatas.get(reelRow);
			
			// 預計轉移到的位置
			let preferShiftPos = reelRow.currentPos - 8;

			// 轉移過去之後的最上方格
			let nextTopCols = reelRow.stripData.getColsByTriggerRange(
				preferShiftPos + Mathf.addAbs(resultRange[0], -0.00001),
				preferShiftPos + Mathf.addAbs(resultRange[1], -0.00001),
				preferShiftPos
			);

			let nextTopColOffsets = new Map<number, number>();
			nextTopCols.forEach((each)=>{
				nextTopColOffsets.set(each.idx, Mathf.getOffsetsLoop(preferShiftPos, each.pos, stripData.min, stripData.max)[1]);
			})
			nextTopCols.sort((a, b)=>{
				return nextTopColOffsets.get(a.idx) - nextTopColOffsets.get(b.idx);
			});

			// 改預計轉移位置為 最上方格 的 往下半個盤面
			preferShiftPos = nextTopCols[0].getTriggerRange()[0] + resultRange[1];

			// 上方邊界
			let topBorder = Mathf.loop(reelRow.currentPos + resultRange[0], stripData.min, stripData.max);
			// 當前最上方格
			let topCol = lastTopCol[row];
			// 當前最上方格 超出 邊界的距離
			let overTop = Math.abs(Mathf.getOffsetsLoop(topCol.getTriggerRange()[0], topBorder, reelRow.stripData.min, reelRow.stripData.max)[1]);
			// 預計轉移位置 往下推 
			preferShiftPos += overTop+0.00001;

			// 移動整個盤面的位置
			reelRow.shift(preferShiftPos);

			// 取消模糊
			let visibleCols = reelRow.getVisibles();
			for (let each of visibleCols) {
				for (let eachObj of each.objs) {
					eachObj.setBlur(cc.Vec2.ZERO, true);
				}
			}

			// 每個 已使用的格資料
			for (let each of usedColDatas) {

				// 從 滾輪表 移除
				let idx = reelRow.stripData.cols.indexOf(each);
				if (idx == -1) continue;
				reelRow.stripData.cols.splice(idx, 1);

				// 回收 該額外格序號
				SlotUtil.recoveryExColIdx(row, each.idx);

				// 設置 該格不在顯示中
				reelRow.view.setInView(each.idx, false);
				// 銷毀 該格對應的中介
				reelRow.view.destroyMiddleByData(each);
			}
		}

		// 設置 可用分數
		gameCtrl.wallet.setBalance(gameCtrl.netMod.player.credit);

		// 取消 對 開關的控制
		for (let each of hidedObjs) {
			each.setActive(null, "draw");
		}

		// 大獎處理 ======================
		
		// 若 贏分 達到 大獎開獎門檻
		if (wins >= this.bigWinScoreGate) {
			await self.playBigWin(wins);
		}
		
		// 停止 開獎演出
		self.drawAct.stop();

		// 解除 限制操作
		gameCtrl.spinCtrl.spinUI.setSpinning(null, "DrawMethod_TumblingReels");
		gameCtrl.spinCtrl.lockInput({all: null}, "DrawMethod_TumblingReels");

		// 完成 開獎
		drawCtrl.drawDone();
		
	}

	/** 停止 */
	public stop () : void {
		
		let self = this;
		
		// 快捷
		let drawCtrl = this._drawCtrl;
		let spinCtrl = drawCtrl.gameCtrl.spinCtrl;
		let spinUI = spinCtrl.spinUI;

		// 關閉 跳過
		self._isSkipOnce = false;

		// 停止 開獎演出
		self.drawAct.stop();

		// 銷毀所有開獎演出
		let acts = self.drawAct.acts.slice();
		for (let eachAct of acts) {
			self.drawAct.removeAct(eachAct);
			eachAct.node.destroy();
		}


		// 若 大獎特效 播放中 則
		if (self.bigWinFX.isPlaying) {
			// 停止
			self.bigWinFX.stop();
			// 放棄控制 所有操作
			spinUI.lockInput({all:null}, valuesUser, valuesPriority);
		}
	}

	/** 跳過 */
	public skip () : void {
		// 開啟跳過
		this._isSkipOnce = true;
		
		// 取消 等候 並 直接呼叫
		Invoker.cancel(this._waitTask);
		this._waitTask.call();
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	/** 播放所有圖標贏分特效 (一次播放) */
	private _playAllWin (winDatas: WinData[]) {

		let self = this;
		let drawCtrl = this._drawCtrl;
		let gameCtrl = drawCtrl.gameCtrl;

		// 停止 開獎演出
		self.drawAct.stop();

		// 銷毀所有開獎演出
		let acts = self.drawAct.acts.slice();
		for (let eachAct of acts) {
			self.drawAct.removeAct(eachAct);
			eachAct.node.destroy();
		}

		// 依照 個別贏分內容 建立 該贏分演出
		let eachWinNode : cc.Node = new cc.Node();
		eachWinNode.setParent(self.drawAct.node);

		let eachWinAct : ActObj_Group = eachWinNode.addComponent("ActObj_Group");

		let setedWinCol = [];
		
		// 每個贏分資料
		for (let eachWin of winDatas) {

			// 演出盤面 中獎
			// 每一輪
			for (let row = 0; row < eachWin.path.length; row++) {
					
				let rowStr = row.toString();

				// 每一輪中的每個中獎格
				let colList = eachWin.path[row];
				for (let eachCol of colList) {

					let key = rowStr+eachCol.toString();
					if (setedWinCol.indexOf(key) != -1) continue;
					else setedWinCol.push(key);

					// 取得 格物件
					let reel : ReelObj = gameCtrl.reelCtrl.reelContainer.getReel(row);
					let reelRow : ReelRowObj = reel.getReelRow();
					let colData = reelRow.stripData.getColByIdx(eachCol);
					let middle : ColMiddle = reelRow.view.requestMiddle(colData);

					let colObjs = reel.getColObjsByCol(middle.data.idx);
					if (colObjs == null) {
						cc.log("colObj not exist")
						continue;
					}

					for (let eachObj of colObjs) {

						// 建立 圖標演出節點
						let eachSymbolNode : cc.Node = new cc.Node();
						eachSymbolNode.setParent(eachWinNode);


						// === 圖標通用演出 ===========
						
						let eachSymbolGeneralAct : ActObj_AnimOnCol = eachSymbolNode.addComponent("ActObj_AnimOnCol");

						// 將 格物件 設置給 圖標閃爍演出
						eachSymbolGeneralAct.setColObj(eachObj);
						eachSymbolGeneralAct.prefabResID = "uzlot.symbolWinFX.comm";
						
						// 新增 圖標閃爍演出 至 贏分演出
						eachWinAct.acts.push(eachSymbolGeneralAct);

						// === 圖標閃爍演出 ===========

						let eachSymbolBlinkAct : ActObj_SymbolBlink = eachSymbolNode.addComponent("ActObj_SymbolBlink");

						// 將 格物件 設置給 圖標閃爍演出
						eachSymbolBlinkAct.setColObj(eachObj);
						
						// 新增 圖標閃爍演出 至 贏分演出
						eachWinAct.acts.push(eachSymbolBlinkAct);

						// === 圖標動畫演出 ===========

						// 建立 圖標動畫演出
						let eachSymbolAnimAct : ActObj_SymbolAnim = eachSymbolNode.addComponent("ActObj_SymbolAnim");
		
						// 將 格物件 設置給 圖標動畫演出
						eachSymbolAnimAct.setColObj(eachObj);
		
						// 新增 圖標動畫演出 至 贏分演出
						eachWinAct.acts.push(eachSymbolAnimAct);

					}
				}
			}
		}

		// 新增 贏分演出 至 總演出
		self.drawAct.acts.push(eachWinAct);
		self.drawAct.play();
	}

	private _test_requestDropCol (row:number) : ReelColData {
		let newColData = new ReelColData();
		newColData.idx = 0;
		newColData.tags = ["resultable"];
		newColData.symbol = Math.floor(Math.random() * 4) + 1;
		newColData.sizeLevel = 2;
		newColData.triggerRange_relative = [1, 1];
		newColData.displayRange_relative = [1, 1];
		return newColData;
	}

	private playBigWin (wins: number) : Promise<void> {
		let self = this;

		let drawCtrl = this._drawCtrl;
		let gameCtrl = drawCtrl.gameCtrl;
		let spinUI = gameCtrl.spinCtrl.spinUI;

		return new Promise<void>((res, rej)=>{

			// 標籤 讀秒後 完成開獎
			let tag = "drawDone";

			// 鎖住所有 操作
			spinUI.lockInput({all:true}, valuesUser, valuesPriority);
			
			// 播放 大獎特效
			self.bigWinFX.play( {
				
				// 贏分
				wins: wins, 

				// 計數完畢後
				onCountDone: ()=>{

					let delay = 2;
					if (gameCtrl.spinCtrl.stateCtrl.currentState.name == "auto") {
	
						// 讀秒後 完成開獎
						Invoker.once(()=>{
							
							// 若 大獎特效 播放中 則
							if (self.bigWinFX.isPlaying) {
								// 停止
								self.bigWinFX.stop();
								// 放棄控制 所有操作
								spinUI.lockInput({all:null}, valuesUser, valuesPriority);
							}
	
							res();
	
						}, delay).tag(tag);	
						
					}
				},

				// 當離開特效後
				onExit: ()=>{

					// 取消 讀秒後 完成開獎
					Invoker.cancel(tag);
				
					// 放棄控制 所有操作
					spinUI.lockInput({all:null}, valuesUser, valuesPriority);

					res();
				}
			});

			
		});
	}

}
