
const {ccclass, property} = cc._decorator;

@ccclass
export class State extends cc.Component {

    /*== Constructor ==============================================*/

	/*== Static ===================================================*/

    /*== Member ===================================================*/

    /** 狀態名稱 */
    @property()
    public stateName : string = "";
	
    /* 使用者 */
    public user : any = null;


	/** 是否啟用 */
    public get isActive () : boolean {
        return this._isActive;
    } 
    /** 是否啟用 */
    private _isActive : boolean = false;
    
    
    /** 是否已經初始化 */
    public get isInited () : boolean {
        return this._isInited;
    } 
    /** 是否已經初始化 */
    private _isInited : boolean = false;

	/*== Event ====================================================*/

    /*== Cocos LifeCycle ==========================================*/
    
    // LIFE-CYCLE CALLBACKS:

    // onLoad () {}

    start () {

    }

    update (dt) {
        if (!this.isActive) return;

        this.onUpdate(dt)
    }
    
    /*== Public Function ==========================================*/
    
    /*== 基本功能 =================*/

    /**
	 * 初始化
	 * @param user 使用者
	 */
    public init (user: any) : void {
		this.user = user;
        this._init(user);
        this._isInited = true;
    }

    /** 進入狀態 */
    public onEnter () : void {
        this._isActive = true;
        this._onEnter();
    }

    /**
	 * 更新
	 * @param dt 每幀時間
	 */
    public onUpdate (dt: number) : void {
        this._onUpdate(dt);
    }

    /** 離開狀態 */
    public onExit () : void {
        this._isActive = false;
        this._onExit();
    }
    

    /*== 其他功能 =================*/


	/*== Protected Function =======================================*/

    /**
	 * 初始化
	 * @param user 使用者
	 */
    protected _init (user: any) : void {
        
    }

    /** 進入狀態 */
    protected _onEnter () : void {
        
    }

    /**
	 * 更新
	 * @param dt 每幀時間
	 */
    protected _onUpdate (dt: number) : void {
        
    }

    /** 離開狀態 */
    protected _onExit () : void {

    }

	/*== Private Function =========================================*/

}
