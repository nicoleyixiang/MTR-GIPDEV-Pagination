import * as React from 'react';
import styles from './PnPPagination.module.scss';
import { IPnPPaginationProps } from './IPnPPaginationProps';
import { IPnPPaginationState } from './IPnPPaginationState';
import { escape } from '@microsoft/sp-lodash-subset';
import { ISPItem } from '../models/ISPItem';
import { ClassItem } from '../models/ClassItem';

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
    this.getSPListItems();
    this.getAATagListItems();
    this.getTATagListItems();
  }

  public resetLists(): void {
    if (this.state.AASelectedTags.length === 0 && this.state.TASelectedTags.length === 0) {
      console.log("reset to all");
      this.setState({
        paginatedItems: this.state.listData.slice(0, pageSize),
        allItems: this.state.listData
      });
    }
    else {
      let items = [];
      const AAtagsList = this.state.AASelectedTags;
      const TAtagsList = this.state.TASelectedTags;

      if (AAtagsList.length !== 0 && TAtagsList.length !== 0) {
        for (let i = 0; i < AAtagsList.length; i++) {
          for (let j = 0; j < TAtagsList.length; j++) {
            console.log("hello");
            items = items.concat(this.state.listData.filter(function(item) {
              return ((item.LOOKUPId === AAtagsList[i].ID)
                    && (item.LOOKUP2Id === TAtagsList[j].ID));
          }))
        }
      }
    } else {
      for (let i = 0; i < AAtagsList.length; i++) {
        items = items.concat(this.state.listData.filter(function(item) {
          return (item.LOOKUPId === AAtagsList[i].ID);
        }))
      }
      for (let j = 0; j < TAtagsList.length; j++) {
        items = items.concat(this.state.listData.filter(function(item) {
          return (item.LOOKUP2Id === TAtagsList[j].ID);
        }))
      }

    }

    this.setState({
      paginatedItems : items.slice(0, pageSize),
      allItems: items
      })
  }
  }
  
  public noFilterListItems() {
    throw new Error('Method not implemented.');
  }

  public AAlogChange(val) {
    this.setState({AASelectedTags : val? val : []}, () => this.resetLists());
  }

  public TAlogChange(val) {
    this.setState({TASelectedTags : val? val : []}, () => this.resetLists());
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
          totalPages={(this.state.allItems.length / pageSize)}
          onChange={(page) => this._getPage(page)}
          hideFirstPageJump // Optional
          hideLastPageJump // Optional
          limiter={3}
        />
      </div>
    );
  }

  private getAATag(idNum) {
    console.log(idNum);
    for (let i = 0; i < this.state.AAtags.length ; i++) {
      console.log(this.state.AAtags[i].ID);
      if (this.state.AAtags[i].ID == idNum) {
        return this.state.AAtags[i].value;
      }
    }
    return null;
  }

  private getTATag(idNum) {
    console.log(idNum);
    for (let i = 0; i < this.state.TAtags.length ; i++) {
      console.log(this.state.TAtags[i].ID);
      if (this.state.TAtags[i].ID == idNum) {
        return this.state.TAtags[i].value;
      }
    }
    return null;
  }

  private _getPage(page: number) {
    // round a number up to the next largest integer.
    const roundupPage = Math.ceil(page);

    this.setState({
      paginatedItems: this.state.allItems.slice((roundupPage - 1) * pageSize, ((roundupPage - 1) * pageSize) + pageSize)
    });
  }

  public getSPListItems() {
    pnp.sp.web.lists.getByTitle('Publication').items.getAll().then
      ((Response) => {
        let customerCollection = Response.map(item => new ClassItem(item));
        console.log(Response);
        this.setState({ listData: customerCollection, allItems: customerCollection, paginatedItems: customerCollection.slice(0, pageSize) });
      });
  }

  public getAATagListItems() {
    pnp.sp.web.lists.getByTitle('AATags').items.getAll().then
      ((Response) => {
        let tags = Response.map(item => new ClassTag(item));
        console.log(Response);
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
