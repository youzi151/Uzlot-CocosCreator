import ShaderManager from "../core/ShaderManager"
import MaterialComponent from "../core/MaterialComponent";

const renderEngine = cc.renderer.renderEngine;
const renderer = renderEngine.renderer;

const shader = {

	/*==基本資訊====================*/

	/* Shader名稱 */
	name: 'Fluxay',
	
	/* 參數 (要倒入Shader中的) */
    params: [
		{ name: 'time', type: renderer.PARAM_FLOAT, defaultValue: 0 },
		{ name: 'alpha', type: renderer.PARAM_FLOAT, defaultValue: 1 },
		{ name: 'size', type: renderer.PARAM_FLOAT, defaultValue: 1},
    ],
	
	/*  */
	defines:[],

	/*==自訂變數、函式===============*/

    start(data) {
		let component: MaterialComponent = data['component']
	},
	
    update(data) {
		let component: MaterialComponent = data['component']
		if (!component) return;

		let time = component.time;
		component.setParam("time", time % 5);
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
		uniform float time;
		uniform float alpha;
		varying vec2 uv0;
		
		void main()
		{
			vec4 _color = color;
			_color.a = alpha;

			_color *= texture2D(texture, uv0);
		
			float width = 0.08;          //流光的宽度范围 (调整该值改变流光的宽度)
			float start = tan(time/3.);  //流光的起始x坐标
			float strength = 0.008;      //流光增亮强度   (调整该值改变流光的增亮强度)
			float offset = 0.5;          //偏移值         (调整该值改变流光的倾斜程度)

			if(uv0.x < (start - offset * uv0.y) &&  uv0.x > (start - offset * uv0.y - width)) {
				vec3 improve = strength * vec3(255, 255, 255);
				vec3 result = improve * vec3( _color.r, _color.g, _color.b);
				gl_FragColor = vec4(result, _color.a);
		
			}else{
				gl_FragColor = _color;
			}

		}
	`,
};

// 倒入管理器 (讓此Shader可以被列在Shader列表中)
ShaderManager.addShader(shader);