# BasavaVidyaBhiruddhiSanga

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.19.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Deployment

### Frontend — AWS Amplify Hosting

The app is live at **https://www.sribvs.org** (`sribvs.org` forwards to it — see [Domain](#domain) below), and is connected directly to this repository's `main` branch on GitHub via **AWS Amplify Hosting**.

**Deployment is automatic.** Every push to `main` triggers Amplify to pull the commit, run the build, and deploy it — no manual step required. A build normally finishes in a few minutes.

Build config (set in the Amplify app's build settings, not committed to this repo):

```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm ci
    build:
      commands:
        - npm run build -- --configuration production
  artifacts:
    baseDirectory: dist/basavaVidyaBhiruddhiSanga/browser
    files:
      - '**/*'
  cache:
    paths:
      - node_modules/**/*
```

The `baseDirectory` matters: Angular's builder nests the browser bundle under `dist/basavaVidyaBhiruddhiSanga/browser`, not `dist/basavaVidyaBhiruddhiSanga` directly.

**Checking deploy status** — AWS Console → Amplify → this app → branch build history, or via CLI:

```bash
aws amplify list-jobs --app-id d2o4irwycyyjix --branch-name main --region eu-north-1
```

**SPA routing**: a rewrite rule (`/<*>` → `/index.html`, status `404-200`) is configured under Amplify's "Rewrites and redirects" so client-side routes (e.g. `/gallery`) don't 404 on refresh.

### Backend — API Gateway + Lambda + S3 (all AWS Free Tier)

There's no backend code in this repo — it's built and maintained directly in the AWS Console (not infrastructure-as-code), under API base URL `https://3hh3nhwgf9.execute-api.eu-north-1.amazonaws.com`:

| Route | Lambda | Storage | Purpose |
|---|---|---|---|
| `GET/POST/PUT /data/{fileName}` | `json-data-api` | S3 bucket `bvs-app-json-data` | CRUD for the app's JSON data files (members, donors, scholarships, gallery index, etc.) |
| `GET /media/upload-url`, `GET /media/download-url` | `media-presign-api` | S3 bucket `bvs-app-media` | Presigned URLs the browser uses to upload/download files directly to/from S3 |

Changing backend behavior means editing the Lambda source directly in the AWS Console (Lambda → function → Code source), then **Deploy**.

### Domain

- Registered via **Hostinger**: `sribvs.org`.
- `www.sribvs.org` — CNAME to Amplify's CloudFront distribution (this is what actually serves the app).
- `sribvs.org` (bare/apex) — 301 redirect to `https://www.sribvs.org`, set up via Hostinger's domain forwarding. Apex domains can't CNAME directly to Amplify/CloudFront, hence the redirect rather than serving both directly.

**If you ever add another domain/origin** (a staging URL, a different custom domain, etc.), it must be added to CORS in two places or API calls from it will fail:
- API Gateway → the HTTP API → **CORS** → `Access-Control-Allow-Origin`
- S3 bucket `bvs-app-media` → **Permissions** → **CORS** → `AllowedOrigins`

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
