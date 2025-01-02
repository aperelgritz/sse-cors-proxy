# Proxy Application for SSE in MIAW REST API

The `sse-cors-proxy` application is a simple Node.js Express app.

It acts as a proxy to overcome CORS restrictions on the Server-Sent Events (SSE) endpoint for the Salesforce Service Cloud Messaging for In-App & Web (MIAW) REST API.

It is designed to be deployed on a hosting platform such as Heroku, and to be used in combination with the `custom_sfra_miaw` package.

The `custom_sfra_miaw` package enables Agentforce-powered conversations on a Salesforce B2C Commerce SFRA storefront.

Other MIAW REST API endpoints called by the `custom_sfra_miaw` package do not require this proxy as they support CORS.

This application has been tested on Heroku, and sends a keep-alive signal every 25 seconds to prevent Heroku from closing the connection after 30 seconds.

**Documentation links:**

- [MIAW REST API](https://developer.salesforce.com/docs/service/messaging-api/references/miaw-api-reference?meta=Summary)
- [SSE Endpoint](https://developer.salesforce.com/docs/service/messaging-api/references/about/server-sent-events.html)

## Deployment

**On your local environment:**

- `git clone git@github.com:aperelgritz/sse-cors-proxy.git`
- `cd sse-cors-proxy`
- `npm install`
- `heroku login`
- `heroku create <pick-an-app-name> --team sfdc-aloha`
- `git push heroku main`

**On Heroku:**

- Open https://dashboard.heroku.com/apps/<pick-an-app-name>/settings
- Configure the SSE_URL variable:
  - Key: SSE_URL
  - Value: your SSE URL, typically in the format https://<org-name>.my.salesforce-scrt.com/eventrouter/v1/sse
- Configure the ORG_ID variable:
  - Key: ORG_ID
  - Value: your org ID
- You can also configure these optional variables if you want to restrict which frontends can access the proxy - they are mapped to the CORS allowed origins:
  - ALLOWED_ORIGIN_1
  - ALLOWED_ORIGIN_2

## Testing & Troubleshooting

To be added...
