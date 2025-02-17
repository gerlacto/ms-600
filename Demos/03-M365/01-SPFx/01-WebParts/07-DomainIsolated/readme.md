# Domain Isoltated WebParts

## Graph using AadHttpClient

- Edit `package-solution.json`

    ```
    "isDomainIsolated": true,
    "webApiPermissionRequests": [
      {
        "resource": "Microsoft Graph",
        "scope": "User.ReadBasic.All"
      }
    ],
    ```

-   Package the webpart using `gulp bundle --ship` and `gulp package-solution --ship`
-   Make sure you are authenticated using M365 CLI: `m365 login`
-   Deploy the webpart using `($id=m365 spo app add -p sharepoint/solution/call-rest-apis.sppkg --overwrite)`
-   Take the resulting id and deploy: `m365 spo app deploy -i $id`

- Approve the API permission request fro Domain Isolated WP:

- In the navigation of SharePoint Admin, select Advanced > API access:

- Select the Pending approval for the Microsoft Graph permission User.ReadBasic.All

![sharepoint-admin-portal-02](_images/sharepoint-admin-portal-02.png)

For your own understanding check the App Registration that has been created by approving the request.

![azure-app-reg](_images/azure-app-reg.png)

## Secured Enterprise Api

- Execute `create-func-app.azcli` and deploy `az-funct-skills`
- Enable & Configure Azure AD auth for function app

  ![azure-ad-auth](_images/azure-ad-auth.png)

- Enable CORS on the function app for your SharePoint tenant.Example: `https://integrationsonline.sharepoint.com`

- Add permissions to `package-solution.json`

  ```
  "webApiPermissionRequests": [
    {
      "resource": "spfxapi-26951",
      "scope": "user_impersonation"
    }
  ],
  ```

-   Package the webpart using `gulp bundle --ship` and `gulp package-solution --ship`
-   Make sure you are authenticated using M365 CLI: `m365 login`
-   Deploy the webpart using `($id=m365 spo app add -p sharepoint/solution/enterprise-api.sppkg --overwrite)`
-   Take the resulting id and deploy: `m365 spo app deploy -i $id`  
-   In the navigation of SharePoint Admin, select Advanced > API access:

-   Select the Pending approval for the app concerning `user_impersonation`

    ![sharepoint-admin-portal-enterprise-app](_images/sharepoint-admin-portal-enterprise-app.png)
