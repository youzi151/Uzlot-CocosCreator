import MaterialComponent from "../core/MaterialComponent";

const { ccclass, property, requireComponent, executeInEditMode } = cc._decorator;

@ccclass
@requireComponent(cc.Sprite)
export default class Material_Template extends MaterialComponent {
    
    /*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

    /*==覆寫原有===========*/
	
    /* 渲染器名稱 */
    @property({override:true})
    public shaderName: string = "ShaderName";

    /* 是否每幀更新 */
    @property({override:true})
	public isUpdate: boolean = true;

	/*==自訂變數===========*/
    
    /*== Event ====================================================*/

    /*== Cocos LifeCycle ==========================================*/

    protected start() {
        super.start();
    }
    
    protected update(dt) {
        super.update(dt);
    }

    
	/*== Public Function ==========================================*/
	
	/*== Private Function =========================================*/

	/* 準備每幀更新資料 */
	protected getUpdateData(data: Object) : Object {
		data = super.getUpdateData(data);
			
		// data['maskTex'] = this.mask;

		return data;
	}

}
