import { Objf, Async, EventListener, EventData } from "../../../Uzil";

export class Event {

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/** 偵聽者列表 */
	public listeners : Array<EventListener> = [];

	/** 預設資料 */
	public args : Array<any> = [];
	public data : Object = {};

	/*== Event ====================================================*/

	/*== Public Function ==========================================*/

	/**
	 * 註冊
	 * @param funcOrListener 回呼 或 偵聽者
	 */
	public add (funcOrListener: any) : EventListener {
		let listener;

		// 判斷參數類型 加入 偵聽
		if (funcOrListener instanceof EventListener) {
			
			this.addListener(funcOrListener);

			listener = funcOrListener;

		} else if (funcOrListener instanceof Function){
			
			listener = new EventListener();
			listener.func = funcOrListener;
	
			this.addListener(listener);
		}

		return listener;
	}
	/** 
	 * 註冊 
	 * @param listener 要加入的偵聽者
	 */
	public addListener (listener: EventListener) : EventListener {
		if (this.listeners.indexOf(listener) != -1) return;
		else this.listeners.push(listener);
		
		// 排序
		this.sort();

		return listener;
	}

	/** 註冊一次性 */
	public addOnce (func: (event: any, ...args)=>void) : EventListener {
		return this.addListener(new EventListener(func).once());
	}

	/**
	 * 註銷
	 * @param idOrListener ID 或 偵聽者
	 */
	public remove (idOrListener: any) : void {
		if (idOrListener instanceof EventListener) {
			
			this.removeListener(idOrListener);

		} else if (typeof idOrListener == 'string') {
		
			// 每一個偵聽者
			let copy = this.listeners.slice();
			for (let each of copy){
				// 若為指定名稱 則 移除
				if (each.id == idOrListener) {
					this.removeListener(each);
				}
			}

		}
	}
	/** 註銷 */
	public removeListener (listener: EventListener) : void {
		let idx = this.listeners.indexOf(listener);
		if (idx == -1) return;
		else this.listeners.splice(idx, 1);
	}

	/**
	 * 呼叫
	 * @param _args 附加參數
	 */
	public call (...args) : void {
		this.callData(/* data */null, ...args)
	}
	/**
	 * 呼叫
	 * @param _data 資料
	 * @param _args 附加參數
	 */
	public callData (_data, ..._args) : void {
		let eventData : EventData = new EventData();

		
		//== 指定事件
		eventData.event = this;

		
		// 以預設資料覆寫
		let data = Objf.assign({}, this.data);
		// 以呼叫資料覆寫
		data = Objf.assign(data, _data);

		//== 指定 資料
		eventData.data = data;


		// 參數
		let args = _args;
		// 若無指定參數
		if (args == null || args.length == 0) {
			args = this.args;
		}

		//== 指定 參數
		eventData.args = args.slice();

		
		// 是否暫停下一位，進行等待
		let isPause : boolean = false;

		// 是否繼續呼叫其他偵聽者
		let isContinue : boolean = true;

		// 設置 等待
		eventData.wait = ()=>{
			isPause = true;
		};

		// 設置 停止
		eventData.stop = ()=>{
			isContinue = false;
		};

		// 複製當前要呼叫的偵聽者
		let listeners = this.listeners.slice();

		// 呼叫每一個偵聽者
		Async.eachSeries(listeners, (each, cb)=>{
			
			// 若 中途 已經被移除 則 忽略
			if (this.listeners.indexOf(each) == -1) {
				cb();
				return;
			}

			// 呼叫每個偵聽者 (允許非同步)				
				
			// 設置 "繼續" 的行為
			eventData.next = ()=>{
				if (isPause == false) return;

				// 繼續
				cb();
			};

			// 移除偵聽者
			eventData.removeListener = ()=>{
				eventData.event.removeListener(each);
			};

			// 減少呼叫次數
			if (each.callTime > 0) {
				each.callTime--;

				if (each.callTime == 0) {
					this.removeListener(each);
				}
				
			}

			// 呼叫事件
			each.call(eventData, ...args);


			// 若呼叫事件時 沒有 呼叫 "暫停"
			if (isPause == false) {
				// 繼續
				cb();
				// console.log("resolve (not Pause)");
			}else{
				// console.log("isPause");
			}

			// 若 指定不繼續
			if (!isContinue) {
				cb("not continue");
			}

		}, ()=>{

		});
		
	}

	/** 排序 (優先度越大越先) */
	public sort () : void {
		this.listeners.sort((a, b)=>{
			return b.priority - a.priority; //倒序
		});
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

