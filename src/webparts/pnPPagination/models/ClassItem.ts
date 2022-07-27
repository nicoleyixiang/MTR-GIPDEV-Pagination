
import { ISPItem } from "./ISPItem";
import { ClassTag } from "./ClassTag";

export class ClassItem {
    public Title: string;
    public Content: string;
    public imageServerURL: string;
    public imageRelativeURL: number;
    public RollupImage: string;
    public ID: number;
    public DisplayOrder: number;
    public PublishDate: string;
    public ApplicationArea_Id: number;
    public RelatedTechnology_Id: number;

    constructor(item: ISPItem, isChinese: boolean) {
        if (isChinese) {
            this.Title = item.Title_CH;
        }
        else {
            this.Title = item.Title;
        }
        this.ApplicationArea_Id = item.ApplicationArea_ENId;
        this.RelatedTechnology_Id = item.RelatedTechnology_ENId;
        this.RollupImage = item.RollupImage;
        this.ID = item.ID;
        this.DisplayOrder = item.DisplayOrder;
        this.PublishDate = item.PublishDate;
    }

    set image(imageData: string) {
        this.RollupImage = imageData;
    }
}