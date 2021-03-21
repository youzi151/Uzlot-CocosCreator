import { Uzil } from "../../../Uzil";
import { TimeInstance } from "./TimeInstance";

const {ccclass, property} = cc._decorator;

/**
 * Time 時間系統
 * 1.可透過static來取得單例，也可手動建立 new Time() 來管理個別時間
 */

@ccclass
export class Time extends cc.Component {

	/*== Static ===================================================*/

	private static _getInstance () : Time {
		return Uzil.getComp('Time') as Time;
	} 

	/** 取得時間實例 */
	public static get (id: string = "_default") : TimeInstance {
		let timeMng = Time._getInstance();

		if (timeMng.id2instance.has(id) == false) {
			timeMng.id2instance.set(id, new TimeInstance());
		}

        return timeMng.id2instance.get(id);
	}
	
	/** 實際時間 */
	public static get since () : number {
		let since_ms = Date.now() - Time._getInstance()._sinceDate;
		return since_ms / 1000;
	}

	/*== 快速取得 =====================*/

	/** 時間比例 */
	public static get timeScale () : number {
		return Time.get().timeScale;
	}
	public static set timeScale (val) {
		Time.get().timeScale = val;
	}

	/** 當前時間 */
	public static get time () : number {
		return Time.get().time;
	}
	
	/*== Member ===================================================*/
	
    /** ID對應實例 */
    public id2instance : Map<string, TimeInstance> = new Map<string, TimeInstance>();
	
	/** 實際時間的開始 */
	private _sinceDate : number;

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		if (!this._sinceDate){
			this._sinceDate = Date.now();
		}
	}

	// start () {
		
	// }

	update (dt) {
		// 更新 每一個實例
		this.id2instance.forEach((val, key)=>{
			val.update(dt);
		});
	}
	
	/*== Public Function ==========================================*/
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

