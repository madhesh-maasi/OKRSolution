import MenuItem from '@material-ui/core/MenuItem';
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

import { HttpClient, HttpClientResponse } from '@microsoft/sp-http';

import InputLabel from '@material-ui/core/InputLabel';
import FormHelperText from '@material-ui/core/FormHelperText';
import Select from '@material-ui/core/Select';
import {
  Button,
  Card,
  CardContent,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Step,
  StepLabel,
  Stepper,
  LinearProgress,
} from "@material-ui/core";
import FormControl from "@material-ui/core/FormControl";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import Grid from "@material-ui/core/Grid";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import TextField from "@material-ui/core/TextField";
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
import VisibilityIcon from "@material-ui/icons/Visibility";
import AssessmentIcon from "@material-ui/icons/Assessment";

import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/folders";
import "@pnp/sp/fields";
import "@pnp/sp/files";
import "@pnp/sp/security/web";
import "@pnp/sp/site-users/web";
import "@pnp/sp/profiles";


import MaterialTable, { Icons } from "material-table";
import * as React from "react";
import { forwardRef } from "react";
import { IDepartmentSummaryProps } from "./IDepartmentSummaryProps";

import ViewDepartmentSummery from './ViewDepartmentSummery';

import * as Excel from "exceljs/dist/exceljs.min.js";

import * as FileSaver from "file-saver";
import GraphicalView from "./GraphicalView";
import BarChartJS from "./BarChartJs";
import TableChartOutlinedIcon from '@material-ui/icons/TableChartOutlined';
import GridOnSharpIcon from '@material-ui/icons/GridOnSharp';

var departmentSummary = [];
var users = [];
var allDeptusers = [];
var allObjectives = [];

interface IState {
  departmentSummary: any[];
  showDepartment: boolean;
  showDetails: boolean;
  showGraphicalView: boolean;
  showdptsummery: boolean;
  currenctUserObj: any[];
  overallpercent: number;
  directReports: any[];
  allDepartments: any[];
  departmentName: string;
  managers: any[];
  selManager: any;
  userWithDirectReports: any[];
  currentUserMail: string;
  allUsers: any[];
}

var userWithDirectReports = [];
var topLevelUsers = [];


export default class DepartmentSummary extends React.Component<
  IDepartmentSummaryProps,
  IState
  > {
  constructor(props: IDepartmentSummaryProps) {
    super(props);
    sp.setup({
      sp: {
        baseUrl: this.props.siteUrl,
      },
    });
    this.loadFilter();
    this.state = {
      departmentSummary: [],
      currenctUserObj: [],
      showDepartment: false,
      showDetails: false,
      showGraphicalView: false,
      showdptsummery: false,
      overallpercent: 0,
      directReports: [],
      allDepartments: [],
      departmentName: '',
      managers: [],
      selManager: {},
      userWithDirectReports: [],
      currentUserMail: '',
      allUsers: []
    };
    departmentSummary = [];
    this.getDepartment();
    sp.profiles.myProperties.get().then((profile) => {
      this.setState({ directReports: profile.DirectReports });
    });
    sp.web.siteUsers().then((users) => {
      for (let index = 0; index < users.length; index++) {
        const user = users[index];
        sp.profiles.getPropertiesFor(user.LoginName).then((data) => {
          if (data.DirectReports && data.DirectReports.length) {
            var manager = this.state.managers;
            manager.push(data);
            this.setState({ managers: manager });
          }
        });
      }
    });
  }

  public showDeptSummery = (value, rowData = null) => {
    this.setState({ showdptsummery: value, currenctUserObj: rowData });

    // this.setState({ showDetails: true });
  }

  public loadFilter = () => {
    sp.web.lists
      .getByTitle("ConfigList")
      .items
      .filter("Title eq 'Department' and Show eq 1")
      .get()
      .then((result) => {
        if (result && result.length > 0) {
          this.setState({ showDepartment: true });
        }
      });
  }


  public showGraphicalView = (showGraphicalView) => {
    this.setState({ showGraphicalView: showGraphicalView });
  }

  public generateDepartmentReport = () => {
    var userObjectives = allObjectives;
    var filter = "";
    for (let index = 0; index < userObjectives.length; index++) {
      const objective = userObjectives[index];
      if (index == userObjectives.length - 1) {
        filter += "ObjectiveID eq " + objective.ID + "";
      } else {
        filter += "ObjectiveID eq " + objective.ID + " or ";
      }
    }
    var deptexcelData = [];
    sp.web.lists
      .getByTitle("KeyResults")
      .items.select("Title,ID,Progress,ObjectiveID,CurrentProgress")
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
            percentage += (keyvalue.CurrentProgress ? keyvalue.CurrentProgress : 0);
          }
          percentage = percentage / allkeyvalues.length;

          if (currentObjectives.length) {
            deptexcelData.push({
              predefinedObjective: currentObjectives[0].PredefinedObjectives.Title,
              deptUser: currentObjectives[0].Owner.Title,
              objective: currentObjectives[0].Title,
              kr: KRdetails.Title,
              objective_percentage: Math.round(percentage)+"%",
              kr_percentage:(KRdetails.CurrentProgress)?KRdetails.CurrentProgress + "%":"0%",
            });
          }
        });
        this.genDeptReport(deptexcelData);

      });
  }


  public genDeptReport = (deptexcelData) => {
    deptexcelData = deptexcelData.sort(function (a, b) {
      return a.objective.localeCompare(b.objective);
    });
    deptexcelData = deptexcelData.sort(function (a, b) {
      return a.deptUser.localeCompare(b.deptUser);
    });



    const workbook = new Excel.Workbook();
    const worksheet = workbook.addWorksheet('My Sheet');

    var dobCol = worksheet.getRow(1); // You can define a row like 2 , 3

    worksheet.columns = [
      { header: "User Name", key: "User_Name", width: 25 },
      { header: "Objective", key: "objective", width: 25 },
      { header: "Key Results %", key: "kr", width: 25 },
      { header: "Objective %", key: "objective_percentage", width: 25 },
      { header: "Key Results %", key: "kr_percentage", width: 25 },
      { header: "Base Objective", key: "predefinedObjective", width: 25 },

    ];

    deptexcelData.forEach(function (item, index) {
      worksheet.addRow({
        User_Name: item.deptUser,
        objective: item.objective,
        kr: item.kr,
        objective_percentage: item.objective_percentage,
        kr_percentage: item.kr_percentage,
        predefinedObjective: item.predefinedObjective

      });
    });

    var objDeptCount = deptexcelData.map(item => item.objective);
    console.log(objDeptCount);
    var objDeptUserCount = deptexcelData.map(item => item.deptUser);
    console.log(objDeptUserCount);
    var objBaseCount = deptexcelData.map(item => item.predefinedObjective);
    console.log(objBaseCount);

    var usercount = {};
    objDeptUserCount.forEach(function (i) { usercount[i] = (usercount[i] || 0) + 1; });
    console.log(objDeptUserCount);
    const uservalues = Object.keys(usercount).map(key => usercount[key]);

    var count = {};
    objDeptCount.forEach(function (i) { count[i] = (count[i] || 0) + 1; });
    console.log(objDeptCount);
    const values = Object.keys(count).map(key => count[key]);

    var basecount = {};
    objBaseCount.forEach(function (i) { basecount[i] = (basecount[i] || 0) + 1; });
    console.log(objBaseCount);
    // Object.entries(objBaseCount)
    const baseValues = Object.entries(objBaseCount);

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
        worksheet.mergeCells('F2:F' + incval + '');

        mergeval = incval;
      }
      else {
        var preMergeVal = mergeval;
        var mergeval = mergeval + 1;
        var incval = values[ind] + preMergeVal;
        worksheet.mergeCells('B' + mergeval + ':B' + incval + '');
        worksheet.mergeCells('D' + mergeval + ':D' + incval + '');
        worksheet.mergeCells('F' + mergeval + ':F' + incval + '');

        mergeval = incval;
      }

    }

    ["A1", "B1", "C1", "D1",'E1','F1'].map((key) => {
      worksheet.getCell(key).fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFFFF00" },
      };
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

    var departmentName = this.state.departmentName;
    if (!departmentName) {
      departmentName = 'Overall Department';
    } else {
      departmentName = departmentName + ' Department';
    }
    workbook.xlsx.writeBuffer().then(buffer => FileSaver.saveAs(new Blob([buffer]), departmentName + '.xlsx'))
      .catch(err => console.log('Error writing excel export', err));
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
      .items.select("Title,ID,CurrentProgress,Progress,ObjectiveID")
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
            percentage += keyvalue.CurrentProgress;
          }
          percentage = percentage / allkeyvalues.length;

          excelData.push({
            objective: currentObjectives[0].Title,
            predefinedObjective: currentObjectives[0].PredefinedObjectives.Title,
            kr: KRdetails.Title,
            objective_percentage: percentage + "%",
            kr_percentage: (KRdetails.CurrentProgress)?KRdetails.CurrentProgress + "%":"0%",
          });
        });
        const workbook = new Excel.Workbook();
        const worksheet = workbook.addWorksheet("My Sheet");

        var dobCol = worksheet.getRow(1); // You can define a row like 2 , 3

        worksheet.columns = [
          { header: "Objective", key: "objective", width: 25 },
          { header: "Key Results", key: "kr", width: 25 },
          { header: "Objective %", key: "objective_percentage", width: 25 },
          { header: "Key Results %", key: "kr_percentage", width: 25 },
          { header: "Base Objective", key: "predefinedObjective", width: 25 },

        ];

        excelData = excelData.sort(function (a, b) {
          return a.objective.localeCompare(b.objective);
        });
        // excelData = excelData.sort(function (a, b) {
        //   return a.deptUser.localeCompare(b.deptUser);
        // });

        excelData.forEach(function (item, index) {
          worksheet.addRow({
            objective: item.objective,
            kr: item.kr,
            objective_percentage: item.objective_percentage,
            kr_percentage: item.kr_percentage,
            predefinedObjective: item.predefinedObjective
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
            worksheet.mergeCells("E2:E" + incval + "");

            mergeval = incval;
          } else {
            var preMergeVal = mergeval;
            var mergeval = mergeval + 1;
            var incval = values[ind] + preMergeVal;
            worksheet.mergeCells("A" + mergeval + ":A" + incval + "");
            worksheet.mergeCells("C" + mergeval + ":C" + incval + "");
            worksheet.mergeCells("E" + mergeval + ":E" + incval + "");

            mergeval = incval;
          }
        }
        ["A1", "B1", "C1", "D1",'E1'].map((key) => {
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
            FileSaver.saveAs(new Blob([buffer]), department.displayName + '.xlsx');
          })
          .catch((err) => console.log("Error writing excel export", err));
      });
  }

  public loadAllDepartments = (currentUserDepartment) => {
    this.props.graphClient.api("/users").select('Department,mail,displayName').get((error, response) => {
      var users = response.value;
      var DepartmentArray = response.value.filter((v, i, a) => a.findIndex(t => (t.department === v.department && t.department != null)) === i);
      this.getDirectReports(users, 0, currentUserDepartment);
      this.setState({ allDepartments: DepartmentArray, allUsers: users });
    });
  }

  public getDirectReports = (arrUsers, index, currentUserDepartment) => {
    var that = this;
    var mail = 'i:0#.f|membership|' + arrUsers[index].mail;
    this.props.context.spHttpClient.get(this.props.siteUrl + '/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v=' + "'" + encodeURIComponent(mail) + "'", SPHttpClient.configurations.v1).then((response) => {
      response.json().then((response) => {
        userWithDirectReports.push({
          displayName: arrUsers[index].displayName,
          mail: arrUsers[index].mail,
          Department: arrUsers[index].department,
          directReports: response.DirectReports ? response.DirectReports : []
        });
        index = index + 1;
        if (index < arrUsers.length) {
          that.getDirectReports(arrUsers, index, currentUserDepartment);
        } else {
          this.setState({ userWithDirectReports: userWithDirectReports });
          this.getDepartmentUsers(currentUserDepartment);
        }
      }).catch((error) => {
        console.warn(error);
      })
    });

    // this.props.context.httpClient.get(this.props.siteUrl + '/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v=' + "'" + encodeURIComponent(arrUsers[index].mail) + "'",
    //   HttpClient.configurations.v1,
    // )
    //   .then((response) => {
    //     userWithDirectReports.push({
    //       mail: arrUsers[index].mail,
    //       Department: arrUsers[index].Department,
    //       directReports: response
    //     });
    //     index = index + 1;
    //     if (index < arrUsers.length) {
    //       that.getDirectReports(arrUsers, index);
    //     } else {
    //       this.setState({ userWithDirectReports: userWithDirectReports });
    //     }
    //   })
    //   .then(jsonResponse => {
    //     console.log(jsonResponse);
    //     return jsonResponse;
    //   })
  }

  public getDepartment() {
    this.props.context.msGraphClientFactory.getClient().then((client) => {
      client
        .api("/me")
        .select("department,mail")
        .get((error, response) => {
          var department = response["department"];
          this.setState({ departmentName: department, currentUserMail: response["mail"] });
          this.loadAllDepartments(department);

        });
    });
  }

  public setDepartment = (event: React.ChangeEvent<any>) => {
    this.getDepartmentUsers(event.target.value);
    this.setState({ departmentName: event.target.value });
    this.setState({ selManager: null });
  }

  public setManager = (event: React.ChangeEvent<any>) => {
    var manager = event.target.value;
    var directReports = manager.DirectReports;
    this.setState({ selManager: manager });
    this.setState({ departmentName: null });
    // var filter = '';
    // for (let i = 0; i < directReports.length; i++) {
    //   var sdata = directReports[i].split('|');
    //   var mail = sdata[sdata.length - 1];
    //   if (i == (directReports.length - 1)) {
    //     filter += "Owner/EMail eq '" + mail + "'";
    //   } else {
    //     filter += "Owner/EMail eq '" + mail + "' or ";
    //   }
    // }
    // this.getDepartmentSummary(filter);

    setTimeout(() => {
      this.getHierarchyUsers([{ mail: manager.Email }]);
    }, 2000);

  }


  public getDepartmentUsers(department) {
    if (department) {
      this.props.context.msGraphClientFactory.getClient().then((client) => {
        client
          .api("/users")
          .select("mail,displayName")
          .filter("Department eq '" + department + "'")
          .get((error, response) => {
            if (response) {
              users = response["value"];
              this.getHierarchyUsers(users);
            }
          });
      });
    }
  }

  public getHierarchyUsers = (departmentusers) => {
    var filteredUsers = this.processHierarchy(departmentusers, []);
    this.topLevelHierarchy(departmentusers[0].mail);
    users = filteredUsers;
    Array.prototype.push.apply(users, topLevelUsers);
    var filter = "";
    for (let i = 0; i < filteredUsers.length; i++) {
      if (i == (filteredUsers.length - 1)) {
        filter += "Owner/EMail eq '" + filteredUsers[i].mail + "'";
      } else {
        filter += "Owner/EMail eq '" + filteredUsers[i].mail + "' or ";
      }
    }
    this.getDepartmentSummary(filter);
  }

  public processHierarchy = (departmentusers, resultArray): any[] => {
    var userWithDirectReports = this.state.userWithDirectReports;
    for (let index = 0; index < departmentusers.length; index++) {
      var userReporties = userWithDirectReports.filter(c => c.mail == departmentusers[index].mail);

      if (this.state.departmentName) {
        userReporties = userReporties.filter(c => c.Department == this.state.departmentName);
      }

      if (userReporties.length > 0 && userReporties[0].directReports.length > 0) {
        var reportiesData = userReporties[0].directReports.map((reportdata) => {
          var dmail = reportdata.replace('i:0#.f|membership|', '');
          // var userdata = this.state.allUsers.filter(c => c.mail.toLowerCase()==mail.toLowerCase());
          var userdata =  this.state.allUsers.filter((dataval)=>{
            if(dataval.mail)
            return dataval.mail.toLowerCase()==dmail.toLowerCase()
          })
          return {
            mail: reportdata.replace('i:0#.f|membership|', ''),
            displayName: userdata[0].displayName
          };
        });
        Array.prototype.push.apply(resultArray, reportiesData);
        this.processHierarchy(reportiesData, resultArray);
      }
    }
    return resultArray;
  }

  public topLevelHierarchy = (userEmail) => {
    var userWithDirectReports = this.state.userWithDirectReports;
    topLevelUsers = [];
    for (let k = 0; k < userWithDirectReports.length; k++) {
      const userWithDirectReport = userWithDirectReports[k];

      if (this.state.departmentName && userWithDirectReport.Department != this.state.departmentName) {
        continue;
      }

      var fdata = userWithDirectReport.directReports.filter(c => c.toLowerCase().indexOf(userEmail.toLowerCase()) >= 0);

      if (fdata.length > 0) {
        topLevelUsers.push({
          mail: userWithDirectReport.mail,
          displayName: userWithDirectReport.displayName,
          topLevel: true
        });
        var filterdata = topLevelUsers.filter(c => c.mail.toLowerCase() == userWithDirectReport.mail.toLowerCase());
        if (filterdata.length == 0) {
          this.topLevelHierarchy(userWithDirectReport.mail);
        }
      }
    }
  }

  public getDepartmentSummary(filter) {
    var that = this;
    sp.web.lists
      .getByTitle("Objectives")
      .items.select(
        "Title",
        "Author/EMail",
        "Author/Id",
        "Owner/Id",
        "Owner/EMail",
        "Owner/Title",
        "Author/Title",
        "Author/Name",
        "Title",
        "ID",
        "Progress",
        "Description",
        "CompletionDate",
        "IsPredefined",
        "PredefinedObjectives/ID",
        "PredefinedObjectives/Title"
      )
      .expand("PredefinedObjectives", "Author", "Owner")
      .filter(filter)
      .get()
      .then((data) => {
        data = data.filter(c => c.IsPredefined == false);
        allObjectives = data;
        var total = 0;
        departmentSummary = [];

        var emails = [];
        if (this.state.departmentName) {
          for (let index = 0; index < users.length; index++) {
            emails.push(users[index].mail);
          }
        } else {
          for (let index = 0; index < this.state.selManager.DirectReports.length; index++) {
            var sdata = this.state.selManager.DirectReports[index].split('|');
            emails.push(sdata[sdata.length - 1]);
          }
        }

        for (let index = 0; index < emails.length; index++) {
          var userObjectives = data.filter((c) => c.Owner.EMail.toLowerCase() == emails[index].toLowerCase());
          if (userObjectives.length) {
            var totalpercent = 0;
            for (let j = 0; j < userObjectives.length; j++) {
              totalpercent += userObjectives[j].Progress;
            }
            totalpercent = Math.round(totalpercent / userObjectives.length);
            total = total + totalpercent;
            var topleveldata = users.filter(c => c.mail.toLowerCase().indexOf(userObjectives[0].Owner.EMail.toLowerCase()) >= 0 && c.topLevel == true);
            departmentSummary.push({
              email: userObjectives[0].Owner.EMail,
              displayName: userObjectives[0].Owner.Title,
              objectives: userObjectives.length,
              objectiveList: userObjectives,
              percentage: totalpercent,
              ownerId: userObjectives.length ? userObjectives[0].Owner.Id : 0,
              topLevel: topleveldata.length > 0
            });
          }
        }
        var overallpercent = 0;
        if (departmentSummary.length) {
          overallpercent = Math.round(total / departmentSummary.length);
        }

        for (let k = 0; k < users.length; k++) {
          var userObjectives = departmentSummary.filter((c) => c.email.toLowerCase() == users[k].mail.toLowerCase());
          if (userObjectives.length == 0) {
            departmentSummary.push({
              email: users[k].mail,
              displayName: users[k].displayName,
              objectives: 0,
              objectiveList: [],
              percentage: 0,
              ownerId: 0,
              topLevel: users[k].topLevel
            });
          }
        }

        that.setState({ departmentSummary: departmentSummary, overallpercent: overallpercent });
      });
  }

  public actionMenuToggle() {
    alert();
  }

  public render(): React.ReactElement {
    var that = this;

    const columns = [
      { title: "Display Name", field: "displayName" },
      { title: "Objectives", field: "objectives" },
      {
        title: "Objectives %", field: "percentage", render: rowData => {
          return <div className="title-progress"><div className="progressbar"> <LinearProgress variant="determinate" value={rowData.percentage} /></div><h4 className="text-primary"> {rowData.percentage ? Math.round(parseFloat(rowData.percentage)) : 0}%</h4></div>;
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
        <Search className="DSsearch" {...props} ref={ref} />
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
          this.state.showdptsummery ?

            <ViewDepartmentSummery isAdmin={this.props.isAdmin} currentsummery={"Department Summary"} objectives={this.state.currenctUserObj} showDepartmentSummery={this.showDeptSummery} directReports={this.state.directReports} /> :

            <div>
              <Card square={true} elevation={3}>
                <CardContent>

                  <div className={"pageTitle"}>
                    <div className="title-progress">
                      <h3 className={"nomargin"}>Department Summary</h3>
                      <div className="progressbar">
                        <LinearProgress variant="determinate" value={this.state.overallpercent} />
                      </div>
                      <h4 className="text-primary"> {Math.round(parseFloat(this.state.overallpercent + ''))}%</h4>
                    </div>

                    <div className="button-head-group">

                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        disableElevation
                        startIcon={<GridOnSharpIcon />}
                        onClick={this.generateDepartmentReport}
                        disabled={this.state.departmentSummary.length==0?true:false}   
                      >
                        Export to Excel
                </Button>
                      {that.state.showGraphicalView ? (
                        <Button
                          variant="contained"
                          color="secondary"
                          size="small"
                          disableElevation
                          startIcon={<TableChartOutlinedIcon />}
                          onClick={(e) => this.showGraphicalView(false)}
                        >
                          Table View
                        </Button>
                      ) : (
                          <Button
                            variant="contained"
                            color="secondary"
                            size="small"
                            disableElevation
                            startIcon={<VisibilityIcon />}
                            onClick={(e) => this.showGraphicalView(true)}
                          >
                            Graphical View
                          </Button>
                        )}
                    </div>
                  </div>
                  {that.state.showGraphicalView ? (
                    // <GraphicalView />
                    <BarChartJS siteUrl={this.props.siteUrl} graphClient={this.props.graphClient} />
                  ) : (
                      <div>
                        <Grid container alignItems="center" justify="space-between">
                          <Grid sm={6} >
                            <Grid container>

                              {
                                this.state.showDepartment &&
                                <Grid sm={5} >
                                  <FormControl variant="outlined" className="form-group w-100" size="small">
                                    <InputLabel id="standard-select-currency" >Departments</InputLabel>
                                    <Select
                                      labelId="standard-select-currency"
                                      id="standard-select-currency"
                                      onChange={this.setDepartment}
                                      label="Departments"
                                      value={this.state.departmentName}
                                    >
                                      {
                                        this.state.allDepartments.map((val) => {
                                          return (
                                            <MenuItem value={val.department}>{val.department}</MenuItem>
                                          );
                                        })
                                      }
                                    </Select>
                                  </FormControl>
                                </Grid>
                              }

                              {
                                this.state.showDepartment &&
                                <Grid sm={2} className="text-center" >
                                  <span className="divider-text">Or</span>
                                </Grid>
                              }


                              <Grid sm={5} >
                                <FormControl variant="outlined" className="form-group w-100" size="small">
                                  <InputLabel id="standard-select-currency" >Managers</InputLabel>
                                  <Select
                                    labelId="standard-select-currency"
                                    id="standard-select-currency"
                                    onChange={this.setManager}
                                    value={this.state.selManager}
                                    label="Managers"
                                  >
                                    {
                                      this.state.managers.map((val) => {
                                        return (
                                          <MenuItem value={val}>{val.DisplayName}</MenuItem>
                                        );
                                      })
                                    }
                                  </Select>
                                </FormControl>
                              </Grid>

                            </Grid>

                          </Grid>
                        </Grid>
                        <div className="departmentsummery">
                          <MaterialTable

                            title="Department Colleagues"
                            icons={tableIcons}

                            columns={columns}
                            data={this.state.departmentSummary}

                            actions={[
                              rowData => ({
                                icon: forwardRef((props: any, ref: any) => (
                                  <VisibilityIcon />
                                )),
                                tooltip: "View",
                                // onClick: (event, rowData: any) => this.showDetails(),
                                onClick: (event, rowData: any) => this.showDeptSummery(true, rowData),
                                disabled: (rowData["topLevel"] ||rowData["objectiveList"].length==0) == true
                              }),
                              rowData => ({
                                icon: forwardRef((props: any, ref: any) => (
                                  <AssessmentIcon />
                                )),
                                tooltip: "Generate Report",
                                onClick: (event, rowData: any) =>
                                  this.generateReport(rowData),
                                disabled: (rowData["topLevel"] ||rowData["objectiveList"].length==0) == true
                              })

                            ]}
                            options={{
                              actionsColumnIndex: 3,
                            }}
                          />
                        </div>
                      </div>
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
            </div>
        }
      </div>

    );
  }
}
