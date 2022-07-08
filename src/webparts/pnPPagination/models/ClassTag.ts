
import { ISPTag } from "./ISPTag";

export class ClassTag{
    public ApplicationArea_CH: string;
    public ApplicationArea_EN: string;
    public ID: number;
    public RelatedTechnology_CH : string;
    public RelatedTechnology_EN : string;
    public Title : string;
    public Value : string;
    public label : string;

    constructor(item: ISPTag) {
        this.Value = item.Value;
        this.label = item.Value;
        this.ID = item.ID;
        this.ApplicationArea_CH = item.ApplicationArea_CH;
        this.ApplicationArea_EN = item.ApplicationArea_EN;
        this.RelatedTechnology_CH = item.RelatedTechnology_CH;
        this.RelatedTechnology_EN = item.RelatedTechnology_EN;
        this.Title = item.Title;
    }
}