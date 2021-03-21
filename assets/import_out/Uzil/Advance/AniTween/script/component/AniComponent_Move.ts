import { AniTween } from "../AniTween";

enum AniMove_Type {
	VELOCITY,
	CURVE
}

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
		
		/* 動態類型 */
		'moveType': {
			default: AniMove_Type.VELOCITY,
			type: cc.Enum(AniMove_Type)
		},

		/* 速度 */
        'velocity': {
			default: cc.Vec2.ZERO,
			visible: function () {
				return this.moveType == AniMove_Type.VELOCITY;
			}
		},

		/* 加速度 */		
		'acceleration': {
			default: cc.Vec2.ZERO,
			visible: function () {
				return this.moveType == AniMove_Type.VELOCITY;
			}
		},
		

		/* 持續時間 */
		'duration': {
			default: 5,
			visible: function () {
				return this.moveType == AniMove_Type.VELOCITY;
			}
		},

		/* 曲線資料 */
        'curveFile': {
			default: null,
			type: cc.JsonAsset,
			visible: function () {
				return this.moveType == AniMove_Type.CURVE;
			}
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

		data['moveType'] = this.moveType;
		
		data['velocity'] = this.velocity.clone();
		
		data['acceleration'] = this.acceleration.clone();
		
		data['duration'] = this.duration;


		this.tween = new AniTween().move(data);
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

		this.beforePreview['position'] = this.actorNode.position;

		this.play();
	},
	_unpreview () {

		this.actorNode.setPosition(this.beforePreview['position']);

		this.stop();
	},

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

});
