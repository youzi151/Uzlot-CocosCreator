import ShaderManager, { ShaderType } from "./ShaderManager";
import CustomMaterial from "./CustomMaterial";

const { ccclass, property, requireComponent, executeInEditMode } = cc._decorator;

@ccclass
@requireComponent(cc.Sprite)
export default class MaterialComponent extends cc.Component {
	
	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** Sprite */
	@property(cc.Sprite)
	public sprite: cc.Sprite = null;
	
	/** 渲染器名稱 */
	@property(cc.String)
	public shaderName: string = "";
	protected shader: any = null;

	/** 是否每幀更新 */
	@property(cc.Boolean)
	public isUpdate: boolean = false;
	
	/** 材質 */
	private _material: CustomMaterial;
	get material() { return this._material; }

	/** 其他參數 */
	/** 時間紀錄 */
	public time: number = 0;

	/** 起始時間 */
	// -1: 不使用
	@property
	public startTime: number = -1;

	/** 隨機時間 */
	// 0, 0 為不使用
	@property(cc.Vec2)
	public randomTimeRange: cc.Vec2 = new cc.Vec2(0, 0);
	
	// 比對顏色
	protected _color = cc.color();
	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	protected start() {
		// 初始化
		if (this.sprite == null){
			this.sprite = this.getComponent(cc.Sprite);
		}
		
		// 應用渲染
		this.sprite.setState(0);
		this.applyShader();

		let min = this.randomTimeRange.x;
		let max = this.randomTimeRange.y;
		
		// 防呆 交換
		if (min > max){
			let temp = min;
			min = max;
			max = temp;
		}
		
		// 若 時間隨機範圍 存在
		if (min != max){
			if (this.startTime >= min && this.startTime <= max) {
				this.time = this.startTime;
			}
			else {
				this.time = cc.misc.lerp(min, max, Math.random());
			}
		} else {
			if (this.startTime > 0){
				this.time = this.startTime;
			}
		}


		// 準備起始資料
		let data: Object = {};
		data = this.getStartData(data);

		// 更新
		if (this.shader && this.shader.start) {
			this.shader.start(data);
		}
	}
	
	protected onEnable() {
		// 應用渲染
		this.sprite.setState(0);
		this.applyShader();
	}

	protected lateUpdate() {
		if (this.isUpdate) { 
			this.updateMainTexture();
		}

	}

	protected update(dt) {
		// 若 材質不存在 則 返回
		if (!this._material) return;

		// 若 非更新 則 返回
		if (!this.isUpdate) return;

		// 若 圖像 為 空 則 自動取得
		if (this.sprite == null){
			this.sprite = this.getComponent(cc.Sprite);
		}
		
		// 若 圖像 為 空 或 圖像的圖源 為 空 則 返回
		if (this.sprite == null || this.sprite.spriteFrame == null) {
			return;
		}

		// 自動設置顏色
		this._setShaderColor(false);

		// 自動設置時間
		this.updateTime(dt);

		// 自動設置透明度
		this.updateOpacity();
	
		// 準備每幀更新資料
		let data: Object = {
			deltaTime: dt
		};
		data = this.getUpdateData(data);

		// 更新
		if (this.shader && this.shader.update) {
			this.shader.update(data);
		}
	}

	
	/*== Public Function ==========================================*/

	/** 應用渲染 */
	public applyShader() {
		let shaderName = this.shaderName;
		let shader = this.shader = ShaderManager.getShader(shaderName);
		let shaderType = ShaderType[shaderName];
		
		let sprite : any = this.sprite;

		//==應用材質===============

		let material;

		// 檢查遊戲 渲染方式
		if (cc.game.renderType === cc.game.RENDER_TYPE_CANVAS) {
			cc.warn('Shader not surpport for canvas');
			return;
		}
		// 防呆
		if (!sprite || !sprite.spriteFrame) {
			// cc.warn('Sprite / spriteFrame is null');
			return;
		}

		//如果 渲染器 在 0~1(灰階) 以上
		if (shaderType > ShaderType.Gray) {
			
			// 若不存在則警告
			if (!shader) {
				cc.warn('Shader not defined', name);
				return;
			}
			// 關閉 動態圖集管理
			cc.dynamicAtlasManager.enabled = false;
			// 以該shader建立並設置材質 (該材質繼承自cc.renderer.renderEngine.Material)
			if (this._material && this.shaderName == this._material.shaderName) {
				material = this._material;
			}else {
				material = new CustomMaterial(shader);
			}
			// 取得 Sprite貼圖
			let texture = sprite.spriteFrame.getTexture();
			// 對 材質 設置貼圖
			material.setMainTexture(texture);

			// 材質 更新雜湊??
			material.updateHash();

			// 定義sprite
			let sp = sprite as any;
			sp._material = material;
			sp._renderData._material = material;
			sp._state = shaderType;

		}

		// 若 渲染器 為 預設/灰階
		else {
			// 直接設置shaderType
			sprite.setState(shaderType);
		}

		this._material = material;
		

		if (!material) return;
		
		//==初始化參數==============

		// 顏色
		let clr = this._color;
		clr.setR(255), clr.setG(255), clr.setB(255), clr.setA(255);

		// 內建參數
		this._setShaderColor(true);
		
		// 更新
		sprite._updateMaterial(material);
		sprite.markForUpdateRenderData(true);
		sprite.markForRender(true);
	}

	/** 設置/取得屬性 */
	public setParam (name: string, value: any) : void {
		if (this.material == null) return;
		this.material.setParam(name, value);
	}
	public getParam (name: string) : any {
		if (this.material == null) return;
		return this.material.getParam(name);
	}
	/** 設置貼圖 */
	public setTexture (name: string, texture) : void {
		if (this.material == null) return;
		this.material.setTexture(name, texture);
	}
	
	

	/*== Private Function =========================================*/

	/** 自動設置顏色 */
	protected _setShaderColor(isForce: boolean = false) {

		let node = this.node;
		let c0 = node.color;
		let c1 = this._color;
		
		let r = c0.getR();
		let g = c0.getG();
		let b = c0.getB();
		let a = node.opacity;

		let isUpdate = false;
		if (c1.getR() != r) { c1.setR(r); isUpdate = true; }
		if (c1.getG() != g) { c1.setG(g); isUpdate = true; }
		if (c1.getB() != b) { c1.setB(b); isUpdate = true; }
		if (c1.getA() != a) { c1.setA(a); isUpdate = true; }
		
		if (isForce || isUpdate) {
			this._material.setColor(c1);
		}
	}

	/** 自動設置時間 */
	protected updateTime (dt) {
		// 防溢出
		let time = this.time;
		if (time > 65535) time = 0;
		
		// 推進時間
		time += dt;
		
		// 設置參數
		this.setParam("time", time);
		
		//更新時間
		this.time = time;
	}

	protected updateOpacity () {
		let alpha = this.sprite.node.opacity;
		this.setParam("alpha", alpha / 255.0);
	}

	/** 更新主要貼圖 */
	protected updateMainTexture () {
		if (this.sprite == null || this.sprite.spriteFrame == null) {
			return;
		}

		// 取得 Sprite貼圖
		let texture = this.sprite.spriteFrame.getTexture();
		// 對 材質 設置貼圖
		this._material.setMainTexture(texture);
		// 材質 更新雜湊??
		this._material.updateHash();

		// 定義sprite (若無此段，在動畫或是更改SpriteFrame後，Shader效果會消失)
		let sp = this.sprite as any;
		sp._material = this._material;
		sp._renderData._material = this._material;
	}
	
	/** 準備起始資料 */
	protected getStartData(data: Object) : Object {
		data['material'] = this.material;
		data['component'] = this;
		return data;
	}

	/** 準備每幀資料 */
	protected getUpdateData(data: Object) : Object {
		data['material'] = this.material;
		data['component'] = this;
		return data;
	}


	
}
