import { AniGoto_MoveType } from "../act/AniGoto";
import { AniTween } from "../AniTween";

enum AniGoto_TargetType {
	NODE,
	POSITION
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
			default: AniGoto_TargetType.POSITION,
			type: cc.Enum(AniGoto_TargetType)
		},

		/* 目標位置 */
        'targetPosition': {
			default: cc.Vec2.ZERO,
			visible: function () {
				return this.targetType == AniGoto_TargetType.POSITION;
			}
		},

		/* 目標 */
        'targetLocator': {
			default: null,
			type: cc.Node,
			visible: function () {
				return this.targetType == AniGoto_TargetType.NODE;
			}
		},

		/* 動態類型 */
		'moveType': {
			type: cc.Enum(AniGoto_MoveType),
			default: AniGoto_MoveType.DURATION,
		},

		/* 速度 */
        'speed': {
			default: 0,
			visible: function () {
				return this.moveType == AniGoto_MoveType.SPEED;
			}
		},

		
		/* 加速度 */
		'acceleration': {
			default: 0,
			visible: function () {
				return this.moveType == AniGoto_MoveType.SPEED;
			}
		},


		/* 持續時間 */
		'duration': {
			default: 5,
			visible: function () {
				return this.moveType == AniGoto_MoveType.DURATION;
			}
		},
		

		
		/* 緩動 */
		/* 淡入 (百分比) */
		'easeIn_percent': {
			default: 0,
			visible: function () {
				return this.moveType == AniGoto_MoveType.DURATION;
			}
		},
		'easeOut_percent': {
			default: 0,
			visible: function () {
				return this.moveType == AniGoto_MoveType.DURATION;
			}
		},
		

		/* 曲線資料 */
        'curveFile': {
			default: null,
			type: cc.JsonAsset,
			visible: function () {
				return this.moveType == AniGoto_MoveType.CURVE;
			},
		},
		 
    },

	
	/*== Cocos LifeCycle ==========================================*/

    // LIFE-CYCLE CALLBACKS:

    // onLoad () {},

    _start () {
		// this.play();
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

		if (this.targetType == AniGoto_TargetType.POSITION){
			data['target'] = this.targetPosition;
		}else if (this.targetType == AniGoto_TargetType.NODE){
			data['target'] = this.targetLocator;
		}
		
		data['moveType'] = this.moveType;
		
		data['speed'] = this.speed;
		
		data['acceleration'] = this.acceleration;
		
		data['duration'] = this.duration;

		data['easeInOut'] = [this.easeIn_percent, this.easeOut_percent];


		this.tween = new AniTween().goto(data);
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
