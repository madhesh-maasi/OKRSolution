import { WebPartContext } from "@microsoft/sp-webpart-base";

export interface ICompanySummaryProps {
  //siteUrl: string;
  context: WebPartContext;
  siteUrl: string;
  isAdmin: boolean;
  graphClient: any;
}
