
export class InvokerQueueTask {

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 執行內容 */
	public func : Function = ()=>{cc.log("do something")};

	/** 優先度 (越大越先) */
	public priority : number = 0;

	/** 標籤 */
	public tags : Array<string> = [];
	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/
	
	/*== Public Function ==========================================*/

	/**
	 * 呼叫
	 * @param args 附加參數
	 */
	public call (...args) : void {
		this.func(...args);
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}

