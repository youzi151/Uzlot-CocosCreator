
import { PointData } from "../index_Curve";
import { BezierData, Mathf } from "../../../Uzil";
import { EaseType } from "./PointData";


// API : https://pomax.github.io/bezierjs/

export class CurveData {

	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/**
	 * 創建
	 * @param data 資料
	 */
	public static create (data: Object) : CurveData {
		let curve = new CurveData();
		curve.init(data);
		return curve;
	}

	/**
	 * 透過Json創建
	 * @param json json資料
	 */
	public static json (json: string) : CurveData {
		let data = JSON.parse(json);
		return CurveData.create(data);
	}

	/*== Member ===================================================*/

	/** 時間長度 */
	public length : number = 0;

	/** 曲線列表 */
	public points : Array<PointData> = [];

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/
	
	/*== 基本功能 =================*/

	/**
	 * 初始化
	 * @param args 資料
	 */
	public init (data: Object) : void {

		this.points = [];

		// 路徑點
		if (data.hasOwnProperty('points')) {
			
			let pointDatas = data['points'];
			
			for (let each of pointDatas) {

				let point = PointData.create(each);

				this.points.push(point);

			}

		}

		// 長度
		if (data.hasOwnProperty('length')) {
			this.length = data['length'];
		}

	}

	/**
	 * 取得起始值
	 * @param time 時間點
	 */
	public compute (time: number) : number {
		return this.getVal(time);
	}

	/**
	 * 取得起始值
	 * @param time 時間點
	 */
	public getVal (time: number) : number {
		if (this.points.length == 0) return 0;
		if (this.points.length == 1) return this.points[0].pos.y;


		//== 轉換傳入時間為曲線中時間 ====================

		let fistPoint = this.points[0];
		let lastPoint = this.points[this.points.length-1];

		let startTime = fistPoint.pos.x;
		let endTime = lastPoint.pos.x;

		let targetTime = Mathf.clamp(time, 0, this.length);
		let curveTime = (endTime * targetTime) / this.length; //比例式

		// cc.log("curveTime["+curveTime+"] = time["+time+"] * endTime["+endTime+"]\n/ length["+this.length+"]")

		//== 取得 曲線 的 起點 與 終點 ===================

		let start = fistPoint;
		let end = lastPoint;

		if (curveTime == start.pos.x) return start.pos.y;
		if (curveTime == end.pos.x) return end.pos.y;

		let eachPoint;
		
		for (let idx = 1; idx < this.points.length; idx++) {

			eachPoint = this.points[idx];

			// 若 該路徑點位置 在 指定時間內 則 更新 起點 為 該路徑點
			if (eachPoint.pos.x < curveTime) {
				start = eachPoint;
			}
			// 若 該路徑點位置 超過 指定時間 則 設 終點 為 該路徑點 並跳出
			else {
				end = eachPoint;
				break;
			}

		}

		//== 取得 曲線 的 指定點 ===================

		// 建立貝茲曲線
		let startX   = start.pos.x
		let startY   = start.pos.y;
		let endX     = end.pos.x
		let endY     = end.pos.y;
		let easeOutX = startX + start.easeOut.x;
		let easeOutY = startY + start.easeOut.y;
		let easeInX  = endX + end.easeIn.x;
		let easeInY  = endY + end.easeIn.y;

		// 依照緩動類型改變設置

		// 左側/前一個路徑點的出
		let outType = start.getEaseOutType();
		if (outType == EaseType.constant) {
			return start.pos.y;
		} else if (outType == EaseType.linear) {
			easeOutX = startX;
			easeOutY = startY;
		} else if (outType == EaseType.free) {

		}

		// 右側/下一個路徑點的入
		let inType = end.getEaseInType();
		if (inType == EaseType.linear) {
			easeInX = endX;
			easeInY = endY;
		} else if (outType == EaseType.free) {
			
		}

		let bezier = new BezierData(
			startX, startY,
			easeOutX, easeOutY,
			easeInX, easeInY,
			endX, endY
		);

		// 與該時間點(y)的交集
		let bbox = bezier.bbox();
		let line = {p1:{x:curveTime, y: bbox.y.min-1}, p2:{x:curveTime, y:bbox.y.max+1}};
		let intersects = bezier.intersects(line);
		if (intersects.length == 0) {
			cc.log(bbox);
			return 0;
		}
		let intersectTime = intersects[0];
		let intersectPos:any = bezier.compute(intersectTime);

		return intersectPos.y;
	}

	/** 取得起始值 */
	public getStartVal () : number {
		return this.getVal(0);
	}

	/** 取得終點值 */
	public getEndVal () : number {
		return this.getVal(this.length);
	}

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

}
