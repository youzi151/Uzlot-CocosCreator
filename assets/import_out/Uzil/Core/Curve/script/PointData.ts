
export enum EaseType {
	/* 自由(固定長度僅旋轉) */
	free,
	/* 直線 */
	linear, 
	/* 階段 */
	constant,
	/* 加權(完全自由位移旋轉) */
	weighted
}

export class PointData {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/**
	 * 創建
	 * @param data 資料
	 */
	public static create (data: Object) : PointData {

		let point = new PointData();

		/* 位置 */
		if (data.hasOwnProperty('pos')) {
			let pos = data['pos'];
			point.pos = PointData.arrayToV2(pos);
		}

		/* 緩動 */
		if (data.hasOwnProperty('easeIn')) {
			let easeIn = data['easeIn'];
			point.easeIn = PointData.arrayToV2(easeIn);
		}
		if (data.hasOwnProperty('easeOut')) {
			let easeOut = data['easeOut'];
			point.easeOut = PointData.arrayToV2(easeOut);
		}

		/* 緩動控制桿類型 */
		if (data.hasOwnProperty('easeType')) {
			let arr : Array<string> = data['easeType'];
			let easeTypeArr : Array<EaseType> = [];
			for (let each of arr) {
				easeTypeArr.push(EaseType[each]);
			}
			point.easeType = easeTypeArr;
		}
		
		return point;
	}

	/**
	 * 透過Json創建
	 * @param json json資料
	 */
	public static json (json: string) : PointData {
		let data: Object = JSON.parse(json);
		if (!data) return null;

		return PointData.create(data);
	}

	/**
	 * 陣列轉向量vec2
	 * @param arr 
	 */
	private static arrayToV2 (arr: Array<number>) : cc.Vec2 {
		return new cc.Vec2(arr[0], arr[1]);
	}

	/*== Member ===================================================*/

	/** 位置 */
	public pos : cc.Vec2 = cc.Vec2.ZERO;
	/** 緩入調節 */
	public easeIn : cc.Vec2 = cc.Vec2.ZERO;
	/** 緩出調節 */
	public easeOut : cc.Vec2 = cc.Vec2.ZERO;
	/** 緩動類型 */
	public easeType : Array<EaseType> = [EaseType.weighted];
	
	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/
	
	/*== 基本功能 =================*/

	/** 取得左側緩動類型 */
	public getEaseInType () : EaseType {
		return this.easeType[0];
	}

	/** 取得右側緩動類型 */
	public getEaseOutType () : EaseType {
		if (this.easeType.length == 1) {
			return this.easeType[0];
		} else if (this.easeType.length == 2) {
			return this.easeType[1];
		}
	}

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

}
