import { CurveData, Time, Mathf, Event, Objf, PauseResumeTool } from "../../../Uzil/Uzil";
import { ReelRule, SymbolCode } from "../../Rule/index_Rule";
import { ReelColData, ReelRowView, ReelRollState, ReelStopState } from "../index_Reel";
import { ColMiddle } from "./Data/ColMiddle";
import { ReelStripData } from "./Data/ReelStripData";
import { TempColInfo } from "./ReelRowView";

const {ccclass, property} = cc._decorator;

@ccclass
export class ReelRowObj extends cc.Component {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 是否除錯中 */
	@property()
	public isDebug : boolean = false;

	/** 顯示器 */
	@property(ReelRowView)
	public view : ReelRowView = null;
	
	/*== 設置 ===============*/

	/*== 滾動相關 =====*/

	/** 滾動方向 (-1:向滾輪表前方遞減 1:向滾輪表前方遞增) */
	@property()
	public rollDirection : number = -1;

	/** 定義 速度 (移動幾格的百分比/每秒) */
	@property()
	public speed : number = 1;
	/** 定義 加速度 (起轉時) */
	@property()
	public speed_acc : number = 1;

	/*== 停輪相關 =====*/

	/** 是否 停輪時轉移到預備停輪前的地方 (否則會輪遍整個滾輪表) */
	@property()
	public isShiftOnStop : boolean = true;

	/** 定義 呼叫停輪後 到 實際完全停輪 的時間 */
	@property()
	public stopTotalTime : number = 0.5;

	/** 定義 呼叫停輪後 到 實際完全停輪 的過度格 */
	@property()
	public stopDelayCol : number = 3;

	/*== 狀態 ===============*/

	/** 狀態(僅取得) */
	public get state () : ReelRollState {
		return this._state;
	}
	/** 狀態 */
	private _state : ReelRollState = ReelRollState.IDLE;

	/** 停輪狀態 */
	private _stopState : ReelStopState = ReelStopState.NONE;

	/** 是否暫停中 */
	private _isPausing : boolean = true;

	/*== 滾輪表資料 ===========*/
	
	/** 滾輪表資料 */
	public stripData : ReelStripData = null;

	/*== 滾動開關 ============*/

	/** 是否滾動中 */
	private _isRolling : boolean = false;

	/** 是否呼叫停止 */
	private _isCallStop : boolean = false;

	/*== 位置移動 ============*/
	   
	/** 實際速度 (移動幾格的百分比/每秒) */
	private _speed : number = 0;
	

	/** 原本位置 (格數位置)*/
	public get currentPos () : number {
		return this._currentPos;
	}
	/** 原本位置 (格數位置)*/
	private _currentPos : number = 0;

	/** 位置是否存在 */
	public get isPosExist () : boolean {
		return this._isPosExist;
	}
	private _isPosExist : boolean = false;

	/*== 停輪資訊 ============*/

	/** 停輪格 */
	private _stopPos : number = 0;
	/** 停輪位置 */
	private _stopEndPos : number = 0;
	/** 剩餘停輪距離 */
	private _leftDeltaToStop : number = 0;
	/** 預備交接位置 */
	private _leftToShiftPos : number = 0;

	/**== 曲線軌 ======*/

	/** 停輪曲線 目前播放時間 */
	private _stopCurve_currentTime : number = 0;
	/** 開始停輪時的位置 */
	private _stopStartPos : number = 0;

	/**== 盤面相關 ====*/

	/** 盤面範圍 */
	private _resultRange : number[];
	/** 盤面長度 */
	private _resultRangeLength : number = 0;


	/*== Component ================================================*/

	/** 曲線資料 */
	@property(cc.JsonAsset)
	public stopCurveJson : cc.JsonAsset = null;
	/** 停輪曲線 */
	public stopCurve : CurveData;

	/** 混合曲線資料 */
	@property(cc.JsonAsset)
	public mixCurveJson : cc.JsonAsset = null;
	/** 混合 */
	public mixCurve : CurveData;

	/*== Event ====================================================*/

	/** 當滾動 */
	public onSpin : Event = new Event();

	/** 當開始停輪 */
	public onStop : Event = new Event();

	/** 當停輪 */
	public onStopDone : Event = new Event();

	/*== Cocos LifeCycle ==========================================*/
	
	// LIFE-CYCLE CALLBACKS:

	onLoad () {

		this.init();

			// PauseResumeTool.onPause.add(()=>{
			// 	cc.log(this);
			// });
			PauseResumeTool.onKeyDown.add((evt, key)=>{
				if (key == cc.macro.KEY.y) {
					cc.log(this.view);
				}
			});
			
		
	}
	
	start () {
		
	}

	/*
	##     ## ########  ########     ###    ######## ######## 
	##     ## ##     ## ##     ##   ## ##      ##    ##       
	##     ## ##     ## ##     ##  ##   ##     ##    ##       
	##     ## ########  ##     ## ##     ##    ##    ######   
	##     ## ##        ##     ## #########    ##    ##       
	##     ## ##        ##     ## ##     ##    ##    ##       
	 #######  ##        ########  ##     ##    ##    ######## 
	*/
	update (dt) {
		
		if (this._isPausing) return;

		//== 變更停輪狀態 ==================================================

		// 若 非滾動中 則 返回
		if (!this._isRolling) return;

		// 一般移動量
		let normalMoveDelta = this._speed * dt * Time.timeScale;
		
		// 移動距離
		let moveDelta = (normalMoveDelta * this.rollDirection);

		// 滾動方向是否正向
		let isRollDirPostive = this.rollDirection > 0;

		// 預計 此幀 結束後的當前位置
		let previewCurrent = this._currentPos + moveDelta;
		previewCurrent = Mathf.loop(previewCurrent, this.stripData.min, this.stripData.max);

		// 覆寫當前位置 (不採用移動量計算，直接設置)
		let overrideNewPos = null;

		// 快捷 =======
		
		// 視圖
		let view = this.view;

		//== 檢查 停輪狀態 =====================================

		// 若 停輪狀態 為 待機中
		if (this._stopState == ReelStopState.NONE) {

			// 若 已經被呼叫停輪
			if (this._isCallStop) {
				this._isCallStop = false;

				// 設置剩餘停下距離==========

				// 當前位置到準備可以整格計算的位置
				
				// 最後一格 的 最後一個邊緣位置
				let lastColLastBorderPos;
				
				// 取得 最後顯示的當前顯示格
				let colOffsets = [];
				// 邊界位置
				let borderPos = this._currentPos + (isRollDirPostive ? view.displayRange_forward:-view.displayRange_back);

				// 目前所有可見格 (顯示區域中 與 暫存格)
				let visibleCols = this.getVisibles();
				for (let each of visibleCols) {
					let data = each.data;
					// 取得 上緣/下緣 與 邊界位置 的 距離
					colOffsets.push({
						col:data,
						offset:Mathf.getOffsetsLoop(data.getTriggerRange()[isRollDirPostive?1:0], borderPos, this.stripData.min, this.stripData.max)[isRollDirPostive?0:1]
					});
				};

				// 排序
				colOffsets.sort((a,b)=>{
					return a.offset - b.offset;
				});

				// 最後一個顯示的格 
				let lastCol : ReelColData = colOffsets[0].col;
				// 的 最後一個邊緣位置
				lastColLastBorderPos = lastCol.getTriggerRange()[isRollDirPostive? 1:0];

				if (this.isDebug) cc.log(lastCol, this.view.requestMiddle(lastCol))

				// 準備要交接的位置 為 最後一格 的 最後一個邊緣位置 往 移動方向
				let prepareToShiftPos = lastColLastBorderPos - (view.displayRange_back * this.rollDirection)
				// 計算 離交接位置 的 剩餘距離
				this._leftToShiftPos = Math.abs(Mathf.getOffsetsLoop(this._currentPos, prepareToShiftPos, this.stripData.min, this.stripData.max)[isRollDirPostive?1:0]);

				// 轉換狀態為 準備交接
				this._stopState = ReelStopState.SHIFT;
				
				this.log("=CallStop==============")
				this.log("current", previewCurrent, "prepareToShiftPos:",prepareToShiftPos, "leftToShiftPos",this._leftToShiftPos)

			}
		}

		// 若 停輪狀態 為 交接期間
		if (this._stopState == ReelStopState.SHIFT) {

			// 此次計算後 預計剩餘距離
			let nextLeft = this._leftToShiftPos - normalMoveDelta;

			// 若 還有 剩餘距離
			if (nextLeft > 0) {
				// 改變剩餘距離
				this._leftToShiftPos = nextLeft;
			}
			// 若 已經沒有 剩餘距離
			else {

				// 修正 (目前還剩 的 剩餘距離)
				let leftFix = this._leftToShiftPos;
		
				// 當前顯示到可以停止的距離
				let displayToStop = this.stopDelayCol;
				
				// 曲線起點到終點的距離
				let curveStartEndDelta = Math.abs(this.stopCurve.getEndVal() - this.stopCurve.getStartVal()) * this.stripData.blockPerCol_forAnim;
				
				// 用長的那一個 作為 到停止的剩餘距離
				this._leftDeltaToStop = Mathf.max(displayToStop, curveStartEndDelta);

				// 預備交接位置 為 相對可以準備停輪的位置
				let shiftToPos_orin = Mathf.loop(this._stopPos - (this._leftDeltaToStop * this.rollDirection), this.stripData.min, this.stripData.max);

				// 確保 上方對齊=========

				// 找尋 預備交接位置 的 顯示中最新的格
				let colsAfterShift = this.stripData.getColsByTriggerRange(
					shiftToPos_orin - (view.displayRange_back - 0.0001),
					shiftToPos_orin + (view.displayRange_forward - 0.0001),
					shiftToPos_orin
				);
				
				// 只留 格的上緣 超過或等於 交接後顯示區上緣 (可貼齊) 的 格
				let shiftBorderPos = shiftToPos_orin + (isRollDirPostive ? view.displayRange_forward : -view.displayRange_back);
				colsAfterShift = colsAfterShift.filter((each)=>{
					let colRangePos = each.getTriggerRange()[isRollDirPostive?1:0];
					return colRangePos >= shiftBorderPos;
				});

				// 取 首個
				let firstCol = colsAfterShift[0];
				// 上緣位置
				let firstColBorderPos = firstCol.getTriggerRange()[isRollDirPostive?1:0];
				// 改要轉移的位置 為 該格 往下半個盤面
				let shiftToPos = firstColBorderPos + view.displayRange_back;

				if (this.isDebug) {
					cc.log("=shift=====")
					cc.log("colsAfterShift:", colsAfterShift, "firstCol",firstCol);
					cc.log("current:", this.currentPos, "stopPos", this._stopPos, "shiftToPos_orin:",shiftToPos_orin, "shiftToPos", shiftToPos, "fix:", leftFix, (shiftToPos - leftFix * this.rollDirection));
				}
				
				// 修正 還剩的剩餘距離
				shiftToPos -= leftFix * this.rollDirection;

				// 離停輪位置 的 剩餘距離 為 預備交界位置 到 停輪位置
				this._leftDeltaToStop = Math.abs(Mathf.getOffsetsLoop(shiftToPos, this._stopPos, this.stripData.min, this.stripData.max)[0]);

				// 轉移 並 交接當前顯示格 到 預備位置(較長的)
				this.shift(shiftToPos, {isForce:true});


				// 修正 因為超過修正而不小心被視為 轉移後 是 已經顯示中 的 格 =====

				// 取得 轉移後 被標為 已經顯示中 的 格
				let inViewCols = view.getInViewCols();
				let colsIdxAfterShift = colsAfterShift.map((each)=>{
					return each.idx;
				});

				for (let each of inViewCols) {
					// 若 不在 預定轉移後會顯示的格中
					if (colsIdxAfterShift.indexOf(each) == -1) {
						// 取消正在顯示中
						view.setInView(each, false);
					}
				}

				// ==========

				// 預覽的當前位置 為 交接後位置
				previewCurrent = shiftToPos;

				// 設 停輪狀態 為 等候入軌中
				this._stopState = ReelStopState.WAIT;

			}
		}

		// 若 停輪狀態 為 等候入軌中
		if (this._stopState == ReelStopState.WAIT) {
			
			// 是否準備好停輪
			let isReadyStop = false;

			// 減少 離停下的剩餘距離
			this._leftDeltaToStop -= normalMoveDelta;

			//== 檢查是否 進入入軌位置=============

			// 曲線起點 到 終點 距離
			let end = this.stopCurve.getEndVal();
			let start = this.stopCurve.getStartVal();
			let toEnd_curve = (end - start) * this.stripData.blockPerCol_forAnim * -1;//因為方便編輯曲線，數值增長方向為向下，所以要反轉 負數值 為 正

			// 若 此次移動完 已經不剩下任何距離
			let nextLeft = this._leftDeltaToStop - normalMoveDelta;
			if (this._leftDeltaToStop <= 0 || nextLeft <= 0) {

				// 過頭的量
				let over = Math.abs(this._leftDeltaToStop);

				// 要調整回去的量 為 曲線到終點的距離 + 過頭的量
				let fallback = toEnd_curve + over;
				
				// 覆寫新的位置 為 預計位置 減去 要調整回去的量
				overrideNewPos = previewCurrent - (fallback * this.rollDirection);
				// 確保循環在滾輪範圍內
				overrideNewPos = Mathf.loop(overrideNewPos, this.stripData.min, this.stripData.max);

				// 設置位置
				previewCurrent = overrideNewPos;
				this._currentPos = overrideNewPos;

				// 設 離停下剩餘距離 為 曲線到終點的距離
				this._leftDeltaToStop = toEnd_curve;
			}

			// 若 離停止點剩餘距離 < 曲線起點到終點距離 則 已經可以進入軌道
			if (this._leftDeltaToStop <= toEnd_curve){
				isReadyStop = true;
			}

			//==================================

			// 正式進入停輪
			if (isReadyStop) {

				// 滾輪狀態
				this._setState(ReelRollState.EASESTOP); 
				// 停輪狀態
				this._stopState = ReelStopState.ANIM;
				// 記錄開始停輪的位置
				this._stopStartPos = this._currentPos;
				
				// 停輪最終位置
				this._stopEndPos = this._stopPos;

				// 若 滾動方向為正 且 開始停滾位置 超過 最終停滾位置
				if (this.rollDirection > 0 && this._stopStartPos > this._stopEndPos) {
					// 則 開始停滾位置 倒回 一個滾輪的長度
					this._stopStartPos -= this.stripData.totalLength;
				}
				// 若 滾動方向為負 且 開始停滾位置 低於 最終停滾位置
				if (this.rollDirection < 0 && this._stopStartPos < this._stopEndPos) {
					// 則 開始停滾位置 推回 一個滾輪的長度
					this._stopStartPos += this.stripData.totalLength;
				}
				
				// 歸零 停輪曲線的當前時間
				this._stopCurve_currentTime = 0;
				

				if (this.isDebug) {
					this.log("=Start Stop=======");
					cc.log("stopFrom:", this._stopStartPos);
					cc.log("stopTo:", this._stopEndPos, "range", this.stripData.min, this.stripData.max);
					cc.log("previewCurrent[",previewCurrent,"]", "this._leftDeltaToStop[",this._leftDeltaToStop,"]" )
				}
			}

		}

		//== 依照狀態決定滾輪位置 =================================

		// 滾輪 的 新位置
		let showPos = this._currentPos;

		// 若 狀態 為 滾動中/起轉中/停輪中  則 依照速度 設置 一般位移位置
		if (this._state == ReelRollState.ROLLING || this._state == ReelRollState.EASEIN || ReelRollState.EASESTOP) {


			// 若 狀態 為 起轉中 則 改變速度
			if (this._state == ReelRollState.EASEIN) {
				// 加速
				this._speed = Mathf.moveToward(this._speed, this.speed, this.speed_acc * dt);

				// cc.log("_speed["+this._speed+"] to speed["+this.speed+"] add["+this.speed_acc * dt+"]");
				
				// 若 已達標準速度 則 設置狀態為 滾動中
				if (this._speed == this.speed) {
					this._setState(ReelRollState.ROLLING);
				}

			}

			// 依照移動量 設置 新位置
			let newPos = this._currentPos + moveDelta;
			if (overrideNewPos != null) {
				newPos = overrideNewPos;
			}
			newPos = Mathf.loop(newPos, this.stripData.min, this.stripData.max);

			// 改變位置
			this._currentPos = newPos;

			// 顯示位置 等同 位置
			showPos = this._currentPos;
		}

		// 若 狀態 為 停輪中 則 設置 新位置 為 曲線中位置
		if (this._state == ReelRollState.EASESTOP) {

			// 時間
			let time = this._stopCurve_currentTime;
			let time_percent = time / this.stopTotalTime;
			// 推進
			this._stopCurve_currentTime += dt;


			// 停輪曲線中 各時間點 的 位置值
			let startVal = this.stopCurve.getStartVal() * this.stripData.blockPerCol_forAnim;
			let endVal = this.stopCurve.getEndVal() * this.stripData.blockPerCol_forAnim;
			let currentVal = this.stopCurve.getVal(time) * this.stripData.blockPerCol_forAnim;

			// 當前位置 在 曲線起點到終點之間 的 相對百分比
			let percentInCurve =  (currentVal - startVal) / (endVal - startVal);

			// 從 開始停輪位置 到 停輪位置 取 百分比值 設為 新位置
			let curvedPos = Mathf.lerp(this._stopStartPos, this._stopEndPos, percentInCurve);

			// 顯示位置 為 當前位置 與 曲線中位置 依照 混合曲線 進行混合
			showPos = Mathf.lerp(this._currentPos, curvedPos, this._getMixFromCurve(time_percent));

			// 若 已達停輪總時間 則 停止
			if (time > this.stopTotalTime) {

				// 立刻停止
				this.stopNow();

				// 顯示位置 為 當前位置
				showPos = this._currentPos;

				this.log("=Stop===========");
				this.log("finalPos:", showPos);
			}

		}


		// 移動位置
		this.view.isMoving = this._isRolling;
		this.view.setPos(showPos);
		this.view.render({
			// 滾動方向
			rollDir: this.rollDirection,
		});

	}
	
	/*== Public Function ==========================================*/

	
	/** 是否滾動中 */
	public isRolling () : boolean {
		return this._isRolling;
	}

	
	/*== 設置 ====================*/

	/*
	#### ##    ## #### ######## 
	 ##  ###   ##  ##     ##    
	 ##  ####  ##  ##     ##    
	 ##  ## ## ##  ##     ##    
	 ##  ##  ####  ##     ##    
	 ##  ##   ###  ##     ##    
	#### ##    ## ####    ##    
	*/

	/** 初始化 */
	public async init () {

		// 讀取 停輪曲線
		this.stopCurve = CurveData.create(this.stopCurveJson.json);
		this.stopCurve.length = this.stopTotalTime;
		
		// 讀取 停輪混和曲線
		this.mixCurve = CurveData.create(this.mixCurveJson.json);

	}

	/** 設置 盤面範圍 */
	public setResultRange (range: number[]) {
		this._resultRange = range;
		this._resultRangeLength = Math.abs(range[1] - range[0]);
	}

	/** 取得 盤面範圍 */
	public getResultRange () : number[] {
		return this._resultRange;
	}

	/** 取得 盤面範圍 長度 */
	public getResultRangeLength () : number {
		return Math.abs(this._resultRange[1] - this._resultRange[0]);
	}


	/*
	 ######  ######## ########       ######  ######## ########  #### ########  
	##    ## ##          ##         ##    ##    ##    ##     ##  ##  ##     ## 
	##       ##          ##         ##          ##    ##     ##  ##  ##     ## 
	 ######  ######      ##          ######     ##    ########   ##  ########  
	      ## ##          ##               ##    ##    ##   ##    ##  ##        
	##    ## ##          ##         ##    ##    ##    ##    ##   ##  ##        
	 ######  ########    ##          ######     ##    ##     ## #### ##        
	*/

	/** 設置滾輪表 */
	public setStrip (stripData: ReelStripData) {
		this.stripData = stripData;
		this.view.setStrip(stripData);
	}

	/*== 操作 ====================*/

	/*
	 ######  ########  #### ##    ## 
	##    ## ##     ##  ##  ###   ## 
	##       ##     ##  ##  ####  ## 
	 ######  ########   ##  ## ## ## 
	      ## ##         ##  ##  #### 
	##    ## ##         ##  ##   ### 
	 ######  ##        #### ##    ## 
	*/

	/** 轉動 */
	public spin () : void {
		this._isRolling = true;
		this._isPausing = false;
		this._setState(ReelRollState.EASEIN);
		this._stopState = ReelStopState.NONE;

		// 事件
		this.onSpin.call();
	}


	/*
	 ######  ########  #######  ########  
	##    ##    ##    ##     ## ##     ## 
	##          ##    ##     ## ##     ## 
	 ######     ##    ##     ## ########  
	      ##    ##    ##     ## ##        
	##    ##    ##    ##     ## ##        
	 ######     ##     #######  ##        
	*/

	/** 停輪 */
	public stop (stopPos: number) : void {
		this._stopPos = stopPos;

		if ( this.state == ReelRollState.IDLE || this.state == ReelRollState.EASESTOP) {
			return;
		}

		this._isCallStop = true;

		// 事件
		this.onStop.call();

	}

	/** 立刻停輪 */
	public stopNow (stopPos: number = null) : void {

		// 若有指定
		if (stopPos != null) {
			this._stopPos = stopPos;
		}

		// 取消模糊
		let visibleCols = this.getVisibles();
		for (let each of visibleCols) {
			for (let eachObj of each.objs) {
				eachObj.setBlur(cc.Vec2.ZERO, true);
			}
		}

		// 設 滾動中 為 是
		this._isRolling = true;

		// 事件
		this.onStop.call();
		
		// 設 狀態 為 停止
		this._setState(ReelRollState.IDLE);
		this._stopState = ReelStopState.NONE;

		// 設 暫停中 為 是
		this._isPausing = true;

		// 設 呼叫停輪 為 否
		this._isCallStop = false;

		this._currentPos = this._stopPos;

		// 歸零 速度
		this._speed = 0;
		
		// 清除已經顯示 (讓 view渲染時 全部重建)
		this.view.clearInView();

		// 清空暫存
		this.view.clearTempCols();

		// 強制設置
		this.setPos(this._stopPos);

		// 設 滾動中 為 否
		this._isRolling = false;


		this.onStopDone.call();
	}


	/*
	########     ###    ##     ##  ######  ########            ########  ########  ######  ##     ## ##     ## ######## 
	##     ##   ## ##   ##     ## ##    ## ##                  ##     ## ##       ##    ## ##     ## ###   ### ##       
	##     ##  ##   ##  ##     ## ##       ##                  ##     ## ##       ##       ##     ## #### #### ##       
	########  ##     ## ##     ##  ######  ######              ########  ######    ######  ##     ## ## ### ## ######   
	##        ######### ##     ##       ## ##                  ##   ##   ##             ## ##     ## ##     ## ##       
	##        ##     ## ##     ## ##    ## ##                  ##    ##  ##       ##    ## ##     ## ##     ## ##       
	##        ##     ##  #######   ######  ########            ##     ## ########  ######   #######  ##     ## ######## 
	*/

	/** 暫停 */
	public pause () : void {
		if (this._isPausing) return;
		this._isPausing = true;
	}

	/** 復原 */
	public resume () : void {
		if (!this._isPausing) return;
		if (!this._isRolling) return;
		this._isPausing = false;
	}


	/* 
	 ######  ######## ########      ########   #######   ######  
	##    ## ##          ##         ##     ## ##     ## ##    ## 
	##       ##          ##         ##     ## ##     ## ##       
	 ######  ######      ##         ########  ##     ##  ######  
	      ## ##          ##         ##        ##     ##       ## 
	##    ## ##          ##         ##        ##     ## ##    ## 
	 ######  ########    ##         ##         #######   ######  
	*/

	/**
	 * 設置位置 (純粹位置，非停輪格)
	 * @param toPos 百分比位置 0,1,2
	 */
	public setPos (toPos: number) : void {
		this._currentPos = Mathf.loop(toPos, this.stripData.min, this.stripData.max);
		this._isPosExist = true;
		this.render();
	}

	/**
	 * 取得停輪格
	 */
	public getStopPos () : number {
		return this._stopPos;
	}

	/*
	 ######  ##     ## #### ######## ######## 
	##    ## ##     ##  ##  ##          ##    
	##       ##     ##  ##  ##          ##    
	 ######  #########  ##  ######      ##    
	      ## ##     ##  ##  ##          ##    
	##    ## ##     ##  ##  ##          ##    
	 ######  ##     ## #### ##          ##    
	*/

	/**
	 * 交接當前顯示格
	 * 1. 把舊格(當前顯示格)中介的obj交接給新格(以目標位置與當前位置尋找對應), 
	 * 2. 把新/舊格的runtimeArgs清空 (可能有更好解)
	 * 3. 把舊格args與runtimeArgs 以 runtimeArgs "temp" 交給新格的中介
	 * @param targetPos 目標位置
	 */
	public shift (targetPos: number, opts: Object = null) : void {
		if (opts == null) opts = {};

		// 是否強制
		let isForce = opts["isForce"];
		// 若 非強制 且 目前停輪狀態 不是 空狀態 則 返回
		if (!isForce && this._stopState != ReelStopState.NONE) return;

		// 滾輪表
		let stripData = this.stripData;
		// 指定滾輪表 
		let shiftToStripData = opts["stripData"];
		// 若 有指定滾輪表 則 設為滾輪表
		if (shiftToStripData) {
			stripData = shiftToStripData;
		}

		// 若位置還尚未存在
		if (this._isPosExist == false) {
		
			// 若 有指定滾輪表
			if (stripData != this.stripData) {
				this.setStrip(stripData);
			}

			// 設置位置
			this.setPos(targetPos);
		
			return;
		}

		if (this.isDebug) {cc.log("==shift===========================")}
		
		let self = this;

		// 更新 原有的暫存格 的 位置
		let tempCols = self.view.getTempCols();
		for (let each of tempCols) {
			let offset = Mathf.minAbs(...Mathf.getOffsetsLoop(this.currentPos, each.data.pos, this.stripData.min, this.stripData.max)); 
			let newColPos = Mathf.loop(targetPos + offset, stripData.min, stripData.max);
			
			// 誤差
			newColPos = Math.round(newColPos * 100) * 0.01;
			
			each.data.pos = newColPos;
		}

		// 交接 當前格資訊 讓 現有格子 被視為 已經是新的格子 以 維持原樣

		// 正在顯示中的格
		let inViewCols = self.view.getInViewCols();
		if (this.isDebug) { cc.log("current In View:",inViewCols); }

		// 每個當前正在顯示的格
		for (let colIdx of inViewCols) {

			// 舊的格資料
			let oldColData = this.stripData.getColByIdx(colIdx);
			if (oldColData == null) continue;
			
			// 舊的中介資料 (所有屬於該格的)
			let oldMiddle = self.view.requestMiddle(oldColData);
			if (oldMiddle.objs.length == 0) continue;

			// 以 舊格的位置+瞬移 去尋找 瞬移後的新格 的 位置 與 格資料
			let offset = Mathf.minAbs(...Mathf.getOffsetsLoop(this.currentPos, oldColData.pos, this.stripData.min, this.stripData.max)); 
			let newColPos = Mathf.loop(targetPos + offset, stripData.min, stripData.max);

			// 誤差
			newColPos = Math.round(newColPos * 100) * 0.01;

			// 新的暫時格
			let newColData = oldColData.getCopy();
			newColData.pos = newColPos;

			// if (this.isDebug) cc.log("shiftTemp:", oldColData.idx, "oldColPos:",oldColData.pos, "newColPos", newColPos);

			// 將 每個舊的中介資料中 的 格物件 放到 要轉移的
			let copy = new ColMiddle();
			copy.objs = oldMiddle.objs;
			copy.args = Objf.assign({}, oldMiddle.args);
			copy.runtimeArgs = oldMiddle.getRuntimeArgsCopy();
			copy.data = newColData;

			// 清空 舊中介 的 格物件 與 對應執行期參數
			oldMiddle.objs = [];
			oldMiddle.delRuntimeArgs(null, "temp");

			// 先清除 新中介 的 執行期參數
			// newMiddle.delRuntimeArgs(null, "temp");

			// 新增 格物件 至 暫時格 並 標示為已經顯示(避免被認定為isNew而重新設置原格物件的active)
			let tempColInfo : TempColInfo = new TempColInfo();
			tempColInfo.middle = copy;
			tempColInfo.isDisplay = true;

			self.view.addTempCol(newColData, tempColInfo);
		}


		// 若 有指定滾輪表
		if (stripData != this.stripData) {
			
			// 設置 新滾輪表資料
			self.setStrip(stripData);

		}
		
		// 每個轉移過去後顯示的格
		let shiftedInViewCols = this.stripData.getColsByTriggerRange(
			targetPos + Mathf.addAbs(this._resultRangeLength[0], -0.00001),
			targetPos + Mathf.addAbs(this._resultRangeLength[1], -0.00001), 
			targetPos
		);

		// 改變 為 正在顯示中
		for (let each of shiftedInViewCols) {
			self.view.setInView(each.idx, true);
		}

		// cc.log("shiftedInViewCols", shiftedInViewCols)

		// 設置位置
		this.setPos(targetPos);
	}
	

	/*== 資訊 ====================*/

	/*
	 ######  ######## ########     ######   #######  ##       
	##    ## ##          ##       ##    ## ##     ## ##       
	##       ##          ##       ##       ##     ## ##       
	 ######  ######      ##       ##       ##     ## ##       
	      ## ##          ##       ##       ##     ## ##       
	##    ## ##          ##       ##    ## ##     ## ##       
	 ######  ########    ##        ######   #######  ######## 
	*/

	/**
	 * 設置 格 資料
	 * @param col 
	 */
	public setCol (col: number, colData: ReelColData) : void {
		
		this.stripData.cols[col] = colData;

		this.render();
	}

	/*
	 ######   ######## ########     ######   #######  ##      
	##    ##  ##          ##       ##    ## ##     ## ##      
	##        ##          ##       ##       ##     ## ##      
	##   #### ######      ##       ##       ##     ## ##      
	##    ##  ##          ##       ##       ##     ## ##      
	##    ##  ##          ##       ##    ## ##     ## ##      
	 ######   ########    ##        ######   #######  ########
	*/

	/**
	 * 取得 格 資料
	 * @param col 
	 */
	public getCol (col: number) : ReelColData {
		return this.stripData.getColByIdx(col);
	}




	/*
	 ######   ######## ########    ########  ########  ######      ######   #######  ##        ######  
	##    ##  ##          ##       ##     ## ##       ##    ##    ##    ## ##     ## ##       ##    ## 
	##        ##          ##       ##     ## ##       ##          ##       ##     ## ##       ##       
	##   #### ######      ##       ########  ######    ######     ##       ##     ## ##        ######  
	##    ##  ##          ##       ##   ##   ##             ##    ##       ##     ## ##             ## 
	##    ##  ##          ##       ##    ##  ##       ##    ##    ##    ## ##     ## ##       ##    ## 
	 ######   ########    ##       ##     ## ########  ######      ######   #######  ########  ######  
	*/

	/**
	 * 取得 範圍內 的 盤面格
	 * @param start 起始位置 
	 * @param end 終點位置
	 * @param basePos 基準位置
	 */
	public getResultInRange (start: number, end: number, basePos: number = null) : ReelColData[] {
		if (!basePos) {
			basePos = this._stopPos;
		}

		let result = this.stripData.getColsByTriggerRange(basePos+start, basePos+end, basePos);
				
		return result;
	}

	/**
	 * 取得 位置上 的 盤面結果
	 * @param pos 
	 */
	public getResult (posList: number[], basePos: number = null) : ReelColData[] {
		if (!basePos) {
			basePos = this._stopPos;
		}
		
		let result = [];

		for (let each of posList) {
			let res = this.stripData.getColByTriggerPos(basePos+each);
			if (res != null) result.push(res);
		}

		return result;
	}

	

	/*
	########  ######## ##    ## ########  ######## ########  
	##     ## ##       ###   ## ##     ## ##       ##     ## 
	##     ## ##       ####  ## ##     ## ##       ##     ## 
	########  ######   ## ## ## ##     ## ######   ########  
	##   ##   ##       ##  #### ##     ## ##       ##   ##   
	##    ##  ##       ##   ### ##     ## ##       ##    ##  
	##     ## ######## ##    ## ########  ######## ##     ## 
	*/
	
	/** 渲染 */
	public render () : void {
		this.view.setPos(this._currentPos);
		this.view.render({
			// 滾動方向
			rollDir: this.rollDirection,
		});
	}

	/** 取得 顯示中的格中介 (包含暫存格) */
	public getVisibles () : ColMiddle[] {
		
		let view = this.view;

		let middles = this.view.getMiddles();
				
		let inViewCols = view.getInViewCols();

		// 排除掉
		middles = middles.filter((v)=>{
			let col : ReelColData = v.data;

			// 非正在顯示區域中的
			if (inViewCols.indexOf(col.idx) == -1) return false;

			// 沒有顯示的
			let middle = view.getMiddle(col.idx);
			if (middle.isAnyObjActive() == false) return false;

			return true;
		});


		// 加入暫時格
		let tempColInfos = view.getTempColInfos();
		// 排除掉
		tempColInfos = tempColInfos.filter((v)=>{
			
			// 沒有顯示的
			if (v.middle.isAnyObjActive() == false) return false;

			return true;
		});
		let tempColMiddles = tempColInfos.map((v)=>{
			return v.middle;
		});

		middles = middles.concat(tempColMiddles);

		return middles;
	}

	

	/*== Private Function =========================================*/


	/**
	 * 設置狀態
	 * @param state 狀態 
	 */
	private _setState (state: ReelRollState) : void {
		this._state = state;
		// cc.log("State : "+ReelState[state]);
	}

	/** 取得混和曲線中的混和值 */
	private _getMixFromCurve (time_percent: number) : number {
		if (this.mixCurve == null) return 1;
		else return this.mixCurve.getVal(time_percent);
	}

	private log (..._args) {
		if (_args.length == 0) return;
		if (this.isDebug) cc.log("", ..._args);
	}

}
	