import { Event, Invoker, Mathf, RandomRange } from "../../../../Uzil/Uzil";
import { ReelColData, ReelStripData } from "../../../Reel/index_Reel";
import { OddsTable, SymbolCode, WinData } from "../../../Rule/index_Rule";
import { GameClient, PlayerData, SpinResultData, ResultData } from "../../index_Net";

import { SlotUtil, StripParse } from "../../../Slot/index_Slot";
import { ReelRule } from "../../../Rule/script/ReelRule";
import { WinsRule } from "../../../Rule/script/WinsRule";

const {ccclass, property} = cc._decorator;

export class OfflineClient extends GameClient {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/*== 功能開關 =========================*/

	/** 是否 Megaways路數 */
	public isMegaways : boolean = true;

	/** 是否 結算墜落格 */
	public isTumblingReels : boolean = true;

	/** 是否 格轉換 */
	public isSymbolTurn : boolean = false;

	/** 是否 模擬延遲回傳結果 */
	public isSimulateDelay : boolean = false;

	/** 墜落格 最大尺寸 */
	public dropColMaxSize : number = 3;

	/*== 資料變數 =========================*/

	private _stripTables : Map<string, ReelStripData[]> = null;

	private _playerCredit : number = 1000;

	/** 基本輪序號 */
	private baseResultReelIdxs : number[] = [0, 1, 2, 3, 4];

	/** 額外輪序號 */
	private extraResultReelIdxs : number[] = [5];

	private isTestSpinResLoop = false;
	private testSpinIdx = 0;
	private get _testSpinRes () : Object[] {
		let spinReses = [

			// BigWin
			// {
			// 	"stopPosList": [47, 21, 43, 45, 9, 7],
			// 	"megaways": [3, 6, 3, 3, 6]
			// }

			// Scatter*3 after tumbling
			// {
			// 	"stopPosList":[13, 61, 41, 55, 37, 5],
			// 	"megaways":[2, 3, 3, 6, 2]
			// },
			
			// Scatter*3
			// {
			// 	"stopPosList":[39, 17, 55, 41, 51, 3],
			// 	"megaways":[3, 3, 3, 3, 3]
			// },

			// 可能會造成錯誤的 freegame*2 -> normal*1
			// {
			// 	"stopPosList":[53, 53, 35, 7, 39, 11],
			// 	"megaways":[3, 6, 3, 6, 3]
			// },
			// {
			// 	"stopPosList":[39, 9, 63, 35, 21, 3],
			// 	"megaways":[3, 3, 2, 2, 3]
			// },
			// {
			// 	"stopPosList":[43, 29, 53, 27, 39, 13],
			// 	"megaways":[3, 3, 3, 3, 6]
			// },


			// {
			// 	"stopPosList":[3, 37, 3, 37, 1, 1],
			// 	"megaways":[2, 6, 6, 2, 2]
			// },

			// {
			// 	"stopPosList": [27, 19, 21, 51, 13, 1],
			// 	"megaways":[3, 2, 6, 3, 3]
			// },
			// {
			// 	"stopPosList": [1, 47, 41, 65, 31, 9],
			// 	"megaways":[3, 2, 6, 6, 2]
			// }
			

			// {
			// 	"stopPosList": [22, 4, 15, 30, 15],
			// 	"megaways":[3, 2, 2, 3, 3],
			// },
			// {
			// 	"stopPosList": [8, 20, 3, 29, 8],
			// 	"megaways":[2, 2, 6, 6, 3],
			// }

			// {
			// 	"stopPosList": [0, 24, 13, 28, 19],
			// 	"megaways":[6, 2, 2, 6, 3],
			// },
			// {
			// 	"stopPosList": [29, 35, 19, 30, 22],
			// 	"megaways":[6, 2, 3, 2, 3],
			// },
			// {
			// 	"stopPosList": [32, 32, 17, 0, 16],
			// 	"megaways":[3, 3, 6, 3, 2],
			// },

			// 中獎 / Tumbling*1
			// {
			// 	"stopPosList": [27, 13, 37, 24, 13],
			// 	"megaways":[6, 6, 3, 3, 2],
			// }

			// {
			// 	"stopPosList": [6, 18, 14, 8, 12]
			// },
			// {
			// 	"stopPosList": [7, 0, 14, 1, 17]
			// },
			
			// [18, 28, 1, 17, 3],
			// [3, 22, 5, 25, 7]
		]

		if (spinReses.length == 0 || this.testSpinIdx > spinReses.length-1) {
			return [];
		}

		let res = [spinReses[this.testSpinIdx]];
		
		this.testSpinIdx++;

		if (this.isTestSpinResLoop) {
			if (this.testSpinIdx >= spinReses.length) {
				this.testSpinIdx = 0;
			}
		}

		return res;
	}
	
	/*== Event ====================================================*/

	private _onStripTableUpdate : Event = new Event();
	
	/*== Public Function ==========================================*/

	/** 連接 */
    public async connect () : Promise<any> {

		let player = new PlayerData();
		player.credit = this._playerCredit;
		player.name = "demo";

		return player;
    }

    /** 斷開 */
    public disconnect () {

	}
	
	/** 取得滾輪表 */
    public async getStripTables () : Promise<Map<string, ReelStripData[]>> {
		
		const n1 = SymbolCode.N1;
		const n2 = SymbolCode.N2;
		const n3 = SymbolCode.N3;
		const n4 = SymbolCode.N4;
		const n5 = SymbolCode.N5;
		const n6 = SymbolCode.N5;

		const h1 = SymbolCode.H1;
		const h2 = SymbolCode.H2;
		const h3 = SymbolCode.H3;
		const h4 = SymbolCode.H4;
		const h5 = SymbolCode.H5;

		const sc = SymbolCode.SC;
		const wd = SymbolCode.WD;



		this._stripTables = new Map<string, ReelStripData[]>();
		
		// 滾輪表陣列
		let stripArray_normal = [
			[n3, n4, h4, n2, n1, h2, n2, n4, h3, n3, n2, n1, h4, n4, h1, n1, h1, n1, h5, n2, n4, h2, n1, n3, h5, n3, n2, h3, n1, h4, n3, n4, h5, n1 /**/],
			[n1, n3, h2, n2, n3, h3, n2, n3, sc, n1, h4, n4, n3, n2, h4, n1, h1, wd, h1, n3, n2, n3, h2, n2, n1, n4, h5, n3, sc, n1, n4, wd, n3, wd /**/],
			[n2, n3, h2, n3, h5, n4, h2, n2, n1, n4, h3, sc, n4, n2, h1, wd, sc, n4, n1, n2, n4, n3, h5, n1, n3, n4, n2, h4, sc, n3, n2, wd /**/],
			[n4, h2, n1, n4, n2, h3, sc, n3, h3, n2, n1, h4, n3, h1, h1, h1, wd, h1, n2, sc, n1, h5, n2, n3, h2, n3, sc, n1, n2, wd, n4, n3, wd /**/],
			[n4, h4, n2, n3, n1, h2, n4, n3, n2, h5, n3, n2, h1, h1, h1, wd, h1, n4, n2, h3, n4, n3, h2, n1, n2, n4, h4, n2, n3, wd /**/],
			[n1, n2, n3, n4, h1, h2, h3, h4],
		];

		// 主要滾輪表資料
		let normalStrip : ReelStripData[];

		// 解讀 滾輪表陣列 為 滾輪表資料
		if (this.isMegaways) {
			normalStrip = StripParse.megaways(stripArray_normal);
		} else {
			normalStrip = StripParse.normal(stripArray_normal);
		}

		this._stripTables.set("normal", normalStrip);

		let stripArray_fg = [
			[n3, n4, h4, n2, n1, h2, n2, n4, h3, n3, n2, n1, h4, n4, h1, n1, h1, n1, h5, n2, n4, h2, n1, n3, h5, n3, n2, h3, n1, h4, n3, n4, h5, n1 /**/],
			[n1, n3, h2, n2, n3, h3, n2, n3, n1, n1, h4, n4, n3, n2, h4, n1, h1, wd, h1, n3, n2, n3, h2, n2, n1, n4, h5, n3, n1, n1, n4, wd, n3, wd /**/],
			[n2, n3, h2, n3, h5, n4, h2, n2, n1, n4, h3, n1, n4, n2, h1, wd, h1, n4, n1, n2, n4, n3, h5, n1, n3, n4, n2, h4, n1, n3, n2, wd /**/],
			[n4, h2, n1, n4, n2, h3, n1, n3, h3, n2, n1, h4, n3, h1, h1, h1, wd, h1, n2, n1, n1, h5, n2, n3, h2, n3, n1, n1, n2, wd, n4, n3, wd /**/],
			[n4, h4, n2, n3, n1, h2, n4, n3, n2, h5, n3, n2, h1, h1, h1, wd, h1, n4, n2, h3, n4, n3, h2, n1, n2, n4, h4, n2, n3, wd /**/],
			[n1, n2, n3, n4, h1, h2, h3, h4],
		];
		this._stripTables.set("free", StripParse.normal(stripArray_fg));


		this._stripTables.set("_test", StripParse.normal([
			[h1, h2, h3, h4, h5, n1, n2, n3, n4, n4],
			[h1, h2, h3, h4, h5, n1, n2, n3, n4, wd],
			[h1, h2, h3, h4, h5, n1, n2, n3, n4, wd],
			[h1, h2, h3, h4, h5, n1, n2, n3, n4, wd],
			[h1, h2, h3, h4, h5, n1, n2, n3, n4, wd],
		]));

		return this._stripTables;
	}
	
	/** 註冊 當滾輪表更新 */
	public onStripTableUpdate (cb: (err:any, tbName:string, tb:ReelStripData) => void) {
		this._onStripTableUpdate.add((event, _tbName, _tb)=>{
			cb(null, _tbName, _tb);
		});
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

    /** 滾動 */
    public async spin (bet: number) : Promise<any> {

		cc.log("OfflineClient: spin ======================");

		// cc.log("playerCredit:"+this._playerCredit+" / bet:"+bet+" / left:"+(this._playerCredit-bet))

		// 滾輪表
		let stripTable : ReelStripData[] = this._stripTables.get("normal");
		stripTable = stripTable.map((each)=>{
			return each.getCopy();
		});

		// 檢查剩餘可用分數
		if (this._playerCredit < bet) {
			throw "error";
		}

		// 滾動結果
		let spinResult : SpinResultData = new SpinResultData();
		
		// 等待
		if (this.isSimulateDelay) {
			await new Promise<void>((res, rej)=>{
				Invoker.once(res, 2);				
			});
		}
		

		// 產生主要結果
		let result : ResultData = this.generateResult(bet, stripTable, OddsTable["normal"]);
		
		// 填入 結果列表
		spinResult.resultTable.set("main", [result]);

		// 若達成FreeGame條件
		if (result.tags.indexOf("isCanFg") != -1) {

			let freeGameResults = [];

			// 滾輪表
			let fg_stripTable : ReelStripData[] = this._stripTables.get("free");
			fg_stripTable = fg_stripTable.map((each)=>{
				return each.getCopy();
			});

			if (fg_stripTable != null) {	
				// 加入FG結果
				for (let idx = 0; idx < 2; idx++) {
					freeGameResults.push(this.generateResult(bet, fg_stripTable, OddsTable["free"]));
				}
				
				spinResult.resultTable.set("free", freeGameResults);
			}

		}
		
		// 填入 下注
		spinResult.totalBet = bet;

		// 計算總贏分
		spinResult.resultTable.forEach((v, k)=>{
			let results = v;
			for (let each of results) {
				spinResult.totalBonus += each.totalWinBonus;
			}
		});

		// 改變 玩家餘額
		this._playerCredit = (this._playerCredit - bet) + (spinResult.totalBonus);

		// 填入 玩家餘額
		spinResult.currentCredit = this._playerCredit;
		
		cc.log(spinResult)
		return spinResult;
    }
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	private generateResult (bet: number, stripTable : ReelStripData[], oddsTable: Object) : ResultData {
		// 結果
		let result = new ResultData();

		// 滾輪表
		stripTable = stripTable.map((each)=>{
			return each.getCopy();
		});
		
		// 贏分
		let wins = 0;
		
		// 原始停輪位置
		let src_stopPosList;

		// 停輪位置
		let stopPosList;

		// 測試用結果
		let testSpinRes = this._testSpinRes.shift();
		
		// 若 存在 則 取用 停輪位置
		if (testSpinRes != null) {
			src_stopPosList = testSpinRes["stopPosList"];
		}
		// 否則 取隨機
		else {
			src_stopPosList = SlotUtil.getRandomStopPos(stripTable);
		}

		// 建立 停輪位置 副本 (避免後續改動影響 原停輪位置)
		stopPosList = src_stopPosList.slice();


		// 處理停輪位置 ============

		// 保持 偶數
		// stopPosList = stopPosList.map((each)=>{
		// 	if (each % 2 == 1) return each + 1;
		// 	else return each;
		// });

		// 保持 奇數
		// stopPosList = stopPosList.map((each)=>{
		// 	if (each % 2 == 0) return each + 1;
		// 	else return each;
		// });
		
		// 隨機增減半格
		// stopPosList = stopPosList.map((each)=>{
		// 	return each + Math.round((Math.random()-0.5)*ReelRule.reelBlockPerCol);
		// });
		
		// 固定增加半格
		// stopPosList = stopPosList.map((each)=>{
		// 	return each + (0.5*ReelRule.reelBlockPerCol);
		// });

		// 交錯增加半格
		// let isAddHalf = false;
		// stopPosList = stopPosList.map((each)=>{
		// 	isAddHalf = !isAddHalf;
		// 	return each + ((0.5*ReelRule.reelBlockPerCol) * (isAddHalf?1:0));
		// });
		
		// 全部跟第一輪相同
		// stopPosList = stopPosList.map((each)=>{
		// 	return stopPosList[0]
		// });


		// 最終 回傳的停輪位置
		let finalStopPosList = stopPosList.slice();

		// 盤面結果
		let reelResult : ReelColData[][] = ReelRule.getResultInRange(stripTable, finalStopPosList);
		// cc.log("reelResult:", reelResult);
	

		//特殊處理==========================

		// Megaways ↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓↓

		if (this.isMegaways) {

			let megaways = [];

			// 路數隨機池
			let waysPool = [
				[2, 3],
				[2, 3, 6],
				[2, 3, 6],
				[2, 3, 6],
				[2, 3, 6]
			];
			// 隨機取出 路數
			for (let row = 0; row < waysPool.length; row++) {
				let wayCount = waysPool[row][new RandomRange(0, waysPool[row].length-1).getInt()];
				megaways.push(wayCount);
			}

			// 測試 : 固定數量
			if (testSpinRes != null) {
				let testMegaways = testSpinRes["megaways"];
				if (testMegaways) {
					megaways = testMegaways;
				}
			}

			// 每輪
			for (let row = 0; row < megaways.length; row++) {
				
				let wayCount = megaways[row];
				
				let resultRangeLength = ReelRule.getResultRangeLength(row);

				// 停輪位置
				let stopPos;

				// 保持正確停輪位置
				if (wayCount % 2 == 0) {
					stopPos = stopPosList[row];
					if (stopPos % 2 == 1) {
						stopPos += 1;
					}
				} else {
					stopPos = stopPosList[row];
					if (stopPos % 2 == 0) {
						stopPos += 1;
					}
				}
				stopPosList[row] = stopPos;
				finalStopPosList[row] = stopPos;
				
				// 來源滾輪表
				let srcStripData = stripTable[row];
				// 新的滾輪表
				let newStripData = new ReelStripData();

				// 來源滾輪表的所有格
				let srcCols = srcStripData.cols;
				// 新建立的格
				let newCols = [];

				// 格尺寸
				let colSizeLevel = resultRangeLength / wayCount;
				// 半徑
				let colSizeLevel_half = colSizeLevel / 2;

				// 重建的當前位置
				let refactorPos = srcStripData.min;

				// 取得 要改造的盤面格 =========
				let resultCols = [];

				// 鄰近格
				let nearCols = srcStripData.getColsByTriggerPos(stopPos + 0.0001/* 避免界線 */);
				let nearCol2Delta = new Map<number, number>();
				nearCols.forEach((each, idx)=>{
					let delta = Math.abs(Mathf.minAbs(...Mathf.getOffsetsLoop(stopPos, each.pos, srcStripData.min, srcStripData.max)));
					nearCol2Delta.set(idx, delta);
				});		
				// 依照距離排序 取出 最近格
				nearCols.sort((a, b)=>{
					let deltaA = nearCol2Delta.get(a.idx);
					let deltaB = nearCol2Delta.get(b.idx);
					return deltaA - deltaB;
				})
				let nearestCol = nearCols[0];

				// 取得 停輪位置 相對百分比
				let nearestColRange = nearestCol.getTriggerRange();
				let colUpToStopPos = Mathf.getOffsetsLoop(nearestColRange[0], stopPos, srcStripData.min, srcStripData.max)[1];
				let percentPosInColRange = colUpToStopPos / nearestCol.getTriggerLength();

				let wayHalf = wayCount / 2; 
				let way_back = - Math.floor(wayHalf);
				let way_forward = Math.ceil(wayHalf);
			
				// 取 前後各格
				for (let i = way_back; i < way_forward; i++) {
					let idx = Mathf.loop(nearestCol.idx + i, 0, srcStripData.cols.length);
					resultCols.push(idx);
				}

				// cc.log("row("+(row+1)+"): resultCols:",resultCols);

				// 重新改造 滾輪表==============

				// 每格
				for (let col = 0; col < srcCols.length; col++) {

					let srcCol = srcCols[col];
					let newCol = srcCol.getCopy();

					// 若在改造範圍中
					if (resultCols.indexOf(srcCol.idx) != -1) {
						newCol.sizeLevel = colSizeLevel;
						newCol.triggerRange_relative = [colSizeLevel_half, colSizeLevel_half];
						newCol.displayRange_relative = [colSizeLevel_half, colSizeLevel_half];	
					}

					refactorPos += newCol.triggerRange_relative[0];
					newCol.pos = refactorPos;
					refactorPos += newCol.triggerRange_relative[1];
					
					// if (resultCols.indexOf(srcCol.idx) != -1) {
					// 	cc.log("replace col:"+srcCol.idx+" to size:"+colSizeLevel, newCol);
					// }
					
					newCols.push(newCol);
				}

				newStripData.setCols(newCols);

				stripTable[row] = newStripData;

				// 新的停輪位置
				let nearestColInNew = newCols[nearestCol.idx];
				let newStopPos = nearestColInNew.getTriggerRange()[0] + (percentPosInColRange*nearestColInNew.getTriggerLength());
				stopPosList[row] = newStopPos;

			}

			result["ways"] = megaways;

			// 重新取得盤面
			reelResult = ReelRule.getResultInRange(stripTable, stopPosList);

		}

		// Megaways ↑↑↑↑↑↑↑↑↑↑↑↑
		
		// 隨機轉變 ↓↓↓↓↓↓↓↓↓↓↓↓↓
		if (this.isSymbolTurn) {

			let symbolTurnCol : number[][] = [];

			// 每輪
			for (let row = 0; row < reelResult.length; row++) {

				// 該輪 轉換圖標資料
				let symbolTurnCol_row = [];
			
				// 該輪 盤面結果
				let rowResult = reelResult[row];

				// 每格
				for (let col = 0; col < rowResult.length; col++) {

					// 若 該格 圖標 為 要被轉換的圖標
					if (rowResult[col].symbol == SymbolCode.H1) {

						// 若 隨機 轉換
						if (Math.random() > 0.5) {
						
							// 轉換 結果資料中 該格 的 圖標
							let colData = reelResult[row][col];
							colData.symbol = SymbolCode.WD;
			
							// 將 轉換位置(格序號) 放入 該輪轉換圖標資料中
							symbolTurnCol_row.push(colData.idx);
						}
					}
				
				}
				
				symbolTurnCol.push(symbolTurnCol_row);
			}

			result["symbolTurnCol"] = symbolTurnCol;
		}

		// 隨機轉變 ↑↑↑↑↑↑↑↑↑↑↑↑

		//===============================


		// 計算中獎 ==========

		// 把 額外輪 轉化 到 基本輪 中 ==========

		// 原本的結果 分為 ↓
		// 額外輪結果
		let extraReelResult = reelResult.slice(this.baseResultReelIdxs.length, this.baseResultReelIdxs.length+this.extraResultReelIdxs.length); 
		// 基本輪結果
		let baseReelResult = reelResult.slice(0, this.baseResultReelIdxs.length);

		// 處理 贏分 ===========================

		// 建立贏分資訊
		let winDatas : WinData[] = WinsRule.getWinDataList_Way(bet, baseReelResult, oddsTable, {
			"extraReelResult": extraReelResult
		});
		for (let winData of winDatas) {
			wins += winData.winBonus;
		}
		cc.log("winDatas:"+wins, winDatas);

		// ===================
		
		/*
		######## ##     ## ##     ## ########  ##       #### ##    ##  ######   ########  ######## ######## ##        ######  
		   ##    ##     ## ###   ### ##     ## ##        ##  ###   ## ##    ##  ##     ## ##       ##       ##       ##    ## 
		   ##    ##     ## #### #### ##     ## ##        ##  ####  ## ##        ##     ## ##       ##       ##       ##       
		   ##    ##     ## ## ### ## ########  ##        ##  ## ## ## ##   #### ########  ######   ######   ##        ######  
		   ##    ##     ## ##     ## ##     ## ##        ##  ##  #### ##    ##  ##   ##   ##       ##       ##             ## 
		   ##    ##     ## ##     ## ##     ## ##        ##  ##   ### ##    ##  ##    ##  ##       ##       ##       ##    ## 
		   ##     #######  ##     ## ########  ######## #### ##    ##  ######   ##     ## ######## ######## ########  ######  
		*/

		// TumblingReels ↓↓↓↓↓↓↓↓↓↓↓↓↓↓
		
		if (this.isTumblingReels) {

			let debugRow = [];

			let megaways = result["ways"];

			// 預計墜落資料
			let dropColDatas = [];
			for (let row = 0; row < reelResult.length; row++) {
				dropColDatas.push([]);
			}

			// 墜落贏分資料
			let winDatas_tumbling : WinData[] = [];
			// 第一份從 初始贏分資料 複製
			for (let each of winDatas) {
				winDatas_tumbling.push(each.getCopy());
			}
			
			// 每一輪最後的墜落長度
			let lastOverDropLengths = [];
			for (let row = 0; row < reelResult.length; row++) {
				lastOverDropLengths.push(0);
			}
			
			// 當次盤面結果
			let oldReelResult = reelResult;
			
			// 每輪 盤面結果
			for (let row = 0; row < oldReelResult.length; row++) {	
				// 該輪的停輪位置
				let stopPos = stopPosList[row];
				// 滾輪表資料
				let stripData : ReelStripData = stripTable[row];

				let oldResultInRow = oldReelResult[row];

				// 轉換 盤面結果的格 位置 為 與停輪位置 的 相對位置 (僅計算用，非最終結果)
				for (let eachCol of oldResultInRow) {
					let eachPos = eachCol.pos;
					eachCol.pos = Mathf.minAbs(...Mathf.getOffsetsLoop(stopPos, eachPos, stripData.min, stripData.max));
				}
			}

			
			// 當 墜落贏分資料 還有 時
			let limit = 1000;
			while (winDatas_tumbling.length > 0 && limit-- > 0) {

				// 新的盤面結果
				let newReelResult = [];

				// 每輪
				for (let row = 0; row < oldReelResult.length; row++) {

					let isDebugThisRow = debugRow.indexOf(row) != -1;

					// 滾輪表資料
					let stripData : ReelStripData = stripTable[row];

					// 盤面剩餘
					let leftResultInRow : ReelColData[] = oldReelResult[row].slice();

					// 盤面範圍
					let resultRange = ReelRule.getResultRange(row);
					let resultRangeLength = ReelRule.getResultRangeLength(row);

					// 停輪範圍
					let stopRange = resultRange;

					// 最上方的格序號
					let topColIdx = leftResultInRow[0].idx;
					
					// 最下方的格
					let lastCol = leftResultInRow[leftResultInRow.length-1];
					let lastColRange = lastCol.getTriggerRange();

					
					// 最下方位置
					let downestPos = stopRange[1];

					// 還需要落下的距離
					let needToDropLength = 0;

					let winColsInRow = [];


					// 盤面剩餘 減去 贏分格
					// 每個墜落贏分資料
					for (let eachWin of winDatas_tumbling) {

						// 若 該贏分 已經沒有 該輪的路徑 則 忽略
						if (row+1 > eachWin.path.length) continue;

						// 該輪的中獎格
						let pathInRow : number[] = eachWin.path[row];
						
						// 每個該輪的中獎格
						for (let eachCol of pathInRow) {
							if (winColsInRow.indexOf(eachCol) == -1) {
								winColsInRow.push(eachCol);
							}
						}
					}

					if (isDebugThisRow) {
						cc.log(leftResultInRow.map((each)=>{return each.idx}))
						cc.log("winCols:",winColsInRow)
					}

					for (let eachCol of winColsInRow) {

						// 尋找對應格資料
						let idx = leftResultInRow.findIndex((v)=>{return v.idx == eachCol;});
						if (idx == -1) continue;

						// 從 剩餘盤面中 移除掉
						leftResultInRow.splice(idx, 1);
					}

					if (isDebugThisRow) {
						cc.log("lengths:", leftResultInRow.map((each)=>{
							return {
								range:each.getTriggerRange(),
								length:each.getTriggerLength()
							}
						}));
					}

					// 檢查 是否有 路數設置 (來自 megaways)
					let wayCount;
					if (megaways != undefined) {
						wayCount = megaways[row];
					}

					// 更新 最下方的格 與 最下方的位置
					downestPos = stopRange[1];
					if (leftResultInRow.length > 0) {
						lastCol = leftResultInRow[leftResultInRow.length-1];
						lastColRange = lastCol.getTriggerRange();
						downestPos = Mathf.max(stopRange[1], lastColRange[1]);
						if (isDebugThisRow) cc.log("downestPos:",downestPos, " in stop("+stopRange[1]+") col("+lastCol.idx+") "+lastColRange[1]);
					}

					// 墜落基準位置
					let dropFromPos = downestPos;

					// 還存在的格
					for (let eachCol of leftResultInRow) {
						if (isDebugThisRow)cc.log("("+eachCol.idx+")"+SymbolCode[eachCol.symbol]+" : "+eachCol.getTriggerLength());

						// 格長度
						let length;

						// 若有指定路數
						if (wayCount != undefined) {
							// 長度 為 盤面大小 / 路數
							length = (resultRangeLength / wayCount) * -1;
						} else {
							// 長度 為 格長度
							length = eachCol.getTriggerLength() * -1;
						}

						
						// 推進 墜落基準位置
						dropFromPos += length;

					}

					// 還需要墜落的長度 為 墜落基準位置 到 停輪範圍的上緣
					needToDropLength = (stopRange[0] - dropFromPos) * -1/* 向上 */;

					// 該行的墜落格資料
					let dropColDatasInRow = dropColDatas[row];

					// 上次墜落 超出的長度
					let lastOverDrop = lastOverDropLengths[row];

					if (isDebugThisRow) cc.log("needToDropLength:",needToDropLength)

					// 當 還有剩餘 需要墜落的長度
					while (needToDropLength > 0) {

						topColIdx -= 1;
						let toDropIdx = Mathf.loop(topColIdx, 0, stripData.cols.length);
					
						let dropColData = stripData.getColByIdx(toDropIdx).getCopy();

						// 若有指定路數
						if (wayCount != undefined) {

							// 設置 墜落格 尺寸
							dropColData.sizeLevel = resultRangeLength / wayCount;
							// 設置 墜落格 邊長
							let half = dropColData.sizeLevel/2;
							dropColData.displayRange_relative = [half, half];
							dropColData.triggerRange_relative = [half, half];

						} else {

							// 若前一次有超出
							if (lastOverDrop > 0) {

								// 可擴展量 為 最大格尺寸 減去當前墜落格尺寸
								let expansionable =  - dropColData.sizeLevel;
								if (expansionable > 0) {

									// 擴展 墜落格 尺寸
									dropColData.sizeLevel += expansionable;

									// 設置 墜落格 邊長
									let half = dropColData.sizeLevel/2;
									dropColData.displayRange_relative = [half, half];
									dropColData.triggerRange_relative = [half, half];

									// 上次墜落 超出的長度 減去 此格擴展量
									lastOverDrop -= expansionable;
								}
							}
						}

						// 墜落格 的 觸發區域長度
						let dropColData_triggerLength = dropColData.getTriggerLength();

						// 若 剩餘空間不夠 下一個墜落格使用 則 裁剪下一個墜落格大小
						let over = (dropColData_triggerLength - needToDropLength);
						if (over > 0) {
							dropColData.sizeLevel -= over;
							let half = dropColData.sizeLevel/2;
							dropColData.displayRange_relative = [half, half];
							dropColData.triggerRange_relative = [half, half];

							// 紀錄 超出的墜落格距離 為 積欠的距離 (留給下一次贏分墜落使用)
							lastOverDropLengths[row] += over;
						}
						
						dropColDatasInRow.unshift(dropColData);

						leftResultInRow.unshift(dropColData);

						needToDropLength -= dropColData_triggerLength;

					}

					// 從最下面的格 向上
					for (let idx = leftResultInRow.length-1; idx >= 0; idx--) {
						
						let eachCol = leftResultInRow[idx];

						// 改變 格位置
						eachCol.pos = downestPos - eachCol.triggerRange_relative[1];

						// 推進 最下方位置
						let length = eachCol.getTriggerLength();
						downestPos -= length;
					}
					
					newReelResult.push(leftResultInRow);
				}

				// 原本的結果 分為 ↓
				// 額外輪結果
				let extraReelResult = newReelResult.slice(this.baseResultReelIdxs.length, this.baseResultReelIdxs.length+this.extraResultReelIdxs.length); 
				// 基本輪結果
				let baseReelResult = newReelResult.slice(0, this.baseResultReelIdxs.length);

				// 建立贏分資訊
				winDatas_tumbling = WinsRule.getWinDataList_Way(bet, baseReelResult, oddsTable, {
					"extraReelResult": extraReelResult
				});

				// cc.log("newReelResult:", newReelResult.map((v)=>{
				// 	return v.map((vv)=>{
				// 		return "("+vv.idx+")"+SymbolCode[vv.symbol];
				// 	})
				// }))

				let wins_tumbling = 0;
				for (let winData of winDatas_tumbling) {
					wins_tumbling += winData.winBonus;
				}
				wins += wins_tumbling;

				

				// let debugRow = newReelResult[1];
				// let debugMsg = [];
				// for (let eachCol of debugRow) {
				// 	debugMsg.push({sym:SymbolCode[eachCol.symbol], size:eachCol.getTriggerLength()})
				// }
				// cc.log("resultRow 2 :", debugMsg);
				// cc.log("winDatas_tumbling:"+wins_tumbling, winDatas_tumbling);

				oldReelResult = newReelResult;

			}

			reelResult = oldReelResult;

			result["dropColDatas"] = dropColDatas;

			cc.log("dropColData:",dropColDatas)

		}

		// TumblingReels ↑↑↑↑↑↑↑↑↑↑↑↑


		// 填入 總結果 ==================

		// 檢查 Bonus/Scatter ↓↓↓↓↓↓↓↓↓↓↓↓

		let scatterCheckRow = [1,2,3];

		let comboCondition = 3;
		let combo = 0;

		for (let row = 0; row < scatterCheckRow.length; row++) {

			let reelIdx = scatterCheckRow[row];
			

			let cols = reelResult[reelIdx];
			for (let col of cols) {
				if (col.symbol == SymbolCode.SC) {
					combo++;
				}
			}

		}

		if (combo >= comboCondition) {
			result.tags.push("isCanFg");
		}
		
		// 檢查 Bonus/Scatter ↑↑↑↑↑↑↑↑↑↑↑↑


		// cc.log("offline: credit:",this._playerCredit,"bet:", -bet, "wins:", wins, "balance:",(this._playerCredit - bet) + (wins));


		// 填入 贏分
		result.totalWinBonus = wins;

		// 填入 停輪位置
		result.stopPosList = finalStopPosList;
		cc.log("stopPos:", stopPosList, "srcStopPos:", src_stopPosList, "ways:", result["ways"]);

		return result;
	}


}