import React from 'react';

import {
  EuiBasicTable,
  EuiTitle,
  EuiPanel,
  EuiSelect,
  EuiFieldText
} from '@elastic/eui';

export class SysmonSearch extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      search:[],
      items:[],
      inputs: ['input-0']
    };
    this.options = [
      { value: 'host', text: 'host' },
      { value: 'process', text: 'process' },
    ];
  }

  clickSearch(){
    let api = '../../api/sysmon-search-plugin/sm_search';
    fetch(api, {method:"POST",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
      body:JSON.stringify(this.state.search)
    }).then((response) => response.json())
    .then((responseJson) => {
        console.log(responseJson);
        var items = [];
        responseJson.hits.map(res => {
            let item = {
              utc: res.utc_time,
              event: res.event_id,
              pc: res.computer_name,
              user: res.user_name,
              image: res.image,
            };
            items.push(item);
        });
        this.setState({
          items:items
        });
    })
    .catch((error) =>{
      console.error(error);
    });
  }

  dynamicForm () {
  }

  render(){
    const columns = [
      {
        field: 'utc',
        name: 'utc',
      },
      {
        field: 'event',
        name: 'event',
      },
      {
        field: 'pc',
        name: 'pc',
      },
      {field: 'user', name: 'user'},
      {
        field: 'image',
        name: 'image',
      },
  ];

  return (
    <div>
      <EuiPanel>
      {this.state.inputs.map(input => 
      <div key={input}>
      <EuiSelect key={input}
      options={this.options}
      />
      <EuiFieldText key={input} />
      </div>
      )}
      <button onClick={ () => this.addInput() }>Add</button>
      <button onClick={ () => this.clickSearch() }>Search</button>
    <EuiBasicTable
        items={this.state.items}
        columns={columns}
      />
      </EuiPanel>
    </div>
  );
  }

  addInput() {
    var newInput = `input-${this.state.inputs.length}`;
    this.setState(prevState => ({ inputs: prevState.inputs.concat([newInput]) }));
  }

  onChange = e => {
    this.setState({
      value: e.target.value,
    });
  };
};
