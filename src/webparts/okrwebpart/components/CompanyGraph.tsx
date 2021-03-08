import * as React from 'react';
import { escape } from '@microsoft/sp-lodash-subset';
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import * as chartjs from "chart.js";
import { Bar } from 'react-chartjs-2';
import { MSGraphClient } from "@microsoft/sp-http";
import * as MicrosoftGraph from "@microsoft/microsoft-graph-types";
import { GraphError } from "@microsoft/microsoft-graph-client";
var users = [];
var scaleXarray = [];
var filterQuery: any = "";
var Initialrate;
var percentageRate = [];
var barColorArray = [];
// var metadata={}
export default class CompanyGraph extends React.Component<any, any> {

  chartReference = {};


  constructor(props) {
    super(props);

    sp.setup({
      sp: {
        baseUrl: this.props.siteUrl,
      },
    });

    this.state = {
      metadata: {}
    }

    users = [];
    scaleXarray = [];
    filterQuery = "";
    Initialrate = 0;
    percentageRate = [];
    barColorArray = [];

    this.loadChartData();
  }


  loadChartData = () => {

    sp.web.lists.getByTitle("PredefinedObjectives").items.get().then((predefinedData) => {
      sp.web.lists.getByTitle("Objectives").items.get().then((result) => {

        for (let index = 0; index < predefinedData.length; index++) {
          const obj = predefinedData[index];
          scaleXarray.push(obj.Title);
          var otherobjs = result.filter(c => c.PredefinedObjectivesId == obj.ID);
          percentageRate.push(otherobjs.length);
        }
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

        var data = {
          labels: scaleXarray,
          datasets: [
            {
              //  label: 'Departments',
              // backgroundColor: 'rgba(75,192,192,1)',
              // borderColor: 'rgba(0,0,0,1)',
              // borderWidth: 2,
              // data: percentageRate

              data: percentageRate,
              backgroundColor: barColorArray,
            }
          ]
        }
        this.setState({ metadata: data });
        let lineChart = this.chartReference["chartInstance"]
        lineChart.update();

      });

    })



  }


  public render(): React.ReactElement {
    return (
      <div>
        <Bar
          data={this.state.metadata}
          ref={(reference) => this.chartReference = reference}
          options={{
            title: {
              display: true,
              text: 'Base Objectives',
              fontSize: 20
            },
            legend: {
              display: false,
              position: 'right'
            }
          }}
        />
      </div>
    );
  }
}
