
import { ISPItem } from "./ISPItem";

export class ClassItem{
    public Title:string;
    public Content_EN:string;
    public imageServerURL:string;
    public imageRelativeURL:number; 
    public RollupImage:string;
    public ApplicationArea:string;

    // item parameter is the actual object (entry) being retrieved from the list 
    // item.(fieldname) is how we get each of the fields 
    constructor(item: ISPItem) {
        this.Title = item.Title;
        this.Content_EN = item.Content_EN;
        this.RollupImage = item.RollupImage;
        this.ApplicationArea = item.ApplicationArea;
        // this.RollupImage = new ClassImage(item.RollupImage);
    }
}