import { i18n, i18nState } from "./i18n";


const {ccclass, property} = cc._decorator;

@ccclass
export class i18nSpriteExt extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 圖片 */
	@property(cc.Sprite)
	public sprite: cc.Sprite = null;

	/** 關鍵字 */
	@property()
	public key: string = "";

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		let self = this;

		if (this.sprite == null) {
			this.sprite = this.node.getComponent(cc.Sprite);
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

		let resImmediately = i18n.img(this.key, (res)=>{
			self._setSpriteFrame(res);
		});

		this._setSpriteFrame(resImmediately);

	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	private _setSpriteFrame (spriteFrame: cc.SpriteFrame) : void {
		if (spriteFrame != null) {
			this.sprite.spriteFrame = spriteFrame;
		}
	}


}

