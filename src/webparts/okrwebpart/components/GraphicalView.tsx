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

var baseSeries = [];
var AllObjArray = [];
var personarr = [];
var percentageRate = [];
var scaleLabelsArray = [];
var barColorArray = [];
var drilldownConfig;

export default class GraphicalView extends React.Component<{}, any> {
  constructor(props) {
    super(props);
    baseSeries = [];
    AllObjArray = [];
    personarr = [];
    percentageRate = [];
    scaleLabelsArray = [];
    barColorArray = [];
    drilldownConfig = {};
    this.loadObjectives();
  }

  public chartBind = () => {
    var chartConfig = {
      graphset: [{
        type: 'pie',
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
        series: baseSeries
      }]
    };

    zingchart.default.render({
      id: 'myChart',
      data: chartConfig,
      cacheControl: '',
      height: '450px',
      width: '100%'
    });

    drilldownConfig = {
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
        id: 'backwards',
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
    zingchart.default.node_click = (p) => {
      personarr = AllObjArray[0].filter((data) => data.Author.Title == p['data-id']);
      this.getDrillData(p['data-id'])
    }

    zingchart.default.shape_click = function (p) {
      let shapeId = p.shapeid;

      switch (shapeId) {
        case 'forwards':
        case 'backwards':
        case 'default':
          zingchart.default.exec('drilldown1', 'destroy');
          zingchart.default.render({
            id: 'myChart',
            data: chartConfig,
            height: '450px',
            width: '100%'
          });
          break;
      }
    };
  }

  public getDrillData = (User) => {
    scaleLabelsArray = [];
    percentageRate = [];
    this.getKeyValues(0, User);
  }

  public getKeyValues = (index, User) => {
    var KeyId = personarr[index].Id;
    var Objectivetitle = personarr[index].Title;
    scaleLabelsArray.push(Objectivetitle)
    var successRate = 0;
    sp.web.lists.getByTitle("KeyResults").items.select('Title,ID,Progress,ObjectiveID').filter('ObjectiveID eq ' + KeyId + '').get().then((keydata) => {
      if (keydata.length > 0) {
        keydata.map((KRdetails) => {
          successRate = KRdetails.Progress + successRate;
        });
        successRate = Math.round(successRate / keydata.length)
        percentageRate.push(successRate)
      }
      else {
        percentageRate.push(0)
      }
      index = index + 1;
      if (index < personarr.length) {
        this.getKeyValues(index, User);
      } else {
        percentageRate.map((rate) => {
          if (rate >= 25)
            barColorArray.push('#fc0b03');
          else if (rate >= 50)
            barColorArray.push('#0f03fc');
          else if (rate >= 75)
            barColorArray.push('#fcfc03');
          else if (rate >= 100)
            barColorArray.push('#03fc14');
          else
            barColorArray.push('#282930');

        })
        if (User) {
          drilldownConfig['title']['text'] = User;
          drilldownConfig['scaleX']['values'] = scaleLabelsArray;
          drilldownConfig['series'][0]['values'] = percentageRate;
          drilldownConfig['series'][0]['styles'] = barColorArray;
          zingchart.default.exec('myChart', 'destroy');
          zingchart.default.render({
            id: 'drilldown1',
            data: drilldownConfig,
            height: '450px',
            width: '100%'
          });
        }
      }

    });
  }

  public loadObjectives = () => {
    sp.web.lists.getByTitle("Objectives").items.select('Author/Id,Author/Title,Author/Name,Author/EMail,Title,ID,Description,CompletionDate').expand("Author").get().then((data) => {
      AllObjArray.push(data);
      var dataStuff = data,
        grouped = Object.create(null);
      dataStuff.forEach(function (a) {
        grouped[a.Author.Title] = grouped[a.Author.Title] || [];
        grouped[a.Author.Title].push(a);
      });
      var result = Object.keys(grouped).map((key) => {

        var datalen = grouped[key].length;
        var itemID = grouped[key][0].ID
        baseSeries.push({
          "itemID": itemID,
          "text": key,
          "values": [datalen],
          "data-id": key,
        });


      });
      // that.fetchKeys();
      this.chartBind()
    });
  }

  public render(): React.ReactElement {
    var that = this;

    return (
      <div>
        <div id="myChart"></div>
        <div id="drilldown1"></div>
      </div>
    );
  }
}
