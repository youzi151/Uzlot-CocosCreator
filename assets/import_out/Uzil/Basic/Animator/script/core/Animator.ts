import { 
	AnimState,
	AnimTransition,
	AnimClip,
	AnimFactory,
} from "../../index_Animator";

import { Objf, AudioMgr, Event } from "../../../../Uzil";


const {ccclass, property} = cc._decorator;

@ccclass
export class Animator extends cc.Component {
	
	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/** 預設狀態 */
	@property()
	public defaultState : string = "";

	/** 設定檔 */
	@property(cc.JsonAsset)
	public animatorFile : cc.JsonAsset = null;

	/** 當前狀態 */
	public currentState : AnimState;

	/** 所有狀態 */
	public states : Array<AnimState> = [];

	/** 變數 */
	public parameter : Object = {};

	/** 是否正在播放中 */
	public isPlaying : boolean = false;

	/** 時間 */
	public get time () : number {
		return this._getTime();
	}
	public set time (val) {
		this._setTime(val);
	}
	
	/** 時間比率 */
	public get timeScale () : number {
		return this._getTimeScale();
	}
	public set timeScale (val) {
		this._setTimeScale(val);
	}

	/*== Event ====================================================*/

	/** 當事件 */
	public onEvent : Event = new Event();

	/** 當關鍵幀 */
	public onTime : Event = new Event();

	/** 當播放完畢 */
	public onComplete : Event = new Event();

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	public onLoad () {
		// 讀取配置
		if (this.animatorFile) {
	
			let data = Objf.clone(this.animatorFile.json);
			
			let buildData = data['build']; 
			if (buildData) {
				data = buildData;
			}

			this.load(data);
		}

		// 當播放完畢時檢查
		this.onComplete.add(()=>{
			this._checkTransition(/* force */1);
		});

		this._onLoad();
	}
	protected _onLoad () {}

	public start () {
		this._start();
	}
	protected _start () {}

	public update (dt) {
		// console.log(this.node.name + " : " + JSON.stringify(this.parameter));
		this._update();

		
		this._checkTransition();
	}
	protected _update () {}

	/*== Public Function ==========================================*/

	/*== 基本功能 =================*/

	/**
	 * 讀取資料
	 * @param data 讀取描述檔
	 */
	public load (data: Object) : Animator {

		// 預設 狀態
		let defaultState = data['defaultState'];
		if (defaultState && defaultState != "") {
			this.defaultState = defaultState;
		}

		// 狀態列表
		let states = [].concat(data['states']);
		if (states) {
			for (let each of states){
				let state = AnimFactory.createState(each);
				this.addState(state);
			}
		}

		// 變數
		let parameter = Objf.clone(data['parameter']);
		if (parameter) {
			this.parameter = parameter;
		}

	
		// 播放預設狀態
		if (this.defaultState) {
			this.play(this.defaultState);
		} else if (this.states.length > 0) {
			this.playState(this.states[0]);
		} else {}

		return this;
	}

	/**
	 * 設置變數
	 * @param key 變數名稱
	 * @param val 值
	 */
	public set (key: string, val: any) : Animator {
		this.parameter[key] = val;
		return this;
	}

	/*== 播放控制 =================*/
	
	/**
	 * 播放
	 * @param stateName 欲播放的狀態名稱
	 */
	public play (stateName: string) : void {

		for (let each of this.states) {
			if (each.name == stateName) {
				this.playState(each);
				break;
			}
		}

		// cc.log("[Animator]: state:["+stateName+"] is not exist");
	}
	/**
	 * 播放
	 * @param state 欲播放的狀態
	 */
	public playState (state: AnimState) : void {
		if (state == null || state == undefined) {
			this.stop();
			return;
		}

		// 正在播放中
		this.isPlaying = true;

		// 改變狀態
		this.currentState = state;

		// 片段列表
		let clips = state.animClips;
		if (clips.length == 0) return;

		// 播放 主要片段
		let mainAnim = clips[0];
		this._play(mainAnim);

		// 疊加播放 次要片段
		if (clips.length > 1) {
			for (let i = 1; i < clips.length; i++) {
				this._playAdditive(clips[i]);
			}
		}
	}

	/** 停止 */
	public stop () : void {
		this.isPlaying = false;
		this._stop();
	}

	/** 暫停 */
	public pause () : void {
		this.isPlaying = false;
		this._pause();
	}
	
	/** 復原 */
	public resume () : void {
		this.isPlaying = true;
		this._resume();
	}

	/*== 時間 =================*/
	
	/**
	 * 設置 百分比時間
	 * @param normalizedTime 百分比時間
	 */
	public setNormalizedTime (normalizedTime: number) : void {
		this._setNormalizedTime(normalizedTime);
	}
	
	/** 取得 當前播放進度 */
	public getNormalizedTime () : number {
		return this._getNormalizedTime();
	}


	/*== 其他功能 =================*/

	/**
	 * 加入狀態
	 * @param state 狀態
	 */
	public addState (state: AnimState) : Animator {
		this.states.push(state);
		return this;
	}

	/**
	 * 移除狀態
	 * @param name 欲移除狀態的名稱
	 */
	public removeState (name: string) : void {
		for (let each of this.states){
			if (each.name != name) continue;
			this.states.splice(this.states.indexOf(each), 1);
			break;
		}
	}

	/**
	 * 取得狀態
	 * @param name 欲取得狀態的名稱
	 */
	public getState (name: string) : AnimState {
		for (let each of this.states){
			if (each.name == name) return each;
		}
		return null;
	}
	
	/*== Protected Function =========================================*/

	/**
	 * 進入轉換 
	 * @param transition 轉場
	 */
	protected _enter (transition: AnimTransition) : void {
		
		// 取得下一個 狀態
		let nextState = this.getState(transition.nextState);
		this.currentState = nextState;

		// 播放狀態
		this.playState(this.currentState);
	}

	/**
	 * 檢查並轉場
	 */
	protected _checkTransition (forceNormalizedTime: number = -1) {

		if (!this.currentState) return;

		// 計算 當前播放時間
		let normalizedTime = this.getNormalizedTime();
		if (forceNormalizedTime != -1){
			normalizedTime = forceNormalizedTime;
		}
		// cc.log(normalizedTime);

		// 檢查 轉換通道
		for (let each of this.currentState.transitions) {

			
			// 若 有離開時間限制
			if (each.exitTime != -1) {
				// 若尚未到達離開時間 則 忽略此通道
				// cc.log("normalizedTime:"+normalizedTime+" / each.exitTime:"+each.exitTime+" = "+(normalizedTime < each.exitTime));
				if (normalizedTime < each.exitTime) {
					continue;
				}
			}

			// 若 該通道條件符合 則 進入通道
			if (each.isPass(this.parameter)) {
				this._enter(each);
				break;
			}
		}
	}

	
	/**
	 * 播放音效
	 * @param audioID 音效名稱
	 */
	protected _playAudio (audioID: string) : void {
		AudioMgr.play(audioID);
	}

	
	/*== 子類別實作 ============================ */

	/**
	 * 播放
	 * @param anim 要播放的動畫片段
	 */
	protected _play (anim: AnimClip) : void {
		
	}
	/**
	 * 疊加播放
	 * @param anim 要播放的動畫片段
	 */
	protected _playAdditive (anim: AnimClip) : void {
		
	}
	/** 停止 */
	protected _stop () : void {
		
	}
	/** 暫停 */
	protected _pause () : void {
		
	}
	/** 復原 */
	protected _resume () : void {
		
	}

	/**
	 * 設置 百分比時間
	 * @param normalizedTime 百分比時間
	 */
	protected _setNormalizedTime (normalizedTime: number) : void {

	}

	/** 取得當前播放進度 */
	protected _getNormalizedTime () : number {
		return 0;
	}
	

	/**
	 * 設置時間
	 * @param time 時間
	 */
	protected _setTime (time: number) : void {

	}
	/**
	 * 取得時間
	 */
	protected _getTime () : number {
		return 0;
	}

	/**
	 * 設置時間倍率
	 * @param timeScale 時間倍率
	 */
	protected _setTimeScale (timeScale: number) : void {

	}
	/**
	 * 取得時間倍率
	 */
	protected _getTimeScale () : number {
		return 0;
	}


	/*== Private Function =========================================*/


}