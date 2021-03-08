import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Badge,
  Dialog,
  DialogContent,
} from "@material-ui/core";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import LinearProgress from "@material-ui/core/LinearProgress";
import Slider from '@material-ui/core/Slider';
import TextField from "@material-ui/core/TextField";

import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import CreateIcon from "@material-ui/icons/Create";
import DeleteIcon from "@material-ui/icons/Delete";
import VisibilityIcon from "@material-ui/icons/Visibility";
import AddIcon from "@material-ui/icons/Add";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { sp } from "@pnp/sp";
import "@pnp/sp/fields";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/site-users";
import "@pnp/sp/webs";
import * as React from "react";   

import OkrList from "./List";
import EditObjective from "./EditObjective";

import ApiService from "../../../services/ApiService";

var moment: any = require('moment');
import "alertifyjs";

import "../../../ExternalRef/CSS/alertify.min.css";
var alertify: any = require("../../../ExternalRef/JS/alertify.min.js");
export interface IViewDepartment {
  objectives: any;
  showDepartmentSummery: any;
  currentsummery: string;
  directReports: any;
  isAdmin: boolean;
}

class ViewDepartmentSummery extends React.Component<IViewDepartment, any> {


  private listName = "Objectives";
  private krArray = [];
  private krlistName = "KeyResults";

  constructor(props) {
    super(props);
    this.state = {
      // objectives: this.props.objectives,
      // ownerId: this.props.objectives.ownerId,
      // objectiveList: (this.props.objectives && this.props.objectives.objectiveList) ? this.props.objectives.objectiveList : [],
      // keyresults: []
      objectives: this.props.objectives,
      ownerId: this.props.objectives.ownerId,
      objectiveList: [],
      keyresults: [],
      directReports: this.props.directReports,
      isManager: false
    };
    alertify.set("notifier", "position", "top-right");
    var _this = this;
    sp.web.currentUser.get().then(function (userdata) {
      _this.setState({ userdata: userdata });
    });

    this.getObjectives(this.listName);
  }

  public loadKeyValues() {
    let list = sp.web.lists.getByTitle("KeyResults");
    list.items
      .get()
      .then((items: any[]) => {
        var krArray = [];
        if (items.length > 0) {
          var objectives = this.state.objectiveList;
          for (let i = 0; i < items.length; i++) {
            var completeddate = moment(items[i].Date).format("DD-MMM-YYYY");
            var lastUpdatedDate = items[i].LastUpdatedDate ? moment(items[i].LastUpdatedDate).format("DD-MMM-YYYY") : '';

            krArray.push({
              title: items[i].Title,
              progress: items[i].Progress,
              id: items[i].Id,
              objId: items[i].ObjectiveID,
              progressType: items[i].ProgressType,
              krdate: completeddate,
              lastupdateddate: lastUpdatedDate,
              currentProgress: items[i].CurrentProgress ? items[i].CurrentProgress : 0,
              quarter:
                "Q" +
                Math.floor((new Date(items[i].Created).getMonth() + 3) / 3) +
                "-" +
                new Date(items[i].Created).getFullYear(),
              Logs: items[i].Logs
            });

            var findindex = -1;
            for (let j = 0; j < objectives.length; j++) {
              const objective = objectives[j];
              if (objective.Id == items[i].ObjectiveID) {
                findindex = j;
                break;
              }
            }
            if (findindex >= 0) {
              var krs = items.filter(c => c.ObjectiveID == items[i].ObjectiveID);
              objectives[findindex]["totalKR"] = krs.length;
            }

          }
          this.setState({ keyresults: krArray, objectiveList: objectives });
        }
      })
      .catch((error: any[]) => {
        console.log(error);
      });
  }


  public handleObjRefresh = () => {
    console.log("called obj refresh");
    this.getObjectives(this.listName);
  }

  public getObjectives(listName) {
    var objArray = [];
    var completedObjArray = [];
    let list = sp.web.lists.getByTitle(this.listName);
    list.items
      // .filter("Author/EMail eq '" + this.state.userMail + "'")
      .filter("OwnerId eq '" + this.state.ownerId + "'")
      .get()
      .then((items: any[]) => {
        items = items.filter(c => c.IsPredefined == false);

        var fdata = this.state.directReports.filter(c => c.toLowerCase().indexOf(this.props.objectives.email.toLowerCase()) >= 0);
        if (fdata.length) {
          this.setState({ isManager: true });
        } else {
          this.setState({ isManager: false });
        }


        var objectivePercentage = 0;
        var remainingObj = 0;
        if (items.length > 0) {
          for (let i = 0; i < items.length; i++) {
            var description = "";

            description = items[i].Description;
            var completeddate = moment(items[i].CompletionDate).format(
              "DD-MMM-YYYY"
            );

            var objective = {
              title: items[i].Title,
              isPredefined: items[i].IsPredefined,
              description: items[i].Description,
              id: items[i].Id,
              progress: items[i].Progress,
              completiondate: completeddate,
              isCompleted: items[i].IsCompleted,
              quarter:
                "Q" +
                Math.floor((new Date(items[i].Created).getMonth() + 3) / 3) +
                "-" +
                new Date(items[i].Created).getFullYear(),
              Logs: items[i].Logs
            };

            objArray.push(objective);
            if (!objective.isCompleted) {
              remainingObj += 1;
              objectivePercentage += !objective.progress
                ? 0
                : objective.progress;
            }
          }
          objectivePercentage = objectivePercentage / remainingObj;
        }

        this.setState({
          objectiveList: objArray,
          objectivePercentage: objectivePercentage,
        });

        this.loadKeyValues();

        console.log(this.state.objectives, "State objectives");
      })
      .catch((error: any[]) => {
        console.log(error);
      });
  }

  public showDepartmentSummery = () => {
    this.props.showDepartmentSummery(false, null);
  }

  public openEditObj = (item) => {
    this.setState({ editObjective: true, item: item });
  }
  public openDeleteObj = (item) => {
    this.setState({ deleteObjective: true, item: item });
  }

  public closeEditObj = () => {
    this.setState({ editObjective: false });
    this.handleObjRefresh();
  }
  public closeDeleteObj = (item) => {
    this.setState({ deleteObjective: false });
    this.handleObjRefresh();
  }

  public handleDialog = (e) => {
    this.setState({ showhide: false });
  }

  public handleKRType = (event, id) => {
    this.setState({
      krtype: event.target.checked,
      itemID: id,
      selectedType: event.target.checked ? "Numeric" : "Percentage",
    });
  }

  public onChange = (e) => this.setState({ [e.target.name]: e.target.value });
  public onChangeType = (e) => this.setState({ selectedType: e.target.value });


  public addKeyResult = (ID) => {
    if (!this.state.krtitle) {
      alertify.error('Title is required');
      return;
    }
   
    // if (!this.state.krdate) {
    //   alertify.error('Key Result date is required');
    //   return;
    // }
    var objId = ID;
    let keyresult = {
      Title: this.state.krtitle,
      // ProgressType: this.state.selectedType ? this.state.selectedType : 'Percentage',
      ProgressType: 'Percentage',
      Progress: 100, //parseInt(this.state.krprogress),
      // Date: this.state.krdate,
      ObjectiveID: objId,
    };
    if (!keyresult.Progress) {
      keyresult.Progress = 100;
    }
    keyresult["Logs"] = 'Key Result Created On : ' + new Date() + '\nCreted by : ' + this.state.userdata.Email + '\n\n';

    if (objId != null && objId != undefined && objId != 0) {
      ApiService.add(this.krlistName, keyresult)

        .then((result) => {
          this.setState({
            showfields: false,
            itemID: result.data.Id,
            krtype: false,
          });
          alertify.success("Key Result added successfully");

          let list = sp.web.lists.getByTitle(this.krlistName);
          list.items
            .filter("ObjectiveID eq '" + objId + "'")
            .get()
            .then((items: any[]) => {
              var avg = this.getKeyResultAvg(items);
              sp.web.lists
                .getByTitle(this.listName)
                .items.getById(objId)
                .update({ Progress: avg })
                .then((rs) => {
                  this.handleObjRefresh();
                  this.loadKeyValues();
                });
            });

          // this.handlekeyRefresh();
        })
        .catch((error: any[]) => {
          console.log(error);
        });
    }
  }


  public getKeyResultAvg(newset) {
    var progress = 0;
    var avg = 0;
    if (newset.length > 0) {
      for (let i = 0; i < newset.length; i++) {
        var value = newset[i].CurrentProgress;
        if (!value) {
          value = 0;
        }
        var average = (value / newset[i].Progress) * 100;
        progress = progress + average;
      }
      avg = Math.round(progress / newset.length);
      console.log(avg);
      return avg;
    }
  }

  public handleFields = (id) => {
    this.setState({
      showfields: true,
      itemID: id,
      krtype: false,
    });
  }

  public render() {
    return (
      <div className="DSView"> 
        <div className={"pageTitle"}>
          <div className="title-progress">
            <h3 className={"nomargin"}>{this.state.objectives.displayName} Summary</h3>
          </div>
          <div className="button-head-group">
            <Button
              variant="contained"
              color="primary"
              size="small"
              disableElevation
              startIcon={<VisibilityIcon />}
              onClick={this.showDepartmentSummery}
            >
              {this.props.currentsummery}
            </Button>
          </div>
        </div>

        {
          (this.state.isManager || this.props.isAdmin) ?

            <div className="OnGoingObject">
              {this.state.objectiveList.length > 0 &&
                this.state.objectiveList.map((item, index) => {
                  if (!item.isCompleted) {
                    var currentDate = moment(new Date());
                    var objdate = moment(item.completiondate);
                    var days = objdate.diff(currentDate, "days");
                    var className = "fdate";
                    if (days < 0) {
                      className = "pendingdate";
                    } else if (days <= 7) {
                      className = "pendingdate-yellow";
                    }

                    return (
                      <Accordion
                        className="accordion"
                        square={true}
                        elevation={0}
                      >
                        <AccordionSummary>
                          <Typography>
                            <Badge className="MuiBadge-badge-custom" badgeContent={(item.totalKR ? item.totalKR : 0)} color="primary">{item.title}</Badge>
                          </Typography>

                          <FormControlLabel
                            className="accordionFormControl"
                            aria-label="Acknowledge"
                            onClick={(event) => event.stopPropagation()}
                            onFocus={(event) => event.stopPropagation()}
                            control={
                              <div className="accordion-progressbar">
                                {/* <Slider
                                  value={item.progress} valueLabelDisplay="auto"
                                  onChangeCommitted={this.handleSliderChange}
                                  aria-labelledby="input-slider"
                                /> */}

                                <LinearProgress
                                  variant="determinate"
                                  value={item.progress}
                                />
                              </div>
                            }
                            label=""
                          />

                          <h4 className="text-primary"> {item.progress ? Math.round(parseFloat(item.progress)) : 0}%</h4>

                          <div className="date-finished">
                            <span className={className}>
                              <label>Due Date : </label>
                              <span>
                                {item.completiondate}
                              </span>
                            </span>
                          </div>
                          <div className="date-finished ">
                            <span className="secondary02">
                              <label>Quarter : </label>
                              <span >{item.quarter}</span>
                            </span>
                          </div>
                          <div className="button-right">
                            <IconButton
                              className="button-sm"
                              color="primary"
                              onClick={(e) => this.openEditObj(item)}
                            //onFocus={(event) => event.stopPropagation()}
                            >
                              <CreateIcon />
                            </IconButton>
                            <IconButton
                              className="button-sm"
                              onClick={(e) => this.openDeleteObj(item)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </div>
                        </AccordionSummary>
                        <AccordionDetails className="accordion-details">
                          {this.state.keyresults.length > 0 ? (
                            <OkrList
                              objective={item}
                              keyresults={this.state.keyresults}
                              refresh={this.handleObjRefresh}
                              refreshkey={this.loadKeyValues}
                            ></OkrList>
                          ) : null}
                          {this.state.itemID == item.id ? (
                            this.state.showfields ? (
                              <div className="create-key-containers">
                                <section className="create-keyValues">
                                  <Grid container spacing={5}>
                                    <Grid item xs={6}>
                                      <TextField
                                        autoFocus
                                        id="krtitle"
                                        name="krtitle"
                                        label="Title"
                                        type="text"
                                        fullWidth
                                        variant="outlined"
                                        size={"small"}
                                        onChange={this.onChange}
                                      />
                                    </Grid>

                                    {/* <Grid item xs={3}>
                                      <FormControlLabel
                                        control={
                                          <Checkbox
                                            color="primary"
                                            onChange={(e) =>
                                              this.handleKRType(e, item.id)
                                            }
                                          />
                                        }
                                        label="is Number"
                                      />
                                      {this.state.krtype &&
                                        this.state.itemID == item.id ? (
                                          <TextField
                                            autoFocus
                                            id="krprogress"
                                            name="krprogress"
                                            label="Count"
                                            type="text"
                                            className="totalcounttextbox"
                                            variant="outlined"
                                            size={"small"}
                                            onChange={this.onChange}
                                          />
                                        ) : null}
                                    </Grid> */}

                                    {/* <Grid item xs={3}>
                                      <TextField
                                        autoFocus
                                        name="krdate"
                                        id="date"
                                        label="Select Date"
                                        type="date"
                                        fullWidth
                                        variant="outlined"
                                        size="small"
                                        onChange={this.onChange}
                                        InputLabelProps={{
                                          shrink: true
                                        }}
                                      />
                                    </Grid> */}
                                  </Grid>
                                  <div className="button-groups">
                                    <Button
                                      className="mr-5"
                                      variant="contained"
                                      disableElevation
                                      color="default"
                                    >
                                      Reset
                                      </Button>
                                    <Button
                                      variant="contained"
                                      disableElevation
                                      color="primary"
                                      onClick={(e) =>
                                        this.addKeyResult(item.id)
                                      }
                                    >
                                      Save
                                      </Button>
                                  </div>
                                </section>
                              </div>
                            ) : null
                          ) : (
                              <Grid container>
                                <Grid item xs={3}>
                                  <Button
                                    variant="contained"
                                    className="addKeyButton"
                                    disableElevation
                                    color="secondary"
                                    onClick={() => this.handleFields(item.id)}
                                  >
                                    Add Key Result
                                  </Button>
                                </Grid>
                              </Grid>
                            )}

                          <form
                            noValidate
                            autoComplete="off"
                            className="hide"
                          >
                            <TextField
                              placeholder="Add Key Value"
                              label=""
                              className="FormControlAdd"
                              //onKeyDown={this.handleKeyDown}
                              InputProps={{
                                startAdornment: (
                                  <InputAdornment position="start">
                                    <ControlPointIcon />
                                  </InputAdornment>
                                ),
                              }}
                            />
                          </form>
                        </AccordionDetails>
                      </Accordion>
                    );
                  }
                })}

            </div>

            :

            <div className="OnGoingObject">
              {this.state.objectiveList.length > 0 &&
                this.state.objectiveList.map((item, index) => {
                  if (!item.isCompleted) {
                    var currentDate = moment(new Date());
                    var objdate = moment(item.completiondate);
                    var days = objdate.diff(currentDate, "days");
                    var className = "fdate";
                    if (days < 0) {
                      className = "pendingdate";
                    } else if (days <= 7) {
                      className = "pendingdate-yellow";
                    }

                    return (
                      <Accordion
                        className="accordion"
                        square={true}
                        elevation={0}
                      >
                        <AccordionSummary>
                          <Typography>
                            <Badge className="MuiBadge-badge-custom" badgeContent={(item.totalKR ? item.totalKR : 0)} color="primary">{item.title}</Badge>
                          </Typography>

                          <FormControlLabel
                            className="accordionFormControl"
                            aria-label="Acknowledge"
                            onClick={(event) => event.stopPropagation()}
                            onFocus={(event) => event.stopPropagation()}
                            control={
                              <div className="accordion-progressbar">
                                {/* <Slider
                                value={item.progress} valueLabelDisplay="auto"
                                onChangeCommitted={this.handleSliderChange}
                                aria-labelledby="input-slider"
                              /> */}

                                <LinearProgress
                                  variant="determinate"
                                  value={item.progress}
                                />
                              </div>
                            }
                            label=""
                          />

                          <h4 className="text-primary"> {item.progress ? Math.round(parseFloat(item.progress)) : 0}%</h4>

                          <div className="date-finished">
                            <span className={className}>
                              <label>Due Date : </label>
                              <span>
                                {item.completiondate}
                              </span>
                            </span>
                          </div>
                          <div className="date-finished ">
                            <span className="secondary02">
                              <label>Quarter : </label>
                              <span >{item.quarter}</span>
                            </span>
                          </div>

                        </AccordionSummary>
                        <AccordionDetails className="accordion-details">
                          {this.state.keyresults.length > 0 ? (
                            // <OkrList
                            //   objective={item}
                            //   keyresults={this.state.keyresults}
                            //   refresh={this.handleObjRefresh}
                            //   refreshkey={this.loadKeyValues}
                            // ></OkrList>

                            <List>
                              {this.state.keyresults.map((kr, i) => {
                                var currentDate = moment(new Date());
                                var objdate = moment(kr.krdate);
                                var days = currentDate.diff(objdate, "days");
                                var className = "fdate";
                                if (days < 0) {
                                  className = "pendingdate";
                                } else if (days <= 7) {
                                  className = "pendingdate-yellow";
                                }

                                return item.id != 0 && kr.objId == item.id ? (
                                  <ListItem>
                                    {/* <ListItemAvatar className="custom-avator">
                                    <div className="icon-circle">BE</div>
                                  </ListItemAvatar> */}
                                    <ListItemText>{kr.title}</ListItemText>
                                    <div className="accordion-progressbar">

                                      <LinearProgress
                                        variant="determinate"
                                        value={kr.currentProgress}
                                      />

                                    </div>

                                    {/* <div className="date-finished">
                                      <span className={className}>
                                        <label>Due Date : </label>
                                        <span>{kr.krdate}</span>
                                      </span>
                                    </div> */}

                                    <div className="date-finished">
                                      <span className="secondary02">
                                        <label>Quarter : </label>
                                        <span >{kr.quarter}</span>
                                      </span>
                                    </div>
                                  </ListItem>
                                ) : null;
                              })}
                            </List>

                          ) : null}

                        </AccordionDetails>
                      </Accordion>
                    );
                  }
                })}

            </div>
        }



        <Dialog open={this.state.editObjective} className="modalPopupObjective">
          <DialogContent>
            <EditObjective
              handleClose={this.closeEditObj}
              item={this.state.item}
            ></EditObjective>
          </DialogContent>
        </Dialog>

      </div >
    );
  }
}

export default ViewDepartmentSummery;
