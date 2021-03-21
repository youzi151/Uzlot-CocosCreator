import {
	AnimClip,
	Animator,
	AnimState,
	AnimTransition,
	AnimCondition,
} from "../index_Animator";

import { Mathf, Comparer } from "../../../Uzil";

const {ccclass, property} = cc._decorator;

@ccclass
export class CocosAnimator extends Animator {
	
	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 動畫組件 */
	@property(cc.Animation)
	public animation : cc.Animation = null;

	/** 播放過的次數 */
	protected _playedTime : number = 0;
	public get playedTime ()  : number {
		return this._playedTime;
	}

	/** 時間比率 暫存 */
	protected _timeScale : number = -1;

	/** 當前片段 */
	protected _currentClip : cc.AnimationClip = null;


	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	protected _onLoad () {
		let self = this;

		//==test==========
		// this.example_script();
		// this.example_data();
		// this.timeScale = 0.5;
		//================
		
	}

	protected _update () {
		let self = this;

		// 依照時間
		let time = self.getNormalizedTime();

		// 要移除的事件
		let toRm = [];

		// 所有 播放百分比事件
		for (let each of self.onTime.listeners) {

			// 播放百分比 尚未超過 指定百分比 則 跳過
			if (time < each.other["time_percent"]) continue;
			
			// 此輪已執行 則 跳過
			if (each.other["isRunedInLoop"]) continue;

			// 執行
			each.func();

			//此輪 已經執行過
			each.other["isRunedInLoop"] = true;

			// 若 單次執行 則 預備移除
			if (each.callTime = 1) {
				toRm.push(each);
			}
		}
		// 移除
		for (let each of toRm) {
			self.onTime.remove(each);
		}

	}

	/*== Public Function ==========================================*/

	/*== 基本功能 =================*/

	/**
	 * 提供動畫呼叫
	 * @param eventTag 事件標籤
	 * @param args 其他參數
	 */
	public callEvent (eventTag: string, ...args) : void {
		let self = this;

		// 要移除的事件
		let toRm = [];
		// 每個事件
		for (let each of self.onEvent.listeners) {
			if (each.other.eventTag != eventTag) continue;

			// 執行
			each.call();

			// 若 單次執行 則 移除
			if (each.callTime == 1) {
				toRm.push(each);
			}
		}
		// 移除
		for (let each of toRm) {
			self.onEvent.remove(each);
		}
	}

	/**
	 * 播放音效
	 * @param audioID 音效名稱
	 */
	public callAudio (audioID: string) : void {
		this._playAudio(audioID);
	}

	/*== 其他功能 =================*/
	
	/*== Protected Function =========================================*/
	
	/**
	 * 播放
	 * @param animClip 要播放的動畫片段
	 */
	protected _play (animClip: AnimClip) : void {
		this.animation.play(animClip.name);
		this.animation.resume();
		this._reRegEvent();
		this._playedTime = 0;
		this._currentClip = this.animation.currentClip;
	}
	/**
	 * 疊加播放
	 * @param animClip 要疊加播放的動畫片段
	 */
	protected _playAdditive (animClip: AnimClip) : void {
		this.animation.playAdditive(animClip.name);
	}

	/** 停止 */
	protected _stop () : void {
		this.animation.stop();
		this._playedTime = 0;
	}
	/** 暫停 */
	protected _pause () : void {
		this.animation.pause();
	}
	/** 復原 */
	protected _resume () : void {
		this.animation.resume();
	}

	/**
	 * 設置時間
	 * @param time 設置時間
	 */
	protected _setTime (time: number) : void {
		this.animation.setCurrentTime(time);
	}
	/** 取得時間 */
	protected _getTime () : number {
		let currentClip = this._currentClip;
		if (!currentClip) return -1;

		let state = this.animation.getAnimationState(currentClip.name);
		return state.time;
	}

	/**
	 * 設置 百分比時間
	 * @param normalizedTime 百分比時間
	 */
	protected _setNormalizedTime (normalizedTime: number) : void {
		let currentClip = this._currentClip;
		if (!currentClip) return;

		let totalTime = currentClip.duration;

		this._setTime(Mathf.lerp(0, totalTime, normalizedTime));
	}

	/** 取得當前播放進度 */
	protected _getNormalizedTime () : number {
		let currentClip = this._currentClip;
		if (!currentClip) return -1;
		
		let state = this.animation.getAnimationState(currentClip.name);

		let totalTime = currentClip.duration;
		let animTime = state.time;

		// TODO 
		// 若是一般播放方式
		if (state.wrapMode == cc.WrapMode.Normal
			|| state.wrapMode == cc.WrapMode.Default
			|| state.wrapMode == cc.WrapMode.Reverse) {
				
			// 動畫時間超過
			if (animTime > totalTime) {
				return 1;
			}
		}

		let normalized = (animTime / totalTime) % 1;
		// cc.log("totalTime["+totalTime+"] animTime["+animTime+"] normalized["+normalized+"]")
		return normalized;
	}


	/**
	 * 設置時間比率
	 * @param timeScale 設置時間比率
	 */
	protected _setTimeScale (timeScale: number) : void {
		for (let eachClip of this.animation['_clips']) {
			let state = this.animation.getAnimationState(eachClip.name);
			state.speed = timeScale;
		}
		this._timeScale = timeScale;
	}
	/** 取得時間比率 */
	protected _getTimeScale () : number {
		// 若有設置 則 返回
		if (this._timeScale != -1) {
			return this._timeScale;
		}
		// 否則 
		else {

			// 使用首個動畫片段的時間比率
			for (let eachClip of this.animation['_clips']) {
				let state = this.animation.getAnimationState(eachClip.name);
				this._setTimeScale(state.speed);
				break;
			}

			return this._timeScale;
		}
	}


	/*== Private Function =========================================*/

	/**
	 * 重新註冊事件
	 */
	private _reRegEvent () {
		this.animation.off('lastframe', this._onLastFrame, this);
		this.animation.off('finished', this._onLastFrame, this);
		
		// 註冊 播放完畢 事件
		this.animation.on('lastframe', this._onLastFrame, this);
		this.animation.on('finished', this._onLastFrame, this);
	}
	
	/**
	 * 當動畫播放到最後一幀
	 * @param event 事件資料
	 */
	private _onLastFrame (event) {
		let self = this;
		
		// 增加播放次數
		self._playedTime++;

		// 重置
		for (let each of self.onTime.listeners) {
			each.other["isRunedInLoop"] = false;
		}

		self.onComplete.call();
	}

	
	/** 範例 用程式 產生 */
	private example_script () {

		// 建立 Clip
		let clipX = new AnimClip("xMove");
		let clipY = new AnimClip("yMove");

		
		// 建立 state
		let stateX = new AnimState("stateX");
		stateX.addClip(clipX);

		let stateY = new AnimState("stateY");
		stateY.addClip(clipX);
		stateY.addClip(clipY);
		
		
		// 建立 轉換通道 與 條件
		let trans1 = new AnimTransition().next(stateY);
		trans1.exitTime = 5;
		
		let condition = new AnimCondition("isToY", Comparer.EQUAL, true);
		trans1.addCondition(condition);
		
		
		let trans2 = new AnimTransition().next(stateX);
		trans2.exitTime = 1;
		
		
		// 加入 轉換通道 至 狀態
		stateX.addTransition(trans1);
		stateY.addTransition(trans2);
		
		// 加入 狀態		
		this.addState(stateX);
		this.addState(stateY);
		
		this.parameter["isToY"] = false;

		// 1秒後 開啟轉換
		this.scheduleOnce(()=>{
			this.set('isToY', true);
		}, 1);

		// 20秒後 關閉轉換
		this.scheduleOnce(()=>{
			this.set('isToY', false);
		}, 20);
					
	}

	/** 範例 用資料 產生 */
	private example_data () {
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
							exitTime: 5,
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

		this.load(data);


		// 1秒後 開啟轉換
		this.scheduleOnce(()=>{
			this.set('isToY', true);
		}, 1);

		// 20秒後 關閉轉換
		this.scheduleOnce(()=>{
			this.set('isToY', false);
		}, 20);

	}
}
