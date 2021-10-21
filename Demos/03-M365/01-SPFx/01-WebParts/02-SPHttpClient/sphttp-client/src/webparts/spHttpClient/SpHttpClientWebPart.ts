import * as React from "react";
import * as ReactDom from "react-dom";
import { Environment, EnvironmentType, Version } from "@microsoft/sp-core-library";
import { IPropertyPaneConfiguration, PropertyPaneTextField } from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import * as strings from "SpHttpClientWebPartStrings";
import { SPHttpClient } from "@microsoft/sp-http";
import MockHttpClient from "./MockHttpClient";
import { ISPList } from "./ISPList";
import SpHttpClient from "./components/SpHttpClient";

export interface ISpHttpClientWebPartProps {
  description: string;
  lists: ISPList[];
}

export default class SpHttpClientWebPart extends BaseClientSideWebPart<ISpHttpClientWebPartProps> {
  
  public render(): void {  
    this.getListData().then((data) => {
      const element: React.ReactElement<ISpHttpClientWebPartProps> = React.createElement(SpHttpClient, {
        description: this.properties.description,
        lists: data,
      });
      ReactDom.render(element, this.domElement);
    });
  }


  private getListData(): Promise<ISPList[]> {
    if (Environment.type === EnvironmentType.Local) {
      return this.getMockListData();
    } else {
      return this.getSPOListData();
    }
  }

  private getMockListData(): Promise<ISPList[]> {
    return MockHttpClient.get(this.context.pageContext.web.absoluteUrl).then((data: ISPList[]) => {
      return data;
    });
  }

  private getSPOListData(): Promise<ISPList[]> {
    const url: string = this.context.pageContext.web.absoluteUrl + `/_api/web/lists?$filter=Hidden eq false`;
    return this.context.spHttpClient
      .get(url, SPHttpClient.configurations.v1)
      .then((response) => {
        return response.json();
      })
      .then((json) => {
        return json.value;
      }) as Promise<ISPList[]>;
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
