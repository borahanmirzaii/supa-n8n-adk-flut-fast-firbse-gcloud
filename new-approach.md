Here’s a systematic, “from-zero-to-CI/CD” plan that:

* Uses **latest-ish stable versions** of everything
* Uses **pnpm** (not npm)
* Uses **uv** (not pip)
* Gives you **concrete file / folder + config snippets** you can drop into Cursor.

---

## 0. Version Matrix (what we’ll target)

Based on current releases:

* **Node.js**: ≥ 20 (Firebase JS SDK 12 requires Node 20+ in Node environments) ([Firebase][1])
* **Next.js**: `16.0.3` (latest on npm) ([npmjs.com][2])
* **Package manager**: `pnpm` `10.x` (latest stable, not v11 alpha) ([npmjs.com][3])
* **Firebase JS SDK**: latest **12.x modular** (`firebase` package) ([Firebase][1])
* **FastAPI**: `0.121.2` ([PyPI][4])
* **Python project manager**: `uv` `0.9.x` ([GitHub][5])
* **Flutter**: `3.38.x` stable + Dart `3.10` ([Flutter Docs][6])
* **FlutterFire**: `firebase_core 4.x` and friends (current major) ([Firebase][7])
* **Google ADK**: current Python ADK from GitHub/docs ([GitHub][8])

---

## 1. Monorepo Layout + Tooling

### 1.1 Folder structure

```text
/aip
  pnpm-workspace.yaml
  package.json               # root config, scripts
  firebase.json
  firestore.rules
  storage.rules
  .firebaserc

  /apps
    /web                     # Next.js 16 + Firebase Hosting
    /agents                  # FastAPI + ADK
    /mobile                  # Flutter app

  /infra
    /cloud-run               # Dockerfile, deploy scripts for agents
    /ci                      # shared scripts used in CI

  /.github
    /workflows
      deploy-web.yml
      deploy-agents.yml
      ci-flutter.yml
```

### 1.2 pnpm workspace

```yaml
# pnpm-workspace.yaml
packages:
  - "apps/*"
  - "infra/*"
```

### 1.3 Root `package.json`

```jsonc
{
  "name": "aip-monorepo",
  "private": true,
  "packageManager": "pnpm@10.22.0",
  "scripts": {
    "web:dev": "pnpm --filter @aip/web dev",
    "web:build": "pnpm --filter @aip/web build",
    "web:lint": "pnpm --filter @aip/web lint",
    "firebase:deploy:web": "firebase deploy --only hosting,functions,firestore,storage"
  }
}
```

---

## 2. Next.js 16 + Firebase Hosting (with ag-ui)

### 2.1 Web app structure

```text
/apps/web
  package.json
  next.config.mjs
  tsconfig.json
  app/
    layout.tsx
    page.tsx
    api/
      agents/route.ts       # proxy to Cloud Run FastAPI
  components/
    ag/AgentProvider.tsx
  lib/
    firebaseClient.ts
    agentClient.ts
```

### 2.2 `apps/web/package.json`

Use **Next 16**, **React 19 RC or 18 depending on stability**; you can start with React 18 if you want less bleeding-edge, but I’ll assume you’re okay with what Next 16 expects.

```jsonc
{
  "name": "@aip/web",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev --turbo",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "16.0.3",
    "react": ">=18.3.0",
    "react-dom": ">=18.3.0",
    "@copilotkit/react-core": "^1.0.0",
    "firebase": "^12.6.0",
    "typescript": "^5.6.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.0",
    "@types/node": "^22.0.0",
    "eslint": "^9.0.0"
  }
}
```

> You’ll install with `pnpm i` at root, pnpm will hoist as needed.

### 2.3 Firebase Hosting + Functions config

At the repo root:

```jsonc
// firebase.json
{
  "hosting": {
    "public": "apps/web/.next",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "function": "nextApp"
      }
    ]
  },
  "functions": {
    "source": "apps/web/firebase-functions",
    "runtime": "nodejs22"
  },
  "firestore": {
    "rules": "firestore.rules"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

Inside `apps/web/firebase-functions` you’ll have your Next SSR adapter (either via `next-firebase-hosting` or a custom handler) – but since you’re already comfortable with Next, think of this as just a wrapper around `next/server`.

> If you’d rather keep Next on Vercel, you can still use Firebase as backend-only, but here I’m following your “host on Google/Firebase” direction.

### 2.4 Firebase client init (modular v12)

```ts
// apps/web/lib/firebaseClient.ts
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

let app: FirebaseApp;

export const getFirebaseApp = () => {
  if (!getApps().length) {
    app = initializeApp({
      apiKey: process.env.NEXT_PUBLIC_FB_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FB_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FB_PROJECT_ID!,
      storageBucket: process.env.NEXT_PUBLIC_FB_STORAGE_BUCKET!,
      appId: process.env.NEXT_PUBLIC_FB_APP_ID!
    });
  }
  return app;
};

export const auth = () => getAuth(getFirebaseApp());
export const db = () => getFirestore(getFirebaseApp());
```

> Uses **modular API** as recommended for v9+ and v12. ([The Firebase Blog][9])

### 2.5 ag-ui → FastAPI proxy in Next

```ts
// apps/web/app/api/agents/route.ts
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const body = await req.json();

  const res = await fetch(`${process.env.AGENT_BASE_URL}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  return new Response(await res.text(), {
    status: res.status,
    headers: { "Content-Type": "application/json" }
  });
}
```

---

## 3. FastAPI + ADK (Python) on Cloud Run with uv

### 3.1 Agents app structure

```text
/apps/agents
  pyproject.toml
  uv.lock
  app/
    main.py
    agents/
      core_agent.py
    tools/
      firestore_tools.py
    config.py
```

### 3.2 `pyproject.toml` (managed by uv)

```toml
[project]
name = "aip-agents"
version = "0.1.0"
requires-python = ">=3.11"
dependencies = [
  "fastapi==0.121.2",
  "uvicorn[standard]==0.32.0",
  "google-cloud-firestore>=2.18.0",
  "google-cloud-storage>=2.18.0",
  "google-cloud-logging>=3.11.0",
  "adk-python",  # exact name from ADK PyPI / docs
  "pydantic>=2.8"
]

[project.optional-dependencies]
dev = ["pytest", "httpx", "ruff"]

[tool.uv]
# uv-specific config if you want
```

You’ll manage env & install with:

```bash
uv venv
uv sync    # installs from pyproject, creates uv.lock
uv run app/main.py
```

(uv is explicitly designed as a drop-in modern replacement for pip + venv. ([Astral Docs][10]))

### 3.3 FastAPI + ADK skeleton

```py
# apps/agents/app/main.py
from fastapi import FastAPI
from adk import Agent
from app.agents.core_agent import core_agent

app = FastAPI()
app.state.agent = core_agent

@app.post("/run")
async def run_agent(payload: dict):
  agent = app.state.agent
  return await agent.run(payload)
```

`core_agent` will be built according to ADK docs (tools, workflows, etc.). ([Google GitHub][11])

### 3.4 Dockerfile for Cloud Run with uv

```Dockerfile
# infra/cloud-run/Dockerfile
FROM python:3.11-slim AS base

ENV UV_LINK_MODE=copy \
    PYTHONUNBUFFERED=1

# Install uv
RUN pip install --no-cache-dir uv

WORKDIR /app

# Copy project files
COPY apps/agents/pyproject.toml .
COPY apps/agents/uv.lock .
RUN uv sync --frozen --no-dev

COPY apps/agents ./apps/agents

EXPOSE 8080

CMD ["uv", "run", "apps/agents/app/main.py", "--", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8080"]
```

You can also do `ENTRYPOINT ["uv", "run"]` etc.; the idea is: **no `pip`, no virtualenv**, everything via uv.

---

## 4. Flutter App + Firebase Integration

### 4.1 Create project

From `/apps`:

```bash
flutter create mobile
cd mobile
flutter config --enable-web   # optional
```

### 4.2 Add Firebase (FlutterFire)

Follow latest FlutterFire docs (Firebase says `firebase_core` 4.0.0 is current major). ([Firebase][7])

```bash
dart pub add firebase_core firebase_auth cloud_firestore firebase_storage firebase_messaging
```

…and run:

```bash
flutterfire configure
```

This creates `firebase_options.dart` and wires to your Firebase project.

### 4.3 Minimal Flutter init

```dart
// apps/mobile/lib/main.dart
import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'firebase_options.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp(
    options: DefaultFirebaseOptions.currentPlatform,
  );
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'AIP Mobile',
      theme: ThemeData(useMaterial3: true),
      home: const Scaffold(
        body: Center(child: Text('Hello AIP Mobile')),
      ),
    );
  }
}
```

From here, add providers/services mirroring the Firestore schema below.

---

## 5. Firestore Schema Design

Use **collections** that are easy to share across web + mobile + agents:

```text
projects/{projectId}
  name: string
  ownerId: string (uid)
  createdAt: timestamp

projects/{projectId}/tasks/{taskId}
  title: string
  status: "todo" | "doing" | "done"
  assigneeId: string (uid)
  createdAt: timestamp

agents-sessions/{sessionId}
  userId: string
  createdAt: timestamp
  lastMessageAt: timestamp

agents-sessions/{sessionId}/messages/{messageId}
  role: "user" | "assistant" | "tool"
  content: string
  createdAt: timestamp
```

Agents (FastAPI) read/write using **server SDK** (`google-cloud-firestore`), which bypasses rules and instead uses **IAM**, per Firestore docs. ([Firebase][12])
Clients (Next.js / Flutter) go through security rules.

---

## 6. Firestore Security Rules (version 2)

At root: `firestore.rules`:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    function isSignedIn() {
      return request.auth != null;
    }

    function isOwner() {
      return isSignedIn() && request.auth.uid == resource.data.ownerId;
    }

    match /projects/{projectId} {
      allow read: if isSignedIn() &&
        (resource.data.ownerId == request.auth.uid ||
         request.auth.uid in resource.data.memberIds);

      allow create: if isSignedIn() &&
        request.resource.data.ownerId == request.auth.uid;

      allow update, delete: if isOwner();
    }

    match /projects/{projectId}/tasks/{taskId} {
      allow read: if isSignedIn();
      allow create: if isSignedIn() &&
        request.auth.uid == request.resource.data.assigneeId;
      allow update: if isSignedIn() &&
        request.auth.uid == resource.data.assigneeId;
      allow delete: if false; // no deletes from client
    }

    match /agents-sessions/{sessionId} {
      allow read, write: if isSignedIn() &&
        request.auth.uid == resource.data.userId;
    }

    match /agents-sessions/{sessionId}/messages/{messageId} {
      allow read, write: if isSignedIn() &&
        request.auth.uid == get(/databases/$(database)/documents/agents-sessions/$(sessionId)).data.userId;
    }
  }
}
```

* **Version 2** rules as recommended. ([Firebase][13])
* Agent service (Cloud Run) authenticates via Google service account → rules don’t apply, IAM does.

You can add `storage.rules` analogously for file uploads.

---

## 7. CI/CD: Firebase Hosting + Firestore Rules + Cloud Run

Assume you use **GitHub Actions**.

### 7.1 Deploy web + rules with Firebase

`.github/workflows/deploy-web.yml`:

```yaml
name: Deploy Web to Firebase

on:
  push:
    branches: [main]
    paths:
      - "apps/web/**"
      - "firestore.rules"
      - "storage.rules"
      - "firebase.json"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v3
        with:
          version: 10.22.0

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: "22"
          cache: "pnpm"

      - name: Install deps
        run: pnpm install --frozen-lockfile

      - name: Build web
        working-directory: apps/web
        run: pnpm build

      - name: Install Firebase CLI
        run: npm install -g firebase-tools

      - name: Deploy to Firebase
        env:
          FIREBASE_TOKEN: ${{ secrets.FIREBASE_TOKEN }}
        run: firebase deploy --only hosting,functions,firestore,storage
```

> `FIREBASE_TOKEN` from `firebase login:ci`. ([Firebase][13])

### 7.2 Deploy FastAPI + ADK to Cloud Run

`.github/workflows/deploy-agents.yml`:

```yaml
name: Deploy Agents to Cloud Run

on:
  push:
    branches: [main]
    paths:
      - "apps/agents/**"
      - "infra/cloud-run/**"

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup gcloud
        uses: google-github-actions/setup-gcloud@v2
        with:
          project_id: ${{ secrets.GCP_PROJECT_ID }}
          service_account_key: ${{ secrets.GCP_SA_KEY }}
          export_default_credentials: true

      - name: Build & Push Image
        run: |
          gcloud builds submit \
            --tag gcr.io/${{ secrets.GCP_PROJECT_ID }}/aip-agents \
            infra/cloud-run

      - name: Deploy to Cloud Run
        run: |
          gcloud run deploy aip-agents \
            --image gcr.io/${{ secrets.GCP_PROJECT_ID }}/aip-agents \
            --region=${{ secrets.GCP_REGION }} \
            --platform=managed \
            --allow-unauthenticated \
            --port=8080
```

Here, the Docker build context is `infra/cloud-run` (which includes the Dockerfile copying `apps/agents`).

### 7.3 Flutter CI (tests / analyze only)

`.github/workflows/ci-flutter.yml`:

```yaml
name: Flutter CI

on:
  push:
    branches: [main]
    paths:
      - "apps/mobile/**"

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: subosito/flutter-action@v2
        with:
          channel: "stable"

      - name: Flutter pub get
        working-directory: apps/mobile
        run: flutter pub get

      - name: Analyze
        working-directory: apps/mobile
        run: flutter analyze

      - name: Test
        working-directory: apps/mobile
        run: flutter test
```

---

## 8. Next Steps You Can Take Right Now

1. **Initialize Firebase project** and `firebase init` with: hosting, functions, firestore, storage.
2. **Scaffold Next.js** under `apps/web` using `pnpm create next-app` and then adjust to Next 16 + app router.
3. **Initialize `apps/agents`** with `uv init` style flow: create `pyproject.toml`, `uv sync`, simple FastAPI “hello” + deploy to Cloud Run.
4. **Run `flutterfire configure`** in `/apps/mobile` to bind mobile to the same Firebase project.
5. Wire **ag-ui** to `/api/agents` (Next) and verify it talks to Cloud Run agent.

If you’d like, I can next:

* Generate **concrete file trees + minimal contents** for each of `/apps/web`, `/apps/agents`, and `/apps/mobile` so you can paste them straight into Cursor and iterate.

[1]: https://firebase.google.com/support/release-notes/js?utm_source=chatgpt.com "Firebase JavaScript SDK Release Notes - Google"
[2]: https://www.npmjs.com/package/next?utm_source=chatgpt.com "Next.js"
[3]: https://www.npmjs.com/package/pnpm?utm_source=chatgpt.com "pnpm"
[4]: https://pypi.org/project/fastapi/?utm_source=chatgpt.com "fastapi"
[5]: https://github.com/astral-sh/uv?tab=readme-ov-file&utm_source=chatgpt.com "GitHub - astral-sh/uv"
[6]: https://docs.flutter.dev/release/whats-new?utm_source=chatgpt.com "What's new in the docs"
[7]: https://firebase.google.com/support/release-notes/flutter?utm_source=chatgpt.com "Firebase SDK for Flutter Release Notes - Google"
[8]: https://github.com/google/adk-python?utm_source=chatgpt.com "google/adk-python"
[9]: https://firebase.blog/posts/2021/08/deep-dive-into-the-new-firebase-js-sdk-design/?utm_source=chatgpt.com "Deep dive into the new Firebase JS SDK design"
[10]: https://docs.astral.sh/uv/?utm_source=chatgpt.com "uv"
[11]: https://google.github.io/adk-docs/?utm_source=chatgpt.com "Agent Development Kit - Google"
[12]: https://firebase.google.com/docs/firestore/security/rules-structure?utm_source=chatgpt.com "Structuring Cloud Firestore Security Rules - Firebase - Google"
[13]: https://firebase.google.com/docs/firestore/security/get-started?utm_source=chatgpt.com "Get started with Cloud Firestore Security Rules - Firebase"
