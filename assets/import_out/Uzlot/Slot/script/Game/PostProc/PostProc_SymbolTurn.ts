import { Animator, Async } from "../../../../../Uzil/Uzil";
import { ResultData } from "../../../../Net/index_Net";
import { ReelColData } from "../../../../Reel/index_Reel";
import { SymbolCode } from "../../../../Rule/index_Rule";
import { Prefab2NodeMgr } from "../../Util/Prefab2NodeMgr";
import { GameCtrl } from "../GameCtrl";
import { SpinPostProc } from "../SpinPostProc";

const {ccclass, property} = cc._decorator;

@ccclass
export class PostProc_SymbolTurn extends SpinPostProc {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	@property({type:SymbolCode})
	public fromSymbol : SymbolCode = SymbolCode.H1;

	@property({type:SymbolCode})
	public toSymbol : SymbolCode = SymbolCode.WD;

	@property()
	public transAnimPrefabID : string = "uzlot.symbolAnim.h1ToWild";
	
	/*== Event ====================================================*/
	
	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {
		
	}

	update (dt) {
		
		
	}

	/*== Public Function ==========================================*/

	/** 呼叫 */
	public async process (data: Object) {

		let self = this;

		cc.log("PostProc_SymbolTurn: start ");

		// 準備資料 ===========================

		let gameCtrl : GameCtrl = data["gameCtrl"];
		let result : ResultData = data["result"];
		let reelResult : ReelColData[][] = data["reelResult"];
		let lockInput : Function = data["lockInput"];
		
		// 要轉換的位置
		let symbolTurnCol : number[][] = result["symbolTurnCol"];
		cc.log("PostProc_SymbolTurn: symbolTurnCol ",symbolTurnCol);
		if (symbolTurnCol == null) return;
		
		let reelCtrl = gameCtrl.reelCtrl;
		
		let stopPosList = reelCtrl.reelContainer.getStopPosList();

		//=====================================
		
		let animTasks = [];

		// 每一個 要轉換的位置 (輪)
		for (let row = 0; row < reelResult.length; row++) {

			let reel = reelCtrl.reelContainer.getReel(row);

			let reelResultInRow = reelResult[row];
			let symbolTurnInRow = symbolTurnCol[row];

			// 每一個 要轉換的位置 (格)
			for (let col = 0; col < reelResultInRow.length; col++) {

				// 盤面格資料
				let colData = reelResultInRow[col];

				if (colData.symbol != self.fromSymbol) {
					continue;
				}

				// 是否轉變
				let isTurn = symbolTurnInRow.indexOf(colData.idx) != -1;

				
				// 若 轉變 則 改變 圖標
				if (isTurn) {
					colData.symbol = self.toSymbol;
				}
				
				// 取得格物件
				let colObjs = reel.getColObjsByCol(colData.idx);
				// 每一個格物件
				for (let colObj of colObjs) {

					// 要播放的動畫 (預設為miss)
					let toPlay = "miss";
					if (isTurn) {
						// 改 動畫
						toPlay = "win";

						// 對 格物件 設置圖標
						colObj.setSymbol(this.toSymbol);
					}

					colObj.setSpriteActive(false);

					// cc.log("turn: r["+row+"] c["+col+"] : "+toPlay + "  from:"+SymbolCode[self.fromSymbol] +"  to:"+SymbolCode[self.toSymbol]);
					
					// 若 不是加速模式
					if (gameCtrl.isTurbo == false) {

						// 建立並設置轉換節點
						let transAnimNode = Prefab2NodeMgr.request(this.transAnimPrefabID);
						transAnimNode.setParent(colObj.node);
						transAnimNode.setPosition(cc.Vec2.ZERO);
						
						// 取得動畫組件
						let transAnim : Animator = transAnimNode.getComponent("Animator");

						// 建立任務
						let task = (cb)=>{
							
							// 播放動畫
							transAnim.play(toPlay);

							// 播放完畢時
							transAnim.onComplete.addOnce(()=>{
								// 回收
								transAnimNode.setParent(cc.director.getScene());
								Prefab2NodeMgr.recovery(transAnimNode);

								colObj.setSpriteActive(true);

								// 結束任務
								cb();
							});

						};
						
						// 新增 至 動畫任務列表中
						animTasks.push(task);

					}

					
				}
			
			}
			
		}

		await (()=>{ return new Promise((res, rej)=>{

			// 若 動畫任務存在 則 先鎖住操作
			if (animTasks.length > 0) {
				lockInput();
			}

			// 一齊執行動畫任務
			Async.parallel(
				animTasks, 
				()=>{
					res();
					cc.log("PostProc_SymbolTurn Done");
				}
			);

		}); })();
		
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

