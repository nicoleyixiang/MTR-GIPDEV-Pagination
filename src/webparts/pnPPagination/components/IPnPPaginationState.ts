import { ClassItem } from '../models/ClassItem';
import { ISPItem } from '../models/ISPItem';
import { ISPTag } from '../models/ISPTag';

export interface IPnPPaginationState {
    allItems: ClassItem[];
    paginatedItems: ClassItem[]; 
    AAtags: ISPTag[];
    listData: ClassItem[];
    TAtags: ISPTag[];
    AASelectedTags : ISPTag[];
    TASelectedTags : ISPTag[];
    pageNumber : number;
    totalPages : number;
    webUrl : string;
    isChinese : boolean;
    AADisplayText : string;
    TADisplayText : string;
} 