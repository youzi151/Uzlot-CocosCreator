import { each as _each } from "./Async_Each";
import { eachSeries as _eachSeries } from "./Async_EachSeries";
import { waterfall as _waterfall } from "./Async_Waterfall";
import { 
	parallel as _parallel,
	parallelWithEach as _parallelWithEach
} from "./Async_Parallel";

export class Async {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/**
	 * 同時執行
	 * @param tasks 任務列表, 每個任務含有一個回呼參數(err, result)=>void
	 * @param donefn 所有任務執行完後 執行
	 */
	public static parallel (tasks: Array< (cb:(err?, result?)=>void) => void >, donefn: (err?, results?)=>void) : void {
		return _parallel(tasks, donefn);
	}

	/**
	 * 同時執行
	 * @param tasks 任務列表, 每個任務含有一個回呼參數(err, result)=>void
	 * @param eachfn 每個任務執行後 執行
	 * @param donefn 所有任務執行完後 執行
	 */
	public static parallelWithEach (tasks: Array< (cb:(err?, result?)=>void) => void >, eachfn: (err, results)=>void, donefn: (err, results)=>void) : void {
		return _parallelWithEach(tasks, eachfn, donefn);
	}

	/**
	 * 依序執行
	 * @param tasks 任務列表, 每個任務的回呼可夾帶多個參數，呼叫下一項任務
	 * @param donefn 所有任務執行完後 執行
	 */
	public static waterfall (tasks: Array<Function>, donefn: (err, result)=>void) : void {
		return _waterfall(tasks, donefn);
	}

	/**
	 * 對陣列內容同時執行
	 * @param tasks 任務列表, 每個任務的回呼可夾帶多個參數，呼叫下一項任務
	 * @param donefn 所有任務執行完後 執行
	 */
	public static each (items: Array<any>, eachfn: (item, cb:(err?)=>void )=>void, donefn: (err)=>void) : void {
		return _each(items, eachfn, donefn);
	}
	/**
	 * 對陣列內容依序執行
	 * @param tasks 任務列表, 每個任務的回呼可夾帶多個參數，呼叫下一項任務
	 * @param donefn 所有任務執行完後 執行
	 */
	public static eachSeries (items: Array<any>, eachfn: (item, cb:(err?)=>void )=>void, donefn: (err)=>void) : void {
		return _eachSeries(items, eachfn, donefn);
	}




	/*== Member ===================================================*/
	
	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

