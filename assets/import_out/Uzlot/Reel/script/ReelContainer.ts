import { Mathf, Event } from "../../../Uzil/Uzil";
import { ReelObj } from "../index_Reel";
import { ReelState } from "./ReelConst";
import { ReelColData } from "./Data/ReelColData";
import { ReelStripData } from "./Data/ReelStripData";

const {ccclass, property} = cc._decorator;

@ccclass
export class ReelContainer extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 滾輪列表 */
	@property(ReelObj)
	public reels : ReelObj[] = [];

	/*== Event ====================================================*/

	/** 當滾輪起轉 */
	public onSpin : Event = new Event();

	/** 當所有滾輪起轉 */
	public onAllSpin : Event = new Event();

	/** 當滾輪停輪 */
	public onStop : Event = new Event();
	
	/** 當滾輪停輪完全 */
	public onStopDone : Event = new Event();

	/** 當所有滾輪停輪 */
	public onAllStopDone : Event = new Event();

	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {

		let self = this;

		//== 起滾事件 ==========================

		// 對 每個輪軸
		for (let idx = 0; idx < this.reels.length; idx++) {
			let each = this.reels[idx];

			let reelIdx = idx;
			let reel = each;

			// 註冊 當滾動時 呼叫 起滾事件
			each.onSpin.add(()=>{
				
				// 呼叫事件: 起滾
				self.onSpin.call(reelIdx, reel);

				// 若 任意一個滾輪 還在 停輪 則 返回
				for (let each of this.reels) {
					if (each.state == ReelState.IDLE) return;
				}

				// 呼叫事件: 當所有滾輪開始滾動
				self.onAllSpin.call();
			});
		}

		//== 停輪事件 ==========================

		// 對 每個輪軸
		for (let idx = 0; idx < this.reels.length; idx++) {
			let each = this.reels[idx];

			let reelIdx = idx;
			let reel = each;

			// 註冊 當開始停輪
			each.onStop.add(()=>{
				self.onStop.call(reelIdx, reel);
			});

			// 註冊 當完全停輪
			each.onStopDone.add(()=>{
				
				// 呼叫事件: 停輪
				self.onStopDone.call(reelIdx, reel);

				// 若 任意一個滾輪 還在 停輪 則 返回
				for (let each of this.reels) {
					if (each.state != ReelState.IDLE) return;
				}

				// 呼叫事件: 當所有滾輪停止
				self.onAllStopDone.call();
			});
		}
	}

	start () {
		
	}

	update (dt) {
		
	}

	
	/*== Public Function ==========================================*/

	/**
	 * 取得滾輪
	 * @param idx 滾輪序號
	 */
	public getReel (idx: number) : ReelObj {
		if (idx < 0 || idx > this.reels.length-1) return null;
		return this.reels[idx];
	}

	/** 設置 盤面範圍 */
	public setResultRange (ranges: number[][]) : void {
		let min = Mathf.min(ranges.length, this.reels.length);
		for (let row = 0; row < min; row++) {
			this.reels[row].setResultRange(ranges[row]);
		}
	}

	/**
	 * 設置滾輪表
	 * @param strip 滾輪表
	 */
	public setStrip (stripDatas: ReelStripData[], isShift: boolean = false) : void {
		let reelMin = Mathf.min(stripDatas.length, this.reels.length);

		for (let reelIdx = 0; reelIdx < reelMin; reelIdx++) {
			let reel = this.reels[reelIdx];
			let reelStrip = stripDatas[reelIdx];

			if (!reel || !reelStrip) continue;

			reel.setStrip(reelStrip, isShift);

		}
	}

	/**
	 * 取得滾輪表
	 */
	public getStrip () : ReelStripData[] {
		let res = []
		for (let reelIdx = 0; reelIdx < this.reels.length; reelIdx++) {
			let reel = this.reels[reelIdx];
			let reelStrip = reel.getReelRow().stripData;
			res.push(reelStrip);
		}
		return res;
	}

	/** 直接設置位置 */
	public setPos (posList: number[]) : void {
		let min = Mathf.min(this.reels.length, posList.length);

		for (let idx = 0; idx < min; idx++) {
			this.reels[idx].setPos(posList[idx]);
		}
	}

	/** 轉移 */
	public shift (posList: number[]) : void {
		let min = Mathf.min(this.reels.length, posList.length);

		for (let idx = 0; idx < min; idx++) {

			let reelRows = this.reels[idx].reelRows;
			let toShift = posList[idx];

			for (let each of reelRows) {
				each.shift(toShift);
			}
		}
	}

	/** 開始滾動 */
	public spin (reelIdx: number) : void {
		// 每個輪軸
		let reel = this.getReel(reelIdx);
		if (!reel) return;

		// 呼叫滾動
		reel.spin();
		
	}
	
	/** 停輪 */
	public stop (reelIdx: number, stopCol: number, isStopImmediately: boolean = false, onStopDone: Function = null) : void {

		// 防呆
		if (reelIdx < 0 || reelIdx > this.reels.length-1) return;
		
		// 滾輪
		let reel = this.reels[reelIdx];

		// 停輪
		reel.stop(stopCol);

		// 停輪回呼
		if (onStopDone) {
			reel.onStopDone.addOnce(()=>{
				onStopDone();
			});
		}

	}

	/** 暫停 */
	public pause () : void {
		for (let each of this.reels) {
			each.pause();
		}
	}

	/** 復原 */
	public resume () : void {
		for (let each of this.reels) {
			each.resume();
		}
	}


	/**
	 * 取得 格 世界座標
	 * @param targetReelList 目標 輪 與 格
	 */
	public getColWorldPos (targetReelList: number[][]) : cc.Vec2[][][] {
		
		// 結果
		let result = [];

		// 每一目標 或 每一輪
		let minReelLength = Mathf.min(targetReelList.length, this.reels.length);
		for (let row = 0; row < minReelLength; row++) {

			// 該輪結果
			let eachReelResult = [];

			// 該輪目標
			let targetInReel = targetReelList[row];
			// 該輪
			let eachReel = this.reels[row];

			// 每一格目標
			for (let each of targetInReel) {
				let worldPosList = eachReel.getColWorldPos(each);
				// 加入至該輪目標
				eachReelResult.push(worldPosList);
			}

			// 將 該輪目標 加入到 總結果
			result.push(eachReelResult);

		}

		return result;

	}

	
	/**
	 * 取得 盤面 格資訊 以 位置
	 * @param targetReelAndPosList 要納入結果的各軸與各相對位置 (e.g. [[-1, 0, 1],[-1, 1],[-1, 0, 1]]))
	 * @param basePosList 基準位置
	 */
	 public getResult (targetReelAndPosList: number[][], basePosList: number[] = null) : ReelColData[][] {

		let result = [];

		// 以其中最小的長度 作為 總共要處理的 輪軸數量
		let min = Mathf.min(this.reels.length, targetReelAndPosList.length);

		// 每個輪軸
		for (let reelIdx = 0; reelIdx < min; reelIdx++) {

			// 結果
			let eachRes;

			// 指定 該輪軸 的 哪幾個 相對停輪格位置
			let targetRelativePosList = targetReelAndPosList[reelIdx];

			// 基準位置
			let basePos = null;
			if (basePosList != null) {
				basePos = basePosList[reelIdx];
			}
			
			// 輪軸
			let reel = this.reels[reelIdx];

			if (reel) {
				eachRes = reel.getResult(targetRelativePosList, basePos);
			}

			// 加入到 總結果
			result.push(eachRes);
		}

		return result;
	}

	/**
	 * 取得 盤面 格資訊 以 範圍
	 * @param ranges 每輪範圍
	 * @param basePosList 基準位置
	 */
	 public getResultInRange (ranges: number[][], basePosList: number[] = null) : ReelColData[][][] {

		let result = [];

		// 以其中最小的長度 作為 總共要處理的 輪軸數量
		let min = Mathf.min(this.reels.length, ranges.length);

		// 每個輪軸
		for (let reelIdx = 0; reelIdx < min; reelIdx++) {

			// 結果
			let eachRes;

			// 該輪軸 的 指定範圍
			let range = ranges[reelIdx];
			let start = range[0];
			let end = range[1];

			// 基準位置
			let basePos = null;
			if (basePosList != null) {
				basePos = basePosList[reelIdx];
			}
			
			// 輪軸
			let reel = this.reels[reelIdx];

			if (reel) {
				eachRes = reel.getResultInRange(start, end, basePos);
			}

			// 加入到 總結果
			result.push(eachRes);
		}

		return result;
	}


	/** 取得停輪格 */
	public getStopPosList () : number[] {
		let stopCols = [];
		for (let each of this.reels) {
			stopCols.push(each.getStopPos());
		}
		return stopCols;
	}
	
	/** 渲染 */
	public render () : void {
		for (let each of this.reels) {
			each.render();
		}
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}

