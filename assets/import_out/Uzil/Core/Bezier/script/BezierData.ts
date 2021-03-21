
import Bezier from "../lib/bezier";

export class BezierData {

	/*== Constructor ==============================================*/

	constructor (...coords) {
		this._bezier = new Bezier(coords);
	}

	/*== Static ===================================================*/

	public static easyBezier (m1x, m1y, m2x, m2y) : BezierData {
		return new BezierData(0,0,m1x,m1y,m2x,m2y,1,1);
	}

	/*== Member ===================================================*/

	private _bezier : Bezier = null;

	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/
	
	/*== 基本功能 =================*/

	/** 計算 */
	public compute (time: number) : number {
		return this._bezier.compute(time);
	}

	/** 長度 */
	public length () : number {
		return this._bezier.length();
	}

	/** 交叉位置 */
	public intersects (line:any) : Array<any> {
		return this._bezier.intersects(line);
	}

	/** 矩形 */
	public bbox () : any {
		return this._bezier.bbox();
	}
	

	/*== 其他功能 =================*/

	/*== Private Function =========================================*/

}
