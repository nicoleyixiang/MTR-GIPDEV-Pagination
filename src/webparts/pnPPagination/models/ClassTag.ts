
import { ISPTag } from "./ISPTag";

export class ClassTag{
    public value: string;
    public label: string;
    public ID: number;
    
    constructor(item: ISPTag) {
        this.value = item.value;
        this.label = item.label;
        this.ID = item.ID;
    }
}