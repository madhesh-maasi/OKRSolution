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
  Checkbox,
  MenuItem
} from "@material-ui/core";

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
import { IObjective, IEditObj } from "./IOkrProps";
import "alertifyjs";
import '../../../ExternalRef/CSS/alertify.min.css';
var alertify: any = require("../../../ExternalRef/JS/alertify.min.js");
const formContainer = {
  display: "flex",
  flexFlow: "row wrap",
};
 
var moment: any = require("moment");

const style = {
  display: "flex",
  justifyContent: "center",
};

class EditObjective extends React.Component<IEditObj, any> {
  constructor(props) {
    super(props);
    this.state = {
      objectives: [] as IObjective[],
      title: "",
      description: "",
      predefinedObjectives: [],
    };
    alertify.set("notifier", "position", "top-right");
    console.log(props);

    this.loadPredefinedObjectives();
  }

  //objectives variables declaration
  private objId: number = 0;
  private listName = "Objectives";
  private objArray = [];
  public save = (e) => {
    e.preventDefault();
    this.editObjective();
    //this.props.handleStateChange(false);  
  }

  public componentDidMount() {
    this.loadPredefinedObjectives();
  }
  public setObjective() {
    if (this.props.item != null && this.props.item != undefined) {
      let object = this.props.item;
      this.setState({ IsPrivate: object.IsPrivate, PredefinedObjectivesId: object.PredefinedObjectivesId });
      this.setState({ title: object.title });
      this.setState({ description: object.description });
      this.setState({ completiondate: moment(new Date(object.completiondate)).format("YYYY-MM-DD") });
      this.setState({ isPredefined: object.isPredefined });
      this.setState({ Logs: object.Logs });

      this.objId = object.id;
    }
  }

  public loadPredefinedObjectives = () => {
    sp.web.lists.getByTitle("PredefinedObjectives").items
      .get()
      .then((items: any[]) => {
        // this.setState({ PredefinedObjectivesId: 5 });
        this.setState({ predefinedObjectives: items });
        

        this.setObjective();

      });
  }

  public handlePrivate = (event) => {
    this.setState({ IsPrivate: !event.target.checked });
  }

  public setPredefinedObjective = (event) => {
    this.setState({ PredefinedObjectivesId: event.target.value });
  }

  public editObjective() {
    if (!this.state.PredefinedObjectivesId) {
      alertify.error('Base Objective is required');
      return false;
    }
    if (!this.state.title) {
      alertify.error('Title is required');
      return;
    }
    if (!this.state.completiondate) {
      alertify.error('Completion date is required');
      return;
    }
    let objective = {
      PredefinedObjectivesId: this.state.PredefinedObjectivesId,
      IsPrivate: this.state.IsPrivate,
      Title: this.state.title,
      Description: this.state.description,
      CompletionDate: this.state.completiondate,
      Logs: this.state.Logs + 'Objective result edited on : ' + new Date() + '\n\n'
    };
    ApiService.edit(this.listName, objective, this.objId)
      .then((item: any) => {
        console.log(item, "edit Objectives success");
        alertify.success("Objective updated successfully");
        this.props.handleClose(false);
      })
      .catch((error: any[]) => {
        console.log(error);
      });
  }

  public onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  public ondateChange = (e) => {
    this.setState({ completiondate: e.target.value });
  }

  public handleClose = (event) => {
    this.props.handleClose(false);
  }
  public render() {
    var _data = this;

    return (
      <div>
        <div>
          {" "}
          <h3>Edit Objective</h3>


          <FormControl variant="outlined" fullWidth className="form-group" size="small">
            <InputLabel id="standard-select-currency" >Base Objectives</InputLabel>
            <Select
              fullWidth
              labelId="standard-select-currency"
              id="standard-select-currency"
              onChange={this.setPredefinedObjective}
              value={this.state.PredefinedObjectivesId?this.state.PredefinedObjectivesId:""}
              label="Predefined Objectives"
            >
              {
                this.state.predefinedObjectives.map((data) => {
                  return (
                    <MenuItem value={data.Id}>{data.Title}</MenuItem>
                  );
                })
              }
            </Select>
          </FormControl>

          <FormControlLabel
            control={<Checkbox color="primary" name="checkedB" checked={!this.state.IsPrivate} onChange={(e) => this.handlePrivate(e)} />}
            label="Public"
          />

          <TextField
            autoFocus
            name="title"
            label="Title"
            type="text"
            value={_data.state.title}
            onChange={this.onChange}
            fullWidth
            variant="outlined"
            size="small"
          />
          <TextField
            name="description"
            label="Description"
            type="text"
            fullWidth
            multiline
            onChange={this.onChange}
            value={_data.state.description}
            rowsMax={4}
            variant="outlined"
            size="small"
          />

          <TextField
            autoFocus
            name="krdate"
            id="date"
            label="Select Date"
            type="date"
            fullWidth
            variant="outlined"
            size="small"
            value={_data.state.completiondate}
            onChange={this.ondateChange}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <div className="button-group">
            <Button
              variant="contained"
              color="primary"
              onClick={this.save}
              disableElevation
              size="small"
            >
              Submit
          </Button>
            <Button

              variant="contained"
              color="secondary"
              onClick={this.handleClose}
              disableElevation
              size="small"
            >
              Cancel
          </Button>
          </div>
        </div>
      </div>
    );
  }
}
export default EditObjective;
