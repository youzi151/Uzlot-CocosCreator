import { Event, EventListener } from "../index_Event";

export class EventBus {

	/*== Static ===================================================*/

	/** 所有EventBus */
	private static _instances : Object = {};
	/**
	 * 取得EventBus
	 * @param name 要取得的EventBus的名稱
	 */
	public static get (name: string = "_default") : EventBus {
		let bus = this._instances[name];
		if (!bus) {
			bus = new EventBus();
			this._instances[name] = bus;
		}
		return bus;
	}

	/*== Member ===================================================*/
	
	/** 以Tag快速索引 */
	public tag2Event : Object = {};

	/** 任意事件 */
	public anyEvent : Event = new Event();

	/*== Event ====================================================*/

	/*== Public Function ==========================================*/

	
	/**
	 * 發送
	 * @param eventTag 事件標籤
	 * @param args 附加參數
	 */
	public post (eventTag: string, ...args) : void {
		
		// 指定事件
		let event : Event = this._getEvent(eventTag)
		if (event) {
			event.call(...args);
		}

		// 任意事件
		this.anyEvent.call(eventTag, ...args);

	}

	/**
	 * 註冊
	 * @param eventTag 事件標籤
	 * @param listener 偵聽者
	 */
	public register (eventTag: string, listener: EventListener) : void {
		let event = this._getEvent(eventTag);
		event.addListener(listener);
	}
	
	/**
	 * 註冊任意事件 (所有事件皆會通知偵聽者)
	 * @param listener 偵聽者
	 */
	public registerAny (listener: EventListener){
		this.anyEvent.addListener(listener);
	} 

	/**
	 * 註銷 (使用 事件標籤)
	 * @param eventTag 事件標籤
	 */
	public unregisterTag (eventTag: string) : void {
		if (!this.tag2Event[eventTag]) return;
		
		// 移除索引
		delete this.tag2Event[eventTag];
	}
	/**
	 * 註銷 (使用 偵聽者ID)
	 * @param id 偵聽者ID
	 */
	public unregisterID (id: string) : void {
		// 指定
		for (let tag in this.tag2Event){
			this.tag2Event[tag].remove(id);
		}

		// 任意
		this.anyEvent.remove(id);
	}
	

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	/* 以tag取得事件 */
	private _getEvent (eventTag: string) : Event {
		
		let event = this.tag2Event[eventTag];
		
		if (!event) {
			event = new Event();
			this.tag2Event[eventTag] = event;
		}

		return event;
	}


}

