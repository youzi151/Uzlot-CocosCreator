import { ReelColData, ReelStripData } from "../../../Reel/index_Reel";
import { ReelRule, SymbolCode } from "../../../Rule/index_Rule";


let StripParse = {

	normal : function (stripTable:SymbolCode[][]) : ReelStripData[] {

		let result = [];


		for (let eachRow of stripTable) {
			
			let stripData = new ReelStripData();

			stripData.blockPerCol_forAnim = ReelRule.reelBlockPerCol;
			
			let cols = [];

			let currentPos = 0;

			for (let idx = 0; idx < eachRow.length; idx++) {
				
				let eachCol = eachRow[idx];
				
				let colData = new ReelColData();
				colData.idx = idx;

				let sizeLevel = 2;

				colData.sizeLevel = sizeLevel;

				let half = sizeLevel * 0.5;
				colData.displayRange_relative = [half, half];
				colData.triggerRange_relative = [half, half];

				colData.pos = currentPos + half;

				currentPos += sizeLevel;

				colData.symbol = eachCol;

				// 預設可以結算
				colData.addTag("resultable");
			
				cols.push(colData);
			}

			stripData.setCols(cols);

			result.push(stripData);

		}
		
		return result;
	},

	megaways : function (stripTable:SymbolCode[][]) : ReelStripData[] {

		let result = [];

		for (let row = 0; row < stripTable.length; row++) {

			let eachRowCols = stripTable[row];
			
			let stripData = new ReelStripData();

			stripData.blockPerCol_forAnim = ReelRule.reelBlockPerCol;
			
			let cols = [];

			let currentPos = 0;

			for (let idx = 0; idx < eachRowCols.length; idx++) {
				
				let eachCol = eachRowCols[idx];
				
				let colData = new ReelColData();
				colData.idx = idx;

				let sizeLevel = 2;

				// 改變尺寸
				// 若 要改變尺寸 則 需要確保 停輪位置 剛好停在 任一格的邊界上
				
				colData.sizeLevel = sizeLevel;

				let half = sizeLevel * 0.5;
				colData.displayRange_relative = [half, half];
				colData.triggerRange_relative = [half, half];

				colData.pos = currentPos + half;

				currentPos += sizeLevel;

				colData.symbol = eachCol;

				// 預設可以結算
				colData.addTag("resultable");
			
				cols.push(colData);
			}

			stripData.setCols(cols);

			result.push(stripData);

		}
		
		return result;
	},

	freeways : function (stripTable:SymbolCode[][]) : ReelStripData[] {

		let result = [];


		for (let eachRow of stripTable) {
			
			let stripData = new ReelStripData();

			stripData.blockPerCol_forAnim = ReelRule.reelBlockPerCol;
			
			let cols = [];

			let currentPos = 0;

			for (let idx = 0; idx < eachRow.length; idx++) {
				
				let eachCol = eachRow[idx];
				
				let colData = new ReelColData();
				colData.idx = idx;

				let sizeLevel = 2;

				// 改變大小
				if (eachCol != SymbolCode.H1 && eachCol != SymbolCode.SC) {
					let condition = (idx*idx);
					if (condition % 3 == 0) {
						sizeLevel = 1;
					}
					else if (condition % 4 == 0) {
						sizeLevel = 3;
					}
				}
				
				colData.sizeLevel = sizeLevel;

				let half = sizeLevel * 0.5;
				colData.displayRange_relative = [half, half];
				colData.triggerRange_relative = [half, half];

				colData.pos = currentPos + half;

				currentPos += sizeLevel;

				colData.symbol = eachCol;

				// 預設可以結算
				colData.addTag("resultable");
			
				cols.push(colData);
			}

			stripData.setCols(cols);

			result.push(stripData);

		}
		
		return result;
	}

};

	
	
export { StripParse };