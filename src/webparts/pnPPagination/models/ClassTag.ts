
import { ISPTag } from "./ISPTag";

export class ClassTag{
    public value: string;
    public label: string;
    
    constructor(item: ISPTag) {
        this.value = item.value;
        this.label = item.label;
    }
}