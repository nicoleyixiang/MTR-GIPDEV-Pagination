
import { ISPItem } from "./ISPItem";
import { ClassTag } from "./ClassTag";

export class ClassItem{
    public Title: string;
    public Content_EN: string;
    public imageServerURL: string;
    public imageRelativeURL: number; 
    public RollupImage: string;
    public ID : number;
    public DisplayOrder : number;
    public PublishDate : string;
    public ApplicationArea_ENId : number;
    public RelatedTechnology_ENId : number;

    constructor(item: ISPItem) {
        this.Title = item.Title;
        this.Content_EN = item.Content_EN;
        this.RollupImage = item.RollupImage;
        this.ID = item.ID;
        this.DisplayOrder = item.DisplayOrder;
        this.PublishDate = item.PublishDate;
        this.ApplicationArea_ENId = item.ApplicationArea_ENId;
        this.RelatedTechnology_ENId = item.RelatedTechnology_ENId;
    }

    set image(imageData : string) {
        this.RollupImage = imageData;
    }
}