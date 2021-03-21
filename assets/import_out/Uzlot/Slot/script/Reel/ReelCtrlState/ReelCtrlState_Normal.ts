import { State, Invoker } from "../../../../../Uzil/Uzil";
import { ReelCtrl } from "../../../index_Slot";

const {ccclass, property} = cc._decorator;

@ccclass
export class ReelCtrlState_Normal extends State {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 滾輪控制器 */
	private _reelCtrl : ReelCtrl = null;

	/** 註冊事件名稱 */
	private eventName : string = 'regFrom_state_normal';

	/** 轉輪 每輪時間差 */
	@property()
	public spinReelDelay_sec : number = 0.1;

	/** 轉輪 總時間 */
	@property()
	public spinDuring_sec : number = 2;
	private _spinTime_sec : number = 0;

	/** 自動停輪 每輪時間差 */
	@property()
	public autoStopReelDelay_sec : number = 0.5;

	/** 手動停輪 每輪時間差 */
	@property()
	public manualStopReelDelay_sec : number = 0;

	@property(cc.Button)
	public spinBtn : cc.Button = null;

	@property(cc.Button)
	public stopBtn : cc.Button = null;

	private _invokerTag_afterSpinUntilGotStopCols : string = "ReelCtrlState_Normal_afterSpin_untilHasStopCols";


	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/
	
	/*== 基本功能 =================*/

	/*== Protected Function =======================================*/

	/**
	 * 初始化
	 * @param user 使用者
	 */
	protected _init (user: any) : void {
		this._reelCtrl = user;


	}

	/** 進入狀態 */
	protected _onEnter () : void {
		let self = this;

		let reelCtrl = this._reelCtrl;
		let gameCtrl = reelCtrl.gameCtrl;

		// 註冊 行為 ====================

		// 當 請求滾動
		reelCtrl.onRequestSpin.add(()=>{

			if (reelCtrl.canSpin() == false) return;

			// 啟動 滾動中
			reelCtrl.turnSpinning();

			// 滾輪
			reelCtrl.spinAll(self.spinReelDelay_sec);

			// 清空 停輪位置
			reelCtrl.setStopPos(null);

			// 若 非自動停輪 則 跳出
			if (self.spinDuring_sec < 0) return;

			// 數秒後
			Invoker.once(()=>{

				// 若 停輪位置 存在
				if (gameCtrl.isReadyStop()) {
					// 停輪所有
					self._stopAll(self.autoStopReelDelay_sec);
				}
				// 否則
				else {

					// 開啟 每幀檢查
					Invoker.update(()=>{

						// 若 停輪位置 存在
						if (gameCtrl.isReadyStop()) {
							// 停輪所有
							self._stopAll(self.autoStopReelDelay_sec);
							// 關閉 每幀檢查
							Invoker.stop(self._invokerTag_afterSpinUntilGotStopCols);
						}

					}).tag(self._invokerTag_afterSpinUntilGotStopCols);

				}



			}, self.spinDuring_sec).tag("_autoStop");


		}).name(this.eventName);

		// 當 要求停輪
		reelCtrl.onRequestStop.add(()=>{
			
			if (self._reelCtrl.isSpinning == false) return;

			// 確保取消 每幀檢查
			Invoker.stop(self._invokerTag_afterSpinUntilGotStopCols);
			
			// 停輪所有
			self._stopAll(self.manualStopReelDelay_sec);

			// 開啟手動停輪
			reelCtrl.turnManualStop(true);
			
			// 取消自動停下
			Invoker.cancel("_autoStop");

		}).name(this.eventName);
		
	}

	/**
	 * 更新
	 * @param dt 每幀時間
	 */
	protected _onUpdate (dt: number) : void {
		
	}

	/** 離開狀態 */
	protected _onExit () : void {
		this._reelCtrl.onRequestSpin.remove(this.eventName);
		this._reelCtrl.onRequestStop.remove(this.eventName);
		// 確保取消 每幀檢查
		Invoker.stop(this._invokerTag_afterSpinUntilGotStopCols);
	}

	/*== Private Function =========================================*/

	private _stopAll (reelDelay_sec: number) : void {
		let reelContainer = this._reelCtrl.reelContainer;
		
		// 呼叫 開始停輪
		this._reelCtrl.stopBegin();

		// 每輪
		for (let row = 0; row < reelContainer.reels.length; row++) {
			// 若 有排入任務 但 還沒啟動的 則 立刻啟動
			if (this._reelCtrl.isReelInSpinTask(row) && this._reelCtrl.isReelSpinning(row) == false) {
				this._reelCtrl.spin(row, 0);
			}
		}

		// 每輪
		for (let row = 0; row < reelContainer.reels.length; row++) {
			// 停輪
			this._reelCtrl.stop(row, row * reelDelay_sec);
		}
	}

}
