import { 
	AnimState,
	AnimCondition,
} from "../../index_Animator";

// ===================================================
// 動畫通道
// 
// 功能：
// 1.負責條件判定
// 2.傳遞混和資訊給後續動畫狀態
// 

export class AnimTransition {
	
	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/* 前一動畫最少需要播放過多久 (0~)*/
	public exitTime : number = 1;

	/* 條件 */
	public conditions : Array<AnimCondition> = [];

	/* 混合時間 (僅Spine支援)*/
	public mixTime : number = 0;

	/* 目標狀態 */
	public nextState : string = null;
	
	/*== Event ====================================================*/

	/*== Public Function ==========================================*/
	
	/**
	 * 是否通過
	 * @param parameter 
	 */
	public isPass (parameter: Object) : boolean {
		for (let each of this.conditions){
			if (each.isPass(parameter) == false){
				return false;
			}
		}
		return true;
	}

	/**
	 * 加入 條件
	 * @param condition 要加入的條件
	 */
	public addCondition (condition: AnimCondition) : AnimTransition {
		this.conditions.push(condition);
		return this;
	}

	/**
	 * 設置 下一個狀態
	 * @param nextState 下一個要轉移至的狀態
	 */
	public next (nextState: AnimState) : AnimTransition {
		this.nextState = nextState.name;
		return this;
	}

	/*== 基本功能 =================*/

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

}
