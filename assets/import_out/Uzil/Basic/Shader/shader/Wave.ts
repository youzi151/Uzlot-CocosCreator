import ShaderManager from "../core/ShaderManager"
import CustomMaterial from "../core/CustomMaterial";
import MaterialComponent from "../core/MaterialComponent";

const renderEngine = cc.renderer.renderEngine;
const renderer = renderEngine.renderer;

const shader = {

	/*==基本資訊====================*/

	/* Shader名稱 */
	name: 'Wave',
	
	/* 參數 (要倒入Shader中的) */
    params: [
		{ name: 'time', type: renderer.PARAM_FLOAT, defaultValue: 0 },
		{ name: 'offset', type: renderer.PARAM_FLOAT2, defaultValue: new cc.Vec2(0, 0)},
		{ name: 'weightTex', type: renderer.PARAM_TEXTURE_2D, defaultValue: null},
    ],
	
	/*  */
	defines:[],

	/*==自訂變數、函式===============*/

    start() {
		// this.	
	},
	
    update(data) {
		let component: MaterialComponent = data['component']
		if (!component) return;

		let offset = data['offset'];
		component.setParam('offset', offset);

		let weightTex = data['weightTex'];
		component.setTexture('weightTex', weightTex);
    },

	/*==Shader======================*/

	vert: `
		uniform mat4 viewProj;
		attribute vec4 a_position;
		attribute vec2 a_uv0;
		varying vec2 uv0;

		uniform sampler2D weightTex;
		uniform float time;
		uniform vec2 offset;


		void main()
		{
			vec4 new = viewProj * a_position;
			gl_Position = new;
			uv0 = a_uv0;
		}
	`,

	frag: `
		uniform sampler2D texture;

		uniform sampler2D weightTex;
		uniform float time;
		uniform vec2 offset;

		varying vec2 uv0;
		
		void main() {
			vec2 coord = uv0;
			float weighted = texture2D(weightTex, uv0).r;
			coord.x += (sin(coord.y * 30.0 - time * 3.0) / 30.0 * offset.x * weighted);
			coord.y += (sin(coord.x * 10.0 - time * 3.0) / 30.0 * offset.y * weighted);
			gl_FragColor = texture2D(texture, coord);
		}
	`,
};

// 倒入管理器 (讓此Shader可以被列在Shader列表中)
ShaderManager.addShader(shader);