import * as React from 'react';
import { IPnPPaginationProps } from './IPnPPaginationProps';
import { IPnPPaginationState } from './IPnPPaginationState';

import { ClassItem } from '../models/ClassItem';
import { ClassTag } from '../models/ClassTag';

import "@pnp/sp/webs";
import "@pnp/sp/lists";

import { Pagination } from "@pnp/spfx-controls-react/lib/pagination";
import pnp from 'sp-pnp-js';

import Select from 'react-select';
import 'react-select-plus/dist/react-select-plus.css';

import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Grid } from '@react-ui-org/react-ui';

/* Constants */
const pageSize: number = 6; // Number of cards to display per page (pagination) 
const listName: string = "Publication"; // Name of the list you want to display items from 

/* Webpart component */
export default class PnPPagination extends React.Component<IPnPPaginationProps, IPnPPaginationState> {

  onSelectedItem: (item: any) => void;
  private _scrollElement;

  constructor(props: IPnPPaginationProps) {
    super(props);

    this._scrollElement = document.querySelector('[data-automation-id="contentScrollRegion"]');

    this.state = {
      listData: [],           // Stores the items of the most recent selection by the user  
      allItems: [],           // Stores all items from the SP list 
      paginatedItems: [],     // Stores items to be displayed on the current page 
      AAtags: [],             // Stores all the ApplicationArea tags 
      TAtags: [],             // Stores all the TechnologyArea tags 
      AASelectedTags: [],     // Registers the ApplicationArea tags selected by the user 
      TASelectedTags: [],     // Registers the TechnologyArea tags selected by the user 
      webUrl : "",
      isChinese : false,
      AADisplayText : "Application Area",
      TADisplayText : "Related Technology",
      pageNumber: 1,          // Stores the current page number the user is on 
      totalPages: 0           // Stores the total number of pages for pagination 
    };
  }

  public componentDidMount(): void {
    // Retrieves the tags from the SP list
    this.getAATagListItems();
    this.getTATagListItems();

    // Retrieving QueryString parameters 
    const urlParams = new URLSearchParams(window.location.search);
    const res = urlParams.get("preview");

    // Checking for language 
    const url = window.location.href;
    if (url.search("/CH/") !== -1) {
      this.setState({ isChinese : true, AADisplayText : "應用範疇", TADisplayText : "科技範疇"});
    }

    pnp.sp.web.select("ServerRelativeUrl").get().then((Response) => {
      this.setState({ webUrl : Response.ServerRelativeUrl});
    })

    if (res) {
      this.getPreviewSPListItems();
    }
    else {
      this.getAllSPListItems();
    }
  }

  // Scrolls page back to top 
  private scrolltoSection() {
    this._scrollElement.scrollTop = 0;
    setTimeout(() => {
      this._scrollElement.scrollTop = 0;
    }, 50);
  }

  // Logs changes in the tag selections
  public AAlogChange(val) {
    this.setState({ AASelectedTags: val ? val : [] }, () => this.getTaggedListItems());
  }

  public TAlogChange(val) {
    this.setState({ TASelectedTags: val ? val : [] }, () => this.getTaggedListItems());
  }

  public render(): React.ReactElement<IPnPPaginationProps> {
    return (
      <div className="main__container">
        <div className="filtering-box">
          <Select
            className="AA-single"
            classNamePrefix="select"
            isMulti={true}
            isClearable={true}
            placeholder={this.state.AADisplayText}
            onChange={(val) => this.AAlogChange(val)}
            name="color"
            options={this.state.AAtags}
          />
          <Select
            className="TA-single"
            classNamePrefix="select"
            isClearable={true}
            isMulti={true}
            placeholder={this.state.TADisplayText}
            onChange={(val) => this.TAlogChange(val)}
            name="color"
            options={this.state.TAtags}
          />
        </div>
        <div className="grid__items">
          {/* <Grid columns="repeat(auto-fit, minmax(440px, max-content))"
            columnGap="2.5rem" rowGap="2rem" padding-left="3px"> */}
            {
              this.state.paginatedItems.map((item) =>
                <div className="card">
                  <img className="card__image" src={item.RollupImage ? JSON.parse(item.RollupImage).serverRelativeUrl : "https://outhink.com/wp-content/themes/outhink-theme/images/ip.jpg"}></img>
                  <div className="card__content">
                    <strong>
                      <a href={this.state.webUrl + (this.state.isChinese ? "/SitePages/CH/PublicationDetails.aspx" : "/SitePages/PublicationDetails.aspx") + "?itemid=" + item.ID} className="card__title">
                      {item.Title}
                      </a>
                    </strong>
                    <div className="tag__container">
                      <div className="AAcard__tag">{this.getAATag(item.ApplicationArea_Id)}</div>
                      <div className="TAcard__tag">{this.getTATag(item.RelatedTechnology_Id)}</div>
                    </div>
                  </div>
                </div>
              )
            }
          {/* </Grid> */}
        </div>
        <Pagination
          currentPage={this.state.pageNumber}
          totalPages={this.state.totalPages}
          onChange={(page) => this.getPage(page)}
          hideFirstPageJump // Optional
          hideLastPageJump // Optional
          limiter={2}
        />
      </div>
    );
  }

  // Gets the value of the tags based on the ID number 
  private getAATag(idNum) {
    for (let i = 0; i < this.state.AAtags.length; i++) {
      if (this.state.AAtags[i].ID == idNum) {
        if (this.state.isChinese) {
          return this.state.AAtags[i].Value_CH
        }
        return this.state.AAtags[i].Value;
      }
    }
    return null;
  }

  private getTATag(idNum) {
    for (let i = 0; i < this.state.TAtags.length; i++) {
      if (this.state.TAtags[i].ID == idNum) {
        if (this.state.isChinese) {
          return this.state.TAtags[i].Value_CH
        }
        return this.state.TAtags[i].Value;      
      }
    }
    return null;
  }

  // Filters the items based on selected tags 
  private getTaggedListItems() {
    let AAtagsList = this.state.AASelectedTags.map(i => i.ID.toString());
    let TAtagsList = this.state.TASelectedTags.map(i => i.ID.toString());

    if (AAtagsList.length === 0) AAtagsList.push("");
    if (TAtagsList.length === 0) TAtagsList.push("");

    var filters = {
      ApplicationArea_Id: AAtagsList,
      RelatedTechnology_Id: TAtagsList
    };

    function multiFilter(array, filters) {
      return array.filter(o =>
        Object.keys(filters).every(k =>
          [].concat(filters[k]).some(v => v === "" || (o[k] && o[k].toString() === v))));
    }

    let filtered = multiFilter(this.state.allItems, filters);
    console.log(filtered);

    this.setState({
      listData: filtered, paginatedItems: filtered.slice(0, pageSize),
      totalPages: Math.ceil(filtered.length / pageSize)
    }, () => this.renderImages());

  }

  public getPreviewSPListItems() {
    const now = new Date();
    const nowString = now.toISOString();

    pnp.sp.web.lists.getByTitle(listName).items
      // Retrieve items that are not unpublished and not rejected 
      .filter("OData__ModerationStatus ne '1' and UnpublishDate gt '" + nowString + "'")
      // Retrieving relevant fields only  
      .select("OData__ModerationStatus", "Title", "Title_CH", "Content_EN",
        "ApplicationArea_ENId", "RelatedTechnology_ENId", "ID",
        "DisplayOrder", "PublishDate", "UnpublishDate")
      .get().then
      ((Response) => {
        let filtered = Response.filter(item => item.OData__ModerationStatus !== 1)
        this.setListItems(filtered);
      })
  }

  public getAllSPListItems() {
    const now = new Date();
    const nowString = now.toISOString();

    pnp.sp.web.lists.getByTitle(listName).items
      // OData__ModerationStatus = 0 means the item was approved 
      .filter("OData__ModerationStatus eq '0' and PublishDate lt '" + nowString +
        "'  and UnpublishDate gt '" + nowString + "'") // Retrieve items that are published and approved  
      .select("Title", "Title_CH", "Content_EN", "ApplicationArea_ENId",
        "RelatedTechnology_ENId", "ID", "DisplayOrder", "PublishDate", "UnpublishDate") // Retrieving relevant fields only 
      .get().then
      ((Response) => {
        this.setListItems(Response);
      })
  }

  private setListItems(response) {
    let allListItems = response.map(item => new ClassItem(item, this.state.isChinese));
    console.log(response);

    let displayOrderItems = allListItems.filter(item => item.DisplayOrder !== null);
    let rest = allListItems.filter(item => item.DisplayOrder === null);

    // Sorting items with display order fields in ascending order 
    displayOrderItems.sort(function (item1, item2) {
      if (item1.DisplayOrder === null) {
        return 1;
      }
      else if (item2.DisplayOrder === null) {
        return -1;
      }
      else if (item1.DisplayOrder - item2.DisplayOrder === 0) {
        if (item1.PublishDate > item2.PublishDate) return -1;
        return 1;
      }
      return item1.DisplayOrder - item2.DisplayOrder;
    });

    // Sorting the rest of the list by most recent first 
    rest.sort(function (item1, item2) {
      if (item1.PublishDate > item2.PublishDate) return -1;
      return 1;
    })

    // Combine both lists with display order items in front
    allListItems = displayOrderItems.concat(rest);

    // Store into current state
    this.setState({
      pageNumber: 1, listData: allListItems, allItems: allListItems,
      paginatedItems: allListItems.slice(0, pageSize), totalPages: Math.ceil(allListItems.length / pageSize)
    },
      () => this.renderImages());
  }

  // Retrieve images of the items displaying on the current page
  public async renderImages() {
    let max = this.state.paginatedItems.length;
    for (let i = 0; i < max; i++) {
      let currItem = this.state.paginatedItems[i];
      if (currItem.RollupImage) {
        continue;
      }
      else {
        let currItemID = currItem.ID;
        var res = await pnp.sp.web.lists.getByTitle(listName).items.getById(currItemID).select("RollupImage").get();
        currItem.image = res.RollupImage;
      }
    }

    this.forceUpdate();
  }

  // Gets a subset of the items based on the page number selected by the user 
  public getPage(pageNum) {
    this.setState({ paginatedItems: this.state.listData.slice((pageNum - 1) * pageSize, pageNum * pageSize), pageNumber: pageNum },
      () => this.renderImages());
    this.scrolltoSection();
  }

  public getAATagListItems() {
    pnp.sp.web.lists.getByTitle('SystemParameter').items
      .filter("Title eq 'ApplicationArea'")
      .getAll().then
      ((Response) => {
        let tags = Response.map(item => new ClassTag(item, this.state.isChinese));
        this.setState({ AAtags: tags });
      });
  }

  public getTATagListItems() {
    pnp.sp.web.lists.getByTitle("SystemParameter").items
      .filter("Title eq 'RelatedTechnology'")
      .getAll().then
      ((Response) => {
        let tags = Response.map(item => new ClassTag(item, this.state.isChinese));
        this.setState({ TAtags: tags });
      });
  }
}
