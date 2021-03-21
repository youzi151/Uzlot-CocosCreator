import { Animator, i18nSpriteExt, Mathf, Values } from "../../../Uzil/Uzil";
import { Prefab2NodeMgr } from "../../Slot/script/Util/Prefab2NodeMgr";
import { SymbolRes } from "../../Slot/index_Slot";
import { SymbolCode } from "../../Rule/index_Rule";
import Material_Blurs from "../../../uzil/Shader/material/Material_Blurs";

const {ccclass, property} = cc._decorator;

@ccclass
export class ReelColObj extends cc.Component {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 辨識 */
	public id : string = "";

	/** 圖標 */
	public symbol : SymbolCode = SymbolCode.NONE;
	/** 圖標後綴 */
	public symbolFix : string = "";

	/** 是否啟用 */
	private _isActive : Values = new Values(true);

	/** 是否啟用圖片 */
	private _isSpriteActive : Values = new Values(true);


	/** 圖標圖片 */
	@property(cc.Sprite)
	public sprite : cc.Sprite = null;

	/** 圖標圖片 */
	@property(i18nSpriteExt)
	public spriteExt : i18nSpriteExt = null;

	@property(Animator)
	public animator : Animator = null;

	/** 特效容器 */
	public fxRoot : cc.Node = this.node;
	/** 特效物件 */
	public fxs : cc.Node[] = [];

	
	/*== 模糊相關 =================*/

	/** 模糊 */
	public targetBlurs : cc.Vec2 = new cc.Vec2();

	/** 上次位置 */
	private _lastPosition : cc.Vec3 = new cc.Vec3();

	@property()
	public blurFadeSpeed : number = 10;
	@property(cc.Vec2)
	public blurMax : cc.Vec2 = new cc.Vec2(15, 15);
	@property(cc.Vec2)
	public lengthPerUnit : cc.Vec2 = new cc.Vec2(10, 10);

	/** 模糊材質 */
	@property(Material_Blurs)
	public blursMaterial : Material_Blurs = null;




	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/
	
	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		
	}

	start () {

	}

	update (dt) {

		// 確保 特效 在 動畫節點之上
		let animNodeSiblingIdx = 0;
		if (this.animator != null) {
			animNodeSiblingIdx = this.animator.node.getSiblingIndex();
		}
		for (let each of this.fxs) {
			each.setSiblingIndex(animNodeSiblingIdx);
		}
		

		let _posDelta = this.node.position.sub(this._lastPosition);
		this._lastPosition = this.node.position;

		let posDelta : cc.Vec2 = new cc.Vec2(
			_posDelta.x * (1/this.lengthPerUnit.x), 
			_posDelta.y * (1/this.lengthPerUnit.y)
		);
		
		this.targetBlurs = Mathf.moveTowardV2(this.targetBlurs, posDelta, this.blurFadeSpeed * dt);

		this.targetBlurs.x = Mathf.clamp(this.targetBlurs.x, -this.blurMax.x, this.blurMax.x);
		this.targetBlurs.y = Mathf.clamp(this.targetBlurs.y, -this.blurMax.y, this.blurMax.y);
	
		this.blursMaterial.force = Mathf.moveTowardV2(this.blursMaterial.force, this.targetBlurs, this.blurFadeSpeed * dt);
	}
	
	/*== Public Function ==========================================*/
	
	/*== 基本功能 =================*/

	/**
	 * 設定位置
	 * @param posY 位置
	 */
	public setPosition (pos: cc.Vec2) : void {
		this.node.setPosition(pos);
		for (let each of this.fxs) {
			each.setPosition(pos);
		}
	}

	/**
	 * 取得位置
	 */
	public getPosition () : cc.Vec2 {	
		return new cc.Vec2(this.node.position.x, this.node.position.y);
	}

	/** 取得世界位置 */
	public getWorldPosition () : cc.Vec2 {
		let worldPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
		return new cc.Vec2(worldPos.x, worldPos.y);
	}

	/**
	 * 設置縮放
	 * @param scale 
	 */
	public setScale (scale: cc.Vec2) : void {
		this.node.setScale(scale);
	}

	/**
	 * 設置傾斜
	 * @param skew 
	 */
	public setSkew (skew: cc.Vec2) : void {
		this.node.skewX = skew.x;
		this.node.skewY = skew.y;
	}
	
	/**
	 * 設置尺寸
	 * @param sizeLevel 尺寸(int)
	 */
	public setSize (sizeLevel: number) : void {
		this.symbolFix = "."+sizeLevel;
		
		this._updateSymbol();
	}

	/**
	 * 設置 模糊
	 * @param force 力
	 */
	public setBlur (force : cc.Vec2, isImmediatly: boolean = false) : void {

		this.targetBlurs = force;

		if (isImmediatly) {
			this.blursMaterial.force = force;
			this._lastPosition = this.node.position;
		}
	}

	/**
	 * 設置啟用
	 * @param isActive 是否啟用
	 */
	public setActive (isActive: boolean | null, user: string = null, priority: number = 0) : void {
		// 若 指定 使用者
		if (user != null) {
			// 若 指定啟用 為 空 則 移除 該使用者的註冊
			if (isActive == null) {
				this._isActive.remove(user);
			}
			// 若 存在 則 註冊
			else {
				this._isActive.set(user, priority, isActive);
			}
		} 
		// 若 無指定 使用者 則 改變 預設值
		else {
			this._isActive.defaultValue = isActive;
		}
		// 依照 是否啟用 改變 節點啟用狀態
		this.node.active = this._isActive.getCurrent();

		if (this.node.active == false) {
			// 關閉動畫
			this.goAnim(null);
		}

		for (let each of this.fxs) {
			each.active = this.node.active;
		}
	}

	/**
	 * 設置圖像啟用
	 * @param isActive 是否啟用
	 */
	 public setSpriteActive (isActive: boolean | null, user: string = null, priority: number = 0) : void {
		// 若 指定 使用者
		if (user != null) {
			// 若 指定啟用 為 空 則 移除 該使用者的註冊
			if (isActive == null) {
				this._isSpriteActive.remove(user);
			}
			// 若 存在 則 註冊
			else {
				this._isSpriteActive.set(user, priority, isActive);
			}
		}
		// 若 無指定 使用者 則 改變 預設值
		else {
			this._isSpriteActive.defaultValue = isActive;
		}
		// 依照 是否啟用 改變 節點啟用狀態
		this.sprite.node.active = this._isSpriteActive.getCurrent();
	}

	/**
	 * 設置圖標
	 * @param symbol 圖標代號
	 */
	public setSymbol (symbol: SymbolCode) : void {

		// 若 指定圖標 為 空 則 設為 無圖標
		if (symbol == null) symbol = SymbolCode.NONE;

		// 設置圖標
		this.symbol = symbol;

		this._updateSymbol();

	}

	/** 前往 動畫狀態 */
	public goAnim (stateName: string) : void {
		if (this.animator == null) return;
		let self = this;
		// cc.log("goAnim:"+stateName)

		// 若 無指定狀態 則 
		if (stateName == null) {
			// 停止動畫
			this.animator.stop();

			// 開啟 圖片節點 / 關閉 動畫節點
			this.sprite.node.active = true;
			this.animator.node.active = false;
			this.animator.node.setParent(this.node);
			this.animator.node.setPosition(cc.Vec2.ZERO);

			// 解除 "goAnim" 控制 圖片啟用
			this.setSpriteActive(null, "goAnim");
		} else {
			// 關閉 圖片節點 / 開啟 動畫節點
			this.sprite.node.active = false;
			this.animator.node.active = true;

			if (this.fxRoot != this.node) {
				this.animator.node.setParent(this.fxRoot);
				this.animator.node.setPosition(this.node.position);
			}

			// 播放動畫狀態
			this.animator.play(stateName);
			
			// 設置並註冊 "goAnim" 控制 圖片啟用 為 關閉
			this.setSpriteActive(false, "goAnim", 100);
		}
	}

	/*== 其他功能 =================*/

	public addFX (fxNode: cc.Node) : void {
		fxNode.setParent(this.fxRoot);
		fxNode.setPosition(this.node.getPosition());
		this.fxs.push(fxNode);
	}

	public removeFx (fxNode: cc.Node) : void {
		let idx = this.fxs.indexOf(fxNode);
		this.fxs.splice(idx, 1);
	}

	/*== Private Function =========================================*/

	/** 請求 動畫節點 */
	private _requestAnimNode (symbol: SymbolCode, fix: string) : cc.Node {
		// 若 無指定圖標 則 返回空
		if (symbol == null) return null;
		// 向 預製物件管理 請求 該圖標 的 動畫Prefab
		let node = Prefab2NodeMgr.request("uzlot.symbolAnim."+SymbolCode[symbol].toLowerCase()+fix);
		
		// cc.log("uzlot.symbolAnim."+SymbolCode[symbol].toLowerCase()+fix+" : "+(node!=null));
		return node;
	}

	private _updateSymbol () : void {
		
		// 取得 該圖標的spriteID 並 設置
		let spID = SymbolRes.Get(this.symbol) + this.symbolFix;
		this.spriteExt.set(spID);

		// 動畫是否啟用
		let isAnimActive : boolean = false;

		// 若 動畫組件 存在
		if (this.animator != null) {

			// 前一個動畫組件
			let lastAnim = this.animator;
			// 設 當前動畫組件 為 空
			this.animator = null;

			// 取得 原本 動畫啟用狀態
			isAnimActive = lastAnim.node.active;

			// 取消 父物件
			lastAnim.node.setParent(cc.director.getScene());
			
			// 回收節點
			this._recoveryAnimNode(lastAnim);
		}

		// 請求 動畫節點
		let animNode = this._requestAnimNode(this.symbol, this.symbolFix);
		if (animNode != null) {

			// 將動畫節點 設於 自身底下
			animNode.setParent(this.node);
			animNode.setPosition(cc.Vec2.ZERO);
			animNode.active = isAnimActive;
	
			this.animator = animNode.getComponent("Animator");
		}

		// 若 動畫不在啟用狀態 則 開啟自身圖片節點
		if (!isAnimActive) {
			this.sprite.node.active = true;
		}
		
	}

	/** 回收 動畫節點 */
	private _recoveryAnimNode (anim: Animator) : void {
		anim.stop();
		anim.node.active = false;
		Prefab2NodeMgr.recovery(anim.node);
	}

}
