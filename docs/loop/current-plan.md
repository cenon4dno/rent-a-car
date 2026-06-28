# Current Plan — Iteration 14

**Goal:** AI Chatbot with RAG pipeline — booking status, car availability, rental policy Q&A
**Started:** 2026-06-29
**Milestone commit tag:** `ai-chatbot`

## Acceptance Criteria

- `POST /chat` endpoint in NestJS that accepts `{ message: string, sessionId?: string }` and returns `{ reply: string }`
- RAG pipeline: embed message → semantic search over vehicles/bookings/policies → feed context to Claude API
- Policies stored as seed data in a `KnowledgeBase` Prisma model (one-time seeded)
- Chat widget on the web frontend (floating button → expandable panel) with message history
- Authenticated users get personalized context (their active bookings, KYC status); guests get general info

## Steps

1. [x] Write plan
2. [ ] Backend: KnowledgeBase Prisma model + seed data (rental policies, FAQ, how-it-works)
3. [ ] Backend: ChatModule with POST /chat — RAG: embed → search → Claude completion
4. [ ] Frontend: ChatWidget floating button + message panel (client component)
5. [ ] Commit + push → Milestone: ai-chatbot
6. [ ] Update observations, backlog, clear plan

## Notes

- Use Claude API (`claude-haiku-4-5-20251001`) for cost efficiency on chat completions
- Use text similarity (cosine on TF-IDF or keyword search) instead of vector embeddings to avoid extra infra
- ANTHROPIC_API_KEY stored in .env (never committed)
- For simplicity: no persistent chat history in DB; session is in-memory (frontend holds history)

## Cutpoint

Write last completed step to session-state.md and schedule wakeup if rate limit hit.
