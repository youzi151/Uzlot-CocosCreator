import { StateCtrl, Event } from "../../../../Uzil/Uzil";
import { SpinCtrl, ReelCtrl, DrawCtrl, SlotUtil } from "../../index_Slot";
import { NetMod, ResultData, SpinResultData } from "../../../Net/index_Net";
import { WalletUI } from "../../../../WalletUI/script/WalletUI";
import { ReelRule } from "../../../Rule/index_Rule";
import { ReelColData, ReelStripData } from "../../../Reel/index_Reel";

const {ccclass, property} = cc._decorator;


@ccclass
export class GameCtrl extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 連線 模塊 */
	public netMod : NetMod = null;

	/** 滾動 控制 */
	@property(StateCtrl)
	public stateCtrl : StateCtrl = null;

	/** 滾動 控制 */
	@property(SpinCtrl)
	public spinCtrl : SpinCtrl = null;
	
	/** 滾輪 控制 */
	@property(ReelCtrl)
	public reelCtrl : ReelCtrl = null;

	/** 開獎 控制 */
	@property(DrawCtrl)
	public drawCtrl : DrawCtrl = null;

	/** 資產 */
	@property(WalletUI)
	public wallet : WalletUI = null;

	/*=========================================*/

	/** 是否滾動中 */
	public set isSpinning (val) {
		this._isSpinning = val;
	}
	public get isSpinning () : boolean {
		return this._isSpinning;
	}
	public _isSpinning : boolean = false;

	/** 是否加速 */
	public set isTurbo (val) {
		this._isTurbo = val;
	}
	public get isTurbo () : boolean {
		return this._isTurbo;
	}
	public _isTurbo : boolean = false;

	/** 是否準備好 停輪 */
	private _isReadyStop : boolean = false;

	/** 當前下注 */
	public bet : number = 30;

	/** 滾動結果 */
	public spinResult : SpinResultData;

	/** 滾輪表 */
	public stripTable : ReelStripData[] = null;

	private _spinWaitAndStopTag : string = "GameCtrl_spin_waitAndStop"


	/*== Event ====================================================*/

	/** 當 準備好停輪 */
	public onReadyStop : Event = new Event();

	/** 當 準備好下一個Spin */
	public onReadyNextSpin : Event = new Event();

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		this._onLoad();
	}
	async _onLoad () {

		let self = this;

		this.spinCtrl.gameCtrl = this;
		this.drawCtrl.gameCtrl = this;
		this.reelCtrl.gameCtrl = this;

		// 建立 連線模塊
		this.netMod = new NetMod();

		// 連接
		await this.netMod.connect();

		// 設置 玩家可用分數
		this.wallet.setBalance(this.netMod.player.credit);
		this.wallet.setBet(this.bet);
		
		// 狀態初始化
		this.stateCtrl.init(this);

	}

	start () {
		
	}

	update (dt) {
		
		
	}

	/*== Event Function ===========================================*/
	
	/*== Public Function ==========================================*/

	/** 是否可以滾動 */
	public isSpinable () : boolean {
		if (this.netMod.player.credit < this.bet) return false;
		return true;
	}

	/** 是否準備好停輪 */
	public isReadyStop () : boolean {
		return (this._isReadyStop && this.reelCtrl.stopPosList != null);
	}

	/** 滾動 */
	public async requestSpin () : Promise<boolean> {
		if (this.isSpinning) return false;

		let self = this;

		// 準備 ===============================

		// 此次滾動結果
		self.spinResult = null;
	
		// 下注額
		let bet = this.bet;

		// 下注後的可用分數
		let creditBeted = self.netMod.player.credit - bet;

		// 若無可用分數 則 返回 不成功
		if (creditBeted < 0) return false;

		// 滾動 ===============================

		this._isReadyStop = false;

		// 向 滾輪 請求滾動
		self.reelCtrl.requestSpin();

		// 若沒有進入 滾動中 則 返回 不成功
		if (self.reelCtrl.isSpinning == false) return false;
		
		// 設置下注
		self.wallet.setBet(bet);

		// 滾動結果
		let res : SpinResultData;

		// 向 連線 請求滾動結果
		try {
			res = await self.netMod.spin(bet);
		} catch (err) {
			cc.log(err)
			return false;
		}

		// 演出 ===============================

		// 設置 結果
		this.spinResult = res;

		// 設置 可用分數
		this.wallet.setBalance(creditBeted);

		// 滾動個別結果
		let isSuccese = this.spinEachResult(res.getMainResult());
		if (!isSuccese) return false;

		return true;
	}

	/** 滾動 */
	public spinEachResult (result: ResultData) : boolean {

		if (this.isSpinning) return false;
		
		// 若沒有進入 滾動中 則
		if (this.reelCtrl.isSpinning == false) {
			
			// 向 滾輪 請求滾動
			this.reelCtrl.requestSpin();

			// 若還是沒有進入 滾動中 則 返回 不成功
			if (this.reelCtrl.isSpinning == false) {
				return false;
			}
		}

		// 設置滾動狀態
		this.isSpinning = this.reelCtrl.isSpinning;

		// 設置 尚未準備好停輪
		this._isReadyStop = false;
		
		// 設置停輪位置
		this.reelCtrl.setStopPos(result.stopPosList);

		return true;
	}

	/** 停輪 */
	public stop () : void {
		if (this.isSpinning == false) return;
		
		let self = this;

		if (self.spinResult == null) return;
		
		// 請求停輪 (手動停輪)
		self.reelCtrl.requestStop();

	}
	
	/** 準備好下一個滾動 */
	public readyNextSpin () : void {
		
		this.isSpinning = this.reelCtrl.isSpinning;

		this.onReadyNextSpin.call();

	}

	/** 準備好停輪 */
	public readyStop () : void {
		this._isReadyStop = true;
		this.onReadyStop.call();
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

