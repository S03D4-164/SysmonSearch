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
      data:{},
      fields:{},
      values:{},
      items:[],
      total:{},
      inputs: ['_1'],
      startDate: moment().add(-1, 'd'),
      endDate: moment().add(0, 'd'),
    };
    this.options = [
      {value:0, text:"-"},
      {value:1, text:"IP Address"},
      {value:2, text:"Port"},
      {value:3, text:"Hostname"},
      {value:4, text:"Process"},
    ];
    this.handleChangeStart = this.handleChangeStart.bind(this);
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
    this.handleChangeField = this.handleChangeField.bind(this);
    this.handleChangeValue = this.handleChangeValue.bind(this);
    this.delInput = this.delInput.bind(this);
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

  handleChangeField (event) {
    var data = this.state.fields;
    console.log(event.target)
    data[event.target.name] = event.target.value;
    this.setState({
      fields: data
    });
  }

  handleChangeValue (event) {
    var data = this.state.values;
    console.log(event.target)
    data[event.target.name] = event.target.value;
    this.setState({
      values: data
    });
  }

  clickSearch(){
    const api = chrome.addBasePath('/api/sysmon-search-plugin/sm_search');
    let data = {...this.state.fields, ...this.state.values};
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

  getStateField(key){
    return this.state.fields[key]
  }

  getStateValue(key){
    return this.state.values[key]
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
  //console.log(this.state)
  return (
      <EuiPanel>

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


      {this.state.inputs.map((input) => {
      let key = {
        item: "search_item" + input,
        value: "search_value" + input,
      }
      let field = this.getStateField(key.item)
      let value = this.getStateValue(key.value)
      return(
  <EuiFlexGroup key={input}>
{input}
    <EuiFlexItem >
      <EuiFormRow label="Field" >

      <EuiSelect 
      key={key.item}
      name={key.item}
      value={field}
      options={this.options}
      onChange={this.handleChangeField}
      />
      </EuiFormRow>
    </EuiFlexItem>

    <EuiFlexItem >
      <EuiFormRow label="Value" >

      <EuiFieldText 
      key={key.value}
      name={key.value}
      onChange={this.handleChangeValue} />

      </EuiFormRow>
    </EuiFlexItem>
    <EuiFlexItem >
      <EuiFormRow hasEmptyLabelSpace >
      <button name={input} onClick={this.delInput}>DEL</button>
      </EuiFormRow>
    </EuiFlexItem>

  </EuiFlexGroup >

      )}
      )}


      <EuiButton size="s" onClick={ () => this.addInput() }>Add</EuiButton>
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

  addInput() {
    var newInput = `_${this.state.inputs.length + 1}`;
    this.setState(prevState => ({ inputs: prevState.inputs.concat([newInput]) }));
  }

  delInput(event) {
    const index = event.target.name;
    console.log(index)
    var newInputs = this.state.inputs.slice();
    newInputs.pop();
    var inputs = this.state.inputs.slice();
    var del = inputs.indexOf(index);
    if (del !== -1) inputs.splice(del, 1);
    var newFields = {};
    var newValues = {};
      console.log(inputs, newInputs, newFields, newValues)
    for (let number in newInputs){
      let fieldName = "search_item" + inputs[number];
      let newField = "search_item" + newInputs[number];
      newFields[newField] = this.state.fields[fieldName]

      let valueName = "search_value" + inputs[number];
      let newValue = "search_value" + newInputs[number];
      newValues[newValue] = this.state.values[valueName]
      console.log(inputs, newInputs, newFields, newValues)

    }

    this.setState({
      inputs: newInputs,
      fields: newFields,
      values: newValues,
    });
  }

};
