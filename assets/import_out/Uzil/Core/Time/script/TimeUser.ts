
const {ccclass, property} = cc._decorator;


export class TimeUser {

	/** 名稱 */
	public name : string = "";
	
	/** 優先度 */
	public priority : number = 5;
	
	/** 要求的時間比例 */
	public toSetTimeScale : number = 1;

}

