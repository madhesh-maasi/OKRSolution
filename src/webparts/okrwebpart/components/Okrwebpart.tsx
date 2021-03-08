import * as React from "react";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import styles from "./Okrwebpart.module.scss";
import "scss/styles.scss";
import { IOkrwebpartProps } from "./IOkrProps";
import Accordion from "@material-ui/core/Accordion";
import AccordionSummary from "@material-ui/core/AccordionSummary";
import AccordionDetails from "@material-ui/core/AccordionDetails";

import Typography from "@material-ui/core/Typography";
import LinearProgress from "@material-ui/core/LinearProgress";
import CreateIcon from "@material-ui/icons/Create";
import DeleteIcon from "@material-ui/icons/Delete";
import IconButton from "@material-ui/core/IconButton";
import TextField from "@material-ui/core/TextField";
import SimpleTabs from "../reusable/tabs";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import FormControl from "@material-ui/core/FormControl";
import FormLabel from "@material-ui/core/FormLabel";
import Grid from "@material-ui/core/Grid";
import VisibilityIcon from "@material-ui/icons/Visibility";
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableContainer,
  Menu,
  MenuItem,
  TableBody,
} from "@material-ui/core";
import ButtonGroup from '@material-ui/core/ButtonGroup';


import { sp } from "@pnp/sp";
import "@pnp/sp/webs";
import "@pnp/sp/lists";
import "@pnp/sp/items";
import "@pnp/sp/webs";
import "@pnp/sp/folders";
import "@pnp/sp/fields";
import "@pnp/sp/files";
import "@pnp/sp/security/web";
import "@pnp/sp/site-users/web";
import "@pnp/sp/profiles";

import DepartmentSummary from "./DepartmentSummary";
import MyDetails from "./MyDetails";

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
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Link,
} from "@material-ui/core";
import InputAdornment from "@material-ui/core/InputAdornment";
import ControlPointIcon from "@material-ui/icons/ControlPoint";
import CompanySummary from "./CompanySummary";
import AppAdminFunctionComponent from "./admin-fucntion";

import { localization } from "./localization";

const marks = [
  {
    value: 0,
    label: "0°C",
  },
  {
    value: 20,
    label: "20°C",
  },
  {
    value: 37,
    label: "37°C",
  },
  {
    value: 100,
    label: "100°C",
  },
];
function valuetext(value: number) {
  return `${value}°C`;
}
function handleClickOpen() {
  let open: boolean;
  this.open = true;
}

interface IState {
  showhide: boolean;
  tabValue: any;
  viewAllObject: any;
  actionMenu: boolean;
  isHidden: boolean;
  isAdmin: boolean;
}

var azureGroupId = 'dbcf4df3-f741-4499-b8b1-673abfbd6a5c';

export default class Okrwebpart extends React.Component<
  IOkrwebpartProps,
  IState
  > {
  constructor(props: IOkrwebpartProps) {
    super(props);

    sp.setup({
      sp: {
        baseUrl: this.props.siteUrl,
      },
    });

    this.state = {
      showhide: false,
      tabValue: 0,
      viewAllObject: false,
      actionMenu: false,
      isHidden: false,
      isAdmin: false
    };

    this.checkIfAdmin();
    this.setLocalization(null);
  }

  public checkIfAdmin = () => {
    sp.web.currentUser.get().then((userdata) => {
      this.props.graphClient
        .api("/groups/" + azureGroupId + "/members")
        .get()
        .then((group: any) => {
          var okrAdmins = group.value.filter(c => c.mail == userdata.Email);
          this.setState({ isAdmin: okrAdmins.length > 0 });
        }).catch(error => {
          console.log(error);
        });
    });
  }

  public handleKeyDown = (e) => {
    if (e.key === "Shift") {
      this.setState({ showhide: true });
    }
  }
  public tabClick = (event, tabValue) => {
    this.setState({ tabValue });
  }
  public viewObjective() {
    //this.na
    this.setState({
      isHidden: !this.state.isHidden,
    });
  }
  public actionMenuToggle() {
    alert();
  }

  public setLocalization = (language) => {
    // if (!language) {
    //   var currentlang = localization.getCookie('language');
    //   if (!currentlang) {
    //     document.cookie = "language=EN";
    //   }
    // } else {
    //   document.cookie = "language=" + language;
    //   location.reload();
    // }
    if (navigator.language == "en-US") {
      document.cookie = "language=EN";
    } else {
      document.cookie = "language=CH";
    }
  }


  public render(): React.ReactElement {
    return (
      <div className={styles.okrwebpart}>
        <Grid
          container
          direction="row"
          justify="flex-end"
          alignItems="center"
        >

          {/* <ButtonGroup>
            <Button
              variant="contained"
              color={localization.getCookie('language') == 'EN' ? "primary" : "default"}
              disableElevation
              size="small"
              onClick={this.setLocalization.bind(this, 'EN')}
            >
              English
            </Button>
            <Button
              variant="contained"
              color={localization.getCookie('language') == 'CH' ? "primary" : "default"}
              disableElevation
              size="small"
              onClick={this.setLocalization.bind(this, 'CH')}
            >
              Chinese
            </Button>
          </ButtonGroup> */}
        </Grid>
        {/* <SimpleTabs value={myval}></SimpleTabs> */}
        <Tabs
          indicatorColor="primary"
          variant="standard"
          centered={true}
          value={this.state.tabValue}
          onChange={this.tabClick}
        >
          <Tab label={localization.getText('Mydetail')} />
          <Tab label={localization.getText('DepartmentSummary')} />
          <Tab label={localization.getText('CompanySummary')} />
          {
            this.state.isAdmin && <Tab label={localization.getText('AdminFunctions')} />
          }

        </Tabs>
        <div key="tab-content">
          {this.state.tabValue === 0 && (
            <MyDetails siteUrl={this.props.siteUrl} />
          )}
        </div>

        {this.state.tabValue === 1 && (
          <DepartmentSummary
            isAdmin={this.state.isAdmin}
            context={this.props.context}
            siteUrl={this.props.siteUrl}
            graphClient={this.props.graphClient}
          />
        )}
        {this.state.tabValue === 2 && (
          <CompanySummary
            isAdmin={this.state.isAdmin}
            context={this.props.context}
            siteUrl={this.props.siteUrl}
            graphClient={this.props.graphClient}
          />
        )}
        {this.state.tabValue === 3 && (
          <AppAdminFunctionComponent 
          context={this.props.context}
          siteUrl={this.props.siteUrl}
          graphClient={this.props.graphClient}
          />
          // <CompanySummary
          //   context={this.props.context}
          //   siteUrl={this.props.siteUrl}
          // />
        )}
        <Dialog open={this.state.showhide} className="modalPopupObjective">
          <DialogTitle>
            <Stepper>
              <Step>
                <StepLabel>New Objective</StepLabel>
              </Step>
              <Step>
                <StepLabel>Key Value</StepLabel>
              </Step>
            </Stepper>
          </DialogTitle>
          <DialogContent>
            <div>
              <h3>create Object</h3>
              <TextField
                autoFocus
                id="name"
                label="Title"
                type="text"
                fullWidth
              />
              <TextField
                autoFocus
                id="name"
                label="Description"
                type="text"
                multiline
                rowsMax={4}
                fullWidth
              />
            </div>

            <div>
              <h3>Add Key value</h3>
              <p>Limieted more than 5</p>
              <TextField
                autoFocus
                id="name"
                label="Title"
                type="text"
                fullWidth
              />

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
                    <TextField
                      autoFocus
                      id="name"
                      label=""
                      type="date"
                      fullWidth
                      InputLabelProps={{
                        shrink: true
                      }}
                    />
                  </Grid>
                </Grid>
              </FormControl>
            </div>
          </DialogContent>

          <DialogActions>
            <Button
              variant="contained"
              color="default"
              disableElevation
              size="small"
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              disableElevation
              size="small"
            >
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}
