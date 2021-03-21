import { i18n, i18nSetting } from "../index_i18n";

export class i18nPrefabSet {

	/*== Constructer ============================================= */

	constructor () {
		this.langID = i18nSetting.defaultLang;
		this.fallbackLangID = i18nSetting.defaultLang;
	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/** 關鍵字與字串 */
	public key2prefab : Map<string, cc.Prefab> = new Map<string, cc.Prefab>();
	
	/** 語言ID */
	public langID : string = null;

	/** 備選語言ID */
	public fallbackLangID : string = null;

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/
	
	/*==代換=========================================*/

	/**
	 * 代換
	 * @param key 關鍵字
	 * @param cb 回呼
	 * @returns cc.Prefab 立即回傳 (若可)
	 */
	public get (key: string, cb:(prefab: cc.Prefab)=>void) : cc.Prefab {

		if (this.key2prefab.has(key)) {
			let res = this.key2prefab.get(key);
			cb(res);
			return res;
		}

		i18n.prefabFallback(this.langID, this.fallbackLangID, key, (res)=>{
			cb(res);
		});

		return null;
	}

	/** 是否存在 */
	public has (key: string) : boolean {
		return this.key2prefab.has(key);
	}
	

	/** 被其他語言要求備選代換 */
	public fallback (fromLang: string, key: string, cb: (prefab: cc.Prefab)=>void) : cc.Prefab {
		if (this.key2prefab.has(key)) {
			let res = this.key2prefab.get(key);
			cb(res);
			return res;
		}

		if (fromLang == this.langID || fromLang == this.fallbackLangID) {
			return null;
		}

		return i18n.prefabFallback(this.langID, this.fallbackLangID, key, (res)=>{
			cb(res);
		});
	}
	
	/**
	 * 設置
	 * @param key 關鍵字
	 * @param val 代換文字值
	 */
	public set (key: string, prefab: cc.Prefab) : void {
		this.key2prefab.set(key, prefab);
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

