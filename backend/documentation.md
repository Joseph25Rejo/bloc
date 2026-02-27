# Sales CRM Backend — Documentation

## Overview

A production-ready Sales CRM backend built with **Express.js**, **Mongoose**, **Socket.IO**, **CORS**, and **dotenv**. Features smart lead assignment with round-robin distribution, state-based matching, and daily caller limits. Deployable to **Render**.

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Express.js | HTTP server & routing |
| Mongoose | MongoDB ODM |
| Socket.IO | Real-time WebSocket events |
| CORS | Cross-origin request handling |
| dotenv | Environment variable management |

---

## Folder Structure

```
bloc/
├── .env                          # Environment variables
├── .gitignore                    # Git ignore rules
├── package.json                  # Dependencies & scripts
├── server.js                     # App entry point
├── socket.js                     # Shared Socket.IO module
├── models/
│   ├── Caller.js                 # Caller schema
│   └── Lead.js                   # Lead schema
├── routes/
│   ├── caller.js                 # Caller API routes
│   └── lead.js                   # Lead API routes
└── services/
    └── assignmentService.js      # Smart lead assignment logic
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/sales_crm
NODE_ENV=development
```

| Variable | Description | Required |
|----------|-------------|----------|
| `PORT` | Server port (Render sets this automatically) | No (default: 5000) |
| `MONGO_URI` | MongoDB connection string | Yes |
| `NODE_ENV` | `development` or `production` | No |

---

## Architecture

### Server (`server.js`)

- Creates an HTTP server via `http.createServer(app)` and attaches Socket.IO to it.
- Uses `server.listen()` (not `app.listen()`) — required for Socket.IO + Render.
- Binds to `0.0.0.0` for Render compatibility.
- CORS enabled for all origins.
- JSON body limit set to 50MB.
- Includes a health-check endpoint at `GET /`.
- Global error handler hides stack traces in production.
- 404 catch-all for unknown routes.

### Socket Module (`socket.js`)

Shared module that owns the Socket.IO instance. Prevents circular dependencies.

- `init(server)` — called once in `server.js` at startup.
- `getIO()` — called lazily in route handlers to access the `io` instance.

---

## Database Models

### Caller (`models/Caller.js`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | String | — | **Required.** Caller's name |
| `role` | String | — | Job role/title |
| `languages` | [String] | `[]` | Languages spoken |
| `assignedStates` | [String] | `[]` | States this caller handles |
| `dailyLimit` | Number | `0` | Max leads per day (`0` = unlimited) |
| `todayAssignedCount` | Number | `0` | Leads assigned today (auto-managed) |
| `lastAssignedAt` | Date | `null` | Last assignment timestamp (auto-managed) |
| `lastResetDate` | Date | `null` | Last daily counter reset (auto-managed) |
| `createdAt` | Date | auto | Mongoose timestamp |
| `updatedAt` | Date | auto | Mongoose timestamp |

### Lead (`models/Lead.js`)

| Field | Type | Default | Description |
|-------|------|---------|-------------|
| `name` | String | — | **Required.** Lead's name |
| `phone` | String | — | Phone number |
| `timestamp` | Date | — | Lead creation/ingestion time |
| `leadSource` | String | — | Source (e.g., Website, Referral) |
| `city` | String | — | Lead's city |
| `state` | String | — | Lead's state (used for assignment matching) |
| `assignedCallerId` | ObjectId | `null` | Ref → Caller (auto-set by assignment) |
| `assignedAt` | Date | `null` | Assignment timestamp (auto-set) |
| `createdAt` | Date | auto | Mongoose timestamp |
| `updatedAt` | Date | auto | Mongoose timestamp |

---

## API Endpoints

### Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Returns `{ "status": "ok" }` |

### Callers

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/callers` | Create a new caller |
| GET | `/api/callers` | List all callers |
| PUT | `/api/callers/:id` | Update a caller by ID |

### Leads

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/leads` | Ingest a lead (auto-assigns + emits `newLead`) |
| GET | `/api/leads` | List all leads (populates assigned caller name) |

---

## Assignment Logic (`services/assignmentService.js`)

The `assignLead(leadData)` function runs this pipeline:

```
1. Fetch all callers
       ↓ (error if none exist)
2. Filter by state match
       → If lead.state matches any caller's assignedStates → use those
       → If no match → fallback to all callers
       ↓
3. Reset daily counters
       → If caller's lastResetDate ≠ today → reset todayAssignedCount to 0
       ↓
4. Enforce daily limits
       → Remove callers where dailyLimit > 0 AND todayAssignedCount >= dailyLimit
       ↓ (error if none remain)
5. Round-robin sort
       → Sort by lastAssignedAt ascending (nulls first)
       ↓
6. Select first caller
       → Increment todayAssignedCount
       → Set lastAssignedAt = now
       → Save and return
```

---

## Socket.IO Events

| Event | Direction | Trigger | Payload |
|-------|-----------|---------|---------|
| `newLead` | Server → All Clients | `POST /api/leads` | Full lead document with populated caller name |
| `connection` | Client → Server | Client connects | Logged to console |
| `disconnect` | Client → Server | Client disconnects | Logged to console |
| `message` | Client ↔ Server | Custom messaging | Broadcast to all other clients |

---

## Error Handling

| Status | Condition |
|--------|-----------|
| `400` | Validation error, no callers available, all callers at daily limit |
| `404` | Caller not found (PUT), route not found |
| `500` | Unexpected server error (stack trace hidden in production) |

All responses follow this format:

```json
{
  "success": true|false,
  "message": "...",
  "data": { ... }
}
```

---

## Running Locally

```bash
# Install dependencies
npm install

# Development (with auto-reload)
npm run dev

# Production
npm start
```

---

## Render Deployment

1. Push to GitHub (`.gitignore` keeps `node_modules/` and `.env` out)
2. Render → **New Web Service** → connect your repo
3. Set:
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add **Environment Variables:**
   - `MONGO_URI` = your MongoDB Atlas connection string
   - `NODE_ENV` = `production`
   - _(PORT is auto-set by Render — do not add it)_
5. Deploy

---

## Example API Usage

### Create a Caller

```bash
POST /api/callers
Content-Type: application/json

{
  "name": "Rahul Sharma",
  "role": "Sales Rep",
  "languages": ["Hindi", "English"],
  "assignedStates": ["Maharashtra", "Gujarat"],
  "dailyLimit": 5
}
```

### Ingest a Lead

```bash
POST /api/leads
Content-Type: application/json

{
  "name": "Amit Kumar",
  "phone": "9876543210",
  "leadSource": "Website",
  "city": "Mumbai",
  "state": "Maharashtra"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "Amit Kumar",
    "state": "Maharashtra",
    "assignedCallerId": {
      "_id": "...",
      "name": "Rahul Sharma"
    },
    "assignedAt": "2026-02-26T17:21:06.638Z"
  }
}
```

This also emits a `newLead` Socket.IO event to all connected clients with the same payload.
