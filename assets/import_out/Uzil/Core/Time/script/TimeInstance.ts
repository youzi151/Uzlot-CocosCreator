import { TimeUser } from "./TimeUser";

export class TimeInstance {

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 時間比例 */
	public timeScale : number = 1;

	/** 時間 */
	public time : number = 0;

	/** 使用者註冊資訊 */
	public users : Array<TimeUser> = [];

	/*== Event ====================================================*/
	
	public update (dt) {
		this.time += dt * this.timeScale;
	}

	/*== Public Function ==========================================*/

	/** 請求設置時間比例 */
	public requestTimeScale (name: string, priority: number, toSetTimeScale: number) : void {
		let user = this.getUser(name);
		
		if (user == null) {
			user = new TimeUser();
			user.name = name;
			this.users.push(user);
		}

		user.priority = priority;
		user.toSetTimeScale = toSetTimeScale;

		// 排序
		this.sortUser();
		
	}

	/** 移除設置時間比例 */
	public removeTimeScale (name: string) : void {
		let toRm = [];
		for (let each of this.users) {
			if (each.name == name) toRm.push(each);
		}
		for (let each of toRm) {
			this.users.splice(this.users.indexOf(each), 1);
		}
	}

	/** 取得使用者 */
	public getUser (name: string) : TimeUser {
		for (let each of this.users) {
			if (each.name == name) return each;
		}
		return null;
	}

	/** 排序使用者 */
	public sortUser () : void {
		// 越大越先
		this.users.sort((a, b)=>{
			return b.priority - a.priority;
		});

		// 以 最優先者 的 指定時間比例 設置 時間比例
		if (this.users.length > 0) {
			this.timeScale = this.users[0].toSetTimeScale;
		}
	}

	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

