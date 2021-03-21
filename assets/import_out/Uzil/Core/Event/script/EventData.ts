import { Event } from "../index_Event";

export class EventData {

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/** 名稱 */
	public name : string = "_anonymous";

	/** 資料 */
	public data : Object = {};

	/** 參數 */
	public args : Array<any> = [];

	/** 所屬事件 */
	public event : Event = null;

	/** 停止呼叫其他偵聽者 */
	public stop : Function = ()=>{};

	/** 要求下一位等待主動呼叫 */
	public wait : Function = ()=>{};
	
	/** 若在等待中，則呼叫下一位繼續 */
	public next : Function = ()=>{};

	/** 取消註冊偵聽者 */
	public removeListener : Function = ()=>{};

	/*== Event ====================================================*/

	/*== Public Function ==========================================*/
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

