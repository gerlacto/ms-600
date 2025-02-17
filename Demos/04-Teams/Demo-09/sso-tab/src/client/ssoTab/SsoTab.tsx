import * as React from "react";
import { Provider, Flex, Text, Button, Header, List } from "@fluentui/react-northstar";
import { useTeams } from "msteams-react-base-component";
import * as microsoftTeams from "@microsoft/teams-js";
import jwtDecode from "jwt-decode";
import { useState, useEffect, useCallback } from "react";

/**
 * Implementation of the SSOTab content page
 */
export const SsoTab = () => {

    const [{ inTeams, theme, context }] = useTeams();
    const [entityId, setEntityId] = useState<string | undefined>();
    const [name, setName] = useState<string>();
    const [error, setError] = useState<string>();
    const [ssoToken, setSsoToken] = useState<string>();
    const [msGraphOboToken, setMsGraphOboToken] = useState<string>();
    const [recentMail, setRecentMail] = useState<any[]>();

    useEffect(() => {
        if (inTeams === true) {
            microsoftTeams.authentication.getAuthToken({
                successCallback: (token: string) => {
                    const decoded: { [key: string]: any; } = jwtDecode(token) as { [key: string]: any; };
                    setName(decoded!.name);
                    setSsoToken(token);
                    microsoftTeams.appInitialization.notifySuccess();
                },
                failureCallback: (message: string) => {
                    setError(message);
                    microsoftTeams.appInitialization.notifyFailure({
                        reason: microsoftTeams.appInitialization.FailedReason.AuthFailed,
                        message
                    });
                },
                resources: [process.env.TAB_APP_URI as string]
            });
        } else {
            setEntityId("Not in Microsoft Teams");
        }
    }, [inTeams]);

    useEffect(() => {
        if (context) {
            setEntityId(context.entityId);
        }
    }, [context]);

    const exchangeSsoTokenForOboToken = useCallback(async () => {
        const response = await fetch(`/exchangeSsoTokenForOboToken/?ssoToken=${ssoToken}`);
        const responsePayload = await response.json();
        if (response.ok) {
          setMsGraphOboToken(responsePayload.access_token);
        } else {
          if (responsePayload!.error === "consent_required") {
            setError("consent_required");
          } else {
            setError("unknown SSO error");
          }
        }
      }, [ssoToken]);

      useEffect(() => {
        // if the SSO token is defined...
        if (ssoToken && ssoToken.length > 0) {
          exchangeSsoTokenForOboToken();
        }
      }, [exchangeSsoTokenForOboToken, ssoToken]);

      const getRecentEmails = useCallback(async () => {
        if (!msGraphOboToken) { return; }
      
        const endpoint = "https://graph.microsoft.com/v1.0/me/messages?$select=receivedDateTime,subject&$orderby=receivedDateTime&$top=10";
        const requestObject = {
          method: "GET",
          headers: {
            Authorization: "Bearer " + msGraphOboToken
          }
        };
      
        const response = await fetch(endpoint, requestObject);
        const responsePayload = await response.json();
      
        if (response.ok) {
          const recentMail = responsePayload.value.map((mail: any) => ({
            key: mail.id,
            header: mail.subject,
            headerMedia: mail.receivedDateTime
          }));
          setRecentMail(recentMail);
        }
      }, [msGraphOboToken]);

    /**
     * The render() method to create the UI of the tab
     */
    return (
        <Provider theme={theme}>
            <Flex fill={true} column styles={{
                padding: ".8rem 0 .8rem .5rem"
            }}>
                <Flex.Item>
                    <Header content="This is your tab" />
                </Flex.Item>
                <Flex.Item>
                    <div>
                        <div>
                            <Text content={`Hello ${name}`} />
                        </div>
                        {error && <div><Text content={`An SSO error occurred ${error}`} /></div>}

                        <div>
                            <Button onClick={() => alert("It worked!")}>A sample button</Button>
                        </div>
                    </div>
                </Flex.Item>
                <Flex.Item styles={{
                    padding: ".8rem 0 .8rem .5rem"
                }}>
                    <Text size="smaller" content="(C) Copyright Integrations" />
                </Flex.Item>
            </Flex>
        </Provider>
    );
};
