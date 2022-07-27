import { ClassTag } from './ClassTag';
import { ISPTag } from './ISPTag';

export interface ISPItem {
    Title: string;
    Title_CH : string;
    Content_EN: string;
    RollupImage: string;
    ID : number;
    DisplayOrder : number;
    PublishDate : string;
    ApplicationArea_ENId : number;
    RelatedTechnology_ENId : number;
    ApplicationArea_CHId : number;
    RelatedTechnology_CHId : number;

    image : (string) => void;
}