import ShaderManager from "../core/ShaderManager"
import MaterialComponent from "../core/MaterialComponent";

const renderEngine = cc.renderer.renderEngine;
const renderer = renderEngine.renderer;

const shader = {

	/*==基本資訊====================*/

	/* Shader名稱 */
	name: 'Template',
	
	/* 參數 (要倒入Shader中的) */
    params: [
		{ name: 'time', type: renderer.PARAM_FLOAT, defaultValue: 0 },
		{ name: 'size', type: renderer.PARAM_FLOAT, defaultValue: 1},
		{ name: 'weightTex', type: renderer.PARAM_TEXTURE_2D, defaultValue: null},
    ],
	
	/*  */
	defines:[],

	/*==自訂變數、函式===============*/

    start() {
		
	},
	
    update(data) {
		let component: MaterialComponent = data['component']
		if (!component) return;

		let size = data['size'];
		component.setParam('size', size);

		let time = component.time;
		component.setParam("time", time % 1.5);

    },

	/*==Shader======================*/

	vert: `
		uniform mat4 viewProj;
		attribute vec4 a_position;
		attribute vec2 a_uv0;
		varying vec2 uv0;

		void main()
		{
			vec4 new = viewProj * a_position;
			gl_Position = new;
			uv0 = a_uv0;
		}
	`,

	frag: `
		uniform sampler2D texture;
		uniform vec4 color;
		uniform float size;
		uniform float time;
		varying vec2 uv0;
		void main () {
			// gl_FragColor = texture2D(texture, uv0);
			vec4 sum = vec4(0.0);
			float delta = time;
			sum += texture2D(texture, uv0 - vec2(0, delta*4.) * size) * 0.05;
			sum += texture2D(texture, uv0 - vec2(0, delta*3.) * size) * 0.09;
			sum += texture2D(texture, uv0 - vec2(0, delta*2.) * size) * 0.12;
			sum += texture2D(texture, uv0 - vec2(0, delta*1.) * size) * 0.15;
			sum += texture2D(texture, uv0 ) * 0.18;
			sum += texture2D(texture, uv0 + vec2(0, delta*1.) * size) * 0.15;
			sum += texture2D(texture, uv0 + vec2(0, delta*2.) * size) * 0.12;
			sum += texture2D(texture, uv0 + vec2(0, delta*3.) * size) * 0.09;
			sum += texture2D(texture, uv0 + vec2(0, delta*4.) * size) * 0.05;
			
			vec4 vectemp = vec4(0,0,0,0);
			vec4 substract = vec4(0,0,0,0);
			vectemp = (sum - substract) * color;
		
			float alpha = texture2D(texture, uv0).a;
			if (alpha < 0.05) { 
				gl_FragColor = vec4(0 , 0 , 0 , 0); 
			} else {
				gl_FragColor = vectemp;
			}
		}
	`,
};

// 倒入管理器 (讓此Shader可以被列在Shader列表中)
ShaderManager.addShader(shader);