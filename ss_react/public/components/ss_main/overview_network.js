import React from "react";
import Graph from "react-graph-vis";
import imgProgram from "./images/program.png";
import imgNet from "./images/net.png";
import imgFile from "./images/file.png";
import imgReg from "./images/reg.png";
import { splitByLength, search } from "./ss_utils";

function add_child_info(cur, graph) {
  for (let index in cur.child) {
    var item = cur.child[index];
    var tmp_str_array = splitByLength(item.current.image, 10);
    var tmp_label = tmp_str_array.join('\n');
    var tmp_node = {
      "id": item.current.index,
      "label": tmp_label,
      "title": item.current.cmd,
      "shape": "circularImage",
      "image": imgProgram,
      "guid": item.current.guid,
      "info": item.current.info,
      "eventid": 1,
      "_id": item.current._id
    };
/*
                    if (search(item.current.info, keyword, hash)) {
                        tmp_node["color"] = {
                            "background": "red",
                            "border": "red"
                        };
                        tmp_node["borderWidth"] = 3;
                    }
*/
    //nodes.push(tmp_node);
    graph["nodes"].push(tmp_node);

    var tmp_edge = {
      "from": cur.current.index,
      "to": item.current.index,
      "arrows": "to",
      "color": {
         "color": "lightgray"
      },
      "length": 200
    };
    //edges.push(tmp_edge);
    graph["edges"].push(tmp_edge);
    graph = add_child_info(item, graph);
  }
  return graph;
}

function add_process_info(in_cur, graph) {
  console.log(in_cur)
  var cur = in_cur.current;
  var cur_id = cur.index;
  var now_id = cur.index * 10000 + 1;
  for (var index in cur.infos) {
    var item = cur.infos[index];
    var tmp_node = {
      "id": now_id,
      "label": item.data.Image,
      "title": item.data.Image,
      "shape": "circularImage",
      "image": imgProgram,
      "guid": item.data.ProcessGuid,
      "eventid": 1,
      "_id": item._id
    };

    tmp_node.id = now_id;
    if (item.id == 1) {
      tmp_node.image = imgProgram;//"../plugins/sysmon_search_visual/images/program.png";
      tmp_node.info = {
        'CurrentDirectory': item.data.CurrentDirectory,
        'CommandLine': item.data.CommandLine,
        'Hashes': item.data.Hashes,
        'ParentProcessGuid': item.data.ParentProcessGuid,
        'ParentCommandLine': item.data.ParentCommandLine,
        'ProcessGuid': item.data.ProcessGuid,
        'Image': item.data.Image
      };
      tmp_node.eventid = 1;
    } else if (item.id == 11) {
      tmp_node.image = imgFile;//"../plugins/sysmon_search_visual/images/file.png";
      tmp_node.label = item.data.TargetFilename;
      tmp_node.title = item.data.TargetFilename;
      tmp_node.info = {
        'ProcessGuid': item.data.ProcessGuid,
        'TargetFilename': item.data.TargetFilename,
        'Image': item.data.Image
      };
      tmp_node.eventid = 11;
    } else if ((item.id == 12) || (item.id == 13)) {
      tmp_node.image = imgReg;//"../plugins/sysmon_search_visual/images/reg.png";
      tmp_node.label = item.data.TargetObject;
      tmp_node.title = item.data.TargetObject;
      tmp_node.info = {
        'EventType': item.data.EventType,
        'ProcessGuid': item.data.ProcessGuid,
        'TargetObject': item.data.TargetObject,
        'Image': item.data.Image,
        'Details': item.data.Details
      };
      tmp_node.eventid = 12;
    } else if (item.id == 3) {
      tmp_node.image = imgNet;//"../plugins/sysmon_search_visual/images/net.png";
      if (item.type === 'alert') {
        // Set Alert Image
        tmp_node.image = imgNet;//"../plugins/sysmon_search_visual/images/net.png";
      }
      if (item.data.DestinationHostname === undefined) {
        tmp_node.label = item.data.DestinationIp;
      } else {
        tmp_node.label = item.data.DestinationHostname;
      }
      tmp_node.title = item.data.DestinationIp+":"+item.data.DestinationPort;
      tmp_node.info = {
        'SourceHostname': item.data.SourceHostname,
        'ProcessGuid': item.data.ProcessGuid,
        'SourceIsIpv6': item.data.SourceIsIpv6,
        'SourceIp': item.data.SourceIp,
        'DestinationPort:': item.data.DestinationPort,
        'DestinationHostname:': item.data.DestinationHostname,
        'DestinationIp': item.data.DestinationIp,
        'DestinationIsIpv6': item.data.DestinationIsIpv6,
        'Protocol': item.data.Protocol
      };
      tmp_node.eventid = 3;
    } else if (item.id == 8) {
      tmp_node.image = "../plugins/sysmon_search_visual/images/rthread.png";
                        tmp_node.label = item.data.TargetImage;
                        tmp_node.title = item.data.TargetImage;
                        tmp_node.info = {
                            'SourceProcessGuid': item.data.SourceProcessGuid,
                            'StartAddress': item.data.StartAddress,
                            'TargetProcessGuid': item.data.TargetProcessGuid,
                            'TargetImage': item.data.TargetImage,
                            'SourceImage': item.data.SourceImage
                        };
                        tmp_node.eventid = 8;
                        tmp_node.guid = item.data.SourceProcessGuid;
                    } else if (item.id == 2) {
                        tmp_node.image = "../plugins/sysmon_search_visual/images/file_create_time.png";
                        tmp_node.label = item.data.Image;
                        tmp_node.title = item.data.Image;
                        tmp_node.info = {
                            'Image': item.data.Image,
                            'CreationUtcTime': item.data.CreationUtcTime,
                            'PreviousCreationUtcTime': item.data.PreviousCreationUtcTime
                        };
                        tmp_node.eventid = 2;
                    } else if (item.id == 7) {
                        tmp_node.image = "../plugins/sysmon_search_visual/images/image_loaded.png";
                        tmp_node.label = item.data.Image;
                        tmp_node.title = item.data.Image;
                        tmp_node.info = {
                            'Image': item.data.Image,
                            'ImageLoaded': item.data.ImageLoaded,
                            'Hashes': item.data.Hashes
                        };
                        tmp_node.eventid = 7;
                    } else if (item.id == 19) {
                        tmp_node.image = "../plugins/sysmon_search_visual/images/wmi.png";
                        tmp_node.label = item.data.Name+":"+item.data.EventNamespace;
                        tmp_node.title = item.data.Name+":"+item.data.EventNamespace;
                        tmp_node.info = {
                            'User': item.data.User
                        };
                        tmp_node.eventid = 19;
                    } else if (item.id == 20) {
                        tmp_node.image = "../plugins/sysmon_search_visual/images/wmi.png";
                        tmp_node.label = item.data.Name;
                        tmp_node.title = item.data.Name;
                        tmp_node.info = {
                            'User': item.data.User
                        };
                        tmp_node.eventid = 20;
                    } else if (item.id == 21) {
                        tmp_node.image = "../plugins/sysmon_search_visual/images/wmi.png";
                        tmp_node.label = item.data.Consumer;
                        tmp_node.title = item.data.Consumer;
                        tmp_node.info = {
                            'User': item.data.User
                        };
                        tmp_node.eventid = 21;
    }

/*
    if (search(tmp_node.info, keyword, hash) || search(tmp_node.label, keyword, hash)) {
      tmp_node["color"] = {
        "background": "red",
        "border": "red"
      };
      tmp_node["borderWidth"] = 3;
    }
*/
    //nodes.push(tmp_node);
    graph["nodes"].push(tmp_node);

    var tmp_edge = {
      "from": cur_id,
      "to": now_id,
      "arrows": "to",
      "color": {
        "color": "lightgray"
      },
      "length": 200
    };
    //edges.push(tmp_edge);
    graph["edges"].push(tmp_edge);

    now_id += 1;
  }

  for (let index in in_cur.child) {
    var item = in_cur.child[index];
    graph = add_process_info(item, graph);
  }
  return graph;
};

function createNetwork(top, keyword, hash, firstflg) {
  console.log(top);
  var graph = {nodes:[], edges:[]};

  if(top.parent != null){
    var tmp_str_array = splitByLength(top.parent.image, 10);
    var tmp_label = tmp_str_array.join('\n');
    var tmp_parent_node = {
      "id": top.parent.index,
      "label": tmp_label,
      "title": top.parent.cmd,
      "shape": "circularImage",
      "image": imgProgram,
      "guid": top.parent.guid,
      "info": top.parent.info,
      "eventid": 1,
      "_id": top.parent._id
    };
/*
    if (search(top.parent.info, keyword, hash)) {
      tmp_parent_node["color"] = {
        "background": "red",
        "border": "red"
      };
      tmp_parent_node["borderWidth"] = 3;
    }
*/
    //nodes.push(tmp_parent_node);
    graph["nodes"].push(tmp_parent_node);

    var tmp_edge = {
      "from": top.parent.index,
      "to": top.current.index,
      "arrows": "to",
      "color": {
         "color": "lightgray"
      },
      "length": 200
    };
    //edges.push(tmp_edge);
    graph["edges"].push(tmp_edge);
  }
  
  if(top.current != null){

  var tmp_str_array = splitByLength(top.current.image, 10);
  var tmp_label = tmp_str_array.join('\n');
  var tmp_node = {
    "id": top.current.index,
    "label": tmp_label,
    "title": top.current.cmd,
    "shape": "circularImage",
    "image": imgProgram,
    "guid": top.current.guid,
    "info": top.current.info,
    "eventid": 1,
    "_id":  top.current._id
  };

/*
  if (search(top.current.info, keyword, hash) || firstflg) {
    tmp_node["color"] = {
      "background": "red",
      "border": "red"
    };
    tmp_node["borderWidth"] = 3;
  }
*/
  //nodes.push(tmp_node);
  graph["nodes"].push(tmp_node);

  graph = add_child_info(top, graph);
  graph = add_process_info(top, graph);
  }

  return graph;

}

export class GraphOverView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      graph:{},
      options:{},
      events:null,
      network:null, 
      textarea:""
    }

    //this.setNetwork = this.setNetwork.bind(this);
    //this.setText = this.setText.bind(this);
  }


  render(){

    const graph = createNetwork(
      this.props.tops,
      null,
      null,
      true,
    );

    var options = {
      nodes: {size: 25},
      edges: {
        width: 2,
        shadow: false,
        smooth: {
          type: 'continuous',
          roundness: 0
        }
      },
      layout: {
        hierarchical: {
            direction: 'LR',
            sortMethod: 'directed'
        },
        improvedLayout:true
      },
      interaction: {
        navigationButtons: true,
        keyboard: true
      },
      height:"500px",
    };

  return (
    <div>
    <div>
    <textarea rows="7" cols="120" readOnly placeholder="click node." value={this.state.textarea}></textarea>
    </div><br/>
    <Graph
      graph={graph}
      options={options}
      events={this.state.events}
      getNetwork={this.setNetwork}
    />
    </div>
  )
  }

}

/*
const events = {}
            network.on("click", function(properties) {
                var nodeid = network.getNodeAt(properties.pointer.DOM);

                if (nodeid) {
                    network.selectNodes([nodeid], true);
                    var node = this.body.data.nodes.get(nodeid);
                    if (node && node.info) {
                        console.log(node);
                        const veiw_data_1 = ["CurrentDirectory", "CommandLine", "Hashes", "ParentProcessGuid", "ParentCommandLine", "ProcessGuid"];
                        const veiw_data_11 = ["ProcessGuid"];
                        const veiw_data_12 = ["EventType", "ProcessGuid"];
                        const veiw_data_3 = ["SourceHostname", "ProcessGuid", "SourceIsIpv6", "SourceIp", "DestinationHostname"];
                        const veiw_data_8 = ["SourceProcessGuid", "StartAddress", "TargetProcessGuid"];
                        const veiw_data_2 = ["CreationUtcTime", "PreviousCreationUtcTime"];
                        const veiw_data_7 = ["Hashes"];
                        const veiw_data_19 = ["User"];
                        const veiw_data_20 = ["User"];
                        const veiw_data_21 = ["User"];
                        var view_data = [];
                        if (node.eventid == 1) {
                            view_data = veiw_data_1;
                        } else if (node.eventid == 11) {
                            view_data = veiw_data_11;
                        } else if (node.eventid == 12) {
                            view_data = veiw_data_12;
                        } else if (node.eventid == 3) {
                            view_data = veiw_data_3;
                        } else if (node.eventid == 8) {
                            view_data = veiw_data_8;
                        } else if (node.eventid == 2) {
                            view_data = veiw_data_2;
                        } else if (node.eventid == 7) {
                            view_data = veiw_data_7;
                        } else if (node.eventid == 19) {
                            view_data = veiw_data_19;
                        } else if (node.eventid == 20) {
                            view_data = veiw_data_20;
                        } else if (node.eventid == 21) {
                            view_data = veiw_data_21;
                        }
                        var str = "";
                        var alert_str = "";
                        for (var key in node.info) {
                            if (view_data.indexOf(key) >= 0) {
                                if (str === "") {
                                    str = key + ":" + node.info[key];
                                    alert_str = new_line(key + ":" + node.info[key]);
                                } else {
                                    str = str + "\n" + key + ":" + node.info[key];
                                    alert_str = alert_str + "\n" + new_line(key + ":" + node.info[key]);
                                }
                            }
                        }
                        $("#text").val(str);
                        //alert(alert_str);
                    }
                }
            });

            network.on("doubleClick", function(properties) {
                if (!properties.nodes.length) return;

                var node = this.body.data.nodes.get(properties.nodes[0]);
                if (node.guid != null && node.guid!="" && node.guid!="root") {
                    var _id = "0";
                    if(node._id != null){
                        _id = node._id;
                    }
                    var params = $route.current.params;
                    var url = 'sysmon_search_visual#/process_detail/' + params.hostname + '/' + params.date + '/' + node.guid + '/' + _id;
                    window.open(url, "_blank");
                }
            });
        }

        this.onkeyup = function(keyword, hash) {
            if(top && top != ""){
                create_network(localdata, keyword, hash, false);
            }
        };

    })
*/
