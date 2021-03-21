import {
	ShurikenSystem,
	ShurikenEmitter,
	ShurikenEmitter_Base,
	ShurikenEmitter_Circle,
	ShurikenEmitter_NodeRect,
} from "../index_Shuriken";


export enum EMITTER_TYPE {
	POINT, CIRCLE, NODE_RECT, SPRITE
}

const _class = {
	extends: cc.Component,

	properties: {
		"_shurikenSystem": {
			type: Object,
			default: null,
			visible: false,
		},
		"shurikenSystem": {
			type: Object,
			get () {
				return this._shurikenSystem;
			},
			set (val) {
				this._shurikenSystem = val;
			},
			visible: false,
		},

		/** 時間速率 */
		"timeScale": {
			default: 1
		},

		/** 來源樣本 */
		"_sourceNode": {
			type: cc.Prefab,
			default: null,
			visible: false,
		},
		"sourcePrefab": {
			type: cc.Prefab,
			get () {
				return this._sourceNode;	
			},
			set (val) {
				this._sourceNode = val;
				if (this.shurikenSystem) {
					this.shurikenSystem.sourceNode = val;
				}
			}
		},
		

		/** 最大數量 */
		"_maxCount": {
			default: 100,
			visible: false,
		},
		"maxCount": {
			get () {
				return this._maxCount;	
			},
			set (val) {
				this._maxCount = val;
				if (this.shurikenSystem) {
					this.shurikenSystem.maxCount = val;
				}
			}
		},

		/** 是否在初始播放 */
		"isPlayOnAwake": {
			default: true
		},

		/** 是否預先準備 */
		"_isPrepare": {
			default: false,
			visible: false,
		},
		"isPrepare": {
			get () {
				return this._isPrepare;	
			},
			set (val) {
				this._isPrepare = val;
				if (this.shurikenSystem) {
					this.shurikenSystem.isPrepare = val;
				}
			}
		},

		/** 粒子是否位於本地位置 */
		"_emitRoot": {
			type: cc.Node,
			default: null,
			visible: false,
		},
		"emitRoot": {
			type: cc.Node,
			get () {
				return this._emitRoot;
			},
			set (val) {
				this._emitRoot = val;
				if (this.shurikenSystem) {
					this.shurikenSystem.emitRoot = val;
				}
			}
		},
		

		/*== 發射設置 ==============*/

		/** 是否顯示發射區塊 */
		"isShowEmit": {
			displayName:"檢視 發射",
			default: false,
		},
		
		/** 生命週期 */
		"_lifeTime": {
			default: 5,
			visible: false,
		},
		"lifeTime": {
			get () {
				return this._lifeTime;	
			},
			set (val) {
				this._lifeTime = val;
				if (this.shurikenSystem) {
					this.shurikenSystem.lifeTime = val;
				}
			},
			visible: function(){return this.isShowEmit},
		},

		/** 發射間隔 */
		"_delay": {
			default: 0.1,
			visible: false,
		},
		"delay": {
			get () {
				return this._delay;	
			},
			set (val) {
				this._delay = val;
				if (this.shurikenSystem) {
					this.shurikenSystem.delay = val;
				}
			},
			visible: function(){return this.isShowEmit},
		},
		

		/** 每次發射數量 */
		"_countPerEmit": {
			default: 1,
			visible: false,
		},
		"countPerEmit": {
			get () {
				return this._countPerEmit;	
			},
			set (val) {
				this._countPerEmit = val;
				if (this.shurikenSystem) {
					this.shurikenSystem.countPerEmit = val;
				}
			},
			visible: function(){return this.isShowEmit},
		},

		/*== 發射形狀 ==============*/
		"isShowEmitShape": {
			displayName:"檢視 發射區域",
			default: false,
		},
		
		"_emitterType": {
			type: cc.Enum(EMITTER_TYPE),
			default: EMITTER_TYPE.POINT,
		},
		"emitterType": {
			type: cc.Enum(EMITTER_TYPE),
			get: function () {
				return this._emitterType;
			},
			set: function (val) {
				this._emitterType = val;
			},
			visible: function(){return this.isShowEmitShape},
		},

		"_emitters": {
			type: Object,
			default: {},
			visible: false,
		},

		/*== 圓環 ===========*/
		/** 直徑範圍 */
		"circle_radius": {
			default: new cc.Vec2(0, 0),
			visible: function () {
				if (!this.isShowEmitShape) return false;
				return this.emitterType == EMITTER_TYPE.CIRCLE;
			},
		},
		"circle_angle":{
			default: new cc.Vec2(0, 0),
			visible: function () {
				if (!this.isShowEmitShape) return false;
				return this.emitterType == EMITTER_TYPE.CIRCLE;
			},
		},


		/*== 圖形 ===========*/
		"sprite_imageData":{
			type: Object,
			default: null,
			visible: false,
		},

		"sprite_clipSample":{
			default: 100,
			visible: function () {
				if (!this.isShowEmitShape) return false;
				return this.emitterType == EMITTER_TYPE.SPRITE;
			},
		},

		"sprite_clipAlpha":{
			set (val) {
				this._sprite_clipAlpha = val;
				this._sprite_clipAlpha32 = val * 255;
			},
			get () {
				return this._sprite_clipAlpha;
			},
			visible: function () {
				if (!this.isShowEmitShape) return false;
				return this.emitterType == EMITTER_TYPE.SPRITE;
			},
		},
		"_sprite_clipAlpha":{
			default: 0,
			visible: false,
		},
		"_sprite_clipAlpha32":{
			default: 0,
			visible: false,
		},

		/*== 效果設置 ==============*/

		/*== 位移 =============*/
		
		"isShowMove": {
			displayName:"檢視 位移",
			default: false,
		},

		/** 初始速度 */
		"emitSpeed": {
			default: new cc.Vec2(10, 20),
			visible: function(){return this.isShowMove},
		},
		
		/** 發射角度範圍 (順時針)*/
		"emitAngle": {
			default: new cc.Vec2(360, 45),
			visible: function(){return this.isShowMove},
		},

		/** 重力 */
		"gravity": {
			default: new cc.Vec2(0, -10),
			visible: function(){return this.isShowMove},
		},

		/** z軸速度 */
		"emitSpeed_z": {
			default: 0,
			visible: function(){return this.isShowMove},
		},

		/*== 旋轉 =============*/
		"isShowRotate": {
			displayName:"檢視 旋轉",
			default: false,
		},

		/** 初始旋轉 */
		"rotate_emit":{
			default: cc.Vec2.ZERO,
			visible: function(){return this.isShowRotate},
		},

		/** 旋轉 */
		"rotate_speed":{
			default: cc.Vec2.ZERO,
			visible: function(){return this.isShowRotate},
		},

		/*== 尺寸 =============*/
		"isShowScale": {
			displayName:"檢視 縮放",
			default: false,
		},

		/** 初始大小 */
		"scale_emit": {
			default: cc.Vec2.ONE,
			visible: function(){return this.isShowScale},
		},
		
		/** 縮放速度 */
		"scale_speed": {
			default: cc.Vec2.ZERO,
			visible: function(){return this.isShowScale},
		},


		/*== 動畫 =============*/
		"isShowAnim": {
			displayName:"檢視 動畫",
			default: false,
		},
		/** 初始動畫時間 */
		"animTime_range": {
			default: cc.Vec2.ZERO,
			visible: function(){return this.isShowAnim},
		},
	},

	/*== Public Function ==========================================*/

	/*== 基本功能 =================*/

	onLoad () {
		this._initShurikenSystem();
		this._initEmitter();

		if (this.isPlayOnAwake) {
			this.startEmit();
		}
	},

	update (dt) {
		if (!this.shurikenSystem) return;
		this.shurikenSystem.update(dt);
	},

	
	/*== 發射控制 ==========================*/

	/** 開始發射 */
	startEmit () : void {
		if (!this.shurikenSystem) return;
		this.shurikenSystem.start();
	},

	/** 恢復發射 */
	resumeEmit () : void {
		if (!this.shurikenSystem) return;
		this.shurikenSystem.resume();
	},

	/** 暫停發射 */
	pauseEmit () : void {
		if (!this.shurikenSystem) return;
		this.shurikenSystem.pause();
	},

	/** 終止發射 */
	stopEmit () : void {
		if (!this.shurikenSystem) return;
		this.shurikenSystem.pause();
	},
	
	
	/*== 粒子管理 ===========================*/

	/** 清空 */
	clear () : void {
		if (!this.shurikenSystem) return;
		this.shurikenSystem.clear();
	},

	
	/*== 其他功能 =================*/
	
	/*== Private Function =========================================*/

	/** 初始化系統 */
	_initShurikenSystem () : void {
		let shurikenSys = new ShurikenSystem();
		this.shurikenSystem = shurikenSys;

		shurikenSys.timeScale = this.timeScale;
		shurikenSys.shurikenSource = this.sourcePrefab;
		shurikenSys.maxCount = this.maxCount;
		shurikenSys.container = this.emitRoot;
		shurikenSys.lifeTime_sec = this.lifeTime;
		shurikenSys.delay_sec = this.delay;
		shurikenSys.countPerEmit = this.countPerEmit;
		shurikenSys.emitter = this._getEmitter();
		
		if (this.isPrepare) {
			shurikenSys.prepare(shurikenSys.maxCount);
		}

	},

	_initEmitter () : void {

		// 基礎設置 ==========================
		
		let emitter : ShurikenEmitter = this._getEmitter();

		if (emitter instanceof ShurikenEmitter_Base) {
			emitter.emitX.set(0);
			emitter.emitY.set(0);

			emitter.emitSpeed.set([this.emitSpeed.x, this.emitSpeed.y]);

			emitter.emitSpeed_z = this.emitSpeed_z;

			emitter.emitAngle.set([this.emitAngle.x, this.emitAngle.y]);

			emitter.gravity = (this.gravity as cc.Vec3);

			emitter.emitRotation.set([this.rotate_emit.x, this.rotate_emit.y]);
			emitter.emitRotateSpeed.set([this.rotate_speed.x, this.rotate_speed.y]);
			emitter.emitScale.set([this.scale_emit.x, this.scale_emit.y]);
			emitter.emitScaleSpeed.set([this.scale_speed.x, this.scale_speed.y]);

			emitter.emitAnimTime.set([this.animTime_range.x, this.animTime_range.y]);

		} 
		
		// 衍生類型 ==========================

		if (this.emitterType == EMITTER_TYPE.NODE_RECT) {
			// let emitter : ShurikenEmitter_NodeRect = this._getEmitter();
		} 
		
		else if (this.emitterType == EMITTER_TYPE.CIRCLE) {
			let emitterCircle : ShurikenEmitter_Circle = (emitter as ShurikenEmitter_Circle);
			emitterCircle.raidus.set([this.circle_radius.x, this.circle_radius.y]);
			emitterCircle.angle.set([this.circle_angle.x, this.circle_angle.y]);
		} 
	},

	/**
	 * 取得發射器
	 * @param emitterType 發射類型
	 */
	_getEmitter (emitterType: EMITTER_TYPE = null) : ShurikenEmitter {

		// 若 無指定 則 採用先前設置
		if (emitterType == null){
			emitterType = this.emitterType;
		}

		// 取得 發射器
		let key = emitterType.toString();
		let exist = this._emitters[key];
		if (exist) {
			return exist;
		}

		if (emitterType == EMITTER_TYPE.POINT){
			exist = new ShurikenEmitter_Base();
		} 
		
		else if (emitterType == EMITTER_TYPE.NODE_RECT){
			exist = new ShurikenEmitter_NodeRect();
		} 
		
		else if (emitterType == EMITTER_TYPE.CIRCLE){
			exist = new ShurikenEmitter_Circle();
		} 
		
		// else if (emitterType == EMITTER_TYPE.SPRITE){
		// 	exist = new ShurikenEmitter_Circle();
		// } 
		
		else{
			return null;
		}

		this._emitters[key] = exist;
		
		return exist;
	},

};
cc.Class(_class);