import { i18n } from "./i18n";


const {ccclass, property} = cc._decorator;

@ccclass
export class i18nLabelExt extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 文字 */
	@property(cc.Label)
	public label: cc.Label = null;

	/** 關鍵字 */
	@property()
	public key: string = "";

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		let self = this;

		if (this.label == null) {
			this.label = this.node.getComponent(cc.Label);
		}

		this.render();

		i18n.onChange.add(()=>{
			self.render();
		});
	}

	onEnable () {
		this.render();
	}

	start () {
		
	}

	update (dt) {
		
		
	}

	
	/*== Public Function ==========================================*/

	/** 設置 */
	public set (key: string) : void {
		this.key = key;
		this.render();
	}

	/** 設置 */
	public render () : void {
		let self = this;

		let resImmediately = i18n.text(this.key, (res)=>{
			self._setLabelStr(res);
		});

		this._setLabelStr(resImmediately);

	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	private _setLabelStr (str: string) : void {
		if (str != null) {
			this.label.string = str;
		}
	}


}

