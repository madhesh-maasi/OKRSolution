import * as React from "react";
import {
  createStyles,
  Theme,
  withStyles,
  WithStyles,
} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import { Stepper, Step, StepLabel, Grid } from "@material-ui/core";
import Dialog from "@material-ui/core/Dialog";
import MuiDialogTitle from "@material-ui/core/DialogTitle";
import MuiDialogContent from "@material-ui/core/DialogContent";
import MuiDialogActions from "@material-ui/core/DialogActions";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import AddCircleOutlineIcon from "@material-ui/icons/AddCircleOutline";
import Typography from "@material-ui/core/Typography";
import CreateIcon from "@material-ui/icons/Create";
import DeleteIcon from "@material-ui/icons/Delete";
import EditKeyResult from "./EditKeyResult";
import DeleteKeyResult from "./DeleteKeyResult";
import { sp } from "@pnp/sp";
var moment: any = require("moment");
const styles = (theme: Theme) =>
  createStyles({
    root: {
      margin: 0,
      padding: theme.spacing(2),
    },
    closeButton: {
      position: "absolute",
      right: theme.spacing(1),
      top: theme.spacing(1),
      color: theme.palette.grey[500],
    },
  });

export interface DialogTitleProps extends WithStyles<typeof styles> {
  id: string;
  children: React.ReactNode;
  onClose: () => void;
}

const DialogTitle = withStyles(styles)((props: DialogTitleProps) => {
  const { children, classes, onClose, ...other } = props;
  return (
    <MuiDialogTitle disableTypography className={classes.root} {...other}>
      <Typography variant="h6">{children}</Typography>
      {onClose ? (
        <IconButton
          aria-label="close"
          className={classes.closeButton}
          onClick={onClose}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </MuiDialogTitle>
  );
});

const DialogContent = withStyles((theme: Theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}))(MuiDialogContent);

const DialogActions = withStyles((theme: Theme) => ({
  root: {
    margin: 0,
    padding: theme.spacing(1),
  },
}))(MuiDialogActions);

export default function KRDialogComponent(props) {
  const [type, settype] = props != undefined ? props.type : "edit";
  const [showhidekr, setshowhide] = React.useState(false);

  const [krset, setkrlist] = React.useState<any>((val) => {
    console.log(val);
    return val != null && val != undefined ? val : props.keyresults;
  });
  const handleClickOpen = () => {
    setshowhide(true);
  };
  const handleClose = () => {
    // setOpen(false);
    setshowhide(false);
  };
  function handleKeyRefresh() {
    console.log("refresh");
    getkeyResults();
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

  function handleCloseDialog(newValue) {
    console.log(newValue, props);
    setshowhide(newValue);
    props.refreshKey(true);
  }
  let button;
  if (type == "e") {
    button = (
      <IconButton
        className="button-sm"
        color="primary"
        onClick={handleClickOpen}
        onFocus={(event) => event.stopPropagation()}
      >
        {" "}
        <CreateIcon />
      </IconButton>
    );
  } else if (type == "d") {
    button = (
      <IconButton
        className="button-sm"
        color="primary"
        onClick={handleClickOpen}
        onFocus={(event) => event.stopPropagation()}
      >
        {" "}
        <DeleteIcon />{" "}
      </IconButton>
    );
  }
  let Keyresultcomp;
  if (type == "e") {
    // Keyresultcomp = (
    //   <EditKeyResult
    //     refreshList={handleKeyRefresh}
    //     handleClose={handleCloseDialog}
    //     item={props.value}
    //   ></EditKeyResult>
    // );
  } else if (type == "d") {
    // Keyresultcomp = (
    //   <DeleteKeyResult
    //     refreshList={handleKeyRefresh}
    //     handleClose={handleCloseDialog}
    //     item={props.value}
    //   ></DeleteKeyResult>
    // );
  }

  return (
    <div className="button-right">
      {button}

      <Dialog open={showhidekr} aria-labelledby="form-dialog-title">
        {type != "d" ? (
          <DialogTitle onClose={handleClose} id="form-dialog-title">
            <Stepper>
              <Step>
                <StepLabel>Key Value</StepLabel>
              </Step>
            </Stepper>
          </DialogTitle>
        ) : (
          <DialogTitle onClose={handleClose} id="form-dialog-title">
            Delete
          </DialogTitle>
        )}

        <DialogContent>{Keyresultcomp}</DialogContent>
      </Dialog>
    </div>
  );
}
