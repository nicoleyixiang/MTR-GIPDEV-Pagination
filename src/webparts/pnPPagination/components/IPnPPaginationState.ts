import { ISPItem } from '../models/ISPItem';
import { ISPTag } from '../models/ISPTag';

export interface IPnPPaginationState {
    allItems: ISPItem[];
    paginatedItems: ISPItem[]; 
    AAtags: ISPTag[];
    listData: ISPItem[];
    AASelected: ISPItem[];
    TAtags: ISPTag[];
    TASelected: ISPItem[];

    AASelectedTag : string;
    TASelectedTag : string;
} 