import { RandomRange, i18n, Invoker, Mathf } from "../../Uzil/Uzil";
import { ReelContainer, ReelRowViewPass } from "./index_Reel";
import { SymbolCode, SlotStrip } from "../Slot/index_Slot";
import { ReelObj } from "./script/ReelObj";
import { ReelState } from "./script/ReelConst";


const {ccclass, property} = cc._decorator;

@ccclass
export default class Example_Reel extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	public isSpinning : boolean = false;

	/** 延遲 */
	@property(ReelContainer)
	public reelContainer : ReelContainer = null;
	
	@property(ReelRowViewPass)
	public pass3d : ReelRowViewPass = null;



	@property(cc.Label)
	public spinBtnText : cc.Label = null;



	@property(cc.Button)
	public turboBtn : cc.Button = null;

	public isTurboMode : boolean = false;



	@property(cc.Button)
	public autoBtn : cc.Button = null;

	public isAuto : boolean = false;

	public isAutoSpinning : boolean = false;



	@property(cc.Button)
	public display3DBtn : cc.Button = null;

	public is3DMode : boolean = false;


	@property(ReelRowViewPass)
	public viewPass3DList : ReelRowViewPass[] = [];

	public langs : string[] = ["cn", "en"];
	private _lang : string = "cn";

	@property(cc.Button)
	public sameResultBtn : cc.Button = null;
	private _isSameResult : boolean = false;
	
	/** 滾輪表 */
	public get strip () : SymbolCode[][] {
		return SlotStrip.mainGame;
	}
	
	/** 結果 目標範圍 */
	public resultTarget : number[][] = [
		[-1, 0, 1],
		[-1, 0, 1],
		[-1, 0, 1],
		[-1, 0, 1],
		[-1, 0, 1]
	];
	
	public nextSpinIdx : number = 0;
	public nextStopIdx : number = 0;

	public stopCols : number[] = [];
	private _lastStopCols : number[] = [];

	public isForceAllStopping : boolean = false;

	@property(cc.Node)
	public worldPosTestLocator : cc.Node[] = [];

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	// onLoad () {}

	start () {
		let self = this;
		let roller = this.reelContainer;


		// 設置滾輪表
		roller.setStrip(this.strip);


		// 初始化 測試變數
		this._reset();

		// 設置初始位置
		roller.setPos(this.stopCols);


		// 多語系測試
		// this.scheduleOnce(()=>{
		// 	i18n.setLanguage("en");
		// }, 5);


		


		// 鍵盤按鍵
		cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, (event)=>{

			// 按下 A
			if (event.keyCode == cc.macro.KEY.a) {

				for (let each of this.reelContainer.reels) {

					let view = each.getReelRow().view;

					if (view.showPasses.length == 3) {
						view.showPasses.push(this.pass3d);
						break;

					}
				}

			}

			// 按下 Space
			if (event.keyCode == cc.macro.KEY.space) {
				this.onEachSpinBtnClick();
			}

		}, this);

		// 最後一輪停下時，重置滾動序號
		roller.onAllStopDone.add(()=>{			

			let strResult = [];
			let stopColRes = [];
			let result = roller.getResultSymbols(self.resultTarget, self.stopCols);
		
			for (let row = 0; row < result.length; row++) {
				let reel_str = [];
				let reel = result[row];
				for (let col = 0; col < result.length; col++) {
					let colRes = SymbolCode[reel[col]];
					reel_str.push(colRes);
					if (col == 1) {
						stopColRes.push(colRes)
					}
				}
				strResult.push(reel_str);
			}

			cc.log("result:");
			// cc.log(strResult);
			cc.log(stopColRes);


			self.isSpinning = false;

			// 若 開啟自動 則 呼叫再轉
			if (self.isAuto) {

				let againTime = this.isTurboMode ? 0.25:1;
				Invoker.once(()=>{
					self._reset();
					self._startSpin();
				}, againTime).tag("spinAgain");

			}


		});


		// 測試 位置定位

		let locatorIdx = 0;
		let isContinue = true;
		let reelsColsWorldPos = roller.getColWorldPos(roller.getResultCols(this.resultTarget));
		for (let row = 0; row < reelsColsWorldPos.length && isContinue; row++) {
			
			let eachReel = reelsColsWorldPos[row];
			for (let col = 0; col < eachReel.length; col++) {

				let eachColWorldPos = eachReel[col];
				
				if (locatorIdx >= this.worldPosTestLocator.length) {
					isContinue = false;
					break;
				}

				let locator = this.worldPosTestLocator[locatorIdx];

				let posForLocator = locator.parent.convertToNodeSpaceAR(eachColWorldPos);

				locator.setPosition(posForLocator);

				locatorIdx++;

			}

		}
	

	}

	update (dt) {

	}

	
	/*== Public Function ==========================================*/
	
	public onSpinBtnClick() : void {
		let self = this;

		let roller = this.reelContainer;

		let firstReel = roller.reels[0]; 
		let lastReel = roller.reels[roller.reels.length-1];

		// 若為自動模式下
		if (this.isAuto && this.isAutoSpinning) {
			// 取消自動
			this._setAuto(false);
			return;
		}

		// 若是 停轉狀態
		if ( firstReel.state == ReelState.IDLE
			&& lastReel.state == ReelState.IDLE) {

			this._reset();

			this._startSpin();

		} 
		// 若 滾動中 但 尚未啟動 強制停輪中
		else if (!this.isForceAllStopping){
			
			// 啟動 強制停輪中
			this.isForceAllStopping = true;
						
			// 剛完全停輪時 關閉強制停輪中
			roller.onAllStopDone.addOnce(()=>{
				self.isForceAllStopping = false;
			});

			// 開始停輪
			this._startStop();
		
		} else {
			// cc.log(ReelState[firstReel.state]);
			// cc.log(ReelState[lastReel.state]);
			// cc.log(lastReel.getReelRow())
			// cc.log("isForceAllStopping", this.isForceAllStopping);
		}

	}

	public onEachSpinBtnClick () : void {
		let roller = this.reelContainer;

		if (!this.isSpinning) {
			this._reset();	
		}

		if (this.nextSpinIdx < roller.reels.length) {
			this._spinNext();
		} else if (this.nextStopIdx < roller.reels.length) {
			this._stopNext();
		}
	}

	public onTurboBtnClick () : void {
		this.isTurboMode = !this.isTurboMode;

		if (this.isTurboMode) {
			this.turboBtn.target.color = cc.Color.GRAY;
		} else {
			this.turboBtn.target.color = cc.Color.WHITE;
		}
	}

	public onAutoBtnClick () : void {
		this._setAuto(!this.isAuto);

	}

	public on3DBtnClick () : void {
		this.is3DMode = !this.is3DMode;

		if (this.is3DMode) {
			this.display3DBtn.target.color = cc.Color.GRAY;
		} else {
			this.display3DBtn.target.color = cc.Color.WHITE;
		}

		for (let each of this.viewPass3DList) {

			each.isEnabled = this.is3DMode;

			this.reelContainer.render();

		}

	}

	public oni18nBtnClick () : void {
		let next = Mathf.loop(this.langs.indexOf(this._lang)+1, 0, this.langs.length-1);
		this._lang = this.langs[next];

		i18n.setLanguage(this._lang)

	}


	public onSameResultBtnClick () : void {
		this._isSameResult = !this._isSameResult;

		if (this._isSameResult) {
			this.sameResultBtn.target.color = cc.Color.GRAY;
		} else {
			this.sameResultBtn.target.color = cc.Color.WHITE;
		}

	}


	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	private _setAuto (isAuto: boolean) : void {
		this.isAuto = isAuto;

		if (this.isAuto) {

		} else {
			Invoker.cancel("spinAgain");
			this.isAutoSpinning = false;
			this.spinBtnText.string = "Spin";
		}
		
		if (this.isAuto) {
			this.autoBtn.target.color = cc.Color.GRAY;
		} else {
			this.autoBtn.target.color = cc.Color.WHITE;
		}
	}

	private _spinNext () : void {
		let roller = this.reelContainer;

		if (this.nextSpinIdx > roller.reels.length-1) return;
				
		let reel = roller.reels[this.nextSpinIdx];
		reel.spin();

		this.isSpinning = true;
		// cc.log("Spin:",this.nextSpinIdx);

		this.nextSpinIdx++;
	}

	private _stopNext () : void {
		let roller = this.reelContainer;

		if (this.nextStopIdx > roller.reels.length-1) return;
				
		let reel = roller.reels[this.nextStopIdx];

		let stopCol = this.stopCols[this.nextStopIdx];

		reel.stop(stopCol);

		// cc.log("Stop:",this.nextStopIdx);

		this.nextStopIdx++;
	}

	/** 開始轉動並自動停下 */
	private _startSpin () : void {
		let self = this;
		let firstReel = this.reelContainer.reels[0]; 

		this._spinAll(0.1);

		this.isSpinning = true;

		if (this.isAuto) {
			this.isAutoSpinning = true;
			this.spinBtnText.string = "Stop";
		}

		if (this.isTurboMode == false) {
			
			Invoker.once(()=>{
				if (firstReel.state == ReelState.ROLLING) {
					self._stopAll(0.5);
				}
			}, 1.2).tag("autoStop");

		} else {
			Invoker.once(()=>{
				if (firstReel.state == ReelState.ROLLING) {
					self._stopAll(0);
				}
			}, 0).tag("autoStop");
		}

	}

	private _startStop () : void {
		let self = this;
		let roller = this.reelContainer;

		Invoker.cancel("autoStop");
		Invoker.cancel("eachStop");
			
		if (this.isTurboMode == false) {
			
			this._stopAll(0);

		} else {

			roller.setPos(this.stopCols);
			roller.stop(this.stopCols, /* delay */0, /* isStopImmediately */true);

		}

	}

	private _spinAll (reelDelay_sec: number) : void {
		// cc.log("_spinAll");
		let self = this;

		let roller = this.reelContainer;
		
		for (let idx = 0; idx < roller.reels.length; idx++) {
			let eachReel = roller.reels[idx];

			Invoker.once(
				
				()=>{
					eachReel.spin();
					// cc.log("eachSpin");
				}, 

				idx * reelDelay_sec
			).tag("eachSpin");

		}

	}

	private _stopAll (reelDelay_sec: number) : void {
		// cc.log("_stopAll");
		let self = this;

		let roller = this.reelContainer;
		let isRolling = false;

		let rollingCount = 0;

		Invoker.cancel("eachSpin");
		
		for (let idx = 0; idx < roller.reels.length; idx++) {
			let eachReel = roller.reels[idx];

			// 若 前面的滾輪 有 轉動中
			if (isRolling) {
				// 若 該滾輪尚未轉動
				if (eachReel.state == ReelState.IDLE) {
					// 強制轉動
					eachReel.spin();
				} 

				rollingCount++;

			}
			// 若 前面的滾輪 未有 轉動中
			else {
				// 若 該滾輪尚未轉動 視為已經轉動並停輪過
				if (eachReel.state == ReelState.IDLE) {
					continue;
				} else {
					isRolling = true;
					rollingCount++;
				}
			}

			let stopCol = this.stopCols[idx];
			
			Invoker.once(
				
				()=>{
					eachReel.stop(stopCol);
					// cc.log("eachStop");
				}, 

				(rollingCount-1) * reelDelay_sec
			).tag("eachStop");

		}
	}

	private _reset () : void {

		this.nextSpinIdx = 0;
		this.nextStopIdx = 0;

		if (!this._isSameResult) {
			this.stopCols = this._getRandomStopCols();
		}

	}
	
	private _getRandomStopCols () : Array<number> {
		let stopCols = []

		for (let idx = 0; idx < this.strip.length; idx++) {	
			let reelStrip = this.strip[idx];
			let random = new RandomRange(0, reelStrip.length-1).getInt();
			stopCols.push(random);
		}
		return stopCols;
	}


}

