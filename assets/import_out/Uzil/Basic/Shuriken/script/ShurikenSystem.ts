import { Time } from "../../../Uzil";

import {
	Shuriken,
	ShurikenEmitter,
	ShurikenEmitter_Base,
} from "../index_Shuriken";

export class ShurikenSystem {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 是否正在發射 */
	public isEmitting : boolean = false;
	
	/** 容器 */
	public container : cc.Node = null;

	/** 來源樣本 */
	public shurikenSource : cc.Prefab = null;
	
	/** 發射中的粒子 */
	private _emits : Array<Shuriken> = [];

	/** 物件池 */
	private _pool : Array<Shuriken> = [];

	/** 上限數量 */
	public maxCount : number = 50;

	/** 時間比例 */
	public timeScale : number = 1;


	/*== 發射粒子設置 =================*/
	
	/** 發射粒子 預設生命時間 */
	public lifeTime_sec : number = 5;

	/** 發射 間隔時間 */
	public delay_sec : number = 0;
	public emitCD : number = 0;

	/** 每次發射的數量 */
	public countPerEmit : number = 1;

	/** 發射器 */
	protected _emitter : ShurikenEmitter = new ShurikenEmitter_Base();
	get emitter () {
		return this._emitter;
	}
	set emitter (val) {
		this._emitter = val;
		this._emitter.system = this;
	}

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/

	/**
	 * 設置 發射器
	 * @param emitter 發射器
	 */
	public setEmitter (emitter: ShurikenEmitter) : void {
		this.emitter = emitter;
		emitter.system = this;
	}

	/**
	 * 取得發射容器
	 * @returns 取得發射容器
	 */
	/*  */
	public getContainer () : cc.Node {
		if (this.container){
			return this.container;
		} else {
			return cc.director.getScene();
		}
	}

	/** 更新 */
	public update (deltaTime: number) : void {
		
		let dt = deltaTime * Time.timeScale * this.timeScale;
		
		//== 粒子 ====================
		// 所有粒子 
		let copy = this._emits.slice();
		for (let each of copy){
			
			// 自身更新
			each.update(dt);

			if (each.life_sec <= 0) {
				this.recovery(each);
			}

		}


		//== 發射 ====================
		// 若發射中
		if (this.isEmitting){


			// 若CD歸零
			if (this.emitCD <= 0){

				// 發射多個
				for (let i = 0; i < this.countPerEmit; i++){

					// 若超過最大數量 則 跳出
					if (this._emits.length >= this.maxCount){
						break;
					}

					// 發射
					this.emit();

					this.emitCD = this.delay_sec;

				}
			}

			// 否則 繼續扣CD
			else {
				this.emitCD -= dt;
			}

		}


		//== 粒子 ====================
		
		// 依照z軸位置排序
		this._emits.sort((a, b)=>{return a.compare(b);});
		for (let i = 0; i < this._emits.length; i++){
			this._emits[i].setOrder(i);
		}
		
		// 所有粒子 刷新顯示
		for (let each of this._emits){
			each.render();
		}

	}

	/*== 發射控制 ==========================*/

	/** 開始發射 */
	public start () : void {
		this.clear();
		this.resume();
	}

	/** 恢復發射 */
	public resume () : void {
		this.isEmitting = true;
	}

	/** 暫停發射 */
	public pause () : void {
		this.isEmitting = false;
	}

	/** 終止發射 */
	public stop () : void {
		this.pause();
		this.clear();
	}
	
	/*== 粒子管理 ===========================*/

	/**
	 * 準備
	 * @param count 要事先準備的數量
	 */
	public prepare (count: number) : void {
		for (let i = this._pool.length-1; i < count; i++) {
			this._pushToPool(this._create());
		}
	}

	/** 發射 */
	public emit () : Shuriken {
		// 請求
		let shuriken = this.request();

		shuriken.life_sec = this.lifeTime_sec;
		
		// 放入 已發射
		this._emits.push(shuriken);
		
		// 用發射器發射
		this.emitter.emit(shuriken);

		// 啟用
		shuriken.node.active = true;

		return shuriken;
	}

	/** 清空 */
	public clear () : void {
		let emits = this._emits.slice();
		for (let shuriken of emits){
			this.recovery(shuriken);
		}
		this._emits = [];
	}

	/** 請求 */
	public request () : Shuriken {
		if (this._pool.length > 0){
			return this._pool.shift();
		}else{
			return this._create();
		}
	}

	/**
	 * 回收
	 * @param shuriken 要回收的粒子
	 */
	public recovery (shuriken: Shuriken) : void {
		// 從已發射成員移除
		let idx = this._emits.indexOf(shuriken);
		if (idx != -1){
			this._emits.splice(idx, 1);
		}

		// 放回物件池
		this._pushToPool(shuriken)
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/
	
	/** 創建粒子 */
	private _create () : Shuriken {
		// 產生新的物件
		let copy = cc.instantiate(this.shurikenSource);
	
		// 若有容器 則 設置
		copy.parent = this.getContainer();
		
		// 設置物件
		let shuriken = new Shuriken();
		shuriken.node = copy;

		return shuriken;
	}

	/** 放入物件池 */
	private _pushToPool (shuriken: Shuriken) : void {
		// 關閉
		shuriken.setActive(false);

		// 放回物件池
		this._pool.push(shuriken);
	}



}

