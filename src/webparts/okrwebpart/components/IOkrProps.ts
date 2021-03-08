import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IOkrwebpartProps {
  description: string;
  context: WebPartContext;
  siteUrl: string;
  graphClient: any;
}

export interface IObjective {
  id: number;
  PredefinedObjectivesId: number;
  IsPrivate: boolean;
  title: string;
  description: string;
  progress: number;
  completiondate: string;
  isPredefined: boolean;
  Logs: string;
}
export interface IKeyResult {
  id: number;
  title: string;
  objId: string;
  value: number;
  progressType: string;
  progress: number;
  krdate: string;
  Logs: string;
}

export interface IAddObj {
  addObjective(): any;
}
export interface IAddKey {
  objectiveID: number;
  refresh: any;
  refreshkey: any;
}
export interface IEditObj {
  item: IObjective;
  handleClose: any;
}
export interface IDeleteKeyResult {
  item: IKeyResult;
  handleClose: any;
  refreshList: any;
  refresh: any;
}

export interface IEditKeyResult {
  item: IKeyResult;
  handleClose: any;
  refreshList: any;
  refresh: any;
}

export interface IStepper {
  dialogOpen: any;
  refresh: any;
  refreshkey: any
}
export interface IList {
  keyresults: any;
  objective: any;
}