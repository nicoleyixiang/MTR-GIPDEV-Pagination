
import { ISPItem } from "./ISPItem";
import { ClassTag } from "./ClassTag";

export class ClassItem{
    public Title: string;
    public Content_EN: string;
    public imageServerURL: string;
    public imageRelativeURL: number; 
    public RollupImage: string;
    public LOOKUPId: number;
    public LOOKUP2Id: number;
    public ID : number;
    public DisplayOrder : number;
    public PublishDate : string;

    // item parameter is the actual object (entry) being retrieved from the list 
    // item.(fieldname) is how we get each of the fields 
    constructor(item: ISPItem) {
        this.Title = item.Title;
        this.Content_EN = item.Content_EN;
        this.RollupImage = item.RollupImage;
        this.LOOKUPId = item.LOOKUPId;
        this.LOOKUP2Id = item.LOOKUP2Id;
        this.ID = item.ID;
        this.DisplayOrder = item.DisplayOrder;
        this.PublishDate = item.PublishDate;
    }

    set image(imageData : string) {
        this.RollupImage = imageData;
    }
}