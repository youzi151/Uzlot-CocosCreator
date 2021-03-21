export enum ReelState {
	/* 待命 */IDLE,
	/* 滾動中 */ROLLING,
	/* 停輪中 */STOPPING
}

export enum ReelRollState {
	/* 待命 */IDLE,
	/* 淡入 */EASEIN,
	/* 滾動中 */ROLLING,
	/* 停輪中 */EASESTOP
}

export enum ReelStopState {
	/* 無 */NONE,
	/* 交接期間 */SHIFT,
	/* 等待入軌 */WAIT,
	/* 動畫中 */ANIM
}