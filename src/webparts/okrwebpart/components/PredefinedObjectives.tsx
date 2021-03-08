import * as React from "react";

import {
  Card,
  CardContent,
} from "@material-ui/core";

import LinearProgress from "@material-ui/core/LinearProgress";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";


import AddBox from "@material-ui/icons/AddBox";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import Check from "@material-ui/icons/Check";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import Clear from "@material-ui/icons/Clear";
import DeleteOutline from "@material-ui/icons/DeleteOutline";
import Edit from "@material-ui/icons/Edit";
import FilterList from "@material-ui/icons/FilterList";
import FirstPage from "@material-ui/icons/FirstPage";
import LastPage from "@material-ui/icons/LastPage";
import Remove from "@material-ui/icons/Remove";
import SaveAlt from "@material-ui/icons/SaveAlt";
import Search from "@material-ui/icons/Search";
import ViewColumn from "@material-ui/icons/ViewColumn";
import { forwardRef } from "react";
import MaterialTable, { Icons } from "material-table";


export default class PredefinedObjectives extends React.Component<
  any,
  any
  > {
  constructor(props) {
    super(props);
    sp.setup({
      sp: {
        baseUrl: this.props.context.pageContext.web.absoluteUrl,
      },
    });

    this.state = {
      predefinedObjectives: [],
      allObjectives: [],
      finalData: [],
      totalpercentage: 0
    }

    this.loadPredefinedObjectives();
  }

  public loadPredefinedObjectives = () => {
    sp.web.lists
      .getByTitle("PredefinedObjectives")
      .items
      .get()
      .then((data) => {
        this.setState({ predefinedObjectives: data })
        this.loadObjectives();
      });
  }


  public loadObjectives = () => {
    sp.web.lists
      .getByTitle("Objectives")
      .items
      .filter("IsPredefined eq '1'")
      .get()
      .then((data) => {
        var finalData = this.state.finalData;
        var totalpercentage = 0;
        for (let index = 0; index < this.state.predefinedObjectives.length; index++) {
          const element = this.state.predefinedObjectives[index];
          var fdata = data.filter(c => c.Title == element.Title);
          var progress = 0;
          var total = fdata.length;
          if (fdata.length) {
            for (let i = 0; i < fdata.length; i++) {
              progress = progress + fdata[i].Progress;
            }
            progress = progress / total;
          }
          finalData.push({
            title: element.Title,
            objectives: fdata,
            total: total,
            percentage: Math.round(progress)
          });
          totalpercentage = totalpercentage + Math.round(progress);
        }
        if (totalpercentage) {
          totalpercentage = Math.round(totalpercentage / finalData.length);
        }
        this.setState({ allObjectives: data, finalData: finalData, totalpercentage: totalpercentage })
      });
  }

  public render(): React.ReactElement {

    const columns = [
      { title: "Objective Name", field: "title" },
      // { title: "Users", field: "total" },
      {
        title: "Overall %", field: "percentage", render: rowData => {
          return <div className="progressbar"> <LinearProgress variant="determinate" value={rowData.percentage} /></div>
        }
      },
    ];

    const tableIcons: Icons = {
      Add: forwardRef((props: any, ref: any) => (
        <AddBox {...props} ref={ref} />
      )),
      Check: forwardRef((props: any, ref: any) => (
        <Check {...props} ref={ref} />
      )),
      Clear: forwardRef((props: any, ref: any) => (
        <Clear {...props} ref={ref} />
      )),
      Delete: forwardRef((props: any, ref: any) => (
        <DeleteOutline {...props} ref={ref} />
      )),
      DetailPanel: forwardRef((props: any, ref: any) => (
        <ChevronRight {...props} ref={ref} />
      )),
      Edit: forwardRef((props: any, ref: any) => <Edit {...props} ref={ref} />),
      Export: forwardRef((props: any, ref: any) => (
        <SaveAlt {...props} ref={ref} />
      )),
      Filter: forwardRef((props: any, ref: any) => (
        <FilterList {...props} ref={ref} />
      )),
      FirstPage: forwardRef((props: any, ref: any) => (
        <FirstPage {...props} ref={ref} />
      )),
      LastPage: forwardRef((props: any, ref: any) => (
        <LastPage {...props} ref={ref} />
      )),
      NextPage: forwardRef((props: any, ref: any) => (
        <ChevronRight {...props} ref={ref} />
      )),
      PreviousPage: forwardRef((props: any, ref: any) => (
        <ChevronLeft {...props} ref={ref} />
      )),
      ResetSearch: forwardRef((props: any, ref: any) => (
        <Clear {...props} ref={ref} />
      )),
      Search: forwardRef((props: any, ref: any) => (
        <Search {...props} ref={ref} />
      )),
      SortArrow: forwardRef((props: any, ref: any) => (
        <ArrowDownward {...props} ref={ref} />
      )),
      ThirdStateCheck: forwardRef((props: any, ref: any) => (
        <Remove {...props} ref={ref} />
      )),
      ViewColumn: forwardRef((props: any, ref: any) => (
        <ViewColumn {...props} ref={ref} />
      )),
    };

    return (
      <div>
        <Card square={true} elevation={3}>
          <CardContent>
            <div className={"pageTitle"}>
              <div className="title-progress">
                <h3 className={"nomargin"}>Predefined Objectives</h3>
                <div className="progressbar">
                  <LinearProgress variant="determinate" value={this.state.totalpercentage} />
                </div>
              </div>
            </div>

            <MaterialTable
              title="Predefined Objectives"
              icons={tableIcons}
              columns={columns}
              data={this.state.finalData}
            />

          </CardContent>
        </Card>
      </div>
    );
  }
}
