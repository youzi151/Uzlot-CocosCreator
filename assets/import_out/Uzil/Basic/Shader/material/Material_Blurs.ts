import MaterialComponent from "../core/MaterialComponent";

const { ccclass, property, requireComponent, executeInEditMode } = cc._decorator;

@ccclass
@requireComponent(cc.Sprite)
export default class Material_Blurs extends MaterialComponent {
    
    /*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/*==覆寫原有===========*/

    /** 渲染器名稱 */
    @property({override:true})
    public shaderName: string = "Blurs";

    /** 是否每幀更新 */
    @property({override:true})
    public isUpdate: boolean = true;

	
	/*==自訂變數===========*/

    /** 偏移量 */
    @property(cc.Vec2)
    public force: cc.Vec2 = new cc.Vec2(0.5, 0.5);

    /** 偏移量 比例 */
    @property(cc.Vec2)
    public forceScale: cc.Vec2 = new cc.Vec2(1, 1);
    
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
			
		data['force'] = this.force.scale(this.forceScale);

		return data;
	}

}
