import { Objf, Values } from "../../../../Uzil/Uzil";
import { ReelColObj } from "../ReelColObj";
import { ReelColData } from "./ReelColData";

/**
 * 中介
 * 在ReelRowView中，負責保持 ColData資料 與 ColObj物件 之前的關係
 * 並暫存 已經被建立到場中 的 ColObj物件 運行時參數。
 */
export class ColMiddle {

	/* 格資料 */
	public data : ReelColData = null;

	/* 持有的顯示物件 */
	public objs : Array<ReelColObj> = [];

	/* 參數 */
	public args : Object = {};

	/* 執行時期參數 (僅限 ReelColObj 存在時) */
	public runtimeArgs : Map<ReelColObj, Map<string, Values>> = new Map<ReelColObj, Map<string, Values>>();

	/** 是否有任何物件啟用中 */
	public isAnyObjActive () : boolean {
		for (let each of this.objs) {
			if (each.node.active) {
				return true;
			}
		}
		return false;
	}
	
	/** 取得參數 */
	public getArgs (colObj: ReelColObj = null) : Object {
		// 若 有指定 ColObj 且 存在於 執行期參數 中
		if (colObj != null && this.runtimeArgs.has(colObj)) {
			
			// 取用
			let key2Values = this.runtimeArgs.get(colObj);
			
			// 要覆寫的參數
			let runtimeOverride = {};

			// 該 ColObj物件 的 每一個執行期參數 覆寫到
			key2Values.forEach((val, key)=>{
				runtimeOverride[key] = val.getCurrent();
			});
			
			// 回傳 覆寫 預設參數 與 執行期覆寫參數 的 新物件
			return Objf.assign({}, this.args, runtimeOverride);
		}

		
		// 預設 回傳預設參數
        return this.args;
	}

	/** 設置 執行期參數 */
	public setRuntimeArgs (colObj: ReelColObj, tag: string, priority: number, args: Object) {
		
		// 更新 執行期參數
		this.updateRuntimeArgs();

		// 若沒有指定 優先度 則 視為 0
		if (priority == undefined || priority == null) {
			priority = 0;
		}

		// 現存的 該 ColObj 的 args
		let existK2V : Map<string, Values>;
		// 若 存在 則 取用
		if (this.runtimeArgs.has(colObj)) {
			existK2V = this.runtimeArgs.get(colObj);
		}
		// 否則 建立
		else {
			existK2V = new Map<string, Values>();
			this.runtimeArgs.set(colObj, existK2V);
		}

		// 每一個要設置的參數
		for (let key of Object.keys(args)) {

			let val = args[key];
			
			// 現存的 值物件
			let values : Values;
			// 若 存在 則 取用
			if (existK2V.has(key)) {
				values = existK2V.get(key);
			}
			// 否則 建立
			else {
				values = new Values(val);
				existK2V.set(key, values);
			}

			// 對 值物件 設置 值 與 優先度
			values.set(tag, priority, val);
		}

	}

	/** 移除 執行期參數 */
	public delRuntimeArgs (colObj: ReelColObj, tag: string) {

		// 要移除的
		let toDel : ReelColObj[];
		// 若 指定的ColObj 為 空
		if (colObj == null) {
			// 設 要移除的對象 為 所有ColObj
			toDel = this.objs;
		} 
		// 否則 設定指定
		else {
			toDel = [colObj];
		}
		
		// 每一個要移除的
		for (let each of toDel) {
			
			// 若 未持有 則 忽略
			if (this.runtimeArgs.has(each) == false) continue;

			// 取得 該物件 的 參數表
			let existK2V = this.runtimeArgs.get(each);
			// 每一個值物件 移除 該Tag
			existK2V.forEach((values, k)=>{
				values.remove(tag);
			});
		}

		this.updateRuntimeArgs();
	}

	/** 更新 執行期參數 */
	public updateRuntimeArgs () {
		
		let toRm = [];
		
		// 每一個 執行期參數 中 的 ColObj
		this.runtimeArgs.forEach((v, k)=>{
			// 若 該物件 已經不存在 則加入移除列表中
			if (this.objs.indexOf(k) == -1) {
				toRm.push(k);
			}
		});

		// 所有 要移除的 從 執行期參數 中 移除
		for (let rm of toRm) {
			this.runtimeArgs.delete(rm);
		}
	}

	public getRuntimeArgsCopy () {
		let newOne = new Map<ReelColObj, Map<string, Values>>();
		this.runtimeArgs.forEach((values, colObj)=>{
			let copyValues = new Map<string, Values>();
			values.forEach((v, k)=>{
				copyValues.set(k,v);
			});
			newOne.set(colObj, copyValues);
		});
		return newOne;
	}

}