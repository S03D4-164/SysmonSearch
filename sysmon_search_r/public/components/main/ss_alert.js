import React, { Component, Fragment } from 'react';
import moment from 'moment';
import chrome from 'ui/chrome';

import {
  EuiInMemoryTable,
  EuiFieldText,
  EuiDatePicker,
  EuiDatePickerRange,
  EuiPanel,
  EuiButton,
  EuiFlexGroup,
  EuiFlexItem,
  EuiFormRow,
  EuiLink,
  EuiIcon,
  EuiButtonIcon,
  EuiText,
  EuiSpacer,
} from '@elastic/eui';

export class SysmonAlert extends Component {
  constructor(props){
    super(props);
    this.state = {
      items:[],
      total:{},
      unique_hosts:[],
      counts:[],
      rules:[],
      startDate: moment().add(-1, 'M'),
      endDate: moment().add(0, 'd'),
      keyword:"",
      //sortField: 'date',
      //sortDirection: 'asc',
      totalItemCount: 0,
      pageIndex: 0,
      pageSize: 100,
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

  componentDidMount(){ this.getAlerts() };

  getAlerts() {
    const query = {
      gte: this.state.startDate,
      lt: this.state.endDate,
    }
    const data = {
      query: query,
      sort_item: "event_id",
      sort_order: "asc",
    }
    const api = chrome.addBasePath('/api/sysmon-search-plugin/alert_data');
    fetch(api, {
      method:"POST",
      headers: {
        'kbn-xsrf': 'true',
        'Content-Type': 'application/json',
      },
      body:JSON.stringify(data)
    })
    .then((response) => response.json())
    .then((responseJson) => {
      console.log(responseJson);
      var rules = [];
      for (let index in responseJson.hits){
        const rule = responseJson.hits[index].rule;
        for (let number in rule){
          if (rules.some(r => r.filename === rule[number].filename)) {
            ;
          }else{
            rules.push(rule[number]);
          }
        }
      }
      this.setState({
        items: responseJson.hits,
        total: responseJson.total,
        unique_hosts: responseJson.unique_hosts,
        counts: responseJson.table_data,
        rules: rules
      });
    })
  }

  render(){

    const columns = [
      {
        field: 'utc_time',
        sortable: true,
        name: 'UtcTime',
        render: (date, item) => (
          <Fragment>
            {date}
          </Fragment>
        )
      },
      {
        field: 'event_id',
        sortable: true,
        name: 'EventId',
        render: (event, item) => {
          var link = chrome.addBasePath('/app/sysmon_search_r/process_list');
          link += "?host=" + item.computer_name;
          link += "&date=" + moment(item.utc_time).format("YYYY-MM-DD HH:mm:ss.SSS");
          link += "&category=" + item.description;
          return (
            <EuiLink href={link}>
              {event} - {item.description}
            </EuiLink>
          )
        }
      },
      {
        field: 'computer_name',
        name: 'Computer',
        sortable: true,
        render: (pc, item) => {
          console.log(item)
          var link = chrome.addBasePath('/app/sysmon_search_r/process');
          link += "?host=" + item.computer_name;
          link += "&date=" + moment(item.utc_time).format("YYYY-MM-DD HH:mm:ss.SSS");
          link += "&guid=" + item.process_guid;
          return (
            <EuiLink href={link}>
              {pc}
            </EuiLink>
          )
        }
      },
      {
        field: 'image',
        sortable: true,
        name: 'Process',
        render: (process, item) => {
          var link = chrome.addBasePath('/app/sysmon_search_r/process_overview');
          link += "?host=" + item.computer_name;
          link += "&date=" + moment(item.date).format("YYYY-MM-DD");
          link += "&guid=" + item.process_guid;
          return (
            <EuiLink href={link}>
              {process}
            </EuiLink>
          )
        }
      },
      {
        field: 'rule_name',
        sortable: true,
        name: 'RuleName',
      }
    ];

    const sorting = {
      sort: {
        field: "utc_time",
        direction: "asc",
      },
    };
    const { pageIndex, pageSize, totalItemCount } = this.state;
    const pagination = {
      pageIndex,
      pageSize,
      totalItemCount,
      pageSizeOptions: [100, 500, 1000],
      hidePerPageOptions: false,
    };

    const hostColumns = [
      {field: "key", name: "Computer"},
      {field: "doc_count", name: "Number of Matches"},
    ];

    /*
    const countColumns = [
      {field: "key", name: "Rule File"},
      {field: "doc_count", name: "Records"},
      {
        field: "hosts",
        name: "Unique Hosts",
        render: (hosts, item) => (
          <Fragment>
            {hosts.buckets.length}
          </Fragment>
        )
      },
    ];
    */

    const ruleColumns = [
      {field: "file_name", name: "Rule File"},
      //{field: "operator", name: "Operator"},
      {
        field: "patterns",
        name: "Patterns",
        /*
        render: (patterns, item) => {
          var pattern ="";
          for (let index in patterns){
            pattern += patterns[index].key + " : " + patterns[index].value;
            if (index < (patterns.length - 1)) pattern += " " + item.operator + " ";
          }
          return(
            <Fragment>
              {pattern}
            </Fragment>
          )
        }
        */
      },
      {field: "records", name: "Records"},
      {field: "unique_hosts", name: "Unique Hosts"},
    ];

    var rules = [];
    for(let index in this.state.rules){
      
      const rule = this.state.rules[index];
      var records, unique_hosts;
      var patterns ="";
      for (let number in rule.patterns){
        patterns += rule.patterns[number].key
        patterns += " : " + rule.patterns[number].value;
        if (number < (rule.patterns.length - 1)){
          patterns += " " + rule.operator + " ";
        }
      }
      for(let number in this.state.counts){
        const count = this.state.counts[number];
        if(rule.file_name===count.key){
          records = count.doc_count
          unique_hosts = count.hosts.buckets.length
        }
      }
      rules.push({
        file_name: rule.file_name,
        patterns:patterns,
        records: records,
        unique_hosts: unique_hosts
      })
    }

    const utc = 0;
    return (
      <EuiPanel>
        <EuiFlexGroup >
          <EuiFlexItem style={{ minWidth: 500 }}>
            <EuiFormRow label="Date">
              <EuiDatePickerRange style={{ minWidth: 500 }}
                startDateControl={
                  <EuiDatePicker
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
                  <EuiDatePicker
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
        </EuiFlexGroup >

        <EuiSpacer/>

        <h2>Matched Rules</h2>

        <EuiInMemoryTable
          items={rules}
          columns={ruleColumns}
        />

        <EuiSpacer/>

        <h2>Matched Hosts</h2>

        <EuiInMemoryTable
          items={this.state.unique_hosts}
          columns={hostColumns}
        />

        <EuiSpacer/>

        <h2>Matched Records</h2>

        <EuiInMemoryTable
          items={this.state.items}
          columns={columns}
          sorting={sorting}
          pagination={pagination}
        />

      </EuiPanel>
    );
  }
};

function del_file(filename) {
  const data = { filename: filename };
  const api = chrome.addBasePath('/api/sysmon-search-plugin/delete_alert_rule_file');
  fetch(api, {
    method:"POST",
    headers: {
      'kbn-xsrf': 'true',
      'Content-Type': 'application/json',
    },
    body:JSON.stringify(data)
  })
  .then((response) => response.json())
  .then((responseJson) => {
    console.log(responseJson);
    const response = responseJson;
    var code = response.data;
    if(code == 1){
      alert("delete succeeded");
      /*
      for(var i in self.rules){
        if(self.rules[i].filename == filename){
          delete self.rules[i].filename;
          break;
        }
      }
     */
    }else{
      alert("delete failed");
    }
  });

};

/*
function searchAlert(data) {
  const api = chrome.addBasePath('/api/sysmon-search-plugin/alert_data');
  fetch(api, {
    method:"POST",
    headers: {
      'kbn-xsrf': 'true',
      'Content-Type': 'application/json',
    },
    body:JSON.stringify(data)
  })
  .then((response) => response.json())
  .then((responseJson) => {
    console.log(responseJson);
    const response = responseJson;
    var tabledata_r = response.data.table_data;
    var search_data = response.data.hits;
    var unique_host_data = response.data.unique_hosts;

    //create results
    var tabledatas = [];
    var top = {
      //"rulename": $scope.lang["ALERT_TABLE_ALL"],
      "hit": response.data.total,
      "unique_hosts": response.data.unique_hosts.length
    }
    tabledatas.push(top);

    for(var i in tabledata_r){
      var tabledata ={};
      tabledata.rulename = tabledata_r[i].key;
      tabledata.hit = tabledata_r[i].doc_count;
      tabledata.unique_hosts = tabledata_r[i].hosts.buckets.length;
      tabledatas.push(tabledata);
    }

    var rules = [];
    for (var i = 0; i < search_data.length; i++) {
      for (var j = 0; j < search_data[i].rule.length; j++) {
        var flg = true;
        if (rules.length == 0) {
          rules.push(search_data[i].rule[j]);
          flg = false;
        } else {
          for (var k = 0; k < rules.length; k++) {
            if (search_data[i].rule[j]["file_name"] == rules[k]["file_name"]) {
              flg = false;
              break;
            }
          }
        }

        if (flg) rules.push(search_data[i].rule[j]);
      }
    }

  const api = chrome.addBasePath('/api/sysmon-search-plugin/alert_data');
    $http.get('../api/sysmon-search-plugin/get_alert_rule_file_list')
    .then((response) => {
      var file_list = response.data;
      var rules_arr = [];
      var rules_list = {};
                    
      for (var i = 0; i < rules.length; i++) {
        var rule_str;
        var rule_str_f;
        rule_str = $scope.lang["ALERT_RULE_NAME"]+"：" + rules[i].file_name;
        var operator = "OR";
        if (rules[i].operator) operator = rules[i].operator
                        
        rule_str = rule_str + " | "+$scope.lang["ALERT_RULE"]+"：" + operator;
        rule_str_f = $scope.lang["ALERT_RULE"]+"：" + operator;
        if (rules[i].start_time != null || rules[i].end_time != null) {
          var start_time = "";
          var end_time = ""
          if (rules[i].start_time) start_time = rules[i].start_time;                  
          if (rules[i].end_time) end_time = rules[i].end_time;
                            
          rule_str = rule_str + " | "+$scope.lang["ALERT_PERIOD"]+"：" + start_time + "～" + end_time;
          rule_str_f = rule_str_f + " | "+$scope.lang["ALERT_PERIOD"]+"：" + start_time + "～" + end_time;
        }
                
        for (var j = 0; j < rules[i].patterns.length; j++) {
          rule_str = rule_str + " | " + rules[i].patterns[j]["key"] + "：" + rules[i].patterns[j]["value"];
          rule_str_f = rule_str_f + " | " + rules[i].patterns[j]["key"] + "：" + rules[i].patterns[j]["value"];
        }
        var rule = {};
        rule.value = rule_str;
        if(file_list.indexOf(rules[i].file_name) >= 0){
          rule.filename = rules[i].file_name;
        }
        rules_arr.push(rule);
        rules_list[rules[i].file_name] = rule_str_f;
      }
      self.table_data = tabledatas
      self.rules = rules_arr;
      self.rules_list = rules_list;
      self.search_data = search_data;
      self.unique_host_data = unique_host_data;
    });
  });
}
*/
