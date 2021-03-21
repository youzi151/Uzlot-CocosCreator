
export class Mathf {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/** 轉換為二維向量 */
	public static toVec2 (val: any) : cc.Vec2 {
		if (val instanceof cc.Vec3){
			return new cc.Vec2(val.x, val.y);
		}
		
		else if (typeof val == 'number'){
			return new cc.Vec2(val, val);
		}
	}

	/** 轉換為三維向量 */
	public static toVec3 (val: any) : cc.Vec3 {
		if (val instanceof cc.Vec2){
			return new cc.Vec3(val.x, val.y, 0);
		}
		
		else if (typeof val == 'number'){
			return new cc.Vec3(val, val, val);
		}
	}

	/**
	 * 限制範圍內
	 * @param value 值 
	 * @param min 最小值
	 * @param max 最大值
	 */
	public static clamp (value: number, min: number, max: number) : number {
		if (value < min) return min;
		else if (value > max) return max;
		else return value;
	}
	
	/** 線性插值 */
	public static lerp (from: number, to: number, percent: number) : number {
		return from + ((to - from)*percent);
	}

	/** 線性插值 (二維向量) */
	public static lerpV2 (from: cc.Vec2, to: cc.Vec2, percent: number) : cc.Vec2 {
		return from.add(to.sub(from).mul(percent));
	}

	/** 移動 量 */
	public static moveToward (from: number, to: number, movement: number) : number {

		let diff = to - from;
		let length = Math.abs(diff);

		if (diff == 0) return from;
		
		let normal = 0;
		if (diff > 0) {
			normal = 1;
		}else {
			normal = -1;
		}
		
		let res = from + (normal * Math.min(movement, length));
		
		if (isNaN(res)){
			return 0;
		}

		return res;
	}

	/** 移動 二維向量 */
	public static moveTowardV2 (from: cc.Vec2, to: cc.Vec2, movement: number) : cc.Vec2 {
		if (movement == 0) return from;

		let diff = to.sub(from);
		let length = diff.mag();
		
		// 取得 方向
		if (length && length != 1) {
			diff = diff.normalize();
		}

		// 取 位移 與 離終點距離 之中 較小方
		let toAdd = diff.mul(Math.min(movement, length));

		// 增加
		let res = from.add(toAdd);
		return res;
	}

	/** 移動 旋轉量 */
	public static rotateToward (from: number, to: number, movement: number) : number {
		let a = Mathf.validAngle(from);
		let b = Mathf.validAngle(to);

		if (a == b) return to;

		let way1 = b - a;
		let way2 = (b + (b > a? -360 : 360)) - a;
		
		let way1Abs = Math.abs(way1);
		let way2Abs = Math.abs(way2);

		let length = 0;
		let isClockwise = false;
		if (way1Abs < way2Abs){
			length = way1Abs;
			isClockwise = way1 > 0;
		}else{
			length = way2Abs;
			isClockwise = way2 > 0;
		}
		let normal = isClockwise? 1 : -1;

		return from + normal*(Math.min(length, movement));


	}

	/** 
	 * 取得正確角度
	 * 將定義角度(負數或超過360度)轉換為實際角度(0~360)
	 */
	public static validAngle (angle: number) : number {
		while (angle < 0){
			angle += 360;
		}
		while (angle > 360){
			angle -= 360;
		}
		return angle;
	}

	/** 角度轉換為二維向量 */
	public static angleToVec2 (angle: number) : cc.Vec2 {
		let radians = cc.misc.degreesToRadians(angle);
		let res = new cc.Vec2(Math.sin(radians), Math.cos(radians));
		return res;
	}

	/** 
	 * 取得角度差
	 * 計算定義角度的實際角度差，可指定順逆方向
	 */
	public static angleDelta (from: number, to: number, isClockWise: boolean = true) {
		if (to == from) return 0;
		if (Math.abs(to - from) == 360) return 360;

		let angle_from = 0;
		let angle_to = 0;

		// 若是 順時針 則 起始角度 為 來源, 終點角度為終點 取餘數
		if (isClockWise){
			angle_from = from%360;
			angle_to = to%360;
		}
		// 若是 逆時針 則 起始角度 為 終點, 終點角度為來源 取餘數
		else{
			angle_to = from%360;
			angle_from = to%360;
		}
		
		// 若角度相同 則 返回 0
		if (angle_from == angle_to) return 0;
		
		// 若 終點角度 小于 起始角度 則 補正終點數值(加一圈)
		if (angle_to < angle_from){
			angle_to += 360;
		}
		
		//返回 終點角度 - 起點角度
		return angle_to - angle_from;
	}

	/** 循環數 */
	public static loop (num: number, min: number, max: number) : number {
		if (num == max) return min;
		if (num >= min && num <= max) return num;

		if (num < 0) {
			num = Math.ceil(num * 1000) * 0.001;
		} else {
			num = Math.floor(num * 1000) * 0.001;
		}
		
		// 防呆
		let start, end;
		if (min < max) {
			start = min; end = max;
		} else {
			start = max; end = min;
		}

		// 循環長度
		let length = (end - start);

		let newNum = num;
		if (num < min) {
			// 從終點 往前算 (終點到指定數 餘 循環長度)
			newNum = end - Math.abs((num-end) % length);
		} else if (num > max) {
			// 從起點 往後算 (起點到指定數 餘 循環長度)
			newNum = start + Math.abs((num-start) % length);
		}

		if (newNum == max) {
			newNum = 0;
		}

		return newNum;
	}

	/** 以絕對值 去 增加 */
	public static addAbs (num: number, addNum: number) : number {
		return num + (num < 0 ? -addNum:addNum);
	}

	/** 最小 */
	public static minAbs (...nums: Array<number>) : number {
		let min = nums[0];
		let minAbs = Math.abs(nums[0]);
		for (let each of nums) {
			let eachAbs = Math.abs(each);
			if (eachAbs < minAbs) {
				minAbs = eachAbs;
				min = each;
			}
		}
		return min;
	}
	public static min (...nums: Array<number>) : number {
		let min;
		for (let each of nums) {
			if (each == null || each == undefined) continue;
			if (each < min || min == undefined) {
				min = each;
				continue;
			}
		}
		return min;
	}

	/** 最大 */
	public static max (...nums: Array<number>) : number {
		let max;
		for (let each of nums) {
			if (each == null || each == undefined) continue;
			if (each > max || max == undefined) {
				max = each;
				continue;
			}
		}
		return max;
	}

	/** 是否在範圍中 */
	public static isInRange (num: number, from: number, to: number) {
		return (num >= from && num <= to);
	}
	public static isInRangeLoop (num: number, range: number[], loopRange: number[]) {
		let from = range[0], to = range[1];
		let min = loopRange[0], max = loopRange[1];

		num = Mathf.loop(num, min, max);
		from = Mathf.loop(from, min, max);
		to = Mathf.loop(to, min, max);

		let isInRangeLoop = (num >= from && num <= to);
		if (from > to) {
			isInRangeLoop = (num > from && num > to) || (num < from && num < to);
		}
		// num:2, from:-0.5, to:0.5, min:-0.5, max:6.5
		// cc.error("num:"+num+", from:"+from+", to:"+to+", min:"+min+", max:"+max+" isInRangeLoop:"+isInRangeLoop)
		return isInRangeLoop;
	}

	/** 範圍相交 */
	public static isRangeIntersect (fromA: number, toA: number, fromB: number, toB: number) {
		if (fromA == fromB || fromA == toB || toA == fromB || toA == toB) return true;
		if (Mathf.isInRange(fromA, fromB, toB) || Mathf.isInRange(toA, fromB, toB) ||
			Mathf.isInRange(fromB, fromA, toA) || Mathf.isInRange(toB, fromA, toA)) return true;
		return false;
	}
	public static isRangeIntersectLoop (a: number[], b: number[], loopRange: number[]) {
		let min = loopRange[0], max = loopRange[1];
		let fromA = Mathf.loop(a[0], min, max), toA = Mathf.loop(a[1], min, max);
		let fromB = Mathf.loop(b[0], min, max), toB = Mathf.loop(b[1], min, max);
		
		if (fromA == fromB || fromA == toB || toA == fromB || toA == toB) return true;

		if (Mathf.isInRangeLoop(fromA, [fromB, toB], [min, max]) || Mathf.isInRangeLoop(toA, [fromB, toB], [min, max]) ||
			Mathf.isInRangeLoop(fromB, [fromA, toA], [min, max]) || Mathf.isInRangeLoop(toB, [fromA, toA], [min, max])) return true;
		return false;
	}

	public static getOffsetsLoop (from: number, to: number, min: number, max: number) : number[] {
		let length = max - min;
		
		from = Mathf.loop(from, min, max);
		to = Mathf.loop(to, min, max);
		if (from == to) return [0, 0];

		let offset = to - from;

		let offset_alt;
		if (offset > 0) offset_alt = (to - length) - from;
		else offset_alt = (to + length) - from;

		let offsets = [
			Mathf.min(offset, offset_alt),
			Mathf.max(offset, offset_alt)
		];

		return offsets;
	}

	public static clampRangeLoop (target: number[], border: number[], loopRange: number[]) : number[] {
		let targetRange = target.slice();
		let borderRange = border.slice();
		let min = loopRange[0];
		let max = loopRange[1];

		//===============
		let loop = (val)=>{
			return Mathf.loop(val, min, max);
		}
		// cc.log(targetRange, borderRange);

		targetRange = targetRange.map(loop);
		borderRange = borderRange.map(loop);

		// cc.log(targetRange, borderRange);
		
		let totalOffset = 0;
		let isTargetReverse = targetRange[0] > targetRange[1];
		let isBorderReverse = borderRange[0] > borderRange[1];

		while (isTargetReverse || isBorderReverse) {
			
			let offsets = [];
			if (isTargetReverse) {
				offsets.push(targetRange[0]);
			}
			if (isBorderReverse) {
				offsets.push(borderRange[0]);
			}

			// cc.log(offsets);
			let offset = 0;
			if (offsets.length > 0) {
				offset = Mathf.min(...offsets);
			}
			
			totalOffset += offset;

			targetRange = targetRange.map((val)=>{ return loop(val - offset)} );
			borderRange = borderRange.map((val)=>{ return loop(val - offset)} );
			
			isTargetReverse = targetRange[0] > targetRange[1];
			isBorderReverse = borderRange[0] > borderRange[1];
			
		}
		// cc.log(targetRange, borderRange);
		
		let res = [
			Mathf.max(targetRange[0], borderRange[0]),
			Mathf.min(targetRange[1], borderRange[1])
		];
		// cc.log(res);

		res[0] = Mathf.min(res[0], borderRange[1]);
		res[1] = Mathf.max(res[1], borderRange[0]);

		// cc.log(res);
		
		res = res.map((val)=>{ return loop(val + totalOffset) });

		// cc.log(res);
		
		return res;
	}

	/** 分割範圍 */
	public static sliceRange (target_min, target_max, border_min, border_max) {

		let res = [];

		let isSlice_min = Mathf.isInRange(border_min, target_min, target_max);
		let isSlice_max = Mathf.isInRange(border_max, target_min, target_max);

		if (!isSlice_min && !isSlice_max) return res;

		if (isSlice_min) {
			res.push([target_min, border_min]);
		} else {
			res.push([target_min, border_max]);
		}
		
		if (isSlice_min && isSlice_max) {
			res.push([border_min, border_max]);
		}

		if (!isSlice_max) {
			res.push([border_min, target_max]);
		} else {
			res.push([border_max, target_max]);
		}

		return res;
	}

	/*== Member ===================================================*/
	
	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

export class RandomRange {

	constructor (val: any, val2: any = undefined) {
		if (val2){
			this.set([val, val2]);
		}else{
			this.set(val);
		}
	}

	public min : number = 0;
	public max : number = undefined;

	public set (val: any) {
		if (typeof val == 'number'){
			this.min = 0;
			this.max = val;
		}else if (val instanceof Array && val.length >= 2){
			this.min = val[0];
			this.max = val[1];
		}
		return this;
	}
	public get () : number {
		return this.random();
	}

	public getInt () : number {
		return Math.floor(this.random());
	}

	public getFloat () : number {
		return Math.random() * (this.max - this.min) + this.min;
	}
	
	public random () : number {
		if (this.min == this.max) return this.min;
		return Math.random() * (this.max - this.min + 1) + this.min;
	}
}