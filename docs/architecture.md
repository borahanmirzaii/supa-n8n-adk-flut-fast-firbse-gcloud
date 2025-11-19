# System Architecture

## Overview

This AI agent application template follows a microservices architecture with clear separation of concerns across backend, frontend, mobile, and workflow automation layers.

## Architecture Diagram

```
                    ┌───────────────────────────────┐
                    │      Flutter Mobile App       │
                    │   Firebase SDK (Auth/DB/FCM)  │
                    │         (iOS/Android)         │
                    └───────────────┬───────────────┘
                                    │
                    ┌───────────────────────────────────────┐
                    │         Next.js 14 Web App            │
                    │   ag-ui + Firebase Auth + SSR         │
                    │   (Firebase Hosting + Functions)      │
                    └───────────────┬───────────────────────┘
                                    │ HTTPS
                           ┌────────┴────────┐
                           ▼                 ▼
              ┌──────────────────┐   ┌────────────────────────┐
              │ Firebase Backend │   │   FastAPI + ADK Agents  │
              │ Auth, Firestore, │   │ Tools, RAG, Workflows   │
              │ Storage, FCM     │   │    (Google Cloud Run)   │
              └─────────┬────────┘   └───────────┬────────────┘
                        │                        │
                        │                        │
                        ▼                        ▼
              ┌────────────────────────────────────────────┐
              │         Firebase Services                   │
              │  • Firestore (Database)                    │
              │  • Cloud Storage (Files)                   │
              │  • Cloud Functions (Serverless)            │
              │  • Firebase Messaging (Push Notifications) │
              └────────────────────────────────────────────┘
                                    │
                                    ▼
                        ┌───────────────────────┐
                        │  n8n Workflows        │
                        │  (Cloud Run / Cloud)  │
                        └───────────────────────┘
```

## Component Details

### 1. Frontend Layer (Next.js + ag-ui)

**Technology**: Next.js 14+ with App Router
**Hosting**: Firebase Hosting + Cloud Functions (for SSR)
**Key Features**:
- Server-side rendering for SEO via Cloud Functions
- ag-ui (CopilotKit) components for agent chat interactions
- Real-time updates via Firestore listeners
- Firebase JS SDK integration for auth and data
- State management with React Context/Zustand

**Directory Structure**:
```
frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   └── signup/
│   ├── (dashboard)/
│   │   ├── agents/
│   │   ├── chat/
│   │   └── workflows/
│   ├── api/              # API routes
│   └── layout.tsx
├── components/
│   ├── ag-ui/            # Agent UI components
│   ├── chat/
│   └── shared/
└── lib/
    ├── firebase.ts
    ├── api-client.ts
    └── utils.ts
```

### 2. Backend Layer (FastAPI + Google ADK)

**Technology**: FastAPI + Python 3.11+
**Hosting**: Google Cloud Run
**Key Features**:
- RESTful API endpoints
- WebSocket support for real-time chat
- Google ADK agent integration
- Firebase Admin SDK integration

**Directory Structure**:
```
backend/
├── app/
│   ├── agents/
│   │   ├── __init__.py
│   │   ├── base_agent.py
│   │   ├── conversational_agent.py
│   │   └── tool_agent.py
│   ├── api/
│   │   ├── v1/
│   │   │   ├── agents.py
│   │   │   ├── chat.py
│   │   │   ├── users.py
│   │   │   └── webhooks.py
│   │   └── deps.py
│   ├── core/
│   │   ├── config.py
│   │   ├── security.py
│   │   └── firebase.py
│   ├── models/
│   │   ├── agent.py
│   │   ├── message.py
│   │   └── user.py
│   ├── services/
│   │   ├── adk_service.py
│   │   ├── n8n_service.py
│   │   └── storage_service.py
│   └── main.py
├── requirements.txt
└── Dockerfile
```

**Key API Endpoints**:
```
POST   /api/v1/chat/sessions          # Create chat session
POST   /api/v1/chat/message           # Send message
GET    /api/v1/chat/sessions/{id}     # Get session history
WS     /api/v1/chat/ws                # WebSocket connection
POST   /api/v1/agents/create          # Create custom agent
GET    /api/v1/agents/list            # List available agents
POST   /api/v1/webhooks/n8n           # n8n webhook endpoint
```

### 3. Mobile Layer (Flutter)

**Technology**: Flutter 3.0+ (Dart)
**Platforms**: iOS, Android
**Key Features**:
- Cross-platform native performance
- Firebase SDK integration
- Offline-first architecture
- Push notifications

**Directory Structure**:
```
mobile/
├── lib/
│   ├── core/
│   │   ├── config/
│   │   ├── network/
│   │   └── storage/
│   ├── features/
│   │   ├── auth/
│   │   │   ├── data/
│   │   │   ├── domain/
│   │   │   └── presentation/
│   │   ├── chat/
│   │   └── agents/
│   ├── shared/
│   │   ├── widgets/
│   │   └── utils/
│   └── main.dart
├── android/
├── ios/
└── pubspec.yaml
```

### 4. Workflow Automation (n8n)

**Technology**: n8n (Low-code workflow automation)
**Hosting**: Docker on Cloud Run / Self-hosted
**Integration Points**:
- Webhook triggers from FastAPI
- External API integrations
- Data transformation pipelines
- Scheduled workflows

**Common Workflows**:
```
n8n/workflows/
├── agent-notification.json       # Send notifications
├── data-enrichment.json         # Enrich user data
├── external-api-sync.json       # Sync with external APIs
└── scheduled-tasks.json         # Cron-based tasks
```

### 5. Data Layer

#### Firebase Services
- **Authentication**: User management, OAuth providers (Google, Email/Password, GitHub)
- **Firestore**: NoSQL database for real-time data with offline support
- **Cloud Storage**: File uploads (images, documents, user content)
- **Cloud Functions**: Serverless background tasks (Next.js SSR, webhooks)
- **Firebase Messaging**: Push notifications for mobile and web
- **Firebase Hosting**: Static site hosting with CDN and SSL

**Firestore Data Models**:
```
Users
├── uid (string)
├── email (string)
├── displayName (string)
├── createdAt (timestamp)
└── preferences (map)

ChatSessions
├── sessionId (string)
├── userId (string)
├── agentId (string)
├── messages (array)
├── context (map)
└── createdAt (timestamp)

Messages
├── messageId (string)
├── sessionId (string)
├── role (string: user|agent|system)
├── content (string)
└── timestamp (timestamp)

Agents
├── agentId (string)
├── name (string)
├── description (string)
├── config (map)
└── tools (array)
```

### 6. Infrastructure Layer (Google Cloud)

**Services Used**:
- **Cloud Run**: Container hosting (FastAPI, n8n)
- **Cloud Build**: CI/CD pipelines
- **Cloud Storage**: Static assets, backups
- **Cloud Load Balancing**: Traffic distribution
- **Cloud Monitoring**: Logging & metrics
- **Secret Manager**: Environment variables

**Infrastructure as Code**:
```
infrastructure/terraform/
├── main.tf
├── variables.tf
├── outputs.tf
├── modules/
│   ├── cloud-run/
│   ├── firebase/
│   ├── networking/
│   └── storage/
└── environments/
    ├── dev/
    ├── staging/
    └── prod/
```

## Data Flow

### Chat Message Flow
```
1. User sends message from Frontend/Mobile
   ↓
2. API Gateway routes to FastAPI
   ↓
3. FastAPI validates & authenticates request
   ↓
4. Message saved to Firestore
   ↓
5. Google ADK processes message
   ├─→ Retrieves context from Firestore
   ├─→ Calls tools/functions if needed
   ├─→ May trigger n8n workflow
   └─→ Generates response
   ↓
6. Response saved to Firestore
   ↓
7. Real-time update pushed to clients
   ↓
8. Frontend/Mobile displays response
```

### n8n Integration Flow
```
1. Agent triggers workflow (webhook call)
   ↓
2. n8n receives webhook trigger
   ↓
3. Workflow executes steps:
   ├─→ Call external APIs
   ├─→ Transform data
   ├─→ Update database
   └─→ Send notifications
   ↓
4. Workflow sends response back to FastAPI
   ↓
5. FastAPI processes result
   ↓
6. Updates sent to client
```

## Security Architecture

### Authentication & Authorization
- Firebase Authentication for identity management
- JWT tokens for API authentication
- Role-based access control (RBAC)
- API key management via Secret Manager

### Network Security
- HTTPS only (TLS 1.3)
- CORS configuration
- Rate limiting
- DDoS protection via Cloud Armor

### Data Security
- Encryption at rest (Firestore, Cloud Storage)
- Encryption in transit (TLS)
- Field-level encryption for sensitive data
- Regular security audits

## Scaling Strategy

### Horizontal Scaling
- Cloud Run auto-scaling (0-100+ instances)
- Firestore automatic scaling
- Load balancer distribution

### Performance Optimization
- CDN for static assets (Firebase Hosting)
- Database indexing
- Caching layer (Redis/Memorystore)
- WebSocket connection pooling

### Cost Optimization
- Cloud Run scale-to-zero
- Firestore query optimization
- Cloud Storage lifecycle policies
- Resource quota management

## Monitoring & Observability

### Logging
- Cloud Logging for centralized logs
- Structured logging (JSON format)
- Log levels: ERROR, WARN, INFO, DEBUG

### Metrics
- Cloud Monitoring dashboards
- Custom metrics for agents
- API latency tracking
- Error rate monitoring

### Alerting
- Cloud Monitoring alerts
- PagerDuty/Slack integrations
- SLA monitoring
- Budget alerts

## Development Workflow

```
Local Development
├── Docker Compose (backend, n8n, databases)
├── Firebase Emulators
└── Hot reload (FastAPI, Next.js, Flutter)

CI/CD Pipeline (Cloud Build)
├── 1. Run tests
├── 2. Build containers
├── 3. Deploy to staging
├── 4. Run integration tests
└── 5. Deploy to production (manual approval)
```

## Future Enhancements

1. **Multi-agent orchestration**: Multiple agents collaborating
2. **Vector database**: For semantic search (Pinecone/Weaviate)
3. **WebRTC**: For voice/video calls
4. **Kubernetes**: For advanced orchestration
5. **GraphQL**: Alternative to REST API
6. **Redis**: For caching and pub/sub

---

This architecture provides a solid foundation for building scalable, maintainable AI agent applications.
