# Deployment Guide — Azure App Service

## Architecture

```
Internet → Azure Front Door / App Gateway (optional)
              ↓
         Nginx (reverse proxy, port 80/443)
           ├── /api/*  → NestJS API  (port 4000)
           └── /       → Next.js Web (port 3000)
```

Both the web and API run on a single **Azure App Service (Linux)** instance in development/staging.
For production at scale, deploy each app to its own App Service Plan.

---

## Prerequisites

1. [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli) installed and authenticated (`az login`)
2. GitHub repository secrets configured (see below)
3. PostgreSQL database provisioned (Azure Database for PostgreSQL — Flexible Server recommended)

---

## One-time Azure Setup

```bash
# Create resource group
az group create --name rent-a-car-rg --location southeastasia

# Create App Service Plan (Linux, B2 minimum for Node.js)
az appservice plan create \
  --name rent-a-car-plan \
  --resource-group rent-a-car-rg \
  --is-linux \
  --sku B2

# Create API App Service
az webapp create \
  --name rent-a-car-api \
  --resource-group rent-a-car-rg \
  --plan rent-a-car-plan \
  --runtime "NODE:20-lts"

# Create Web App Service
az webapp create \
  --name rent-a-car-web \
  --resource-group rent-a-car-rg \
  --plan rent-a-car-plan \
  --runtime "NODE:20-lts"

# Create PostgreSQL Flexible Server
az postgres flexible-server create \
  --name rent-a-car-db \
  --resource-group rent-a-car-rg \
  --location southeastasia \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --admin-user rentacaradmin \
  --admin-password "<strong-password>" \
  --database-name rentacar
```

---

## GitHub Secrets Required

| Secret                             | Description                                                        |
| ---------------------------------- | ------------------------------------------------------------------ |
| `AZURE_WEBAPP_PUBLISH_PROFILE_API` | Download from Azure portal → API App Service → Get publish profile |
| `AZURE_WEBAPP_PUBLISH_PROFILE_WEB` | Download from Azure portal → Web App Service → Get publish profile |
| `PROD_DATABASE_URL`                | PostgreSQL connection string                                       |
| `NEXTAUTH_SECRET`                  | Strong random string (min 32 chars)                                |
| `NEXTAUTH_URL`                     | `https://your-domain.com`                                          |
| `NEXT_PUBLIC_API_URL`              | `https://your-domain.com/api/v1`                                   |
| `AUTH_GOOGLE_ID`                   | Google OAuth client ID                                             |
| `AUTH_GOOGLE_SECRET`               | Google OAuth client secret                                         |
| `AUTH_MICROSOFT_ENTRA_ID_ID`       | Azure AD app client ID                                             |
| `AUTH_MICROSOFT_ENTRA_ID_SECRET`   | Azure AD app client secret                                         |
| `AUTH_MICROSOFT_ENTRA_ID_ISSUER`   | `https://login.microsoftonline.com/<tenant-id>/v2.0`               |

---

## App Service Environment Variables

Set these in **Azure portal → App Service → Configuration → Application Settings**:

### API

```
DATABASE_URL          = postgresql://...
JWT_SECRET            = <secret>
PORT                  = 4000
ALLOWED_ORIGINS       = https://your-domain.com
PAYMONGO_SECRET_KEY   = sk_live_...
PAYMONGO_WEBHOOK_SECRET = <webhook-secret>
WEBSITE_NODE_DEFAULT_VERSION = ~20
```

### Web

```
NEXTAUTH_URL          = https://your-domain.com
NEXTAUTH_SECRET       = <secret>
NEXT_PUBLIC_API_URL   = https://your-domain.com/api/v1
AUTH_GOOGLE_ID        = ...
AUTH_GOOGLE_SECRET    = ...
AUTH_MICROSOFT_ENTRA_ID_ID     = ...
AUTH_MICROSOFT_ENTRA_ID_SECRET = ...
AUTH_MICROSOFT_ENTRA_ID_ISSUER = ...
WEBSITE_NODE_DEFAULT_VERSION = ~20
```

---

## Nginx Setup (on the App Service VM or a separate VM)

1. Copy `nginx/nginx.conf` to `/etc/nginx/nginx.conf`
2. Update `server_name` and SSL certificate paths
3. Run: `nginx -t && systemctl reload nginx`

For Azure App Service, configure the startup command to run Nginx as a reverse proxy,
or use **Azure Application Gateway** / **Azure Front Door** as a managed alternative.

---

## Database Migrations (Production)

Migrations run automatically in the `deploy-api` CI job:

```bash
npx prisma migrate deploy
```

This applies pending migrations without data loss. Never run `migrate dev` in production.

---

## Monitoring & Health Checks

- API health: `GET /api/v1/health` (add a health endpoint if needed)
- Azure Monitor: enable Application Insights in both App Services
- PayMongo webhook events: verify via PayMongo dashboard → Webhooks → Logs
