import { sp } from "@pnp/sp";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/webs";
import MaterialTable, { Icons } from "material-table";
import * as React from "react";
import { forwardRef } from "react";
import { IDepartmentSummaryProps } from "./IDepartmentSummaryProps";

import * as Excel from "exceljs/dist/exceljs.min.js";

import * as FileSaver from "file-saver";

var zingchart: any = require('zingchart/zingchart-es6.min.js');
require('zingchart/zingchart.min.js')
import { pareto } from 'zingchart/modules-es6/zingchart-pareto.min.js';

interface IState {
  departmentSummary: any[];
  showDetails: boolean;
}

var scaleXarray = [];
var percentageRate = [];
var Initialrate;
var users = [];
var filterQuery: any = "";
var barColorArray = [];
var clickedDeptArray = [];
var filteredusersObj = [];
var pieDeptusers = [];
var PiechartConfig;
var chartConfig;
var objBarConfig;
var scaleLabelsArray = [];
var IndivualKeys = [];

export interface ICompanyGraphicalView {
  context: any;
}

export default class CompanyGraphicalView extends React.Component<ICompanyGraphicalView, any> {
  constructor(props) {
    super(props);

    scaleXarray = [];
    percentageRate = [];
    Initialrate;
    users = [];
    filterQuery = "";
    barColorArray = [];
    clickedDeptArray = [];
    filteredusersObj = [];
    pieDeptusers = [];
    PiechartConfig;
    chartConfig;
    objBarConfig;
    scaleLabelsArray = [];
    IndivualKeys = [];

    this.getAllDepts();
  }

  async getAllDepts() {
    await this.props.context.msGraphClientFactory.getClient().then(client => {
      client.api("/users").select('Department,mail').get((error, response) => {
        //for allUsers Array
        users = response.value;
        //for Deparment Array
        var DepartmentArray = response.value.filter((v, i, a) => a.findIndex(t => (t.department === v.department && t.department != null)) === i);
        this.getDepartmentUsers(DepartmentArray, users);
      });
    });
  }

  async getDepartmentUsers(departmentUser, usersArray) {
    await departmentUser.map((element, deptindex) => {
      scaleXarray.push(element.department);
      var Initialrate = 0;


      var deptUsersarr = usersArray.filter((user, index) => {
        return user.department == element.department
      });
      deptUsersarr.map((fillQuery, index) => {
        if (index == 0) {

          filterQuery = "Author/EMail eq '" + fillQuery.mail + "' or "

        }
        else {
          filterQuery = filterQuery + "Author/EMail eq '" + fillQuery.mail + "' or "

        }
      });
      var orindex = filterQuery.lastIndexOf('or');
      filterQuery = filterQuery.substring(0, orindex - 1)
      this.getDepartmentProgress(filterQuery, departmentUser, deptindex);
    });

  }

  chartBindingFunc() {
    percentageRate.map((rate) => {
      if (rate <= 25)
        barColorArray.push('#fc0b03');
      else if (rate <= 50)
        barColorArray.push('#0f03fc');
      else if (rate <= 75)
        barColorArray.push('#fcfc03');
      else if (rate <= 100)
        barColorArray.push('#03fc14');
      else
        barColorArray.push('#282930');

    });
    chartConfig = {
      type: 'bar',
      title: {
        text: 'Departments'
      },
      plot: {
        tooltip: {
          text: 'Percentage: %v',
          borderWidth: '0px',
          fontSize: '18px',
          shadow: true,
          shadowAlpha: 0.5,
          shadowBlur: 2,
          shadowColor: '#c4c4c4',
          shadowDistance: 3
        },
        animation: {
          delay: 10,
          effect: 'ANIMATION_EXPAND_BOTTOM',
          method: 'ANIMATION_BACK_EASE_OUT',
          sequence: 'ANIMATION_BY_PLOT_AND_NODE',
          speed: '1200'
        }
      },
      plotarea: {
        margin: 'dynamic'
      },
      scaleX: {
        values: scaleXarray,
        item: {
          color: '#555',
          fontSize: '12px',
          maxChars: 9
        },
        label: {
          text: 'Objectives',
          color: '#555',
          fontSize: '16px',
          fontWeight: 'none'
        },
        lineColor: '#555',
        tick: {
          lineColor: '#555'
        }
      },
      scaleY: {
        guide: {
          visible: false
        },
        item: {
          color: '#555',
          fontSize: '12px'
        },
        label: {
          text: 'Percentage',
          color: '#555',
          fontSize: '16px',
          fontWeight: 'none'
        },
        lineColor: '#555',
        tick: {
          lineColor: '#555'
        }
      },
      series: [{
        values: percentageRate,
        styles: barColorArray
      }]
    };




    zingchart.default.render({
      id: 'myChart',
      data: chartConfig,
      height: '450px',
      width: '50%'
    });
    zingchart.default.shape_click = (p) => {
      var that = this;
      let shapeId = p.shapeid;


      switch (shapeId) {
        case 'barbackwards':

          zingchart.default.exec('myBarChart', 'destroy');
          zingchart.default.render({
            id: 'myPieChart',
            data: PiechartConfig,
            height: '450px',
            width: '50%'
          });
          break;

        case 'piebackwards':
          zingchart.default.exec('myPieChart', 'destroy');
          zingchart.default.render({
            id: 'myChart',
            data: chartConfig,
            height: '450px',
            width: '50%'
          });

          break;
        case 'default':

      }
    };

    zingchart.default.node_click = (e) => {
      // var that=this;
      if (e.scaletext && e.id == "myChart") {
        //extract clicked dept from all user array
        clickedDeptArray = users.filter((userDept) => {
          return userDept.department == e.scaletext
        });

        clickedDeptArray.map((fillQuery, index) => {
          if (index == 0) {

            filterQuery = "Author/EMail eq '" + fillQuery.mail + "' or "

          }
          else {
            filterQuery = filterQuery + "Author/EMail eq '" + fillQuery.mail + "' or "

          }
        });
        var orindex = filterQuery.lastIndexOf('or');
        filterQuery = filterQuery.substring(0, orindex - 1)
        this.getDeptObjectives(filterQuery);
      }
      else if (e.id == "myPieChart") {
        IndivualKeys = filteredusersObj[0].filter((data) => data.Author.Title == e['data-id']);
        this.getDrillData(e['data-id'])
      }
    };
  }

  async getDrillData(User) {
    scaleLabelsArray = [];
    percentageRate = [];
    for (var i = 0; i < IndivualKeys.length; i++) {
      var KeyId = IndivualKeys[i].Id;
      var Objectivetitle = IndivualKeys[i].Title;
      scaleLabelsArray.push(Objectivetitle)
      var successRate = 0;
      await sp.web.lists.getByTitle("KeyResults").items.select('Title,ID,Progress,CurrentProgress,ObjectiveID').filter('ObjectiveID eq ' + KeyId + '').get().then((keydata) => {
        if (keydata.length > 0) {
          keydata.map((KRdetails) => {
            successRate = (KRdetails.CurrentProgress ? KRdetails.CurrentProgress : 0) + successRate;
          });
          successRate = Math.round(successRate / keydata.length)
          percentageRate.push(successRate)
        }
        else {
          percentageRate.push(0)
        }
      });
    }
    //this.fetchKeys();
    // You could use this data to help construct drilldown graphs check it out...
    if (IndivualKeys.length <= i + 1) {
      percentageRate.map((rate) => {
        if (rate <= 25)
          barColorArray.push('#fc0b03');
        else if (rate <= 50)
          barColorArray.push('#0f03fc');
        else if (rate <= 75)
          barColorArray.push('#fcfc03');
        else if (rate <= 100)
          barColorArray.push('#03fc14');
        else
          barColorArray.push('#282930');

      });
      objBarConfig = {
        type: 'bar',
        title: {
          text: 'Security Tools'
        },
        plot: {
          tooltip: {
            text: 'Percentage: %v',
            borderWidth: '0px',
            fontSize: '18px',
            shadow: true,
            shadowAlpha: 0.5,
            shadowBlur: 2,
            shadowColor: '#c4c4c4',
            shadowDistance: 3
          },
          animation: {
            delay: 10,
            effect: 'ANIMATION_EXPAND_BOTTOM',
            method: 'ANIMATION_BACK_EASE_OUT',
            sequence: 'ANIMATION_BY_PLOT_AND_NODE',
            speed: '1200'
          }
        },
        plotarea: {
          margin: 'dynamic'
        },
        scaleX: {
          values: ['Firewall', 'Cache-control', 'Link-access', 'HTTP-Comp'],
          item: {
            color: '#555',
            fontSize: '12px',
            maxChars: 9
          },
          label: {
            text: 'Objectives',
            color: '#555',
            fontSize: '16px',
            fontWeight: 'none'
          },
          lineColor: '#555',
          tick: {
            lineColor: '#555'
          }
        },
        scaleY: {
          guide: {
            visible: false
          },
          item: {
            color: '#555',
            fontSize: '12px'
          },
          label: {
            text: 'Percentage',
            color: '#555',
            fontSize: '16px',
            fontWeight: 'none'
          },
          lineColor: '#555',
          tick: {
            lineColor: '#555'
          }
        },
        shapes: [{
          type: 'triangle',
          id: 'barbackwards',
          padding: '5px',
          angle: -90,
          backgroundColor: '#C4C4C4',
          cursor: 'hand',
          size: '10px',
          x: '20px',
          y: '20px'
        }],
        series: [{
          values: [35, 15, 25, 10],
          styles: ['#1565C0', '#42A5F5', '#1E88E5', '#90CAF9']
        }]
      };

      if (User) {
        objBarConfig['title']['text'] = User;
        objBarConfig['scaleX']['values'] = scaleLabelsArray;
        objBarConfig['series'][0]['values'] = percentageRate;
        objBarConfig['series'][0]['styles'] = barColorArray;
        zingchart.default.exec('myPieChart', 'destroy');
        zingchart.default.render({
          id: 'myBarChart',
          data: objBarConfig,
          height: '450px',
          width: '100%'
        });
      }
    }
  }

  async getDeptObjectives(filterQuery) {
    await sp.web.lists.getByTitle("Objectives").items.select('Author/Id,Author/Title,Author/Name,Author/EMail,Title,ID,Description,CompletionDate').filter(filterQuery).expand("Author").get().then(function (data) {
      filteredusersObj = [];
      pieDeptusers = [];
      filteredusersObj.push(data);
      var dataStuff = data,
        grouped = Object.create(null);
      //for create obj by username and count
      dataStuff.forEach(function (a) {
        grouped[a.Author.Title] = grouped[a.Author.Title] || [];
        grouped[a.Author.Title].push(a);
      });
      var result = Object.keys(grouped).map(function (key) {

        var datalen = grouped[key].length;
        var itemID = grouped[key][0].ID
        pieDeptusers.push({
          "itemID": itemID,
          "text": key,
          "values": [datalen],
          "data-id": key,
        });
      });

      PiechartConfig = {
        graphset: [{
          type: 'pie',
          shapes: [{
            type: 'triangle',
            id: 'piebackwards',
            padding: '5px',
            angle: -90,
            backgroundColor: '#C4C4C4',
            cursor: 'hand',
            size: '10px',
            x: '20px',
            y: '20px'
          }],
          title: {
            text: 'Objectives',
            align: 'right',
            fontColor: '#616161'
          },
          legend: {
            text: '%t<br>',
            borderWidth: '0px',
            header: {
              text: 'EmployeeName',
              align: 'right',
              bold: true,
              fontColor: '#616161',
              fontSize: '13px'
            }
          },
          plot: {
            valueBox: {
              decimals: 2
            },
            animation: {
              effect: 'ANIMATION_EXPAND_VERTICAL',
              method: 'ANIMATION_BACK_EASE_OUT',
              onLegendToggle: false,
              sequence: 'ANIMATION_BY_PLOT'
            },
            decimals: 0,
            detach: false,
            refAngle: 270,
            thousandsSeparator: ','
          },
          scale: {
            sizeFactor: 0.75
          },
          tooltip: {
            text: '%t<br>%v',
            align: 'right',
            bold: true,
            borderRadius: '3px',
            fontColor: '#fff',
            offsetR: 10,
            placement: 'node:out',
            width: '110px'
          },
          series: pieDeptusers
        }]

      };

      zingchart.default.exec('myChart', 'destroy');
      zingchart.default.render({
        id: 'myPieChart',
        data: PiechartConfig,
        height: '450px',
        width: '100%'
      });
    });
  }

  async getDepartmentProgress(filterQuery, departmentUser, deptindex) {
    await sp.web.lists.getByTitle("Objectives").items.select("Title,Progress").filter(filterQuery).get().then(function (userobjdata) {
      if (userobjdata.length > 0) {
        userobjdata.map((objData, i) => {
          if (i == 0) {
            Initialrate = 0;
          }
          Initialrate = (objData.Progress ? objData.Progress : 0) + Initialrate;
        });
        Initialrate = Math.round(Initialrate / userobjdata.length);
        percentageRate.push(Initialrate);
      }
      else {
        percentageRate.push(0)
      }
    });

    if (departmentUser.length <= deptindex + 1) {
      console.log(percentageRate);
      this.chartBindingFunc();

    }
  }

  public render(): React.ReactElement {
    var that = this;

    return (
      <div>
        <div id="myChart">
        </div>

        <div id="myPieChart">
        </div>

        <div id="myBarChart"> 
        </div>
      </div>
    );
  }
}
