import { i18n, i18nState } from "./i18n";


const {ccclass, property} = cc._decorator;

@ccclass
export default class i18nButtonExt extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 圖片 */
	@property(cc.Button)
	public button : cc.Button = null;

	/** 關鍵字 */
	@property()
	public key_normal : string = "";
	/** 關鍵字 */
	@property()
	public key_pressed : string = "";
	/** 關鍵字 */
	@property()
	public key_hover : string = "";
	/** 關鍵字 */
	@property()
	public key_disabled : string = "";

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		let self = this;

		if (this.button == null) {
			this.button = this.node.getComponent(cc.Button);
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

	/** 設置 平常 */
	public setNormal (key: string) : void {
		this.key_normal = key;
		this.renderNormal();
	}
	/** 設置 按壓 */
	public setPressed (key: string) : void {
		this.key_pressed = key;
		this.renderPressed();
	}
	/** 設置 滑過 */
	public setHover (key: string) : void {
		this.key_hover = key;
		this.renderHover();
	}
	/** 設置 關閉 */
	public setDisabled (key: string) : void {
		this.key_disabled = key;
		this.renderDisabled();
	}


	/** 渲染 */
	public render () : void {
		this.renderNormal();
		this.renderPressed();
		this.renderHover();
		this.renderDisabled();
	}

	public renderNormal () : void {
		if (!this.key_normal || this.key_normal == "") return;
		let self = this;
		this._renderEach(this.key_normal, (res)=>{
			self.button.normalSprite = res;
			let sprite = self.button.target.getComponent(cc.Sprite);
			if (sprite != null) {
				sprite.spriteFrame = res;
			}
		});
	}

	public renderPressed () : void {
		if (!this.key_pressed || this.key_pressed == "") return;
		let self = this;
		this._renderEach(this.key_pressed, (res)=>{
			self.button.pressedSprite = res;
		});
	}

	public renderHover () : void {
		if (!this.key_hover || this.key_hover == "") return;
		let self = this;
		this._renderEach(this.key_hover, (res)=>{
			self.button.hoverSprite = res;
		});
	}

	public renderDisabled () : void {
		if (!this.key_disabled || this.key_disabled == "") return;
		let self = this;
		this._renderEach(this.key_disabled, (res)=>{
			self.button.disabledSprite = res;
		});
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	private _renderEach (key: string, cb: (res:cc.SpriteFrame)=>void) : void {
		let resImmediately = i18n.img(key, (res)=>{
			if (res != null) {
				cb(res);
			}
		});

		if (resImmediately != null) {
			cb(resImmediately);
		}
	}


}

