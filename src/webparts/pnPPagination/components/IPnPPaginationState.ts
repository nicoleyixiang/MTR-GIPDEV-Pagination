import { ISPItem } from '../models/ISPItem';
import { ISPTag } from '../models/ISPTag';

export interface IPnPPaginationState {
    allItems: ISPItem[];
    paginatedItems: ISPItem[]; 
    AAtags: ISPTag[];
    listData: ISPItem[];
    TAtags: ISPTag[];
    AASelectedTags : ISPTag[];
    TASelectedTags : ISPTag[];
    pageNumber : number;
    totalPages : number;
} 