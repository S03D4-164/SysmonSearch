function splitByLength(str, length) {
                        var resultArr = [];
                        if (!str || !length || length < 1) {
                            return resultArr;
                        }
                        var index = 0;
                        var start = index;
                        var end = start + length;
                        while (start < str.length) {
                            resultArr[index] = str.substring(start, end);
                            index++;
                            start = end;
                            end = start + length;
                        }
                        return resultArr;
}

function search(data, keyword, hash) {
            var flg1 = 1;
            var flg2 = 1;
            if (keyword != null && keyword !== "") {
                if (local_search(data, keyword)) {
                    flg1 = 2;
                }
            } else {
                flg1 = 3;
            }

            if (hash != null && hash !== "") {
                if (data["Hashes"] != null) {
                    if (data["Hashes"].indexOf(hash) != -1) {
                        flg2 = 2;
                    }
                }
            } else {
                flg2 = 3;
            }

            if ((flg1 == 2 && flg2 == 2) || (flg1 == 2 && flg2 == 3) || (flg1 == 3 && flg2 == 2)) {
                return true;
            } else {
                return false;
            }

}



                function add_child_info(cur) {
                    for (var index in cur.child) {
                        var item = cur.child[index];
                        var tmp_str_array = splitByLength(item.current.image, 10);
                        var tmp_label = tmp_str_array.join('\n');

                        var tmp_node = {
                            "id": item.current.index,

                            "label": tmp_label,
                            "title": item.current.cmd,

                            "shape": "circularImage",
                            "image": "../plugins/sysmon_search_visual/images/program.png",

                            //              "info": item.current
                            //              "url": "visual#/detail.html?pid=4&image=%7B0079005F-0073-0074-6500-6D0000000000%7D"
                            "guid": item.current.guid,
                            "info": item.current.info
                        };
                        if (search(item.current.info, keyword, hash)
                            || (firstflg == true && $route.current.params.guid == item.current.guid)) 
                        {
                            tmp_node["color"] = {
                                "background": "red",
                                "border": "red"
                            };
                            tmp_node["borderWidth"] = 3;
                        }
                        // console.log( tmp_node );
                        nodes.push(tmp_node);

                        var tmp_edge = {
                            "from": cur.current.index,
                            "to": item.current.index,

                            "arrows": "to",
                            "color": {
                                "color": "lightgray"
                            },
                            "length": 200
                        };
                        // console.log( tmp_edge );
                        edges.push(tmp_edge);

                        for( var n_key in item.current.info.Net ) {
                            var n_item = item.current.info.Net[ n_key ];
                            var n_index = item.current.index+"-"+n_key;
                            var tmp_node = {
                                "id": n_index,

                                "label": n_key+":"+n_item,
                                "title": n_key+":"+n_item,

                                "shape": "circularImage",
                                "image": "../plugins/sysmon_search_visual/images/net.png",

                                "guid": item.current.guid,
                                "info": item.current.info
                            };
                            if( n_item > 100) {
                            }
                            nodes.push(tmp_node);

                            var tmp_edge = {
                                "from": item.current.index,
                                "to": n_index,

                                "arrows": "to",
                                "color": {
                                    "color": "lightgray"
                                },
                                "length": 200
                            };
                            edges.push(tmp_edge);
                        }

                        add_child_info(item);
                    }
                }


            // Display
            function sub_disp_network() {
                /*
                  var nodes = [
                    {
                      "id": 1,
                      "image": "../plugins/visual/images/program.png",
                      "info": "{\"path\": \"?\", \"image\": \"System\", \"guid\": \"{0079005F-0073-0074-6500-6D0000000000}\", \"pid\": \"4\", \"recode_number\": 33400}",
                      "label": "System",
                      "shape": "circularImage",
                      "title": "?",
                      "url": "visual#/detail.html?pid=4&image=%7B0079005F-0073-0074-6500-6D0000000000%7D"
                    },

                  var edges = [
                    {
                      "arrows": "to",
                      "color": {
                        "color": "lightgray"
                      },
                      "from": 1,
                      "length": 200,
                      "to": 2
                    },

                */
                var container = document.getElementById('mynetwork');
                var data = {
                    nodes: nodes,
                    edges: edges
                };
                var options = {
                    nodes: {
                        size: 25
                    },
                    edges: {
                        width: 2,
                        shadow: false,
                        smooth: {
                            type: 'continuous',
                            roundness: 0
                        }
                    }
                };
                // console.log( data );

                var network = new vis_network.Network(container, data, options);

                network.on("oncontext", function(properties) {
                    var nodeid = network.getNodeAt(properties.pointer.DOM);
                    if (nodeid) {
                        network.selectNodes([nodeid], true);
                        var node = this.body.data.nodes.get(nodeid);
                        if (node && node.info) {
                            const veiw_data_1 = ["CurrentDirectory", "CommandLine", "Hashes", "ParentProcessGuid", "ParentCommandLine", "ProcessGuid"];
                            var str = "";
                            var alert_str = "";
                            for (var key in node.info) {
                                if (veiw_data_1.indexOf(key) >= 0) {
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
                            alert(alert_str);
                        }
                    }
                });

                network.on("doubleClick", function(properties) {
                    if (!properties.nodes.length) return;

                    var node = this.body.data.nodes.get(properties.nodes[0]);
                    console.log(node);
                    if(node.guid != null && node.guid!="" && node.guid!="root"){
                        var url = 'sysmon_search_visual#/process_overview/' + $route.current.params.hostname + '/' + $route.current.params.date.substr(0, 10) + '/' + node.guid;
                        console.log(url);
                        window.open(url, "_blank");
                    }

                });
            }

function create_network(tops, keyword, hash, firstflg) {
  var nodes = [];
  var edges = [];
  // Create Data
  for( var index in tops ) {
    var top = tops[index];
    //sub_create_network(top, keyword, hash);
    //function sub_create_network(top, keyword, hash) {
    var tmp_node = {
                    "id": top.current.index,

                    "label": top.current.image,
                    "title": top.current.cmd,

                    "shape": "circularImage",
                    "image": "../plugins/sysmon_search_visual/images/program.png",

                    //          "info": top.current
                    //          "url": "visual#/detail.html?pid=4&image=%7B0079005F-0073-0074-6500-6D0000000000%7D"
                    "guid": top.current.guid,
                    "info": top.current.info
    };
    if (search(top.current.info, keyword, hash)) {
                    tmp_node["color"] = {
                        "background": "red",
                        "border": "red"
                    };
                    tmp_node["borderWidth"] = 3;
    }
    nodes.push(tmp_node);
    add_child_info(top);
    
  }
  // Display
  sub_disp_network();
}

module.exports = create_network;
