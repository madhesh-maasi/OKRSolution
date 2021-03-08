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
import "../../../ExternalRef/CSS/style.css";   

var users = [];
var scaleXarray = [];
var filterQuery: any = "";
var Initialrate;
var percentageRate = [];
var barColorArray = [];
// var metadata={}
export default class BarChartJs extends React.Component<any, any> {

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

    this.getAllDepts();
  }

  async getAllDepts() {

    await this.props.graphClient.api("/users").select('Department,mail').get((error, response) => {
      //for allUsers Array
      users = response.value;
      //for Deparment Array
      var DepartmentArray = response.value.filter((v, i, a) => a.findIndex(t => (t.department === v.department && t.department != null)) === i);
      this.getDepartmentUsers(DepartmentArray, users);
    });

  }

  async getDepartmentUsers(departmentUser, usersArray) {
    departmentUser.map((element, deptindex) => {
      var deptUsersarr = usersArray.filter((user, index) => {
        return user.department == element.department
      });
      deptUsersarr.map((fillQuery, index) => {
        filterQuery = filterQuery + "Author/EMail eq '" + fillQuery.mail + "' or "
      });
    });
    filterQuery = filterQuery.substring(0, filterQuery.length - 4)
    this.getDepartmentProgress(filterQuery, departmentUser);
  }

  async getDepartmentProgress(filterQuery, departmentUser) {
    await sp.web.lists.getByTitle("Objectives").items.select("Title,Progress").filter(filterQuery).get().then(function (userobjdata) {

      for (let i = 0; i < departmentUser.length; i++) {
        scaleXarray.push(departmentUser[i].department);
      }

      if (userobjdata.length > 0) {
        userobjdata.map((objData, i) => {
          if (i == 0) {
            Initialrate = 0;
          }
          Initialrate = objData.Progress + Initialrate;
        });
        Initialrate = Math.round(Initialrate / userobjdata.length);
        percentageRate.push(Initialrate);
      }
      else {
        percentageRate.push(0)
      }
    });

    console.log(percentageRate);
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
    // this.chartBindingFunc()
  }


  public render(): React.ReactElement {
    return (
      <div className="graphsize">
        <Bar
          data={this.state.metadata}
          ref={(reference) => this.chartReference = reference}
          options={{
            title: {
              display: true,
              text: 'Departments',
              fontSize: 20
            },
            legend: {
              display: false,
              position: 'right'
            },
            scales: {         
              xAxes: [
                {
                  ticks: {
                    callback: function(label) {
                      if (/\s/.test(label)) {
                        return label.split(" ");
                      }else{
                        return label;
                      }              
                    }
                  }
                }
              ]
            }
          }}
        />
      </div>
    );
  }
}
