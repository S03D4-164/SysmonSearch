import React from 'react';
import moment from 'moment';
import chrome from 'ui/chrome';

import {
  EuiBasicTable,
  EuiPanel,
  EuiSelect,
  EuiFieldText,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
} from '@elastic/eui';

export class SysmonSearch extends React.Component {
  constructor(props){
    super(props);
    this.state = {
      items:[],
      total:{},
      inputFields: [{item:"", value:""}],
      startDate: moment().add(-1, 'M'),
      endDate: moment().add(0, 'd'),
    };
    this.handleChangeStart = this.handleChangeStart.bind(this);
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
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

  clickSearch(){
    const api = chrome.addBasePath('/api/sysmon-search-plugin/sm_search');
    var data = {
      fm_start_date: moment(this.state.startDate),
      fm_end_date: moment(this.state.endDate),
    };
    const inputs = this.state.inputFields;
    for (let index in inputs) {
      if (inputs[index].item && inputs[index].value){
      let id = index + 1;
      let searchItem = "search_item_" + Number(id).toString();
      data[searchItem] = inputs[index].item;
      let searchValue = "search_value_" + Number(id).toString();
      data[searchValue] = inputs[index].value;
      }
    }
    console.log(data);
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

  const handleAddFields = () => {
    const values = [...this.state.inputFields];
    values.push({ item: '', value: '' });
    this.setState({inputFields:values});
  };

  const handleRemoveFields = index => {
    const values = [...this.state.inputFields];
    values.splice(index, 1);
    this.setState({inputFields:values});
  };

  const handleInputChange = (index, event) => {
    const values = [...this.state.inputFields];
    if (event.target.name === "item") {
      values[index].item = event.target.value;
    } else {
      values[index].value = event.target.value;
    }
    this.setState({inputFields:values});
  };

  const columns = [
    {field: 'utc', name: 'utc'},
    {field: 'event', name: 'event'},
    {field: 'pc', name: 'pc'},
    {field: 'user', name: 'user'},
    {field: 'image', name: 'image'},
  ];

  const options = [
    {value:0, text:"-"},
    {value:1, text:"IP Address"},
    {value:2, text:"Port"},
    {value:3, text:"Hostname"},
    {value:4, text:"Process"},
  ];


return (
<EuiPanel>


{this.state.inputFields.map((inputField, index) => (

<EuiFlexGroup key={`input-${index}`}>
  <EuiFlexItem >
  <EuiFormRow label="Field" >
    <EuiSelect 
      name="item"
      value={inputField.item}
      options={options}
      onChange={event => handleInputChange(index, event)}
    />
  </EuiFormRow>
  </EuiFlexItem>

  <EuiFlexItem >
  <EuiFormRow label="Value" >
    <EuiFieldText 
      name="value"
      value={inputField.value}
      onChange={event => handleInputChange(index, event)}
    />
  </EuiFormRow>
  </EuiFlexItem>

  <EuiFlexItem grow={false}>
    <EuiFormRow hasEmptyLabelSpace >
      <EuiButton size="s"
        onClick={() => handleRemoveFields(index)}
      >DEL</EuiButton>
    </EuiFormRow>
  </EuiFlexItem>

  <EuiFlexItem frow={false}>
    <EuiFormRow hasEmptyLabelSpace >
      <EuiButton size="s"
        onClick={() => handleAddFields()}
      >ADD</EuiButton>
    </EuiFormRow>
  </EuiFlexItem>

</EuiFlexGroup >

))}

  <EuiFlexGroup >
    <EuiFlexItem grow={false}>
      <EuiFormRow label="Date">
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
      </EuiFormRow>
    </EuiFlexItem>
  </EuiFlexGroup >

<EuiButton size="s" onClick={ () => this.clickSearch() }>Search</EuiButton>

<EuiSpacer />

    <h3>Total: {this.state.total.value}</h3>

<EuiSpacer />

    <EuiBasicTable		
        items={this.state.items}
        columns={columns}
      />
      </EuiPanel>

);
  
}

};
