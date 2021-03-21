
export class InvokerUpdateTask {

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 執行內容 */
	public func : (dt: number)=>void = (dt)=>{cc.log("do something")};

	/** 標籤 */
	public tags : Array<string> = [];
	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/
	
	/*== Public Function ==========================================*/

	/**
	 * 呼叫
	 * @param args 附加參數
	 */
	public call (dt: number) : void {
		this.func(dt);
	}
	
	/**
	 * 增加標籤
	 * @param tagOrTags 標籤 或 標籤陣列
	 * @returns InvokerTask 返回自己
	 */
	public tag (tagOrTags: string | Array<string>) : InvokerUpdateTask {
		let toAdd = tagOrTags;
		if (typeof tagOrTags == "string") {
			toAdd = [tagOrTags];
		}

		for (let each of toAdd) {
			if (this.tags.indexOf(each) == -1) {
				this.tags.push(each);
			}
		}
		return this;
	}

	/**
	 * 移除標籤
	 * @param tagOrTags 標籤 或 標籤陣列
	 * @returns InvokerTask 返回自己
	 */
	public untag (tagOrTags: string | Array<string>) : InvokerUpdateTask {
		let toRm = tagOrTags;
		if (typeof tagOrTags == "string") {
			toRm = [tagOrTags];
		}

		for (let each of toRm) {
			let idx = this.tags.indexOf(each);
			if (idx != -1) {
				this.tags.splice(idx, 1);
			}
		}
		return this;
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}

