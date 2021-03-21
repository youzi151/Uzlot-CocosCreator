export class Stringf {


    /** 補0 */
    public static prefix0 (num: number, length: number) : string {
        return (Array(length).join('0') + num).slice(-length);
    }

    /** 加逗點 */
    public static decimalSeparator (num: number) : string {
        return num.toLocaleString('en-us');
    }
    


}