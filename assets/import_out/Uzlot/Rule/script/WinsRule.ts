import { Mathf } from "../../../Uzil/Uzil";
import { ReelColData } from "../../Reel/index_Reel";
import { SlotUtil } from "../../Slot/index_Slot";
import { SymbolCode, WinData, LineTable } from "../index_Rule";

export class WinsRule {

	/*== Constructer ============================================= */

	/*== Member ===================================================*/

	public static betBase : number = 30;

	/** 基本輪盤面的各序號 */
	public static baseResultReelIdxs : number[] = [0, 1, 2, 3, 4];

	/** 額外輪盤面的各序號 */
	public static extraResultReelIdxs : number[] = [5];

	/** 額外輪的各格(上到下) 對應 基本盤面的輪軸序號 */
	public static extra2BaseReelIdx = [3, 2, 1];

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/

	/**
	 * 取得各線贏分資料
	 * @param bet 下注 (下注金額 或 下注倍率)
	 * @param resultReels 滾輪結果 
	 * @param reelsSheet 滾輪表
	 * @param isFg 是否為FreeGame (特殊規則用)
	 */
	
	public static getWinDataList_Line (bet: number, resultReels: number[][], oddsTable: number[][]) : WinData[] {

		let winDataList : WinData[] = [];

		// lineGame ===============

		// 每個中獎線
		for (let winLineIdx = 0; winLineIdx < LineTable.length; winLineIdx++) {
			
			// 中獎線
			let winLine = LineTable[winLineIdx];
			
			// 該次檢查的結果
			let winDataList_perCheck:WinData[] = [];

			// 先找一般圖標開頭的======================

			// 檢查線上出現的第一個圖標(排除W跟F)
			let firstSymbolIdx : number = SymbolCode.NONE;
			// 該贏分線的每一輪
			for (let row = 0; row < winLine.length; row++) {
				
				// 該輪 的 中獎位置
				let winColPos : number = winLine[row];
				let resultCol : number = resultReels[row][winColPos];

				if (resultCol != SymbolCode.WD && resultCol != SymbolCode.SC) {
					firstSymbolIdx = resultCol;
					break;
				}
			}

			if (firstSymbolIdx == SymbolCode.NONE) {
				continue;
			}
			
			// 檢查圖標是否連線(排除WILD跟F)

			// 連線數量
			let comboCount : number = 0;
			// 該贏分線的每一輪
			for (let row = 0; row < winLine.length; row++) {
				
				// 該輪 的 中獎位置
				let winColPos : number = winLine[row]; // 上 中 下 : 0, 1, 2
				let resultCol : number = resultReels[row][winColPos];

				// 若 與 首個圖標 相同 或 為WILD 則 視為連線
				if (resultCol == firstSymbolIdx || resultCol == SymbolCode.WD) {
					comboCount++;
				} else {
					break;
				}
			}
			
			// 若該線中 超過3個圖標連續 為 中獎
			if (comboCount >= 3) {
				let winData = new WinData();
				winData.code = winLineIdx + 1; // 給前端線的索引從1開始
				winData.symbol = firstSymbolIdx;
				winData.count = comboCount;
				winData.winBonus = bet * oddsTable[winData.symbol][winData.count];
				winDataList_perCheck.push(winData);
			}

			// 再找WILD圖標開頭的======================

			// 連線數量
			let comboCount2 = 0;

			// 贏分線第一輪位置
			let winColOfFirstRow = winLine[0];
			// 當前盤面的首輪 在 贏分線第一輪位置 的 圖標
			let resultColOfFirstRow = resultReels[0][winColOfFirstRow];
			// 該贏分線的每一輪
			for (let row = 0; row < winLine.length; row++) {

				// 該輪 的 中獎位置
				let winColPos = winLine[row];
				let resultCol = resultReels[row][winColPos];

				// 若 首個位置的圖標為WILD 且 該輪該贏分位置的圖標 為 WILD
				if (resultColOfFirstRow == SymbolCode.WD && resultCol == SymbolCode.WD) {
					comboCount2++;
				}
			}
			
			if (comboCount2 >= 3) {
				let winData = new WinData();
				winData.code = winLineIdx + 1; // 給前端線的索引從1開始
				winData.symbol = SymbolCode.WD;
				winData.count = comboCount2;
				winData.winBonus = bet * oddsTable[winData.symbol][winData.count];
				winDataList_perCheck.push(winData);
			}
			
			if (winDataList_perCheck.length > 0) {
				// 取出一條線上的最高中獎倍率(一條線可能因WILD存在而有2種中獎倍率)
				// 排序(分數高的在前)
				winDataList_perCheck.sort(function (a, b) {
					return a.winBonus < b.winBonus ? 1 : -1;
				});

				winDataList.push(winDataList_perCheck[0]);
			}

		}

		return winDataList;
	}

	/**
	 * 取得各線贏分資料
	 * @param bet 下注 (下注金額 或 下注倍率)
	 * @param reelResult 滾輪結果 
	 * @param reelsSheet 滾輪表
	 * @param options 其他選項
	 */
	public static getWinDataList_Way (bet: number, reelResult: ReelColData[][], oddsTable: Object, options: Object) : WinData[] {

		let winDataList : WinData[] = [];

		// 只取出 要被當結果的 格資料
		reelResult = reelResult.map((eachReel)=>{
			return eachReel.map((eachColData)=>{
				if (eachColData.tags.indexOf("resultable") != -1) return eachColData;
			}).filter((each)=>{return each != undefined});
		});
		
		// 額外輪 結果 ======================================
		let extraReelResult : ReelColData[][] = options["extraReelResult"];
		
		let copyBaseIdx2ExtraIdx : Map<number, {extraReelIdx:number, col:number}>[];
		let extra2BaseReelIdx : number[] = options["extra2BaseReelIdx"];
		let baseResultReelIdxs : number[] = options["baseResultReelIdxs"];
		let extraResultReelIdxs : number[] = options["extraResultReelIdxs"];

		if (extraReelResult) {
			
			// 基本輪 結果
			let baseReelResult = reelResult;

			// 轉換表
			if (!extra2BaseReelIdx) extra2BaseReelIdx = WinsRule.extra2BaseReelIdx;

			// 基本輪序號
			if (!baseResultReelIdxs) baseResultReelIdxs = WinsRule.baseResultReelIdxs;

			// 額外輪序號
			if (!extraResultReelIdxs) extraResultReelIdxs = WinsRule.extraResultReelIdxs;

			// 對應註冊
			copyBaseIdx2ExtraIdx = [];
			for (let idx = 0; idx < baseReelResult.length; idx++) {
				copyBaseIdx2ExtraIdx.push(new Map<number, {extraReelIdx:number, col:number}>());
			}

			// 每個額外輪
			for (let row = 0; row < extraReelResult.length; row++) {
				let eachExtraReelRes = extraReelResult[row];
				let extraReelIdx = extraResultReelIdxs[row];

				// 需要轉換的數量 為 轉換對應表總數 或 該額外輪所有的格數 取 較少者
				let totalConvert = Mathf.min(extra2BaseReelIdx.length, eachExtraReelRes.length);
				for (let idx = 0; idx < totalConvert; idx++) {
					
					// 要取代的基本輪序號
					let toReplaceBaseReelIdx = extra2BaseReelIdx[idx];
					// 要取代的基本輪序號 在 盤面結果中的位置
					let baseReelResultIdxOf = baseResultReelIdxs.indexOf(toReplaceBaseReelIdx);
					// 要取代的盤面結果
					let baseReelResultEachRow = baseReelResult[baseReelResultIdxOf];

					// 額外輪中的格
					let extraColRes = eachExtraReelRes[idx];
					
					// 建立副本 並設置 格序號 為 該基本輪的請求額外格序號
					let copy = extraColRes.getCopy();
					let srcColIdx = copy.idx;
					let copyColIdx = SlotUtil.requestExColIdx(toReplaceBaseReelIdx);
					copy.idx = copyColIdx;

					// 加入 基本輪結果中
					baseReelResultEachRow.unshift(copy);
					
					// 紀錄 對應註冊
					let eachCopyBaseIdx2ExtraIdx = copyBaseIdx2ExtraIdx[baseReelResultIdxOf];
					eachCopyBaseIdx2ExtraIdx.set(copyColIdx, {
						extraReelIdx: extraReelIdx,
						col:srcColIdx
					});
				}

			}
		}

		
		// wayGame ======================


		// 檢查路徑 並 加入總贏分資料
		let checkAndWin = (winSymbol, path) => {
			// 結算
			if (path.length >= 3 /* && winSymbol != 0 */) {
				// 贏分資料
				let data = new WinData();
				data.code = -1;/* 未知 */
				data.symbol = winSymbol;
				data.count = path.length;

				// 賠率表
				// cc.log(data.symbol);
				let bonusTable = oddsTable[SymbolCode[data.symbol]];

				// 若 無賠率表
				if (bonusTable == null) {
					cc.log("[ResultTest]: symbol table not exist:"+data.symbol);
					data.winBonus = 0;
				} else {
					data.winBonus = (bet / WinsRule.betBase) * bonusTable[data.count];
					// cc.log("winBonus:"+data.winBonus+" = bet("+bet+") / WinsRule.betBase("+WinsRule.betBase+") * bonusTable[count("+data.count+")]");
				}
				data.path = path;


				// 逐一檢查 與 已存贏分資料 有無相同路徑
				for (let each of winDataList) {

					let isSame = true;

					// 若數量不一致 則 略過檢查
					if (each.path.length != data.path.length) {
						continue;
					}

					// 若有任一位置 兩者相同 則 視為 不同筆贏分資料
					for (let i = 0; i < data.path.length; i++) {
						if (data.path[i] != each.path[i]) {
							isSame = false;
							break;
						}
					}
					
					// 若有一筆資料相同 則 返回
					if (isSame) {
						return;
					}

				}

				// 通過檢查 則 新增贏分資料
				winDataList.push(data);

				// cc.log("===add win==="+JSON.stringify(path));
			}
		};

		// NOTE 遞迴
		let getWinOnNext : Function = null;
		getWinOnNext = (row, col, winSymbol, path)=>{
			// cc.log("row("+row+") col("+col+")");

			// 滾輪
			let reel = reelResult[row];

			// 該格圖標
			let curCol = reel[col];
			let curSymbol = curCol.symbol;

			// 若 尚未訂定當前判定圖標 且 路徑為空 則
			if (winSymbol == null && path.length == 0) {
				// 設置 當前判定圖標 為 該格圖標
				winSymbol = curSymbol;
			}

			// 條件檢查
			let isCurNull = curSymbol == SymbolCode.NONE; 
			if (isCurNull) return false;

			let isWinSymbolWild = winSymbol == SymbolCode.WD;
			let isWinSymbolScatter = winSymbol == SymbolCode.SC;
			let isCurSymbolWild = curSymbol == SymbolCode.WD;
			let isCurSymbolScatter = curSymbol == SymbolCode.SC;
			let isSameSymbol = winSymbol == curSymbol;

			// 若 當前判斷圖標為wild 且 該格圖標 不是 wild
			if (isWinSymbolWild && !isCurSymbolWild) {

				// 若該格圖標是scatter 則
				if (isCurSymbolScatter) {
					// 回傳找無可能性
					return false;
				}

				// 指定當前判斷圖標為該格圖標
				winSymbol = curSymbol;
			}
			
			// 若非相同圖標 且 該格 與 當前判斷圖標 都非Wild 則 結算中止
			else if (!isSameSymbol && !isCurSymbolWild && !isWinSymbolWild) {
				// cc.log("not same not wild");
				// 回傳找無可能性
				return false;
			}

			// 若 當前判斷圖標是scatter 且 該格圖標是wild 則
			if (isWinSymbolScatter && isCurSymbolWild) {
				// 回傳找無可能性
				return false;
			}else if (isCurSymbolWild) {

				
			}

			// NOTE
			// 在FreeGame中，Scatter不算連線
			if (/* isFg && */ isCurSymbolScatter) {
				return false;
			}
			

			// 增加路徑
			path[row] = curCol.idx;

			// 檢查下一輪邊界，若超出則就當前輪結算
			let nextRow = row+1;
			if (nextRow >= reelResult.length) {
				checkAndWin(winSymbol, path);
				// cc.log("way end");
				// 回傳找到可能性
				return true;
			}

			// 依序呼叫 下一輪 的 每一格 做後續檢查
			let nextReel = reelResult[nextRow];
			// 是否有其他通路可能性
			let isPass = false;
			for (let colInNextRow = 0; colInNextRow < nextReel.length; colInNextRow++) {
				// 只要其中一條可以通 則 此格 有其他通路可能性
				let isWayPass = getWinOnNext(nextRow, colInNextRow, winSymbol, path.slice());
				if (isWayPass) {
					isPass = true;
				}
			}

			// 若 此格 有其他通路可能性 則 回傳 有其他通路可能性
			if (isPass) {
				return true;
			}
			// 否則結算
			else {
				checkAndWin(winSymbol, path);
				return true;
			}

		};

		// 第一輪的每一格
		for (let col = 0; col < reelResult[0].length; col++) {
			getWinOnNext(0, col, null, []);
		}

		// 合併相同圖標的贏分資料
		let symbol2Win = {};
		for (let eachWin of winDataList) {
			let eachSymbol = eachWin.symbol.toString();

			// 該圖標的贏分資料
			let symbolWin : WinData;

			// 現有的該圖標贏分資料
			let existedWin : WinData = symbol2Win[eachSymbol];

			// 若 不存在 則 建立
			if (!existedWin) {
				
				symbolWin = new WinData();
				
				symbolWin.symbol = eachWin.symbol;
				symbolWin.winBonus = eachWin.winBonus;

				symbolWin.path = [];
				for (let row = 0; row < eachWin.path.length; row++) {
					let toAdd = eachWin.path[row];
					symbolWin.path[row] = [toAdd];
				}

				symbol2Win[eachSymbol] = symbolWin;

			}
			// 存在 則 比較並合併
			else {
				
				symbolWin = existedWin;
				symbolWin.winBonus += eachWin.winBonus;
				
				// 較長的路徑
				let longerPath = (symbolWin.path.length > eachWin.path.length)? symbolWin.path:eachWin.path;
				// 每一輪
				for (let row = 0; row < longerPath.length; row++) {
					let toAdd = eachWin.path[row];
					if (toAdd == undefined) continue;
					if (symbolWin.path[row].indexOf(toAdd) != -1) continue;

					symbolWin.path[row].push(toAdd);
				}
			}
		}

		winDataList = [];
		for (let eachSymbol in symbol2Win){
			winDataList.push(symbol2Win[eachSymbol]);
		}

		if (extraReelResult) {

			// 基本輪 結果
			let baseReelResult = reelResult;

			// 把 額外輪 的 贏分資料 從 基本輪 分出
			
			// 每個贏分資料
			for (let winData of winDataList) {

				let pathCount = winData.path.length;

				// 每個贏分路徑(輪軸)
				for (let row = 0; row < pathCount; row++) {
					if (extra2BaseReelIdx.indexOf(row) == -1) continue;

					// 對應註冊
					let eachCopyBaseIdx2ExtraIdx = copyBaseIdx2ExtraIdx[row];

					// 路徑中的每個格
					let colsInPath = winData.path[row];
					// 輪詢用
					let colsInPath_for = colsInPath.slice();
					for (let idxInPath = 0; idxInPath < colsInPath_for.length; idxInPath++) {

						let col = colsInPath_for[idxInPath];

						// 若 不在 紀錄表中 則 忽略
						if (eachCopyBaseIdx2ExtraIdx.has(col) == false) continue;

						let info = eachCopyBaseIdx2ExtraIdx.get(col);
						let srcColIdx = info.col;
						let extraReelIdx = info.extraReelIdx;
						let extraReelResultIdxOf = baseResultReelIdxs.length + extraResultReelIdxs.indexOf(extraReelIdx);

						// 補足 至 額外輪 路徑
						while (winData.path.length < extraReelResultIdxOf+1) {
							winData.path.push([]);
						}

						// 加入 額外輪 路徑
						let extraInPath = winData.path[extraReelResultIdxOf];
						if (extraInPath.indexOf(srcColIdx) == -1) {
							extraInPath.push(srcColIdx);
						}

						// 從 基本輪路徑中 移除
						colsInPath.splice(idxInPath, 1);

					}

				}
			}

			// 把盤面結果的 額外格副本 移除
			for (let idx = 0; idx < extra2BaseReelIdx.length; idx++) {
				
				// 要取代的基本輪序號
				let toReplaceBaseReelIdx = extra2BaseReelIdx[idx];
				// 要取代的基本輪序號 在 盤面結果中的位置
				let baseReelResultIdxOf = baseResultReelIdxs.indexOf(toReplaceBaseReelIdx);
				// 要取代的盤面結果
				let baseReelResultEachRow = baseReelResult[baseReelResultIdxOf];

				let copyBaseIdx2ExtraIdxInRow = copyBaseIdx2ExtraIdx[baseReelResultIdxOf];

				copyBaseIdx2ExtraIdxInRow.forEach((v, k)=>{
					
					let copyColIdx = k;
					
					let copyColIdxOf = baseReelResultEachRow.findIndex((each)=>{return each.idx == copyColIdx;});
					
					if (copyColIdxOf != -1) {
						baseReelResultEachRow.splice(copyColIdxOf, 1);
					}

					// 歸還idx
					SlotUtil.recoveryExColIdx(toReplaceBaseReelIdx, copyColIdx);
				});
			}
		}



		return winDataList;
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}