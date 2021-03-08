import * as React from "react";
import { Component } from "react";
//import ReactDOM from 'react-dom';
import ApiService from "../../../services/ApiService";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import NativeSelect from "@material-ui/core/NativeSelect";


import { sp } from "@pnp/sp";
import "@pnp/sp/fields";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/site-users";
import "@pnp/sp/webs";

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
  DialogContentText,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
} from "@material-ui/core";
import InputAdornment from "@material-ui/core/InputAdornment";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import { Pivot, PivotItem } from "office-ui-fabric-react/lib/Pivot";
import Tooltip from "@material-ui/core/Tooltip";
import ClickAwayListener from "@material-ui/core/ClickAwayListener";
import CloseIcon from "@material-ui/icons/Close";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormLabel from "@material-ui/core/FormLabel";
import { IKeyResult, IDeleteKeyResult } from "./IOkrProps";
import "alertifyjs";
import '../../../ExternalRef/CSS/alertify.min.css';
var alertify: any = require("../../../ExternalRef/JS/alertify.min.js");
class DeleteKeyResult extends React.Component<IDeleteKeyResult, any> {
  constructor(props) {
    super(props);

    this.state = {
    };
    console.log(props);
    alertify.set("notifier", "position", "top-right"); 

  }

  //keyresult variables declaration
  private krId: number = 0;
  private krlistName = "KeyResults";

  delete = (e) => {
    e.preventDefault();
    this.deleteResult();
    //this.props.handleStateChange(false);
  };

  closedelete = () => {
    this.props.handleClose(false);
  }

  handleClose = (event) => {
    this.props.handleClose(false);
  };
  close = (e) => {
    this.props.handleClose(false);
    // console.log(this.state.movieSelected);
  };
  componentDidMount() {
    this.setKeyResult();
  }
  setKeyResult() {
    if (this.props.item != null && this.props.item != undefined) {
      let object = this.props.item;

      this.krId = object.id;
    }
  }

  deleteResult() {
    ApiService.delete(this.krlistName, this.krId)
      .then((_) => {
        this.handleClose(null);
        alertify.success("Key Result deleted successfully");

        let list = sp.web.lists.getByTitle(this.krlistName);
        list.items
          .filter("ObjectiveID eq '" + this.props.item.objId + "'")
          .get()
          .then((items: any[]) => {
            var avg = this.getKeyResultAvg(items);
            sp.web.lists.getByTitle("Objectives").items.getById(parseInt(this.props.item.objId)).update({ Progress: avg }).then(rs => {
              this.props.refreshList();
              this.props.refresh();
            });
          });

      })
      .catch((error: any[]) => {
        console.log(error);
      });
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
        var average = ((value / newset[i].Progress) * 100);
        progress = progress + average;
      }
      avg = Math.round(progress / newset.length);
      console.log(avg);
      return avg;
    }
  }

  render() {
    var _data = this;

    return (
      <div>
        {/* <DialogContentText id="alert-dialog-description">
          Are you sure want to delete ?
            </DialogContentText>

        <Button
          variant="contained"
          color="primary"
          onClick={this.delete}
          disableElevation
          size="small"
        >
          Cancel
            </Button> */}


        <Dialog
          open={true}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{"Warning"}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure want to delete ?
          </DialogContentText>
          </DialogContent>
          <DialogActions>
            {/* <Button onClick={this.closedelete}>
              No
          </Button>
            <Button onClick={this.delete} color="secondary" autoFocus>
              Yes
          </Button> */}
          <Button size="small" variant="contained" onClick={this.closedelete}>
              No
          </Button>
            <Button size="small" color="primary" variant="contained" onClick={this.delete} autoFocus>
              Yes
          </Button>
          </DialogActions>
        </Dialog>



      </div>
    );
  }
}
export default DeleteKeyResult;
