import { Uzil, Time, InvokerTask, InvokerUpdateTask } from "../../../Uzil";
const {ccclass, property} = cc._decorator;

/**
 * Invoker 呼叫器
 * 
 * 提供:
 * 1. 延遲呼叫 (註冊與取消)
 * 2. 每幀呼叫 (註冊與取消)
 * 
 * 依賴:
 * 1. Uzil 用來維持場景上的單例
 * 2. Time 用預設時間實例的時間經過，來判斷是否呼叫執行任務
 */


@ccclass
export class Invoker extends cc.Component {

	/*== Static ===================================================*/

	/** 取得單例 */
	public static getInstance() : Invoker {
		return Uzil.getComp('Invoker') as Invoker;
	}

	/**
	 * 呼叫
	 * @param func 要執行的內容
	 * @param delay_sec 要延遲執行的秒數
	 * @returns 被呼叫而產生的 任務
	 */
	public static once (func: Function, delay_sec: number) : InvokerTask {
		return Invoker.getInstance().invoke(func, delay_sec);
	}
	/**
	 * 取消呼叫
	 * @param taskOrTag 任務 或 標籤
	 */
	public static cancel (taskOrTag: InvokerTask | string) : void {
		if (typeof taskOrTag == 'string') {
			Invoker.getInstance().cancelInvokeTag(taskOrTag as string);
		} else if (taskOrTag instanceof InvokerTask) {
			Invoker.getInstance().cancelInvoke(taskOrTag as InvokerTask);
		}
	}

	/**
	 * 註冊 每幀更新會執行的回呼
	 * @param func 要執行的內容
	 * @returns 每幀執行的任務
	 */
	public static update (func: (dt:number)=>void) : InvokerUpdateTask {
		return Invoker.getInstance().invokeUpdate(func);
	}
	/**
	 * 註銷 每幀更新
	 * @param taskOrTag 任務 或 標籤
	 */
	public static stop (taskOrTag: any) : void {
		if (typeof taskOrTag == 'string') {
			Invoker.getInstance().cancelUpdateTag(taskOrTag as string);
		} else if (taskOrTag instanceof InvokerUpdateTask) {
			Invoker.getInstance().cancelUpdate(taskOrTag as InvokerUpdateTask);
		}
	}


	/*== Member ===================================================*/

	/** 任務列表 */
	public taskList : Array<InvokerTask> = [];

	/** 更新任務列表 */
	public updateTaskList : Array<InvokerUpdateTask> = [];
	

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	public start () {
		
	}

	public update (dt) {
		// 當前時間
		let time = this._getTime();

		// 一般任務 ==================
		
		// NOTE 這邊用副本是因為有可能在A任務中，把B任務移除
		let taskList_copy = this.taskList.slice();

		// 每個任務
		for (let each of taskList_copy){
			// 檢查是否還在清單中
			if (this.taskList.indexOf(each) == -1) continue;

			// 若尚未超過時間 忽略
			if (time < each.time) continue;

			// 呼叫
			each.call();

			// 移除
			this.cancelInvoke(each);
			
		}

		// 更新任務 ==================

		// NOTE 這邊用副本是因為有可能在A任務中，把B任務移除
		let updateTaskList_copy = this.updateTaskList.slice();
		
		// 每個更新任務
		for (let each of updateTaskList_copy){
			// 檢查是否還在清單中
			if (this.updateTaskList.indexOf(each) == -1) continue;

			// 呼叫
			each.call(dt);
		}

	}

	
	/*== Public Function ==========================================*/

	/*== 一般任務 ==================== */

	/**
	 * 呼叫
	 * @param func 要執行的內容
	 * @param delay_sec 要延遲執行的秒數
	 * @returns 被呼叫而產生的 任務
	 */
	public invoke (func: Function, delay_sec: number) : InvokerTask {
		// 建立任務
		let task = new InvokerTask();
		task.func = func;
		task.time = this._getTime() + delay_sec;

		// 加入列表
		this.taskList.push(task);

		return task;
	}
	/**
	 * 取消呼叫 (使用 任務)
	 * @param task 要取消的任務
	 */
	public cancelInvoke (task: InvokerTask) : void {
		// 檢查
		let idx = this.taskList.indexOf(task);
		if (idx == -1) return;
		// 移除
		this.taskList.splice(idx, 1);
	}
	/**
	 * 取消呼叫 (使用 標籤)
	 * @param task 要取消的任務
	 */
	public cancelInvokeTag (tag: string) : void {
		// 查找
		let toRm : Array<InvokerTask> = []
		for (let each of this.taskList) {
			if (each.tags.indexOf(tag) != -1){
				toRm.push(each);
			}
		}

		// 移除
		for (let each of toRm) {
			this.cancelInvoke(each);
		}
	}
	
	/*== 更新任務 ==================== */

	/**
	 * 註冊 每幀更新會執行的回呼
	 * @param func 要執行的內容
	 * @returns 每幀執行的任務
	 */
	public invokeUpdate (func: (dt)=>void) : InvokerUpdateTask {
		// 建立任務
		let task = new InvokerUpdateTask();
		task.func = func;

		// 加入列表
		this.updateTaskList.push(task);

		return task;
	}
	/**
	 * 註銷 每幀更新 (使用 任務)
	 * @param task 每幀更新任務
	 */
	public cancelUpdate (task: InvokerUpdateTask) : void {
		// 檢查
		let idx = this.updateTaskList.indexOf(task);
		if (idx == -1) return;

		// 移除
		this.updateTaskList.splice(idx, 1);
	}
	/**
	 * 註銷 每幀更新 (使用 標籤)
	 * @param tag 標籤
	 */
	public cancelUpdateTag (tag: string) : void {
		// 查找
		let toRm : Array<InvokerUpdateTask> = [];
		for (let each of this.updateTaskList) {
			if (each.tags.indexOf(tag) != -1){
				toRm.push(each);
			}
		}

		// 移除
		for (let each of toRm) {
			this.cancelUpdate(each);
		}
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	/* 取得時間 */
	private _getTime () : number {
		return Time.time;
	}

}

