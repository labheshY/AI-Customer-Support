# AI Customer Support Copilot 🤖

A full-stack **AI-powered customer support system** built with **Next.js**, **FastAPI**, and **LangChain**, combining RAG, agent tools, and real-time chat to simulate a production-grade support workflow.

---

## ✨ Key Highlights

* 🧠 **AI Agent with Tools**
  Automatically handles:
  * Order tracking
  * User lookup
  * Ticket creation

* 📚 **RAG (Retrieval-Augmented Generation)**
  Uses FAISS vector search to provide context-aware answers from documents.

* 💬 **Session-Based Chat System**
  Persistent conversations stored in PostgreSQL with session tracking.

* 🎟️ **Ticket Management System**
  * Create tickets via AI
  * Update status (Admin only)
  * Real-time dashboard

* 🔐 **Role-Based Access (Admin/User)**
  Admin login controls ticket updates and system actions.

* ⚡ **Modern UI/UX**
  * Glassmorphism design
  * Centered chat layout
  * Sidebar navigation + ticket panel

---

## 🧱 Architecture

```text
Frontend (Next.js)
 ├── Chat UI (session-based)
 ├── Sidebar (history + sessions)
 ├── Ticket Dashboard

Backend (FastAPI)
 ├── AI Agent (LangChain)
 ├── RAG Pipeline (FAISS)
 ├── Tool System (orders, users, tickets)
 ├── REST API

Database (PostgreSQL)
 ├── Chat messages
 ├── Sessions
 ├── Tickets
```

---

## 🛠️ Tech Stack

### Frontend
* Next.js 14
* Tailwind CSS
* TypeScript

### Backend
* FastAPI
* SQLAlchemy
* Uvicorn

### AI / ML
* LangChain
* Google Gemini
* Sentence Transformers

### Database
* PostgreSQL

---

## 📦 Setup & Installation

### 🔹 Prerequisites
* Python 3.9+
* Node.js 18+
* PostgreSQL

---

### ⚙️ Backend Setup

```bash
git clone <repo-url>
cd AI-Customer-Support-Copilot
python -m venv .venv
.venv\Scripts\activate   # Windows
pip install -r requirements.txt
```

Create `.env`:

```env
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
ADMIN_PASSWORD=your_secure_password
GOOGLE_API_KEY=your_gemini_api_key
```

Initialize DB:

```bash
python -m app.db.create
python -m app.db.migrate_data
```

Run backend:

```bash
uvicorn app.main:app --reload
```

---

### 🎨 Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

---

## 📸 Features Overview
* Chat with AI assistant
* Ask about orders (e.g. `ORD1001`)
* AI retrieves data + responds
* Raises support tickets automatically
* Admin can update ticket status

---

## 🧠 What Makes This Project Different
Unlike basic chatbots, this system combines:
* **RAG + Agent Tools**
* **Database-backed memory**
* **Role-based control**
* **End-to-end full-stack architecture**

👉 This mirrors how real-world AI support systems are built.

---

## 🔮 Future Improvements
* JWT Authentication
* Streaming responses (real-time typing)
* Multi-user support
* Analytics dashboard

---

## 📄 License
MIT License
