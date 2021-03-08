import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  IPropertyPaneConfiguration,
  PropertyPaneTextField,
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import { MSGraphClient, HttpClient } from '@microsoft/sp-http';
import * as strings from "OkrwebpartWebPartStrings";
import Okrwebpart from "./components/Okrwebpart";
import { IOkrwebpartProps } from "./components/IOkrProps";
import "../../ExternalRef/CSS/style.css";

import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';


export interface IOkrwebpartWebPartProps {
  description: string;
}
  
export default class OkrwebpartWebPart extends BaseClientSideWebPart<
  IOkrwebpartWebPartProps
  > {
  public render(): void {

    this.context.msGraphClientFactory.getClient()
      .then((_graphClient: MSGraphClient): void => {
        const element: React.ReactElement<IOkrwebpartProps> = React.createElement(
          Okrwebpart,
          {
            description: this.properties.description,
            context: this.context,
            graphClient: _graphClient,
            siteUrl: this.context.pageContext.web.absoluteUrl,
          }
        );

        ReactDom.render(element, this.domElement);
      });
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel,
                }),
              ],
            },
          ],
        },
      ],
    };
  }
}
