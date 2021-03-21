import { AniTween } from "../AniTween";

enum AniLookAt_TargetType {
	POSITION,
	NODE
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
		
		/* 目標類型 */
		'targetType': {
			default: AniLookAt_TargetType.NODE,
			type: cc.Enum(AniLookAt_TargetType),
		},

		/* 當前目標 */
		'lookAtNode': {
			default: null,
			type: cc.Node,
			visible: function () {
				return this.targetType == AniLookAt_TargetType.NODE;
			},
		},
		'lookAtPosition': {
			default: cc.Vec2.ZERO,
			visible: function () {
				return this.targetType == AniLookAt_TargetType.POSITION;
			},
		},

		/* 旋轉速度 */
		'speed': {
			default: 0,
		},

		/* 旋轉加速度 */
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
		data['rootNode'] = this._getRoot(this.actorNode);

		data['actorNode'] = this.actorNode;

		if (this.targetType == AniLookAt_TargetType.POSITION){
			data['target'] = this.lookAtPosition;
		}else if (this.targetType == AniLookAt_TargetType.NODE){
			data['target'] = this.lookAtNode;
		}
		
		data['moveType'] = this.moveType;
		
		data['speed'] = this.speed;
		
		data['acceleration'] = this.acceleration;
		
		data['duration'] = this.duration;

		this.tween = new AniTween().lookAt(data);
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
		if (!this.actorNode) return;

		this.beforePreview['rotation'] = this.actorNode.rotation;
		this.beforePreview['speed'] = this._speed;

		this.play();
	},
	_unpreview () {
		if (!this.actorNode) return;
		
		this.stop();

		this.actorNode.rotation = this.beforePreview['rotation'];
		this._speed = this.beforePreview['speed'];
		
	},


	/*== 其他功能 =================*/

	/*== Private Function =========================================*/
	
});
