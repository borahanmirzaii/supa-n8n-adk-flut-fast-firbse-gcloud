# Deployment Guide

Complete guide for deploying the AI Agent App Template to production on Google Cloud Platform and Firebase.

## Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Backend Deployment (Cloud Run)](#backend-deployment-cloud-run)
3. [Frontend Deployment (Firebase Hosting)](#frontend-deployment-firebase-hosting)
4. [Mobile Deployment](#mobile-deployment)
5. [n8n Deployment](#n8n-deployment)
6. [Infrastructure as Code (Terraform)](#infrastructure-as-code-terraform)
7. [CI/CD Setup](#cicd-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Production Best Practices](#production-best-practices)

---

## Pre-Deployment Checklist

- [ ] Google Cloud project created and configured
- [ ] Firebase project initialized
- [ ] Service accounts created with proper IAM roles
- [ ] All APIs enabled (Cloud Run, Firestore, etc.)
- [ ] Environment variables configured in Secret Manager
- [ ] Domain name purchased (optional)
- [ ] SSL certificates ready (handled by Google)
- [ ] Firestore security rules tested
- [ ] All tests passing
- [ ] Code reviewed and merged to main branch
- [ ] Database indexes created
- [ ] Backup strategy in place

---

## Backend Deployment (Cloud Run)

### 1. Prepare Backend for Deployment

**Create `backend/Dockerfile`**:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Expose port
EXPOSE 8080

# Run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
```

**Create `backend/.dockerignore`**:
```
venv/
__pycache__/
*.pyc
.env
.env.local
.git/
.gitignore
README.md
tests/
.pytest_cache/
```

**Update `backend/main.py` for production**:
```python
import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials

# Get port from environment (Cloud Run sets PORT)
PORT = int(os.getenv("PORT", 8080))

# Initialize Firebase Admin with Application Default Credentials in production
if os.getenv("GOOGLE_APPLICATION_CREDENTIALS"):
    cred = credentials.Certificate(os.getenv("GOOGLE_APPLICATION_CREDENTIALS"))
else:
    # Use Application Default Credentials in Cloud Run
    cred = credentials.ApplicationDefault()

firebase_admin.initialize_app(cred)

app = FastAPI(
    title="AI Agent API",
    description="FastAPI backend with Google ADK",
    version="1.0.0"
)

# CORS - Update with your production domain
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://your-domain.com",
        "https://your-domain.web.app"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "AI Agent API is running"}

@app.get("/health")
async def health():
    return {"status": "healthy"}
```

### 2. Build and Deploy to Cloud Run

```bash
# Set project
gcloud config set project YOUR_PROJECT_ID

# Build container image
cd backend
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/ai-agent-backend

# Deploy to Cloud Run
gcloud run deploy ai-agent-backend \
  --image gcr.io/YOUR_PROJECT_ID/ai-agent-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 2Gi \
  --cpu 2 \
  --max-instances 10 \
  --min-instances 0 \
  --timeout 300 \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=YOUR_PROJECT_ID" \
  --set-secrets "ADK_API_KEY=adk-api-key:latest,N8N_API_KEY=n8n-api-key:latest"
```

### 3. Configure Custom Domain (Optional)

```bash
# Map custom domain to Cloud Run
gcloud run domain-mappings create \
  --service ai-agent-backend \
  --domain api.your-domain.com \
  --region us-central1

# Update DNS records as instructed by the output
```

### 4. Update Environment Variables

```bash
# Update secrets
echo -n "new-api-key" | gcloud secrets versions add adk-api-key --data-file=-

# List current environment variables
gcloud run services describe ai-agent-backend --region us-central1 --format "value(spec.template.spec.containers[0].env)"
```

---

## Frontend Deployment (Firebase Hosting)

### 1. Prepare Frontend for Deployment

**Update `frontend/.env.production`**:
```env
NEXT_PUBLIC_API_URL=https://ai-agent-backend-xxxxx-uc.a.run.app
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**Update `frontend/next.config.js`**:
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export', // Static export for Firebase Hosting
  images: {
    unoptimized: true, // Required for static export
  },
  trailingSlash: true,
}

module.exports = nextConfig
```

### 2. Build and Deploy

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Initialize Firebase Hosting (first time only)
firebase init hosting

# Deploy to Firebase Hosting
firebase deploy --only hosting

# Your app will be available at:
# https://YOUR_PROJECT_ID.web.app
# https://YOUR_PROJECT_ID.firebaseapp.com
```

### 3. Configure Custom Domain

```bash
# Add custom domain via Firebase Console or CLI
firebase hosting:channel:deploy production --expires 30d

# In Firebase Console:
# Hosting → Add custom domain → Follow DNS verification steps
```

---

## Mobile Deployment

### iOS Deployment (App Store)

#### 1. Prepare iOS App

```bash
cd mobile

# Update version in pubspec.yaml
version: 1.0.0+1

# Build iOS app
flutter build ios --release
```

#### 2. Configure in Xcode

1. Open `mobile/ios/Runner.xcworkspace` in Xcode
2. Select "Runner" → "Signing & Capabilities"
3. Set Team and Bundle Identifier
4. Archive the app: Product → Archive
5. Upload to App Store Connect

#### 3. Submit to App Store

1. Go to App Store Connect
2. Create new app
3. Upload build from Xcode
4. Fill in app information
5. Submit for review

### Android Deployment (Google Play Store)

#### 1. Generate Signing Key

```bash
# Create keystore
keytool -genkey -v -keystore android-key.jks -keyalg RSA -keysize 2048 -validity 10000 -alias upload

# Keep this file secure!
mv android-key.jks ~/secure-location/
```

#### 2. Configure Signing

Create `mobile/android/key.properties`:
```properties
storePassword=your-keystore-password
keyPassword=your-key-password
keyAlias=upload
storeFile=/path/to/android-key.jks
```

Update `mobile/android/app/build.gradle`:
```gradle
def keystoreProperties = new Properties()
def keystorePropertiesFile = rootProject.file('key.properties')
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    signingConfigs {
        release {
            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

#### 3. Build and Deploy

```bash
# Build app bundle
flutter build appbundle --release

# Output: build/app/outputs/bundle/release/app-release.aab

# Upload to Google Play Console
# https://play.google.com/console
```

---

## n8n Deployment

### Option 1: Cloud Run Deployment

**Create `n8n/Dockerfile`**:
```dockerfile
FROM n8nio/n8n:latest

USER root

# Install additional dependencies if needed
RUN apk add --update --no-cache \
    python3 \
    py3-pip

USER node

EXPOSE 5678

CMD ["n8n"]
```

**Deploy to Cloud Run**:
```bash
cd n8n

# Build image
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/n8n

# Deploy
gcloud run deploy n8n \
  --image gcr.io/YOUR_PROJECT_ID/n8n \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 1Gi \
  --cpu 1 \
  --set-env-vars "N8N_BASIC_AUTH_ACTIVE=true,N8N_BASIC_AUTH_USER=admin" \
  --set-secrets "N8N_BASIC_AUTH_PASSWORD=n8n-password:latest"
```

### Option 2: n8n Cloud

1. Sign up at https://n8n.cloud
2. Create workspace
3. Import workflows from `n8n/workflows/`
4. Configure credentials
5. Update backend webhook URLs

---

## Infrastructure as Code (Terraform)

### 1. Setup Terraform

**Create `infrastructure/terraform/main.tf`**:
```hcl
terraform {
  required_version = ">= 1.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
  backend "gcs" {
    bucket = "YOUR_PROJECT_ID-terraform-state"
    prefix = "terraform/state"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Cloud Run Backend
resource "google_cloud_run_service" "backend" {
  name     = "ai-agent-backend"
  location = var.region

  template {
    spec {
      containers {
        image = "gcr.io/${var.project_id}/ai-agent-backend:latest"

        resources {
          limits = {
            memory = "2Gi"
            cpu    = "2"
          }
        }

        env {
          name  = "GOOGLE_CLOUD_PROJECT"
          value = var.project_id
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }
}

# Firestore Database
resource "google_firestore_database" "database" {
  project     = var.project_id
  name        = "(default)"
  location_id = var.region
  type        = "FIRESTORE_NATIVE"
}

# Cloud Storage Bucket
resource "google_storage_bucket" "assets" {
  name          = "${var.project_id}-assets"
  location      = var.region
  force_destroy = false

  uniform_bucket_level_access = true

  lifecycle_rule {
    condition {
      age = 365
    }
    action {
      type = "Delete"
    }
  }
}
```

**Create `infrastructure/terraform/variables.tf`**:
```hcl
variable "project_id" {
  description = "GCP Project ID"
  type        = string
}

variable "region" {
  description = "GCP Region"
  type        = string
  default     = "us-central1"
}

variable "environment" {
  description = "Environment (dev/staging/prod)"
  type        = string
  default     = "prod"
}
```

### 2. Deploy with Terraform

```bash
cd infrastructure/terraform

# Initialize Terraform
terraform init

# Plan deployment
terraform plan -var="project_id=YOUR_PROJECT_ID"

# Apply configuration
terraform apply -var="project_id=YOUR_PROJECT_ID"
```

---

## CI/CD Setup

### GitHub Actions Deployment

**Create `.github/workflows/deploy.yml`**:
```yaml
name: Deploy to Production

on:
  push:
    branches:
      - main

env:
  PROJECT_ID: ${{ secrets.GCP_PROJECT_ID }}
  REGION: us-central1

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - id: auth
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}

      - name: Set up Cloud SDK
        uses: google-github-actions/setup-gcloud@v1

      - name: Build and Deploy Backend
        run: |
          cd backend
          gcloud builds submit --tag gcr.io/$PROJECT_ID/ai-agent-backend
          gcloud run deploy ai-agent-backend \
            --image gcr.io/$PROJECT_ID/ai-agent-backend \
            --platform managed \
            --region $REGION

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install and Build
        run: |
          cd frontend
          npm ci
          npm run build

      - name: Deploy to Firebase
        uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: ${{ secrets.GITHUB_TOKEN }}
          firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
          channelId: live
          projectId: ${{ secrets.FIREBASE_PROJECT_ID }}
```

---

## Monitoring & Logging

### 1. Cloud Logging

```bash
# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=ai-agent-backend" --limit 50

# Create log-based metrics
gcloud logging metrics create api_errors \
  --description="API Error Count" \
  --log-filter='resource.type="cloud_run_revision" severity="ERROR"'
```

### 2. Cloud Monitoring

```bash
# Create uptime check
gcloud monitoring uptime-configs create https://YOUR_API_URL/health \
  --display-name="Backend Health Check"

# Create alert policy
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL_ID \
  --display-name="High Error Rate" \
  --condition-display-name="Error rate > 5%" \
  --condition-threshold-value=5 \
  --condition-threshold-duration=300s
```

### 3. Application Performance Monitoring

Add to `backend/main.py`:
```python
from google.cloud import trace_v1
from opentelemetry import trace
from opentelemetry.exporter.cloud_trace import CloudTraceSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Setup tracing
tracer_provider = TracerProvider()
tracer_provider.add_span_processor(
    BatchSpanProcessor(CloudTraceSpanExporter())
)
trace.set_tracer_provider(tracer_provider)
```

---

## Production Best Practices

### Security

- [ ] Enable Cloud Armor for DDoS protection
- [ ] Implement rate limiting
- [ ] Use Secret Manager for all sensitive data
- [ ] Enable VPC Service Controls
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Implement proper CORS policies
- [ ] Enable HTTPS only

### Performance

- [ ] Enable Cloud CDN
- [ ] Optimize database queries
- [ ] Implement caching (Redis/Memorystore)
- [ ] Use connection pooling
- [ ] Optimize image sizes
- [ ] Enable compression
- [ ] Monitor and optimize cold starts

### Reliability

- [ ] Set up proper health checks
- [ ] Implement circuit breakers
- [ ] Configure auto-scaling
- [ ] Set up backup and disaster recovery
- [ ] Use multiple regions for HA
- [ ] Implement graceful degradation
- [ ] Set up proper alerting

### Cost Optimization

- [ ] Use committed use discounts
- [ ] Implement Cloud Run min instances wisely
- [ ] Clean up unused resources
- [ ] Optimize Firestore queries
- [ ] Use Cloud Storage lifecycle policies
- [ ] Monitor and set budget alerts
- [ ] Review and optimize container sizes

---

## Rollback Procedures

### Backend Rollback

```bash
# List revisions
gcloud run revisions list --service ai-agent-backend --region us-central1

# Rollback to specific revision
gcloud run services update-traffic ai-agent-backend \
  --to-revisions REVISION_NAME=100 \
  --region us-central1
```

### Frontend Rollback

```bash
# View hosting releases
firebase hosting:releases:list

# Rollback to previous release
firebase hosting:rollback
```

---

## Post-Deployment Checklist

- [ ] Verify all services are running
- [ ] Test critical user flows
- [ ] Check monitoring dashboards
- [ ] Verify logs are collecting
- [ ] Test mobile apps on real devices
- [ ] Confirm email notifications working
- [ ] Verify custom domains working
- [ ] Check SSL certificates valid
- [ ] Update documentation
- [ ] Notify team of deployment

---

Congratulations! Your AI Agent App Template is now deployed to production.
