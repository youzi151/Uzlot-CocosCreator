import { State } from "../../../../../Uzil/Uzil";
import { SpinCtrl } from "../../../index_Slot";

const {ccclass, property} = cc._decorator;

const valuesUser : string = "SpinCtrlState";
const valuesPriority : number = 2;

@ccclass
export class SpinCtrlState_Normal extends State {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/** 滾動 控制 */
	private _spinCtrl : SpinCtrl = null;


	/** 註冊事件名稱 */
	private _eventName : string = 'SpinCtrlState_normal';
	private _onReelStopEventName = "SpinCtrlState_normal_onAllStopDone";

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
		let spinUI = this._spinCtrl.spinUI;

		// 註冊 行為 ====================

		// 當 自動 被按下
		spinUI.onAutoClick.add(()=>{
			spinCtrl.stateCtrl.go("auto");
		}).name(self._eventName);

		
		// 當 滾動 被按下 則 
		spinUI.onSpinClick.add(()=>{

			// 若 不能滾動 則 返回
			if (spinCtrl.gameCtrl.isSpinable() == false) return;

			// 滾動
			spinCtrl.spin();

			// 當全部停輪後
			spinCtrl.gameCtrl.onReadyNextSpin.add(()=>{

				// 放棄控制 滾動中 UI
				spinUI.setSpinning(null, valuesUser);
				
				// 關閉 停輪, 開啟 滾動
				spinCtrl.lockInput({with: ["stop"], without: ["spin", "auto", "turbo"]}, valuesUser, valuesPriority);

			}).name(self._onReelStopEventName);

			// 切換UI 到 滾動中
			spinUI.setSpinning(true, valuesUser, valuesPriority);

			// 開啟 停輪, 關閉 滾動
			spinCtrl.lockInput({with: ["spin", "auto", "turbo"], without: ["stop"]}, valuesUser, valuesPriority);


		}).name(self._eventName);
		
		// 當 停輪 被按下 則 
		spinUI.onStopClick.add(()=>{

			// 停輪
			spinCtrl.stop();

		}).name(self._eventName);

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
		spinUI.onAutoClick.remove(this._eventName);
		spinUI.onSpinClick.remove(this._eventName);
		spinUI.onStopClick.remove(this._eventName);
		this._spinCtrl.gameCtrl.onReadyNextSpin.remove(this._onReelStopEventName);
	}

	/*== Private Function =========================================*/

	private _spinAll (reelDelay_sec: number) : void {
		

	}

	private _stopAll (reelDelay_sec: number) : void {
		
		
	}

}
