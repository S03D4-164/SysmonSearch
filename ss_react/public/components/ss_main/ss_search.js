import React from 'react';
import moment from 'moment';

import {
  EuiBasicTable,
  EuiTitle,
  EuiPanel,
  EuiSelect,
  EuiFieldText,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
} from '@elastic/eui';

export class SysmonSearch extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      data:{},
      items:[],
      total:{},
      inputs: ['_1'],
      startDate: moment().add(-1, 'd'),
      endDate: moment().add(0, 'd'),
    };
    this.options = [
      {value:1, text:"ip"},
      {value:2, text:"port"},
      {value:3, text:"host"},
      {value:4, text:"process"},
    ];
    this.handleChangeStart = this.handleChangeStart.bind(this);
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
    this.handleChange = this.handleChange.bind(this);
  }

  handleChangeStart(date) {
    this.setState({
      startDate: date,
    });
  }

  handleChangeEnd(date) {
    this.setState({
      endDate: date,
    });
  }

  handleChange (event) {
    var data = this.state.data;
    console.log(event.target)
    data[event.target.name] = event.target.value;
    this.setState({
      data: data
    });
  }

  clickSearch(){
    let api = '../../api/sysmon-search-plugin/sm_search';
    let data = this.state.data;
    data["fm_start_date"] = moment(this.state.startDate),
    data["fm_end_date"] = moment(this.state.endDate),
    fetch(api, {method:"POST",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
      body:JSON.stringify(data)
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
          items:items,
          total:responseJson.total,
        });
    })
    .catch((error) =>{
      console.error(error);
    });
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
  console.log(this.state)
  return (
    <div>
      <EuiTitle><h3>Event List</h3>
      </EuiTitle>
      <EuiPanel>
      <EuiDatePickerRange
        startDateControl={
          <EuiDatePicker
            selected={this.state.startDate}
            onChange={this.handleChangeStart}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            isInvalid={this.state.startDate > this.state.endDate}
            aria-label="Start date"
            showTimeSelect
          />
        }
        endDateControl={
          <EuiDatePicker
            selected={this.state.endDate}
            onChange={this.handleChangeEnd}
            startDate={this.state.startDate}
            endDate={this.state.endDate}
            isInvalid={this.state.startDate > this.state.endDate}
            aria-label="End date"
            showTimeSelect
          />
        }
      />
      {this.state.inputs.map((input) => {
      let key = {
        item: "search_item" + input,
        value: "search_value" + input,
      }
      return(
      <div key={input}>
      <EuiSelect
      key={key.item}
      name={key.item}
      options={this.options}
      onChange={this.handleChange}
      />
      <EuiFieldText
      key={key.value}
      name={key.value}
      onChange={this.handleChange} />
      </div>
      )}
      )}
      <EuiButton onClick={ () => this.addInput() }>
      Add</EuiButton>
      <EuiButton onClick={ () => this.clickSearch() }>
      Search</EuiButton>
    <h3>Total: {this.state.total.value}</h3>
    <EuiBasicTable		
        items={this.state.items}
        columns={columns}
      />
      </EuiPanel>
    </div>
  );
  }

  addInput() {
    var newInput = `_${this.state.inputs.length + 1}`;
    this.setState(prevState => ({ inputs: prevState.inputs.concat([newInput]) }));
  }

};
