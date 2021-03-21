// import { XX } from "../index_XX";

export class Values_User {

	/*== Constructer ============================================= */

	constructor (name, priority, value) {
		this.name = name;
		this.priority = priority;
		this.value = value;
	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/* 名稱 */
	public name : string;

	/* 優先度 (越小越先) */
	public priority : number = 0;

	/* 值 */
	public value : any;
	
	/*== Event ====================================================*/

	/** 當XX */
	// public onXX : Event = new Event();

	
	/*== Public Function ==========================================*/
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}