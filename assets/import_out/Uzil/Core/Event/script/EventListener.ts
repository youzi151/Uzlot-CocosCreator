import { EventData } from "./EventData";

export class EventListener {

	constructor (func: (event, ...args)=>void = ()=>{}) {
		this.func = func;
	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/** 識別 */
	public id : string = undefined;

	/** 執行內容 */
	public func : Function = (eventData: EventData, ...args)=>{cc.log("do something");};

	/** 優先度 */
	public priority : number = 0;

	/** 執行次數 */
	public callTime : number = -1;

	/** 其他資料 */
	public other : any = {};

	/*== Event ====================================================*/

	/*== Public Function ==========================================*/

	/**
	 * 呼叫
	 * @param args 附加參數
	 */
	public call (...args) : void {
		this.func(...args);
	}

	/**
	 * 設置優先度
	 * @param priority 優先度(越高越先執行)
	 */
	public pry (priority: number) : EventListener {
		this.priority = priority;
		return this;
	}

	/**
	 * 設置排序
	 * @param negPriority 排序(反向優先度，越小越先執行)
	 */
	public sort (negPriority: number) : EventListener {
		this.priority = negPriority * -1;
		return this;
	}

	/**
	 * 命名
	 * @param id 名稱
	 */
	public name (id: string) : EventListener {
		this.id = id;
		return this;
	}

	/**
	 * 可呼叫次數
	 * @param times 
	 */
	public times (times: number) : EventListener {
		this.callTime = times;
		return this;
	}
	
	/** 一次性執行 */
	public once () : EventListener {
		return this.times(1);
	}
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

