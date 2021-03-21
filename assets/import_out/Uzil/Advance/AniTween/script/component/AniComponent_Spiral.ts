import { AniSpiral_WrapType } from "../act/AniSpiral";
import { AniTween } from "../AniTween";

enum AniSpiral_TargetType {
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
			default: AniSpiral_TargetType.POSITION,
			type: cc.Enum(AniSpiral_TargetType)
		},

		/* 目標位置 */
		'centerPos': {
			default: cc.Vec2.ZERO,
			visible: function () {
				return this.targetType == AniSpiral_TargetType.POSITION;
			},
		},
		'centerLocator': {
			default: null,
			type: cc.Node,
			visible: function () {
				return this.targetType == AniSpiral_TargetType.NODE;
			},
		},

		
		/* 目前角度 */
		'currentAngle': {
			default: -1,
		},
		/* 初始角度 */
		'initialAngle': {
			default: -1,
		},


		/* 播放類型 */
		'wrapType': {
			default: AniSpiral_WrapType.CONTINUED,
			type: cc.Enum(AniSpiral_WrapType),
		},

		/*========================== */

		/* 旋轉前進方向 (1: 順時針/-1: 逆時針) */
		'rotateNormal': {
			default: 1,
		},

		/* 旋轉速度 */
		'rotateSpeed': {
			default: 0,
		},

		/* 旋轉加速度 */
		'rotateAcceleration': {
			default: 0
		},

		
		/* 半徑距離 */
		'radius': {
			default: -1
		},

		/* 半徑方向 (1: 外/-1: 內) */
		'radiusNormal': {
			default: 0,
		},

		/* 半徑速度 */
        'radiusSpeed': {
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

		if (this.targetType == AniSpiral_TargetType.POSITION){
			data['target'] = this.centerPos;
		}else if (this.targetType == AniSpiral_TargetType.NODE){
			data['target'] = this.centerLocator;
		}
		
		data['wrapType'] = this.wrapType;
		
		data['currentAngle'] = this.currentAngle;
		
		data['initialAngle'] = this.initialAngle;


		data['rotateNormal'] = this.rotateNormal;
		
		data['rotateSpeed'] = this.rotateSpeed;

		data['rotateAcceleration'] = this.rotateAcceleration;

		
		data['radius'] = this.radius;
		
		data['radiusNormal'] = this.radiusNormal;

		data['radiusSpeed'] = this.radiusSpeed;


		this.tween = new AniTween().spiral(data);
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
