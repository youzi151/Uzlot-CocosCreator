
export class AnimClip {
	
	/*== Constructor ==============================================*/

	/**
	 * 建構子
	 * @param name 片段的名稱
	 */
	constructor (name: string = "") {
		this.name = name;
	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 名稱 */
	public name : string = "";

	/** 混和度 (僅支援spine) */
	public mixAlpha : number = 1;

	/** 軌道 (僅支援spine) */
	public trackIdx : number = 0;

	/** 是否循環 (僅支援spine) */
	public isLoop : boolean = false;

	/*== Event ====================================================*/

	/*== Public Function ==========================================*/

	/**
	 * 設定 混和度
	 * @param a 混和度
	 */
	public alpha (a: number) : AnimClip {
		this.mixAlpha = a;
		return this;
	}

	/**
	 * 設定 軌道
	 * @param trackIdx 軌道編號
	 */
	public track (trackIdx: number) : AnimClip {
		this.trackIdx = trackIdx;
		return this;
	}

	/**
	 * 設定 循環
	 * @param isLoop 是否循環
	 */
	public loop (isLoop: boolean = true) : AnimClip {
		this.isLoop = isLoop;
		return this;
	}

	/*== 基本功能 =================*/

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

}
