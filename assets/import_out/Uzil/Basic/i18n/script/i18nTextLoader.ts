import { i18n } from "./i18n";

const {ccclass, property} = cc._decorator;

@ccclass
export default class i18nTextLoader extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 語言 */
	@property()
	public languageID : string = "";

	/** Json資料檔 */
	@property(cc.JsonAsset)
	public jsonFile : cc.JsonAsset = null;
	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {

		if (!this.jsonFile) return;
		if (!this.jsonFile.json) return;

		let json = this.jsonFile.json;

		for (let key in json) {
			i18n.regText(this.languageID, key, json[key], /* isOverwrite */false);
		}
	}

	// start () {
		
	// }

	// update (dt) {
		
		
	// }

	
	/*== Public Function ==========================================*/

	/* 呼叫 */
	// public call (var1: Function, var2: number) : void {

	// }
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

