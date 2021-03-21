export * from "./Util/index_Util";

export * from "./Core/Time/index_Time";
export * from "./Core/Invoker/index_Invoker";
export * from "./Core/Event/index_Event";
export * from "./Core/Bezier/index_Bezier";
export * from "./Core/Curve/index_Curve";
export * from "./Core/Async/index_Async";
export * from "./Core/Values/index_Values";
export * from "./Core/ObjPool/index_ObjPool";

export * from "./Basic/i18n/index_i18n";
export * from "./Basic/Shuriken/index_Shuriken";
export * from "./Basic/Animator/index_Animator";

export * from "./Advance/AniTween/index_AniTween";
export * from "./Advance/PageCard/index_PageCard";
export * from "./Advance/State/index_State";
export * from "./Advance/AudioMgr/index_AudioMgr";
export * from "./Advance/Act/index_Act";

export * from "./UI/index_UI";

export * from "./Macro/Macro";



export class Uzil {

	/*== Static ===================================================*/

	/** 根節點 */
	private static _rootNode : cc.Node = null;
	/** 取得系統根節點 */
	public static getRootNode() : cc.Node {
		let rootNode : cc.Node = Uzil._rootNode;

		// 1. 尋找單例
		if (rootNode) {
			return rootNode;
		}
			
		// 2. 尋找場景
		rootNode = cc.find('_Uzil');
		if (rootNode) {
			Uzil._rootNode = rootNode;
			return rootNode;
		}

		// 3. 建立
		rootNode = new cc.Node();
		rootNode.name = '_Uzil';
		rootNode.parent = cc.director.getScene();
		cc.game.addPersistRootNode(rootNode);

		Uzil._rootNode = rootNode;
		return rootNode;
	}

	/** 系統組件列表 */
	private static _compList : Array<cc.Component> = [];
	/**
	 * 取得系統組件
	 * @param compType 組件類型
	 */
	public static getComp (compType: string) : cc.Component {

		let component : cc.Component = Uzil._compList[compType];
		
		// 1. 尋找單例
		if (component) {
			return component;
		}
		
		// 2. 尋找場景
		let uzilRootNode = Uzil.getRootNode();
		component = uzilRootNode.getComponent(compType);

		if (component) {
			Uzil._compList[compType] = component;
			return component;
		}

		// 3. 建立
		component = uzilRootNode.addComponent(compType);

		Uzil._compList[compType] = component;
		return component;
	}

	/*== Member ===================================================*/
	
	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/

	/** 呼叫 */
	// public call (var1: Function, var2: number) : void {

	// }
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

