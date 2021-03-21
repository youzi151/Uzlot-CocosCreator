import { ObjPool } from "./ObjPool";

export class ObjPool_Prefab extends ObjPool<cc.Node> {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	public prefab : cc.Prefab = null;
	private instance2Prefab : Map<cc.Node, cc.Prefab> = new Map<cc.Node, cc.Prefab>();

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/

	/** 回收物件 */
	public recovery (obj: cc.Node) : void {

		if (this.instance2Prefab.has(obj)) {
			if (this.instance2Prefab.get(obj) != this.prefab) {
				this.disableObj(obj);
				this.destroy(obj);
				return;
			}
		}
		
		super.recovery(obj);
	}


	/** 建立物件 */
	public create () : cc.Node {
		let node = cc.instantiate(this.prefab);
		this.instance2Prefab.set(node, this.prefab);
		return node;
	}
	
	/** 銷毀物件 */
	public destroy (obj: cc.Node) : void {
		obj.destroy();
		this.instance2Prefab.delete(obj);
	}

	/** 初始化物件 */
	public enableObj (obj: cc.Node, initData: Object) : cc.Node {
		obj.active = true;
		return obj;
	}

	/** 關閉物件 */
	public disableObj (obj: cc.Node) : void {
		obj.active = false;
	}

	/*== Private Function =========================================*/

}
