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
  Checkbox,
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
import { IKeyResult, IEditKeyResult } from "./IOkrProps";
import "alertifyjs";
import '../../../ExternalRef/CSS/alertify.min.css';
var alertify: any = require("../../../ExternalRef/JS/alertify.min.js");
var moment: any = require("moment");


const formContainer = {
  display: "flex",
  flexFlow: "row wrap",
};

const style = {
  display: "flex",
  justifyContent: "center",
};

class EditKeyResult extends React.Component<IEditKeyResult, any> {
  constructor(props) {
    super(props);
    this.state = {
      krtitle: "",
      krprogress: 0,
      progressType: [],
      krdate: new Date(""),
      selectedType: "",
    };
    alertify.set("notifier", "position", "top-right"); 

    sp.web.currentUser.get().then((userdata) => {
      this.setState({ userdata: userdata });
    });

  }

  //keyresult variables declaration
  private krId: number = 0;
  private krlistName = "KeyResults";

  public savekeyresult = (e) => {
    e.preventDefault();
    this.editkeyresult();
    //this.props.handleStateChange(false);
  }

  public close = (e) => {
    e.preventDefault();
    //this.props.handleStateChange(false);
  }
  public handleClose = (event) => {
    this.props.handleClose(false);
  }
  public componentDidMount() {
    this.setKeyResult();
  }
  public componentWillMount() {
    ApiService.gettype(this.krlistName).then(
      (items: any) => {
        if (items != null && items != undefined && items.Choices.length > 0) {
          let choice = items.Choices;
          this.setState({ progressType: choice });
          // this.setState({ selectedType: choice[0] });
        }
      },
      (error) => {
        console.log(error);
      }
    );

  }

  public setKeyResult() {

    if (this.props.item != null && this.props.item != undefined) {
      let object = this.props.item;

      this.setState({ krtitle: object.title, krprogress: object.progress, selectedType: object.progressType, Logs: object.Logs });
      this.setState({
        krdate:
          object.krdate ? moment(new Date(object.krdate)).format("YYYY-MM-DD") : "",
      });
      this.krId = object.id;
    }
  }
  public editkeyresult() {
    var keyresult = {
      Title: this.state.krtitle,
      ProgressType: 'Percentage',
      Progress: 100, //parseInt(this.state.krprogress),
      // Date: this.state.krdate,
      LastUpdatedDate: new Date(),
      Logs: this.state.Logs + 'Key result edited on : ' + new Date() + '\nCreted by : ' + this.state.userdata.Email + '\n\n'
    };
    if (this.props.item.progressType != this.state.selectedType) {
      keyresult["CurrentProgress"] = 0;
    }
    if (this.props.item.progress != keyresult["Progress"]) {
      keyresult["CurrentProgress"] = 0;
    }
    if (this.state.selectedType == 'Percentage') {
      keyresult.Progress = 100;
    }

    if (!keyresult.Title) {
      alertify.error('Title is required');
      return false;
    }
   
    // if (!keyresult.Date) {
    //   alertify.error('Key Result date is required');
    //   return false;
    // }


    ApiService.edit(this.krlistName, keyresult, this.krId)
      .then((item: any) => {

        this.props.handleClose(false);
        alertify.success("Key Result updated successfully");
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

  public handleProgressType = (event) => {
    var selectedType = 'Percentage';
    if (event.target.checked) {
      selectedType = 'Numeric';
    }
    this.setState({ selectedType: selectedType });
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


  public onChange = (e) => this.setState({ [e.target.name]: e.target.value });
  public onChangeType = (e) => this.setState({ selectedType: e.target.value });
  public ondateChange = (e) => {
    this.setState({ krdate: e.target.value });
  }
  public render() {
    var _data = this;

    return (
      <div>
        <h3>Edit Key Result</h3>
        <form>
          <TextField
            autoFocus
            id="krtitle"
            name="krtitle"
            label="Title"
            type="text"
            fullWidth
            onChange={this.onChange}
            value={_data.state.krtitle}
            size="small"
            variant="outlined"
          />


          {/* <InputLabel htmlFor="filled-age-native-simple">
            Progress Type
          </InputLabel>
          <Select
            native
            name="selectedType"
            value={_data.state.selectedType}
            onChange={this.onChangeType}
            inputProps={{
              id: "filled-age-native-simple",
            }}
          >
            {_data.state.progressType.length > 0 &&
              _data.state.progressType.map((item, i) => {
                return <option value={item}>{item}</option>;
              })}
          </Select> */}

          {/* <FormControlLabel
            control={<Checkbox color="primary" name="checkedB" checked={this.state.selectedType == 'Numeric'} onChange={(e) => this.handleProgressType(e)} />}
            label="Is Number"
          />

          {
            this.state.selectedType == 'Numeric' &&
            <TextField
              autoFocus
              name="krprogress"
              id="krprogress"
              label="Select Number"
              type="number"
              fullWidth
              onChange={this.onChange}
              value={_data.state.krprogress}
            />
          } */}

          {/* <Grid lg={12}>

            <TextField
              autoFocus
              name="krdate"
              id="date"
              label="Select Date"
              type="date"
              fullWidth
              variant="outlined"
              size="small"
              value={_data.state.krdate}
              onChange={this.ondateChange}
              InputLabelProps={{
                shrink: true,
              }}
            />
          </Grid> */}

          <div className="button-group">
            <Button
              variant="contained"
              color="primary"
              onClick={this.savekeyresult}
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
        </form>
      </div>
    );
  }
}
export default EditKeyResult;
