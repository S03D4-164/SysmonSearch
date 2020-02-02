import React from 'react';

import {
  EuiBasicTable,
  EuiLink,
} from '@elastic/eui';

export class SysmonEvents extends React.Component {
  constructor(props){
    super(props);
    this.state = {items:[]};
  }

  componentDidMount(){
    fetch('../api/sysmon-search-plugin/hosts', {
      method:"POST",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
      body:JSON.stringify({
        //fm_start_date: "2020-01-01T00:00:00",
      })
    })
    .then((response) => response.json())
    .then((responseJson) => {
        var items = [];
        responseJson.map(res => {
          res.result.map(r  => {
            let item = {
              date: res.date,
              pc: r.key,
              count: r.doc_count,
            };
            items.push(item);
          });
        });
        this.setState({
          items:items
        });
        console.log(JSON.stringify(items));
    })
    .catch((error) =>{
      console.error(error);
    });
  }

  render(){
  const columns = [
    {field: 'date', name: 'date'},
    {field: 'pc', name: 'pc'},
    {field: 'count', name: 'count'},
  ];

  return (
    <EuiBasicTable
      items={this.state.items}
      columns={columns}
    />
  );
  }
};
