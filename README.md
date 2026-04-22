# 🚀 DocuMind AI — AI-Powered Document Intelligence SaaS

DocuMind AI is a **full-stack AI SaaS platform** that allows users to upload documents (PDFs) and ask questions based on their content using a **Retrieval-Augmented Generation (RAG)** pipeline.

It transforms static documents into an **interactive, queryable knowledge system** — similar to how companies build internal AI assistants.

---

## 🔥 Live Demo

* 🌐 Frontend: https://documind-ai-lime.vercel.app/dashboard
* ⚙️ Backend API: https://documind-ai-klfw.onrender.com

---

## 🧠 Key Features

### 📄 Document Upload & Processing

* Upload PDF documents
* Extracts and cleans text
* Smart chunking (overlap-based)
* Stores embeddings for semantic search

### 🤖 AI-Powered Q&A (RAG)

* Ask natural language questions
* Retrieves relevant chunks using cosine similarity
* Generates accurate answers using LLM (Groq)

### ⚡ Performance Optimization

* Redis caching for repeated queries
* Faster response on second request
* Efficient retrieval pipeline

### 🔐 Authentication System

* JWT-based login/signup
* User-specific document isolation (multi-tenant)

### 📊 Smart Retrieval System

* Semantic search using embeddings
* Context merging from multiple chunks
* Confidence scoring for answers

---

## 🏗️ Tech Stack

### Frontend

* Next.js (App Router)
* Tailwind CSS
* React Hooks

### Backend

* Node.js
* Express.js
* MongoDB (Mongoose)

### AI / ML

* Embeddings API
* LLM (Groq API)
* RAG Architecture

### Optimization

* Redis (caching)
* Rate Limiting (API protection)

---

## ⚙️ System Architecture

```
User Query
   ↓
Embedding Generation
   ↓
Vector Similarity Search (MongoDB)
   ↓
Top Relevant Chunks
   ↓
LLM (Groq API)
   ↓
Final Answer
```

---

## 🚀 How It Works

1. User uploads a PDF
2. Text is extracted and split into chunks
3. Each chunk is converted into embeddings
4. Stored in MongoDB
5. User asks a question
6. System finds relevant chunks using cosine similarity
7. LLM generates answer based on context
8. Result is cached using Redis

---

## 🧪 Example Queries

* What is the leave policy?
* Explain API rate limits
* Summarize the document
* What are the key features mentioned?

---

## 📈 Key Highlights

* Built a **production-level RAG pipeline**
* Implemented **semantic search + embeddings**
* Improved answer accuracy with **better chunking & prompt design**
* Added **Redis caching** to reduce repeated query latency
* Designed **multi-user system with isolated data**

---

## 🛠️ Installation (Local Setup)

```bash
# Clone repo
git clone https://github.com/your-username/documind-ai.git

# Backend setup
cd backend
npm install
npm run dev

# Frontend setup
cd frontend
npm install
npm run dev
```

---

## 🔐 Environment Variables

Create `.env` file in backend:

```
MONGO_URI=your_mongodb_url
JWT_SECRET=your_secret
GROQ_API_KEY=your_api_key
```

---

## 🎯 Future Improvements

* Drag & drop UI
* Chat streaming (real-time typing effect)
* Support for DOCX / TXT files
* Role-based access (teams/companies)
* Vector DB (Pinecone / Qdrant)

---

## 👨‍💻 Author

**Vikash Mishra**

* Portfolio: https://vikash-mishra.vercel.app
* GitHub: https://github.com/Vikash-Mishra06

---

## ⭐ Final Note

This project demonstrates:

* Full-stack development
* AI system design (RAG)
* Backend optimization
* Real-world problem solving

👉 Built with focus on **real production use-cases, not just demo apps**.
