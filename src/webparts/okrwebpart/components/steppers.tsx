import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Stepper from "@material-ui/core/Stepper";
import Step from "@material-ui/core/Step";
import StepLabel from "@material-ui/core/StepLabel";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Grid from "@material-ui/core/Grid";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import AddObjective from "./AddObjective";
import AddKeyResult from "./AddKeyResult";
import ApiService from "../../../services/ApiService";
import { IStepper } from "./IOkrProps";
import "alertifyjs";

import "../../../ExternalRef/CSS/alertify.min.css";
var alertify: any = require("../../../ExternalRef/JS/alertify.min.js");
const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  button: {
    marginRight: theme.spacing(1),
  },
  instructions: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
}));
const steps = getSteps();

function getSteps() {
  return ["Add Objective", "Add Key Results"];
}

class HorizontalLinearStepper extends React.Component<IStepper, any> {
  public objRef: React.RefObject<AddObjective> = React.createRef();
  public keyRef: React.RefObject<AddKeyResult> = React.createRef();

  constructor(props) {
    super(props);

    console.log(props);
    this.state = {
      activeStep: 0,
      objectiveID: 0,
      count: 0,
      isRefresh: false
    };
  }
  public getStepContent(step) {
    switch (step) {
      case 0:
        return <AddObjective ref={this.objRef} />;
      // return <AddObjective />;
      case 1:
        return <AddKeyResult objectiveID={this.state.objectiveID} refresh={this.handleRefresh} ref={this.keyRef} refreshkey={this.props.refreshkey} />;
      default:
        return "Unknown step";
    }
  }

  //classes = useStyles();
  public addKR = (e) => {
    e.preventDefault();
    this.addObjective((res) => {

    });
    //this.props.refresh(true);
  }
  public handleRefresh() {
    console.log(this.props, 'add key refresh');
    //if(isRefresh)
  }
  public componentWillReceiveProps() {
    console.log(this.props);
  }
  public addObjective = (callback) => {
    this.objRef.current.addObjective((objectiveID) => {
      if (objectiveID) {
        this.setState({
          activeStep: this.state.activeStep + 1,
          objectiveID: objectiveID,
        });
        console.log('call obj refresh');
        this.props.refresh(true);
      }
      callback(objectiveID);
    });
  }

  public addAnotherKR = (callback) => {
    this.keyRef.current.addKeyResult(this.state.objectiveID, (keyresultdata) => {
      if (keyresultdata) {
        this.setState({
          count: this.state.count + 1,
        });
        this.keyRef.current.resetFields();
        this.setState({ isRefresh: true });
      }
      callback(keyresultdata);
    });

  }

  public handleBack = () => {
    this.setState({
      activeStep: this.state.activeStep - 1,
    });
    this.objRef.current.loadData(this.state.objectiveID);
  }

  public handleReset = () => { };

  public handleFinish = () => {
    if (this.state.count <= 5) {
      this.addAnotherKR((res) => {
        if (res) {
          this.props.dialogOpen(false);
        }
      });
    }

    //this.props.refresh(true);
  }

  public handleCancel = () => {
    this.props.dialogOpen(false);
  }

  public addKRLater = () => {
    this.addObjective((res) => {
      if (res) {
        this.props.dialogOpen(false);
      }
    });
    // this.props.refresh(true);
  }

  public render() {
    var that = this;

    return (
      <div>

        <Stepper activeStep={that.state.activeStep}>
          {steps.map((label, index) => {
            const stepProps = {};
            const labelProps = {};

            return (
              <Step key={label} {...stepProps}>
                <StepLabel {...labelProps}>{label}</StepLabel>
              </Step>
            );
          })}
        </Stepper>

        <div>
          {that.state.activeStep === steps.length ? (
            <div>
              <Typography>
                All steps completed - you&apos;re finished
              </Typography>
              <Button variant="contained" size="small" onClick={that.handleReset}>Reset</Button>
            </div>
          ) : (
              <div>
                <Typography>
                  {this.getStepContent(that.state.activeStep)}
                </Typography>

                {that.state.activeStep == 0 ? (
                  <div className="button-group">
                    <Button color="primary" disableElevation variant="contained" size="small" onClick={that.addKRLater}>Add Key Result Later</Button>
                    <Button disableElevation variant="contained" size="small" onClick={that.addKR} color="primary">
                      Add Key Result
                  </Button>
                    <Button className="ml-auto" disableElevation variant="contained" size="small" onClick={that.handleCancel}>Cancel</Button>
                  </div>
                ) : (
                    <div className="button-group">
                      {/* <Button disableElevation variant="contained" size="small" onClick={that.handleBack}>Back</Button> */}
                      <Button
                        disabled={that.state.count === 5}
                        onClick={that.addAnotherKR}
                        variant="contained" size="small"
                        disableElevation
                      >
                        Add Another Key Result
                  </Button>
                      <Button disableElevation onClick={that.handleFinish} id="fBtn" variant="contained" size="small">Finish</Button>
                      <Button disableElevation variant="contained" size="small" onClick={that.handleCancel}>Cancel</Button>
                    </div>
                  )}

                {/*<Button
                  variant="contained"
                  color="primary"
                  onClick={handleNext}
                  className={classes.button}
                >
                  {activeStep === steps.length - 1 ? "Finish" : "Next"}
                </Button>*/}
              </div>
            )}
        </div>
      </div>
    );
  }
}

export default HorizontalLinearStepper;
