import ShaderManager from "../core/ShaderManager"
import MaterialComponent from "../core/MaterialComponent";

const renderEngine = cc.renderer.renderEngine;
const renderer = renderEngine.renderer;

const shader = {

	/*==基本資訊====================*/

	/* Shader名稱 */
	name: 'Offset',
	
	/* 參數 (要倒入Shader中的) */
    params: [
		{ name: 'time', type: renderer.PARAM_FLOAT, defaultValue: 0 },
		{ name: 'offset', type: renderer.PARAM_FLOAT2, defaultValue: 0},
		{ name: 'tilling', type: renderer.PARAM_FLOAT2, defaultValue: 1},
    ],
	
	/*  */
	defines:[],

	/*==自訂變數、函式===============*/

    start() {
		
	},
	
    update(data) {
		let component: MaterialComponent = data['component']
		if (!component) return;

		let offset = data['offset'];
		component.setParam('offset', offset);

		let tilling = data['tilling'];
		component.setParam('tilling', tilling);

		// let time = component.time;
		// component.setParam("time", time % 1.5);

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
		uniform vec2 offset;
		uniform vec2 tilling;
		varying vec2 uv0;
		void main () {
			vec2 uv = mod( mod((uv0 * tilling), 1.) + offset, 1.);
			gl_FragColor = texture2D(texture, uv);
		}
	`,
};

// 倒入管理器 (讓此Shader可以被列在Shader列表中)
ShaderManager.addShader(shader);