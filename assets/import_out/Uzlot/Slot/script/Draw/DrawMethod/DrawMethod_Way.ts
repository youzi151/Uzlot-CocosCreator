import { Invoker, ActObj_Repeat, ActObj_Group } from "../../../../../Uzil/Uzil";

import { WinsRule } from "../../../../Rule/index_Rule";
import { ResultData } from "../../../../Net/index_Net";
import { ReelColData, ReelRowObj } from "../../../../Reel/index_Reel";
import { ActObj_SymbolAnim, ActObj_SymbolBlink, ActObj_AnimOnCol } from "../../../../Act/index_Act_Uzlot";

import { DrawMethod } from "./DrawMethod";

import BigWinFX from "../../../../../../import_In/G00/TestRes/BigWinFX/sciprt/BigWinFX";

const {ccclass, property} = cc._decorator;

const valuesUser : string = "DrawMethod_Way";
const valuesPriority : number = 20;

@ccclass
export class DrawMethod_Way extends DrawMethod {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/** 註冊事件名稱 */
	private _eventName : string = 'DrawCtrlState_Way';

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

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/
	
	/** 進入狀態 */
	public play (data: Object) : void {
		let self = this;
		
		let drawCtrl = this._drawCtrl;
		let gameCtrl = drawCtrl.gameCtrl;
		let spinUI = gameCtrl.spinCtrl.spinUI;

		let totalBet : number = data["totalBet"];
		let result : ResultData = data["result"];
		let reelResult : ReelColData[][] = data["reelResult"];
		let oddsTable = data["oddsTable"];

		// 原本的結果 分為 ↓
		// 額外輪結果
		let extraReelResult = reelResult.slice(this.baseResultReelIdxs.length, this.baseResultReelIdxs.length+this.extraResultReelIdxs.length); 
		// 基本輪結果
		let baseReelResult = reelResult.slice(0, this.baseResultReelIdxs.length);


		// 以 盤面資料 取得 贏分資料
		// 建立贏分資訊
		let winDatas = WinsRule.getWinDataList_Way(totalBet, baseReelResult, oddsTable, {
			"extraReelResult": extraReelResult
		});

		// 若 無中獎 則 結束開獎
		if (winDatas.length == 0) {
			drawCtrl.drawDone();
			return;
		}

		// 設置贏分
		gameCtrl.wallet.setWin(result.totalWinBonus);


		// 每個贏分資料
		for (let eachWin of winDatas) {

			// cc.log("==================")

			// 依照 個別贏分內容 建立 該贏分演出
			let eachWinNode : cc.Node = new cc.Node();
			eachWinNode.setParent(self.drawAct.node);

			let eachWinAct : ActObj_Group = eachWinNode.addComponent("ActObj_Group");

			// 每一輪
			for (let row = 0; row < eachWin.path.length; row++) {
				
				// 每一輪中的每個中獎格
				let colList = eachWin.path[row];
				for (let eachCol of colList) {

					// 取得 格物件
					let reelRow : ReelRowObj = gameCtrl.reelCtrl.reelContainer.getReel(row).getReelRow();
					let colData : ReelColData = reelRow.stripData.getColByIdx(eachCol);
					let colObjs = reelRow.view.requestMiddle(colData).objs;
					if (colObjs == null) {
						cc.log("colObj not exist")
						continue;
					}

					for (let colObj of colObjs) {

						// 建立 圖標演出節點
						let eachSymbolNode : cc.Node = new cc.Node();
						eachSymbolNode.setParent(eachWinNode);


						// === 圖標通用演出 ===========
						
						let eachSymbolGeneralAct : ActObj_AnimOnCol = eachSymbolNode.addComponent("ActObj_AnimOnCol");

						// 將 格物件 設置給 圖標閃爍演出
						eachSymbolGeneralAct.setColObj(colObj);
						eachSymbolGeneralAct.prefabResID = "uzlot.symbolWinFX.comm";
						
						// 新增 圖標閃爍演出 至 贏分演出
						eachWinAct.acts.push(eachSymbolGeneralAct);

						// === 圖標閃爍演出 ===========

						let eachSymbolBlinkAct : ActObj_SymbolBlink = eachSymbolNode.addComponent("ActObj_SymbolBlink");

						// 將 格物件 設置給 圖標閃爍演出
						eachSymbolBlinkAct.setColObj(colObj);
						
						// 新增 圖標閃爍演出 至 贏分演出
						eachWinAct.acts.push(eachSymbolBlinkAct);

						// === 圖標動畫演出 ===========

						// 建立 圖標動畫演出
						let eachSymbolAnimAct : ActObj_SymbolAnim = eachSymbolNode.addComponent("ActObj_SymbolAnim");
		
						// 將 格物件 設置給 圖標動畫演出
						eachSymbolAnimAct.setColObj(colObj);
		
						// 新增 圖標動畫演出 至 贏分演出
						eachWinAct.acts.push(eachSymbolAnimAct);

					}

				}
			}

			// 新增 贏分演出 至 總演出
			self.drawAct.acts.push(eachWinAct);
		}
		
		self.drawAct.play();


		// 大獎處理 ======================
		
		// 贏分
		let wins = result.totalWinBonus;
		// 若 贏分 達到 大獎開獎門檻
		if (wins >= this.bigWinScoreGate) {

			// 標籤 讀秒後 完成開獎
			let tag = "drawDone";

			// 鎖住所有 操作
			spinUI.lockInput({all:true}, valuesUser, valuesPriority);
			
			// 播放 大獎特效
			self.bigWinFX.play({
				
				// 贏分
				wins: wins, 

				// 計數完畢後
				onCountDone: ()=>{

					let delay = 2;
					if (gameCtrl.spinCtrl.stateCtrl.currentState.name == "auto") {
					
						Invoker.once(()=>{

							drawCtrl.drawDone();

						}, delay).tag(tag);
					}

				},

				// 當離開特效後
				onExit: ()=>{
					
					// 取消 讀秒後 完成開獎
					Invoker.cancel(tag);
				
					// 放棄控制 所有操作
					spinUI.lockInput({all:null}, valuesUser, valuesPriority);

					// 完成開獎
					drawCtrl.drawDone();
				}
			});
			
		} else {

			drawCtrl.drawDone();

		}

		gameCtrl.wallet.setBalance(gameCtrl.netMod.player.credit);

		// ===============================

		// 當 滾動 被按下 則 
		gameCtrl.spinCtrl.onSpin.add(()=>{
			drawCtrl.stop();
		}).name(self._eventName);

	}

	/** 停止 */
	public stop () : void {
		
		let self = this;
		
		let drawCtrl = this._drawCtrl;
		let gameCtrl = drawCtrl.gameCtrl;
		let spinCtrl = drawCtrl.gameCtrl.spinCtrl;
		let spinUI = spinCtrl.spinUI;

		// 停止 開獎演出
		self.drawAct.stop();

		// 銷毀所有開獎演出
		let acts = self.drawAct.acts.slice();
		for (let eachAct of acts) {
			self.drawAct.removeAct(eachAct);
			eachAct.node.destroy();
		}

		spinCtrl.onSpin.remove(this._eventName);

		// 若 大獎特效 播放中 則
		if (self.bigWinFX.isPlaying) {
			// 停止
			self.bigWinFX.stop();
			// 放棄控制 所有操作
			spinUI.lockInput({all:null}, valuesUser, valuesPriority);
		}

		// 設置 可用分數
		if (gameCtrl.spinResult != null) {
			gameCtrl.wallet.setBalance(gameCtrl.spinResult.currentCredit);
		}
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}
