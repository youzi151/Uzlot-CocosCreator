import { AniTween } from "../AniTween";
import { AniCollect_MoveType } from "../act/AniCollect";

enum AniCollect_TargetType {
	NODE,
	POSITION,
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

		
		/*========================== */
		
		/* 目標類型 */
		'targetType': {
			default: AniCollect_TargetType.POSITION,
			type: cc.Enum(AniCollect_TargetType)
		},


		/* 目標位置 */
		'targetPos': {
			default: cc.Vec2.ZERO,
			visible: function () {
				return this.targetType == AniCollect_TargetType.POSITION;
			},
		},

		/* 目標位置 區域半徑 */
		'areaRadius': {
			default: 0,
			visible: function () {
				return this.targetType == AniCollect_TargetType.POSITION;
			},
		},

		/* 目標 */
		'targetLocator': {
			default: null,
			type: cc.Node,
			visible: function () {
				return this.targetType == AniCollect_TargetType.NODE;
			},
		},

		/* 要移動的成員 */
		'actors': {
			default: [],
			type: cc.Node,
		},


		/*========================== */
		
		/* 動態類型 */
		'movementType': {
			default: AniCollect_MoveType.SPEED,
			type: cc.Enum(AniCollect_MoveType),
		},

		/* 加速度 */
		'acceleration': {
			default: 5,
			visible: function () {
				return this.movementType == AniCollect_MoveType.SPEED;
			}
		},

		/* 速度 */
		'speed': {
			default: 1,
			visible: function () {
				return this.movementType == AniCollect_MoveType.SPEED;
			}
		},

		/* 持續時間 */
		'duration': {
			default: 1,
			visible: function () {
				return this.movementType == AniCollect_MoveType.DURATION;
			}
		},

		/* 淡入 (百分比) */
		'easeIn_percent': {
			default: 0,
			visible: function () {
				return this.movementType == AniCollect_MoveType.DURATION;
			}
		},
		'easeOut_percent': {
			default: 0,
			visible: function () {
				return this.movementType == AniCollect_MoveType.DURATION;
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
		data['rootNode'] = this._getRoot(this.node);

		data['actors'] = this.actors;

		if (this.targetType == AniCollect_TargetType.POSITION){
			data['target'] = this.targetPos;
		}else if (this.targetType == AniCollect_TargetType.NODE){
			data['target'] = this.targetLocator;
		}
		
		data['moveType'] = this.moveType;
		
		data['areaRadius'] = this.areaRadius;
		
		data['speed'] = this.speed;
		
		data['acceleration'] = this.acceleration;
		
		data['easeInOut'] = [this.easeIn_percent, this.easeOut_percent];
		
		data['duration'] = this.duration;

		
		this.tween = new AniTween().collect(data);
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

		let poses = [];
		for (let each of this.actors){
			poses.push({
				'node': each,
				'pos': each.position,
			});
		}
		this.beforePreview['positions'] = poses;

		this.play();

	},
	_unpreview () {

		this.stop();
		
		let poses = this.beforePreview['positions'];
		if (poses){
			for (let each of poses){
				each.node.setPosition(each.pos);
			}
		}
		
	},	


	/*== 其他功能 =================*/
	
	/*== Private Function =========================================*/

});
