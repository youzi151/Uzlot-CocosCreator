import { Time, Mathf, RandomRange, Event } from "../../../Uzil";

const {ccclass, property} = cc._decorator;

@ccclass("CountingNumberStep")
export class CountingNumberStep {
	
	/** 名稱 */
	@property()
	public stepName : string = "";

	/** 該階段總時間 */
	@property()
	public weightedTime : number = 0;

	/** 目標數字 */
	@property()
	public targetNum : number = 0;
}

@ccclass
export class CountingNumber extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 是否已經初始化 */
	private _isInited : boolean = false;

	/** 初始數字 */
	@property()
	public initNum : number = 0;

	/** 當前數字 */
	public get currentNum () : number {
		return this._currentNum;
	};
	public _currentNum : number = 0;

	/** 起點數字 */
	private get startNum () : number {
		return this._startNum;
	};
	private _startNum : number = 0;

	/** 目標數字 */
	private get targetNum () : number {
		return this._targetNum;
	};
	private _targetNum : number = 0;

	/** 目標總時間 */
	public get totalTime () : number {
		return this._totalTime;
	};
	public _totalTime : number = -1;

	/** 當前時間 */
	public get currentTime () : number {
		return this._currentTime;
	};
	private _currentTime : number = 0;

	/** 起點數值 在階段中的資訊 */
	private _startStepInfo : any = null;
	/** 階段中的時間差距 */
	private _weightedTimeDelta : number = 0;

	/** 上次顯示數字陣列 */
	private _toShowStrArray : Array<string> = [];

	/** 顯示數字 */
	public toShowNum : number = 0;

	/** 冷卻時間 */
	@property()
	public updateShowCD : number = 0.02;
	private _leftShowCD : number = 0;
	
	/** 濾鏡 */
	public filters : Array<(pass)=>any> = [];

	
	/*== Component ================================================*/
	
	/** 文字 */
	@property(cc.Label)
	public label : cc.Label = null;

	/** 階段 */
	@property(cc.JsonAsset)
	private stepSettingJson : cc.JsonAsset = null;

	/** 階段 */
	@property(CountingNumberStep)
	private steps : Array<CountingNumberStep> = [];
	
	private _lastStep : number = -1;
	
	/*== Event ====================================================*/

	/** 當階段變化 */
	public onStep : Event = new Event();

	/** 當到達目標值 */
	public onDone : Event = new Event();

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		this.init();
	}

	start () {
		
	}

	update (_dt) {
		let dt = _dt * Time.timeScale;

		// 更新數值
		this._updateNum(dt);

		// 更新顯示
		this._updateShow(dt);
		
	}
	private _updateNum (dt) : void {
		
		if (this._totalTime == -1) return;
		if (this._currentNum == this._targetNum) {
			this.toShowNum = this._currentNum;
			return;
		}
		
		// 增加時間
		this._currentTime = Mathf.moveToward(this._currentTime, this._totalTime, dt);

		// 實際時間比例
		let currentTime_percent = this._currentTime / this._totalTime;

		// 當前階段中的時間
		let currentNum = this._currentNum;

		// 依照百分比取得階段中的比例時間
		let currentWeightedTime = this._startStepInfo.weightedTime + (this._weightedTimeDelta * currentTime_percent);
		// 依照階段中的比例時間取得 階段中的數字數直
		let numInfo = this.getInStepNum(currentWeightedTime);
		currentNum = numInfo.num;
			
		// 若百分之百，為避免誤差則直接指定
		if (currentTime_percent == 1) {
			
			currentNum = this._targetNum;
			
			this.onDone.call();
			
		} 
		
		// 設置當前數值
		this._currentNum = Math.floor(currentNum);

		// 若 階段有變 則 呼叫事件
		let step = numInfo.step;
		if (this._lastStep != step) {
			this.onStep.call(step);
			this._lastStep = step;
		}
		
		// cc.log("===========================");
		// cc.log(this.currentNum+" = ")
		// cc.log(currentWeightedTime+"/"+this._totalTime);
	}
	
	private _updateShow (dt) : void {
		
		// 若 更新顯示的冷卻時間 未到 則 返回
		this._leftShowCD -= dt;
		if (this._leftShowCD > 0) {
			return;
		}

		// 刷新冷卻時間
		this._leftShowCD = this.updateShowCD;

		
		// 避免中間有數字一樣而不動
		let firstChangeNegIdx = -1;
		let lastShow = this._toShowStrArray;
		let toShow = this._currentNum.toString().split("");
		let length = lastShow.length <= toShow.length ? lastShow.length : toShow.length;

		for (let negIdx = length; negIdx > 0; negIdx--) {
			let lastShowIdx = lastShow.length - negIdx;
			let toShowIdx = toShow.length - negIdx;

			// 若 有一樣的數字
			if (toShow[toShowIdx] == lastShow[lastShowIdx]) {
				
				// 若 前面已經有變動過的數字
				if (firstChangeNegIdx != -1) {
					// 隨機改變該數字
					let newNum = parseInt(lastShow[lastShowIdx]);
					newNum = Math.floor(new RandomRange(0, 9).get());
					toShow[toShowIdx] = newNum.toString();
				}

			// 若數字不一樣 則 紀錄 第一個變動過的數字
			} else {
				firstChangeNegIdx = negIdx;
			}

		}

		this._toShowStrArray = toShow;

		// 更新顯示數字
		this.toShowNum = parseInt(this._toShowStrArray.join(""));


		// 設置文字
		if (this.label != null) {

			let pass: string|number = this.toShowNum;
			for (let each of this.filters) {
				pass = each(pass);
			}
			if (typeof pass != 'string') {
				pass = pass.toString();
			}
			this.label.string = pass;

		}
	}

	
	/*== Public Function ==========================================*/

	/** 初始化 */
	public init () : void {
		if (this._isInited) return;
		this._isInited = true;

		// 設置 初始數值
		this.resetNum(this.initNum);

		// 若存在配置檔 則 讀取
		if (this.stepSettingJson) {
			for (let each of this.stepSettingJson.json) {
				this.setStep(each.name, each.targetNum, each.time);
			}
		}

	}

	/** 設置時間 */
	public resetNum (num: number) : void {
		this.init();//確保初始化
		
		// 計算剩餘時間
		this._currentTime = this._currentTime == -1? -1:0;

		// 指定當前數值
		this._currentNum = num;
		this.toShowNum = num;
		this._targetNum = num;
	
	}
	/** 前往 */
	public goto (toNum: number, _totalTime: number = -1) : void {
		this.init();//確保初始化
		
		// 設置 初始與目標數值
		this._startNum = this._currentNum;
		this._targetNum = toNum;

		// 取得 初始與目標數值 在 階段中的資訊
		this._startStepInfo = this.getInStepWeightedTime(this._currentNum);
		let targetStepInfo = this.getInStepWeightedTime(this._targetNum);

		// 取得 階段中的比例時間 差距
		this._weightedTimeDelta = targetStepInfo.weightedTime - this._startStepInfo.weightedTime;

		// 若 沒有指定 總時間 
		if (_totalTime == -1) {
			// 則 以 比例時間 設置
			this._totalTime = this._weightedTimeDelta;
		}
		// 否則 以 指定時間 設置
		else {
			this._totalTime = _totalTime;
		}
	}

	/** 設置階段 */
	public setStep (name: string, targetNum: number, weightedTime: number) : void {
		let step = this.getStep(name);
		if (!step) {
			step = new CountingNumberStep();
			this.steps.push(step);
		}

		step.targetNum = targetNum;
		step.weightedTime = weightedTime;

		this.steps.sort((a, b)=>{
			return a.targetNum - b.targetNum;
		});

	}

	/* 取得該時間在階段中的資訊 */
	public getInStepWeightedTime (num: number) : {step: number, weightedTime: number} {
		// 總計時間
		let time = 0;
		let step = 0;

		// 從第二階段開始檢查
		for (let idx = 0; idx < this.steps.length-1; idx++) {
			let each = this.steps[idx]; 
			let next = this.steps[idx+1];

			// 階段
			step = idx;

			// 若 屬於此階段
			// (數值 大於等於 此階段的指定數值 且 小於 下階段的指定數值)
			if (num >= each.targetNum && num < next.targetNum) {
				
				// 計算 此階段 多出部分
				let fix = (num - each.targetNum) / (next.targetNum - each.targetNum);
				step += fix;
				
				// 加上 時間百分比
				time += (each.weightedTime * fix);

				// 準備回傳
				break;
			}

			// 加上 此階段時間
			time += each.weightedTime;

		}

		return {
			"step": step,
			"weightedTime": time
		};
	}

	/** 取得該加權時間在階段中的數值 */
	public getInStepNum (weightedTime: number) : {step: number, num: number} {

		// 剩餘需計算時間
		let leftWeightedTime = weightedTime;

		let step = 0;
		let stepNum = this.steps[0].targetNum;

		// 每下一個階段
		for (let idx = 0; idx < this.steps.length-1; idx++) {
			let each = this.steps[idx];
			let next = this.steps[idx+1];

			// 設置階段
			step = idx;

			// 扣除完後的結果
			let result = leftWeightedTime - each.weightedTime;

			// 若還有 剩 或 為零 則 不屬於此階段 繼續下一階段 直到負數
			if (result >= 0) {
				leftWeightedTime = result;
				stepNum = next.targetNum;
				continue;
			}

			// 若 扣除完後的結果 已經為負數

			// 取得 剩餘需計算時間 在 該階段的進度 百分比 ( 剩餘需計算時間 / 該階段總時間 )
			let leftPercent = leftWeightedTime / each.weightedTime;

			// 此階段與下一階段之差距
			let numDelta = next.targetNum - each.targetNum;

			// 設置 在此階段中指定時間的數值 (當前階段指定數值 + 此階段與下一階段之差距 * 剩餘百分比))
			stepNum = each.targetNum + (numDelta * leftPercent);
			
			break;
		}

		return {
			"step": step,
			"num": stepNum
		};
	}


	/** 取得階段 */
	public getStep (name: string) : CountingNumberStep {
		for (let each of this.steps) {
			if (each.stepName == name) return each;
		}
		return null;
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

