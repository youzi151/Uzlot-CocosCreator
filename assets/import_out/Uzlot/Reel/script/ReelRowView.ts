import { Event, Mathf, Objf } from "../../../Uzil/Uzil";
import { ReelColObj, ReelColData, ReelRowViewPass } from "../index_Reel";
import { ColMiddle } from "./Data/ColMiddle";
import { ReelStripData } from "./Data/ReelStripData";


const {ccclass, property} = cc._decorator;

export class TempColInfo {
	public isDisplay : boolean = false;
	public middle : ColMiddle = null;
	public lastPos : number = null;
}
 
 @ccclass
export class ReelRowView extends cc.Component {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 是否除錯中 */
	@property()
	public isDebug : boolean = false;

	/** 是否正在移動中 */
	public isMoving = false;

	/** 當前位置 */
	public currentPos : number = 0;

	/** 最後一次的渲染參數 */
	private _lastRenderArgs = null;
	
	/*== 設置 ===============*/
	
	/** 格物件的容器 */
	@property(cc.Node)
	public colRootNode : cc.Node = null;

	/** 格特效的容器 */
	@property(cc.Node)
	public colFXRootNode : cc.Node = null;

	/** 滾輪基準位置 */
	@property(cc.Vec2)
	public reelBasePos : cc.Vec2 = cc.Vec2.ZERO;

	/** 定義 顯示範圍 */
	@property()
	public displayRange_back : number = 2;
	@property()
	public displayRange_forward : number = 1.5;

	/*== 滾輪資料 ===========*/

	//== 資料暫存
	
	/** 每格資料 */
	private _stripData : ReelStripData = null;
	
	//== 資料
	
	/** 每格資料 對 容器 的 中介者 */
	private _colIdx2Middle : Map<number, ColMiddle> = new Map<number, ColMiddle>();

	/** 顯示中的格(序號) */
	private _inViewColIdxs : Array<number> = [];

	/** 滾輪格容器 列表(無排序) */
	private _colObjs : Array<ReelColObj> = [];
	
	/** 沒有被使用的容器 */
	private _unUseObjs : Array<ReelColObj> = [];

	/** 暫時格 */
	private _tempColData2Info : Map<ReelColData, TempColInfo> = new Map<ReelColData, TempColInfo>();


	/*== Component ================================================*/

	/** 滾輪格容器 預製物件 */
	@property(cc.Prefab)
	public colObjPrefab : cc.Prefab = null;

	/** 顯示通道 */
	@property(ReelRowViewPass)
	public showPasses : Array<ReelRowViewPass> = [];

	/*== Event ====================================================*/

	/** 當格進入顯示範圍 */
	public onColEnterView : Event = new Event();

	/*== Cocos LifeCycle ==========================================*/
	
	// LIFE-CYCLE CALLBACKS:

	onLoad () {

		this.init();

	}

	start () {
		
		// if (this.isDebug == false) return;

		// cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, (event)=>{
		// 	if (event.keyCode == cc.macro.KEY.a) {
				
		// 		if (cc.director.isPaused()) {
		// 			cc.director.resume();
		// 		} else {
		// 			cc.director.pause();
		// 		}
		// 	}


		// 	if (event.keyCode == cc.macro.KEY.z) {
		// 		cc.log(this.getMiddles());
		// 	}
		// });
	
	}

	update (dt) {
		
	}
	
	/*== Public Function ==========================================*/
	
	/*== 設置 ====================*/

	/*
	#### ##    ## #### ######## 
	 ##  ###   ##  ##     ##    
	 ##  ####  ##  ##     ##    
	 ##  ## ## ##  ##     ##    
	 ##  ##  ####  ##     ##    
	 ##  ##   ###  ##     ##    
	#### ##    ## ####    ##    
	*/

	public async init () {

		// 準備圖標容器物件
		// let prepareSymbols = () => { return new Promise((resolve, reject)=>{
		// 	cc.loader.loadRes("prefab/ReelColObj", cc.Prefab, (err, res)=>{
		// 		for (let idx = 0; idx < this.displayCount; idx++) {
		// 			let instance = cc.instantiate(res);
		// 			this.colObjs.push(instance);
		// 		}
		// 		resolve();
		// 	});
		// });}
		// await prepareSymbols();

		// 若 格物件 的 預製物件 存在
		if (this.colObjPrefab != null) {
			
			// 以 顯示範圍 為 顯示數量
			let displayCount = this.displayRange_forward + this.displayRange_back;

			// 建立並暫存 顯示數量 2倍 的 格物件
			for (let idx = 0; idx < displayCount * 2; idx++) {
				let colObj = this._createColObj(idx);
				this._unUseObjs.push(colObj);
			}
		}

	}


	/*== 操作 ====================*/



	/* 
	 ######  ######## ########
	##    ## ##          ##   
	##       ##          ##   
	 ######  ######      ##   
	      ## ##          ##   
	##    ## ##          ##   
	 ######  ########    ##   
	*/

	/**
	 * 設置顯示位置
	 * @param currentPos 指標位置
	 */
	public setPos (currentPos: number) : void {
		this.currentPos = Mathf.loop(currentPos, this._stripData.min, this._stripData.max);
	}

	/**
	 * 設置 滾輪表資料
	 * @param stripData 
	 */
	public setStrip (stripData: ReelStripData) : void {

		// 清空 正在顯示中的格
		this.clearInView();

		// 清空 中介
		this.clearMiddles();

		// 保留暫存資料
		this._stripData = stripData;
		
	}



	/*== 顯示 ====================*/

	/* 
	########  ######## ##    ## ########  ######## ########  
	##     ## ##       ###   ## ##     ## ##       ##     ## 
	##     ## ##       ####  ## ##     ## ##       ##     ## 
	########  ######   ## ## ## ##     ## ######   ########  
	##   ##   ##       ##  #### ##     ## ##       ##   ##   
	##    ##  ##       ##   ### ##     ## ##       ##    ##  
	##     ## ######## ##    ## ########  ######## ##     ## 
	*/	

	/**
	 * 渲染/顯示
	 * @param renderArgs 其他參數
	 */
	public render (renderArgs: Object = undefined) {
		if (this.isDebug) {
			// cc.log("== ReelRowView Render =======");
			// cc.log("currentPos:"+this.currentPos)
			// cc.log(renderArgs);
			// cc.log("total colObj: ",this._colObjs.length);
		}

		// 若 未定義 此次的渲染 則
		if (renderArgs == undefined) {
			// 使用上一次的
			renderArgs = this._lastRenderArgs;
		}
		// 若有定義 則
		else {
			// 設置 最後一次的渲染參數為此次參數
			this._lastRenderArgs = renderArgs
		}

		// 依照當前的輪軸位置以及滾輪表，改變圖標容器的圖片與位置

		// 要顯示的滾輪格
		let passCols : ReelColData[] = this._stripData.cols.slice();
		
		// 剔除 被標記為 要忽略 的
		passCols = passCols.filter((each)=>{
			return each.tags.indexOf("ignoreByViewPass") == -1;
		});
		
		// 顯示區域限制
		passCols = this._render_displayRangeLimit(passCols);


		// 處理棄用============
		
		// 要 棄用的中介
		let abandomMiddle : Array<ColMiddle> = [];

		// 每筆 格資料
		for (let eachData of this._stripData.cols) {
			
			// 是否仍然存在於畫面上
			let isStillExist = false;
			
			// 取得 該 格資料 的 中介
			let middle = this.requestMiddle(eachData);
			
			// 若 中介所屬Col 有在 通過的格資料中 則 保留
			isStillExist = passCols.indexOf(middle.data) != -1;
			
			// 若非 仍然存在於畫面上 則 加入 遺棄列表
			if (isStillExist == false) {
				abandomMiddle.push(middle);
			}
			
			// if (this.isDebug) cc.log("idx:"+eachData.idx+" middleCol:"+middle.col+" isStillExist:"+isStillExist);
		}

		// 每個 要棄用的中介
		for (let each of abandomMiddle) {

			// 把 所屬格未通過的 通過格 從 通過格列表中 移除
			let idx = passCols.indexOf(each.data);
			if (idx != -1) passCols.splice(idx, 1);
			
			// 若 為 正在顯示中
			if (this.isInView(each.data.idx)) {
				// 移除 正在顯示中
				this.setInView(each.data.idx, false);
			}
			
			// 關閉中介
			this._disableMiddle(each);
		}
		
		// 預先準備===========

		// if (this.isDebug){cc.log(this.displayingColIdxs)}
		
		// 暫存
		let cache_colData2Info : Map<ReelColData, {middle: ColMiddle, isNew: boolean}> =  new Map<ReelColData, {middle: ColMiddle, isNew: boolean}>(); 
		
		// 每個通過的格資料
		for (let eachData of passCols) {

			// 中介
			let colMiddle : ColMiddle = this.requestMiddle(eachData);

			// 設 是否為新加入 為 沒有在顯示中
			let isNew = !this.isInView(eachData.idx);

			// 紀錄資訊
			cache_colData2Info.set(eachData, {
				middle: colMiddle,
				isNew: isNew
			});
		}

		
		// 暫時滾輪格===========

		// 要顯示的暫時滾輪格
		let passTempColDatas : ReelColData[] = Array.from(this._tempColData2Info.keys());
		// 顯示區域限制
		passTempColDatas = this._render_displayRangeLimit(passTempColDatas);

		let abandomTemp : {data:ReelColData, middle:ColMiddle}[] = [];
		this._tempColData2Info.forEach((v, k)=>{
			if (passTempColDatas.indexOf(k) == -1) {
				abandomTemp.push({data:k, middle:v.middle});
			}
		});
		for (let each of abandomTemp) {
			this.removeTempCol(each.data);
		}

		//=================

		// 暫存重疊限制
		passCols = this._render_tempConflictLimit(passCols);

		// 顯示區域範圍 的 首/末端
		let displayRange_min = this.currentPos - this.displayRange_back;
		let displayRange_max = this.currentPos + this.displayRange_forward;

		// cc.log(passCols)
		
		// 每個 要顯示的滾輪格資料 && 容器還沒用完
		for (let idx = 0; idx < passCols.length ; idx++) {
			
			// 資料
			let eachData = passCols[idx];
			let info = cache_colData2Info.get(eachData);

			// 最後要出現在畫面上的相對位置
			let pos = this.getColsDisplayPos([eachData], displayRange_min, displayRange_max)[0];

			// 中介
			let colMiddle : ColMiddle = info.middle;
			
			// 中介所屬的格 是否為 新加入
			let isNew : boolean = info.isNew;

			// 該 所屬通過格 的 每個中介

			// 若 不在場上資訊中 則 
			if (this.isInView(eachData.idx) == false) {
				// 設為 在場上
				this.setInView(eachData.idx, true);
				// 呼叫 進入場中 事件
				this.onColEnterView.call(eachData.idx);
			}
			
			// 容器
			let eachObjs = colMiddle.objs;

			// 若 為新加入 且 中介 為 啟用 且 中介 未持有 容器
			if (isNew && eachObjs.length == 0) {

				// 從剩餘容器 取出 並 設置
				let obj = this.requestColObj();
				obj["__from"] = colMiddle.data.idx;
				eachObjs.push(obj);
				colMiddle.objs = eachObjs;
			}

			// 若 格物件 不存在 則 繼續下一個中介
			if (eachObjs.length == 0) {
				continue;
			}

			// 傳入參數
			let defaultArgs = {
				// 通用 ============

				// 顯示器
				view: this,
				// 滾輪表資料
				stripData: this._stripData,

				// 個別 ============
				// 當格資料
				colData: eachData,
				// 當格中介資料
				colMiddle: colMiddle,
				// 當格容器
				colObjs: eachObjs,

				// 資料 ============
				// 是否為新產生
				isNew: isNew,
				// 滾輪基準位置
				reelPos: this.reelBasePos,
				// 當格位置 (盤面相對位置)
				pos: pos,

				isDebug: this.isDebug
			};

			// 以 指定的參數 覆寫 傳入參數
			let passArgs = Objf.assign(defaultArgs, renderArgs);

			// 執行 每個 顯示通道
			for (let eachPass of this.showPasses) {
				passArgs = eachPass.pass(passArgs)
			}

			// if (this.isDebug) cc.log("renderpass: idx["+colMiddle.data.idx+"] col["+colMiddle.col+"] objs", eachObjs.map((each)=>{return each.node.scaleY+""+each.node.active}));
		}

		// 暫時格
		for (let eachData of passTempColDatas) {

			let info = this._tempColData2Info.get(eachData);
			let middle = info.middle;
			let isNew = !info.isDisplay;
			info.isDisplay = true;

			// 最後要出現在畫面上的相對位置
			let pos = this.getColsDisplayPos([eachData], displayRange_min, displayRange_max)[0];

			// 傳入參數
			let defaultArgs = {
				// 通用 ============

				// 顯示器
				view: this,
				// 滾輪表資料
				stripData: this._stripData,

				// 個別 ============
				// 當格資料
				colData: eachData,
				// 當格中介資料
				colMiddle: middle,
				// 當格容器
				colObjs: middle.objs,

				// 資料 ============
				// 是否為新產生
				isNew: isNew,
				// 滾輪基準位置
				reelPos: this.reelBasePos,
				// 當格位置 (盤面相對位置)
				pos: pos,
				// 上次位置
				lastPos: info.lastPos,

				isDebug: this.isDebug
			};

			// 以 指定的參數 覆寫 傳入參數
			let passArgs = Objf.assign(defaultArgs, renderArgs);

			// 執行 每個 顯示通道
			for (let eachPass of this.showPasses) {
				passArgs = eachPass.pass(passArgs)
			}
		}

	}

	/*
	#### ##    ##    ##     ## #### ######## ##      ## 
	 ##  ###   ##    ##     ##  ##  ##       ##  ##  ## 
	 ##  ####  ##    ##     ##  ##  ##       ##  ##  ## 
	 ##  ## ## ##    ##     ##  ##  ######   ##  ##  ## 
	 ##  ##  ####     ##   ##   ##  ##       ##  ##  ## 
	 ##  ##   ###      ## ##    ##  ##       ##  ##  ## 
	#### ##    ##       ###    #### ########  ###  ###  
	*/
	
	/** 取得已經在場上的格 */
	public getInViewCols () : Array<number> {
		return this._inViewColIdxs;
	}

	/** 是否正在顯示中 */
	public isInView (idx: number) : boolean {
		return this._inViewColIdxs.indexOf(idx) != -1;
	}

	/** 設置是否正在顯示中 */
	public setInView (idx: number, setTo: boolean) {
		let idxOf = this._inViewColIdxs.indexOf(idx);
		let isInView = idxOf != -1;

		if (setTo == true && isInView == false) {
			this._inViewColIdxs.push(idx);
		} else if (setTo == false && isInView == true) {
			this._inViewColIdxs.splice(idxOf, 1);
		}
	}

	/** 清除顯示 */
	public clearInView () {
		let self = this;
		self._inViewColIdxs = [];
		self._colIdx2Middle.forEach((v, k)=>{
			self._disableMiddle(v);
		});
	}

	/*
	##     ## #### ########  ########  ##       ######## 
	###   ###  ##  ##     ## ##     ## ##       ##       
	#### ####  ##  ##     ## ##     ## ##       ##       
	## ### ##  ##  ##     ## ##     ## ##       ######   
	##     ##  ##  ##     ## ##     ## ##       ##       
	##     ##  ##  ##     ## ##     ## ##       ##       
	##     ## #### ########  ########  ######## ######## 
	*/

	/** 取得 所有中介 */
	public getMiddles () : Array<ColMiddle> {
		let res = Array.from(this._colIdx2Middle.values());
		return res;
	}

	/** 請求 中介 */
	public getMiddle (colIdx: number) : ColMiddle {
		return this._colIdx2Middle.get(colIdx);
	}
	public requestMiddle (colData: ReelColData) : ColMiddle {
		
		if (this._colIdx2Middle.has(colData.idx)) {
			let middle = this._colIdx2Middle.get(colData.idx);
			middle.data = colData;
			return middle;
		} else {
			let middle = this.createMiddle(colData);
			this._colIdx2Middle.set(colData.idx, middle);
			return middle;
		}
	}

	/** 建立 中介 */
	public createMiddle (colData: ReelColData) : ColMiddle {
		let middle = new ColMiddle();
		middle.data = colData;
		return middle;
	}

	/** 銷毀中介 */
	public destroyMiddle (middle: ColMiddle) {
		let key;
		this._colIdx2Middle.forEach((v, k)=>{
			if (v == middle) key = k;
		});
		if (key) {
			this._colIdx2Middle.delete(key);
		}
	}

	/** 銷毀中介 */
	public destroyMiddleByIdx (idx: number) {
		if (this._colIdx2Middle.has(idx)) {
			this._colIdx2Middle.delete(idx);
		}
	}
	
	/** 銷毀中介 */
	public destroyMiddleByData (colData: ReelColData) {

		if (this._colIdx2Middle.has(colData.idx) == false) return;

		let middle = this.getMiddle(colData.idx);
		this.destroyMiddle(middle);
	}

	/** 清空中介 */
	public clearMiddles () {
		let self = this;
		let toRm = [];
		this._colIdx2Middle.forEach((v, k)=>{
			toRm.push(k);
		});
		toRm.forEach((k)=>{
			self.destroyMiddleByIdx(k);
		});
	}

	/*
	######## ######## ##     ## ########  
	   ##    ##       ###   ### ##     ## 
	   ##    ##       #### #### ##     ## 
	   ##    ######   ## ### ## ########  
	   ##    ##       ##     ## ##        
	   ##    ##       ##     ## ##        
	   ##    ######## ##     ## ##        
	*/

	/** 新增 暫時格 */
	public addTempCol (colData: ReelColData, tempColInfo: TempColInfo) : void {
		this._tempColData2Info.set(colData, tempColInfo);
	}

	/** 移除 暫時格 */
	public removeTempCol (colData: ReelColData) {
		if (this._tempColData2Info.has(colData) == false) return;

		let info = this._tempColData2Info.get(colData);
		
		this._disableMiddle(info.middle);

		this._tempColData2Info.delete(colData);
	}

	/** 清空 暫時格 */
	public clearTempCols () {
		this._tempColData2Info.forEach((v, k)=>{
			let info = v;
			this._disableMiddle(info.middle);
		});
		this._tempColData2Info.clear();
	}

	/** 取得 所有暫時格 */
	public getTempCols () : ColMiddle[] {
		let middles : ColMiddle[] = [];
		this._tempColData2Info.forEach((v, k)=>{
			middles.push(v.middle);
		});
		return middles;
	}
	public getTempColInfos () : TempColInfo[] {
		return Array.from(this._tempColData2Info.values());
	}

	/*
	 #######  ######## ##     ## ######## ########  
	##     ##    ##    ##     ## ##       ##     ## 
	##     ##    ##    ##     ## ##       ##     ## 
	##     ##    ##    ######### ######   ########  
	##     ##    ##    ##     ## ##       ##   ##   
	##     ##    ##    ##     ## ##       ##    ##  
	 #######     ##    ##     ## ######## ##     ## 
	*/

	/** 取得格資料的世界位置 */
	public getColWorldPos (col: number) : cc.Vec2[] {
		if (this._colIdx2Middle.has(col) == false) return null;
		
		let res = [];

		let middle = this._colIdx2Middle.get(col);
		if (middle == null) return res;

		if (middle.objs.length == 0) return res;
		for (let each of middle.objs) {
			res.push(each.getWorldPosition());
		}

		return res;
	}

	/** 取得世界位置 */
	public getWorldPos () : cc.Vec2 {
		let worldPos = this.node.parent.convertToWorldSpaceAR(this.node.position);
		return new cc.Vec2(worldPos.x, worldPos.y);
	}
	
	/** 取得 格 在顯示上 的 相對位置 */
	public getColsDisplayPos (_colDatas: ReelColData[] | number[], displayRange_min: number = null, displayRange_max: number = null) : number[] {
				
		let res = [];

		let colDatas = [];

		if (_colDatas.length > 0 && typeof(_colDatas[0]) == "number") {
			for (let each of _colDatas) {
				colDatas.push(this._stripData.getColByIdx(each as number));
			}
		} else {
			colDatas = _colDatas;
		}

		// 總長度
		let totalLength = this._stripData.totalLength;

		// 顯示區域範圍 的 首/末端
		if (displayRange_min == null) 
			displayRange_min = this.currentPos - this.displayRange_back;

		if (displayRange_max == null) 
			displayRange_max = this.currentPos + this.displayRange_forward;

		for (let colData of colDatas) {

			// 格資料的位置
			let eachPos = colData.pos;
			// 格資料的顯示範圍 (實際位置)
			let eachDisplayRange = colData.getDisplayRange();

			// 若 格的本體位置 與 格的顯示範圍首端 都 超過 顯示範圍的末端 則
			if (eachPos > displayRange_max && eachDisplayRange[0] > displayRange_max) {
				// 試著 將 該格位置 拉回前段循環
				eachPos -= totalLength;
			}
			// 若 格的本體位置 與 格的顯示範圍末端 都 前於 顯示範圍的首端 則
			else if (eachPos < displayRange_min && eachDisplayRange[1] < displayRange_min) {
				// 試著 將 該格位置 推向後段循環
				eachPos += totalLength;
			}

			// 最後要出現在畫面上的相對位置
			let pos = eachPos - this.currentPos;

			res.push(pos);
		}

		return res;
	}

	/** 取得通道 */
	public getPass (passID: string) : ReelRowViewPass {
		for (let each of this.showPasses) {
			if (each.passID == passID) {
				return each;
			}
		}
		return null;
	}

	/** 取得 圖標格物件 */
	public getColObjs (col: number) : ReelColObj[] {
		let middle : ColMiddle = this.getMiddle(col);
		if (middle == null) return null;

		let res = [];
		for (let each of middle.objs) {
			res.push(each);
		}
		return res;
	}

	/** 請求 格物件 */
	public requestColObj () : ReelColObj {
		if (this._unUseObjs.length > 0) {
			return this._unUseObjs.pop();
		} else {
			return this._createColObj(this._colObjs.length+1);
		}
	}

	/*== Private Function =========================================*/

	/**
	 * 渲染-顯示區域限制
	 * @param passCols 處理中 要顯示的滾輪格
	 */
	private _render_displayRangeLimit (passCols: Array<ReelColData>) : Array<ReelColData> {

		// cc.log("=========================")
		let stripRange = this._stripData.loopRange;

		// 顯示門檻 為 	
		let displayRange = [
			this.currentPos - (this.displayRange_back - 0.000001),
			this.currentPos + (this.displayRange_forward - 0.000001)
		];

		let toShowCols = [];
		for (let eachCol of passCols) {

			// 目標格範圍 於 目標格位置 的 相對位置
			let colDisplayRange = eachCol.getDisplayRange();

			let colDisplayRangeMin = colDisplayRange[0];
			let colDisplayRangeMax = colDisplayRange[1];

			// 循環處理
			colDisplayRangeMin = Mathf.loop(colDisplayRangeMin, stripRange[0], stripRange[1]);
			colDisplayRangeMax = Mathf.loop(colDisplayRangeMax, stripRange[0], stripRange[1]);
		

			// 若 該格位置 或 該格顯示區域 與 顯示範圍 相交
			if (Mathf.isInRangeLoop(eachCol.pos, displayRange, stripRange) || Mathf.isRangeIntersectLoop(eachCol.getDisplayRange(), displayRange, stripRange)) {
				
				// 放入 要顯示的格 中
				toShowCols.push(eachCol);
			}
		}

		// 排序
		toShowCols.sort((a, b)=>{
			return Math.abs(a.pos) - Math.abs(b.pos);
		});
		
		// 只取 一次能顯示的數量
		// toShowCols = toShowCols.slice(0, this.displayCount);

		return toShowCols;
	}

	/**
	 * 渲染-暫存衝突限制
	 * @param passCols 處理中 要顯示的滾輪格
	 */
	 private _render_tempConflictLimit (passCols: Array<ReelColData>) : Array<ReelColData> {

		let stripRange = this._stripData.loopRange;

		let tempColInfos = this.getTempColInfos();

		let toHideCols = [];
		for (let eachCol of passCols) {
			
			// 目標格範圍 於 目標格位置 的 相對位置
			let colTriggerRange = eachCol.getTriggerRange();

			// 每個暫存格
			for (let eachTempInfo of tempColInfos) {
				// 若 該暫存格 沒有顯示任何 則 略過不檢查
				if (eachTempInfo.middle.isAnyObjActive() == false) continue;

				let eachTempData = eachTempInfo.middle.data;
	
				// 重疊門檻 為 	
				let tempColRange = [
					Mathf.loop(eachTempData.pos - eachTempData.triggerRange_relative[0] + 0.000001, stripRange[0], stripRange[1]),
					Mathf.loop(eachTempData.pos + eachTempData.triggerRange_relative[1] - 0.000001, stripRange[0], stripRange[1])
				];
	
				// 若 該格位置 或 格的顯示範圍首/末端 與 暫存格重疊 中
				if (Mathf.isInRangeLoop(eachCol.pos, tempColRange, stripRange) || Mathf.isRangeIntersectLoop(colTriggerRange, tempColRange, stripRange) ){
					// 放入 要隱藏的格 中
					toHideCols.push(eachCol);
					break;
				}
			}
		}

		passCols = passCols.filter((v)=>{
			return (toHideCols.indexOf(v) == -1);
		});
		return passCols;
	}


	/** 棄用 格物件 */
	private _disableMiddle (colMiddle: ColMiddle) : void {
		// 每個 該中介的 格物件
		for (let each of colMiddle.objs) {
			
			// 清空 圖標
			each.setSymbol(null);
			
			// 回收 格物件
			this._recoveryColObj(each);

			// 若 中介 持有 該格物件 的 執行期資料 則 移除
			if (colMiddle.runtimeArgs.has(each)) {
				colMiddle.runtimeArgs.delete(each);
			}
		}
		// 清空
		colMiddle.objs = [];
	}


	/** 回收 格物件 */
	public _recoveryColObj (colObj: ReelColObj) : void {
		if (this._unUseObjs.indexOf(colObj) != -1) return;
		this._unUseObjs.push(colObj);
		colObj.setActive(false);
	}

	/** 建立 格物件 */
	private _createColObj (idx: number) : ReelColObj {
		let node = cc.instantiate(this.colObjPrefab);
		node.parent = this.colRootNode == null? this.node : this.colRootNode;

		let colObj = node.getComponent(ReelColObj);

		colObj.id = "obj["+idx.toString()+"]";

		colObj.fxRoot = this.colFXRootNode;

		this._colObjs.push(colObj);

		colObj.setActive(false);
		
		return colObj;
	}
	
}
