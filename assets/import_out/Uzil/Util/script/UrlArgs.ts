

export class UrlArgs {

	/*== Constructer ============================================= */

	/*== Static ===================================================*/

	/*== Member ===================================================*/
	
	/*== Event ====================================================*/
	
	/*== Public Function ==========================================*/

	/* 呼叫 */
	public static get (key: string) : any {
		let url = new URL(location.href);
		let params = url.searchParams;
		
		//console.log(url);
		
		if (params.toString() == '') return null;

		if (params.has(key)) {
			return params.get(key);
		}

		return null;
	}
	
	/*== Protected Function =======================================*/

	/*== Private Function =========================================*/


}

