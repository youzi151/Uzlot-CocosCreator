import { DrawCtrl } from "../../../index_Slot";
import { WinData } from "../../../../Rule/index_Rule";

const {ccclass, property} = cc._decorator;

@ccclass
export class DrawMethod extends cc.Component {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/** 滾動 控制 */
	protected _drawCtrl : DrawCtrl = null;

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/
	
	/*== 基本功能 =================*/

	/*== Protected Function =======================================*/

	/**
	 * 初始化
	 * @param drawCtrl 開獎控制
	 */
	public init (drawCtrl: any) : void {
		this._drawCtrl = drawCtrl;
	}

	/** 進入狀態 */
	public play (data: Object) : void {
		

	}

	/** 停止 */
	public stop () : void {
		
	}


	/*== Private Function =========================================*/

}
