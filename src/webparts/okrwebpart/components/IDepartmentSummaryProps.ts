import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface IDepartmentSummaryProps {
  //siteUrl: string;
  context: WebPartContext;
  siteUrl: string;
  graphClient: any;
  isAdmin: boolean;
}
