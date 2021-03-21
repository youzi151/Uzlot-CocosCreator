import { EventBus, EventListener} from "../../../Uzil";


const {ccclass, property} = cc._decorator;

@ccclass
export class Example_EventBus extends cc.Component {

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {

		let eventBus = EventBus.get();

		eventBus.register("onDone", new EventListener((msg)=>{
			cc.log("onDone called 3: "+msg);
		}).pry(1).name("A"));

		eventBus.register("onDone", new EventListener((msg)=>{
			cc.log("onDone called 1: "+msg);
		}).pry(3).name("A"));

		eventBus.register("onDone", new EventListener((msg)=>{
			cc.log("onDone called 2: "+msg);
		}).pry(2).name("B"));

		eventBus.registerAny(new EventListener((eventTag, msg)=>{
			cc.log("onAny called: "+msg);
		}).pry(2).name("B"));

		eventBus.post("onDone", "msg is here");

		eventBus.unregisterID("A");

		eventBus.post("onDone", "after unregister A");

		eventBus.unregisterTag("onDone");

		eventBus.post("onDone", "after unregister onDone");

		eventBus.unregisterID("B");

		eventBus.post("onDone", "after unregister B");// 偵聽者全被移除了，不會顯示

	}

	update (dt) {
		
		
	}

	
	/*== Public Function ==========================================*/

	/* 呼叫 */
	// public call (var1: Function, var2: number) : void {

	// }
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

