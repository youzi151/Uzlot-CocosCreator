
export class UniqID {

    private static group2Ids : Map<string, UniqID> = new Map<string, UniqID>();

    /** 取得池 */
    public static get (groupName: string) : UniqID {

        let instance;
	
        if (UniqID.group2Ids.has(groupName)) {
            instance = UniqID.group2Ids.get(groupName);
        } else {
            instance = new UniqID();
            UniqID.group2Ids.set(groupName, instance);
        }
        
        return instance;
    }

    /** ID列表 */
    public idList : number[] = [];

    /** 請求 */
    public request () : number {

        let id = 0;
        while (this.idList.indexOf(id) != -1) {
            id = id + 1;
        }
        
        this.idList.push(id);

        return id;
    };

    /** 釋放 */
    public release (id) {
        let idx = this.idList.indexOf(id);
        if (idx == -1) return;
        this.idList.splice(idx, 1);
    };


}