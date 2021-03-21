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
export class SpineAnimator extends Animator {
	
	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** Spine組件 */
	@property(sp.Skeleton)
	public skeleton : sp.Skeleton = null;

	/** 播放過的次數 */
	protected _playedTime : number = 0;
	public get playedTime () : number {
		return this._playedTime;
	}

	/** 暫停前的時間速率比例 */
	protected _timeScale_BeforePause : number = -1;

	/** 暫存 播放百分比 */
	protected _lastNormalizedTime : number = -1;

	/*== Event ====================================================*/


	/*== Cocos LifeCycle ==========================================*/

	protected _onLoad () {
		let self = this;

		//==test==========
		// this.example_script();
		// this.example_data();
		// this.timeScale = 0.5;
		//================
		
		// 註冊完成事件
		self.skeleton.setCompleteListener((trackEntry)=>{
			// 非主要軌道 則忽略
			if (trackEntry.trackIndex != 0) return;


			// 增加播放次數
			self._playedTime++;

			// 重置 播放百分比事件狀態
			for (let each of self.onTime.listeners) {
				each.other["isRunedInLoop"] = false;
			}

			self.onComplete.call();

		});

		// 註冊關鍵幀事件
		self.skeleton.setEventListener((trackEntry, event) => {
			
			// 要移除的事件
			let toRm = [];
			// 每個事件
			for (let each of self.onEvent.listeners) {
				if (each.other.eventTag != event.data.name) continue;

				// 執行
				each.func();

				// 若 單次執行 則 移除
				if (each.callTime == 1) {
					toRm.push(each);
				}
			}
			// 移除
			for (let each of toRm) {
				self.onEvent.remove(each);
			}

		});
	

	}

	protected _update() {
		let self = this;

		self._lastNormalizedTime = -1;
		
		// 依照時間
		let time = self.getNormalizedTime() % 1;

		// 要移除的事件
		let toRm = [];

		// 所有播放百分比事件
		for (let each of self.onTime.listeners) {
			let eachAny : any = each;
			
			// 播放百分比 尚未超過 指定百分比 則 跳過
			if (time < each.other["time_percent"]) continue;

			// 此輪已執行 則 跳過
			if (each.other["isRunedInLoop"]) continue;
			
			// 執行
			each.func();
			
			//此輪 已經執行過
			each.other["isRunedInLoop"] = true;

			// 若 單次執行 則 預備移除
			if (each.callTime == 1) {
				toRm.push(each);
			}
		}
		
		// 移除
		for (let each of toRm) {
			self.onTime.removeListener(each);
		}
		
	}

	/*== Public Function ==========================================*/

	/*== 基本功能 =================*/

	/*== 其他功能 =================*/
	
	/*== Protected Function =========================================*/
	
	/**
	 * 播放
	 * @param animClip 要播放的動畫片段
	 */
	protected _play (anim: AnimClip) : void {
		this.skeleton.clearTracks();
		let track = this.skeleton.setAnimation(anim.trackIdx, anim.name, anim.isLoop);
		track.alpha = anim.mixAlpha;

		this._playedTime = 0;
	}

	/**
	 * 疊加播放
	 * @param animClip 要疊加播放的動畫片段
	 */
	protected _playAdditive (anim: AnimClip) : void {
		let track = this.skeleton.addAnimation(anim.trackIdx, anim.name, anim.isLoop);
		track.alpha = anim.mixAlpha;
	}
	
	/** 停止 */
	protected _stop () : void {
		this.skeleton.clearTracks();
		this._playedTime = 0;
	}

	/** 暫停 */
	protected _pause () : void {
		if (this._timeScale_BeforePause > 0) return;

		this._timeScale_BeforePause = this.skeleton.timeScale;
		this.skeleton.timeScale = 0;

	}

	/** 復原 */
	protected _resume () : void {
		this.skeleton.timeScale = this._timeScale_BeforePause;
		this._timeScale_BeforePause = -1;
	}

	
	/**
	 * 設置時間
	 * @param time 設置時間
	 */
	protected _setTime (time: number) : void {
		let track: sp.spine.TrackEntry = this.skeleton.getCurrent(0);
		track.trackTime = time;
	}
	/** 取得時間 */
	protected _getTime () : number {
		let track: sp.spine.TrackEntry = this.skeleton.getCurrent(0);
		return track.trackTime;
	}

	/**
	 * 設置 百分比時間
	 * @param normalizedTime 百分比時間
	 */
	protected _setNormalizedTime (normalizedTime: number) : void {
		let track: sp.spine.TrackEntry = this.skeleton.getCurrent(0);
		if (!track) return;
			
		let totalTime = track.animationEnd;

		this._setTime(Mathf.lerp(0, totalTime, normalizedTime));
	}

	/** 取得當前播放進度 */
	protected _getNormalizedTime () : number {
		if (this._lastNormalizedTime != -1) {
			return this._lastNormalizedTime;
		}

		// 軌道數量
		let trackCount = 0;
		// 總時間
		let totalTime = 0;
		// 當前時間
		let animTime = 0;
		
		// 每一軌
		// for (let i = 0; i < 100; i++){
		// 	let track: sp.spine.TrackEntry = this.skeleton.getCurrent(i);
		// 	if (!track) break;
			
		// 	// 取最久的片段
		// 	if (track.animationEnd > totalTime){
		// 		totalTime = track.animationEnd;
		// 		animTime = track.trackTime;
		// 	}

		// 	trackCount++;

		// }


		let track: sp.spine.TrackEntry = this.skeleton.getCurrent(0);
		if (!track) return -1;
			
		totalTime = track.animationEnd;
		animTime = track.trackTime;

	
		let result = /* this.playedTime +  */(animTime / totalTime);

		this._lastNormalizedTime = result;


		return result;
	}

	/**
	 * 設置時間比率
	 * @param timeScale 設置時間比率
	 */
	protected _setTimeScale (timeScale: number) : void {
		this.skeleton.timeScale = timeScale;
	}
	
	/** 取得時間比率 */
	protected _getTimeScale () : number {
		return this.skeleton.timeScale;
	}



	/*== Private Function =========================================*/

	/** 範例 用程式 產生 */
	private example_script () {

		// 狀態變數
		this.parameter["isToY"] = false;

		// 建立 Clip
		let clipX = new AnimClip("xMove").track(0).loop().alpha(1);
		let clipY = new AnimClip("yMove").track(1).loop();
		let clipXY = new AnimClip("xMove").track(0).loop().alpha(0.1);

		// 建立 state
		let stateX = new AnimState("stateX");
		stateX.addClip(clipX);

		let stateY = new AnimState("stateY");
		stateY.addClip(clipY);
		stateY.addClip(clipXY);
		
		// 建立 轉換通道 與 條件
		let trans1 = new AnimTransition().next(stateY);
		trans1.exitTime = 2;
		
		let condition = new AnimCondition("isToY", Comparer.EQUAL, true);
		trans1.addCondition(condition);
		
		
		let trans2 = new AnimTransition().next(stateX);
		trans2.exitTime = 2;
		
		
		// 加入 轉換通道 至 狀態
		stateX.addTransition(trans1);
		stateY.addTransition(trans2);
		
		// 加入 狀態		
		this.addState(stateX);
		this.addState(stateY);
		
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

			// 狀態變數
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
						{name: 'xMove', isLoop:true}
					],

					// 轉換通道
					transitions: [
						{
							// 下一個狀態
							nextState: 'stateY',
							// 前一狀態最少播放時間
							exitTime: 2,
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
						{name: 'xMove', isLoop:true, track:0},
						// 片段 yMove
						{name: 'yMove', isLoop:true, track:1},
					],

					// 轉換通道
					transitions: [
						{
							// 下一個狀態
							nextState: 'stateX',
							// 前一狀態最少播放時間
							exitTime: 2,
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
