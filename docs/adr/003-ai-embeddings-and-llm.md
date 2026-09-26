# ADR-003: Local Embeddings (Ollama) + Groq for LLM

## Status
Accepted

## Context
The AI Service needs (a) an embedding model to vectorize product descriptions,
and (b) an LLM to generate RAG answers. Options considered:
1. OpenAI for both (original plan)
2. Groq for both
3. Ollama for embeddings, Groq for chat
4. Ollama for both

## Decision
Option 3.

- **Embeddings:** Ollama `nomic-embed-text` (768 dims) running in Docker.
- **Chat:** Groq `openai/gpt-oss-120b` via OpenAI-compatible REST.
- **Vector store:** pgvector, same Postgres instance, HNSW index.

## Consequences
+ Zero paid API cost — both providers have generous free tiers / local
+ No external dependency for embeddings — works offline
+ Groq inference is extremely fast (sub-second for short answers)
+ Product data never leaves the local network for embedding generation
- Requires Ollama container running alongside the app (extra 500MB RAM)
- 768-dim vectors mean slightly lower recall than 1536-dim OpenAI embeddings
- Groq model names change frequently — `llama-3.3-70b-versatile` was
  deprecated on 2026-08-16, replaced with `openai/gpt-oss-120b`

## Alternatives Rejected
- OpenAI for both: requires paid account; the free tier has no API credits
- Groq for embeddings: Groq does not expose an embeddings endpoint
- Ollama for both: chat quality on 8B local models is noticeably weaker
  for grounded RAG answers; Groq delivers better generation for free
