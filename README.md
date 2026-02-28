# TownHall AI

**AI-Powered Candidate Communication Platform**

TownHall AI lets voters have AI-powered conversations with verified representations of political candidates. Candidates upload their policy positions and platform materials; the system creates an AI persona grounded in that context. Constituents can then chat with these AI personas to understand candidate positions on topics that matter to them personally.

---

## Project Structure

```
VirtualTownHall/
├── frontend/          # React (Vite) + Tailwind CSS
├── backend/           # Node.js (Express) REST API
├── docs/              # PRD and Technical Requirements
└── uploads/           # Candidate document uploads (gitignored)
```

---

## Quick Start

### Prerequisites

- Node.js 18+
- An Anthropic API key (Claude)

### Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and the backend on `http://localhost:3001`.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express |
| Database | SQLite (PostgreSQL-ready schema) |
| AI Chat | Claude API (Sonnet) |
| AI Scoring | Claude API (Opus) |
| Auth | bcrypt + JWT |
| File Processing | pdf-parse + mammoth.js |

---

## Key Features

- **Candidate Admin Panel** — Upload policy documents, configure AI persona, manage blocked topics, kill switch
- **AI Chat Interface** — Real-time conversations grounded in candidate-uploaded context
- **Alignment Score** — Automated comparison of AI persona vs. public record
- **Constituent Discovery** — ZIP code search + topic-based candidate filtering
- **Audit Trail** — Append-only, hash-chained log of all candidate context changes

---

## Documentation

- [Product Requirements Document](docs/TownHall_AI_PRD_v1.md)
- [Technical Requirements Document](docs/TownHall_AI_Technical_Requirements_v1.md)

---

## Environment Variables

See `backend/.env.example` for required configuration.

---

## Status

**MVP — Version 1.0 (Draft)**
