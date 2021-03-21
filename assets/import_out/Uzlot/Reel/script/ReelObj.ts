import { ReelRowObj, ReelColObj } from "../index_Reel";
import { ReelColData, ReelState } from "../../Reel/index_Reel";
import { Event, Mathf } from "../../../Uzil/Uzil";
import { ReelStripData } from "./Data/ReelStripData";

const {ccclass, property} = cc._decorator;



@ccclass
export class ReelObj extends cc.Component {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 狀態 */
	@property()
	public state : ReelState = ReelState.IDLE;

	/** 主要滾輪 */
	@property()
	public mainReelIdx : number = 0;

	/** 滾輪列表 */
	@property(ReelRowObj)
	public reelRows : Array<ReelRowObj> = [];

	/** 盤面範圍 */
	public resultRange : number[] = [0, 0];
	
	/*== Event ====================================================*/

	/** 當滾動 */
	public onSpin : Event = new Event();

	/** 當停輪完全 */
	public onStopDone : Event = new Event();
	
	/** 當停輪 */
	public onStop : Event = new Event();


	/*== Cocos LifeCycle ==========================================*/

	// LIFE-CYCLE CALLBACKS:

	onLoad () {
		let self = this;

		// 對 主要滾論 註冊重要事件
		let mainReel = this.getReelRow();
		
		mainReel.onSpin.add(()=>{
			self.onSpin.call();
		});

		mainReel.onStop.add(()=>{
			self.onStop.call();
		});

		mainReel.onStopDone.add(()=>{
			self.state = ReelState.IDLE;
			self.onStopDone.call();
		});

	}

	start () {
		
	}

	update (dt) {
		
		
	}

	
	/*== Public Function ==========================================*/

	/**
	 * 取得滾輪
	 * @param idx 指定輪(若 無指定 則 視為指定 主要輪)
	 */
	public getReelRow (idx: number = null) : ReelRowObj {
		let reelIdx = idx;
		if (reelIdx == null) {
			reelIdx = this.mainReelIdx;
		}

		if (reelIdx < 0 && reelIdx > this.reelRows.length) return;

		let reelRow = this.reelRows[reelIdx];

		return reelRow;
	}
	
	/** 是否滾動中 */
	public isRolling () : boolean {
		return this.getReelRow().isRolling();
	}

	/** 取得停輪位置 */
	public getStopPos () : number {
		return this.getReelRow().getStopPos();
	}

	//== 控制主要滾輪 ===================

	/** 設置盤面範圍 */
	public setResultRange (range: number[]) : void {
		this.resultRange = range.slice();
		for (let each of this.reelRows) {
			each.setResultRange(range);
		}
	}

	/** 取得盤面範圍 */
	public getResultRange () : number[] {
		return this.resultRange;
	}

	/**
	 * 設置滾輪表
	 * @param stripData 滾輪表
	 */
	public setStrip (stripData: ReelStripData, isShift: boolean = false) : void {
		let reelRow = this.getReelRow();

		if (isShift && reelRow.isPosExist) {
			reelRow.shift(reelRow.currentPos, {stripData:stripData});
		} else {
			reelRow.setStrip(stripData);
			reelRow.render();
		}
	}

	/** 取得 滾輪表 */
	public getStrip () : ReelStripData {
		let reelRow = this.getReelRow();
		return reelRow.stripData;
	}

	/**
	 * 設置位置
	 * @param pos 位置
	 */
	public setPos (pos: number) : void {
		let reelRow = this.getReelRow();
		reelRow.setPos(pos);
	}

	/**
	 * 設置 格 資料
	 * @param col 指定格
	 * @param colData 格資料
	 */
	public setCol (col: number, colData: ReelColData) : void {
		let reelRow = this.getReelRow();
		reelRow.setCol(col, colData);
	}

	/**
	 * 取得 格 資料
	 * @param col 指定格
	 */
	public getCol (col: number) : ReelColData {
		let reelRow = this.getReelRow();
		return reelRow.getCol(col);
	}

	/** 取得圖標格物件 以 所屬格 */
	public getColObjsByCol (col: number, rowIdx: number = null) : ReelColObj[] {
		let reelRow : ReelRowObj = this.getReelRow(rowIdx);
		return reelRow.view.getColObjs(col);
	}

	/** 取得圖標格物件 以 位置 */
	public getColObjsByPos (colPos: number, rowIdx: number = null) : ReelColObj[] {
		let reelRow : ReelRowObj = this.getReelRow(rowIdx);

		let colData = reelRow.stripData.getColByTriggerPos(colPos);
		if (colData == null) return null;

		return reelRow.view.getColObjs(colData.idx);
	}
	
	/** 取得圖標格物件 以 位置 */
	public getColDataByPos (colPos: number, rowIdx: number = null) : ReelColData {
		let reelRow : ReelRowObj = this.getReelRow(rowIdx);

		let colData = reelRow.stripData.getColByTriggerPos(colPos);
		if (colData == null) return null;

		return colData;
	}
	/**
	 * 取得 格 世界位置
	 * @param col 指定格
	 */
	public getColWorldPos (col: number) : cc.Vec2[] {
		let reelRow = this.getReelRow();
		return reelRow.view.getColWorldPos(col);
	}

	/**
	 * 取得 世界位置
	 */
	 public getWorldPos () : cc.Vec2 {
		let reelRow = this.getReelRow();
		return reelRow.view.getWorldPos();
	}

	/** 滾動 */
	public spin () : void {
		if (this.state != ReelState.IDLE) return;
		this.state = ReelState.ROLLING;

		let reelRow = this.getReelRow();
		reelRow.spin();

	}

	/**
	 * 停輪
	 * @param stopPos 停輪格
	 * @param isImmediately 是否立即停輪
	 */
	public stop (stopPos: number, isImmediately: boolean = false) : void {
		this.state = ReelState.STOPPING;

		let reelRow = this.getReelRow();
		
		if (isImmediately) {
			reelRow.stopNow(stopPos);
		} else {
			reelRow.stop(stopPos);
		}
	}


	/**
	 * 立刻停輪
	 * @param stopPos 停輪格
	 */
	public stopNow (stopPos: number) : void {
		this.stop(stopPos, true);
	}

	
	/** 暫停 */
	public pause () : void {
		let reelRow = this.getReelRow();
		reelRow.pause();
	}

	/** 復原 */
	public resume () : void {
		let reelRow = this.getReelRow();
		reelRow.resume();
	}

	/** 渲染 */
	public render () : void {
		for (let each of this.reelRows) {
			each.render();
		}
	}

	//== 所有圖層一併處理 ================

	/**
	 * 取得 盤面 格資訊 在 位置上
	 * @param targetPosList 目標位置列表
	 * @param basePos 基準位置
	 */
	public getResult (targetPosList: number[], basePos: number = null) : ReelColData[] {
		let result = [];

		// 每個輪軸
		for (let eachReelRow of this.reelRows) {
			let res = eachReelRow.getResult(targetPosList, basePos);
			if (res != null) {
				result.push(eachReelRow)
			}
		}

		return result;
	}

	/**
	 * 取得 盤面 格資訊 在 範圍內
	 * @param start 起始位置
	 * @param end 結束位置
	 * @param basePos 基準位置
	 */
	 public getResultInRange (start: number, end: number, basePos: number = null) : ReelColData[][] {
		let result = [];

		// 每個輪軸
		for (let eachReelRow of this.reelRows) {
			let res = eachReelRow.getResultInRange(start, end, basePos);
			if (res != null) {
				result.push(res)
			}
		}
		return result;
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}

