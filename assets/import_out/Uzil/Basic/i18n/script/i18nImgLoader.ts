import { i18n } from "./i18n";

const {ccclass, property} = cc._decorator;

@ccclass('i18nImgLoaderPair')
class i18nImgLoaderPair {

	@property()
	public key : string = "";

	@property(cc.SpriteFrame)
	public spriteFrame : cc.SpriteFrame = null;

}


@ccclass
export class i18nImgLoader extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 語言 */
	@property()
	public languageID : string = "";

	/** 圖像 */
	@property(i18nImgLoaderPair)
	public images : Array<i18nImgLoaderPair> = [];

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		for (let pair of this.images) {
			i18n.regImg(this.languageID, pair.key, pair.spriteFrame, /* isOverwrite */false);
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

