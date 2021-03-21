import { Animator } from "../script/core/Animator";

// Learn TypeScript:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/typescript.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/typescript.html
// Learn Attribute:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] https://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/manual/en/scripting/life-cycle-callbacks.html

const {ccclass, property} = cc._decorator;

@ccclass
export default class NewClass extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/* 動畫控制器 */
	@property(Animator)
	public animator : Animator = null;

	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {
		
		// this.test1();

		this.test2();		

	}

	update (dt) {
		
		
	}

	
	/*== Public Function ==========================================*/

	/* 呼叫 */
	// public call (var1: Function, var2: number) : void {

	// }
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	private test1 () {
		let data = {

			// 預設狀態
			defaultState: 'stateX',

			parameter: {
				'isToY': false
			},
			
			// 狀態
			states: [
			
				// 狀態1
				{
					// 名稱
					name: 'stateX',
					// 片段
					clips: [
						// 片段 xMove
						{name: 'xMove'}
					],

					// 轉換通道
					transitions: [
						{
							// 下一個狀態
							nextState: 'stateY',
							// 前一狀態最少播放時間
							exitTime: 0.5,
							// 通道進入條件
							conditions: [
								{key: 'isToY', comparer: '==', value: true}
							],
						}
					]
				},

				// 狀態2
				{
					// 名稱
					name: 'stateY',
					
					// 片段
					clips: [
						// 片段 xMove
						{name: 'xMove'},
						// 片段 yMove
						{name: 'yMove'}
					],

					// 轉換通道
					transitions: [
						{
							// 下一個狀態
							nextState: 'stateX',
							// 前一狀態最少播放時間
							exitTime: 1,
							// 通道進入條件
							conditions: [],
						}
					]
				}
			]
		};

		this.animator.load(data);

		cc.log("loaded")

		// 1秒後 開啟轉換
		this.scheduleOnce(()=>{
			this.animator.set('isToY', true);
			cc.log("isToY true")
		}, 3);

		// 20秒後 關閉轉換
		this.scheduleOnce(()=>{
			this.animator.set('isToY', false);
			cc.log("isToY false")
		}, 20);
	}

	private test2 () {
		let data = {

			// 預設狀態
			defaultState: 'stateA',

			parameter: {
				'isToB': false
			},
			
			// 狀態
			states: [
			
				// 狀態1
				{
					// 名稱
					name: 'stateA',
					// 片段
					clips: [
						// 片段 xMove
						{name: 'xMove'}
					],

					// 轉換通道
					transitions: [
						{
							// 下一個狀態
							nextState: 'stateB',
							// 前一狀態最少播放時間
							exitTime: 0.5,
							// 通道進入條件
							conditions: [
								{key: 'isToB', comparer: '==', value: true}
							],
						}
					]
				},

				// 狀態2
				{
					// 名稱
					name: 'stateB',
					
					// 片段
					clips: [
						// 片段 scale
						{name: 'scale'},
						// 片段 yMove
						{name: 'yMove'},
					],

					// 轉換通道
					transitions: [
						{
							// 下一個狀態
							nextState: 'stateA',
							// 前一狀態最少播放時間
							exitTime: 1,
							// 通道進入條件
							conditions: [],
						}
					]
				}
			]
		};

		this.animator.load(data);

		cc.log("loaded")
		
		// 1秒後 開啟轉換
		this.scheduleOnce(()=>{
			this.animator.set('isToB', true);
			cc.log("isToB true")
		}, 3);

		// 20秒後 關閉轉換
		this.scheduleOnce(()=>{
			this.animator.set('isToB', false);
			cc.log("isToB false")
		}, 20);
	}

}

