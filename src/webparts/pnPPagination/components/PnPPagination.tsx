import * as React from 'react';
import styles from './PnPPagination.module.scss';
import { IPnPPaginationProps } from './IPnPPaginationProps';
import { IPnPPaginationState } from './IPnPPaginationState';
import { escape } from '@microsoft/sp-lodash-subset';
import { ISPItem } from '../models/ISPItem';
import { ClassItem } from '../models/ClassItem';


import { ICamlQuery } from '@pnp/sp/lists';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";

// const sp = spfi(...);

import { ClassTag } from '../models/ClassTag';

import { GridLayout } from "@pnp/spfx-controls-react/lib/GridLayout";
import { Pagination } from "@pnp/spfx-controls-react/lib/pagination";
import pnp from 'sp-pnp-js';

import Select from 'react-select';
import 'react-select-plus/dist/react-select-plus.css';

import { Dropdown, PrimaryButton, IDropdownOption, ThemeSettingName } from '@fluentui/react';

import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Grid } from '@react-ui-org/react-ui';

const pageSize: number = 6;

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
    };
  }

  public componentDidMount(): void {
    this.getSPListItems(this.state.AASelectedTags, this.state.TASelectedTags, 0);
    this.getAATagListItems();
    this.getTATagListItems();
  }

  public resetLists(): void {
    if (this.state.AASelectedTags.length === 0 && this.state.TASelectedTags.length === 0) {
      console.log("reset to all");
      this._getPage(0);
    }
    else {
      let items = [];
      const AAtagsList = this.state.AASelectedTags;
      const TAtagsList = this.state.TASelectedTags;

      this._getPage(0);

      // if (AAtagsList.length !== 0 && TAtagsList.length !== 0) {
      //   for (let i = 0; i < AAtagsList.length; i++) {
      //     for (let j = 0; j < TAtagsList.length; j++) {
      //       items = items.concat(this.state.listData.filter(function (item) {
      //         return ((item.LOOKUPId === AAtagsList[i].ID)
      //           && (item.LOOKUP2Id === TAtagsList[j].ID));
      //       }))
      //     }
      //   }
      // } else {
      //   for (let i = 0; i < AAtagsList.length; i++) {
      //     items = items.concat(this.state.listData.filter(function (item) {
      //       return (item.LOOKUPId === AAtagsList[i].ID);
      //     }))
      //   }
      //   for (let j = 0; j < TAtagsList.length; j++) {
      //     items = items.concat(this.state.listData.filter(function (item) {
      //       return (item.LOOKUP2Id === TAtagsList[j].ID);
      //     }))
      //   }

      // }

      this.setState({
        paginatedItems: items.slice(0, pageSize),
        allItems: items
      })
    }
  }

  public noFilterListItems() {
    throw new Error('Method not implemented.');
  }

  public AAlogChange(val) {
    // this.setState({ AASelectedTags: val ? val : [] }, () => this.resetLists());
    this.setState({ AASelectedTags: val ? val : [] }, () => this._getPage(0));
  }

  public TAlogChange(val) {
    // this.setState({ TASelectedTags: val ? val : [] }, () => this.resetLists());
    this.setState({ TASelectedTags: val ? val : [] }, () => this._getPage(0));

  }

  public render(): React.ReactElement<IPnPPaginationProps> {
    return (
      <div className="main__container">
        <div className="filtering-box">
          <Select
            className="AA-single"
            classNamePrefix="select"
            // defaultValue={colourOptions[0]
            isMulti={true}
            isClearable={true}
            // isRtl={isRtl}
            placeholder="Application Area"
            onChange={(val) => this.AAlogChange(val)}
            name="color"
            options={this.state.AAtags}
          // styles={customStyles}
          />
          <Select
            className="TA-single"
            classNamePrefix="select"
            // defaultValue={colourOptions[0]
            isClearable={true}
            isMulti={true}
            // isRtl={isRtl}
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
          currentPage={1}
          // totalPages={(this.state.allItems.length / pageSize)}
          totalPages = {3}
          onChange={(page) => this._getPage(page)}
          hideFirstPageJump // Optional
          hideLastPageJump // Optional
          limiter={3}
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

  private _getPage(page: number) {
    // round a number up to the next largest integer.
    const roundupPage = Math.ceil(page);
    var retrieveMoreItems = true;

    // while (retrieveMoreItems) {
      pnp.sp.web.lists.getByTitle("Publication").items.skip((page - 1) * pageSize).top(pageSize).get().then
      ((Response) => {
        if (this.state.AASelectedTags.length === 0 && this.state.TASelectedTags.length === 0) {
          let collection = Response.map(item => new ClassItem(item));
          this.setState({ listData: collection, allItems: collection, paginatedItems: collection });
          retrieveMoreItems = false;
        }
        else {
          console.log("yo");
          const AAtagsList = this.state.AASelectedTags;
          const TAtagsList = this.state.TASelectedTags;

          let collection = Response.map(item => new ClassItem(item));
          let items = [];
          for (let i = 0; i < AAtagsList.length; i++) {
            items = items.concat(collection.filter(function (item) {
              return (item.LOOKUPId === AAtagsList[i].ID);
            }))
          }
          for (let j = 0; j < TAtagsList.length; j++) {
            items = items.filter(function (item) {
                  return (item.LOOKUP2Id === TAtagsList[j].ID);
                })
              }
          this.setState({ listData: items, allItems: items, paginatedItems: items });
          retrieveMoreItems = false;
        }
      });
    // }
    // this.setState({
    //   paginatedItems: this.state.allItems.slice((roundupPage - 1) * pageSize, ((roundupPage - 1) * pageSize) + pageSize)
    // });
  }

  

  public getSPListItems(AATags, TATags, batchNumber) {

    let allListItems = [];

    /* 
      1. Get 6 items from the site 
      2. Filter through the 6 items according to the tags and add the wanted items to the list 
      3. Repeat steps 1 + 2 until we get a list of a length of pageSize or we reach the end of the list 
      4. If the user clicks on the next button, trigger the process of getting another 6 items 
    */

    // var list = pnp.sp.web.lists.getByTitle("Publication");
    
    
    // if (AATags === [] && TATags === []) {
      pnp.sp.web.lists.getByTitle("Publication").items.skip((batchNumber - 1 * pageSize)).top(pageSize).get().then
      ((Response) => {
        console.log(Response);
        allListItems = allListItems.concat(Response.map(item => new ClassItem(item)));
        this.setState({ listData: allListItems, allItems: allListItems, paginatedItems: allListItems });
        console.log(allListItems);
      });
    // }
    // var clientContext = new SP.ClientContext();
    // var list = clientContext.get_web().get_lists().getByTitle("Publication");
    // var camlQuery = new SP.CamlQuery();

    const caml: ICamlQuery = {
      ViewXml: "<View>" +
        // Can add some hardcode field references to limit the data that is being retrieved 
        "<RowLimit Paged='TRUE'>" + pageSize + "</RowLimit></View>",
    };

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
}
