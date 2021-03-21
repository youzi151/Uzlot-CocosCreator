import { AniPath_MoveType, AniPath_WrapType } from "../act/AniPath";
import { AniTween } from "../AniTween";

enum AniPath_TargetType {
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
			default: AniPath_TargetType.POSITION,
			type: cc.Enum(AniPath_TargetType)
		},

		/* 路徑是否關閉 */
		'isPathClosure': {
			default: true,
		},

		/* 目標位置 */
		'pathPos': {
			default: [],
			type: cc.Vec2,
			visible: function () {
				return this.targetType == AniPath_TargetType.POSITION;
			},
		},

		'pathLocators': {
			default: [],
			type: cc.Node,
			visible: function () {
				return this.targetType == AniPath_TargetType.NODE;
			},
		},

		

		/* 動態類型 */
		
		'moveType': {
			default: AniPath_MoveType.SPEED,
			type: cc.Enum(AniPath_MoveType),
		},

		/* 播放類型 */
		'wrapType': {
			default: AniPath_WrapType.LOOP,
			type: cc.Enum(AniPath_WrapType),
		},

		/*== SPEED ====================== */


		/* 速度 */
        'speed': {
			default: 0,
			visible: function () {
				return this.moveType == AniPath_MoveType.SPEED;
			}
		},
		

		/*== DURATION ====================== */

		/* 持續時間 */
		'duration': {
			default: 5,
			visible: function () {
				return this.moveType == AniPath_MoveType.DURATION;
			}
		},
		
		/*== CURVE ========================= */
		

		/* 曲線資料 */
        'curveFile': {
			default: null,
			type: cc.JsonAsset,
			visible: function () {
				return this.moveType == AniPath_MoveType.CURVE;
			},
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

		if (this.targetType == AniPath_TargetType.POSITION){
			data['path'] = this.pathPos;
		}else if (this.targetType == AniPath_TargetType.NODE){
			data['path'] = this.pathLocators;
		}

		data['isPathClosure'] = this.isPathClosure;

		data['moveType'] = this.moveType;
		
		data['wrapType'] = this.wrapType;
		
		data['speed'] = this.speed;
		
		data['duration'] = this.duration;

		
		this.tween = new AniTween().path(data);
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
		this.stop();
		
		this.actorNode.setPosition(this.beforePreview['position']);
		
	},	


	/*== 其他功能 =================*/

	/*== Private Function =========================================*/
		

});
