import {Invoker, InvokerQueue} from "../../Uzil";


const {ccclass, property} = cc._decorator;

@ccclass
export default class Example_Invoker extends cc.Component {

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {

		// 註冊更新
		let update = Invoker.update(()=>{
			cc.log("updating");
		});

		// 5秒後註銷更新
		Invoker.once(()=>{
			cc.log("after 5 sec");
			Invoker.stop(update);
		}, 5);

		let queue = new InvokerQueue();
		queue.add(()=>{cc.log(2);}, 30)
			 .add(()=>{cc.log(3);}, 10)
			 .add(()=>{cc.log(1);}, 50)
			 .run();


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

