import * as React from "react";

import { ICompanySummaryProps } from "./ICompanySummaryProps";
import {
  Card,
  CardContent,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Slider,
  Tabs,
  Tab,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Link,
} from "@material-ui/core";

import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  Menu,
  MenuItem,
  TableBody,
} from "@material-ui/core";
import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";

import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Grid from "@material-ui/core/Grid";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";

import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import IconButton from "@material-ui/core/IconButton";
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
import VisibilityIcon from "@material-ui/icons/Visibility";
import AssessmentIcon from "@material-ui/icons/Assessment";
import CompanyGraphicalView from "./CompanyGraphicalView";
import PredefinedObjectives from "./PredefinedObjectives";

import * as Excel from "exceljs/dist/exceljs.min.js";

import ViewDepartmentSummery from './ViewDepartmentSummery';


import * as FileSaver from "file-saver";

var companySummary = [];
var allObjectives = [];

interface IState {
  companySummary: any[];
  showDetails: boolean;
  currentUser: string;
  showGraphicalView: boolean;
  showUserSummery: boolean;
  currenctUserObj: any;
  overalltotal: number;
  directReports: any[];
}

export default class CompanySummary extends React.Component<
  ICompanySummaryProps,
  IState
  > {
  constructor(props: ICompanySummaryProps) {
    super(props);
    sp.setup({
      sp: {
        baseUrl: this.props.siteUrl,
      },
    });
    this.state = {
      companySummary: [],
      showDetails: false,
      currentUser: this.props.context.pageContext.user.displayName,
      showGraphicalView: false,
      showUserSummery: false,
      currenctUserObj: null,
      overalltotal: 0,
      directReports: []
    };
    companySummary = [];
    this.getCompanySummary();

    sp.profiles.myProperties.get().then((profile) => {
      this.setState({ directReports: profile.DirectReports });
    });

  }

  public showIndividualSummery = (value, rowData = null) => {
    this.setState({ showUserSummery: value, currenctUserObj: (rowData ? rowData.objectives : null) });
  }

  public showGraphicalView = (showGraphicalView) => {
    this.setState({ showGraphicalView: showGraphicalView });
  }

  // public generateCompanyReport = () => {
  //   var userObjectives = allObjectives;
  //   var filter = "";
  //   for (let index = 0; index < userObjectives.length; index++) {
  //     const objective = userObjectives[index];
  //     if (index == userObjectives.length - 1) {
  //       filter += "ObjectiveID eq " + objective.ID + "";
  //     } else {
  //       filter += "ObjectiveID eq " + objective.ID + " or ";
  //     }
  //   }
  //   var deptexcelData = [];
  //   sp.web.lists
  //     .getByTitle("KeyResults")
  //     .items.select("Title,ID,Progress,ObjectiveID")
  //     .filter(filter)
  //     .get()
  //     .then((keydata) => {
  //       keydata.map((KRdetails) => {
  //         var currentObjectives = allObjectives.filter(
  //           (c) => c.ID == KRdetails.ObjectiveID
  //         );
  //         var allkeyvalues = keydata.filter(
  //           (c) => c.ObjectiveID == KRdetails.ObjectiveID
  //         );
  //         var percentage = 0;
  //         for (let index = 0; index < allkeyvalues.length; index++) {
  //           const keyvalue = allkeyvalues[index];
  //           percentage += (keyvalue.Progress ? keyvalue.Progress : 0);
  //         }
  //         percentage = percentage / allkeyvalues.length;

  //         deptexcelData.push({
  //           deptUser: currentObjectives[0].Author.Title,
  //           objective: currentObjectives[0].Title,
  //           kr: KRdetails.Title,
  //           objective_percentage: Math.round(percentage),
  //           kr_percentage: KRdetails.Progress
  //         });
  //       });
  //       this.genCompanyReport(deptexcelData);

  //     });
  // }

  public genCompanyReport = (deptexcelData) => {

    deptexcelData = deptexcelData.sort(function (a, b) {
      return a.deptUser.localeCompare(b.deptUser);
    });

    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('My Sheet');

    var dobCol = worksheet.getRow(1); // You can define a row like 2 , 3

    worksheet.columns = [
      { header: "User Name", key: "User_Name", width: 25 },
      { header: "Objective", key: "objective", width: 25 },
      { header: "KR", key: "kr", width: 25 },
      { header: "Objective %", key: "objective_percentage", width: 25 },
      { header: "Key Results %", key: "kr_percentage", width: 25 },
    ];

    deptexcelData.forEach(function (item, index) {
      worksheet.addRow({
        User_Name: item.deptUser,
        objective: item.objective,
        kr: item.kr,
        objective_percentage: item.objective_percentage,
        kr_percentage: item.kr_percentage
      });
    });

    var objDeptCount = deptexcelData.map(item => item.objective);
    console.log(objDeptCount);
    var objDeptUserCount = deptexcelData.map(item => item.deptUser);
    console.log(objDeptUserCount);

    var usercount = {};
    objDeptUserCount.forEach(function (i) { usercount[i] = (usercount[i] || 0) + 1; });
    console.log(objDeptUserCount);
    const uservalues = Object.keys(usercount).map(key => usercount[key]);

    var count = {};
    objDeptCount.forEach(function (i) { count[i] = (count[i] || 0) + 1; });
    console.log(objDeptCount);
    const values = Object.keys(count).map(key => count[key]);

    //for users
    for (var userind = 0; userind < uservalues.length; userind++) {
      if (userind == 0) {
        var deptusermergeval: any = 0;
        var deptincval = uservalues[0] + 1;
        worksheet.mergeCells('A2:A' + deptincval + '');
        deptusermergeval = deptincval;
      }
      else {
        var predeptMergeVal = deptusermergeval;
        var deptusermergeval = deptusermergeval + 1;
        var deptincval = uservalues[userind] + predeptMergeVal;
        worksheet.mergeCells('A' + deptusermergeval + ':A' + deptincval + '');
        deptusermergeval = deptincval;
      }

    }

    //for obj and keys
    for (var ind = 0; ind < values.length; ind++) {
      if (ind == 0) {
        var mergeval: any = 0;
        var incval = values[0] + 1;
        worksheet.mergeCells('B2:B' + incval + '');
        worksheet.mergeCells('D2:D' + incval + '');
        mergeval = incval;
      }
      else {
        var preMergeVal = mergeval;
        var mergeval = mergeval + 1;
        var incval = values[ind] + preMergeVal;
        worksheet.mergeCells('B' + mergeval + ':B' + incval + '');
        worksheet.mergeCells('D' + mergeval + ':D' + incval + '');
        mergeval = incval;
      }

    }


    ['A1', 'B1', 'C1', 'D1', 'E1'].map(key => {
      worksheet.getCell(key).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFFF00' } };
    });
    worksheet.eachRow({ includeEmpty: true }, function (cell, index) {
      cell._cells.map((key, index) => {

        worksheet.getCell(key._address).border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };


      });

    });

    workbook.xlsx.writeBuffer().then(buffer => FileSaver.saveAs(new Blob([buffer]), `${Date.now()}_feedback.xlsx`))
      .catch(err => console.log('Error writing excel export', err));
  }

  public showDetails = () => {
    this.setState({ showDetails: true });
  }

  public generateReport = (department) => {
    var userObjectives = allObjectives.filter(
      (c) => c.Owner.EMail == department.email
    );
    var filter = "";
    for (let index = 0; index < userObjectives.length; index++) {
      const objective = userObjectives[index];
      if (index == userObjectives.length - 1) {
        filter += "ObjectiveID eq " + objective.ID + "";
      } else {
        filter += "ObjectiveID eq " + objective.ID + " or ";
      }
    }
    var excelData = [];
    sp.web.lists
      .getByTitle("KeyResults")
      .items.select("Title,ID,Progress,ObjectiveID")
      .filter(filter)
      .get()
      .then((keydata) => {
        keydata.map((KRdetails) => {
          var currentObjectives = allObjectives.filter(
            (c) => c.ID == KRdetails.ObjectiveID
          );
          var allkeyvalues = keydata.filter(
            (c) => c.ObjectiveID == KRdetails.ObjectiveID
          );
          var percentage = 0;
          for (let index = 0; index < allkeyvalues.length; index++) {
            const keyvalue = allkeyvalues[index];
            percentage += keyvalue.Progress * 100;
          }
          percentage = percentage / allkeyvalues.length;

          excelData.push({
            objective: currentObjectives[0].Title,
            kr: KRdetails.Title,
            objective_percentage: percentage,
            kr_percentage: KRdetails.Progress * 100 + "%",
          });
        });
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet("My Sheet");

        var dobCol = worksheet.getRow(1); // You can define a row like 2 , 3

        worksheet.columns = [
          { header: "Objective", key: "objective", width: 25 },
          { header: "KR", key: "kr", width: 25 },
          { header: "Objective %", key: "objective_percentage", width: 25 },
          { header: "Key Results %", key: "kr_percentage", width: 25 },
        ];

        excelData.forEach(function (item, index) {
          worksheet.addRow({
            objective: item.objective,
            kr: item.kr,
            objective_percentage: item.objective_percentage,
            kr_percentage: item.kr_percentage,
          });
        });

        var objCount = excelData.map((item) => item.objective);
        console.log(objCount);

        var count = {};
        objCount.forEach(function (i) {
          count[i] = (count[i] || 0) + 1;
        });
        console.log(count);
        const values = Object.keys(count).map((key) => count[key]);
        for (var ind = 0; ind < values.length; ind++) {
          if (ind == 0) {
            var mergeval: any = 0;
            var incval = values[0] + 1;
            worksheet.mergeCells("A2:A" + incval + "");
            worksheet.mergeCells("C2:C" + incval + "");
            mergeval = incval;
          } else {
            var preMergeVal = mergeval;
            var mergeval = mergeval + 1;
            var incval = values[ind] + preMergeVal;
            worksheet.mergeCells("A" + mergeval + ":A" + incval + "");
            worksheet.mergeCells("C" + mergeval + ":C" + incval + "");
            mergeval = incval;
          }
        }
        ["A1", "B1", "C1", "D1"].map((key) => {
          worksheet.getCell(key).fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FFFFFF00" },
          };
        });
        worksheet.eachRow({ includeEmpty: true }, function (cell, index) {
          cell._cells.map((key, index) => {
            worksheet.getCell(key._address).border = {
              top: { style: "thin" },
              left: { style: "thin" },
              bottom: { style: "thin" },
              right: { style: "thin" },
            };
          });
        });

        workbook.xlsx
          .writeBuffer()
          .then((buffer) => {
            FileSaver.saveAs(new Blob([buffer]), `${Date.now()}_feedback.xlsx`);
          })
          .catch((err) => console.log("Error writing excel export", err));
      });
  }

  public async getCompanySummary() {
    var that = this;
    await sp.web.lists
      .getByTitle("Objectives")
      .items.select(
        "Title",
        "Owner/Id",
        "Owner/EMail",
        "Author/EMail",
        "Author/Id",
        "Author/Title",
        "Author/Name",
        "Title",
        "IsPredefined",
        "ID",
        "Description",
        "Progress",
        "CompletionDate"
      )
      .expand("Author", "Owner")
      .filter("IsPredefined eq '1'")
      .get()
      .then(function (data) {
        allObjectives = data;
        var dataStuff = data,
          grouped = Object.create(null);
        //for create obj by username and count
        dataStuff.forEach(function (a) {
          grouped[a.Author.Title] = grouped[a.Author.Title] || [];
          grouped[a.Author.Title].push(a);
        });
        var overalltotal = 0;
        var result = Object.keys(grouped).map(function (key) {
          var datalen = grouped[key].length;
          var total = 0;
          var objectiveList = [];
          for (let p = 0; p < datalen; p++) {
            objectiveList.push(grouped[key][p]);
            var progress = grouped[key][p].Progress;
            if (!progress) {
              progress = 0;
            }
            total = total + progress;
          }
          var per = Math.round(total / datalen);
          companySummary.push({
            displayName: key,
            objectives: {
              displayName: key,
              objectiveList: objectiveList,
              ownerId: objectiveList.length ? objectiveList[0].Owner.Id : 0
            },
            objectivesLen: datalen,
            percentage: per,
          });
          overalltotal = overalltotal + per;
        });
        overalltotal = Math.round(overalltotal / companySummary.length);
        that.setState({ companySummary: companySummary, overalltotal: overalltotal });
      });
  }

  public actionMenuToggle() {
    alert();
  }

  public render(): React.ReactElement {
    var that = this;

    const columns = [
      { title: "Display Name", field: "displayName" },
      { title: "Objectives", field: "objectivesLen" },
      {
        title: "Objectives %", field: "percentage", render: rowData => {
          return <div><div className="progressbar"> <LinearProgress variant="determinate" value={rowData.percentage} /></div><h4 className="text-primary"> {rowData.percentage ? Math.round(parseFloat(rowData.percentage)) : 0}%</h4></div>;
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
        {
          this.state.showUserSummery ?

            <ViewDepartmentSummery isAdmin={this.props.isAdmin} currentsummery={"Company Summary"} objectives={this.state.currenctUserObj} showDepartmentSummery={this.showIndividualSummery} directReports={this.state.directReports} /> :


            <div>
              <Card square={true} elevation={3}>
                <CardContent>
                  <div className={"pageTitle"}>
                  {
                        !that.state.showGraphicalView &&

                    <div className="title-progress">
                     
                        
                          <h3 className={"nomargin"}>Company Summary</h3>
                          <div className="progressbar">
                            <LinearProgress variant="determinate" value={this.state.overalltotal} />
                          </div>
                          <h4 className="text-primary"> {this.state.overalltotal}%</h4>
                        

                     
                    </div>
                    }


                    <div className="button-head-group">
                      {/* <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        disableElevation
                        startIcon={<VisibilityIcon />}
                        onClick={this.generateCompanyReport}
                      >
                        Export to Excel
                </Button> */}
                      {that.state.showGraphicalView ? (
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          disableElevation
                          startIcon={<VisibilityIcon />}
                          onClick={(e) => this.showGraphicalView(false)}
                        >
                          Table View
                        </Button>
                      ) : (
                          // <Button
                          //   variant="contained"
                          //   color="secondary"
                          //   size="small"
                          //   disableElevation
                          //   startIcon={<VisibilityIcon />}
                          //   onClick={(e) => this.showGraphicalView(true)}
                          // >
                          //   Graphical View
                          // </Button>
                          <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            disableElevation
                            startIcon={<VisibilityIcon />}
                            onClick={(e) => this.showGraphicalView(true)}
                          >
                            Predefined Objectives
                          </Button>
                        )}
                    </div>
                  </div>
                  {that.state.showGraphicalView ? (
                    // <CompanyGraphicalView context={this.props.context} />
                    <PredefinedObjectives context={this.props.context} />
                  ) : (
                      <MaterialTable
                        title="Company Colleagues"
                        icons={tableIcons}
                        columns={columns}
                        data={this.state.companySummary}
                        actions={[
                          {
                            icon: forwardRef((props: any, ref: any) => (
                              <VisibilityIcon />
                            )),
                            tooltip: "View",
                            onClick: (event, rowData: any) => this.showIndividualSummery(true, rowData),
                          },
                          // {
                          //   icon: forwardRef((props: any, ref: any) => (
                          //     <AssessmentIcon />
                          //   )),
                          //   tooltip: "Generate Report",
                          //   onClick: (event, rowData: any) =>
                          //     this.generateReport(rowData),
                          // },
                        ]}
                        options={{
                          actionsColumnIndex: 3,
                        }}
                      />
                    )}
                </CardContent>
              </Card>
              <Dialog open={this.state.showDetails} className="modalPopupObjective">
                <DialogTitle>
                  <Stepper>
                    <Step>
                      <StepLabel>New Objective</StepLabel>
                    </Step>
                    <Step>
                      <StepLabel>Key Value</StepLabel>
                    </Step>
                  </Stepper>
                </DialogTitle>
                <DialogContent>
                  <div>
                    <h3>create Object</h3>
                    <TextField
                      autoFocus
                      id="name"
                      label="Title"
                      type="text"
                      fullWidth
                    />
                    <TextField
                      autoFocus
                      id="name"
                      label="Description"
                      type="text"
                      multiline
                      rowsMax={4}
                      fullWidth
                    />
                  </div>

                  <div>
                    <h3>Add Key value</h3>
                    <p>Limieted more than 5</p>
                    <TextField
                      autoFocus
                      id="name"
                      label="Title"
                      type="text"
                      fullWidth
                    />

                    <FormControl component="fieldset">
                      <Grid
                        container
                        direction="row"
                        justify="flex-start"
                        alignItems="center"
                      >
                        <Grid lg={12}>
                          <FormLabel component="legend">
                            Key value is Not Percentage
                    </FormLabel>
                        </Grid>
                        <Grid lg={3}>
                          <RadioGroup name="number">
                            <FormControlLabel
                              value="KeyNumber"
                              control={<Radio />}
                              label="Number"
                            />
                          </RadioGroup>
                        </Grid>
                        <Grid lg={"auto"}>
                          <TextField
                            autoFocus
                            id="name"
                            label="Select Number"
                            type="number"
                            fullWidth
                          />
                        </Grid>
                        <Grid lg={12}>
                          <label>Select Date</label>
                          <TextField
                            autoFocus
                            id="name"
                            label=""
                            type="date"
                            fullWidth
                            InputLabelProps={{
                              shrink: true
                            }}
                          />
                        </Grid>
                      </Grid>
                    </FormControl>
                  </div>
                </DialogContent>

                <DialogActions>
                  <Button
                    variant="contained"
                    color="default"
                    disableElevation
                    size="small"
                  >
                    Cancel
            </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    disableElevation
                    size="small"
                  >
                    Submit
            </Button>
                </DialogActions>
              </Dialog>
            </div >
        }
      </div>
    );
  }
}
