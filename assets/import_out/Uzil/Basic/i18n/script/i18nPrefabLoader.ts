import { i18n } from "./i18n";

const {ccclass, property} = cc._decorator;

@ccclass('i18nPrefabLoaderPair')
class i18nPrefabLoaderPair {

	@property()
	public key : string = "";

	@property(cc.Prefab)
	public prefab : cc.Prefab = null;

}


@ccclass
export class i18nPrefabLoader extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 語言 */
	@property()
	public languageID : string = "";

	/** 圖像 */
	@property(i18nPrefabLoaderPair)
	public prefabs : Array<i18nPrefabLoaderPair> = [];

	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		for (let pair of this.prefabs) {
			i18n.regPrefab(this.languageID, pair.key, pair.prefab, /* isOverwrite */false);
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

