

export abstract class ObjPool<T> {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 物件佇列 */
	public poolStack : Array<T> = [];

	/** 實體 */
	public instanceList : Array<T> = [];

	/** 最大數量 */
	public maxCount : number = -1;

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/
	
	/*== 基本功能 =================*/

	/** 初始化 */
	public init (preGenerateCount: number) : void {
		for (let idx = 0; idx < preGenerateCount; idx++) {
			this.poolStack.push(this.create());
		}
	}

	/** 請求物件 */
	public request (initData: Object = null) : T {

		// 取得物件
		let result;
		if (this.poolStack.length > 0) {
			result = this.poolStack.pop();
		} else {
			result = this.create();
		}

		// 放入實體列表中
		this.instanceList.push(result);

		// 啟用物件
		this.enableObj(result, initData);

		return result;
	}

	/** 回收物件 */
	public recovery (obj: T) : void {

		let idxOf = this.instanceList.indexOf(obj);
		if (idxOf != -1) {
			// 從 實體列表 取出
			this.instanceList.splice(idxOf, 1);
		}

		// 若 有限制最大數量 且 pool內數量已達標
		if (this.maxCount != -1 && this.poolStack.length >= this.maxCount) {
			
			// 關閉物件
			this.disableObj(obj);
			
			// 銷毀物件
			this.destroy(obj);

		}
		// 否則
		else {
			// 推回佇列
			this.poolStack.push(obj);

			// 關閉物件
			this.disableObj(obj);

		}

	}

	/** 清空 */
	public clear () : void {
		for (let each of this.poolStack) {
			this.disableObj(each);
			this.destroy(each);
		}
		this.poolStack.splice(0, this.poolStack.length);
	}

	/*== 其他功能 =================*/

	/** 建立物件 */
	abstract create () : T;
	
	/** 銷毀物件 */
	abstract destroy (obj: T) : void; 

	/** 初始化物件 */
	abstract enableObj (obj: T, initData: Object) : T;

	/** 關閉物件 */
	abstract disableObj (obj: T) : void;

	/*== Private Function =========================================*/

}
