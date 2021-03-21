import { AniTween } from "../AniTween";


cc.Class({
	extends: require('../AniComponent'),
	editor: {
		executeInEditMode: true,
		playOnFocus: true,
	},
	
	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	properties: {
		
		/* 演出物件 */
		'actorNode': {
			default: null,
			type: cc.Node
		},

		/* 角度陣列 */
		'angles': {
			default: [],
			type: cc.Float,
		},

		/* 旋轉速度 */
		'speed': {
			default: 0,
		},

		/* 持續時間 */
		'duration': {
			default: -1
		},

		/* 淡入 (百分比) */
		'easeIn_percent': {
			default: 0,
		},
		'easeOut_percent': {
			default: 0,
		},

	},

	
	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {},

	_start () {
		
	},
	
	_update (dt) {
		
	},

	/*== Public Function ==========================================*/

	/*== 基本功能 =================*/
	
	/* 執行 */
	_play () {
		let data = {};
		
		
		data['timeScale'] = this.timeScale;


		data['actorNode'] = this.actorNode;

		data['angles'] = this.angles.slice();
		
		data['speed'] = this.speed;
		
		data['easeInOut'] = [this.easeIn_percent, this.easeOut_percent];
		
		data['duration'] = this.duration;

		this.tween = new AniTween().swing(data);
		this.tween.play();
	},

	/* 停止 */
	// _stop () {

	// },

	/* 暫停 */
	// _pause () {

	// },

	/* 恢復 */
	// _resume () {

	// },

	/* 切換預覽 */
	_preview () {

		this.beforePreview['rotation'] = this.actorNode.rotation;

		this.play();
	},
	_unpreview () {
		
		this.stop();

		this.actorNode.rotation = this.beforePreview['rotation'];
		
	},


	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

});
