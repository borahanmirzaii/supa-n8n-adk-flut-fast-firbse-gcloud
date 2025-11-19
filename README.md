# AI Agent App Template

A comprehensive AI agent application template leveraging Google Cloud Platform, Firebase, and modern full-stack technologies.

## Architecture Overview

This template provides a production-ready foundation for building AI agent applications with:

- **Backend**: FastAPI + Google ADK (Agent Development Kit) on Cloud Run
- **Frontend**: Next.js 14 with ag-ui (from CopilotKit) on Firebase Hosting
- **Mobile**: Flutter cross-platform app (iOS/Android)
- **Cloud Infrastructure**: Google Cloud Platform + Firebase
- **Workflow Automation**: n8n for extensibility and integrations
- **Database**: Firebase Firestore (NoSQL, real-time)

## Hosting Strategy

| Component | Hosting Platform | Why |
|-----------|-----------------|-----|
| **Next.js 14 Web** | Firebase Hosting + Cloud Functions (SSR) | Seamless Firebase Auth integration, easy CDN + SSR |
| **FastAPI + ADK** | Google Cloud Run | Python runtime, auto-scaling, GPU support if needed |
| **Flutter Mobile** | App Store / Play Store | Native iOS/Android distribution |
| **n8n** | Cloud Run or n8n Cloud | Workflow automation runtime |
| **Database** | Firebase Firestore | Real-time, mobile-first NoSQL database |
| **Storage** | Firebase Storage | File uploads and CDN |
| **Auth** | Firebase Authentication | Unified auth across web/mobile |

## Tech Stack

### Backend (FastAPI + Google ADK)
- **FastAPI**: High-performance Python web framework
- **Google ADK**: Agent Development Kit for building AI agents
- **Firebase Admin SDK**: Server-side Firebase integration
- **Cloud Run**: Container hosting with auto-scaling
- **Google Cloud**: AI/ML services, Pub/Sub, Cloud Tasks

### Frontend (Next.js 14)
- **Next.js 14**: React framework with App Router and SSR
- **ag-ui (CopilotKit)**: Agent UI components for chat interfaces
- **Firebase JS SDK**: Client-side Firebase integration
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first styling

### Mobile (Flutter)
- **Flutter 3.0+**: Cross-platform mobile framework (iOS/Android)
- **Dart**: Programming language
- **Firebase Flutter SDK**: firebase_core, firebase_auth, cloud_firestore
- **HTTP Client**: Communication with FastAPI backend on Cloud Run

### Workflow Automation (n8n)
- **n8n**: Low-code workflow automation
- **Custom integrations**: Extend agent capabilities
- **Webhook triggers**: Event-driven workflows
- **API connections**: Connect to external services

## Project Structure

```
.
├── backend/                 # FastAPI + Google ADK
│   ├── app/
│   │   ├── agents/         # ADK agent implementations
│   │   ├── api/            # API routes
│   │   ├── core/           # Configuration & settings
│   │   ├── models/         # Data models
│   │   └── services/       # Business logic
│   ├── requirements.txt
│   └── main.py
│
├── frontend/               # Next.js application
│   ├── app/                # App router
│   ├── components/         # React components
│   │   └── ag-ui/         # Agent UI components
│   ├── lib/                # Utilities
│   └── package.json
│
├── mobile/                 # Flutter application
│   ├── lib/
│   │   ├── models/
│   │   ├── screens/
│   │   ├── services/
│   │   └── widgets/
│   └── pubspec.yaml
│
├── n8n/                    # n8n workflows
│   ├── workflows/          # Workflow definitions
│   └── credentials/        # Credential templates
│
├── infrastructure/         # Google Cloud & Firebase
│   ├── terraform/          # Infrastructure as Code
│   ├── firebase/           # Firebase config
│   └── docker/             # Container definitions
│
└── docs/                   # Documentation
    ├── architecture.md
    ├── setup.md
    └── deployment.md
```

## Features

### AI Agent Capabilities
- Multi-turn conversations
- Context-aware responses
- Tool/function calling
- Memory and state management
- Custom agent personalities

### Integration Points
- Firebase Authentication (user management)
- Firestore (data persistence)
- Cloud Storage (file uploads)
- n8n webhooks (workflow triggers)
- External API integrations

### Mobile Features
- Cross-platform (iOS/Android)
- Real-time chat interface
- Push notifications
- Offline support
- Biometric authentication

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+
- Flutter SDK 3.0+
- Google Cloud account
- Firebase project
- n8n instance (self-hosted or cloud)

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

### Mobile Setup
```bash
cd mobile
flutter pub get
flutter run
```

### n8n Setup
```bash
cd n8n
docker-compose up -d
# Access n8n at http://localhost:5678
```

## Configuration

### Environment Variables

**Backend (.env)**
```
GOOGLE_CLOUD_PROJECT=your-project-id
FIREBASE_CREDENTIALS=path/to/serviceAccount.json
ADK_API_KEY=your-adk-key
N8N_WEBHOOK_URL=https://your-n8n-instance.com/webhook
```

**Frontend (.env.local)**
```
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_FIREBASE_CONFIG={"apiKey":"..."}
```

**Mobile (lib/config.dart)**
```dart
const String apiBaseUrl = 'https://your-api.com';
```

## Deployment

### Google Cloud Deployment
- **Cloud Run**: FastAPI backend
- **Firebase Hosting**: Next.js frontend
- **Cloud Build**: CI/CD pipeline
- **Cloud Storage**: Static assets

### Mobile Deployment
- **iOS**: App Store via TestFlight
- **Android**: Google Play Store

## Development Roadmap

- [ ] Setup base project structure
- [ ] Configure Google Cloud & Firebase
- [ ] Implement FastAPI backend with ADK
- [ ] Build Next.js frontend with ag-ui
- [ ] Develop Flutter mobile app
- [ ] Setup n8n workflows
- [ ] Integrate all components
- [ ] Add authentication & authorization
- [ ] Implement monitoring & logging
- [ ] Write comprehensive documentation
- [ ] Deploy to production

## Contributing

Contributions are welcome! Please read our contributing guidelines before submitting PRs.

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open a GitHub issue.

---

**Built with Google Cloud, Firebase, FastAPI, Next.js, Flutter, and n8n**
