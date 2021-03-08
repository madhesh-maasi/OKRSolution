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
import ApiService from "../../../services/ApiService";
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

function getSteps() {
  return ["Add Objective", "Add Key Results"];
}

function getStepContent(step) {
  switch (step) {
    case 0:
      return <AddObjective />;
    case 1:
      return (
        <div>
          <h3>Add Key value</h3>
          <p>Limieted more than 5</p>
          <TextField autoFocus id="name" label="Title" type="text" fullWidth />

          <FormControl component="fieldset">
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
                <TextField autoFocus id="name" label="" type="date" fullWidth InputLabelProps={{
            shrink: true
          }} />
              </Grid>
            </Grid>
          </FormControl>
        </div>
      );
    default:
      return "Unknown step";
  }
}

export default function HorizontalLinearStepper() {
  const classes = useStyles();
  const [activeStep, setActiveStep] = React.useState(0);

  const steps = getSteps();

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    let objective = {
      Title: this.state.title,
      Description: this.state.description,
    };
    ApiService.add(this.listName, objective)
      .then((item: any) => {
        console.log(item, "addObjectives success");
        alertify.set("notifier", "position", "top-right");
        alertify.success("Objectives added successfully");
        //this.handleClose(item);
        // this.props.refresh(true);
      })
      .catch((error: any[]) => {
        console.log(error);
      });
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  return (
    <div className={classes.root}>
      <Stepper activeStep={activeStep}>
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
        {activeStep === steps.length ? (
          <div>
            <Typography className={classes.instructions}>
              All steps completed - you&apos;re finished
            </Typography>
            <Button onClick={handleReset} className={classes.button}>
              Reset
            </Button>
          </div>
        ) : (
          <div>
            <Typography className={classes.instructions}>
              {getStepContent(activeStep)}
            </Typography>

            {activeStep == 0 ? (
              <div>
                <Button onClick={handleBack} className={classes.button}>
                  Add Key Result Later
                </Button>
                <Button
                  onClick={handleNext}
                  className={classes.button}
                  color="primary"
                >
                  Add Key Result
                </Button>
                <Button onClick={handleBack} className={classes.button}>
                  Cancel
                </Button>
              </div>
            ) : (
              <div>
                {/* <Button onClick={handleBack} className={classes.button}>
                  Back
                </Button> */}
                <Button onClick={handleBack} className={classes.button}>
                  Add Another Key Result

                </Button>
                <Button onClick={handleBack} className={classes.button}>
                  Finish
                </Button>
                <Button onClick={handleBack} className={classes.button}>
                  Cancel
                </Button>
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
