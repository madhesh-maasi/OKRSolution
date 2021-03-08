import TextField from "@material-ui/core/TextField";

import Input from '@material-ui/core/Input';
import * as React from "react";
import { useState, useEffect } from "react";
import { makeStyles, Theme, createStyles } from "@material-ui/core/styles";
import { sp } from "@pnp/sp";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/webs";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemAvatar from "@material-ui/core/ListItemAvatar";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import ListItemText from "@material-ui/core/ListItemText";
import Avatar from "@material-ui/core/Avatar";
import IconButton from "@material-ui/core/IconButton";
import FormGroup from "@material-ui/core/FormGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Checkbox from "@material-ui/core/Checkbox";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import FolderIcon from "@material-ui/icons/Folder";
import LinearProgress from "@material-ui/core/LinearProgress";
import CreateIcon from "@material-ui/icons/Create";
import DeleteIcon from "@material-ui/icons/Delete";
import DoneIcon from '@material-ui/icons/Done';
import { Slider } from "@material-ui/core";
//import KRDialogComponent from "./KRDialog";
import EditKeyResult from "./EditKeyResult";
import DeleteKeyResult from "./DeleteKeyResult";

import Button from "@material-ui/core/Button";

import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";

import ApiService from "../../../services/ApiService";
var moment: any = require("moment");
const useStyles = makeStyles((theme: Theme) =>
  createStyles({ 
    root: {
      flexGrow: 1,
      maxWidth: 752,
    },
    demo: {
      backgroundColor: theme.palette.background.paper,
    },
    title: {
      margin: theme.spacing(4, 0, 2),
    },
  })
);

function valuetext(value: number) {
  return `${value}`;
}

export default function OkrList(props) {
  const classes = useStyles();
  const [dense, setDense] = React.useState(false);
  const [value, setValue] = React.useState<number>(0);
  const [editKeyResult, seteditKeyResult] = React.useState(false);
  const [deleteKeyResult, setdeleteKeyResult] = React.useState(false);
  const [kr, setkr] = React.useState<any>();

  const [openwarnmsg, setopenwarnmsg] = React.useState(false);
  const [processObj, setprocessObj] = React.useState({});

  const [krId, setkrId] = React.useState<number>();
  const [objId, setobjId] = React.useState<number>();


  var [krset, setkrlist] = React.useState<any>((val) => {
    console.log(val);
    return val != null && val != undefined ? val : props.keyresults;
  });

  const handleChange = (newValue, kr, i) => {
    kr.currentProgress = newValue;
    // var values = that;
    // values[i].currentProgress = newValue;
    // setkrlist(values);
  };
  var that = props.keyresults;
  krset=props.keyresults;

  const inChange = (newValue, kr) => {

  }
  const handleChangeCommit = (newValue, kr) => {
    // let krId = kr.id;
    // let krAry = [];
    // let kritem = [
    //   {
    //     Title: kr.title,
    //     ObjectiveID: kr.objId,
    //     ProgressType: kr.progressType,
    //     Progress: newValue,
    //   },
    // ];
    // let krobj = [
    //   {
    //     title: kr.title,
    //     CurrentProgress: newValue,
    //     id: kr.id,
    //     objId: kr.objId,
    //     progressType: kr.progressType,
    //   },
    // ];
    // let items = [...props.keyresults];

    // krAry = items.filter((x) => x.objId === props.objective.id); //filter key result by obj id

    // let index = krAry
    //   .map(function (el) {
    //     return el.id;
    //   })
    //   .indexOf(krId);
    // let itemindex = items
    //   .map(function (el) {
    //     return el.id;
    //   })
    //   .indexOf(krId);
    // items.splice(itemindex, 1, krobj[0]);
    // krAry.splice(index, 1, krobj[0]);

    // getAvgProg(krAry);
    // updateprogress(kritem[0], krId);

    let krId = kr.id;
    let krAry = [];
    let items = [...props.keyresults];
    krAry = items.filter((x) => x.objId == props.objective.id);

    var currentkrindex = -1;
    for (let index = 0; index < krAry.length; index++) {
      const element = krAry[index];
      if (element.id == krId) {
        currentkrindex = index;
        break;
      }
    }

    krAry[currentkrindex].currentProgress = newValue;
    var newObj = {
      Title: kr.title,
      ObjectiveID: kr.objId,
      ProgressType: kr.progressType,
      Progress: kr.progress,
      CurrentProgress: newValue,
      LastUpdatedDate: new Date(),
    };
    var avg = getAvgProg(krAry);

    if (avg == 100) {
      setprocessObj({
        objId: props.objective.id,
        avg: avg,
        newObj: newObj,
        krId: krId,
      });
      setopenwarnmsg(true);
    } else {
      updateobject(props.objective.id, avg);
      updateprogress(newObj, krId);
    }
  };

  const openEditKey = (kr) => {
    seteditKeyResult(true);
    setkr(kr);
  };
  const openDeleteKey = (kr) => {
    setdeleteKeyResult(true);
    setkr(kr);
  };
  function updateprogress(kr, krId) {
    ApiService.edit("KeyResults", kr, krId)
      .then((item: any) => {
        console.log("keyresult updated success");
        getkeyResults();
        props.refreshkey();
        // alert("keyresult updated success");
      })
      .catch((error: any[]) => {
        console.log(error);
      });
  }
  function getAvgProg(newset) {
    var progress = 0;
    var avg = 0;
    if (newset.length > 0) {
      for (let i = 0; i < newset.length; i++) {
        var value = newset[i].currentProgress;
        if (!value) {
          value = 0;
        }
        var average = (value / newset[i].progress) * 100;
        progress = progress + average;
      }
      avg = Math.round(progress / newset.length);
      console.log(avg);
      return avg;
    }
  }

  function getkeyResults() {
    let krArray = [];
    let list = sp.web.lists.getByTitle("KeyResults");
    list.items
      .get()
      .then((items: any[]) => {
        if (items.length > 0) {
          for (let i = 0; i < items.length; i++) {
            var completeddate = moment(items[i].Date).format("DD-MMM-YYYY");
            krArray.push({
              title: items[i].Title,
              progress: items[i].Progress,
              id: items[i].Id,
              objId: items[i].ObjectiveID,
              progressType: items[i].ProgressType,
              krdate: completeddate,
              lastupdateddate: items[i].LastUpdatedDate,
              currentProgress: items[i].CurrentProgress
                ? items[i].CurrentProgress
                : 0,
              quarter:
                "Q" +
                Math.floor((new Date(items[i].Created).getMonth() + 3) / 3) +
                "-" +
                new Date(items[i].Created).getFullYear(),
            });
          }

          setkrlist(krArray);
          console.log(krArray, "keyresults");
        }
      })
      .catch((error: any[]) => {
        console.log(error);
      });
  }
  function updateobject(Id, avg, completed = false) {
    let objective = {
      Progress: avg != null && avg != undefined ? avg : 0,
      IsCompleted: completed,
      CompletedDate:completed?new Date():null
    };
    ApiService.edit("Objectives", objective, Id)
      .then((item: any) => {
        console.log("Objectives updated success");
        //  alert("Objectives updated success");
        props.refresh();
      })
      .catch((error: any[]) => {
        console.log(error);
      });
  }
  function handleKeyRefresh() {
    console.log("refresh");
    getkeyResults();
  }

  function closeWarnMsg() {
    updateobject(processObj["objId"], processObj["avg"]);
    updateprogress(processObj["newObj"], processObj["krId"]);
    setopenwarnmsg(false);
  }

  function processCompletion() {
    updateobject(processObj["objId"], processObj["avg"], true);
    updateprogress(processObj["newObj"], processObj["krId"]);
    setopenwarnmsg(false);
  }

  const closeEditKey = () => {
    seteditKeyResult(false);
  };
  const closeDeleteKey = () => {
    setdeleteKeyResult(false);
  };

  const handleInputChange = (event) => {
    // var id = event.target.id;
    // var value = event.target.value;
    // if (value && parseInt(value) <= 100) {
    //   if (id) {
    //     that[parseInt(id)].currentProgress = value;
    //   }
    //   setkrlist(that);
    // }
  };

  const updateKRPercent = (event) => {
    debugger;
  };


  const handleInputChangeBlur = (event) => {
    var eid=event.currentTarget.id;
    
    
    var value = (document.getElementById(eid) as HTMLInputElement).value;
    if (value && parseInt(value) <= 100) {
      handleChangeCommit(parseInt(value), that[parseInt(event.currentTarget.id)]);
    }
  };

  var that = props.keyresults; // krset;

  var objID =
    props.objective != null && props.objective != undefined
      ? props.objective.id
      : 0;
  //   console.log('krset',krset);

  return (
    <div>
      <List>
        {krset.map((kr, i) => {
          var currentDate = moment(new Date());
          var objdate = moment(kr.krdate);
          var days = objdate.diff(currentDate, "days");
          var className = "fdate";
          if (days < 0) {
            className = "pendingdate";
          } else if (days <= 7) {
            className = "pendingdate-yellow";
          }

          return objID != 0 && kr.objId == objID ? (
            <ListItem>
              {/* <ListItemAvatar className="custom-avator">
                <div className="icon-circle">BE</div>
              </ListItemAvatar> */}
              <ListItemText>{kr.title}</ListItemText>
              <div className="accordion-slider-flex">
                <div className="accordion-slider">
                  <Slider
                    valueLabelDisplay="auto"
                    value={kr.currentProgress}
                    min={0}
                    max={kr.progress}
                    onChangeCommitted={(e, val) => handleChangeCommit(val, kr)}
                    onChange={(e, val) => handleChange(val, kr, i)}
                    aria-labelledby="input-slider"
                  />


                </div>
                {/* <Typography component="h4" className="text-primary">
                  {kr.currentProgress}
                </Typography> */}
              </div>


              <div>

                <TextField
                  className="krInput"
                  id={i + ''}
                  //  onChange={handleInputChange}
                  //  onBlur={handleInputChangeBlur}
                  type="number" //number
                  InputLabelProps={{
                    shrink: true
                  }}
                  InputProps={{ inputProps: { min: 0, max: 10 } }}
                  placeholder={kr.currentProgress}
                />
                <IconButton className="buttonDone"  >
                  <DoneIcon  id={i + ''} onClick={handleInputChangeBlur} />
                </IconButton>
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

              <div className="button-right">
                <IconButton
                  className="button-sm"
                  color="primary"
                  onClick={(e) => openEditKey(kr)}
                >
                  <CreateIcon />
                </IconButton>
                <IconButton
                  className="button-sm"
                  onClick={(e) => openDeleteKey(kr)}
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            </ListItem>
          ) : null;
        })}
      </List>
      <Dialog open={editKeyResult} className="modalPopupObjective">
        <DialogContent>
          <EditKeyResult
            refreshList={props.refreshkey}
            refresh={props.refresh}
            handleClose={closeEditKey}
            item={kr}
          ></EditKeyResult>
        </DialogContent>
      </Dialog>
      <Dialog open={deleteKeyResult} className="modalPopupObjective">
        <DialogContent>
          <DeleteKeyResult
            refreshList={props.refreshkey}
            refresh={props.refresh}
            handleClose={closeDeleteKey}
            item={kr}
          ></DeleteKeyResult>
        </DialogContent>
      </Dialog>

      <Dialog
        open={openwarnmsg}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Warning"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you want to mark this objective as complete ?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button size="small" variant="contained"  onClick={closeWarnMsg}>
            No
          </Button>
          <Button size="small" color="primary" variant="contained" onClick={processCompletion}  autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>


    </div>
  );
}
