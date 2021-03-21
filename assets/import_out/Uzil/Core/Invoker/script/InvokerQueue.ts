import { InvokerQueueTask } from "../index_Invoker";

export class InvokerQueue {

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 任務列表 */
	public taskList : Array<InvokerQueueTask> = [];	

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/

	/* == 執行控制 ==================== */
	
	/**
	 * 執行
	 * @param args 附加參數
	 */
	public run (...args) : void {
		let copy = this.taskList.slice();
		for (let each of copy) {
			
			if (this.taskList.indexOf(each) == -1) continue;

			// 呼叫
			each.call(...args);
		}
	}

	/*== 內容操作 ==================== */

	/**
	 * 加入 回呼 到 佇列
	 * @param func 要執行的內容
	 * @param priority 優先度(越大越先)
	 * @returns 被加入而產生的任務
	 */
	public add (func: Function, priority: number) : InvokerQueue {
		// 建立任務
		let task = new InvokerQueueTask();
		task.func = func;
		task.priority = priority;

		// 加入列表
		this.taskList.push(task);

		//重新排序
		this.sort();

		return this;
	}

	/**
	 * 取消呼叫 (使用 任務)
	 * @param task 任務
	 */
	public remove (task: InvokerQueueTask) : void {
		// 檢查
		let idx = this.taskList.indexOf(task);
		if (idx == -1) return;

		// 移除
		this.taskList.splice(idx, 1);
	}
	/**
	 * 取消呼叫 (使用 標籤)
	 * @param tag 標籤
	 */
	public removeTag (tag: string) : void {
		// 查找
		let toRm : Array<InvokerQueueTask> = []
		for (let each of this.taskList) {
			if (each.tags.indexOf(tag) != -1){
				toRm.push(each);
			}
		}

		// 移除
		for (let each of toRm) {
			this.remove(each);
		}
	}

	/** 以優先度排序 (越大越先) */
	public sort () : void {
		this.taskList.sort((a, b)=>{
			return b.priority - a.priority;//倒序
		});
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

