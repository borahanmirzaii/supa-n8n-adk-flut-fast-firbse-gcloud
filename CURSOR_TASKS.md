# Cursor Implementation Tasks

## Overview

This document provides step-by-step implementation tasks for building a production-ready FastAPI + Next.js application with Firebase integration. Tasks are organized by priority and account for existing implementations.

## Current State Analysis

### ✅ Already Implemented

- **Authentication Middleware**: Firebase Auth token validation via `get_current_user` dependency (`apps/agents/app/core/dependencies.py`)
- **Agent CRUD**: Full CRUD operations (`apps/agents/app/api/v1/agents.py`)
  - POST `/api/v1/agents` - Create agent
  - GET `/api/v1/agents` - List agents
  - GET `/api/v1/agents/{id}` - Get agent
  - PUT `/api/v1/agents/{id}` - Update agent
  - DELETE `/api/v1/agents/{id}` - Delete agent
- **Chat Endpoints**: Chat and streaming (`apps/agents/app/api/v1/chat.py`)
  - POST `/api/v1/chat` - Send message
  - POST `/api/v1/chat/stream` - Streaming response (SSE)
  - POST `/api/v1/chat/sessions` - Create session
  - GET `/api/v1/chat/sessions/{id}` - Get session
- **Basic Frontend**: Components exist (`apps/web/components/features/chat/`, `apps/web/lib/agentClient.ts`)
- **Health Endpoint**: Basic and detailed health checks (`apps/agents/app/api/v1/health.py`)

### 🚧 Gaps to Fill

- Auth register/login endpoints (using Firebase Auth directly from frontend)
- JWT refresh endpoint
- WebSocket support for real-time updates
- Complete frontend API client integration
- React hooks for agents and chat
- Comprehensive UI components
- Error handling & resilience
- Monitoring & observability
- Security hardening
- Data layer abstractions
- Background jobs
- Performance optimization

---

## Task 1: Verify and Start Development Environment

### 1.1 Run Full Verification

```bash
cd /Users/bm/supa-n8n-adk-flut-fast-firbse-gcloud

# Make scripts executable
chmod +x scripts/verify-m4.sh
chmod +x scripts/benchmark.sh

# Verify M4 Max setup
./scripts/verify-m4.sh

# Run preflight checks
just preflight
```

**Expected Output:**
- ✅ All prerequisites installed
- ✅ OrbStack running (if installed)
- ✅ Ports available
- ✅ Environment files exist

### 1.2 Start All Services

```bash
# Clean slate (optional)
just dev-reset

# Start everything
just dev:all

# Or use alias
just d
```

**Wait for:**
- ✅ Agents API is healthy
- ✅ Web App is responding
- ✅ Firebase Emulators UI is accessible

### 1.3 Verify Health

```bash
# Basic health check
just health

# Detailed health check (new endpoint)
curl http://localhost:8080/api/v1/health/detailed | jq .

# Check all services
curl http://localhost:8080/health
curl http://localhost:3000
curl http://localhost:4000
```

**Expected:**
- All endpoints return 200 OK
- Detailed health shows system info, OrbStack detection, Firebase emulator connections

---

## Task 2: Enhance Authentication

### 2.1 Create Auth Endpoints

**File**: `apps/agents/app/api/v1/auth.py`

**Endpoints to create:**

```python
@router.post("/auth/register")
async def register(user_data: UserRegister):
    """Register new user via Firebase Auth"""
    # Create user in Firebase Auth
    # Create user profile in Firestore
    # Return user info

@router.post("/auth/login")
async def login(credentials: UserLogin):
    """Login and get Firebase ID token"""
    # Verify credentials
    # Generate Firebase custom token
    # Return token and user info

@router.get("/auth/me")
async def get_current_user_info(
    current_user: User = Depends(get_current_user)
):
    """Get current user information"""
    # Return user profile from Firestore

@router.post("/auth/refresh")
async def refresh_token(refresh_token: str):
    """Refresh Firebase ID token"""
    # Verify refresh token
    # Generate new ID token
    # Return new token
```

**Note**: Core auth middleware already exists in `apps/agents/app/core/dependencies.py` - leverage `get_current_user` dependency.

### 2.2 Add User Profile Management

**File**: `apps/agents/app/services/user_service.py`

- Create user profile in Firestore on registration
- Update user profile
- Get user profile with caching
- Handle user deletion (GDPR compliance)

### 2.3 Add Multi-Factor Authentication (Optional)

**File**: `apps/agents/app/api/v1/auth.py`

```python
@router.post("/auth/mfa/setup")
async def setup_mfa(current_user: User = Depends(get_current_user)):
    """Setup TOTP-based MFA"""
    # Generate secret
    # Return QR code
    # Store backup codes

@router.post("/auth/mfa/verify")
async def verify_mfa(code: str, token: str):
    """Verify MFA code during login"""
    # Verify TOTP code
    # Return authenticated token
```

### 2.4 Update Frontend Auth Integration

**File**: `apps/web/lib/api/auth.ts`

- Create auth API client functions
- Handle token refresh automatically
- Store tokens securely
- Integrate with existing Firebase Auth

**Validation Commands:**

```bash
# Test registration
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","displayName":"Test User"}'

# Test login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Test get current user (requires token)
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Task 3: Enhance Agent CRUD Operations

### 3.1 Verify Existing Endpoints

**File**: `apps/agents/app/api/v1/agents.py` (already exists)

**Test existing endpoints:**

```bash
# Create agent (requires auth token)
curl -X POST http://localhost:8080/api/v1/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Agent",
    "description": "A test agent",
    "model": "gpt-4",
    "temperature": 0.7
  }'

# List agents
curl http://localhost:8080/api/v1/agents \
  -H "Authorization: Bearer $TOKEN"

# Get agent
curl http://localhost:8080/api/v1/agents/$AGENT_ID \
  -H "Authorization: Bearer $TOKEN"
```

### 3.2 Add Enhancements

**File**: `apps/agents/app/api/v1/agents.py`

**Add:**
- Pagination improvements (cursor-based)
- Filtering and search (by name, model, status)
- Bulk operations (bulk create, update, delete)
- Agent templates endpoint
- Agent sharing/marketplace (optional)
- Agent versioning (optional)

**File**: `apps/agents/app/api/v1/agent_templates.py` (new)

```python
@router.get("/agent-templates")
async def list_templates():
    """List pre-built agent templates"""

@router.post("/agents/{id}/clone")
async def clone_agent(agent_id: str):
    """Clone an existing agent"""
```

### 3.3 Add Repository Pattern

**File**: `apps/agents/app/repositories/agent_repository.py` (new)

- Abstract Firestore operations
- Add query builders
- Implement caching layer
- Handle transactions

---

## Task 4: Enhance Chat Streaming

### 4.1 Verify Existing Streaming

**File**: `apps/agents/app/api/v1/chat.py` (already exists)

**Test existing endpoint:**

```bash
curl -X POST http://localhost:8080/api/v1/chat/stream \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Hello, how are you?",
    "session_id": "optional-session-id"
  }'
```

### 4.2 Add WebSocket Support

**File**: `apps/agents/app/services/websocket_manager.py` (new)

```python
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        """Connect user WebSocket"""
    
    def disconnect(self, user_id: str):
        """Disconnect user WebSocket"""
    
    async def send_personal_message(self, message: str, user_id: str):
        """Send message to specific user"""
    
    async def broadcast(self, message: str):
        """Broadcast to all connected users"""
```

**File**: `apps/agents/app/main.py`

```python
from fastapi import WebSocket, WebSocketDisconnect
from app.services.websocket_manager import ConnectionManager

manager = ConnectionManager()

@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle real-time updates
            await manager.send_personal_message(f"Echo: {data}", user_id)
    except WebSocketDisconnect:
        manager.disconnect(user_id)
```

### 4.3 Add Advanced Chat Features

**File**: `apps/agents/app/services/chat_enhancements.py` (new)

- Message reactions and threading
- File attachments with streaming
- Voice message support (optional)
- Code execution sandboxing (optional)
- Multi-modal inputs (images, documents)

### 4.4 Improve Conversation Storage

**File**: `apps/agents/app/services/conversation_service.py` (enhance)

- Store conversations efficiently
- Retrieve conversation history with pagination
- Handle conversation context (token limits)
- Conversation search and filtering

---

## Task 5: Frontend Integration

### 5.1 Create Comprehensive API Client

**File**: `apps/web/lib/api/client.ts` (new)

```typescript
import { createClient } from '@/lib/api/base'

export const api = {
  auth: {
    login: (email: string, password: string) => 
      createClient().post('/auth/login', { email, password }),
    register: (data: RegisterData) => 
      createClient().post('/auth/register', data),
    me: () => createClient().get('/auth/me'),
    refresh: (token: string) => 
      createClient().post('/auth/refresh', { token }),
  },
  agents: {
    list: (params?: PaginationParams) => 
      createClient().get('/agents', { params }),
    create: (agent: AgentCreate) => 
      createClient().post('/agents', agent),
    get: (id: string) => createClient().get(`/agents/${id}`),
    update: (id: string, agent: AgentUpdate) => 
      createClient().put(`/agents/${id}`, agent),
    delete: (id: string) => createClient().delete(`/agents/${id}`),
    templates: () => createClient().get('/agent-templates'),
  },
  chat: {
    send: (message: ChatMessage) => 
      createClient().post('/chat', message),
    stream: (message: ChatMessage) => 
      createClient().post('/chat/stream', message),
    sessions: {
      create: (data: SessionCreate) => 
        createClient().post('/chat/sessions', data),
      get: (id: string) => 
        createClient().get(`/chat/sessions/${id}`),
    },
  },
}
```

**File**: `apps/web/lib/api/base.ts` (new)

- Base client with auth token injection
- Error handling
- Retry logic
- Request/response interceptors

### 5.2 Create React Hooks

**File**: `apps/web/hooks/useAgent.ts` (new)

```typescript
export function useAgents() {
  // List agents with pagination
}

export function useAgent(id: string) {
  // Get single agent
}

export function useCreateAgent() {
  // Create agent mutation
}

export function useUpdateAgent() {
  // Update agent mutation
}

export function useDeleteAgent() {
  // Delete agent mutation
}
```

**File**: `apps/web/hooks/useChat.ts` (new)

```typescript
export function useChatStream(agentId: string) {
  // Handle streaming chat
}

export function useChatSession(sessionId: string) {
  // Get chat session and messages
}

export function useCreateSession() {
  // Create new chat session
}
```

### 5.3 Create UI Components

**File**: `apps/web/components/features/agents/AgentList.tsx` (new)

- List all user agents
- Search and filter
- Create new agent button
- Agent cards with actions

**File**: `apps/web/components/features/agents/AgentCard.tsx` (new)

- Display agent info
- Edit/delete actions
- Status indicator
- Usage stats

**File**: `apps/web/components/features/agents/AgentForm.tsx` (new)

- Create/edit agent form
- Validation with Zod
- Model selection
- Configuration options

**File**: `apps/web/components/features/chat/ChatInterface.tsx` (enhance)

- Integrate with streaming API
- Real-time message updates
- Message history
- File upload support

**File**: `apps/web/components/features/chat/StreamingMessage.tsx` (new)

- Display streaming message chunks
- Typing indicator
- Error handling
- Retry mechanism

### 5.4 Add State Management

**File**: `apps/web/store/agentStore.ts` (new)

- Zustand store for agents
- Optimistic updates
- Cache management
- Offline support with IndexedDB

**File**: `apps/web/store/chatStore.ts` (new)

- Chat state management
- Message history
- Session management
- State persistence

---

## Task 6: Real-time Features

### 6.1 WebSocket Server

**File**: `apps/agents/app/services/websocket_manager.py` (create)

- Connection management
- User presence tracking
- Message broadcasting
- Room/channel support

**File**: `apps/agents/app/main.py` (update)

- Add WebSocket endpoint
- Integrate with existing routes
- Handle authentication for WebSocket

### 6.2 Frontend WebSocket Hook

**File**: `apps/web/hooks/useWebSocket.ts` (new)

```typescript
export function useWebSocket(userId: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  
  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8080/ws/${userId}`)
    
    ws.onopen = () => setIsConnected(true)
    ws.onclose = () => setIsConnected(false)
    ws.onmessage = (event) => {
      // Handle real-time updates
    }
    
    setSocket(ws)
    return () => ws.close()
  }, [userId])
  
  return { socket, isConnected }
}
```

### 6.3 Advanced Real-time Features

**File**: `apps/agents/app/services/realtime.py` (new)

- Presence system (who's online)
- Typing indicators
- Read receipts
- Live cursor positions (optional)
- Collaborative editing (optional)

---

## Task 7: Error Handling & Resilience

### 7.1 Global Error Handlers

**File**: `apps/agents/app/middleware/error_handler.py` (enhance existing)

- Enhanced error handling middleware
- Structured error responses
- Error logging with context
- Error recovery strategies

### 7.2 Rate Limiting

**File**: `apps/agents/app/middleware/rate_limiter.py` (new)

- Per-user rate limiting
- Per-IP rate limiting
- Sliding window algorithm
- Rate limit headers in responses

### 7.3 Circuit Breaker

**File**: `apps/agents/app/middleware/circuit_breaker.py` (new)

- Circuit breaker for external services (ADK, AI providers)
- Fallback strategies
- Health check integration
- Automatic recovery

### 7.4 Retry Logic

**File**: `apps/agents/app/utils/retry.py` (new)

- Exponential backoff
- Retry with jitter
- Configurable retry policies
- Dead letter queue for failed operations

---

## Task 8: Monitoring & Observability

### 8.1 OpenTelemetry Integration

**File**: `apps/agents/app/core/telemetry.py` (new)

```python
from opentelemetry import trace
from opentelemetry.exporter.otlp.proto.grpc.trace_exporter import OTLPSpanExporter
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor

# Setup tracing
tracer = trace.get_tracer(__name__)
```

### 8.2 Structured Logging

**File**: `apps/agents/app/core/logger.py` (enhance existing)

- Correlation IDs
- Request tracing
- Performance logging
- Error context

### 8.3 Metrics Collection

**File**: `apps/agents/app/core/metrics.py` (new)

- Custom business metrics (agents created, chats/hour)
- Performance metrics (response time, throughput)
- System metrics (CPU, memory)
- Export to Prometheus/StatsD

### 8.4 Distributed Tracing

**File**: `apps/agents/app/middleware/tracing.py` (new)

- Trace request flow across services
- Span creation for operations
- Trace context propagation
- Integration with OpenTelemetry

---

## Task 9: Security Hardening

### 9.1 Input Validation

**File**: `apps/agents/app/middleware/validation.py` (new)

- Input sanitization
- SQL/NoSQL injection prevention
- XSS protection
- File upload validation

### 9.2 CORS Configuration

**File**: `apps/agents/app/core/config.py` (update)

- Environment-specific CORS origins
- Credential handling
- Preflight optimization
- Security headers

### 9.3 Secrets Management

**File**: `apps/agents/app/core/secrets.py` (new)

- Secrets rotation strategy
- Environment variable validation
- Secure storage
- API key management

### 9.4 Security Headers

**File**: `apps/agents/app/middleware/security.py` (new)

- CSP headers
- HSTS
- X-Frame-Options
- X-Content-Type-Options

---

## Task 10: Data Layer Abstractions

### 10.1 Repository Pattern

**File**: `apps/agents/app/repositories/base.py` (new)

- Base repository interface
- Common CRUD operations
- Query abstraction

**File**: `apps/agents/app/repositories/agent_repository.py` (new)

- Agent-specific repository
- Firestore query builders
- Caching integration

**File**: `apps/agents/app/repositories/user_repository.py` (new)

- User repository
- Profile management
- Search functionality

### 10.2 Unit of Work Pattern

**File**: `apps/agents/app/repositories/unit_of_work.py` (new)

- Transaction management
- Batch operations
- Rollback support

### 10.3 Caching Layer

**File**: `apps/agents/app/core/cache.py` (new)

- Redis integration (optional)
- In-memory caching
- Cache invalidation strategies
- TTL management

---

## Task 11: Background Jobs & Queues

### 11.1 Background Tasks

**File**: `apps/agents/app/workers/tasks.py` (new)

```python
from fastapi import BackgroundTasks

@router.post("/agents/{id}/process")
async def process_agent(
    agent_id: str,
    background_tasks: BackgroundTasks
):
    background_tasks.add_task(process_agent_async, agent_id)
    return {"status": "processing"}
```

### 11.2 Message Queue

**File**: `apps/agents/app/workers/queue.py` (new)

- Celery integration (optional)
- Task queue for async operations
- Priority queues
- Retry mechanisms

### 11.3 Scheduled Jobs

**File**: `apps/agents/app/workers/scheduler.py` (new)

- Cleanup old conversations
- Analytics aggregation
- Health checks
- Backup operations

### 11.4 Event-Driven Architecture

**File**: `apps/agents/app/events/publisher.py` (new)

- Pub/sub pattern
- Event publishing
- Event subscribers
- Event store

---

## Task 12: Performance Optimization

### 12.1 Caching Strategy

**File**: `apps/agents/app/core/cache.py` (enhance)

- Response caching
- Query result caching
- Cache warming
- Cache invalidation

### 12.2 Database Optimization

**File**: `firestore.indexes.json` (update)

- Add composite indexes
- Optimize query patterns
- Index monitoring

### 12.3 Frontend Optimization

**File**: `apps/web/next.config.mjs` (update)

- Code splitting
- Image optimization
- Static generation
- CDN integration

### 12.4 API Optimization

**File**: `apps/agents/app/api/v1/agents.py` (enhance)

- Response compression
- Pagination optimization
- Field selection
- Batch operations

---

## Task 13: Testing & Validation

### 13.1 Integration Tests

**File**: `apps/agents/tests/integration/test_auth.py` (new)

- Test user registration
- Test login flow
- Test token refresh
- Test protected endpoints

**File**: `apps/agents/tests/integration/test_agents.py` (new)

- Test agent CRUD
- Test pagination
- Test filtering
- Test permissions

**File**: `apps/agents/tests/integration/test_chat.py` (new)

- Test chat streaming
- Test WebSocket connections
- Test conversation history
- Test error handling

### 13.2 E2E Tests

**File**: `apps/web/tests/e2e/user-journey.spec.ts` (new)

- Complete user registration flow
- Agent creation and chat
- Real-time updates
- Error scenarios

### 13.3 Performance Tests

**File**: `scripts/test-performance.sh` (new)

```bash
# Load test API
ab -n 1000 -c 10 http://localhost:8080/api/v1/health

# Test streaming performance
python scripts/test_streaming.py

# Monitor with OrbStack
orbstack stats
```

### 13.4 WebSocket Tests

**File**: `apps/agents/tests/integration/test_websocket.py` (new)

- Connection tests
- Message broadcasting
- Disconnection handling
- Authentication tests

---

## Task 14: Production Deployment

### 14.1 CI/CD Pipeline

**File**: `.github/workflows/deploy.yml` (new)

- Build and test
- Docker image building
- Deployment to Cloud Run
- Rollback procedures

### 14.2 Infrastructure as Code

**File**: `infra/terraform/` (new)

- GCP resource definitions
- Cloud Run configuration
- Firestore setup
- Networking configuration

### 14.3 Container Optimization

**File**: `infra/cloud-run/Dockerfile` (update)

- Multi-stage builds
- Layer caching
- Security scanning
- Size optimization

### 14.4 Monitoring Setup

**File**: `infra/monitoring/` (new)

- Prometheus configuration
- Grafana dashboards
- Alert rules
- Log aggregation

---

## Task 15: AI/ML Enhancements

### 15.1 RAG Integration

**File**: `apps/agents/app/services/rag_service.py` (new)

- Retrieval Augmented Generation
- Vector database integration
- Document embedding
- Context retrieval

### 15.2 Prompt Optimization

**File**: `apps/agents/app/services/prompt_service.py` (new)

- Prompt templates
- A/B testing for prompts
- Prompt versioning
- Performance tracking

### 15.3 Analytics & Insights

**File**: `apps/agents/app/services/analytics_service.py` (new)

- User behavior tracking
- Agent performance metrics
- Conversation analytics
- Cost tracking

### 15.4 Model Management

**File**: `apps/agents/app/services/model_service.py` (new)

- Model fallback strategies
- Token usage optimization
- Fine-tuning integration
- Model versioning

---

## Execution Order (Priority-Based)

### High Priority (Do First) 🚨

1. ✅ **Task 1**: Verify environment
2. 🚧 **Task 5**: Frontend integration (biggest gap)
3. 🚧 **Task 6**: WebSocket implementation
4. 🚧 **Task 7**: Error handling
5. 🚧 **Task 13**: Testing

### Medium Priority (Do Next) ⚠️

6. **Task 2**: Authentication enhancements
7. **Task 3**: Agent CRUD enhancements
8. **Task 4**: Chat streaming enhancements
9. **Task 8**: Monitoring/observability
10. **Task 9**: Security hardening
11. **Task 12**: Performance optimization

### Low Priority (Do Later) 📋

12. **Task 10**: Data layer abstractions
13. **Task 11**: Background jobs
14. **Task 14**: Production deployment
15. **Task 15**: AI/ML enhancements

---

## Success Criteria

### Functional Requirements

- [ ] User can register and login via API
- [ ] User can create, list, update, delete agents
- [ ] Chat streaming works end-to-end
- [ ] WebSocket real-time updates work
- [ ] Frontend components integrate with backend
- [ ] All tests pass

### Performance Metrics

- [ ] API response time: p50 < 50ms, p99 < 200ms
- [ ] WebSocket latency: < 100ms round trip
- [ ] Chat streaming: First byte < 500ms
- [ ] Frontend TTI: < 2s on 4G
- [ ] Lighthouse score: > 90

### Reliability Metrics

- [ ] Uptime: 99.9% availability
- [ ] Error rate: < 0.1%
- [ ] Recovery time: < 5 minutes
- [ ] Data durability: 99.999%

### Security Requirements

- [ ] All endpoints authenticated
- [ ] Input validation on all inputs
- [ ] Rate limiting active
- [ ] Security headers configured
- [ ] Secrets properly managed

---

## Quick Validation Commands

### After Task 2 (Auth)

```bash
# Register
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123","displayName":"Test User"}'

# Login
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"testpass123"}'

# Get current user (replace $TOKEN)
curl http://localhost:8080/api/v1/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

### After Task 3 (Agents)

```bash
# Create agent
curl -X POST http://localhost:8080/api/v1/agents \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Agent","description":"A test agent","model":"gpt-4"}'

# List agents
curl http://localhost:8080/api/v1/agents \
  -H "Authorization: Bearer $TOKEN"
```

### After Task 4 (Chat)

```bash
# Stream chat
curl -X POST http://localhost:8080/api/v1/chat/stream \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello, how are you?","agent_id":"$AGENT_ID"}'
```

### After Task 6 (WebSocket)

```bash
# Test WebSocket connection
wscat -c ws://localhost:8080/ws/$USER_ID \
  -H "Authorization: Bearer $TOKEN"
```

---

## Notes

- **Existing Code**: Leverage existing implementations in `apps/agents/app/api/v1/agents.py` and `apps/agents/app/api/v1/chat.py`
- **Firebase Auth**: Frontend handles Firebase Auth directly, backend validates tokens
- **Error Handling**: Enhance existing middleware in `apps/agents/app/core/middleware.py`
- **Testing**: Use existing test structure in `apps/agents/tests/`
- **Performance**: Monitor with `just perf:memory` and `just perf:profile`

---

## Getting Started

1. Read `.cursor/instructions.md` for context
2. Review existing code in `apps/agents/app/api/v1/`
3. Start with Task 1 (verification)
4. Proceed with high-priority tasks
5. Test incrementally after each task
6. Document any deviations or issues

