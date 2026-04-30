# 🚀 AI Customer Support Copilot (Enterprise Edition)

A production-ready, AI-driven customer support ecosystem. This application leverages **LangGraph**, **Gemini 2.5 Flash Lite**, and **FastAPI** to provide a secure, scalable, and polished support experience.

![UI-UX-Modern](https://img.shields.io/badge/UI--UX-Modern-blueviolet)
![Security-JWT](https://img.shields.io/badge/Security-JWT_Auth-blue)
![Database-Alembic](https://img.shields.io/badge/Database-Alembic_Migrations-emerald)

## 🌟 Key Features

### 🧠 Intelligent Agentic AI
- **LangGraph Orchestration**: Uses a state-machine approach for complex multi-turn support reasoning.
- **Tool-Calling Architecture**: The AI can autonomously check order status, retrieve user details, and create support tickets.
- **Real-time Thought Streaming**: Users see the AI's "thought process" as it works, building trust and transparency.

### 🛡️ Enterprise-Grade Security
- **JWT Authentication**: Secure, stateless session management with signed tokens.
- **Bcrypt Hashing**: Industry-standard password protection (no plain-text storage).
- **Resource Ownership Verification**: Strict backend checks ensure users can only access their *own* orders and tickets.
- **CORS Hardening**: API access restricted to trusted frontend origins.

### ⚡ Performance & Reliability
- **Connection Pooling**: Optimized PostgreSQL connection management using SQLAlchemy QueuePool.
- **Alembic Migrations**: Zero-downtime database schema updates (Version-controlled DB).
- **Rate Limiting**: Protects against API abuse and controls LLM token costs.
- **Graceful Fallback**: Automated "offline mode" that guides users to a manual ticket form or FAQ if the AI service is unreachable.

### 🎨 User Experience (UX)
- **Modern UI/UX**: Built with Next.js and Vanilla CSS, featuring glassmorphism, dark mode, and smooth micro-animations.
- **Loading Skeletons**: Shimmering placeholders for a "snap-fast" perceived performance.
- **Interactive FAQ Center**: A dedicated Help Center to reduce support overhead.
- **Instant UI Sync**: Tickets update in real-time across components using custom event dispatching, eliminating manual refreshes.
- **Privacy First**: Guest sessions are handled via `sessionStorage` for automatic cleanup.

---

## 🏗️ Technical Stack

- **Backend**: Python, FastAPI, LangChain, LangGraph, SQLAlchemy, PostgreSQL.
- **Frontend**: Next.js 14, TypeScript, Vanilla CSS.
- **AI Model**: Google Gemini 2.5 Flash Lite.
- **Security**: Python-JOSE (JWT), Passlib (Bcrypt), SlowAPI (Rate Limiting).
- **Migrations**: Alembic.

---

## 🛠️ Getting Started

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL

### 1. Backend Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Setup environment
# Create a .env file with:
# DATABASE_URL=postgresql://user:pass@localhost:5432/db_name
# GOOGLE_API_KEY=your_gemini_key
# SECRET_KEY=your_jwt_secret

# Run migrations
python -m alembic upgrade head

# Seed initial data
python -m app.db.migrate_data

# Start server
uvicorn app.main:app --reload
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🗺️ Roadmap Accomplishments
- [x] Secure JWT & Password Hashing
- [x] Tool-based AI Agent (LangGraph)
- [x] Database Migration System
- [x] Cost Monitoring & Rate Limiting
- [x] Modern UI & Fallback Logic
- [x] Real-time UI Synchronization
- [x] Email Support Integrations

---

Developed with ❤️ for the future of Customer Support.
