import React, {Component, Fragment} from 'react';
import moment from 'moment';
import chrome from 'ui/chrome';
import {saveRules} from './search_rules';

import {
  EuiBasicTable,
  EuiInMemoryTable,
  EuiPanel,
  EuiSelect,
  EuiFieldText,
  EuiFilePicker,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiButton,
  EuiButtonIcon,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiSpacer,
  EuiText,
  EuiLink,
} from '@elastic/eui';

export class SysmonSearch extends Component {
  constructor(props){
    super(props);
    this.state = {
      items:[],
      total:{},
      inputFields: [{item:"", value:""}],
      startDate: moment().add(-1, 'M'),
      endDate: moment().add(0, 'd'),
      conjunction:2,//OR
      pageIndex: 0,
      pageSize: 100,
      showPerPageOptions: true,
      file:null,
    };

    this.columns = [
      {
        field: 'utc', name: 'UTC Time', width:"20%", sortable:true,
        render: (utc, item) => {
          let link = chrome.addBasePath('/app/sysmon_search_r/stats');
          link += "?host=" + item.pc;
          link += "&date=" + moment(item.utc).format("YYYY-MM-DD");
          return (
            <Fragment>
              {utc}
            </Fragment>
          )
        }
      },
      {
        field: 'event', name: 'Event ID', width:"10%", sortable:true
      },
      {
        field: 'pc', name: 'Hostname', width:"20%", sortable:true,
        render: (pc, item) => {
          let link = chrome.addBasePath('/app/sysmon_search_r/process');
          link += "?host=" + item.pc;
          link += "&date=" + moment(item.utc).format("YYYY-MM-DD HH:mm:ss.SSS");
          return (
            <Fragment>
              <EuiButtonIcon
                iconType="graphApp"
                href={link}
                aria-label="Process Graph"
              />{pc}
            </Fragment>
          )
        }
      },
      {
        field: 'user', name: 'User', width:"10%", sortable:true
      },
      {
        field: 'description', name: 'Description', width:"10%", sortable:true,
        render: (descr, item) => {
          let link = chrome.addBasePath('/app/sysmon_search_r/process_list');
          link += "?host=" + item.pc;
          link += "&date=" + moment(item.utc).format("YYYY-MM-DD HH:mm:ss.SSS")
          link += "&category=" + descr;
          if(descr=="other") return(<Fragment>{descr}</Fragment>)
          else return (<EuiLink href={link} >{descr}</EuiLink>)
        }
      },
      {
        field: 'image', name: 'image', width:"30%", sortable:true,
        render: (image, item) => {
          let link = chrome.addBasePath('/app/sysmon_search_r/process_overview');
          link += "?host=" + item.pc;
          link += "&date=" + moment(item.utc).format("YYYY-MM-DD");
          link += "&guid=" + item.guid;
          return (
            <Fragment>
              <EuiButtonIcon
                iconType="graphApp"
                href={link}
                aria-label="Overview Graph"
              />
              {image}
            </Fragment>
          )
        }
      },
    ];

    this.options = [
      {value:0, text:"-"},
      {value:1, text:"IP Address"},
      {value:2, text:"Port"},
      {value:3, text:"Hostname"},
      {value:4, text:"Process Name"},
      {value:5, text:"Registry Key"},
      {value:6, text:"Registry Value"},
      {value:7, text:"Hash"},
    ];

    this.conjunctions = [
      {value:1, text:"AND"}, {value:2, text:"OR"}
    ]
    this.handleChangeStart = this.handleChangeStart.bind(this);
    this.handleChangeEnd = this.handleChangeEnd.bind(this);
    this.handleChangeConjunction = this.handleChangeConjunction.bind(this);
    this.handleAddFields = this.handleAddFields.bind(this);
    this.handleRemoveFields = this.handleRemoveFields.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.setFile = this.setFile.bind(this);
  }

  setFile(result){
    const file = JSON.parse(result);
    console.log(file)
    if((file.operator==="AND"||file.operator==="OR")&&file.patterns){
      this.setState({
        file:file,
      });
    }else{
      alert("Invalid File.");
    }
  }

  loadFile(file){
    const setFile = this.setFile; 
    console.log(file)
    var reader = new FileReader();
    reader.onload = function(){
      if(reader.result) setFile(reader.result);
    }
    if(file.length===1)reader.readAsText(file[0]);
  }

  clickLoad(){
    const file = this.state.file;
    if(file===null){
      alert("Please select a valid rule file.");
      return;
    }
    const conjunction = (file.operator==='AND')?1:2;
    var inputFields = [];
    const dict = {
      'IpAddress':1,
      'Port':2,
      'HostName':3,
      'ProcessName':4,
      'FileName':5,
      'RegistryKey':6,
      'RegistryValue':7,
      'Hash':8
    }
    for(let index in file.patterns){
      const field = {
        item: dict[file.patterns[index].key],
        value: file.patterns[index].value,
      } 
      inputFields.push(field);
    }
    this.setState({
      inputFields:inputFields,
      conjunction:conjunction,
    });
  }

  clickSave(){
    const res = confirm("Are you sure?");
    if(res===false)return;
    console.log(this.state);
    var data = {
      fm_start_date: moment(this.state.startDate),
      fm_end_date: moment(this.state.endDate),
      search_conjunction: Number(this.state.conjunction),
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
    saveRules(data);
  }

  clickSearch(){
    const api = chrome.addBasePath('/api/sysmon-search-plugin/sm_search');
    var data = {
      fm_start_date: moment(this.state.startDate),
      fm_end_date: moment(this.state.endDate),
      search_conjunction: Number(this.state.conjunction),
    };
    const inputs = this.state.inputFields;
    for (let index in inputs) {
      if (inputs[index].item && inputs[index].value){
        let id = Number(index) + 1;
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
          description: res.description,
          guid: res.process_guid,
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

  handleChangeStart(date) {
    this.setState({ startDate:date });
  }

  handleChangeEnd(date) {
    this.setState({ endDate: date });
  }

  handleChangeConjunction = event => {
    this.setState({ conjunction: event.target.value });
  }

  handleAddFields = () => {
    const values = [...this.state.inputFields];
    values.push({ item: '', value: '' });
    this.setState({inputFields:values});
  };

  handleRemoveFields = index => {
    const values = [...this.state.inputFields];
    values.splice(index, 1);
    this.setState({inputFields:values});
  };

  handleInputChange = (index, event) => {
    const values = [...this.state.inputFields];
    if (event.target.name === "item") {
      values[index].item = event.target.value;
    } else {
      values[index].value = event.target.value;
    }
    this.setState({inputFields:values});
  };

  render(){
    const { pageIndex, pageSize } = this.state;
    const start = pageIndex * pageSize;
    const pageOfItems = this.state.items.slice(start, pageSize);
    const totalItemCount = this.state.total;

    const sorting = {
      sort: {
        field: "utc",
        direction: "asc",
      }
    };

    const pagination = {
      pageIndex,
      pageSize,
      totalItemCount,
      pageSizeOptions: [100, 500, 1000],
      hidePerPageOptions: false,
    };

    const utc = 0;
    return (
      <EuiPanel>
        <EuiFlexItem>
          <EuiFormRow display="columnCompressed" label="Date" >
            <EuiDatePickerRange style={{minWidth:500}}
              startDateControl={
                <EuiDatePicker compressed
                  selected={this.state.startDate}
                  onChange={this.handleChangeStart}
                  startDate={this.state.startDate}
                  endDate={this.state.endDate}
                  isInvalid={this.state.startDate > this.state.endDate}
                  aria-label="Start date"
                  showTimeSelect
                  utcOffset={utc}
                />
              }
              endDateControl={
                <EuiDatePicker compressed
                  selected={this.state.endDate}
                  onChange={this.handleChangeEnd}
                  startDate={this.state.startDate}
                  endDate={this.state.endDate}
                  isInvalid={this.state.startDate > this.state.endDate}
                  aria-label="End date"
                  showTimeSelect
                  utcOffset={utc}
                />
              }
            />
          </EuiFormRow>
        </EuiFlexItem>
        <EuiSpacer size="m" />

        {this.state.inputFields.map((inputField, index) => (
          <EuiFlexGroup key={`input-${index}`}>
            <EuiFlexItem grow={false}>
              <EuiFormRow
                display="columnCompressed"
                label="Field" >
                <EuiSelect 
                  name="item"
                  compressed
                  value={inputField.item}
                  options={this.options}
                  onChange={event => this.handleInputChange(index, event)}
                />
              </EuiFormRow>
            </EuiFlexItem>

            <EuiFlexItem style={{maxWidth:400}}>
              <EuiFieldText name="value" compressed
                value={inputField.value}
                onChange={event => this.handleInputChange(index, event)}
              />
            </EuiFlexItem>

            <EuiFlexItem grow={false}>
              <EuiButton size="s" iconType="arrowLeft"
                onClick={() => this.handleRemoveFields(index)}
              >DEL</EuiButton>
            </EuiFlexItem>
          </EuiFlexGroup >
        ))}
  
        <EuiSpacer size="m" />

        <EuiFlexGroup >

          <EuiFlexItem grow={false} style={{minWidth:300}}>
            <EuiFormRow display="columnCompressed" label="Conjunction" >
              <EuiSelect name="conjunction" compressed style={{maxWidth:100}}
                value={this.state.conjunction}
                options={this.conjunctions}
                onChange={this.handleChangeConjunction}
              />
            </EuiFormRow>
          </EuiFlexItem>

          <EuiFlexItem grow={false}>
            <EuiButton size="s" iconType="arrowUp"
              onClick={() => this.handleAddFields()}
            >ADD</EuiButton>
          </EuiFlexItem>


          <EuiFlexItem grow={false}>
            <EuiButton size="s"
              onClick={ () => this.clickSearch() }
            >Search</EuiButton>
          </EuiFlexItem>
          <EuiFlexItem >
            <EuiText><h3>Total: {this.state.total.value}</h3></EuiText>
          </EuiFlexItem >
        </EuiFlexGroup >

        <EuiSpacer size="m" />

        <EuiFlexGroup >
          <EuiFlexItem grow={false}>
          <EuiText>Detection Rule</EuiText>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton size="s" 
              onClick={() => this.clickSave() }
            >SAVE</EuiButton>
          </EuiFlexItem>
          <EuiFlexItem grow={false}>
            <EuiButton size="s" 
              onClick={() => this.clickLoad() }
            >LOAD</EuiButton>
          </EuiFlexItem >
          <EuiFlexItem grow={false}>
            <EuiFilePicker
              display="default"
              initialPromptText="Select saved json file"
              onChange={file => {
                this.loadFile(file);
              }}
            />
          </EuiFlexItem >
          <EuiFlexItem grow={false}>
            <EuiButton size="s" 
              onClick={() => this.clickSave() }
            >DELETE</EuiButton>
          </EuiFlexItem>
        </EuiFlexGroup >

        <EuiSpacer size="m"/>

        <EuiInMemoryTable		
          items={this.state.items}
          columns={this.columns}
          pagination={pagination}
          sorting={sorting}
        />

      </EuiPanel>
    );
  
  }

};
