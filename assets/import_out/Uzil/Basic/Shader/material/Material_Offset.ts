import MaterialComponent from "../core/MaterialComponent";

const { ccclass, property, requireComponent, executeInEditMode } = cc._decorator;

@ccclass
@requireComponent(cc.Sprite)
export default class Material_Offset extends MaterialComponent {
    
    /*== Constructor ==============================================*/

	/*== Static ===================================================*/

	/*== Member ===================================================*/

	/*==覆寫原有===========*/
	
    /* 渲染器名稱 */
    @property({override:true})
    public shaderName: string = "Offset";

    /* 是否每幀更新 */
    @property({override:true})
	public isUpdate: boolean = true;

	/*==自訂變數===========*/

	/* 偏移 */
	@property(cc.Vec2)
	public offset: cc.Vec2 = new cc.Vec2(0, 0);

	/* 偏移速度 */
	@property(cc.Vec2)
	public offset_speed_sec: cc.Vec2 = new cc.Vec2(0, 0);

	/* 重複 */
	@property(cc.Vec2)
	public tilling: cc.Vec2 = new cc.Vec2(1, 1);

    
    /*== Event ====================================================*/

    /*== Cocos LifeCycle ==========================================*/

    protected start() {
        super.start();
    }
    
    protected update(dt) {
		this.offset.x += this.offset_speed_sec.x*dt;
		this.offset.y += this.offset_speed_sec.y*dt;

		this.offset.x = this.loop(this.offset.x);
		this.offset.y = this.loop(this.offset.y);
		
		super.update(dt);
    }

    
	/*== Public Function ==========================================*/

	/*== Private Function =========================================*/

	/* 準備每幀更新資料 */
	protected getUpdateData(data: Object) : Object {
		data = super.getUpdateData(data);
		
		data['offset'] = this.offset;
		data['tilling'] = this.tilling;

		return data;
	}

	protected loop(i: number): number {
		let num = i;
		while (num > 1000000){
			num -= 1000000;
		}
		while (num < -1000000){
			num += 1000000;
		}
		return num;
	}

}
