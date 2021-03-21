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
	
		/* 旋轉速度 */
		'speed': {
			default: 0,
		},

		/* 加速度 */
		'acceleration': {
			default: 0,
		},

		/* 持續時間 */
		'duration': {
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
		
		data['speed'] = this.speed;
		
		data['acceleration'] = this.acceleration;
		
		data['duration'] = this.duration;

		this.tween = new AniTween().spin(data);
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
		this.beforePreview['speed'] = this._speed;

		this.play();
	},
	_unpreview () {
		
		this.stop();

		this.actorNode.rotation = this.beforePreview['rotation'];
		this._speed = this.beforePreview['speed'];
		
	},

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

});
