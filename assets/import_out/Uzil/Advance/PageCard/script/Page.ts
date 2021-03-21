import { PageCtrl } from "../index_PageCard";

const {ccclass, property} = cc._decorator;

@ccclass
export class Page extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	
	/** ID */
	@property()
	public id : string = "_anonymous";

	/** 存取域 */
	@property({type:cc.String})
	public scopes : Array<string> = [];
	
	/** 卡片列表 */
	@property({type:cc.String})
	public cards : Array<string> = [];

	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		if (this.scopes.length == 0) {

			PageCtrl.getInstance().registerPage(this);

		} else {

			for (let eachScope of this.scopes){
				PageCtrl.getInstance(eachScope).registerPage(this);
			}

		}
	}

	start () {
		
	}

	update (dt) {
		
		
	}

	
	/*== Public Function ==========================================*/

	/** 初始化 */
	public init () : void {
		
	}
	
	/*== Protected Function =======================================*/

	/*== 繼承介面 =============== */

	/** 當啟用 */
	protected _onActive () : void {

	}

	/** 當關閉 */
	protected _onDeactive () : void {

	}

	/*== Private Function =========================================*/

	

}

