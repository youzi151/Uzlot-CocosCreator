import { Invoker, AniTween } from "../../../Uzil";

cc.Class({
	extends: cc.Component,
	editor: {
		executeInEditMode: true,
		playOnFocus: true,
	},
	
	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

    properties: {

		/* 是否在喚醒時播放 */
		'isPlayOnAwake': {
			default: false,
		},
		
		/* 動畫物件 */
		'tween': {
			default: null,
			type: Object,
			visible: false,
		},


		/* 是否預覽中 */
		'isPreview': {
			get () {
				return this._isPreview;
			},
			set (val) {
				this._isPreview = val;
				if (val == true) {
					this._preview();
				} else {
					this._unpreview();
				}
			}
		},
		'_isPreview': {
			default: false,
			visible: false,
		},
		'beforePreview':{
			visible: false,
			default: {},
		},
		
		/* 是否播放中 */
		'isPlaying': {
			default: false,
			visible: false,
		},

		/* 時間比例 */
		'timeScale': {
			default: 1
		},
	
    },

	
	/*== Cocos LifeCycle ==========================================*/

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

	start () {
		if (CC_EDITOR) return;

		// 呼叫子類別
		this._start();

		// 是否於起始時自動播放
		if (this.isPlayOnAwake){
			this.play();
		}
		
	},
	
	update (dt) {
		if (CC_EDITOR && !this.isPreview) return;

		// 調整過後的deltaTime
		let dt_scaled = dt * this.timeScale;


		// 若 此Component的內核tween存在 則 刷新
		if (this.tween) {
			this.tween.update(dt_scaled);
		}

		// 子類別刷新
		this._update(dt_scaled);
	},

	/*== Public Function ==========================================*/

	empty () {},

	/*== 基本功能 =================*/
	
	/* 執行 */
	play () {
		this.isPlaying = true;
		this._play();
	},

	/* 停止 */
	stop () {

		this.isPlaying = false;
		
		if (this.isPreview){
			this.isPreview = false;
		}
		
		this._stop();
	},

	/* 暫停 */
	pause () {
		this.isPlaying = false;
		this._pause();
	},

	/* 恢復 */
	resume () {
		this.isPlaying = true;
		this._resume();
	},


	// 預設繼承 ==============
	
	/* 停止 */
	_stop () {
		if (!this.tween) return;
		this.tween.stop();
	},

	/* 暫停 */
	_pause () {
		if (!this.tween) return;
		this.tween.pause();
	},

	/* 恢復 */
	_resume () {
		if (!this.tween) return;
		this.tween.resume();
	},

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

	_getRoot (_node: cc.Node) : cc.Node {
		if (!_node) return null;

		let node = _node;
		let scene = cc.director.getScene();

		let tryTime = 100;
		while (node.parent != scene){

			node = node.parent;

			if (tryTime-- < 0) return node;
		}
		return node;
	},


});
