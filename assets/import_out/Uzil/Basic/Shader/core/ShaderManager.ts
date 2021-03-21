export enum ShaderType {
	//==內建Shader=======
	Default = 0,
	Gray,
	GrayScaling = 100,
	
	//==自訂Shader=======
	Offset,
	Blurs,
	Wave,
	Fluxay
}


export default class ShaderManager {
	
	/*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/** Shader庫 */
	private static g_shaders: object = {};
	
	/** Shader表 */
	private static g_shaderEnum: object = null;
	
	/** 新增/取得Shader */
	public static addShader (shader) : void {
		if (ShaderManager.g_shaders[shader.name]) {
			// console.log("addShader - shader already exist: ", shader.name);
			return;
		}
		// console.log("addShader:"+shader.name);
		
		// 倒入 Shader 至 Shader庫
		ShaderManager.g_shaders[shader.name] = shader;
	}
	public static getShader (name: string) {
		return ShaderManager.g_shaders[name];
	}

	/*== Member ===================================================*/


	/*== Event ====================================================*/

	
	/*== Public Function ==========================================*/
	

	/*== Private Function =========================================*/

}
