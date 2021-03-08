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
import { IObjective, IEditObj } from "./IOkrProps";
import "alertifyjs";
import '../../../ExternalRef/CSS/alertify.min.css';
var alertify: any = require("../../../ExternalRef/JS/alertify.min.js");
const formContainer = {
  display: "flex",
  flexFlow: "row wrap",
};

const style = {
  display: "flex",
  justifyContent: "center",
};

class DeleteObjective extends React.Component<IEditObj, any> {
  constructor(props) {
    super(props);
    this.state = {
      objectives: [] as IObjective[],
      title: "",
      description: "",
    };
    console.log(props);
    alertify.set("notifier", "position", "top-right"); 

  }

  //objectives variables declaration
  private objId: number = 0;
  private listName = "Objectives";
  private objArray = [];
  public delete = (e) => {
    e.preventDefault();
    this.deleteObjective();
    this.deleteKeyResult();
    //this.props.handleStateChange(false);
  }
  public handleClose = (event) => {
    this.props.handleClose(false);
  }
  public close = (e) => {
    this.props.handleClose(false);
    // console.log(this.state.movieSelected);
  }
  public componentDidMount() {
    this.setObjective();
  }
  public setObjective() {
    if (this.props.item != null && this.props.item != undefined) {
      let object = this.props.item;

      this.objId = object.id;
    }
  }

  public deleteObjective() {
    ApiService.delete(this.listName, this.objId)
      .then((_) => {
      
        this.props.handleClose(false);
        alertify.success("Objective deleted successfully");
        console.log("delete Objectives success");
      })
      .catch((error: any[]) => {
        console.log(error);
      });
  }
  public deleteKeyResult() {
    ApiService.deleteMultiple("KeyResults", this.objId)
      .then((_) => {
        this.props.handleClose(false);
        console.log("delete key result  Objectives success");
      })
      .catch((error: any[]) => {
        console.log(error);
      });
  }

  public render() {
    var _data = this;

    // return (
    //   <div>
    //     <div>
    //       <form>
    //         Are you sure want to delete?
    //         <div>
    //           <Button
    //             variant="contained"
    //             color="primary"
    //             onClick={this.delete}
    //             disableElevation
    //             size="small"
    //           >
    //             OK
    //           </Button>
    //         </div>
    //       </form>
    //     </div>
    //   </div>
    // );

    return (
      <div>
        <Dialog
          open={true}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">Delete Objective</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              Are you sure want to delete this Objective?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button size="small" onClick={this.delete} color="primary" variant="contained" disableElevation>
              Yes
            </Button>
            <Button size="small" onClick={this.handleClose} autoFocus variant="contained" disableElevation>
              No
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
export default DeleteObjective;
