// import { XX } from "../index_XX";

import { Values_User } from "../index_Values";

export class Values {

	/*== Constructer ============================================= */

	constructor (defaultVal) {
		this.defaultValue = defaultVal;
	}

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/** 預設值 */
	public defaultValue : any;

	/** 使用者 */
	public users : Values_User[] = [];
	
	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/

	/* 取得當前數值 */
	public getCurrent () : any {
		if (this.users.length <= 0) return this.defaultValue;
		return this.users[0].value;
	}
	
	
	/* 取得 使用者請求 */
	public get (name) : any {
		for (let each of this.users) {
			if (each.name == name) return each;
		}
		return null;
	}

	/* 設置 使用者請求 (不存在則建立) */
	public set (name, priority, value) : void {
		let user = this.get(name);
		if (user == null) {
			user = new Values_User(name, priority, value);
			this.add(user);
		} else {
			user.priority = priority;
			user.value = value;
		}
		this.sort();
	}


	/* 設置 使用者請求 優先度 */
	public setPriority (name, priority) : void {
		let user = this.get(name);
		if (user == null) return;
		user.priority = priority;
		this.sort();
	}
	
	/* 設置 使用者請求 值 */
	public setValue (name, val) {
		let user = this.get(name);
		if (user == null) return;
		user.value = val;
	}


	/* 增加 使用者請求 */
	public add (user) {
		if (this.users.indexOf(user) != -1) return;
		this.users.push(user);
		this.users.sort();
	}

	/* 移除 使用者請求 */
	public remove (userOrName) {
		let self = this;

		let toRm = [];
		self.users.forEach((each)=>{
			if (each == userOrName || each.name == userOrName) {
				toRm.push(each);
			}
		});

		toRm.forEach((each)=>{
			self.users.splice(self.users.indexOf(each), 1);
		});
	}

	/* 清空 */
	public clear () {
		this.users.splice(0, this.users.length);
	}

	/* 排序 */
	public sort () {
		this.users.sort((a, b)=>{
			return b.priority - a.priority;
		});
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/

}