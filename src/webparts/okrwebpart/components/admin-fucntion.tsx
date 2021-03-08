import *as React from 'react';
import { Grid, Card, CardHeader, CardContent, TextField, TableRow, Checkbox, Button, Paper } from '@material-ui/core';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';

import FormControlLabel from '@material-ui/core/FormControlLabel';



import { sp } from "@pnp/sp";
import "@pnp/sp/fields";
import "@pnp/sp/items";
import "@pnp/sp/lists";
import "@pnp/sp/site-users";
import "@pnp/sp/webs";
import "@pnp/sp/profiles";
import "@pnp/sp/sputilities";
import { IEmailProperties } from "@pnp/sp/sputilities";

import Autocomplete from '@material-ui/lab/Autocomplete';
import "alertifyjs";
import '../../../ExternalRef/CSS/alertify.min.css';
import "../../../ExternalRef/CSS/style.css";  
var alertify: any = require("../../../ExternalRef/JS/alertify.min.js");
// Top 100 films as rated by IMDb users. http://www.imdb.com/chart/top
const top100Films = [];


export default class AppAdminFunctionComponent extends React.Component<any, any> {

    constructor(props) {
        super(props);
        this.state = {
            allObjectives: [],
            allUsers: [],
            sendUsers: [],
            receiveUsers: [],
            senderObjectives: [],
            receiverObjectives: [],

        };
    alertify.set("notifier", "position", "top-right"); 
this.loadAllDepartments();
      this.loadAllObjectives();
    }
    public loadAllDepartments = () => {
        this.props.graphClient.api("/users").select('Department,mail,displayName,Id').get((error, response) => {
          var items = response.value;
          var owners = [];
          for (let index = 0; index < items.length; index++) {
              const element = items[index];
            //  var fdata = owners.filter(c => c.Id == element.Owner.Id);
            //   if (fdata.length == 0) {
                  owners.push({
                      Id: element.id,
                      Title: element.displayName,
                      EMail: element.mail,
                  });
            //   }
          }
          this.setState({  allUsers: owners, receiveUsers: owners, sendUsers: owners });
        });
      }
    public loadAllObjectives = () => {
        sp.web.lists.getByTitle("Objectives")
            .items.select(
                "Title",
                "Owner/Id",
                "Owner/Title",
                "Owner/EMail",
                "Title",
                "ID",
                "Progress",
                "Description",
                "CompletionDate",
                "IsPredefined"
            )
            .expand("Owner")
            .get()
            .then((items: any[]) => {
                items = items.filter(c => c.IsPredefined == false);
                var owners = [];
                for (let index = 0; index < items.length; index++) {
                    const element = items[index];
                    var fdata = owners.filter(c => c.Id == element.Owner.Id);
                    if (fdata.length == 0) {
                        owners.push({
                            Id: element.Owner.Id,
                            Title: element.Owner.Title,
                            EMail: element.Owner.EMail,
                        });
                    }
                }
                this.setState({ allObjectives: items, copyObjectives: items });

                //this.setState({ allObjectives: items, copyObjectives: items, allUsers: owners, receiveUsers: owners, sendUsers: owners });
            });
    }


    public loadObjectives = (ownerId, sender = false) => {
        sp.web.lists.getByTitle("Objectives")
            .items.select(
                "Title",
                "Owner/Id",
                "Owner/Title",
                "Owner/EMail",
                "Title",
                "ID",
                "Progress",
                "Description",
                "CompletionDate",
                "IsPredefined"

            )
            .expand("Owner")
            .filter("OwnerId eq '" + ownerId + "'")
            .get()
            .then((items: any[]) => {
                items = items.filter(c => c.IsPredefined == false);
                if (sender) {
                    this.setState({ senderObjectives: items });
                } else {
                    this.setState({ receiverObjectives: items });
                }
            });
    }

    public async setSender (value) {
        if (value) {
            var users = [];
            sp.web.siteUsers.getByEmail(value.EMail).get().then((UserData:any)=>{
               this.setState({senderId: UserData.Id})
           });
            for (let index = 0; index < this.state.allUsers.length; index++) {
                const user = this.state.allUsers[index];
                if (user.Id != value.Id) {
                    users.push(user);
                } else {
                    this.setState({ senderDetail: user });
                }
            }

            var copy = this.state.copyObjectives.filter(c => c.Owner.EMail.toLowerCase() == value.EMail.toLowerCase());
            var senderObjectives = this.state.senderObjectives;
            senderObjectives = [];
            for (let index = 0; index < copy.length; index++) {
                senderObjectives.push(copy[index]);
            }
            this.setState({ senderObjectives: senderObjectives, senderTitle: value.Title,  receiveUsers: users });
        } else {
            this.setState({ senderObjectives: [], senderTitle: null, senderId: null, receiveUsers: this.state.allUsers });
        }
    }

    public setReceiver = (value) => {
        if (value) {
            var users = [];
            sp.web.siteUsers.getByEmail(value.EMail).get().then((UserData:any)=>{
                this.setState({receiverId: UserData.Id})
            });
            for (let index = 0; index < this.state.allUsers.length; index++) {
                const user = this.state.allUsers[index];
                if (user.Id != value.Id) {
                    users.push(user);
                } else {
                    this.setState({ receiverDetail: user });
                }
            }

            var copy = this.state.copyObjectives.filter(c => c.Owner.EMail.toLowerCase() == value.EMail.toLowerCase());
            var receiverObjectives = this.state.receiverObjectives;
            receiverObjectives = [];
            for (let index = 0; index < copy.length; index++) {
                receiverObjectives.push(copy[index]);
            }
            this.setState({ receiverObjectives: receiverObjectives, receiverTitle: value.Title, sendUsers: users });
        } else {
            this.setState({ receiverObjectives: [], receiverTitle: null, receiverId: null, sendUsers: this.state.allUsers });
        }
    }

    public moveObject = (obj, index, event) => {
        var senderObjectives = this.state.senderObjectives;
        senderObjectives[index].Selected = event.target.checked;
        this.setState({ senderObjectives: senderObjectives });
    }

    public selectAll = (event) => {
        var objs = this.state.senderObjectives;
        for (let index = 0; index < objs.length; index++) {
            objs[index].Selected = event.target.checked;
        }
        this.setState({ senderObjectives: objs });
    }
 
    public async transfer() {
        if (!this.state.senderId || !this.state.receiverId) {
            alertify.error('From and to user is required');
            return;
        }
        var toobj = this.state.senderObjectives.filter(c => c.Selected == true);
        var objectivesName = '';
        for (let index = 0; index < toobj.length; index++) {
            const element = toobj[index];
            objectivesName = objectivesName + toobj[index].Title + '<br/>';
            await sp.web.lists.getByTitle("Objectives").items.getById(element.ID).update({ OwnerId: this.state.receiverId }).then(() => {
            });

            if ((index + 1) == toobj.length) {
                const emailProps: IEmailProperties = {
                    To: [this.state.receiverDetail.EMail],
                    Subject: this.state.senderDetail.Title + " objectives are transfered to you",
                    Body: 'Objectives:-<br/>' + objectivesName,
                    AdditionalHeaders: {
                        "content-type": "text/html",
                    },
                };
                sp.utility.sendEmail(emailProps);
                alertify.success('Objectives transfered');
                this.loadAllObjectives();
                this.loadObjectives(this.state.senderId, true);
                this.loadObjectives(this.state.receiverId);
            }
        }
    }

    public render(): React.ReactElement {
        return (
            <div className="adminFunction">

                <Card square={true} elevation={3}>
                    <CardContent>
                        <Grid component={"div"} container spacing={3}
                            justify="center"
                            alignItems="flex-start"
                        >
                            <Grid item xs={12} sm={5} md={5} lg={5}>
                                <Autocomplete
                                    size="small"
                                    value={this.state.senderTitle}
                                    onChange={(event: any, newValue: string | null) => {
                                        this.setSender(newValue);
                                    }}
                                    id="combo-box-demo"
                                    className="mb-4"
                                    options={this.state.sendUsers}
                                    getOptionLabel={(option) => option["Title"]}
                                    style={{ width: 300 }}
                                    renderInput={(params) => <TextField {...params} label="Search Employee" variant="outlined" />}
                                />
                                <Card elevation={0} className="card-lines" variant="outlined">

                                {
                                    this.state.senderObjectives.length > 0 ?
                                        <FormControlLabel className="sAllSec"
                                            control={
                                                <Checkbox color="primary" onChange={this.selectAll.bind(this)} name="selectAll" />
                                            }
                                            label="Select All"
                                        />

                                        : <h3 className="no-obj-label">No Objectives to display</h3>
                                }
         
                                    <Table size="small" className="senderTable">
                                    {/* <TableHead>
                                            <TableRow>
                                                <TableCell size="medium">
                                                        <Checkbox />
                                                </TableCell>
                                                <TableCell size="medium">
                                                    Select All
                                                </TableCell>
                                            </TableRow>
                                        </TableHead> */}
                                        <TableBody>
                                         
                                            {
                                                this.state.senderObjectives.map((obj, index) => {
                                                    return <TableRow>
                                                        <TableCell className="checkboxTd">
                                                            <Checkbox color="primary" checked={obj.Selected ? obj.Selected : false} onChange={this.moveObject.bind(this, obj, index)} name={obj.Id} />
                                                        </TableCell>
                                                        <TableCell>
                                                            {obj.Title}
                                                        </TableCell>
                                                    </TableRow>;
                                                })
                                            }

                                        </TableBody>
                                    </Table>
                                </Card>
                            </Grid>
                            <Grid item xs={12} sm={2} md={2} lg={2} className="text-center">

                                <Button className="button-transfer" variant="contained" color="secondary" onClick={this.transfer.bind(this)}>
                                    Transfer
</Button>

                            </Grid>
                            <Grid item xs={12} sm={5} md={5} lg={5}>
                                <Autocomplete
                                    size="small"
                                    value={this.state.receiverTitle}
                                    onChange={(event: any, newValue: string | null) => {
                                        this.setReceiver(newValue);
                                    }}
                                    id="combo-box-demo"
                                    className="mb-4 toRightAlign"
                                    options={this.state.receiveUsers}
                                    getOptionLabel={(option) => option["Title"]}
                                    style={{ width: 300 }}
                                    renderInput={(params) => <TextField {...params} label="Search Employee" variant="outlined" />}
                                />
                                <Card elevation={0} className="card-lines" variant="outlined">

                                    <Table size="small">
                                        {/* <TableHead>
                                            <TableRow>
                                                <TableCell size="medium">
                                                        <Checkbox />
                                                </TableCell>
                                                <TableCell size="medium">
                                                    Select All
                                                </TableCell>
                                            </TableRow>
                                        </TableHead> */
                                        
                                        } 

                                        <TableBody>    
                                             
                                            {
                                                this.state.receiverObjectives.map((obj) => {
                                                    return <TableRow className="secnSecTr">
                                                        {/* <TableCell size="medium">
                                                        </TableCell> */}
                                                        <TableCell size="medium" className="secnSecTd"> 
                                                            {obj.Title}
                                                        </TableCell>
                                                    </TableRow>;
                                                })
                                            }

                                        </TableBody>

                                    </Table>
                                </Card>
                            </Grid>
                        </Grid>
                        </CardContent>
                    </Card>
           
            </div>
        );
    }
}