
import Input from '@material-ui/core/Input';
import {
  Button,
  Card,
  CardContent,
  Checkbox,
  Dialog,
  DialogContent,
  Badge,
} from "@material-ui/core";
import Accordion from "@material-ui/core/Accordion";
import AccordionDetails from "@material-ui/core/AccordionDetails";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Grid from "@material-ui/core/Grid";
import IconButton from "@material-ui/core/IconButton";
import InputAdornment from "@material-ui/core/InputAdornment";
import LinearProgress from "@material-ui/core/LinearProgress";
import Slider from "@material-ui/core/Slider";
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
import AdjustIcon from '@material-ui/icons/Adjust';
import PublishIcon from '@material-ui/icons/Publish';
import AddIcon from "@material-ui/icons/Add";
import { KeyboardDatePicker } from "@material-ui/pickers";
import { sp } from "@pnp/sp";
import "@pnp/sp/fields";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/site-users";
import "@pnp/sp/webs";
import * as React from "react";
import DeleteObjective from "./DeleteObjective";
import EditObjective from "./EditObjective";
import { IMyDetailsProps, IObjective } from "./IMyDetailsProps";
import OkrList from "./List";
import HorizontalLinearStepper from "./steppers";
import ApiService from "../../../services/ApiService";
import "alertifyjs";

import "../../../ExternalRef/CSS/alertify.min.css";
var alertify: any = require("../../../ExternalRef/JS/alertify.min.js");
var moment: any = require("moment");
var departmentSummary = [];

export default class MyDetails extends React.Component<IMyDetailsProps, any> {
  constructor(props: IMyDetailsProps) {
    super(props);
    sp.setup({
      sp: {
        baseUrl: this.props.siteUrl,
      },
    });
    this.state = {
      isHidden: false,
      objectives: [] as IObjective[],
      keyresults: [],
      type: [],
      showhide: false,
      menu: ["Objectives", "Department Summary", "Company Summary"],
      userName: "",
      userMail: "",
      currentUser: {},
      editObjective: false,
      deleteObjective: false,
      item: [],
      krtitle: "",
      krprogress: 0,

      krdate: "",
      //progressType: [],
      krtype: false,
      showfields: false,
      itemID: 0,
      ischecked: false,
      selectedType: "",
      refresh: false,
    };
    alertify.set("notifier", "position", "top-right");
  }
  private value: any;
  private objArray = [];
  private listName = "Objectives";
  private krArray = [];
  private krlistName = "KeyResults";
  //private selectedType: string;

  public componentDidMount() {
    this.getUser();
  }

  public getUser() {
    sp.web.currentUser.get().then((result) => {
      console.log(result);
      this.setState({ userName: result.Title, userMail: result.Email, currentUser: result });
      this.getObjectives(this.listName);
    });
  }

  // public gettypeValue() {
  //   var choice = [];
  //   let list = sp.web.lists.getByTitle(this.krlistName);
  //   list.fields
  //     .getByInternalNameOrTitle("ProgressType")
  //     .select("Choices")
  //     .get()
  //     .then(
  //       (items: any) => {
  //         if (items != null && items != undefined && items.Choices.length > 0) {
  //           choice = items.Choices;
  //           this.setState({ progressType: choice });
  //           this.setState({ selectedType: choice[0] });
  //         }
  //         //console.log(this.state.type);
  //       },
  //       (error) => {
  //         console.log(error);
  //       }
  //     );
  // }

  public getObjectives(listName) {
    var objArray = [];
    var completedObjArray = [];
    let list = sp.web.lists.getByTitle(this.listName);
    list.items
      // .filter("Author/EMail eq '" + this.state.userMail + "'")
      .filter("OwnerId eq '" + this.state.currentUser.Id + "'")
      .get()
      .then((items: any[]) => {
        items = items.filter(c => c.IsPredefined == false);
        this.getkeyResults();

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
              IsPrivate: items[i].IsPrivate,
              PredefinedObjectivesId: items[i].PredefinedObjectivesId,
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
              Logs: items[i].Logs,
              CompletedDate:new Date(items[i].CompletedDate).toLocaleDateString()
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
          objectives: objArray,
          objectivePercentage: objectivePercentage,
        });

        console.log(this.state.objectives, "State objectives");
      })
      .catch((error: any[]) => {
        console.log(error);
      });
  }

  public getkeyResults() {
    this.krArray = [];
    let list = sp.web.lists.getByTitle(this.krlistName); //filter('ObjectiveID eq ' + ID).
    list.items
      .get()
      .then((items: any[]) => {
        var objectives = this.state.objectives;
        var keyresults = this.state.keyresults;
        keyresults = [];
        if (items.length > 0) {
          for (let i = 0; i < items.length; i++) {
            var completeddate =
              items[i].Date != undefined
                ? moment(items[i].Date).format("DD-MMM-YYYY")
                : "";
            var lastUpdatedDate = "";
            if (items[i].LastUpdatedDate) {
              lastUpdatedDate =
                items[i].Date != undefined
                  ? moment(items[i].LastUpdatedDate).format("DD-MMM-YYYY")
                  : "";
            }
            keyresults.push({
              title: items[i].Title,
              progress: items[i].Progress,
              id: items[i].Id,
              objId: items[i].ObjectiveID,
              progressType: items[i].ProgressType,
              krdate: completeddate,
              lastupdateddate: lastUpdatedDate,
              currentProgress: items[i].CurrentProgress
                ? items[i].CurrentProgress
                : 0,
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
              if (objective.id == items[i].ObjectiveID) {
                findindex = j;
                break;
              }
            }
            if (findindex >= 0) {
              var krs = items.filter(
                (c) => c.ObjectiveID == items[i].ObjectiveID
              );
              objectives[findindex]["totalKR"] = krs.length;
            }
          }
        }
        this.setState({ keyresults: keyresults, objectives: objectives });
        console.log(this.state.keyresults, "keyresults");
      })
      .catch((error: any[]) => {
        console.log(error);
      });
  }
  public async GetUser() {
    sp.web.currentUser.get().then((result) => {
      console.log(result);
    });
  }

  public handleObjRefresh = () => {
    console.log("called obj refresh");
    this.getObjectives(this.listName);
  }
  public handlekeyRefresh = () => {
    console.log("called key refresh");

    this.getkeyResults();
  }

  public handleKRType = (event, id) => {
    this.setState({
      krtype: event.target.checked,
      itemID: id,
      selectedType: event.target.checked ? "Numeric" : "Percentage",
    });
  }
  public handleFields = (id) => {
    var krs = this.state.keyresults.filter(c => c.objId == id);
    if (krs.length >= 5) {
      alertify.error('Key result reached maximum count');
      return;
    }
    this.setState({
      showfields: true,
      itemID: id,
      krtype: false,
    });
  }

  public viewObjective() {
    this.setState({
      isHidden: true,
    });
  }

  public viewOngoingObjective = () => {
    this.setState({
      isHidden: false,
    });
  }

  public handleAddObj = (e) => {
    this.setState({ showhide: true });
  }

  public setCompleteObj = (item) => {
    let objective = {
      IsCompleted: true,
      CompletedDate:new Date()
    };
    ApiService.edit("Objectives", objective, item.id)
      .then((item: any) => {
        console.log("Objectives updated success");
        this.handleObjRefresh();
        alertify.success("Objectives completed");
      })
      .catch((error: any[]) => {
        console.log(error);
      });
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

  public onChange = (e) => this.setState({ [e.target.name]: e.target.value });
  public onChangeType = (e) => this.setState({ selectedType: e.target.value });
  private objId: number = 0;

  public addKeyResult = (ID) => {
    if (!this.state.krtitle) {
      alertify.error('Title is required');
      return;
    }
    // if (!this.state.krprogress) {
    //   alert('KR progress is required');
    //   return;
    // }
    // if (!this.state.krdate) {
    //   alertify.error('Key Result date is required');
    //   return;
    // }

    this.objId = ID;
    let keyresult = {
      Title: this.state.krtitle,
      // ProgressType: this.state.selectedType ? this.state.selectedType : 'Percentage',
      ProgressType: 'Percentage',
      Progress: 100,//parseInt(this.state.krprogress),
      // Date: this.state.krdate,
      ObjectiveID: this.objId,
    };
    if (!keyresult.Progress) {
      keyresult.Progress = 100;
    }

    if (this.objId != null && this.objId != undefined && this.objId != 0) {
      keyresult["Logs"] = 'Key Result Created On : ' + new Date() + '\nCreted by : ' + this.state.userMail + '\n\n';
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
            .filter("ObjectiveID eq '" + this.objId + "'")
            .get()
            .then((items: any[]) => {
              var avg = this.getKeyResultAvg(items);
              sp.web.lists
                .getByTitle(this.listName)
                .items.getById(this.objId)
                .update({ Progress: avg })
                .then((rs) => {
                  this.handleObjRefresh();
                  this.handlekeyRefresh();
                });
            });

          // this.handlekeyRefresh();
        })
        .catch((error: any[]) => {
          console.log(error);
        });
    }
  }
  public handleSliderChange = (event, value) => {
    this.value = value;
    alertify.success(value);
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



  public render(): React.ReactElement {
    // var that = this;
    //var val = this.state.keyresults;
    var myval = this.state.menu.length;

    

    return (
      <div>
        <Card square={true} elevation={0}>
          {this.state.isHidden ? (
            <div className={"pageTitle"}>
              <div className="title-progress">
                <h3 className={"nomargin"}>Completed Objectives</h3>
              </div>

              <div className="button-head-group">
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  disableElevation
                  startIcon={<VisibilityIcon />}
                  onClick={this.viewOngoingObjective.bind(this)}
                >
                  Ongoing Objectives
                </Button>
              </div>
            </div>
          ) : (
              ""
            )}

          {this.state.isHidden
            ? this.state.objectives.length > 0 &&
            this.state.objectives.map((item, index) => {
              if (item.isCompleted) {

                var currentDate = moment(new Date());
                var objdate = moment(item.completiondate);
                var days = objdate.diff(currentDate, "days");
                var className = "fdate";
                // if (days < 0) {
                //   className = "pendingdate";
                // } else if (days <= 7) {
                //   className = "pendingdate-yellow";
                // }

                return (
                  <div>
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
                            <label>Completed Date : </label>
                            <span>{item.CompletedDate}</span>
                          </span>
                        </div>
                        {/* <div className="date-finished">
                          <span className="secondary02">
                            <label>Quarter</label>
                            <span >{item.quarter}</span>
                          </span>
                        </div> */}
                      </AccordionSummary>

                      <AccordionDetails className="accordion-details">
                        {this.state.keyresults.map((kr) => {
                          if (kr.objId == item.id) {
                            var currentDate = moment(kr.krdate);
                            var objdate = moment(kr.lastupdateddate);
                            var days = objdate.diff(currentDate, "days");
                            var className = "date-finished";
                            if (days < 0) {
                              className = "pendingdate";
                            } else if (days <= 7) {
                              className = "pendingdate-yellow";
                            }

                            return (
                              <ListItem>
                                <ListItemText>{kr.title}</ListItemText>

                                <FormControlLabel
                                  className="accordionFormControl"
                                  aria-label="Acknowledge"
                                  onClick={(event) => event.stopPropagation()}
                                  onFocus={(event) => event.stopPropagation()}
                                  control={
                                    <div className="accordion-progressbar">
                                      <LinearProgress
                                        variant="determinate"
                                        value={100}
                                      />
                                    </div>
                                  }
                                  label=""
                                />
                                 <h4 className="text-primary"> {kr.progress ? Math.round(parseFloat(kr.progress)) : 0}%</h4>

                                {/* <div className="date-finished">
                                  <span className={className}>
                                    <label>Completed Date</label>
                                    <span>
                                      {kr.lastupdateddate}
                                    </span>
                                  </span>
                                </div>

                                <div className="date-finished">
                                  <span className="fdate"><label>Due Date : </label>
                                    <span>{kr.krdate}</span>
                                  </span>
                                </div> */}

                                {/* <div className="date-finished">
                                  <span className="secondary02">
                                    <label>Quarter</label>
                                    <span>{kr.quarter}</span>
                                  </span>

                                </div> */}

                              </ListItem>
                            );
                          }
                        })}
                      </AccordionDetails>
                    </Accordion>
                  </div>
                );
              }
            })
            : ""}

          {!this.state.isHidden && (
            <CardContent>
              <div className={"pageTitle"}>
                <div className="title-progress">
                  <h3 className={"nomargin"}>Ongoing Objectives</h3>

                  <div className="progressbar">
                    <LinearProgress
                      variant="determinate"
                      value={this.state.objectivePercentage}
                    />
                  </div>
                  <h4 className="text-primary"> {this.state.objectivePercentage ? Math.round(parseFloat(this.state.objectivePercentage)) : 0}%</h4>

                </div>
                <div className="button-head-group">
                  <Button
                    variant="contained"
                    color="secondary"
                    className="MuiButton-containedSecondary-02"
                    size="small"
                    disableElevation
                    startIcon={<AddIcon />}
                    onClick={this.handleAddObj.bind(this)}
                  >
                    Add Objective
                  </Button>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    disableElevation
                    startIcon={<VisibilityIcon />}
                    onClick={this.viewObjective.bind(this)}
                  >
                    Completed Objectives
                  </Button>
                </div>
              </div>

              <div className="OnGoingObject">
                {this.state.objectives.length > 0 &&
                  this.state.objectives.map((item, index) => {
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

                            {<FormControlLabel
                              className="accordionFormControl"
                              aria-label="Acknowledge"
                              onClick={(event) => event.stopPropagation()}
                              onFocus={(event) => event.stopPropagation()}
                              control={
                                <div className="accordion-progressbar">


                                  <LinearProgress
                                    variant="determinate"
                                    value={item.progress}
                                  />
                                </div>

                              }
                              label=""
                            />}




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

                              {
                                item.progress
                                  ? ((Math.round(parseFloat(item.progress)) == 100 && !item.isCompleted) ?
                                    <IconButton
                                      className="button-sm"
                                      color="primary"
                                      onClick={(e) => this.setCompleteObj(item)}
                                    >
                                      <PublishIcon /> 
                                    </IconButton>
                                    : "")
                                  : ""
                              }

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
                            {
                              this.state.keyresults.length > 0 ? (
                                <OkrList
                                  objective={item}
                                  keyresults={this.state.keyresults}
                                  refresh={this.handleObjRefresh}
                                  refreshkey={this.handlekeyRefresh}
                                ></OkrList>
                              ) : null}

                            {this.state.itemID == item.id ? (
                              this.state.showfields ? (
                                <div className="create-key-containers">
                                  <section className="create-keyValues">
                                    <Grid container spacing={5}>
                                      <Grid item xs={6}>
                                        <TextField
                                        value={this.state.krtitle}
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
                                        onClick={(e) =>
                                          this.setState({krtitle:""})
                                        }
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
                                <Grid container className="mt-4">
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
            </CardContent>
          )}
        </Card>

        <Dialog open={this.state.showhide} className="modalPopupObjective">
          <DialogContent>
            <HorizontalLinearStepper

              dialogOpen={this.handleDialog}
              refresh={this.handleObjRefresh}
              refreshkey={this.handlekeyRefresh}
            ></HorizontalLinearStepper>
          </DialogContent>
        </Dialog>
        <Dialog open={this.state.editObjective} className="modalPopupObjective">
          <DialogContent>
            <EditObjective
              handleClose={this.closeEditObj}
              item={this.state.item}
            ></EditObjective>
          </DialogContent>
        </Dialog>
        <Dialog
          open={this.state.deleteObjective}
          className="modalPopupObjective"
        >
          <DialogContent>
            <DeleteObjective
              handleClose={this.closeDeleteObj}
              item={this.state.item}
            ></DeleteObjective>
          </DialogContent>
        </Dialog>
      </div>
    );
  }
}
