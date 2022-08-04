import { ISPTag } from "./ISPTag";

export class ClassTag{
    public LatestEventsType1 : string;
    public LatestEventsType2 : string;
    public ID : number;
    public Title : string;
    public Value : string;
    public Value_CH : string;
    public label : string;
    public value : string;

    constructor(item: ISPTag, isChinese : boolean) {
        this.Value = item.Value;
        this.Value_CH = item.Value_CH;
        this.ID = item.ID;
        this.LatestEventsType1 = item.LatestEventsType1;
        this.LatestEventsType2 = item.LatestEventsType2;
        this.Title = item.Title;
        if (isChinese) {
            this.value = item.Value_CH;
            this.label = item.Value_CH
        }
        else {
            this.value = item.Value;
            this.label = item.Value;
        }
    }
}