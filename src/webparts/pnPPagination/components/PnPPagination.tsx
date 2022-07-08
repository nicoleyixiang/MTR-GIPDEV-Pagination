import * as React from 'react';
import { IPnPPaginationProps } from './IPnPPaginationProps';
import { IPnPPaginationState } from './IPnPPaginationState';

import { ClassItem } from '../models/ClassItem';
import { ClassTag } from '../models/ClassTag';

import { ICamlQuery } from '@pnp/sp/lists';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";


import { scroller } from 'react-scroll';

import { Pagination } from "@pnp/spfx-controls-react/lib/pagination";
import pnp from 'sp-pnp-js';

import Select from 'react-select';
import 'react-select-plus/dist/react-select-plus.css';

import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Grid } from '@react-ui-org/react-ui';
import { result } from 'lodash';
import * as ReactDOM from 'react-dom';

/* Constants */
const pageSize: number = 6;
const listName : string = "Publication";

/* Webpart component */
export default class PnPPagination extends React.Component<IPnPPaginationProps, IPnPPaginationState> {
  onSelectedItem: (item: any) => void;

  scrolltoSection = () => {
    scroller.scrollTo("filtering-box", {
      smooth: true,
    });
    console.log('scrolled');
  };

  constructor(props: IPnPPaginationProps) {
    super(props);

    this.state = {
      listData: [],
      allItems: [],
      paginatedItems: [],
      AAtags: [],
      AASelected: [],
      TAtags: [],
      TASelected: [],
      AASelectedTags: [],
      TASelectedTags: [],

      pageNumber: 1,
      totalPages: 0
    };
  }

  public scrollTop()
  {
    console.log("scrolling to top");
    // window.scrollBy(0, -200);
    var x = document.getElementById("top");
    x.scrollBy({top: 100, left: 100, behavior: 'smooth'});
    // document.body.scrollTop = 0; // For Safari
    // document.documentElement.scrollTop = 0; // For Chrome, Firefox, IE and Opera
  }

  public componentDidMount(): void {
    // this.getSPListItems(this.state.pageNumber);
    
    this.getAllSPListItems();

    this.getAATagListItems();
    this.getTATagListItems();
    
    // window.scrollTo(0, 0);
  }

  public AAlogChange(val) {
    this.setState({ AASelectedTags: val ? val : [] }, () => this.getTaggedListItems(1));
  }

  public TAlogChange(val) {
    this.setState({ TASelectedTags: val ? val : [] }, () => this.getTaggedListItems(1));
  }

  public render(): React.ReactElement<IPnPPaginationProps> {
    return (
      <div id="top" className="main__container">
        <div className="filtering-box">
          <Select
            className="AA-single"
            classNamePrefix="select"
            isMulti={true}
            isClearable={true}
            placeholder="Application Area"
            onChange={(val) => this.AAlogChange(val)}
            name="color"
            options={this.state.AAtags}
          />
          <Select
            className="TA-single"
            classNamePrefix="select"
            isClearable={true}
            isMulti={true}
            placeholder="Technology Area"
            onChange={(val) => this.TAlogChange(val)}
            name="color"
            options={this.state.TAtags}
          />
        </div>
        <Grid columns="repeat(auto-fit, minmax(450px, max-content))"
          columnGap="2rem" rowGap="2rem" justifyContent="center"
          alignItems="center" justifyItems="center">
          {
            this.state.paginatedItems.map((item) =>
              <div className="card">
                <img className="card__image" src={item.RollupImage ? JSON.parse(item.RollupImage).serverRelativeUrl : "https://outhink.com/wp-content/themes/outhink-theme/images/ip.jpg"}></img>
                <div className="card__content">
                  <strong><a href={"https://waion365.sharepoint.com/sites/MTR-GIPDEV/SitePages/Showcase.aspx" + "?itemid=" + item.ID} className="card__title">
                    {item.Title}
                  </a></strong>
                  <div className="tag__container">
                    <div className="AAcard__tag">{this.getAATag(item.LOOKUPId)}</div>
                    <div className="TAcard__tag">{this.getTATag(item.LOOKUP2Id)}</div>
                  </div>
                </div>
              </div>
            )
          }
        </Grid>
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

  private getAATag(idNum) {
    for (let i = 0; i < this.state.AAtags.length; i++) {
      if (this.state.AAtags[i].ID == idNum) {
        return this.state.AAtags[i].value;
      }
    }
    return null;
  }

  private getTATag(idNum) {
    for (let i = 0; i < this.state.TAtags.length; i++) {
      if (this.state.TAtags[i].ID == idNum) {
        return this.state.TAtags[i].value;
      }
    }
    return null;
  }

  // private async getTaggedListItems(batchNumber) {

  //   const AAtagsList = this.state.AASelectedTags;
  //   const TAtagsList = this.state.TASelectedTags;

  //   let allListItems = [];
  //   let keepQuerying = false;

  //   if (AAtagsList.length === 0 && TAtagsList.length === 0)
  //   {
  //     keepQuerying = false;
  //     this.getSPListItems(batchNumber);
  //   }
  //   else {
  //     keepQuerying = true;
  //   }

  //   let qResult = await pnp.sp.web.lists.getByTitle(listName).items.top(pageSize)
  //   .select("Title", "Content_EN", "LOOKUPId", "LOOKUP2Id").getPaged();

  //   while (keepQuerying)
  //   {
  //     if (AAtagsList.length !== 0 && TAtagsList.length !== 0)
  //     {
  //       console.log("Multiple selected");
  //       for (let i = 0; i < AAtagsList.length; i++) 
  //       {
  //         console.log(AAtagsList[i].ID);
  //         for (let j = 0; j < TAtagsList.length; j++)
  //         {
  //           console.log(TAtagsList[j].ID);
  //           for (let e = 0; e < qResult.results.length; e++)
  //           {
  //             let currItem = new ClassItem(qResult.results[e]);
  //             console.log(currItem);
  //             if (currItem.LOOKUPId === AAtagsList[i].ID && currItem.LOOKUP2Id === TAtagsList[j].ID)
  //             {
  //               console.log("helo");
  //               allListItems.push(currItem);
  //             }
  //           }
  //         }
  //       }
  //     }
  //     else 
  //     {
  //       for (let i = 0; i < AAtagsList.length; i++)
  //       {
  //         for (let j = 0 ; j < qResult.results.length; j++)
  //         {
  //           let currItem = new ClassItem(qResult.results[j]);
  //           if (currItem.LOOKUPId === AAtagsList[i].ID) {
  //             allListItems.push(currItem);
  //           }
  //         }
  //       }

  //       for (let i = 0; i < TAtagsList.length; i++)
  //       {
  //         for (let j = 0; j < qResult.results.length; j++) 
  //         {
  //           let currItem = new ClassItem(qResult.results[j]);
  //           if (currItem.LOOKUP2Id === TAtagsList[i].ID) {
  //             allListItems.push(currItem);
  //           }
  //         }
  //       }
  //     }

  //     if (qResult.hasNext && allListItems.length < pageSize) {
  //       console.log("hello");
  //       qResult = await qResult.getNext();
  //     }
  //     else {
  //       // qResult = await qResult.getNext(); 
  //       console.log("done");
  //       keepQuerying = false;
  //       this.setState({paginatedItems : allListItems.slice((batchNumber - 1) * pageSize, batchNumber * pageSize), pageNumber : 1});
  //     }
  //   }
  // }

  private getTaggedListItems(batchNumber) {
    const AAtagsList = this.state.AASelectedTags;
    const TAtagsList = this.state.TASelectedTags;

    let allListItems = [];

    if (AAtagsList.length === 0 && TAtagsList.length === 0) {
      this.setState({ listData : this.state.allItems, paginatedItems : this.state.allItems.slice(0, pageSize),
        totalPages : this.state.allItems.length / pageSize});
    }
    else {
      // Both tag fields have selections 
      if (AAtagsList.length !== 0 && TAtagsList.length !== 0) {
        for (let i = 0; i < AAtagsList.length; i++) {
          for (let j = 0; j < TAtagsList.length; j++) {
            let listItems = this.state.allItems.filter(item => item.LOOKUP2Id === TAtagsList[j].ID 
              && item.LOOKUPId === AAtagsList[i].ID);
            this.setState({ listData : listItems, paginatedItems : listItems.slice(0, pageSize),
            totalPages : listItems.length / pageSize}, () => this.renderImages());
          }
        }
      }
      // Only one or the other have selections 
      else {
        console.log("hi!");
        for (let i = 0; i < AAtagsList.length; i++) {
          let listItems = this.state.allItems.filter(item => item.LOOKUPId === AAtagsList[i].ID);
          this.setState({ listData : listItems, paginatedItems : listItems.slice(0, pageSize),
          totalPages : listItems.length / pageSize }, () => this.renderImages());
        }
        for (let j = 0; j < TAtagsList.length; j++) {
          let listItems = this.state.allItems.filter(item => item.LOOKUP2Id === TAtagsList[j].ID);
          this.setState({ listData : listItems, paginatedItems : listItems.slice(0, pageSize),
          totalPages : listItems.length / pageSize }, () => this.renderImages());
        }
      }
    }
  }
  
  public getAllSPListItems() {
    pnp.sp.web.lists.getByTitle(listName).items
    // .filter("OData__ModerationStatus eq '0'")
    // .select("Title", "Content_EN", "LOOKUPId", "LOOKUP2Id", "ID")
    .get().then
      ((Response) => {
        let allListItems = Response.map(item => new ClassItem(item));
        console.log(allListItems);

        let displayOrderItems = allListItems.filter(item => item.DisplayOrder !== null);
        let rest = allListItems.filter(item => item.DisplayOrder === null);

        displayOrderItems.sort(function(item1, item2){
          if(item1.DisplayOrder === null)
          {
            return 1;
          }
          else if (item2.DisplayOrder === null)
          {
            return -1;
          }
          return item1.DisplayOrder - item2.DisplayOrder;
        });

        rest.sort(function(item1, item2) {
          if (item1.PublishDate === null)
          {
            return 1;
          }
          else if (item2.PublishDate === null)
          {
            return -1;
          }
          else {
            if (item1.PublishDate > item2.PublishDate) return -1
            return 1;
          }
        })

        allListItems = displayOrderItems.concat(rest);

        console.log(allListItems);

        this.setState({ pageNumber : 1, listData: allListItems, allItems: allListItems, 
          paginatedItems: allListItems.slice(0, pageSize), totalPages: allListItems.length / pageSize }, 
          () => this.renderImages());
      })
  }

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
    this.setState({ pageNumber: 1 });
  }

  public getPage(pageNumber) {
    const rounded = Math.ceil(pageNumber);
    this.scrolltoSection();
    this.setState({ paginatedItems: this.state.listData.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) }, 
    () => this.renderImages());
  }

  // public getSPListItems(batchNumber) {

    // // Need to store the items locally once you get them to enable a back button features
    // console.log(this.getLastListItemID());
    // console.log(batchNumber);

    // // Retrieve all items from the list (default view)
    // if (this.state.AASelectedTags.length === 0 && this.state.TASelectedTags.length === 0) {
    //   pnp.sp.web.lists.getByTitle(listName).items.skip((batchNumber - 1) * pageSize).top(pageSize)
    //   .select("Title", "Content_EN", "LOOKUPId", "LOOKUP2Id").get().then
    //     ((Response) => {
    //       let allListItems = Response.map(item => new ClassItem(item));
    //       this.setState({ listData: allListItems, allItems: allListItems, paginatedItems: allListItems, totalPages : Math.ceil(totalItems / pageSize)});
    //     });
    // }
    // // Retrieve items based on selected tags
    // else {
    //   this.setState({ paginatedItems : this.state.listData.slice((batchNumber - 1) * pageSize, batchNumber * pageSize)});
    // }

    // var clientContext = new SP.ClientContext();
    // var list = clientContext.get_web().get_lists().getByTitle(listName);
    // var camlQuery = new SP.CamlQuery();

    // const caml: ICamlQuery = {
    //   ViewXml: "<View>" +
    //     // Can add some hardcode field references to limit the data that is being retrieved 
    //     "<RowLimit Paged='TRUE'>" + pageSize + "</RowLimit></View>",
    // };

    // camlQuery.set_viewXml("<View>" +
    // // Can add some hardcode field references to limit the data that is being retrieved 
    // "<RowLimit Paged='TRUE'>" + pageSize + "</RowLimit></View>");

    // var items = list.getItems(camlQuery);
    // clientContext.load(items);
    // clientContext.executeQueryAsync(function() {
    //   var itemArray = [];
    //   var itemEnumerator = items.getEnumerator();
    //   while(itemEnumerator.moveNext()) {
    //     var item = itemEnumerator.get_current();
    //     console.log(item);
    //     console.log("next");
    //   }
    // })
    // // caml.ListItemCollectionPosition 

    // while (moreRecords) {
    // list.getItemsByCAMLQuery(caml).then
    //   ((Response) => {
    //     allListItems = allListItems.concat(Response.map(item => new ClassItem(item)));
    //     moreRecords = pageSize === allListItems.length;
    //     console.log(Response.ListItemCollectionPosition);

    //     // caml.ListItemCollectionPosition
    //     // console.log(caml.ListItemCollectionPosition);
    //     this.setState({ listData: allListItems, allItems: allListItems, paginatedItems: allListItems });
    //   })
    // }

    // let moreItems = true;
    // let queryIndex = 0;

    // while (moreItems)
    // {
    //   let currQueryItems = [];
    //   // Get 6 items from the list 
    //   // pnp.sp.web.lists.getByTitle(listName).items.skip((queryIndex - 1) * pageSize).top(pageSize).select("Title", "Content_EN", "RollupImage", "LOOKUPId", "LOOKUP2Id").get().then
    //   //   ((Response) => {
    //   //     let currQueryItems = Response.map((item) => new ClassItem(item));
    //   //     currQueryItems = currQueryItems.filter((item) => )
    //   //   })      
    //   // queryIndex = queryIndex + 1;

    // }
  // }

  public getAATagListItems() {
    pnp.sp.web.lists.getByTitle('AATags').items.getAll().then
    ((Response) => {
      let tags = Response.map(item => new ClassTag(item));
      this.setState({ AAtags: tags });
    });
  }

  public getTATagListItems() {
    pnp.sp.web.lists.getByTitle('TATags').items.getAll().then
    ((Response) => {
      let tags = Response.map(item => new ClassTag(item));
      this.setState({ TAtags: tags });
    });
  }

  public returnLastID(response: number): number {
    return response;
  }

  // Determining the maximum limit for reading the items 
  public getLastListItemID() {
    console.log("Getting last list item...");
    pnp.sp.web.lists.getByTitle(listName)
      .items.orderBy('Id', false)
      .top(1)
      .select('Id')
      .get().then((Response) => {
        this.returnLastID(Response[0].Id)
      });
  }
}
