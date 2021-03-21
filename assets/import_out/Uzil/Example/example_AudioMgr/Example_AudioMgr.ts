import { AudioMgr, AudioObj } from "../../Uzil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Example_AudioMgr extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {

		AudioMgr.play('se');

		let layer1 = AudioMgr.layer('maingame');
		layer1.add('se').vol(1).prio(2);
		cc.log("maingame se vol:1 priority:2");

		let layer2 = AudioMgr.layer('freegame');
		layer2.add('se').vol(0).prio(1);
		cc.log("freegame se vol:0 priority:1");

		this.scheduleOnce(()=>{
			let layer3 = AudioMgr.layer('bonusgame');
			layer3.add('se').vol(0).prio(3);
			cc.log("bonusgame se vol:0 priority:3");
		}, 3);

		this.scheduleOnce(()=>{
			layer2.add('se').vol(1).prio(4);
			cc.log("freegame se vol:1 priority:4");
		}, 6);

		this.scheduleOnce(()=>{
			AudioMgr.audio('se').setVolume(0.5);
			cc.log("se self vol:0.5");
		}, 9);


		this.scheduleOnce(()=>{
			AudioMgr.rmlayer('freegame');
			cc.log("remove freegame layer (bonusgame se vol:0)");
		}, 12);

		

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

