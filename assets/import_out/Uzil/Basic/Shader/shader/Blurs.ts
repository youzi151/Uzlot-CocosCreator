import ShaderManager from "../core/ShaderManager"
import MaterialComponent from "../core/MaterialComponent";

const renderEngine = cc.renderer.renderEngine;
const renderer = renderEngine.renderer;

const shader = {

	/*==基本資訊====================*/

	/* Shader名稱 */
	name: 'Blurs',
	
	/* 參數 (要倒入Shader中的) */
    params: [
		{ name: 'time', type: renderer.PARAM_FLOAT, defaultValue: 0},
		{ name: 'alpha', type: renderer.PARAM_FLOAT, defaultValue: 0},
		{ name: 'force', type: renderer.PARAM_FLOAT2, defaultValue: new cc.Vec2(0, 0)},
		// { name: 'weightTex', type: renderer.PARAM_TEXTURE_2D, defaultValue: null},
    ],
	
	/*  */
	defines:[],

	/*==自訂變數、函式===============*/

    start() {
		
	},
	
    update(data) {
		let component: MaterialComponent = data['component']
		if (!component) return;

		let force = data['force'];
		component.setParam('force', force);

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
		uniform float alpha;
		uniform vec2 force;
		varying vec2 uv0;
		void main () {
			vec4 sum = vec4(0.0);

			vec2 lv1 = force;
			vec2 lv2 = force * 1.;
			vec2 lv3 = force * 2.;

			sum += texture2D(texture, uv0 - lv3) * 0.09;
			sum += texture2D(texture, uv0 - lv2) * 0.12;
			sum += texture2D(texture, uv0 - lv1) * 0.15;
			sum += texture2D(texture, uv0 ) * 0.28;
			sum += texture2D(texture, uv0 + lv1) * 0.15;
			sum += texture2D(texture, uv0 + lv2) * 0.12;
			sum += texture2D(texture, uv0 + lv3) * 0.09;

			vec4 _color = color;
			_color.a = alpha;
			
			gl_FragColor = sum * _color;
		}
	`,
};

// 倒入管理器 (讓此Shader可以被列在Shader列表中)
ShaderManager.addShader(shader);