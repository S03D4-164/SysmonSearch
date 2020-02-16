import React from 'react';

import {
  EuiTitle,
  EuiPanel
} from '@elastic/eui';

const qs = require('query-string');
import {GraphOverView} from './overview_network';

export class SysmonOverView extends React.Component {
  constructor(props){
    super(props);
    let params = qs.parse(this.props.location.search);
    var api = "../../api/sysmon-search-plugin/process_overview";
    api += "/" + params.host;
    api += "/" + params.date;
    api += "/" + params.guid;
    console.log(api)
    this.state = {
      host: params.host,
      date: params.date,
      guid: params.guid,
      tops:[],
      keyword:null,
      hash:null,
      firstflg:true,
      //option:option,
      graph:{},
      events:null,
      network:null,
      textarea:"",
      api:api,
    };
  }

  componentDidMount(){
/*
    var api = "../../api/sysmon-search-plugin/process_overview";
    api += "/" + this.state.host;
    api += "/" + this.state.date;
    api += "/" + this.state.guid;
*/
    fetch(this.state.api, {
      method:"GET",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
    })
    .then((response) => response.json())
    .then((responseJson) => {
      if(responseJson)this.setState({tops:responseJson});
      console.log(JSON.stringify(responseJson));
    }) 
    .catch((error) =>{
      console.error(error);
    });
  }

  render() {
    //console.log(this.state)

    return (

<div id="correlation" style={{minWidth:"1280px",margin:"0 auto"}}>
<EuiTitle size="m">
  <h3>Overview</h3>
</EuiTitle>
      <EuiPanel>
<GraphOverView tops={this.state.tops} />
      </EuiPanel>
</div>
    )
  }
};
