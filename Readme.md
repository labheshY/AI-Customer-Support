# AI Customer Support Copilot 🤖

A modern, responsive AI-powered customer support application built with **Next.js**, **FastAPI**, and **LangChain**. It features a RAG (Retrieval-Augmented Generation) system for smart document retrieval and a multi-tool agent for order tracking and ticket management.

## 🚀 Features

- **Smart AI Chat**: Powered by Google Gemini via LangChain.
- **RAG System**: Context-aware answers using a FAISS vector database.
- **Tool Integration**: AI can track orders, check user details, and create support tickets automatically.
- **Admin Dashboard**: Specialized interface for support agents to manage tickets.
- **Responsive Design**: Prioritizes chat visibility with sleek glassmorphism aesthetics.
- **Database Persistence**: Full conversation history and ticket management via PostgreSQL/SQLAlchemy.

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, Lucide Icons.
- **Backend**: FastAPI (Python), Uvicorn.
- **AI/ML**: LangChain, Google Generative AI (Gemini), Sentence-Transformers.
- **Database**: PostgreSQL with SQLAlchemy ORM.

## 📦 Setup & Installation

### Prerequisites
- Python 3.9+
- Node.js 18+
- PostgreSQL database

### Backend Setup
1. Clone the repository.
2. Create a virtual environment:
   ```bash
   python -m venv .venv
   source .venv/bin/activate  # On Windows: .venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
   ADMIN_PASSWORD=your_secure_password
   GOOGLE_API_KEY=your_gemini_api_key
   ```
5. Initialize the database:
   ```bash
   python -m app.db.create
   python -m app.db.migrate_data
   ```
6. Start the server:
   ```bash
   uvicorn app.main:app --reload
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## 📄 License
MIT License
