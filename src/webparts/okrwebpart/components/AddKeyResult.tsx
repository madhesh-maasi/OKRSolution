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
  Checkbox,
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
import { IObjective, IKeyResult, IAddKey } from "./IOkrProps";
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

class AddKeyResult extends React.Component<IAddKey, any> {
  constructor(props) {
    super(props);
    this.state = {
      objectives: [] as IObjective[],
      showkrform: true,
      title: "",
      description: "",
      krtitle: "",
      krprogress: 0,
      krprogressType: "",
      krdate: "",
      krtype: false,

      selectedType: "",
      userdata: {}
    };

    sp.web.currentUser.get().then((userdata) => {
      this.setState({ userdata: userdata });
    });
    alertify.set("notifier", "position", "top-right"); 
    console.log(props);
  }

  //keyresults variables declaration
  private krlistName = "KeyResults";
  private krId: number;
  private krArray = [];
  private KeyResult: IKeyResult;
  //objectives variables declaration
  private objId: number = 0;
  private listName = "Objectives";

  public componentWillMount() {
    ApiService.gettype(this.krlistName).then(
      (items: any) => {
        if (items != null && items != undefined && items.Choices.length > 0) {
          let choice = items.Choices;
          this.setState({ progressType: choice });
          this.setState({ selectedType: choice[0] });
        }
      },
      (error) => {
        console.log(error);
      }
    );

  }


  public resetFields() {
    this.setState({
      krtitle: "",
      krprogress: 0,
      krprogressType: "",
      krdate: "",
      progressType: [],
    });
    ApiService.gettype(this.krlistName).then(
      (items: any) => {
        if (items != null && items != undefined && items.Choices.length > 0) {
          let choice = items.Choices;
          this.setState({ progressType: choice });
          this.setState({ selectedType: choice[0] });
        }
      },
      (error) => {
        console.log(error);
      }
    );
  }
  public addKeyResult(ID, callback) {
    this.objId = ID;
    let keyresult = {
      Title: this.state.krtitle,
      ProgressType: 'Percentage',
      Progress: 100,// parseInt(this.state.krprogress),
      // Date: this.state.krdate,
      ObjectiveID: this.objId,
    };
    if (!this.state.showtxtNumber) {
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


    console.log(keyresult);
    if (this.objId != null && this.objId != undefined && this.objId != 0) {
      // var calcprogress = 4;// this.selectedType == 'Percentage' ? this.krprogress : this.krprogress / 100;
      keyresult["Logs"] = 'Key Result Created On : ' + new Date() + '\nCreted by : ' + this.state.userdata.Email + '\n\n';
      ApiService.add(this.krlistName, keyresult)

        .then((result) => {


          alertify.success("Key Result added successfully");

          let list = sp.web.lists.getByTitle(this.krlistName);
          list.items
            .filter("ObjectiveID eq '" + this.objId + "'")
            .get()
            .then((items: any[]) => {
              var avg = this.getKeyResultAvg(items);
              sp.web.lists.getByTitle(this.listName).items.getById(this.objId).update({ Progress: avg }).then(rs => {
                this.props.refresh(true);
                this.props.refreshkey();
              });
              callback(true);
            });

        })
        .catch((error: any[]) => {
          console.log(error);
          callback(false);
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
        var average = ((value / newset[i].Progress) * 100);
        progress = progress + average;
      }
      avg = Math.round(progress / newset.length);
      console.log(avg);
      return avg;
    }
  }


  public handleKRType = (event) => {
    this.setState({
      showtxtNumber: event.target.checked,
      krprogress: 0,
      selectedType: event.target.checked ? 'Numeric' : 'Percentage'
    });
  }
  public onChange = (e) => this.setState({ [e.target.name]: e.target.value });
  //onChangeType = (e) => this.setState({ selectedType:e.target.value});
  public ondateChange = (e) => this.setState({ krdate: e.target.value });
  public render() {
    var that = this;

    return (
      <div>
        <h3>Add Key Result</h3>
        <TextField
          autoFocus
          id="krtitle"
          name="krtitle"
          label="Title"
          type="text"
          fullWidth
          onChange={this.onChange}
          value={that.state.krtitle}
          size="small"
          variant="outlined"
        />

        {/* <FormControlLabel
          control={<Checkbox color="primary" name="checkedB" onChange={(e) => this.handleKRType(e)} />}
          label="Is Number"
        />
        {
          this.state.showtxtNumber ?
            <TextField
              autoFocus
              name="krprogress"
              id="krprogress"
              label="Select Number"
              type="number"
              onChange={this.onChange}
              fullWidth
              value={that.state.krprogress}
              size="small"
              variant="outlined"
            />
            : ''
        } */}

        {/* <TextField
          autoFocus
          name="krdate"
          id="krdate"
          label="Select Date"
          type="date"
          fullWidth
          onChange={this.ondateChange}
          value={that.state.krdate}
          size="small"
          variant="outlined"
          InputLabelProps={{
            shrink: true
          }}
        /> */}

        {/*<FormControl component="fieldset">
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
              <TextField autoFocus id="name" label="" type="date" fullWidth />
            </Grid>
          </Grid>
        </FormControl>*/}
      </div>
    );
  }
}
export default AddKeyResult;
