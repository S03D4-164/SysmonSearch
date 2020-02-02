import React from 'react';
import {
  EuiPage,
  EuiPageHeader,
  EuiTitle,
  EuiPageBody,
  EuiPageContent,
  EuiPageContentHeader,
  EuiPageContentBody,
  EuiText,
} from '@elastic/eui';
import { FormattedMessage } from '@kbn/i18n/react';

import { SysmonSearchTabs } from './ss_tabs';

export class Main extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    const { httpClient } = this.props;
    console.log(httpClient)
    //httpClient.get('../api/ss_react/example').then(resp => {
    //  this.setState({ time: resp.data.time });
    //});
  }
  render() {
    const { title } = this.props;
    return (
      <EuiPage>
        <EuiPageBody>
          <EuiPageHeader>
            <SysmonSearchTabs />
          </EuiPageHeader>
          <EuiPageContent>
            <EuiPageContentHeader>
            </EuiPageContentHeader>
            <EuiPageContentBody>
            </EuiPageContentBody>
          </EuiPageContent>
        </EuiPageBody>
      </EuiPage>
    );
  }
}
