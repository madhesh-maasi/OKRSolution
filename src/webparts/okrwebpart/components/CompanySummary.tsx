import * as React from "react";
import ApiService from "../../../services/ApiService";

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

import CompanyGraph from "./CompanyGraph";

import TableChartOutlinedIcon from '@material-ui/icons/TableChartOutlined';

import DialogContentText from "@material-ui/core/DialogContentText";

import CreateIcon from "@material-ui/icons/Create";
import DeleteIcon from "@material-ui/icons/Delete";

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
import AddIcon from "@material-ui/icons/Add";
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
import DoneIcon from '@material-ui/icons/Done';


import * as FileSaver from "file-saver";
import "alertifyjs";
import '../../../ExternalRef/CSS/alertify.min.css';
import '../../../ExternalRef/CSS/style.css';
var alertify: any = require("../../../ExternalRef/JS/alertify.min.js");

var moment: any = require("moment");

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
  any
  > {
  constructor(props: ICompanySummaryProps) {
    super(props);
    sp.setup({
      sp: {
        baseUrl: this.props.siteUrl,
      },
    });
    this.state = {
      companyObjectives: [],
      showAdd: false,
      currentUser: this.props.context.pageContext.user.displayName,
      overalltotal: 0,
    };
 

    this.getCompanySummary();
    alertify.set("notifier", "position", "top-right");

    sp.web.currentUser.get().then((userdata) => {
      this.setState({ userdata: userdata });
    });

  }

  public onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  public showAddPopup = () => {
    this.setState({ title: '', description: '', completiondate: new Date(""), showAdd: true });
  }

  public addObjective = () => {
    if (!this.state.title) {
      alertify.error('Title is required');
      return false;
    }
    if (!this.state.completiondate) {
      alertify.error('Completion date is required');
      return false;
    }
    let objective = {
      Title: this.state.title,
      Description: this.state.description,
      CompletionDate: this.state.completiondate != '' ? this.state.completiondate : new Date(),
    };
    ApiService.add("PredefinedObjectives", objective)
      .then((item: any) => {
        this.getCompanySummary();
        alertify.success("Objectives added successfully");
        this.setState({ showAdd: false });
      })
      .catch((error: any[]) => {
        console.log(error);
      });
    return;
  }



  public openEditObj = (data) => {
    this.setState({ id: data.Id, title: data.Title, description: data.Description, completiondate: moment(new Date(data.CompletionDate)).format("YYYY-MM-DD"), showEdit: true });
  }


  public openDeleteObj = (data) => {
    this.setState({ id: data.Id, showDelete: true });
  }

  public deleteObj = () => {
    ApiService.delete("PredefinedObjectives", this.state.id)
      .then((_) => {
        this.getCompanySummary();
        alertify.success("Deleted successfully");
        this.setState({ showDelete: false });
      })
      .catch((error: any[]) => {
        console.log(error);
      });
  }

  public editObjective = () => {
    if (!this.state.title) {
      alertify.success('Title is required');
      return false;
    }
    if (!this.state.completiondate) {
      alertify.success('Completion date is required');
      return false;
    }
    let objective = {
      Title: this.state.title,
      Description: this.state.description,
      CompletionDate: this.state.completiondate != '' ? this.state.completiondate : new Date(),
    };
    ApiService.edit("PredefinedObjectives", objective, this.state.id)
      .then((item: any) => {
        this.getCompanySummary();
        alertify.success("Objectives edit successfully");
        this.setState({ showEdit: false });
      })
      .catch((error: any[]) => {
        console.log(error);
      });

    return;
  }

  public getCompanySummary = () => {
    sp.web.lists
      .getByTitle("PredefinedObjectives")
      .items
      .get()
      .then((data) => {
        var percentage = 0;
        if (data && data.length) {
          for (let index = 0; index < data.length; index++) {
            percentage = percentage + (data[index].Progress ? Math.round(parseFloat(data[index].Progress)) : 0);
          }
          percentage = percentage / data.length;
        }
        this.setState({ companyObjectives: data, overalltotal: percentage });
      });
  }

  public handleChangeCommit = (value, obj) => {
    let objective = {
      Progress: value,
    };
    ApiService.edit("PredefinedObjectives", objective, obj.Id)
      .then((item: any) => {
        this.getCompanySummary();
      })
      .catch((error: any[]) => {
        console.log(error);
      });
  }
  public handleInputChangeBlur = (event) => {
    var eid=event.currentTarget.id;
    
    
    var value = (document.getElementById(eid) as HTMLInputElement).value;
    if (value && parseInt(value) <= 100) {
      (document.getElementById(eid) as HTMLInputElement).value="";
      this.handleChangeCommit(parseInt(value), {Id:parseInt(event.currentTarget.id)});
    }
  };

  public handleChange = (value, obj) => {

  }

  public showGraphicalView = (showGraphicalView) => {
    this.setState({ showGraphicalView: showGraphicalView });
  }

  public render(): React.ReactElement {

    const columns = [
      { title: "Title", field: "Title" },
      {
        title: "Objective %", field: "Progress", render: rowData => {
          return <div className="title-progress">
            <div className="progressbar"> <LinearProgress variant="determinate" value={rowData.Progress} /></div><h4 className="text-primary"> {rowData.Progress ? Math.round(parseFloat(rowData.Progress)) : 0}%</h4></div>;
        }
      },
    ];

    

    const adminColumns = [
      { title: "Title", field: "Title" },
      {
        title: "Objective %", field: "Progress", render: rowData => {
          return <div className="title-progress"><div className="accordion-slider mr-15">
            <Slider
              valueLabelDisplay="auto"
              value={rowData.Progress}
              min={0}
              max={100}
              
              onChangeCommitted={(e, val) => this.handleChangeCommit(val, rowData)}
              onChange={(e, val) => this.handleChange(val, rowData)}
              aria-labelledby="input-slider"
            />

          </div>
          <div>

              <TextField
                className="krInput"
                id={rowData.ID}
                //  onChange={handleInputChange}
                //  onBlur={handleInputChangeBlur}
                type="number" //number
                InputLabelProps={{
                  shrink: true
                }}
                InputProps={{ inputProps: { min: 0, max: 10 } }}
                placeholder={rowData.Progress}
              />
              <IconButton className="buttonDone"  >
                <DoneIcon id={rowData.ID}  onClick={this.handleInputChangeBlur} />
              </IconButton>
              </div></div>;

            {/* <h4 className="text-primary ml-3">{rowData.Progress}</h4></div>; */}

        }
      },
      {
        title: "", field: "Edit", render: rowData => {
          return <div className="btnsCentering">
            <IconButton
              className="button-sm"
              color="primary"
              onClick={(e) => this.openEditObj(rowData)}
            //onFocus={(event) => event.stopPropagation()}
            >
              <CreateIcon />
            </IconButton>
            <IconButton
              className="button-sm"
              color="primary"
              onClick={(e) => this.openDeleteObj(rowData)}
            //onFocus={(event) => event.stopPropagation()}
            >
              <DeleteIcon />
            </IconButton>
          </div>;
        }
      },
      // {
      //   title: "", field: "Delete", render: rowData => {
      //     return <div> 
      //       {/* <IconButton
      //         className="button-sm"
      //         color="primary"
      //         onClick={(e) => this.openDeleteObj(rowData)}
      //       //onFocus={(event) => event.stopPropagation()}
      //       >
      //         <DeleteIcon />
      //       </IconButton> */}
      //     </div>;
      //   }
      // } madhesh
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

        <div>
          <Card square={true} elevation={3}>
            <CardContent>
              <div className={"pageTitle"}>
                {
                  !this.state.showGraphicalView &&
                  <div className="title-progress">
                    <h3 className={"nomargin"}>Company Summary</h3>
                    <div className="progressbar">
                      <LinearProgress variant="determinate" value={this.state.overalltotal} />
                    </div>
                    <h4 className="text-primary"> {Math.round(this.state.overalltotal)}%</h4>
                  </div>
                }

<div className="button-head-group tbl-rgt">

                {
                  this.props.isAdmin && !this.state.showGraphicalView ?
                      <Button
                        variant="contained"
                        color="secondary"
                        size="small"
                        disableElevation
                        startIcon={<AddIcon />}
                        onClick={this.showAddPopup.bind(this)}
                      >
                        Add Company Objectives
          </Button>


                    
                    : ''
                }

                {
                  this.state.showGraphicalView ? (
                   
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
                    )
                }
                    </div>

              </div>

              {
                this.state.showGraphicalView ?
                  // <GraphicalView />
                  <CompanyGraph siteUrl={this.props.siteUrl} graphClient={this.props.graphClient} />
                  :
                  (
                    <div className="departmentsummery">
                      <MaterialTable
                        title="Company Objectives"
                        icons={tableIcons}
                        columns={this.props.isAdmin ? adminColumns : columns}
                        data={this.state.companyObjectives}
                      />
                    </div>
                  )
              }

            </CardContent>
          </Card>

          <Dialog open={this.state.showAdd} className="modalPopupObjective">
            <DialogContent>
              <div>
                <h3>Add Company Objective</h3>


                <TextField
                  autoFocus
                  name="title"
                  label="Title"
                  type="text"
                  value={this.state.title}
                  onChange={this.onChange}
                  fullWidth
                  size="small"
                  variant="outlined"
                />



                <TextField
                  name="description"
                  label="Description"
                  type="text"
                  fullWidth
                  multiline
                  onChange={this.onChange}
                  value={this.state.description}
                  rows={3}
                  size="small"
                  variant="outlined"
                />

                <TextField
                  name="completiondate"
                  label="Due Date"
                  type="date"
                  fullWidth
                  onChange={this.onChange}
                  value={this.state.completiondate}
                  rowsMax={4}
                  size="small"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true
                  }}
                />

              </div>
            </DialogContent>

            <DialogActions>
              <Button
                variant="contained"
                color="default"
                disableElevation
                size="small"
                onClick={(e) => this.setState({ showAdd: false })}
              >
                Cancel
            </Button>
              <Button
                variant="contained"
                color="primary"
                disableElevation
                size="small"
                onClick={this.addObjective.bind(this)}
              >
                Submit
            </Button>
            </DialogActions>
          </Dialog>


          <Dialog open={this.state.showEdit} className="modalPopupObjective">

            <DialogContent>
              <div>
                <h3>Edit Company Objective</h3>


                <TextField
                  autoFocus
                  name="title"
                  label="Title"
                  type="text"
                  value={this.state.title}
                  onChange={this.onChange}
                  fullWidth
                  size="small"
                  variant="outlined"
                />



                <TextField
                  name="description"
                  label="Description"
                  type="text"
                  fullWidth
                  multiline
                  onChange={this.onChange}
                  value={this.state.description}
                  rows={3}
                  size="small"
                  variant="outlined"
                />

                <TextField
                  name="completiondate"
                  label="Due Date"
                  type="date"
                  fullWidth
                  onChange={this.onChange}
                  value={this.state.completiondate}
                  rowsMax={4}
                  size="small"
                  variant="outlined"
                  InputLabelProps={{
                    shrink: true
                  }}
                />

              </div>
            </DialogContent>

            <DialogActions>
              <Button
                variant="contained"
                color="default"
                disableElevation
                size="small"
                onClick={(e) => this.setState({ showEdit: false })}
              >
                Cancel
            </Button>
              <Button
                variant="contained"
                color="primary"
                disableElevation
                size="small"
                onClick={this.editObjective.bind(this)}
              >
                Submit
            </Button>
            </DialogActions>
          </Dialog>


          <Dialog
            open={this.state.showDelete}
            aria-labelledby="alert-dialog-title"
            aria-describedby="alert-dialog-description"
          >
            <DialogTitle id="alert-dialog-title">{"Warning"}</DialogTitle>
            <DialogContent>
              <DialogContentText id="alert-dialog-description">
                Do you want to delete ?
          </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button size="small" variant="contained" onClick={(e) => this.setState({ showDelete: false })}>
                No
          </Button>
              <Button size="small" color="primary" variant="contained" onClick={this.deleteObj.bind(this)}  autoFocus>
                Yes
          </Button>
            </DialogActions>
          </Dialog>

        </div >
      </div >
    );
  }
}
