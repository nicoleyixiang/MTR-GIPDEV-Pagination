import * as React from 'react';
import { IPnPPaginationProps } from './IPnPPaginationProps';
import { IPnPPaginationState } from './IPnPPaginationState';

import { ClassItem } from '../models/ClassItem';
import { ClassTag } from '../models/ClassTag';

import { ICamlQuery } from '@pnp/sp/lists';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";


import { Pagination } from "@pnp/spfx-controls-react/lib/pagination";
import pnp from 'sp-pnp-js';

import Select from 'react-select';
import 'react-select-plus/dist/react-select-plus.css';

import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Grid } from '@react-ui-org/react-ui';
import { result } from 'lodash';

/* Constants */
const pageSize: number = 6;
const totalItems: number = 14;

/* Webpart component */
export default class PnPPagination extends React.Component<IPnPPaginationProps, IPnPPaginationState> {
  onSelectedItem: (item: any) => void;

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
      totalPages: Math.ceil(totalItems / pageSize)
    };
  }

  public componentDidMount(): void {
    this.getSPListItems(this.state.pageNumber);
    this.getAATagListItems();
    this.getTATagListItems();
  }

  public AAlogChange(val) {
    this.setState({ AASelectedTags: val ? val : [] }, () => this.getTaggedListItems(1));
  }

  public TAlogChange(val) {
    this.setState({ TASelectedTags: val ? val : [] }, () => this.getTaggedListItems(1));

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
        <Grid columns="repeat(auto-fit, minmax(300px, max-content))"
          columnGap="2rem" rowGap="2rem" justifyContent="center"
          alignItems="center" justifyItems="center">
          {
            this.state.paginatedItems.map((item) =>
              <div className="card">
                <img className="card__image" src={JSON.parse(item.RollupImage).serverRelativeUrl}></img>
                <div className="card__content">
                  <div className="card__title">
                    {item.Title}
                  </div>
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
          onChange={(page) => this.getSPListItems(page)}
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

  private getTaggedListItems(batchNumber) {
    const AAtagsList = this.state.AASelectedTags;
      const TAtagsList = this.state.TASelectedTags;

      let allListItems = [];

      // Both tag fields have selections 
      if (AAtagsList.length !== 0 && TAtagsList.length !== 0) {
        for (let i = 0; i < AAtagsList.length; i++) {
          for (let j = 0; j < TAtagsList.length; j++) {
            console.log("Two fields selected");
            pnp.sp.web.lists.getByTitle("Publication").items.filter("LOOKUPId eq '" + AAtagsList[i].ID + "' and LOOKUP2Id eq '" + TAtagsList[j].ID + "'").get().then
              ((Response) => {
                console.log(Response);
                allListItems = allListItems.concat(Response.map(item => new ClassItem(item)));
                this.setState({ listData: allListItems, 
                  allItems: allListItems, 
                  paginatedItems: allListItems.slice((batchNumber - 1) * pageSize, batchNumber * pageSize),
                  totalPages : allListItems.length / pageSize });
              });
          }
        }
      }

      // Only one or the other have selections 
      else {
        for (let i = 0; i < AAtagsList.length; i++) {
          pnp.sp.web.lists.getByTitle("Publication").items.filter("LOOKUPId eq '" + AAtagsList[i].ID + "'").get().then
            ((Response) => {
              allListItems = allListItems.concat(Response.map(item => new ClassItem(item)));
              this.setState({ listData: allListItems, allItems: allListItems, paginatedItems: allListItems.slice((batchNumber - 1) * pageSize, batchNumber * pageSize),
                totalPages : allListItems.length / pageSize });
            })
        }
        for (let j = 0; j < TAtagsList.length; j++) {
          pnp.sp.web.lists.getByTitle("Publication").items.filter("LOOKUP2Id eq '" + TAtagsList[j].ID + "'").get().then
            ((Response) => {
              allListItems = allListItems.concat(Response.map(item => new ClassItem(item)));
              this.setState({ listData: allListItems, allItems: allListItems, paginatedItems: allListItems.slice((batchNumber - 1) * pageSize, batchNumber * pageSize), 
                totalPages : allListItems.length / pageSize});
            })
        }
      }
  }

  public getSPListItems(batchNumber) {

    console.log(this.getLastListItemID());

    // Retrieve all items from the list (default view)
    if (this.state.AASelectedTags.length === 0 && this.state.TASelectedTags.length === 0) {
      pnp.sp.web.lists.getByTitle("Publication").items.skip((batchNumber - 1) * pageSize).top(pageSize).select("Title", "Content_EN", "RollupImage", "LOOKUPId", "LOOKUP2Id").get().then
        ((Response) => {
          let allListItems = Response.map(item => new ClassItem(item));
          this.setState({ listData: allListItems, allItems: allListItems, paginatedItems: allListItems, totalPages : Math.ceil(totalItems / pageSize)});
        });
    }
    // Retrieve items based on selected tags
    else {
      this.setState({ paginatedItems : this.state.listData.slice((batchNumber - 1) * pageSize, batchNumber * pageSize)});
    }

    // var clientContext = new SP.ClientContext();
    // var list = clientContext.get_web().get_lists().getByTitle("Publication");
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
    //   // pnp.sp.web.lists.getByTitle("Publication").items.skip((queryIndex - 1) * pageSize).top(pageSize).select("Title", "Content_EN", "RollupImage", "LOOKUPId", "LOOKUP2Id").get().then
    //   //   ((Response) => {
    //   //     let currQueryItems = Response.map((item) => new ClassItem(item));
    //   //     currQueryItems = currQueryItems.filter((item) => )
    //   //   })      
    //   // queryIndex = queryIndex + 1;

    // }
  }

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

  public returnLastID(response : number) : number {
    return response;
  }

  // Determining the maximum limit for reading the items 
  public getLastListItemID() {
    console.log("Getting last list item...");
    var result = 0;

    pnp.sp.web.lists.getByTitle("Publication")
    .items.orderBy('Id', false)
    .top(1)
    .select('Id')
    .get().then((Response) => {
      this.returnLastID(Response[0].Id)
      });
  }
}
