import { SymbolCode } from "../../../Rule/index_Rule";
import { ReelRowViewPass, ReelColObj } from "../../index_Reel";
import { ColMiddle } from "../Data/ColMiddle";
import { ReelColData } from "../Data/ReelColData";
import { ReelStripData } from "../Data/ReelStripData";
import { ReelRowView } from "../ReelRowView";

const {ccclass, property} = cc._decorator;

@ccclass
export default class ReelRowViewPass_New extends ReelRowViewPass {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	// start () {}

	// update (dt) {}

	
	/*== Public Function ==========================================*/
	
	/*== Protected Function =======================================*/

	/**
	 * 通過通道
	 * @param passArgs 參數
	 */
	protected _pass (passArgs: any) : any {

		let colObjs : Array<ReelColObj> = passArgs.colObjs;
		let colData : ReelColData = passArgs.colData;
		let colMiddle : ColMiddle = passArgs.colMiddle;

		let stripData : ReelStripData = passArgs.stripData;
		let view : ReelRowView = passArgs.view;
		
		// 若已經有圖標 且 不是新建立 則 返回
		for (let colObj of colObjs) {

			if (passArgs.isNew == false && colObj.symbol != SymbolCode.NONE) continue
		
			let args = colMiddle.getArgs(colObj);

			// 是否啟用
			let isActive : boolean = args["isActive"];
			// 若 無指定 則 預設 啟用
			if (isActive == null) {
				isActive = true; 
			}

			// 啟用衝突
			let activeConflict : number[] = args["activeConflict"];
			
			// 若 啟用衝突 存在
			if (activeConflict != null) {

				// 此格的每一個衝突格
				for (let each of activeConflict) {
				
					// 取得格資料與中介
					let conflictData = stripData.getColByIdx(each);
					let conflictMiddle = view.requestMiddle(conflictData);
					
					if (passArgs.isDebug) {
						cc.log(colData.idx, conflictData.idx, conflictMiddle.args)
					}

					// 若 該衝突格 有任何格物件 啟用中 則 此格 不啟用
					if (conflictMiddle.isAnyObjActive()) {
						isActive = false;
						break;
					}

				}
			}
			
			let colDataOfMiddle = colMiddle.data;
				
			// 設置圖標
			colObj.setSize(colDataOfMiddle.sizeLevel);
			colObj.setSymbol(colDataOfMiddle.symbol);

			// 設置啟用
			colObj.setActive(isActive);
		
			if (passArgs["isDebug"]) {
				cc.log("idx["+colData.idx+"] col["+colMiddle.data.idx+"] Symbol["+ SymbolCode[colData.symbol]+"] colObjSymbol["+SymbolCode[colObj.symbol]+"]: "+(colObj.node.active==false))
			}


		}

		return passArgs;
	}


	/*== Private Function =========================================*/


}

