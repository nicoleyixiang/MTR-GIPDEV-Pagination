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


// import Select from 'react-select-plus';
import Select from 'react-select';
import 'react-select-plus/dist/react-select-plus.css';

import { Dropdown, PrimaryButton, IDropdownOption } from '@fluentui/react';

import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import { ComboBoxListItemPicker } from '@pnp/spfx-controls-react/lib/ListItemPicker';
import {
  DocumentCard,
  DocumentCardActivity,
  DocumentCardPreview,
  DocumentCardDetails,
  DocumentCardTitle,
  IDocumentCardPreviewProps,
  DocumentCardLocation,
  DocumentCardType
} from 'office-ui-fabric-react/lib/DocumentCard';
import { ImageFit } from 'office-ui-fabric-react/lib/Image';
import { ISize } from 'office-ui-fabric-react/lib/Utilities';
import { CCard, CCardImage, CCardBody, CCardTitle, CCardText, CButton, CRow, CCol } from '@coreui/react';

import { Grid } from '@react-ui-org/react-ui';


// import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

// import * as strings from 'FluentUiDropdownWebPartStrings';
// import FluentUiDropdown from './components/FluentUiDropdown';
// import { IFluentUiDropdownProps } from './components/IFluentUiDropdownProps';

const pageSize: number = 6;

// var Select = require('react-select-plus');

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
    };
  }

  public componentDidMount(): void {
    this.getSPListItems();
    this.getAATagListItems();
    this.getTATagListItems();
  }

  public AAlogChange(val) {
    // console.log("Selected: " + val.value);
    if (val) {
      this.setState({AASelected : this.state.allItems});
      this.setState({
        allItems: this.state.allItems.filter(function (item) {
          return item.ApplicationArea === (val ? val.value : null);
        })
      });
      console.log(this.state.allItems);
      this._getPage(1);
    }
    else {
      console.log("hello");
      this.setState({ allItems: this.state.listData });
      this._getPage(1);
    }
  }

  public TAlogChange(val) {
    if (val) {
      this.setState({TASelected : this.state.allItems});
      this.setState({
        allItems: this.state.allItems.filter(function (item) {
          return item.ApplicationArea === (val ? val.value : null);
        })
      });
      console.log(this.state.allItems);
      this._getPage(1);
    }
    else if (this.state.AASelected.length === 0) {
      console.log("clearall");
      this.setState({ allItems: this.state.listData });
      console.log(this.state.allItems);
      this._getPage(1);
    }
    else {
      this.setState({allItems : this.state.AASelected, TASelected : []})
      console.log(this.state.allItems);
    }
  }

  public render(): React.ReactElement<IPnPPaginationProps> {
    return (
      <main>
        <Select
          className="AA-single"
          classNamePrefix="select"
          // defaultValue={colourOptions[0]
          isClearable={true}
          // isRtl={isRtl}
          placeholder="Select AA Tag..."
          onChange={(val) => this.AAlogChange(val)}
          name="color"
          options={this.state.AAtags}
        // isClearable={true}
        />
        <Select
          className="TA-single"
          classNamePrefix="select"
          // defaultValue={colourOptions[0]
          isClearable={true}
          // isRtl={isRtl}
          placeholder="Select TA Tag..."
          onChange={(val) => this.TAlogChange(val)}
          name="color"
          options={this.state.TAtags}
        // isClearable={true}
        />
        <Grid columns="repeat(auto-fill, minmax(300px, 1fr))"
          columnGap="2rem" rowGap="2rem">
          {
            this.state.paginatedItems.map((item) =>
              <div className="card">
                <img className="card__image" src={JSON.parse(item.RollupImage).serverRelativeUrl}></img>
                <div className="card__content">
                  <p>
                    {item.Title}
                  </p>
                  <p>{item.ApplicationArea}</p>
                  {/* <div className="card__tag">hello</div> */}
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
      </main>
    );
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
        this.setState({ listData: customerCollection, allItems: customerCollection, paginatedItems: customerCollection.slice(0, pageSize) });
      });
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
