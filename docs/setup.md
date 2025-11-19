# Setup Guide

Complete step-by-step guide to set up the AI Agent App Template locally and in the cloud.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Google Cloud Setup](#google-cloud-setup)
3. [Firebase Setup](#firebase-setup)
4. [Backend Setup](#backend-setup)
5. [Frontend Setup](#frontend-setup)
6. [Mobile Setup](#mobile-setup)
7. [n8n Setup](#n8n-setup)
8. [Local Development](#local-development)

---

## Prerequisites

### Required Software
- **Python**: 3.11 or higher
- **Node.js**: 18.x or higher
- **npm/yarn**: Latest version
- **Flutter**: 3.0 or higher
- **Docker**: 20.x or higher
- **Docker Compose**: 2.x or higher
- **Git**: Latest version
- **gcloud CLI**: Latest version

### Required Accounts
- Google Cloud Platform account
- Firebase account (included with GCP)
- GitHub account (for version control)
- n8n Cloud account (optional) or self-hosted

### Installation

**macOS**:
```bash
# Install Homebrew
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install dependencies
brew install python@3.11 node docker flutter
brew install --cask google-cloud-sdk

# Install Docker Desktop
brew install --cask docker
```

**Linux (Ubuntu/Debian)**:
```bash
# Update package list
sudo apt update

# Install Python
sudo apt install python3.11 python3.11-venv python3-pip

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER

# Install Flutter
sudo snap install flutter --classic

# Install gcloud CLI
curl https://sdk.cloud.google.com | bash
```

**Windows**:
```powershell
# Install Chocolatey
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))

# Install dependencies
choco install python nodejs docker-desktop flutter git gcloudsdk
```

---

## Google Cloud Setup

### 1. Create a New Project

```bash
# Login to Google Cloud
gcloud auth login

# Create a new project
gcloud projects create YOUR_PROJECT_ID --name="AI Agent App"

# Set the project as default
gcloud config set project YOUR_PROJECT_ID

# Enable billing (replace BILLING_ACCOUNT_ID)
gcloud billing projects link YOUR_PROJECT_ID --billing-account=BILLING_ACCOUNT_ID
```

### 2. Enable Required APIs

```bash
# Enable APIs
gcloud services enable \
  cloudbuild.googleapis.com \
  run.googleapis.com \
  firestore.googleapis.com \
  storage.googleapis.com \
  secretmanager.googleapis.com \
  cloudscheduler.googleapis.com \
  logging.googleapis.com \
  monitoring.googleapis.com \
  firebase.googleapis.com
```

### 3. Create Service Account

```bash
# Create service account
gcloud iam service-accounts create ai-agent-app \
  --display-name="AI Agent App Service Account"

# Grant necessary roles
gcloud projects add-iam-policy-binding YOUR_PROJECT_ID \
  --member="serviceAccount:ai-agent-app@YOUR_PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/editor"

# Generate service account key
gcloud iam service-accounts keys create ./service-account-key.json \
  --iam-account=ai-agent-app@YOUR_PROJECT_ID.iam.gserviceaccount.com

# IMPORTANT: Keep this file secure and never commit to git
echo "service-account-key.json" >> .gitignore
```

### 4. Setup Secret Manager

```bash
# Store ADK API key (if you have one)
echo -n "your-adk-api-key" | gcloud secrets create adk-api-key \
  --data-file=- \
  --replication-policy="automatic"

# Store other secrets as needed
echo -n "your-n8n-api-key" | gcloud secrets create n8n-api-key \
  --data-file=- \
  --replication-policy="automatic"
```

---

## Firebase Setup

### 1. Initialize Firebase Project

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select the following options:
# - Firestore
# - Functions
# - Hosting
# - Storage
# - Emulators
```

### 2. Configure Firestore

Create `firestore.rules`:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Chat sessions
    match /chatSessions/{sessionId} {
      allow read: if request.auth != null &&
        resource.data.userId == request.auth.uid;
      allow write: if request.auth != null;
    }

    // Messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }

    // Agents (public read, admin write)
    match /agents/{agentId} {
      allow read: if true;
      allow write: if request.auth.token.admin == true;
    }
  }
}
```

Create `firestore.indexes.json`:
```json
{
  "indexes": [
    {
      "collectionGroup": "messages",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "sessionId", "order": "ASCENDING" },
        { "fieldPath": "timestamp", "order": "ASCENDING" }
      ]
    },
    {
      "collectionGroup": "chatSessions",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "userId", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ],
  "fieldOverrides": []
}
```

Deploy Firestore configuration:
```bash
firebase deploy --only firestore
```

### 3. Configure Firebase Authentication

```bash
# Enable authentication methods via Firebase Console
# Or use Firebase CLI
firebase auth:export accounts.json
```

Enable these providers in Firebase Console:
- Email/Password
- Google
- GitHub (optional)

### 4. Get Firebase Config

1. Go to Firebase Console → Project Settings
2. Under "Your apps", click "Web app" icon
3. Copy the Firebase config object

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## Backend Setup

### 1. Clone and Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # macOS/Linux
# OR
venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

### 2. Create requirements.txt

```txt
fastapi==0.104.1
uvicorn[standard]==0.24.0
pydantic==2.5.0
pydantic-settings==2.1.0
python-dotenv==1.0.0
firebase-admin==6.2.0
google-cloud-aiplatform==1.38.0
google-generativeai==0.3.0
httpx==0.25.1
python-jose[cryptography]==3.3.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.6
websockets==12.0
aiofiles==23.2.1
```

### 3. Create Environment File

Create `backend/.env`:
```env
# Google Cloud
GOOGLE_CLOUD_PROJECT=your-project-id
GOOGLE_APPLICATION_CREDENTIALS=../service-account-key.json

# Firebase
FIREBASE_CREDENTIALS=../service-account-key.json

# Google ADK
ADK_API_KEY=your-adk-api-key

# n8n
N8N_WEBHOOK_URL=http://localhost:5678/webhook
N8N_API_KEY=your-n8n-api-key

# API Settings
API_HOST=0.0.0.0
API_PORT=8000
DEBUG=True

# Security
SECRET_KEY=your-secret-key-generate-with-openssl-rand-hex-32
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### 4. Initialize Backend

Create `backend/main.py`:
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import firebase_admin
from firebase_admin import credentials
import os

# Initialize Firebase Admin
cred = credentials.Certificate(os.getenv("FIREBASE_CREDENTIALS"))
firebase_admin.initialize_app(cred)

app = FastAPI(
    title="AI Agent API",
    description="FastAPI backend with Google ADK",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
```

### 5. Run Backend

```bash
# From backend directory
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Or using Python
python main.py
```

Visit: http://localhost:8000/docs for API documentation

---

## Frontend Setup

### 1. Create Next.js App

```bash
# Create Next.js app with TypeScript
npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir

cd frontend
```

### 2. Install Dependencies

```bash
npm install firebase @firebase/auth @firebase/firestore
npm install zustand axios swr
npm install @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install lucide-react
npm install -D @types/node
```

### 3. Configure Environment

Create `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_API_KEY=your-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef
```

### 4. Setup Firebase Client

Create `frontend/lib/firebase.ts`:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

### 5. Run Frontend

```bash
npm run dev
```

Visit: http://localhost:3000

---

## Mobile Setup

### 1. Create Flutter App

```bash
flutter create mobile
cd mobile
```

### 2. Add Dependencies

Edit `mobile/pubspec.yaml`:
```yaml
dependencies:
  flutter:
    sdk: flutter

  # Firebase
  firebase_core: ^2.24.0
  firebase_auth: ^4.15.0
  cloud_firestore: ^4.13.0
  firebase_storage: ^11.5.0

  # State Management
  provider: ^6.1.0

  # HTTP
  http: ^1.1.0
  dio: ^5.4.0

  # UI
  google_fonts: ^6.1.0
  flutter_svg: ^2.0.9

  # Local Storage
  shared_preferences: ^2.2.2

  # Push Notifications
  firebase_messaging: ^14.7.0
```

### 3. Configure Firebase for Mobile

**iOS Setup**:
```bash
# Download GoogleService-Info.plist from Firebase Console
# Place in mobile/ios/Runner/

# Update ios/Runner/Info.plist
```

**Android Setup**:
```bash
# Download google-services.json from Firebase Console
# Place in mobile/android/app/

# Update android/build.gradle and android/app/build.gradle
```

### 4. Initialize Firebase

Create `mobile/lib/core/config/firebase_config.dart`:
```dart
import 'package:firebase_core/firebase_core.dart';

class FirebaseConfig {
  static Future<void> initialize() async {
    await Firebase.initializeApp();
  }
}
```

### 5. Run Mobile App

```bash
# List available devices
flutter devices

# Run on specific device
flutter run -d <device-id>

# For iOS simulator
flutter run -d ios

# For Android emulator
flutter run -d android
```

---

## n8n Setup

### 1. Docker Compose Setup

Create `n8n/docker-compose.yml`:
```yaml
version: '3.8'

services:
  n8n:
    image: n8nio/n8n:latest
    container_name: n8n
    ports:
      - "5678:5678"
    environment:
      - N8N_BASIC_AUTH_ACTIVE=true
      - N8N_BASIC_AUTH_USER=admin
      - N8N_BASIC_AUTH_PASSWORD=your-password
      - N8N_HOST=localhost
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - WEBHOOK_URL=http://localhost:5678/
    volumes:
      - n8n_data:/home/node/.n8n
      - ./workflows:/home/node/.n8n/workflows

volumes:
  n8n_data:
```

### 2. Start n8n

```bash
cd n8n
docker-compose up -d
```

Visit: http://localhost:5678

### 3. Configure Webhooks

In n8n UI:
1. Create new workflow
2. Add "Webhook" trigger node
3. Set webhook path: `/webhook/agent-event`
4. Save and activate workflow

Update backend `.env`:
```env
N8N_WEBHOOK_URL=http://localhost:5678/webhook/agent-event
```

---

## Local Development

### 1. Start All Services

Create `docker-compose.yml` at project root:
```yaml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "8000:8000"
    environment:
      - FIREBASE_CREDENTIALS=/app/service-account-key.json
    volumes:
      - ./backend:/app
      - ./service-account-key.json:/app/service-account-key.json
    depends_on:
      - n8n

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    volumes:
      - ./frontend:/app
      - /app/node_modules

  n8n:
    image: n8nio/n8n:latest
    ports:
      - "5678:5678"
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
```

### 2. Start Everything

```bash
# Start all services
docker-compose up

# Or start individually:
# Terminal 1 - Backend
cd backend && uvicorn main:app --reload

# Terminal 2 - Frontend
cd frontend && npm run dev

# Terminal 3 - n8n
cd n8n && docker-compose up

# Terminal 4 - Mobile (optional)
cd mobile && flutter run
```

### 3. Firebase Emulators (Optional)

```bash
# Start Firebase emulators
firebase emulators:start

# Available at:
# - Auth: http://localhost:9099
# - Firestore: http://localhost:8080
# - Storage: http://localhost:9199
```

---

## Verification

Test each component:

```bash
# Backend health check
curl http://localhost:8000/health

# Frontend
open http://localhost:3000

# n8n
open http://localhost:5678

# Mobile
flutter doctor
```

---

## Next Steps

1. Review `docs/architecture.md` for system design
2. Review `docs/deployment.md` for production deployment
3. Start building your first agent!
4. Configure custom workflows in n8n
5. Customize the mobile app UI

---

## Troubleshooting

### Common Issues

**Firebase Admin SDK Errors**:
- Verify service account key path
- Check IAM permissions
- Ensure APIs are enabled

**Port Already in Use**:
```bash
# Find and kill process on port 8000
lsof -ti:8000 | xargs kill -9
```

**Flutter Build Errors**:
```bash
flutter clean
flutter pub get
flutter doctor --verbose
```

**Docker Issues**:
```bash
docker-compose down
docker system prune -a
docker-compose up --build
```

For more help, check GitHub issues or documentation.
