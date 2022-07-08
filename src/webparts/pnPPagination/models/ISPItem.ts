import { ClassTag } from './ClassTag';
import { ISPTag } from './ISPTag';

export interface ISPItem {
    Title: string;
    Content_EN: string;
    RollupImage: string;
    LOOKUPId: number;
    LOOKUP2Id: number;
    ID : number;
    DisplayOrder : number;
    PublishDate : string;

    image : (string) => void;
}