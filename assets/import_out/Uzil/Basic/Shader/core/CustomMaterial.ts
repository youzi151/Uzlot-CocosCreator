const renderer: any = cc.renderer;
const renderEngine = renderer.renderEngine;
const gfx = renderEngine.gfx;
const Material = renderEngine.Material;

export default class CustomMaterial extends Material{

	/*== Constructor ==============================================*/
	
	constructor(shader: any) {
		super(false);
		// 初始化
		this._init(shader);
	}
	
	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/* 渲染器名稱 */
	public shaderName: string;
	private shader: any = null;

	/*== Event ====================================================*/

	/*== Public Function ==========================================*/

	
	/*== 基本功能 =================*/
	
	/** 初始化 */
	private _init (shader: any) : CustomMaterial {

		this.shader = shader;

		let shaderName = shader.name;
		let params = shader.params;
		let defines = shader.defines;
		let vert = shader.vert;
		let frag = shader.frag;
		
		let engineRenderer = renderEngine.renderer;
		let lib = renderer._forward._programLib;

		// 如果 該模板 不存在，自行定義
		!lib._templates[shaderName] && lib.define(shaderName, vert, frag, defines || []);

		 // 通道
		 let pass = new engineRenderer.Pass(shaderName);
		 // 關閉深度通道
		 pass.setDepth(false, false);
		 // 設置???
		 pass.setCullMode(gfx.CULL_NONE);
		 // 設置混和模式
		 pass.setBlend(
			 gfx.BLEND_FUNC_ADD,
			 gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA,
			 gfx.BLEND_FUNC_ADD,
			 gfx.BLEND_SRC_ALPHA, gfx.BLEND_ONE_MINUS_SRC_ALPHA
		 );

		// 預設 參數
		let techParams: Array<Object> = [
			{ name: 'texture', type: engineRenderer.PARAM_TEXTURE_2D },
			{ name: 'color', type: engineRenderer.PARAM_COLOR4 },
			{ name: 'time', type: engineRenderer.PARAM_FLOAT}
		];
		// 若自訂參數存在 則 合併
		if (params) {
			techParams = techParams.concat(params);
		}
		

		let mainTech = new engineRenderer.Technique(
			['transparent'],
			techParams,
			[pass]
		);

		// 設置名稱
		this.shaderName = shaderName;
		
		// 設置 預設參數
		this._texture = null;
		this._color = { r: 1.0, g: 1.0, b: 1.0, a: 1.0 };

		// 設置效果
		this._effect = this.effect = new engineRenderer.Effect(
			[ mainTech ],
			techParams,
			defines,
		);

		// 設置
		this._mainTech = mainTech;

		return this;
	}

	
	/** 複製 */
	public clone () : CustomMaterial {
		let copy = new CustomMaterial(this.shader);
		copy.updateHash();
		return copy;
	}

	/** 設置/取得參數 */
	public setParam (name: string, val: any) : void {
		this._effect.setProperty(name, val);
	}
	public getParam (name: string) : any {
		return this._effect.getProperty(name);
	}
	
	/** 設置主要貼圖 */
	public setMainTexture (tex) : void {
		if (tex == null) return;
		
		this._texture = tex;
		
		this._effect.setProperty('texture', tex.getImpl());
		this._texIds['texture'] = tex.getId();
	}

	/** 設置貼圖 */
	public setTexture (name: string, tex) : void {
		if (tex == null) return;
		this._effect.setProperty(name, tex.getImpl());
		this._texIds[name] = tex.getId();
	}

	/** 顏色 */
	public setColor (color: cc.Color) {
		this._color = new cc.Color();

		this._color.r = color.getR() / 255.0;
		this._color.g = color.getG() / 255.0;
		this._color.b = color.getB() / 255.0;
		this._color.a = color.getA() / 255.0;

		this._effect.setProperty('color', this._color);
	}

	/** 設置定義 */
	public setDefine (name: string, val: any) : void {
		this._effect.define(name, val);
	}

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

}
