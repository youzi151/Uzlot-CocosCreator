
export class Objf {
	
	/*== Constructor ==============================================*/

	/*== Static ===================================================*/
	
	/**
	 * 複製
	 * @param obj 要複製的來源物件
	 * @returns 副本物件
	 */
	public static clone (obj: Object) : Object {
		return this.assign({}, obj);
	}

	/**
	 * 指定
	 * @param obj 要被指定成員的物件
	 * @param overwriteObjs 所有要覆寫的物件
	 * @returns 被覆寫指定成員後的物件
	 */
	public static assign (obj: Object, ...overwriteObjs) : Object {
		for (let index = 0; index < overwriteObjs.length; index++) {
			let nextSource = overwriteObjs[index];
			
			if (!nextSource) continue;

			for (let nextKey in nextSource) {
				// Avoid bugs when hasOwnProperty is shadowed
				if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
					obj[nextKey] = nextSource[nextKey];
				}
			}
		}
		return obj;
	}

	/*== Member ===================================================*/

	/*== Event ====================================================*/

	/*== Public Function ==========================================*/

	/*== 基本功能 =================*/

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

}