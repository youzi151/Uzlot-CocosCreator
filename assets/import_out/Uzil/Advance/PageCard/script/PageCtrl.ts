import { Card, Page } from "../index_PageCard";

const {ccclass, property} = cc._decorator;

@ccclass
export class PageCtrl {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== 實例 =========================*/

	/** 實例列表 */
	private static _instance = {}

	/**
	 * 取得實例 (GetInstance 簡寫)
	 * @param scope 存取域名稱
	 */
	public static get (scope: string = "") : PageCtrl {
		return this.getInstance(scope);
	}
	/**
	 * 取得實例
	 * @param scope 存取域名稱
	 */
	public static getInstance (scope: string = "") : PageCtrl {
		let instance = this._instance[scope];
		
		if (!instance) {
			instance = new PageCtrl();
			instance.scope = scope;
			this._instance[scope] = instance;
		}

		return instance;
	}


	/*== Member ===================================================*/

	/** 存取域 */
	public scope : string = "";

	/** 頁面列表 */
	public pages : Array<Page> = [];

	/** 卡片列表 */
	public cards : Array<Card> = [];
	
	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/

	
	/*== 註冊 ==============================*/

	
	/**
	 * 註冊頁面
	 * @param page 頁面物件
	 */
	public registerPage (page: Page) : void {
		if (this.pages.indexOf(page) != -1) return;
		this.pages.push(page);
	}


	/**
	 * 註冊卡片
	 * @param card 卡片物件
	 */
	public registerCard (card: Card) : void {
		if (this.cards.indexOf(card) != -1) return;
		this.cards.push(card);
		card.deactive();
	}

	/*== 取得 ==============================*/

	/**
	 * 取得頁面
	 * @param id 
	 * @returns 頁面或複數頁面
	 */
	public getPages (id: string) : Array<Page> {
		let result : Array<Page> = [];

		for (let each of this.pages) {
			if (each.id == id) {
				result.push(each);
			}
		}

		if (result.length == 0) {
			return null;
		} else {
			return result;
		}
	}

	/**
	 * 取得卡片
	 * @param id 名稱
	 * @returns 頁面或複數頁面
	 */
	public getCards (id: string) : Array<Card> {
		let result : Array<Card> = [];

		for (let each of this.cards) {
			if (each.id == id) {
				result.push(each);
			}
		}

		if (result.length == 0) {
			return null;
		} else {
			return result;
		}
	}


	
	/*== 切換頁面 =============================*/

	public GoPage (pageID: string) : void {

		let showCards = this._getCardIDsInPage(pageID);

		// 每一張卡片
		for (let eachCard of this.cards) {

			// 若 在要顯示的卡片中 則
			if (showCards.indexOf(eachCard.id) != -1) {
				// 啟用
				eachCard.active();

			} 

			// 否則關閉
			else {
				eachCard.deactive();
			}

		}

	}

	public ShowPage (pageID: string) : void {

		let showCards = this._getCardIDsInPage(pageID);

		// 每一張卡片
		for (let eachCard of this.cards) {

			// 若 在要顯示的卡片中 則
			if (showCards.indexOf(eachCard.id) != -1) {
				// 啟用
				eachCard.active();

			}

		}

	}

	public HidePage (pageID: string) : void {

		let hideCards = this._getCardIDsInPage(pageID);

		// 每一張卡片
		for (let eachCard of this.cards) {

			// 若 在要顯示的卡片中 則
			if (hideCards.indexOf(eachCard.id) != -1) {
				// 啟用
				eachCard.deactive();

			}

		}
	}


	/*== 啟用卡片 =============================*/


	/**
	 * 啟用
	 * @param cardID 卡片名稱
	 * @param isForceReactive 若已經啟用，是否強制重新啟用
	 */
	public activeCard (cardID: string, isForceReactive: boolean = false) : void {
		let matchCards = this.getCards(cardID);
		for (let each of matchCards) {
			each.active(isForceReactive);
		}
	}

	/**
	 * 關閉
	 * @param cardID 卡片名稱
	 * @param isForceReDeactive 若已經關閉，是否強制重新關閉
	 */
	public deactiveCard (cardID: string, isForceReDeactive: boolean = false) : void {
		let matchCards = this.getCards(cardID);
		for (let each of matchCards) {
			each.deactive(isForceReDeactive);
		}
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

	private _getCardIDsInPage (pageID: string) : Array<string> {
		let cards = [];

		// 每一個頁面
		for (let eachPage of this.pages) {

			// 若非指定頁面 則 忽略
			if (eachPage.id != pageID) continue;

			// 該頁面的每一張卡
			for (let eachCard of eachPage.cards) {

				// 不重複的加入 回傳卡片 中
				if (cards.indexOf(eachCard) == -1) {
					cards.push(eachCard);
				}

			}

		}

		return cards;
	}


}

