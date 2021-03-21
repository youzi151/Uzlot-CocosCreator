import { State, Invoker } from "../../../../../Uzil/Uzil";
import { SpinCtrl } from "../../../index_Slot";

const {ccclass, property} = cc._decorator;

const valuesUser : string = "SpinCtrlState_aa";
const valuesPriority : number = 2;

const autoSpinOnReadyNextSpin = "regFrom_state_auto_onAllStopDone";


@ccclass
export class SpinCtrlState_Auto extends State {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/** 滾動 控制 */
	private _spinCtrl : SpinCtrl = null;


	/** 註冊事件名稱 */
	private _eventName : string = 'regFrom_state_auto';

	private _isDisablingAuto : boolean = false;

	/** 自動重新滾輪 時間延遲 */
	@property()
	public autoReSpinDelay_sec : number = 1;

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/
	
	/*== 基本功能 =================*/

	/*== Protected Function =======================================*/

	/**
	 * 初始化
	 * @param user 使用者
	 */
	protected _init (user: any) : void {
		this._spinCtrl = user;
	}

	/** 進入狀態 */
	protected _onEnter () : void {
		let self = this;

		let spinCtrl = this._spinCtrl;
		let spinUI = spinCtrl.spinUI;
		let gameCtrl = spinCtrl.gameCtrl;
		let reelCtrl = gameCtrl.reelCtrl;

		// 設 自動 按鈕 為 按下(啟用中)
		spinUI.autoBtn.target.color = cc.Color.GRAY;

		// 註冊 行為 ====================

		// 當 滾動 被按下 則 
		spinUI.onSpinClick.add(()=>{

			// 若不能再滾動 則 停止自動
			if (spinCtrl.gameCtrl.isSpinable() == false) {
				self._stopAuto();
				return;
			}

			// 滾動
			spinCtrl.spin();

			// 註冊 當 準備好下一次滾動
			spinCtrl.gameCtrl.onReadyNextSpin.remove(autoSpinOnReadyNextSpin);
			spinCtrl.gameCtrl.onReadyNextSpin.addOnce(()=>{

				// 若不能再滾動 則 停止自動
				if (spinCtrl.gameCtrl.isSpinable() == false) {
					self._stopAuto();
					return;
				}

				// 停隔數秒 自動續滾
				Invoker.once(()=>{

					// 若 不可以再滾動 則 停止自動
					if (gameCtrl.isSpinable() == false) {
						cc.log("gameCtrl.isSpinable() == false");
						return false;
					}

					// 開啟 滾動, 關閉 停輪
					// spinCtrl.lockInput({with: ["stop"], without: ["spin"]}, valuesUser, valuesPriority);
					
					spinUI.call_onSpinBtnClick();

				}, this.autoReSpinDelay_sec).tag(autoSpinOnReadyNextSpin);

			}).name(autoSpinOnReadyNextSpin);

			// 切換UI 為 滾動中
			spinUI.setSpinning(true, valuesUser, valuesPriority);

			// 開啟 停輪, 關閉 滾動
			// spinCtrl.lockInput({with: ["spin"], without: ["stop"]}, valuesUser, valuesPriority);


		}).name(self._eventName);
		

		// 當 自動 被按下
		spinUI.onAutoClick.add(()=>{
			
			// 鎖住 自動
			spinUI.lockInput({with:["auto"]}, valuesUser, valuesPriority);

			// 停止自動
			self._stopAuto();

		}).name(self._eventName);

		// 當 停輪 被按下 則 
		spinUI.onStopClick.add(()=>{

			// 停輪
			spinCtrl.stop();

			// 停止自動
			self._stopAuto();
			

		}).name(self._eventName);


		// 首次按下
		spinUI.isLock_SpinBtn.users.forEach((each)=>{
			cc.log(each)
		})
		spinUI.call_onSpinBtnClick();

	}

	/**
	 * 更新
	 * @param dt 每幀時間
	 */
	protected _onUpdate (dt: number) : void {
		
	}

	/** 離開狀態 */
	protected _onExit () : void {
		
		let spinUI = this._spinCtrl.spinUI;
		let gameCtrl = this._spinCtrl.gameCtrl;

		// 依照 開啟狀態 改變顏色
		spinUI.autoBtn.target.color = cc.Color.WHITE;

		// 停止 自動下一個滾動
		this._stopAutoNextSpin();

		// 放棄 操作控制
		this._spinCtrl.lockInput({without: ["spin", "stop", "auto"]}, valuesUser);

		spinUI.onAutoClick.remove(this._eventName);
		spinUI.onSpinClick.remove(this._eventName);
		spinUI.onStopClick.remove(this._eventName);

	}

	/*== Private Function =========================================*/

	private _stopAutoNextSpin () : void {
		
		// 取消 自動續滾
		Invoker.cancel(autoSpinOnReadyNextSpin);

		// 取消原本的 當全部停輪後 
		this._spinCtrl.gameCtrl.onReadyNextSpin.remove(autoSpinOnReadyNextSpin);

	}

	private _stopAuto () : void {
		let self = this;

		if (this._isDisablingAuto) return;
		this._isDisablingAuto = true;
		
		let spinCtrl = this._spinCtrl;
		let spinUI = spinCtrl.spinUI;
		let gameCtrl = spinCtrl.gameCtrl;
		let reelCtrl = gameCtrl.reelCtrl;
		
		// 停止 自動下一個滾動
		this._stopAutoNextSpin();

		// 改變顏色
		spinUI.autoBtn.target.color = cc.Color.WHITE;

		// 設置 切換狀態行為
		let changeState = ()=>{
		
			// 切換UI
			spinUI.setSpinning(null, valuesUser);
			
			// 關閉 停輪, 開啟 滾動
			spinCtrl.lockInput({with: ["stop"], without: ["spin", "auto"]}, valuesUser, valuesPriority);

			// 改變狀態
			spinCtrl.stateCtrl.go("normal");

			self._isDisablingAuto = false;

		};

		// 依照是否在滾動中 直接執行 或 等候時機執行 切換狀態
		
		// 若 還在滾動中
		if (reelCtrl.isSpinning) {
			
			// 等全部停輪後
			spinCtrl.gameCtrl.onReadyNextSpin.add(()=>{
				changeState();
			}).name(autoSpinOnReadyNextSpin);

		} 
		// 否則 直接執行
		else {
			changeState();
		}
		
	}

}
