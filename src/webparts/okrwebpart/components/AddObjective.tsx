import * as React from "react";
import { Component } from "react";
//import ReactDOM from 'react-dom';

import { sp } from "@pnp/sp";
import "@pnp/sp/fields";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/site-users";
import "@pnp/sp/webs";

import ApiService from "../../../services/ApiService";
import TextField from "@material-ui/core/TextField";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import NativeSelect from "@material-ui/core/NativeSelect";
import Autocomplete from '@material-ui/lab/Autocomplete';
import {
  Card,
  Checkbox,
  MenuItem,
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
import { IObjective, IKeyResult, IAddObj } from "./IOkrProps";
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


class AddObjective extends React.Component<{}, any> {
  constructor(props) {
    super(props);
    this.state = {
      objectives: [] as IObjective[],
      showkrform: true,
      title: "",
      description: "",
      krtitle: "",
      IsPrivate: true,

      krprogress: 0,
      krprogressType: "",
      progressType: [],
      completiondate: "",
      selectedType: "",
      predefinedObjectives: [],
      userPredefinedObj: false,
      userdata: {}
    };
    console.log(props);
    this.loadPredefinedObjectives();
    alertify.set("notifier", "position", "top-right");
    sp.web.currentUser.get().then((userdata) => {
      this.setState({ userdata: userdata });
    });

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
    console.log(this.state.progressType);
  }

  public loadPredefinedObjectives = () => {
    sp.web.lists.getByTitle("PredefinedObjectives")
      .items
      .get()
      .then((items: any[]) => {
        this.setState({ predefinedObjectives: items });
      });
  }

  /*handleClose = (event) => {
    this.props.handleClose(false);
  };*/
  public save = (e) => {
    e.preventDefault();
    this.addObjective();
    //this.props.handleStateChange(false);
  }
  /*savekeyresult = (e) => {
    e.preventDefault();
    this.addKeyResult(2);
  };
  close = (e) => {
    e.preventDefault();
  };
  showkeyform = () => {
    //e.preventDefault();
    this.setState({ showkrform: true });
  };*/
  public loadData(ID) {
    ApiService.getObjective(this.listName, ID).then((item: any) => {
      this.setState({
        Title: item.data.title,
        Description: item.data.description,
        CompletionDate: item.data.completiondate
      });
    });
  }

  public setObjective = (event) => {
    this.setState({ PredefinedId: event.target.value });
  }

  public handlePrivate = (event) => {
    this.setState({ IsPrivate: !event.target.checked });
  }

  public addObjective(callback?) {
    if (!this.state.PredefinedId) {
      alertify.error('Base Objective is required');
      return false;
    }
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
      IsPrivate: this.state.IsPrivate,
      PredefinedObjectivesId: this.state.PredefinedId,
      Description: this.state.description,
      CompletionDate: this.state.completiondate != '' ? this.state.completiondate : new Date(),
      OwnerId: this.state.userdata.Id,
      IsPredefined: this.state.userPredefinedObj
    };
    ApiService.add(this.listName, objective)
      .then((item: any) => {

        ApiService.edit(this.listName, { Logs: 'Objective Created On : ' + new Date() + '\nCreted by : ' + this.state.userdata.Email + '\n\n' }, item.data.ID);

        alertify.success("Objectives added successfully");



        if (callback) {
          callback(item.data.ID);
        } else {
          return;
        }
      })
      .catch((error: any[]) => {
        console.log(error);
      });
    return;
  }

  public onChange = (e) => this.setState({ [e.target.name]: e.target.value });

  public render() {
    var that = this;

    return (
      <div>
        <h3>Add Objective</h3>
        {/* <Autocomplete
      id="combo-box-demo"
      options={top100Films}
      getOptionLabel={(option) => option.title}
     size="small"
      renderInput={(params) => <TextField {...params} label="Combo box" variant="outlined" />}
    /> */}


        <FormControl variant="outlined" fullWidth className="form-group" size="small">
          <InputLabel id="standard-select-currency" >Base Objectives</InputLabel>
          <Select
            fullWidth
            labelId="standard-select-currency"
            id="standard-select-currency"
            onChange={this.setObjective}
            label="Predefined Objectives"
          >
            {
              this.state.predefinedObjectives.map((data) => {
                return (
                  <MenuItem value={data.ID}>{data.Title}</MenuItem>
                );
              })
            }
          </Select>
        </FormControl>

        <FormControlLabel
          control={<Checkbox color="primary" name="checkedB" onChange={(e) => this.handlePrivate(e)} />}
          label="Public"
        />

        {
          !this.state.userPredefinedObj &&
          <TextField
            autoFocus
            name="title"
            label="Title"
            type="text"
            value={that.state.title}
            onChange={this.onChange}
            fullWidth
            size="small"
            variant="outlined"
            InputProps={{
              readOnly: this.state.userPredefinedObj,
            }}
          />
        }


        {/* <FormControlLabel
          control={<Checkbox color="primary" name="checkedB" onChange={(e) => this.handlePreObjectives(e)} />}
          label="Use Predefined Objectives"
        /> */}


        {/* {
          this.state.userPredefinedObj &&
          <FormControl variant="outlined" fullWidth className="form-group" size="small">
            <InputLabel id="standard-select-currency" >Predefined Objectives</InputLabel>
            <Select
              fullWidth
              labelId="standard-select-currency"
              id="standard-select-currency"
              onChange={this.setObjective}
              label="Predefined Objectives"
            >
              {
                this.state.predefinedObjectives.map((data) => {
                  return (
                    <MenuItem value={data.Title}>{data.Title}</MenuItem>
                  );
                })
              }
            </Select>
          </FormControl>
        } */}



        <TextField
          name="description"
          label="Description"
          multiline
          type="text"
          fullWidth
          onChange={this.onChange}
          value={that.state.description}
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
          value={that.state.completiondate}
          rowsMax={4}
          size="small"
          variant="outlined"
          InputLabelProps={{
            shrink: true
          }}
        />

        {/* <Button
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
          color="primary"
          //onClick={this.handleClose}
          disableElevation
          size="small"
        >
          Cancel
       </Button>*/}
      </div>
    );
  }
}
export default AddObjective;
