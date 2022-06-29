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


import Select from 'react-select-plus';
import 'react-select-plus/dist/react-select-plus.css';

import {Dropdown, PrimaryButton, IDropdownOption} from '@fluentui/react';

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

function logChange(val) {
  console.log("Selected: " + val);
}

export default class PnPPagination extends React.Component<IPnPPaginationProps, IPnPPaginationState> {
  onSelectedItem: (item: any) => void;

  constructor(props: IPnPPaginationProps) {
    super(props);

    this.state = {
      allItems: [],
      paginatedItems: [],
      AAtags: [],
    };
  }

  public componentDidMount(): void {
    this.getSPListItems();
    this.getTagListItems();
  }

  public logChange(val) {
    console.log("Selected: " + val.value);
    this.setState({
      allItems: this.state.allItems.filter(function (item) 
      {
        return item.ApplicationArea === val;
      })
    });
    this._getPage(1);
  }

  public render(): React.ReactElement<IPnPPaginationProps> {
    return (
      <main>
        <Select
          name="form-field-name"
          value="one"
          options={this.state.AAtags}
          onChange={logChange}
          placeholder="Select AA Tag..."
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
    console.log(roundupPage);

    this.setState({
      paginatedItems: this.state.allItems.slice((roundupPage - 1) * pageSize, ((roundupPage - 1) * pageSize) + pageSize)
    });
  }

  private refresh(aa_tag : string) {
    // this.setState
  }

  public getSPListItems() {
    pnp.sp.web.lists.getByTitle('Publication').items.getAll().then
      ((Response) => {
        let customerCollection = Response.map(item => new ClassItem(item));
        this.setState({ allItems: customerCollection, paginatedItems: customerCollection.slice(0, pageSize) });
      });
  }

  public getTagListItems() {
    pnp.sp.web.lists.getByTitle('AATags').items.getAll().then
      ((Response) => {
        let tags = Response.map(item => new ClassTag(item));
        this.setState({ AAtags: tags });
        console.log(this.state.allItems);
        console.log(this.state.AAtags);
      });
  }
}
