import { ReelStripData } from "../../Reel/index_Reel";


const {ccclass, property} = cc._decorator;

export class GameClient {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/
	
	/** 連接 */
	public async connect () : Promise<any> {

	}

	/** 斷開 */
	public disconnect () {

	}
	
	/** 註冊 當斷開 */
	public onDisconnect (cb: (err:any) => void) {
		
	}

	/** 註冊 當報錯 */
	public onError (cb: (err:any) => void) {
		
	}

	/** 取得滾輪表 */
	public async getStripTables () : Promise<Map<string, ReelStripData[]>> {
		return null;	
	}

	/** 註冊 當滾輪表更新 */
	public onStripTableUpdate (cb: (err:any, res:any) => void) {
		
	}

	/** 滾動 */
	public async spin (bet: number) : Promise<any> {

	}

	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}