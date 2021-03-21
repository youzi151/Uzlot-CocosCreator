import { State } from "../index_State";
import { Event } from "../../../Uzil";


const {ccclass, property} = cc._decorator;

@ccclass
export class StateCtrl extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	@property()
	public isShowDebug : boolean = false;

	/** 使用者 */
	public user : any = null;
	
	/** 是否鎖住狀態 */
	@property()
	public isLockState : boolean = false;
	
	/** 下一個狀態 */
	private _nextState : State = null;
	
	/** 預設狀態 */
	@property()
    public defaultState : string = "";

	/** 狀態 */
	@property(State)
	public states : Array<State> = [];

    /** 狀態 */
	public currentState : State = null;
	
	
	/*== Event ====================================================*/

	public onStateChange : Event = new Event();

	/*== Cocos LifeCycle ==========================================*/

	/*== Public Function ==========================================*/
	
	/**
	 * 初始化
	 * @param user 使用者
	 */
	public init (user: any = null) {
		
		this.user = user;

		// 預設狀態
        this.go(this.defaultState);
	}

	/**
	 * 設置狀態
	 * @param stateName 狀態名稱
	 */
	public go (stateName: string) : void {
		
		for (let each of this.states) {
			
			if (each.stateName != stateName) continue;

			this.goState(each);
			break;

		}
	}


	/**
	 * 設置狀態
	 * @param newState 狀態
	 */
    public goState (newState: State, isForce: boolean = false) : void {
		// 防呆
        if (!newState) return;
		if (this.currentState == newState) return;

		this._nextState = newState;

		if (this.isLockState && !isForce) {
			return;
		}

		let lastState = this.currentState;

		// 若 舊狀態存在 則 呼叫離開
        if (this.currentState) {
            this.currentState.onExit();
        }

		// 指定為新狀態
        this.currentState = newState;

        if (this.isShowDebug) {
			cc.log("[StateCtrl] goState : " + newState.stateName);
		}

        if (!newState.isInited) {
            newState.init(this.user);
        }

		newState.onEnter();
		
		// 事件
		this.onStateChange.call(lastState, newState);

	}

	/** 鎖住狀態 */
	public lockState () : void {
		this.isLockState = true;
	}

	/** 解鎖狀態 */
	public unlockState () : void {
		this.isLockState = false;

		// 依照選項 更新狀態
		this.updateState();

	}

	/** 依照選項更新狀態 */
	public updateState () : void {
		this.goState(this._nextState, true);
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

