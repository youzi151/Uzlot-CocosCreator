import { Async } from "../../Uzil";


const {ccclass, property} = cc._decorator;

@ccclass
export default class Example_Async extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {
		let self = this;

		// 依序執行 ==================

		// Async.waterfall([
		// 	(next)=>{
		// 		cc.log("[Async.waterfall]:", "0");
		// 		next(null, 1);
		// 	},
		// 	(msg, next)=>{
		// 		cc.log("[Async.waterfall]:", msg);
		// 		next(null, 100);
		// 	},
		// ], (err, res)=>{
		// 	cc.log("[Async.waterfall]:", res);
		// });
		
		// 同時執行 ==================

		// Async.parallelWithEach(
		// 	[
		// 		(cb)=>{
		// 			self.scheduleOnce(()=>{
		// 				cb(null, 50);
		// 			}, 3);	
		// 		},
		// 		(cb)=>{
		// 			self.scheduleOnce(()=>{
		// 				cb(null, 100);
		// 			}, 2);
		// 			self.scheduleOnce(()=>{
		// 				cb(null, 500);
		// 			}, 5);
		// 		},
		// 	], 
		// 	function each (err, results) {
		// 		cc.log("[Async.parallelWithEach]: each ", JSON.stringify(results));
		// 	},
		// 	function done (err, results){
		// 		cc.log("[Async.parallelWithEach]: done ", JSON.stringify(results));
		// 	}
		// );

		// 陣列依序執行 ===============
		// let str = "";
		// Async.eachSeries(
		// 	["hello", "world", "!"],
		// 	function each (item, cb) {
		// 		str += item;
		// 		self.scheduleOnce(()=>{
		// 			cc.log(str);
		// 			cb();
		// 		},2);
		// 	}, 
		// 	function done (){
		// 		cc.log("=====");
		// 		cc.log(str);
		// 	}
		// );

		// 陣列同時執行 ===============
		let str = "";
		Async.each(
			["hello", "world", "!"],
			function each (item, cb) {
				str += item;
				let strEach = str;
				self.scheduleOnce(()=>{
					cc.log(strEach);
					cb();
				},2);
			}, 
			function done (){
				cc.log("=====");
				cc.log(str);
			}
		);
		
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

