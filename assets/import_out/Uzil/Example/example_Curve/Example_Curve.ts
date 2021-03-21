import { CurveData, Mathf } from "../../Uzil";

const {ccclass, property} = cc._decorator;

@ccclass
export default class Example_Curve extends cc.Component {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	@property(cc.Node)
	public target: cc.Node = null;

	public time: number = 0;
	public timeMax: number = 5;

	public curve: CurveData;

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/
	
	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {
		this.curve = CurveData.create({
			'points':[
				{
					pos:[0, -200],
					easeOut:[25, 0],
					easeType:["weighted"]
				},
				{
					pos:[50, 200],
					easeIn:[-25, 0]
				},
			],
			'length':2
		});

		// let val = this.curve.getVal(5);
			
		// this.target.y = val;

		// 	cc.log("time["+this.time+"] : "+this.target.y)
	}

	

	update (dt) {
		if (this.time <= this.timeMax) {

			let val = this.curve.getVal(this.time);
			
			this.target.y = val;
			cc.log("time["+this.time+"] : "+this.target.y)

			if (this.time == this.timeMax) {
				this.time = this.timeMax+99;
			}
			

			// 推進時間
			this.time = Mathf.moveToward(this.time, this.timeMax, dt);

		}

	}
	
	/*== Public Function ==========================================*/
	
	/*== 基本功能 =================*/

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

}
