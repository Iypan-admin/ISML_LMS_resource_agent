# ISML AI Service (`/ai-service`)

Standalone Python AI Service for the **ISML Resource Platform**, built with **FastAPI**, **Pydantic V2**, and **PydanticAI**.

## Architecture & Principles

1. **No Direct Database Ownership**: The AI Service **never** communicates directly with Supabase or PostgreSQL. All master domain definitions and resource updates flow through the authoritative **NestJS Backend** REST APIs.
2. **SSRF & URL Security**: Full URL validation featuring scheme restriction, canonicalization, SHA-256 URL hashing, and **DNS resolution checks** (`socket.getaddrinfo`) to block private/link-local/metadata IP ranges (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`, `127.0.0.0/8`, `169.254.0.0/16`).
3. **No Automatic Publishing**: All AI analysis, discovery, and generated resources output `requires_human_review = True` and default status `PENDING_REVIEW`.
4. **Evidence-Based Scoring**: Scores use `ScoreModel` (`score`, `score_basis`, `evidence`, `confidence`). No arbitrary ungrounded LLM scores.

## Project Setup

### Authoritative Dependency Management (`pyproject.toml`)
Dependencies are defined authoritatively in `pyproject.toml` with Python locked to `requires-python = ">=3.11,<3.12"`. `requirements.txt` is exported for deployment.

```bash
# Install dependencies
pip install -r requirements.txt

# Run server
uvicorn app.main:app --reload --port 8000
```

### Running Tests

```bash
python -m unittest discover -s tests
```

## API Endpoints

- `GET /health` — Service healthcheck
- `GET /ready` — Service readiness probe
- `POST /api/v1/ai/analyze` — Resource content analysis & NestJS domain grounding
- `POST /api/v1/ai/discover` — OER discovery via Search Provider & duplicate check
- `POST /api/v1/ai/generate` — Educational content/exercise generation
- `POST /api/v1/ai/prepare-review` — Human review dossier assembly (`CreateResourceDto`)

## Deployment (Railway / Docker)

The service includes a production-ready `Dockerfile` (Python 3.11-slim) and `railway.toml` for zero-downtime deployment on Railway.
