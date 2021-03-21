import { Event, Values } from "../../../../Uzil/Uzil";

const {ccclass, property} = cc._decorator;


@ccclass
export class SpinUI extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/


	/** 滾動 按鈕 */
	@property(cc.Button)
	public spinBtn : cc.Button = null;

	/** 停輪 按鈕 */
	@property(cc.Button)
	public stopBtn : cc.Button = null;

	/** 自動 按鈕 */
	@property(cc.Button)
	public autoBtn : cc.Button = null;

	/** 快速 按鈕 */
	@property(cc.Button)
	public turboBtn : cc.Button = null;

	/** 是否開啟可滾動 */
	public isSpinning : Values = new Values(false);

	/** 是否 鎖住 */
	public isLock_SpinBtn : Values = new Values(false);
	public isLock_StopBtn : Values = new Values(false);
	public isLock_AutoBtn : Values = new Values(false);
	public isLock_TurboBtn : Values = new Values(false);


	/*== Event ====================================================*/

	/** 當 滾動 被按下 */
	public onSpinClick : Event = new Event();
	
	/** 當 停輪 被按下 */
	public onStopClick : Event = new Event();

	/** 當 自動 被按下 */
	public onAutoClick : Event = new Event();

	/** 當 快速 被按下 */
	public onTurboClick : Event = new Event();

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		
	}

	start () {
		
	}

	update (dt) {
		
		
	}

	/*== Event Function ===========================================*/

	/** 當 Spin 被按下 */
	public call_onSpinBtnClick () : void {
		if (this.isLock_SpinBtn.getCurrent()) return;
		this.onSpinClick.call();
	}

	/** 當 Stop 被按下 */
	public call_onStopBtnClick () : void {
		if (this.isLock_StopBtn.getCurrent()) return;
		this.onStopClick.call();
	}

	/** 當 Turbo 被按下 */
	public call_onTurboClick () : void {
		if (this.isLock_TurboBtn.getCurrent()) return;
		this.onTurboClick.call();
	}

	/** 當 自動 被按下 */
	public call_onAutoClick () : void {
		if (this.isLock_AutoBtn.getCurrent()) return;
		this.onAutoClick.call();
	}

	
	/*== Public Function ==========================================*/

	/**
	 * 鎖住操作
	 * @param options 
	 */
	 public lockInput (options: {with?:string[], without?:string[], all?:boolean}, user: string = null, priority: number = 0) : void {

		let all = options.all;
		if (all !== undefined) {
			this.lockSpinBtn(all, user, priority);
			this.lockStopBtn(all, user, priority);
			this.lockAutoBtn(all, user, priority);
			this.lockTurboBtn(all, user, priority);
		}

		let withOpt = options.with;
		if (withOpt) {
			if (withOpt.indexOf("spin") != -1) {
				this.lockSpinBtn(true, user, priority);
			}
			if (withOpt.indexOf("stop") != -1) {
				this.lockStopBtn(true, user, priority);
			}
			if (withOpt.indexOf("auto") != -1) {
				this.lockAutoBtn(true, user, priority);
			}
			if (withOpt.indexOf("turbo") != -1) {
				this.lockTurboBtn(true, user, priority);
			}
		}

		let withoutOpt = options.without;
		if (withoutOpt) {
			if (withoutOpt.indexOf("spin") != -1) {
				this.lockSpinBtn(false, user, priority);
			}
			if (withoutOpt.indexOf("stop") != -1) {
				this.lockStopBtn(false, user, priority);
			}
			if (withoutOpt.indexOf("auto") != -1) {
				this.lockAutoBtn(false, user, priority);
			}
			if (withoutOpt.indexOf("turbo") != -1) {
				this.lockTurboBtn(false, user, priority);
			}
		}

		this.updateLock();

	}

	/** 更新 */
	public updateLock () {
		this.spinBtn.interactable = !this.isLock_SpinBtn.getCurrent();
		this.stopBtn.interactable = !this.isLock_StopBtn.getCurrent();
		this.autoBtn.interactable = !this.isLock_AutoBtn.getCurrent();
		this.turboBtn.interactable = !this.isLock_TurboBtn.getCurrent();
	}

	/** 切換 滾動中 */
	public setSpinning (isSpinning: boolean, user: string = null, priority: number = 0) {
		if (user == null) {
			this.isSpinning.defaultValue = isSpinning;
		} else {
			if (isSpinning != null) {
				this.isSpinning.set(user, priority, isSpinning);
			} else {
				this.isSpinning.remove(user);
			}
		}

		// cc.log(user+" : "+priority+" to "+isSpinning)
		
		this.updateSpinStop();
	}

	/** 更新 滾動/停止 */
	public updateSpinStop () {
		let isSpinning = this.isSpinning.getCurrent();
		this.spinBtn.node.active = !isSpinning;
		this.stopBtn.node.active = isSpinning;
	}

	/** 鎖住 滾動 */
	public lockSpinBtn (isLock: boolean, user: string = null, priority: number = 0) : void {
		if (user == null) {
			this.isLock_SpinBtn.defaultValue = isLock;
		} else {
			if (isLock) {
				this.isLock_SpinBtn.set(user, priority, isLock);
			} else {
				this.isLock_SpinBtn.remove(user);
			}
		}
	}

	/** 鎖住 停輪 */
	public lockStopBtn (isLock: boolean, user: string = null, priority: number = 0) : void {
		if (user == null) {
			this.isLock_StopBtn.defaultValue = isLock;
		} else {
			if (isLock) {
				this.isLock_StopBtn.set(user, priority, isLock);
			} else {
				this.isLock_StopBtn.remove(user);
			}
		}
	}

	/** 鎖住 自動 */
	public lockAutoBtn (isLock: boolean, user: string = null, priority: number = 0) : void {
		if (user == null) {
			this.isLock_AutoBtn.defaultValue = isLock;
		} else {
			if (isLock) {
				this.isLock_AutoBtn.set(user, priority, isLock);
			} else {
				this.isLock_AutoBtn.remove(user);
			}
		}
	}

	/** 鎖住 滾動 */
	public lockTurboBtn (isLock: boolean, user: string = null, priority: number = 0) : void {
		if (user == null) {
			this.isLock_TurboBtn.defaultValue = isLock;
		} else {
			if (isLock) {
				this.isLock_TurboBtn.set(user, priority, isLock);
			} else {
				this.isLock_TurboBtn.remove(user);
			}
		}
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

