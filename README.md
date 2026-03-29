# Odoo x VIT Check — Reimbursement Management System

A multi-tiered, enterprise-grade reimbursement management platform designed for the Odoo x VIT Hackathon 2026. This system automates the lifecycle of expense reports from scanning to final approval using modern AI and state-of-the-art web technologies.

## 🚀 Key Features

- **Dynamic Approval Engine**: Logic-based routing that directs expenses through multi-step approval chains based on amount, category, and company hierarchy.
- **AI-Powered OCR**: Automatic receipt data extraction using Google Cloud Vision to minimize manual entry and prevent fraud.
- **Smart Currency Management**: Real-time conversion with cached exchange rates, allowing employees to spend globally while keeping company reporting consistent.
- **Company Multi-Tenancy**: Auto-provisions company profiles with localized default currencies on first administrative signup.
- **Granular Role-Based Access (RBAC)**: Distinct permissions for Employees, Managers, and Admins.
- **Modern Security**: HttpOnly cookie-based JWT authentication with secure token refresh rotation.

## 🛠 Technology Stack

- **Frontend**: Next.js 14, React 19, Tailwind CSS, Shadcn UI, TanStack Query, Zustand.
- **Backend**: NestJS, Prisma ORM, BullMQ (Queueing), Redis (Caching), Passport.js.
- **Database**: PostgreSQL.
- **Infrastructure**: Docker & Docker Compose.

## 📦 Project Structure

```text
├── backend/            # NestJS API (Port 3001)
├── frontend/           # Next.js Application (Port 3000)
├── docker-compose.yml  # PostgreSQL & Redis infrastructure
└── README.md           # Documentation
```

## 🚥 Getting Started

### Prerequisites

- Node.js (v20+)
- Docker Desktop
- npm

### 1. Start Infrastructure
Launch the database and cache using Docker:
```bash
docker-compose up -d
```

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev --name init
npm run start:dev
```

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env.local
npm install
npm run dev
```

### 4. Demo Data (Optional)
Populate the system with a sample company, users, and expenses:
```bash
cd backend
npx prisma db seed
```

**Test Credentials:**
- **Admin**: `admin@acme.com` / `password123`
- **Manager**: `manager@acme.com` / `password123`
- **Employee**: `johnny@acme.com` / `password123`

## 🏆 Hackathon Focus Points
- **Logic**: Intelligent routing state machine for approvals.
- **Modularity**: Decoupled NestJS modules for scalability.
- **Performance**: Redis caching and BullMQ background processing.
- **Security**: Password hashing, JWT rotation, and role-gated middleware.
- **Usability**: Responsive, premium Shadcn UI with skeleton loading states.

---
*Developed for Odoo Hackathon 2026.*