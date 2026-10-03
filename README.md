# LabFlow — Laboratory Operations Intelligence Platform

LabFlow is a full-stack Laboratory Operations Control Center designed for diagnostic laboratory teams to track sample workflows in real time, monitor SLA turnaround times, manage operational exceptions, and maintain complete audit timelines.

---

## Problem Statement

Diagnostic laboratories struggle to track specimens across multi-stage processing pipelines, detect SLA breaches early, resolve operational disruptions (instrument failures, quality issues, missing requisitions), and analyze historical workflow events. 

LabFlow centralizes sample management, SLA risk monitoring, exception resolution, and audit logging into a dark, high-contrast control center interface.

---

## Key Features

- **Dashboard Control Center**: Real-time SLA health progress ring (calculating exact percentage of on-time samples), operational metrics, live alerts for breaches and critical issues, and a sample pipeline organized by stage.
- **Specimen Management**: Searchable and filterable table of lab samples (filter by All, In Progress, At Risk, Breached) with priority badges (STAT, URGENT, ROUTINE) and SLA indicators.
- **Global Exceptions Management**: Operational issues tracking with severity levels (LOW, MEDIUM, HIGH, CRITICAL) and lifecycle statuses (OPEN, ACKNOWLEDGED, RESOLVED).
- **Sample Details View**:
  - **Overview**: Sample metadata, target due time, SLA status, and operational notes.
  - **Tests**: Assigned test definitions with live progress line indicators and status transition dropdowns.
  - **Exceptions**: Exception management stack for raising, acknowledging, and resolving issues.
  - **Timeline**: Vertical glowing dark audit trail of historical events (`CREATED`, `STATUS_CHANGED`, `EXCEPTION_RAISED`, `EXCEPTION_RESOLVED`).
- **Global Search & Shortcuts**: Keyboard shortcut (`Ctrl+K` / `Cmd+K`) to focus global accession and specimen search.

---

## Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM v7
- **Icons**: Lucide React
- **Styling**: Vanilla CSS (Custom dark theme token system matching visual design spec)

### Backend
- **Runtime**: Node.js + TypeScript (`tsx` / `tsc`)
- **Framework**: Express.js
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Validation**: Zod

---

## Backend Architecture

Strict layered architecture preserved:
```text
Route (HTTP Endpoints)
  ↓
Controller (Request/Response handling)
  ↓
Service (Business Logic, SLA Calculations & Event Logging)
  ↓
Repository (Prisma Database Queries)
  ↓
PostgreSQL Database
```

---

## API Overview

### Samples API
- `GET /api/samples` - Fetch all samples with calculated test SLA and overall SLA status
- `GET /api/samples/:id` - Fetch single sample details with tests, exceptions, and overall SLA
- `POST /api/samples` - Register a new sample specimen
- `PATCH /api/samples/:id/status` - Transition sample lifecycle status (`RECEIVED` → `IN_PROGRESS` → `COMPLETED` / `REJECTED`)
- `GET /api/samples/:id/events` (or `/timeline`) - Fetch historical audit timeline events for sample

### Test Definitions & Sample Tests API
- `GET /api/samples/test-definitions` - Fetch available laboratory test definitions
- `POST /api/samples/:id/tests` - Assign a test definition to a sample (prevents duplicate test assignment)
- `PATCH /api/samples/:id/tests/:sampleTestId/status` - Transition sample test status (`PENDING` → `IN_PROGRESS` → `COMPLETED` / `FAILED` / `CANCELLED`)

### Exceptions API
- `GET /api/exceptions` - List operational exceptions globally (supports filtering by `status`, `severity`, `type`)
- `POST /api/samples/:id/exceptions` - Raise an operational exception for a sample
- `PATCH /api/samples/:id/exceptions/:exceptionId/status` - Update exception status (`OPEN` → `ACKNOWLEDGED` → `RESOLVED`)

### Dashboard API
- `GET /api/dashboard/summary` - Fetch laboratory operational counts and metrics

---

## Project Structure

```text
labflow-project/
├── client/                     # Vite React Frontend
│   ├── src/
│   │   ├── api/ & services/    # Typed API HTTP Client
│   │   ├── components/         # Modals & Layout Components
│   │   │   ├── layout/         # AppLayout Top Nav
│   │   │   └── ...             # Modals (NewSample, RaiseException, AssignTest, UpdateStatus)
│   │   ├── pages/              # Page Views (Dashboard, Samples, Exceptions, SampleDetails)
│   │   ├── utils/              # SLA Calculations & Date/Time Formatters
│   │   ├── types.ts            # TypeScript Interfaces & Enums
│   │   ├── App.css             # Dark Design Tokens & Component Styles
│   │   ├── index.css           # Global Dark Theme Base Styles
│   │   └── App.tsx             # React Router Setup
├── server/                     # Express TypeScript Backend
│   ├── src/
│   │   ├── modules/
│   │   │   ├── samples/        # Sample Routes, Controller, Service, Repository, SLA Utils
│   │   │   ├── exceptions/     # Global Exceptions Routes, Controller, Service, Repository
│   │   │   └── dashboard/      # Dashboard Routes & Controller
│   │   ├── db.ts               # Shared Prisma Client
│   │   └── server.ts           # Application Bootstrap
│   └── prisma/
│       ├── schema.prisma       # Database Schema & Enums
│       └── seed.ts             # Demo Data Seed Script
├── package.json                # Root Build & Dev Scripts
└── README.md
```

---

## Local Setup & Development Instructions

### Prerequisites
- Node.js (v18+ recommended)
- PostgreSQL running locally or remotely

### 1. Database Configuration
Create a `.env` file inside the `server/` directory:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/labflow?schema=public"
PORT=5000
```

### 2. Install Dependencies
In the root directory, run:
```bash
npm install
npm --prefix client install
npm --prefix server install
```

### 3. Run Prisma Migrations & Seed Demo Data
```bash
cd server
npx prisma migrate dev --name init
npx prisma db seed
cd ..
```

### 4. Run Server and Client
You can start both backend and frontend concurrently:
```bash
npm run dev:server    # Starts Express API at http://localhost:5000
npm run dev:client    # Starts Vite React App at http://localhost:5173
```

---

## Build Verification

To verify full TypeScript compilation and production builds for both client and server:
```bash
npm run build
```
This runs `npm run build:client` (Vite) and `npm run build:server` (`tsc`) sequentially.