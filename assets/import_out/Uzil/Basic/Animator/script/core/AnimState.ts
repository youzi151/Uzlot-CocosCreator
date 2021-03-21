import { AnimTransition } from './AnimTransition';
import { AnimClip } from './AnimClip';

export class AnimState {
	
	/*== Constructor ==============================================*/

	constructor (name: string = "") {
		this.name = name;
	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 狀態名稱 */
	protected _name : string = "";
	/** 狀態名稱 */
	public get name () : string {
		if (this._name) return this._name;
		if (this.animClips.length > 0){
			return this.animClips[0].name;
		}
	}
	public set name (val) {
		this._name = val;
	}

	/** 動畫Clip */
	public animClips : Array<AnimClip> = []

	/** 連接通道 */
	public transitions : Array<AnimTransition> = [];

	/*== Event ====================================================*/

	/*== Public Function ==========================================*/

	/*== 基本功能 =================*/

	/**
	 * 加入 轉換通道
	 * @param transition 轉換通道
	 */
	public addTransition (transition: AnimTransition) : AnimState {
		this.transitions.push(transition);
		return this;
	}

	/**
	 * 加入 片段
	 * @param clip 動畫片段
	 */
	public addClip (clip: AnimClip) : AnimState {
		this.animClips.push(clip);
		return this;
	}

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

}
