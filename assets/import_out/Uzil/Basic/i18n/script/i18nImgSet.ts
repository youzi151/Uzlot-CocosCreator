import { i18n, i18nSetting } from "../index_i18n";

export class i18nImgSet {

	/*== Constructer ============================================= */

	constructor () {
		this.langID = i18nSetting.defaultLang;
		this.fallbackLangID = i18nSetting.defaultLang;
	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/** 關鍵字與字串 */
	public key2spriteFrame : Map<string, cc.SpriteFrame> = new Map<string, cc.SpriteFrame>();
	
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
	 * @returns cc.SpriteFrame 立即回傳 (若可)
	 */
	public get (key: string, cb:(spriteFrame: cc.SpriteFrame)=>void) : cc.SpriteFrame {

		if (this.key2spriteFrame.has(key)) {
			let res = this.key2spriteFrame.get(key);
			cb(res);
			return res;
		}

		i18n.imgFallback(this.langID, this.fallbackLangID, key, (res)=>{
			cb(res);
		});

		return null;
	}

	/** 是否存在 */
	public has (key: string) : boolean {
		return this.key2spriteFrame.has(key);
	}
	

	/** 被其他語言要求備選代換 */
	public fallback (fromLang: string, key: string, cb: (spriteFrame: cc.SpriteFrame)=>void) : cc.SpriteFrame {
		if (this.key2spriteFrame.has(key)) {
			let res = this.key2spriteFrame.get(key);
			cb(res);
			return res;
		}

		if (fromLang == this.langID || fromLang == this.fallbackLangID) {
			return null;
		}

		return i18n.imgFallback(this.langID, this.fallbackLangID, key, (res)=>{
			cb(res);
		});
	}
	
	/**
	 * 設置
	 * @param key 關鍵字
	 * @param val 代換文字值
	 */
	public set (key: string, spriteFrame: cc.SpriteFrame) : void {
		this.key2spriteFrame.set(key, spriteFrame);
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

