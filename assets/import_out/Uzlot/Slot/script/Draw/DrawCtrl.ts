import { Event } from "../../../../Uzil/Uzil";
import { WinData } from "../../../Rule/index_Rule";
import { GameCtrl } from "../../index_Slot";
import { DrawMethod } from "./DrawMethod/DrawMethod";

const {ccclass, property} = cc._decorator;

@ccclass
export class DrawCtrl extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 方法 */
	@property(DrawMethod)
	public drawMethod : DrawMethod = null;

	/** 遊戲 控制 */
	public gameCtrl : GameCtrl = null;

	/** 是否開獎中 */
	public isDrawing : boolean = false;
	
	/*== Event ====================================================*/

	/** 當 播放 */
	public onPlay : Event = new Event();

	/** 當開獎結束 */
	public onDrawDone : Event = new Event();

	/** 當 停止 */
	public onStop : Event = new Event();

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		this.drawMethod.init(this);
	}

	start () {
		
	}

	update (dt) {
		
	}
	
	/*== Public Function ==========================================*/
	
	/** 開獎 */
	public play (data: Object, onDone: Function) : void {
		// cc.log("==Draw=================")
		// cc.log(data)

		if (data == null) {
			onDone();
			return;
		}

		this.isDrawing = true;
		
		if (onDone != null) {
			this.onDrawDone.addOnce(()=>{
				onDone();
			});
		}

		this.drawMethod.play(data);
		
	}

	/** 停止 */
	public stop () : void {
		
		this.isDrawing = false;

		this.drawMethod.stop();

	}

	/** 完成開獎 */
	public drawDone () : void {
		this.isDrawing = false;
		this.onDrawDone.call();
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}