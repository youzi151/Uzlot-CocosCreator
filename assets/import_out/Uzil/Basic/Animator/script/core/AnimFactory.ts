
import { 
	AnimClip,
	AnimState,
	AnimTransition,
	AnimCondition,
} from "../../index_Animator";

export class AnimFactory {
	
	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/*== Event ====================================================*/

	/*== Cocos LifeCycle ==========================================*/

	/*== Public Function ==========================================*/

	/*== 基本功能 =================*/

	/**
	 * 建立 片段
	 * @param data 片段資料
	 */
	public static createClip (data: Object) : AnimClip {
		// 驗證
		if (AnimFactory.validate(data, ['name']) == false) return null;

		let clip = new AnimClip(data['name']);

		// 軌道
		let track = data['track'];
		if (track) {
			clip.trackIdx = track;
		}

		// 循環
		let isLoop = data['isLoop'];
		if (isLoop != null) {
			clip.isLoop = JSON.parse(isLoop);
		}

		return clip;

	}

	/**
	 * 建立 狀態
	 * @param data 狀態資料
	 */
	public static createState (data: Object) : AnimState {
		// 驗證
		if (AnimFactory.validate(data, ['name']) == false) return null;

		let state = new AnimState(data['name']);
		
		// 片段
		let clips = data['clips'];
		if (clips) {
			for (let each of clips) {
				let clip = this.createClip(each);
				state.addClip(clip);
			}
		}

		// 轉換通道
		let transitions = data['transitions'];
		if (transitions) {
			for (let each of transitions) {
				let transition = this.createTransition(each);
				state.addTransition(transition);
			}
		}


		return state;
		
	}

	/**
	 * 建立 轉場
	 * @param data 轉場資料
	 */
	public static createTransition (data: Object) : AnimTransition {
		// 驗證
		if (AnimFactory.validate(data, ['nextState']) == false) return null;

		let transition = new AnimTransition();

		// 條件
		let conditions = data['conditions'];
		if (conditions) {
			for (let each of conditions) {
				let condition = this.createCondition(each);
				transition.addCondition(condition);
			}
		}

		// 下一個狀態
		let nextState = data['nextState'];
		if (nextState) {
			transition.nextState = nextState;
		}

		// 前一動畫最少需要播放過多久
		let exitTime = data['exitTime'];
		if (exitTime != null) {
			transition.exitTime = parseFloat(exitTime);
		}
		
		// 混合時間
		let mixTime = data['mixTime'];
		if (mixTime) {
			transition.mixTime = parseFloat(mixTime);
		}

		return transition;

	}

	/**
	 * 建立 條件
	 * @param data 條件資料
	 */
	public static createCondition (data: Object) : AnimCondition {
		// 驗證
		if (AnimFactory.validate(data, ['key', 'comparer', 'value']) == false) return null;

		let condition = new AnimCondition(data['key'], data['comparer'], data['value']);

		return condition;
	}

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

	/**
	 * 檢查 資料 是否具有 這些鍵值
	 * @param data 資料
	 * @param keys 要具有的鍵值
	 */
	private static validate (data: Object, keys: Array<string>) : boolean {
		for (let key of keys) {
			if (data[key] == undefined) return false;
		}
		return true;
	}

}
