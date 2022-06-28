import * as React from 'react';
import styles from './PnPPagination.module.scss';
import { IPnPPaginationProps } from './IPnPPaginationProps';
import { IPnPPaginationState } from './IPnPPaginationState';
import { escape } from '@microsoft/sp-lodash-subset';
import { ISPItem } from '../models/ISPItem';
import { ClassItem } from '../models/ClassItem';

import { GridLayout } from "@pnp/spfx-controls-react/lib/GridLayout";
import { Pagination } from "@pnp/spfx-controls-react/lib/pagination";
import pnp from 'sp-pnp-js';

import './styles.css';
import 'bootstrap/dist/css/bootstrap.min.css';

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

const pageSize: number = 6;

export default class PnPPagination extends React.Component<IPnPPaginationProps, IPnPPaginationState> {
  constructor(props: IPnPPaginationProps) {
    super(props);

    this.state = {
      allItems: [],
      paginatedItems: []
    };
  }

  public componentDidMount(): void {
    this.getSPListItems();
  }

  public render(): React.ReactElement<IPnPPaginationProps> {
    return (
      <main>
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

  public getSPListItems() {
    pnp.sp.web.lists.getByTitle('Publication').items.getAll().then
      ((Response) => {
        let customerCollection = Response.map(item => new ClassItem(item));
        this.setState({ allItems: customerCollection, paginatedItems: customerCollection.slice(0, pageSize) });
      });
  }
}
