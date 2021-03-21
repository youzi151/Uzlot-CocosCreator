import { Event } from "../../../Uzil/Uzil";
import { ReelStripData } from "../../Reel/index_Reel";
import { GameClient, OfflineClient, PlayerData, SpinResultData } from "../index_Net";

const {ccclass, property} = cc._decorator;

export class NetMod {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/** 是否為 開發環境 */
	public static isDev : boolean = false;

	/* 參數集 */
	public static params = {
		default: {
			language: "zh-cn",
		},
		dev: {
			language: "zh-cn",
		}
	}

	/*== Member ===================================================*/

	/** 客戶端 */
	public client : GameClient = new OfflineClient();

	/** 玩家資訊 */
	public player : PlayerData = null;

	/** 滾輪表 */
	public stripTables : Map<string, ReelStripData[]> = null;

	/*== Event ====================================================*/

	/** 當滾輪表更新 */
	public onStripTableUpdate : Event = new Event();

	/*== Public Function ==========================================*/

	/** 連接 */
	public async connect () {
		let self = this;

		// 登入
		self.player = await self.client.connect();

		// 取得滾輪表
		self.stripTables = await self.client.getStripTables();
		self.onStripTableUpdate.call(self.stripTables);

		// 註冊 當滾輪表更新
		self.client.onStripTableUpdate((err, res)=>{
			
			if (err) return;

			self.onStripTableUpdate.call(res);

		});

		// 當 斷開
		self.client.onDisconnect((err)=>{

		});

		// 當 報錯
		self.client.onError((err)=>{
			
		});

		cc.log("[NetMod]: connect success");

	}

	/** 滾動 */
	public async spin (bet: number) : Promise<SpinResultData> {
		
		let res : SpinResultData;
		
		try {
			res = await this.client.spin(bet);
		} catch (err) {
			cc.log(err);
			throw err;
		}

		this.player.credit = res.currentCredit;

		return res;
	}
	
	// 其他 =============================

	/** 取得滾輪表 (副本) */
	public getStripTable (name: string) : ReelStripData[] {
		let stripTable = this.stripTables.get(name);
		if (stripTable == null) return null;
		return stripTable.map((each)=>{
			return each.getCopy();
		});
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}