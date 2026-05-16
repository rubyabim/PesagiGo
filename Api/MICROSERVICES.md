# PesagiGo Microservices Architecture

## Overview

PesagiGo backend is now structured as a set of independent microservices, each handling a specific domain:

- **API Gateway** (port 3000) — Routes requests to appropriate services
- **Auth Service** (port 3002) — User authentication and JWT token management
- **Booking Service** (port 3003) — Manage climb bookings
- **Payment Service** (port 3004) — Process payments and webhooks
- **Ticket Service** (port 3005) — Manage and scan admission tickets
- **Catalog Service** (port 3006) — Manage mountains, routes, and climb sessions
- **Weather Service** (port 3007) — Manage weather forecasts
- **Quota Service** (port 3008) — Check available quotas for sessions
- **Admin Service** (port 3009) — Administrative operations

## Running Services

### Development (Locally)

Start individual services with hot-reload:

```bash
# Terminal 1: API Gateway
cd Api
npm run start:gateway:dev

# Terminal 2: Auth Service
npm run start:auth:dev

# Terminal 3: Booking Service
npm run start:booking:dev

# Terminal 4: Payment Service
npm run start:payment:dev

# Terminal 5: Ticket Service
npm run start:ticket:dev

# Terminal 6: Catalog Service
npm run start:catalog:dev

# Terminal 7: Weather Service
npm run start:weather:dev

# Terminal 8: Quota Service
npm run start:quota:dev

# Terminal 9: Admin Service
npm run start:admin:dev
```

### Production (Docker Compose)

```bash
cd Api
docker-compose up -d
```

This will:

- Build all services
- Create PostgreSQL databases (main + auth)
- Start all services on their respective ports
- Configure the API Gateway to route traffic

## Architecture Decisions

### Separate Databases

- **Auth Service**: Separate PostgreSQL for sensitive auth data
- **Other Services**: Share main PostgreSQL (can be split later if needed)

### API Gateway Pattern

- Single entry point at `http://localhost:3000`
- Routes `/api/auth/*` → Auth Service (port 3002)
- Routes `/api/bookings/*` → Booking Service (port 3003)
- Routes `/api/payments/*` → Payment Service (port 3004)
- And so on...

### Service Communication

- Services are stateless and communicate via HTTP
- Environment variables point to service URLs
- Each service validates JWT tokens independently

## Service-Specific Environment Variables

Copy `.env.services.example` to `.env` and adjust:

```bash
# Gateway routing (required if services on different hosts)
AUTH_SERVICE_URL=http://localhost:3002
BOOKING_SERVICE_URL=http://localhost:3003
# ... etc

# Individual service ports
AUTH_PORT=3002
BOOKING_PORT=3003
# ... etc

# Database URLs (for future per-service databases)
AUTH_DATABASE_URL=postgresql://...
BOOKING_DATABASE_URL=postgresql://...
# ... etc
```

## Scaling

### Horizontal Scaling

- Each service can be replicated independently
- Use load balancer (nginx, HAProxy) in front of API Gateway
- Services are stateless

### Database per Service

To fully decouple services:

1. Create separate PostgreSQL instances for each service
2. Update `*_DATABASE_URL` environment variables
3. Run Prisma migrations per service:
   ```bash
   BOOKING_DATABASE_URL=... npx prisma migrate deploy
   ```

## Monitoring

Each service logs to stdout. Check service logs:

```bash
# Docker Compose
docker-compose logs -f auth-service
docker-compose logs -f booking-service
# ... etc
```

## Future Improvements

- [ ] API Gateway load balancing & rate limiting
- [ ] Service-to-service authentication (mTLS)
- [ ] Message queue (RabbitMQ/Kafka) for async operations
- [ ] Distributed tracing (Jaeger)
- [ ] Service mesh (Istio)
- [ ] Per-service databases with data replication
