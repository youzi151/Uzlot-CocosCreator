
import { i18nSetting, i18nTextSet, i18nImgSet, i18nPrefabSet } from "../index_i18n";
import { Event, UrlArgs, Async } from "../../../Uzil";

export enum i18nState {
	NONE, LOADING, LOADED
}

export class i18n {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Static Member ============================================*/

	/** 狀態 */
	public static state : i18nState = i18nState.NONE;

	/** 當前語言 */
	public static currentLang : string = null;

	/** 語言ID與文字集合 */
	public static langID2TextSet : Map<string, i18nTextSet> = new Map<string, i18nTextSet>();
	/** 語言ID與圖片集合 */
	public static langID2ImgSet : Map<string, i18nImgSet> = new Map<string, i18nImgSet>();
	/** 語言ID與物件集合 */
	public static langID2PrefabSet : Map<string, i18nPrefabSet> = new Map<string, i18nPrefabSet>();

	/*== Event ====================================================*/

	/** 當切換語言 */
	public static onChange : Event = new Event();

	
	/*== Static Function ==========================================*/

	/** 取得當前文字集合 */
	public static getCurrentTextSet () : i18nTextSet {
		return i18n.getTextSet(i18n.currentLang);
	}
	/**
	 * 取得文字集合
	 * @param langID 語言名稱
	 */
	public static getTextSet (langID: string) : i18nTextSet {
		if (i18n.langID2TextSet.has(langID)){
			return i18n.langID2TextSet.get(langID);
		}else{
			return null;
		}
	}


	/** 取得當前圖片集合 */
	public static getCurrentImgSet () : i18nImgSet {
		return i18n.getImgSet(i18n.currentLang);
	}
	/** 
	 * 取得圖片集合
	 * @param langID 語言名稱
	 */
	public static getImgSet (langID: string) : i18nImgSet {
		if (i18n.langID2ImgSet.has(langID)){
			return i18n.langID2ImgSet.get(langID);
		}else{
			return null;
		}
	}

	/** 取得當前物件集合 */
	public static getCurrentPrefabSet () : i18nPrefabSet {
		return i18n.getPrefabSet(i18n.currentLang);
	}
	/** 
	 * 取得物件集合
	 * @param langID 語言名稱
	 */
	public static getPrefabSet (langID: string) : i18nPrefabSet {
		if (i18n.langID2PrefabSet.has(langID)){
			return i18n.langID2PrefabSet.get(langID);
		}else{
			return null;
		}
	}

	/**
	 * 初始化
	 * @param onDone 當讀取完成
	 */
	public static init (onDone?: ()=>void) : void {
		// 若 已讀取 則 直接呼叫 當讀取完畢
		if (i18n.state == i18nState.LOADED) {
			if (onDone) onDone();
			return;
		}
		
		// 若 未讀取 或 讀取中 則 註冊 當讀取完畢
		if (onDone) {
			i18n.onChange.addOnce(()=>{
				onDone();
			});
		}

		// 若 未讀取 則
		if (i18n.state == i18nState.NONE) {

			// 載入語言定義
			let langDefine = i18nSetting.langDefine;
			for (let lang in langDefine){
				this.regLang(lang, lang["fallback"]);
			}
			
			// 先取預設語言
			let lang = i18nSetting.defaultLang;
	
			// 若 url參數有指定 則 覆蓋
			let urlLang = UrlArgs.get("lang");
			if (urlLang != null) {
				lang = urlLang;
			}
	
			// 設置 語言
			i18n.setLanguage(lang);

		}

	}

	/**
	 * 設置語言
	 * @param langID 語言名稱
	 */
	public static setLanguage (langID: string) { 
		let self = this;
		
		// 若 讀取中 則 設置讀取完後，再加載其他語言
		if (i18n.state == i18nState.LOADING) {
			
			i18n.onChange.addOnce(()=>{
				i18n.setLanguage(langID);
			});
			return;

		}

		// 若 已讀取 則 ============

		// 設 當前語言 為 指定語言
		i18n.currentLang = langID;

		// 設置 讀取中
		i18n.state = i18nState.LOADING;
		
		Async.parallel(
			[
				// 讀取文字
				(cb)=>{
					cc.loader.loadResDir("i18n/"+langID+"/text/", cc.JsonAsset, (err, assets, urls)=>{
						let textSet = new i18nTextSet();

						// 每個json檔
						for (let each of assets) {

							let json = (each as cc.JsonAsset).json;

							// 註冊 每個 索引 與 內文
							for (let key in json) {
								self.regText(langID, key, json[key]);
							}

						}

						cb();
					});
				},

				// 讀取圖像
				(cb)=>{
					let dir = "i18n/"+langID+"/img/";
					cc.loader.loadResDir(dir, cc.SpriteFrame, (err, assets, urls)=>{

						let imgSet = new i18nImgSet();

						// 註冊 每個 索引 與 圖片
						for (let idx = 0; idx < assets.length; idx++) {
							let spriteFrame = assets[idx];
							let url = urls[idx];
							let name = url.substring(dir.length);

							self.regImg(langID, name, spriteFrame);
						}

						cb();
					});
				}
			],
			function final (err, results) {
				i18n.state = i18nState.LOADED;
				i18n.onChange.call();
				// cc.log("[i18n]: change lang to "+langID+" // i18n.state:"+i18nState[i18n.state]);
			}
		);

	}

	/*==代換=========================================*/

	/**
	 * 文字代換
	 * @param key 關鍵字
	 * @param cb 回呼
	 * @returns string 立即回傳 (若可)
	 */
	public static text (key: string, cb?:(str: string)=>void) : string {
		if (i18n.state == i18nState.NONE) {
			i18n.init(()=>{
				i18n.text(key, cb);
			});
			return null;
		}
		
		let textSet = i18n.getCurrentTextSet();
		if (textSet == null) return null;
		
		let res = textSet.get(key, (res)=>{
			if (cb) cb(res);
		});
		return res;
	}
	/**
	 * 文字代換 (備選語言)
	 * @param fromLang 來源語言
	 * @param fallbackLang 備選語言
	 * @param key 關鍵字
	 * @param cb 回呼
	 * @returns string 立即回傳 (若可)
	 */
	public static textFallback (fromLang: string, fallbackLang: string, key: string, cb: (res:string)=>void) : string {
		if (i18n.state == i18nState.NONE) {
			i18n.init(()=>{
				i18n.textFallback(fromLang, fallbackLang, key, cb);
			});
			return null;
		}

		let fallbackSet = this.getTextSet(fallbackLang);
		if (fallbackSet == null) {
			if (cb) cb(null);
			return null;
		}

		let fallbackRes = fallbackSet.fallback(fromLang, key, (res)=>{
			if (cb) cb(res);
		});

		if (fallbackRes) {
			return fallbackRes;
		}
		
		return null;
	}

	/**
	 * 圖片代換
	 * @param key 關鍵字
	 * @param cb 回呼
	 * @returns cc.SpriteFrame 立即回傳 (若可)
	 */
	public static img (key: string, cb?:(spriteFrame: cc.SpriteFrame)=>void) : cc.SpriteFrame {
		if (i18n.state == i18nState.NONE) {
			i18n.init(()=>{
				i18n.img(key, cb);
			});
			return null;
		}

		let imgSet = i18n.getCurrentImgSet();
		if (imgSet == null) return null;

		let res = imgSet.get(key, (res)=>{
			if (cb) cb(res);
		});
		return res;
	}
	
	/**
	 * 圖片代換 (備選語言)
	 * @param fromLang 來源語言
	 * @param fallbackLang 備選語言
	 * @param key 關鍵字
	 * @param cb 回呼
	 * @returns cc.SpriteFrame 立即回傳 (若可)
	 */
	public static imgFallback (fromLang: string, fallbackLang: string, key: string, cb: (res:cc.SpriteFrame)=>void) : cc.SpriteFrame {
		if (i18n.state == i18nState.NONE) {
			i18n.init(()=>{
				i18n.imgFallback(fromLang, fallbackLang, key, cb);
			});
			return null;
		}

		let fallbackSet = this.getImgSet(fallbackLang);
		if (fallbackSet == null) {
			if (cb) cb(null);
			return null;
		}

		let fallbackRes = fallbackSet.fallback(fromLang, key, (res)=>{
			if (cb) cb(res);
		});

		if (fallbackRes) {
			return fallbackRes;
		}
		
		return null;
	}

	/**
	 * 圖片代換
	 * @param key 關鍵字
	 * @param cb 回呼
	 * @returns cc.SpriteFrame 立即回傳 (若可)
	 */
	 public static prefab (key: string, cb?:(prefab: cc.Prefab)=>void) : cc.Prefab {
		if (i18n.state == i18nState.NONE) {
			i18n.init(()=>{
				i18n.prefab(key, cb);
			});
			return null;
		}

		let prefabSet = i18n.getCurrentPrefabSet();
		if (prefabSet == null) return null;

		let res = prefabSet.get(key, (res)=>{
			if (cb) cb(res);
		});
		return res;
	}
	
	/**
	 * 圖片代換 (備選語言)
	 * @param fromLang 來源語言
	 * @param fallbackLang 備選語言
	 * @param key 關鍵字
	 * @param cb 回呼
	 * @returns cc.SpriteFrame 立即回傳 (若可)
	 */
	public static prefabFallback (fromLang: string, fallbackLang: string, key: string, cb: (res:cc.Prefab)=>void) : cc.Prefab {
		if (i18n.state == i18nState.NONE) {
			i18n.init(()=>{
				i18n.prefabFallback(fromLang, fallbackLang, key, cb);
			});
			return null;
		}

		let fallbackSet = this.getPrefabSet(fallbackLang);
		if (fallbackSet == null) {
			if (cb) cb(null);
			return null;
		}

		let fallbackRes = fallbackSet.fallback(fromLang, key, (res)=>{
			if (cb) cb(res);
		});

		if (fallbackRes) {
			return fallbackRes;
		}
		
		return null;
	}


	/*==註冊資源=========================================*/

	/**
	 * 註冊語言
	 * @param langID 語言名稱
	 * @param fallbackLang 備選語言名稱
	 */
	public static regLang (langID: string, fallbackLang: string = null) : void {

		// 建立文字集合 ============
		let textSet;
		if (i18n.langID2TextSet.has(langID)) {
			textSet = i18n.langID2TextSet.get(langID);
		}else{
			textSet = new i18nTextSet();
			textSet.fallbackLangID = i18nSetting.defaultLang;
			i18n.langID2TextSet.set(langID, textSet);
		}
		
		
		// 建立圖片集合 ============
		let imgSet;
		if (i18n.langID2ImgSet.has(langID)) {
			imgSet = i18n.langID2ImgSet.get(langID);
		}else{
			imgSet = new i18nImgSet();
			imgSet.fallbackLangID = i18nSetting.defaultLang;
			i18n.langID2ImgSet.set(langID, imgSet);
		}
		
		// 建立物件集合 ============
		let prefabSet;
		if (i18n.langID2PrefabSet.has(langID)) {
			prefabSet = i18n.langID2PrefabSet.get(langID);
		}else{
			prefabSet = new i18nPrefabSet();
			prefabSet.fallbackLangID = i18nSetting.defaultLang;
			i18n.langID2PrefabSet.set(langID, prefabSet);
		}
		
		
		// ========================
		if (fallbackLang) {
			textSet.fallbackLangID = fallbackLang;
			imgSet.fallbackLangID = fallbackLang;
		}
	}
	
	/**
	 * 註冊文字
	 * @param langID 語言名稱
	 * @param key 索引
	 * @param str 內文
	 * @param isOverwrite 是否覆蓋既有內文
	 */
	public static regText (langID: string, key: string, str: string, isOverwrite: boolean = true) : void {
		if (i18n.langID2TextSet.has(langID) == false) {
			this.regLang(langID);
		}
		
		let textSet = i18n.langID2TextSet.get(langID);

		// 若 不能覆寫 且 已經存在該Key的值 則 返回
		if (!isOverwrite && textSet.has(key)) return;

		textSet.set(key, str);

	}

	/**
	 * 註冊圖片
	 * @param langID 語言名稱
	 * @param key 索引
	 * @param spriteFrame 圖片
	 * @param isOverwrite 是否覆蓋既有圖片
	 */
	public static regImg (langID: string, key: string, spriteFrame: cc.SpriteFrame, isOverwrite: boolean = true) : void {
		if (i18n.langID2ImgSet.has(langID) == false) {
			this.regLang(langID);
		}
		
		let imgSet = i18n.langID2ImgSet.get(langID);

		// 若 不能覆寫 且 已經存在該Key的值 則 返回
		if (!isOverwrite && imgSet.has(key)) return;

		imgSet.set(key, spriteFrame);

	}

	/**
	 * 註冊圖片
	 * @param langID 語言名稱
	 * @param key 索引
	 * @param prefab 物件
	 * @param isOverwrite 是否覆蓋既有物件
	 */
	 public static regPrefab (langID: string, key: string, prefab: cc.Prefab, isOverwrite: boolean = true) : void {
		if (i18n.langID2PrefabSet.has(langID) == false) {
			this.regLang(langID);
		}
		
		let prefabSet = i18n.langID2PrefabSet.get(langID);

		// 若 不能覆寫 且 已經存在該Key的值 則 返回
		if (!isOverwrite && prefabSet.has(key)) return;

		prefabSet.set(key, prefab);

	}



	/*== Member ===================================================*/

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/

	/* 呼叫 */
	// public call (var1: Function, var2: number) : void {

	// }
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

