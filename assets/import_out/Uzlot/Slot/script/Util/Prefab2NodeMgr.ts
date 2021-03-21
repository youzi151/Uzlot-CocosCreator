import { ObjPool_Prefab, i18n } from "../../../../Uzil/Uzil";

const {ccclass, property} = cc._decorator;

@ccclass
export class Prefab2NodeMgr {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	private static _id2PrefabPool : Map<string, ObjPool_Prefab> = new Map<string, ObjPool_Prefab>();

	private static _instance2Pool : Map<cc.Node, ObjPool_Prefab> = new Map<cc.Node, ObjPool_Prefab>();

	/*== Member ===================================================*/

	/*== Event ====================================================*/

	/*== Public Function ==========================================*/
	
	/*== 基本功能 =================*/

	/** 請求 */
	public static request (id: string) : cc.Node {
		
		let pool = Prefab2NodeMgr._getPool(id);
		if (pool == null) return null;

		let instance = pool.request();
		if (instance != null) {
			Prefab2NodeMgr._instance2Pool.set(instance, pool);
		}

		return instance;
	}

	/** 回收 */
	public static recovery (node: cc.Node) : void {
		if (Prefab2NodeMgr._instance2Pool.has(node) == false) return;
		let pool = Prefab2NodeMgr._instance2Pool.get(node);
		return pool.recovery(node);
	}

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

	private static _getPool (id : string) : ObjPool_Prefab {
		
		let pool : ObjPool_Prefab = null;

		if (Prefab2NodeMgr._id2PrefabPool.has(id)) {

			pool = Prefab2NodeMgr._id2PrefabPool.get(id);

		} else {
			
			let prefab = i18n.prefab(id);
			if (prefab == null) return null;

			pool = new ObjPool_Prefab();
			
			pool.prefab = prefab;
			i18n.onChange.add(()=>{
				pool.clear();
				pool.prefab = i18n.prefab(id);
			});

			Prefab2NodeMgr._id2PrefabPool.set(id, pool);

		}

		return pool;
	}

}
