import { PageCtrl } from "../index_PageCard";

const {ccclass, property} = cc._decorator;

@ccclass
export class Card extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** ID */
	@property()
	public id : string = "_anonymous";
	
	/** 存取域 */
	@property({type:cc.String})
	public scopes : Array<string> = [];


	/** 是否啟用 */
	public get isActive () {
		return this.node.active;
	}

	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {

		if (this.scopes.length == 0) {

			PageCtrl.getInstance().registerCard(this);

		} else {

			for (let eachScope of this.scopes){
				PageCtrl.getInstance(eachScope).registerCard(this);
			}

		}

	}

	start () {
		
	}

	update (dt) {
		
		
	}

	
	/*== Public Function ==========================================*/

	/**
	 * 啟用
	 * @param isForceReactive 若已經啟用，是否強制重新啟用
	 */
	public active (isForceReactive: boolean = false) : void {
		if (!isForceReactive && this.isActive) return;

		this.node.active = true;
		
		this._onActive();
	}

	/**
	 * 關閉
	 * @param isForceReDeactive 若已經關閉，是否強制重新關閉
	 */
	public deactive (isForceReDeactive: boolean = false) : void {
		if (!isForceReDeactive && !this.isActive) return;

		this.node.active = false;

		this._onDeactive();
	}
	
	/*== Protected Function =======================================*/

	/** 當啟用 */
	protected _onActive () : void {

	}

	/** 當關閉 */
	protected _onDeactive () : void {

	}

	/*== Private Function =========================================*/


}

