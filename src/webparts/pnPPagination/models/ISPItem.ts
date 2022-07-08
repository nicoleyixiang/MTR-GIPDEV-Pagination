import { ClassTag } from './ClassTag';
import { ISPTag } from './ISPTag';

export interface ISPItem {
    Title: string;
    Content_EN: string;
    RollupImage: string;

    ID : number;
    DisplayOrder : number;
    PublishDate : string;

    ApplicationArea_ENId : number;
    RelatedTechnology_ENId : number;

    image : (string) => void;
}