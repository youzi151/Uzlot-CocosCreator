import { Invoker, Event, EventData, EventListener} from "../../../Uzil";


const {ccclass, property} = cc._decorator;

@ccclass
export class Example_Event extends cc.Component {

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {
		let event = new Event();

		event.add(new EventListener((eventData, ...args)=>{
			
			cc.log(eventData.data["msg"]);
			cc.log(eventData.args[0] + " | " + args[0]);

			eventData.data["msg"] = "覆蓋後的資料A";
			eventData.args[0] = "覆蓋後的參數1";

		}).sort(1));

		event.add(new EventListener((eventData, ...args)=>{
			cc.log(eventData.data["msg"]);
			cc.log(eventData.args[0] + " | " + args[0]);
		}).sort(5));

		event.add(new EventListener((eventData, ...args)=>{
			cc.log("=================================");
		}).sort(10));


		event.data["msg"] = "預設資料A";
		event.args.push("預設參數1");

		event.call();


		Invoker.once(()=>{
			event.callData({
				'msg': "呼叫資料A"
			}, "呼叫參數1");

		},5);


		event.add(new EventListener((eventData: EventData, ...args)=>{
			cc.log("等候5秒");
			eventData.wait();

			// eventData.stop(); // 如果要終止

			Invoker.once(()=>{
				eventData.next();
			}, 5);

		}).sort(3));


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

